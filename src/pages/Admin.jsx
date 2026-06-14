import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Check, X, Search, Download, RefreshCw,
  ChevronDown, ChevronUp, Trash2, Mail, Phone, MessageSquare
} from 'lucide-react';

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

// ── Guest row (expandable) ────────────────────────────────────────────────────
function GuestRow({ rsvp, onDelete }) {
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
        <td className="py-3 px-4 font-sans text-sm text-mauve-500 hidden lg:table-cell">
          {g.meal || '—'}
        </td>
        <td className="py-3 px-4 font-sans text-xs text-mauve-400 hidden xl:table-cell">
          {new Date(rsvp.submittedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-mauve-400">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded row */}
      {open && (
        <tr className="bg-mauve-50/60">
          <td colSpan={6} className="py-4 px-6">
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

              {/* Dietary + notes */}
              <div className="space-y-1">
                <p className="font-sans text-xs tracking-widest uppercase text-mauve-400 mb-2">Notes</p>
                {g.dietary && (
                  <p className="text-mauve-600">
                    <span className="text-mauve-400">Dietary: </span>{g.dietary}
                  </p>
                )}
                {g.notes && (
                  <p className="flex items-start gap-2 text-mauve-600">
                    <MessageSquare className="w-3.5 h-3.5 text-mauve-400 flex-shrink-0 mt-0.5" />
                    {g.notes}
                  </p>
                )}
                {!g.dietary && !g.notes && (
                  <p className="text-mauve-300 italic">None</p>
                )}
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
                      {eg.meal && <span className="text-mauve-400"> · {eg.meal}</span>}
                      {eg.dietary && <span className="text-mauve-400"> · {eg.dietary}</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="mt-4 flex justify-end">
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
    ['First Name', 'Last Name', 'Attending', 'Meal', 'Dietary', 'Email', 'Phone',
     'Additional Guests', 'Notes', 'Submitted'],
  ];
  rsvps.forEach(r => {
    const g = r.primaryGuest;
    const extras = (r.additionalGuests || []).map(e => `${e.firstName} ${e.lastName}`).join('; ');
    rows.push([
      g.firstName, g.lastName, g.attending === 'yes' ? 'Yes' : 'No',
      g.meal || '', g.dietary || '', g.email || '', g.phone || '',
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
  const [rsvps,    setRsvps]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | attending | declined
  const [sortBy,   setSortBy]   = useState('date_desc');

  const fetchRsvps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/guests');
      setRsvps(res.data.rsvps || []);
    } catch {
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      setRsvps(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRsvps(); }, [fetchRsvps]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this RSVP entry?')) return;
    try {
      await axios.delete(`/api/guests/${id}`);
    } catch {
      // localStorage fallback
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      localStorage.setItem('rsvps', JSON.stringify(stored.filter(r => r.id !== id)));
    }
    setRsvps(prev => prev.filter(r => (r._id || r.id) !== id));
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPrimary    = rsvps.length;
  const attending       = rsvps.filter(r => r.primaryGuest?.attending === 'yes');
  const declined        = rsvps.filter(r => r.primaryGuest?.attending === 'no');
  const totalHeadcount  = attending.reduce((acc, r) => {
    return acc + 1 + (r.additionalGuests?.filter(g => g.firstName)?.length || 0);
  }, 0);

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

  return (
    <div className="min-h-screen bg-mauve-50/30 pt-16 md:pt-20">
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
              onClick={fetchRsvps}
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total RSVPs"  value={totalPrimary}         color="mauve" />
          <StatCard label="Attending"    value={attending.length}     color="green" sub={`${totalHeadcount} total guests`} />
          <StatCard label="Declined"     value={declined.length}      color="red"   />
          <StatCard label="Head Count"   value={totalHeadcount}       color="yellow" sub="primary + additional" />
        </div>

        {/* Meal breakdown */}
        {attending.length > 0 && (
          <div className="bg-white rounded-xl border border-mauve-100 p-5 mb-6">
            <h2 className="font-serif text-lg text-mauve-700 mb-3">Meal Preferences</h2>
            <div className="flex flex-wrap gap-3">
              {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'].map(meal => {
                const count = [
                  ...attending.map(r => r.primaryGuest),
                  ...attending.flatMap(r => r.additionalGuests || []),
                ].filter(g => g.meal === meal).length;
                if (!count) return null;
                return (
                  <div key={meal} className="bg-mauve-50 rounded-lg px-4 py-2 border border-mauve-100">
                    <span className="font-sans text-sm text-mauve-700">{meal}</span>
                    <span className="ml-2 font-serif text-xl text-mauve-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters + search */}
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
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-mauve-50 border-b border-mauve-100">
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Name</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400">Status</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400 hidden md:table-cell">+Guests</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400 hidden lg:table-cell">Meal</th>
                    <th className="py-3 px-4 text-left font-sans text-xs tracking-widest uppercase text-mauve-400 hidden xl:table-cell">Submitted</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rsvp, i) => (
                    <GuestRow key={rsvp._id || rsvp.id || i} rsvp={rsvp} onDelete={handleDelete} />
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
    </div>
  );
}
