import { Fragment, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Check, X, Search, Download, RefreshCw,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2, Mail, Phone, MessageSquare,
  Pencil, Save, XCircle, Plus, Minus, MapPin, Smartphone, Eye
} from 'lucide-react';

const VISITOR_PAGE_SIZE = 50;

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'mauve' }) {
  const colors = {
    mauve:  'bg-mauve-50  border-mauve-200  text-mauve-700',
    green:  'bg-sage-50   border-sage-200   text-sage-700',
    red:    'bg-blush-50  border-blush-200  text-blush-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="font-sans text-xs tracking-widest uppercase opacity-70 mb-1">{label}</p>
      <p className="font-serif text-4xl font-light">{value}</p>
      {sub && <p className="font-sans text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  if (total < 60) return `${total}s`;

  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatActionName(action) {
  if (action.actionLabel) return action.actionLabel;
  if (action.actionName) return action.actionName.replace(/_/g, ' ');
  return (action.eventType || 'action').replace(/_/g, ' ');
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ rsvp, onSave, onClose }) {
  const g = rsvp.primaryGuest;
  const [form, setForm] = useState({
    firstName: g.firstName || '',
    lastName:  g.lastName  || '',
    attending: g.attending || 'yes',
    phone:     g.phone     || '',
    email:     g.email     || '',
    notes:     g.notes     || '',
  });
  const [additionals, setAdditionals] = useState(
    (rsvp.additionalGuests || []).map(ag => ({ ...ag }))
  );
  const [saving, setSaving] = useState(false);

  const updateAdditional = (i, field, val) =>
    setAdditionals(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));

  const addGuest    = () => setAdditionals(prev => [...prev, { firstName: '', lastName: '' }]);
  const removeGuest = (i) => setAdditionals(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    const updated = {
      primaryGuest:    { ...g, ...form },
      additionalGuests: additionals.filter(a => a.firstName.trim()),
    };
    await onSave(rsvp._id || rsvp.id, updated);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mauve-100">
          <h2 className="font-serif text-2xl text-mauve-800">Edit RSVP</h2>
          <button onClick={onClose} className="text-mauve-400 hover:text-mauve-700 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-mauve-500 mb-3">Primary Guest</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Attending */}
          <div>
            <label className="form-label mb-3">Attendance</label>
            <div className="flex gap-3">
              {['yes', 'no'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, attending: val }))}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-sans text-sm transition-all ${
                    form.attending === val
                      ? val === 'yes'
                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                        : 'border-blush-400 bg-blush-50 text-blush-700'
                      : 'border-mauve-200 text-mauve-500 hover:border-mauve-300'
                  }`}
                >
                  {val === 'yes' ? '✓ Attending' : '✗ Not Attending'}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="font-sans text-xs tracking-widest uppercase text-mauve-500">Contact</p>
            <div>
              <label className="form-label flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</label>
              <input className="form-input" type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="form-label flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="guest@email.com" />
            </div>
            <div>
              <label className="form-label flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Notes</label>
              <textarea className="form-input resize-none" rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional note…" />
            </div>
          </div>

          {/* Additional guests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-xs tracking-widest uppercase text-mauve-500">Additional Guests</p>
              <button
                type="button"
                onClick={addGuest}
                className="flex items-center gap-1 text-xs font-sans text-mauve-600 hover:text-mauve-800 border border-mauve-200 hover:border-mauve-400 rounded px-2 py-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Guest
              </button>
            </div>
            {additionals.length === 0 && (
              <p className="text-xs text-mauve-300 italic">No additional guests</p>
            )}
            {additionals.map((ag, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input className="form-input text-sm" placeholder="First name"
                  value={ag.firstName}
                  onChange={e => updateAdditional(i, 'firstName', e.target.value)} />
                <div className="flex gap-2">
                  <input className="form-input text-sm flex-1" placeholder="Last name"
                    value={ag.lastName}
                    onChange={e => updateAdditional(i, 'lastName', e.target.value)} />
                  <button type="button" onClick={() => removeGuest(i)}
                    className="text-blush-400 hover:text-blush-600 transition-colors flex-shrink-0">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-mauve-100">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
            className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 ${
              saving || !form.firstName.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Guest row (expandable) ────────────────────────────────────────────────────
function GuestRow({ rsvp, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const g = rsvp.primaryGuest;
  const extras = rsvp.additionalGuests || [];
  const attending = g.attending === 'yes';

  return (
    <>
      <tr
        className="border-b border-mauve-100 hover:bg-mauve-50/40 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <td className="py-3 px-4 font-sans text-sm text-mauve-800 font-medium whitespace-nowrap">
          {g.firstName} {g.lastName}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
            ${attending ? 'bg-sage-100 text-sage-700' : 'bg-blush-100 text-blush-700'}`}>
            {attending ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {attending ? 'Attending' : 'Not Attending'}
          </span>
        </td>
        <td className="py-3 px-4 font-sans text-sm text-mauve-500 hidden md:table-cell">
          {extras.length > 0 ? `+${extras.length} guest${extras.length > 1 ? 's' : ''}` : '—'}
        </td>
        <td className="py-3 px-4 font-sans text-xs text-mauve-400 hidden xl:table-cell">
          {new Date(rsvp.submittedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-mauve-400">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </td>
      </tr>

      {/* Expanded row */}
      {open && (
        <tr className="bg-mauve-50/60">
          <td colSpan={5} className="py-4 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {/* Contact */}
              <div className="space-y-1">
                <p className="font-sans text-xs tracking-widest uppercase text-mauve-400 mb-2">Contact</p>
                {g.email && (
                  <p className="flex items-center gap-2 text-mauve-600">
                    <Mail className="w-3.5 h-3.5 text-mauve-400" />
                    <a href={`mailto:${g.email}`} className="hover:underline">{g.email}</a>
                  </p>
                )}
                {g.phone && (
                  <p className="flex items-center gap-2 text-mauve-600">
                    <Phone className="w-3.5 h-3.5 text-mauve-400" />
                    {g.phone}
                  </p>
                )}
                {!g.email && !g.phone && (
                  <p className="text-mauve-300 italic">No contact info</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <p className="font-sans text-xs tracking-widest uppercase text-mauve-400 mb-2">Notes</p>
                {g.notes && (
                  <p className="flex items-start gap-2 text-mauve-600">
                    <MessageSquare className="w-3.5 h-3.5 text-mauve-400 flex-shrink-0 mt-0.5" />
                    {g.notes}
                  </p>
                )}
                {!g.notes && <p className="text-mauve-300 italic">None</p>}
              </div>

              {/* Additional guests */}
              {extras.length > 0 && (
                <div className="space-y-1">
                  <p className="font-sans text-xs tracking-widest uppercase text-mauve-400 mb-2">
                    Additional Guests
                  </p>
                  {extras.map((eg, i) => (
                    <p key={i} className="text-mauve-600">
                      {eg.firstName} {eg.lastName}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(rsvp); }}
                className="flex items-center gap-1.5 text-xs font-sans text-mauve-600 hover:text-mauve-800
                           border border-mauve-200 hover:border-mauve-400 rounded px-3 py-1.5 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit entry
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(rsvp._id || rsvp.id); }}
                className="flex items-center gap-1.5 text-xs font-sans text-blush-500 hover:text-blush-700
                           border border-blush-200 hover:border-blush-400 rounded px-3 py-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete entry
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(rsvps) {
  const rows = [
    ['First Name', 'Last Name', 'Attending', 'Email', 'Phone',
     'Additional Guests', 'Notes', 'Submitted'],
  ];
  rsvps.forEach(r => {
    const g = r.primaryGuest;
    const extras = (r.additionalGuests || []).map(e => `${e.firstName} ${e.lastName}`).join('; ');
    rows.push([
      g.firstName, g.lastName, g.attending === 'yes' ? 'Yes' : 'No',
      g.email || '', g.phone || '',
      extras, g.notes || '',
      new Date(r.submittedAt).toLocaleDateString(),
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aa-engagement-rsvps-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Admin page ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [rsvps,       setRsvps]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');
  const [sortBy,      setSortBy]      = useState('date_desc');
  const [editingRsvp, setEditingRsvp] = useState(null);
  const [analytics,   setAnalytics]   = useState({
    totalPageViews: 0,
    uniqueVisitors: 0,
    totalVideoPlays: 0,
    uniqueVideoViewers: 0,
  });
  const [visitors, setVisitors] = useState([]);
  const [activeTab, setActiveTab] = useState('rsvp');
  const [timeFilter, setTimeFilter] = useState('all'); // all, 15m, 30m, 1h, 6h, 1d
  const [expandedVisits, setExpandedVisits] = useState({});
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorPagination, setVisitorPagination] = useState({
    page: 1,
    pageSize: VISITOR_PAGE_SIZE,
    totalVisitors: 0,
    totalPages: 1,
  });

  const getFilteredAnalytics = () => {
    return {
      totalPageViews: analytics.totalPageViews,
      uniqueVisitors: analytics.uniqueVisitors,
      totalVideoPlays: analytics.totalVideoPlays,
      uniqueVideoViewers: analytics.uniqueVideoViewers,
    };
  };

  const fetchRsvps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/guests');
      setRsvps(res.data.rsvps || []);
    } catch {
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      setRsvps(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const query = timeFilter === 'all' ? '' : `?timeFilter=${encodeURIComponent(timeFilter)}`;
      const res = await axios.get(`/api/analytics${query}`);
      setAnalytics(res.data);
    } catch {
      console.error('Failed to fetch analytics');
    }
  }, [timeFilter]);

  const fetchVisitors = useCallback(async () => {
    try {
      const detailsTimeQuery = timeFilter === 'all'
        ? ''
        : `&timeFilter=${encodeURIComponent(timeFilter)}`;
      const detailsQuery = `?details=true&page=${visitorPage}&pageSize=${VISITOR_PAGE_SIZE}${detailsTimeQuery}`;
      const visitorRes = await axios.get(`/api/analytics${detailsQuery}`);
      setVisitors(visitorRes.data.visitors || []);
      setVisitorPagination(visitorRes.data.pagination || {
        page: 1,
        pageSize: VISITOR_PAGE_SIZE,
        totalVisitors: visitorRes.data.visitors?.length || 0,
        totalPages: 1,
      });
      if (visitorRes.data.pagination?.page && visitorRes.data.pagination.page !== visitorPage) {
        setVisitorPage(visitorRes.data.pagination.page);
      }
    } catch {
      console.error('Failed to fetch visitor logs');
    }
  }, [timeFilter, visitorPage]);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this RSVP entry?')) return;
    try {
      await axios.delete(`/api/guests?id=${id}`);
      setRsvps(prev => prev.filter(r => (r._id || r.id) !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleSave = async (id, updatedData) => {
    try {
      await axios.patch(`/api/guests?id=${id}`, updatedData);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save changes. Please try again.');
      return;
    }
    setRsvps(prev => prev.map(r =>
      (r._id || r.id) === id ? { ...r, ...updatedData } : r
    ));
    setEditingRsvp(null);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPrimary   = rsvps.length;
  const attending      = rsvps.filter(r => r.primaryGuest?.attending === 'yes');
  const declined       = rsvps.filter(r => r.primaryGuest?.attending === 'no');
  const totalHeadcount = attending.reduce((acc, r) =>
    acc + 1 + (r.additionalGuests?.filter(g => g.firstName)?.length || 0), 0);

  // ── Filtering + sorting ────────────────────────────────────────────────────
  const filtered = rsvps
    .filter(r => {
      const g = r.primaryGuest;
      if (!g) return false;
      if (filter === 'attending') return g.attending === 'yes';
      if (filter === 'declined')  return g.attending === 'no';
      return true;
    })
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      const g = r.primaryGuest;
      return (
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
        (g.email || '').toLowerCase().includes(q) ||
        (g.phone || '').includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sortBy === 'date_asc')  return new Date(a.submittedAt) - new Date(b.submittedAt);
      if (sortBy === 'name_asc')  return a.primaryGuest.lastName.localeCompare(b.primaryGuest.lastName);
      if (sortBy === 'name_desc') return b.primaryGuest.lastName.localeCompare(a.primaryGuest.lastName);
      return 0;
    });

  const filteredVisitors = visitors;
  const filteredAnalytics = getFilteredAnalytics();
  const toggleVisitExpanded = (id) => {
    setExpandedVisits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-mauve-50/30 pt-16 md:pt-20">

      {/* Edit modal */}
      {editingRsvp && (
        <EditModal
          rsvp={editingRsvp}
          onSave={handleSave}
          onClose={() => setEditingRsvp(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-mauve-800">Admin Dashboard</h1>
            <p className="font-sans text-sm text-mauve-400 mt-1">
              Avinash &amp; Ananya — Engagement · July 5, 2026
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchRsvps(); fetchAnalytics(); fetchVisitors(); }}
              className="flex items-center gap-1.5 btn-secondary text-xs px-4 py-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => exportCSV(rsvps)}
              disabled={rsvps.length === 0}
              className="flex items-center gap-1.5 btn-primary text-xs px-4 py-2 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Tab Menu */}
        <div className="flex rounded-lg border border-mauve-200 overflow-hidden mb-8 w-fit">
          <button
            onClick={() => setActiveTab('rsvp')}
            className={`px-6 py-3 font-sans text-sm font-medium transition-colors ${
              activeTab === 'rsvp'
                ? 'bg-mauve-600 text-white'
                : 'bg-white text-mauve-600 hover:bg-mauve-50'
            }`}
          >
            RSVPs ({totalPrimary})
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-6 py-3 font-sans text-sm font-medium transition-colors ${
              activeTab === 'visitors'
                ? 'bg-mauve-600 text-white'
                : 'bg-white text-mauve-600 hover:bg-mauve-50'
            }`}
          >
            Visit Logs ({visitorPagination.totalVisitors})
          </button>
        </div>

        {/* Time filter for visitors tab */}
        {activeTab === 'visitors' && (
          <div className="mb-6">
            <label className="font-sans text-xs tracking-widest uppercase text-mauve-500 mr-3">Filter by:</label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setVisitorPage(1);
                setExpandedVisits({});
              }}
              className="form-input py-2 text-sm w-auto"
            >
              <option value="15m">Past 15 minutes</option>
              <option value="30m">Past 30 minutes</option>
              <option value="1h">Past 1 hour</option>
              <option value="6h">Past 6 hours</option>
              <option value="1d">Past 1 day</option>
              <option value="all">All time</option>
            </select>
          </div>
        )}

        {/* RSVP Tab Content */}
        {activeTab === 'rsvp' && (
        <div>
          {/* RSVP Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total RSVPs"  value={totalPrimary}     color="mauve" />
            <StatCard label="Attending"    value={attending.length} color="green" sub={`${totalHeadcount} total guests`} />
            <StatCard label="Declined"     value={declined.length}  color="red"   />
            <StatCard label="Head Count"   value={totalHeadcount}   color="yellow" sub="primary + additional" />
          </div>

          {/* RSVP Table */}
          <div className="bg-white rounded-xl border border-mauve-100 overflow-hidden">
            <div className="p-4 border-b border-mauve-100 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mauve-300" />
              <input
                type="text"
                className="form-input pl-9 py-2 text-sm"
                placeholder="Search by name, email, or phone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter tabs */}
            <div className="flex rounded-lg border border-mauve-200 overflow-hidden">
              {[
                { val: 'all',       label: `All (${totalPrimary})`       },
                { val: 'attending', label: `Going (${attending.length})` },
                { val: 'declined',  label: `No (${declined.length})`     },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`px-3 py-2 font-sans text-xs transition-colors ${
                    filter === val
                      ? 'bg-mauve-600 text-white'
                      : 'text-mauve-600 hover:bg-mauve-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="form-input py-2 text-xs w-auto"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="name_asc">Name A→Z</option>
              <option value="name_desc">Name Z→A</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center">
              <svg className="animate-spin w-8 h-8 text-mauve-400 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="font-sans text-sm text-mauve-400 mt-3">Loading RSVPs…</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="font-sans text-sm text-red-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="w-10 h-10 text-mauve-200 mx-auto mb-3" />
              <p className="font-sans text-sm text-mauve-400">
                {search || filter !== 'all' ? 'No results match your filters.' : 'No RSVPs received yet.'}
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-mauve-50 border-b border-mauve-100">
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Name</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Status</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400 hidden md:table-cell">+Guests</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400 hidden xl:table-cell">Submitted</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rsvp, i) => (
                    <GuestRow
                      key={rsvp._id || rsvp.id || i}
                      rsvp={rsvp}
                      onDelete={handleDelete}
                      onEdit={setEditingRsvp}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-mauve-100 bg-mauve-50/40">
              <p className="font-sans text-xs text-mauve-400">
                Showing {filtered.length} of {totalPrimary} RSVP{totalPrimary !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          </div>
          </div>
        )}

        {/* Visitors Tab Content */}
        {activeTab === 'visitors' && (
        <div>
          {/* Visitor Analytics Stats (filtered) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Website Visits" value={filteredAnalytics.totalPageViews} color="mauve" />
            <StatCard label="Unique Visitors" value={filteredAnalytics.uniqueVisitors} color="green" />
            <StatCard label="Video Plays" value={filteredAnalytics.totalVideoPlays} color="yellow" />
            <StatCard label="Video Viewers (Unique)" value={filteredAnalytics.uniqueVideoViewers} color="red" />
          </div>

          {/* Visit Logs Table */}
          <div className="bg-white rounded-xl border border-mauve-100 overflow-hidden">
            {filteredVisitors.length === 0 ? (
              <div className="py-20 text-center">
                <Eye className="w-10 h-10 text-mauve-200 mx-auto mb-3" />
                <p className="font-sans text-sm text-mauve-400">
                  {timeFilter === 'all' ? 'No visit logs yet' : 'No visit logs in this time range'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="bg-mauve-50 border-b border-mauve-100">
                      <th className="py-3 px-4 w-12" />
                      <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Visit Time</th>
                      <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">IP Address</th>
                      <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Location</th>
                      <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Device</th>
                      <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisitors.map((visitor, i) => {
                      const rowId = visitor.id || `${visitor.sessionId}-${visitor.visitedAt}-${i}`;
                      const expanded = !!expandedVisits[rowId];

                      return (
                        <Fragment key={rowId}>
                          <tr className="border-b border-mauve-100 hover:bg-mauve-50/40 transition-colors">
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => toggleVisitExpanded(rowId)}
                                className="w-7 h-7 rounded-full border border-mauve-200 flex items-center justify-center text-mauve-500 hover:bg-mauve-50 transition-colors"
                                aria-label={expanded ? 'Hide visit actions' : 'Show visit actions'}
                              >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-sans text-sm text-mauve-700">
                              {new Date(visitor.visitedAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-sans text-sm text-mauve-600">
                              {visitor.ipAddress || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 font-sans text-sm text-mauve-600">
                              {visitor.location ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-mauve-400" />
                                  {visitor.location}
                                </span>
                              ) : (
                                <span className="text-mauve-300 italic">Unknown</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-sans text-sm text-mauve-600">
                              {visitor.deviceInfo ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Smartphone className="w-3 h-3 text-mauve-400" />
                                  {visitor.deviceInfo}
                                </span>
                              ) : (
                                <span className="text-mauve-300 italic">Unknown</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-sans text-sm text-mauve-600">
                              {formatDuration(visitor.durationSeconds)}
                            </td>
                          </tr>

                          {expanded && (
                            <tr className="border-b border-mauve-100 bg-mauve-50/35">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="font-sans text-sm text-mauve-600">
                                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3">
                                    <span className="font-medium text-mauve-800">Time spent: {formatDuration(visitor.durationSeconds)}</span>
                                    {visitor.pagePath && <span>Page: {visitor.pagePath}</span>}
                                  </div>

                                  {visitor.actions?.length ? (
                                    <ul className="space-y-2">
                                      {visitor.actions.map(action => (
                                        <li key={action.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                          <span className="font-mono text-xs text-mauve-400 sm:w-28">
                                            {new Date(action.timestamp).toLocaleTimeString()}
                                          </span>
                                          <span className="text-mauve-700">{formatActionName(action)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-mauve-400 italic">No actions logged for this visit.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredVisitors.length > 0 && (
              <div className="px-4 py-3 border-t border-mauve-100 bg-mauve-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="font-sans text-xs text-mauve-400">
                  Showing {((visitorPagination.page - 1) * visitorPagination.pageSize) + 1}–
                  {Math.min(visitorPagination.page * visitorPagination.pageSize, visitorPagination.totalVisitors)}
                  {' '}of {visitorPagination.totalVisitors} visit logs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorPage(page => Math.max(1, page - 1));
                      setExpandedVisits({});
                    }}
                    disabled={visitorPagination.page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-mauve-200 text-mauve-600 text-xs font-sans disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <span className="font-sans text-xs text-mauve-500 min-w-20 text-center">
                    Page {visitorPagination.page} of {visitorPagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorPage(page => Math.min(visitorPagination.totalPages, page + 1));
                      setExpandedVisits({});
                    }}
                    disabled={visitorPagination.page >= visitorPagination.totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-mauve-200 text-mauve-600 text-xs font-sans disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
