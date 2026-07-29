const RSVP_STORAGE_KEY = 'rsvps';
const ANALYTICS_OUTBOX_KEY = 'analyticsOutbox';
const MAX_ANALYTICS_EVENTS = 300;

let rsvpFlushPromise = null;
let analyticsFlushPromise = null;

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readStoredArray(key) {
  if (!canUseStorage()) return [];

  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key, value) {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If storage is full or blocked, keep the app flow moving.
  }
}

export function createQueueId(prefix) {
  const randomPart = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 11);
  return `${prefix}_${randomPart}`;
}

function getRsvpQueueKey(rsvp) {
  if (rsvp.clientSubmissionId) return rsvp.clientSubmissionId;
  return [
    rsvp.primaryGuest?.firstName || '',
    rsvp.primaryGuest?.lastName || '',
    rsvp.submittedAt || '',
    rsvp.invitationMode || '',
  ].join('|').toLowerCase();
}

function getSyncErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Server save failed';
}

export function getQueuedLocalRsvps() {
  return readStoredArray(RSVP_STORAGE_KEY).filter(rsvp => (
    rsvp?.storage === 'local' ||
    rsvp?.syncStatus === 'pending_sync' ||
    rsvp?.syncStatus === 'local_only'
  ));
}

export function hasStoredLocalRsvp(clientSubmissionId) {
  return readStoredArray(RSVP_STORAGE_KEY).some(rsvp => (
    rsvp?.clientSubmissionId === clientSubmissionId
  ));
}

export function saveLocalRsvp(payload, error) {
  const clientSubmissionId = payload.clientSubmissionId || createQueueId('rsvp');
  const localRecord = {
    ...payload,
    clientSubmissionId,
    id: payload.id || `local_${clientSubmissionId}`,
    storage: 'local',
    syncStatus: 'pending_sync',
    serverError: getSyncErrorMessage(error),
    syncAttempts: Number(payload.syncAttempts) || 0,
    lastSyncAttemptAt: payload.lastSyncAttemptAt || null,
    emailFallbackSent: Boolean(payload.emailFallbackSent),
    queuedAt: payload.queuedAt || new Date().toISOString(),
  };
  const stored = readStoredArray(RSVP_STORAGE_KEY);
  const queueKey = getRsvpQueueKey(localRecord);
  const existingIndex = stored.findIndex(rsvp => getRsvpQueueKey(rsvp) === queueKey);

  if (existingIndex >= 0 && stored[existingIndex]?.emailFallbackSent) {
    localRecord.emailFallbackSent = true;
  }

  if (existingIndex >= 0) {
    stored[existingIndex] = { ...stored[existingIndex], ...localRecord };
  } else {
    stored.push(localRecord);
  }

  writeStoredArray(RSVP_STORAGE_KEY, stored);
  return localRecord;
}

function toServerRsvpPayload(rsvp) {
  const clean = { ...rsvp };
  delete clean.id;
  delete clean.storage;
  delete clean.syncStatus;
  delete clean.serverError;
  delete clean.syncAttempts;
  delete clean.lastSyncAttemptAt;
  delete clean.emailFallbackSent;
  delete clean.queuedAt;
  delete clean.localOnly;
  return clean;
}

async function postJson(url, payload, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep the generic status message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json().catch(() => ({}));
}

