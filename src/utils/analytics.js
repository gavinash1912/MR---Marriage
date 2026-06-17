import { useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function createVisitId() {
  return `visit_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function parseDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Unknown';
  let os = 'Unknown';
  let browser = 'Unknown';

  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet/i.test(ua)) device = 'Tablet';
  else device = 'Desktop';

  if (/iphone|ipad|ipod|ios/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { device, os, browser };
}

function sendAnalyticsBeacon(payload) {
  if (!navigator.sendBeacon) return false;

  const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return navigator.sendBeacon('/api/analytics', body);
}

export function trackEvent(eventType, details = {}, options = {}) {
  const sessionId = getOrCreateSessionId();
  const deviceInfo = parseDeviceInfo();
  const payload = {
    eventType,
    sessionId,
    deviceInfo: `${deviceInfo.device} - ${deviceInfo.os} - ${deviceInfo.browser}`,
    pagePath: window.location.pathname,
    ...details,
  };

  if (options.beacon && sendAnalyticsBeacon(payload)) {
    return;
  }

  axios.post('/api/analytics', payload).catch(() => {});
}

export function useVisitAnalytics({ sections = [], scrollDepths = [25, 50, 100] } = {}) {
  const visitIdRef = useRef(createVisitId());
  const visitStartedAtRef = useRef(Date.now());
  const trackedScrollDepthsRef = useRef(new Set());
  const trackedSectionsRef = useRef(new Set());
  const sectionKey = sections.join('|');
  const scrollDepthKey = scrollDepths.join('|');

  const trackAction = useCallback((actionName, actionLabel, metadata = null, options = {}) => {
    trackEvent('action', {
      visitId: visitIdRef.current,
      actionName,
      actionLabel,
      metadata,
    }, options);
  }, []);

  const handleTrackedClick = useCallback((event) => {
    const target = event.target?.closest?.('a, button, [role="button"]');
    if (!target) return;

    const label = (
      target.getAttribute('aria-label') ||
      target.innerText ||
      target.getAttribute('href') ||
      target.tagName
    ).trim().replace(/\s+/g, ' ').slice(0, 100);

    trackAction('click', label || 'Clicked element', {
      href: target.getAttribute('href'),
      path: window.location.pathname,
    }, { beacon: true });
  }, [trackAction]);

  useEffect(() => {
    const visitId = visitIdRef.current;
    const visitStartedAt = visitStartedAtRef.current;

    const sendDurationUpdate = (beacon = false) => {
      trackEvent('duration_update', {
        visitId,
        durationSeconds: Math.round((Date.now() - visitStartedAt) / 1000),
      }, { beacon });
    };

    trackEvent('page_view', { visitId });

    const durationInterval = setInterval(() => sendDurationUpdate(), 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDurationUpdate(true);
      }
    };
    const handleBeforeUnload = () => sendDurationUpdate(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(durationInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendDurationUpdate(true);
    };
  }, []);

  useEffect(() => {
    if (!scrollDepthKey) return undefined;

    const depths = scrollDepthKey
      .split('|')
      .map(Number)
      .filter(depth => Number.isFinite(depth));

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));

      depths.forEach(depth => {
        if (percent >= depth && !trackedScrollDepthsRef.current.has(depth)) {
          trackedScrollDepthsRef.current.add(depth);
          trackAction('scroll_depth', `Scrolled ${depth}%`, { depth });
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scrollDepthKey, trackAction]);

  useEffect(() => {
    if (!sectionKey || !window.IntersectionObserver) return undefined;

    const sectionLabels = sectionKey.split('|').filter(Boolean);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const label = entry.target.getAttribute('data-analytics-section');
        if (!label || trackedSectionsRef.current.has(label)) return;

        trackedSectionsRef.current.add(label);
        trackAction('section_view', `Viewed ${label}`, { section: label });
      });
    }, { threshold: 0.45 });

    sectionLabels.forEach(label => {
      const element = document.querySelector(`[data-analytics-section="${label}"]`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionKey, trackAction]);

  return {
    visitId: visitIdRef.current,
    trackAction,
    handleTrackedClick,
  };
}