export function flushLocalRsvps({ onSynced } = {}) {
  if (rsvpFlushPromise) return rsvpFlushPromise;

  rsvpFlushPromise = (async () => {
    let stored = readStoredArray(RSVP_STORAGE_KEY);
    const queued = getQueuedLocalRsvps();
    const synced = [];
    const emailBackedUp = [];

    for (const rsvp of queued) {
      try {
        const responseData = await postJson('/api/rsvp', toServerRsvpPayload(rsvp), {
          headers: rsvp.emailFallbackSent ? { 'X-RSVP-Skip-Email-Fallback': '1' } : {},
        });
        const queueKey = getRsvpQueueKey(rsvp);

        if (responseData.storage === 'email_fallback') {
          stored = stored.map(item => {
            if (getRsvpQueueKey(item) !== queueKey) return item;
            return {
              ...item,
              emailFallbackSent: true,
              syncStatus: 'pending_sync',
              syncAttempts: (Number(item.syncAttempts) || 0) + 1,
              lastSyncAttemptAt: new Date().toISOString(),
              serverError: responseData.warning || 'Database save failed after email backup',
            };
          });
          emailBackedUp.push(rsvp);
          break;
        }

        stored = stored.filter(item => getRsvpQueueKey(item) !== queueKey);
        synced.push(rsvp);
        onSynced?.(rsvp);
      } catch (error) {
        const queueKey = getRsvpQueueKey(rsvp);
        stored = stored.map(item => {
          if (getRsvpQueueKey(item) !== queueKey) return item;
          return {
            ...item,
            syncStatus: error.status >= 400 && error.status < 500 ? 'sync_failed' : 'pending_sync',
            syncAttempts: (Number(item.syncAttempts) || 0) + 1,
            lastSyncAttemptAt: new Date().toISOString(),
            serverError: error.message,
          };
        });

        if (!error.status || error.status >= 500) break;
      }
    }

    writeStoredArray(RSVP_STORAGE_KEY, stored);
    return {
      synced,
      emailBackedUp,
      syncedCount: synced.length,
      pendingCount: getQueuedLocalRsvps().length,
    };
  })().finally(() => {
    rsvpFlushPromise = null;
  });

  return rsvpFlushPromise;
}

export function enqueueAnalyticsEvent(payload) {
  if (!payload?.eventType || !payload?.sessionId) return;

  const clientEventId = payload.clientEventId || createQueueId('analytics');
  const queuedEvent = {
    ...payload,
    clientEventId,
    queuedAt: payload.queuedAt || new Date().toISOString(),
    syncAttempts: Number(payload.syncAttempts) || 0,
  };
  const stored = readStoredArray(ANALYTICS_OUTBOX_KEY);
  const existingIndex = stored.findIndex(event => event.clientEventId === clientEventId);

  if (existingIndex >= 0) {
    stored[existingIndex] = { ...stored[existingIndex], ...queuedEvent };
  } else {
    stored.push(queuedEvent);
  }

  writeStoredArray(ANALYTICS_OUTBOX_KEY, stored.slice(-MAX_ANALYTICS_EVENTS));
}

function toServerAnalyticsPayload(event) {
  const clean = { ...event };
  delete clean.queuedAt;
  delete clean.syncAttempts;
  delete clean.lastSyncAttemptAt;
  delete clean.serverError;
  return clean;
}

export function flushAnalyticsOutbox({ limit = 25 } = {}) {
  if (analyticsFlushPromise) return analyticsFlushPromise;

  analyticsFlushPromise = (async () => {
    let stored = readStoredArray(ANALYTICS_OUTBOX_KEY);
    const queued = stored.slice(0, limit);
    let syncedCount = 0;

    for (const event of queued) {
      try {
        await postJson('/api/analytics', toServerAnalyticsPayload(event));
        stored = stored.filter(item => item.clientEventId !== event.clientEventId);
        syncedCount += 1;
      } catch (error) {
        stored = stored.map(item => {
          if (item.clientEventId !== event.clientEventId) return item;
          return {
            ...item,
            syncAttempts: (Number(item.syncAttempts) || 0) + 1,
            lastSyncAttemptAt: new Date().toISOString(),
            serverError: error.message,
          };
        });
        break;
      }
    }

    writeStoredArray(ANALYTICS_OUTBOX_KEY, stored);
    return {
      syncedCount,
      pendingCount: readStoredArray(ANALYTICS_OUTBOX_KEY).length,
    };
  })().finally(() => {
    analyticsFlushPromise = null;
  });

  return analyticsFlushPromise;
}
