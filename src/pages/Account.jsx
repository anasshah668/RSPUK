import React from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { quoteService } from '../services/quoteService';
import { orderService } from '../services/orderService';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{title}</h2>
    {children}
  </div>
);

const ViewProfile = () => {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await authService.getProfile();
        if (!mounted) return;
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = await authService.updateProfile(form);
      setMessage('Profile updated');
      setProfile(data);
    } catch (err) {
      setMessage(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading profile...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {message && <div className="text-sm text-blue-600">{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Street</label>
          <input name="address.street" value={form.address?.street || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">City</label>
          <input name="address.city" value={form.address?.city || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">State</label>
          <input name="address.state" value={form.address?.state || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Zip Code</label>
          <input name="address.zipCode" value={form.address?.zipCode || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Country</label>
          <input name="address.country" value={form.address?.country || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

const ViewQuotes = () => {
  const [quotes, setQuotes] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [replyDrafts, setReplyDrafts] = React.useState({});
  const [replySavingId, setReplySavingId] = React.useState('');
  const [replyMessage, setReplyMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await quoteService.listMy();
        if (mounted) setQuotes(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getStatusClass = (status) => {
    const value = String(status || 'new').toLowerCase();
    if (value === 'quoted') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (value === 'converted') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (value === 'closed') return 'bg-gray-100 text-gray-700 border-gray-200';
    if (value === 'contacted') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-purple-50 text-purple-700 border-purple-100';
  };

  const getConversation = (quote) => {
    const thread = Array.isArray(quote?.conversation)
      ? quote.conversation
          .filter((entry) => String(entry?.message || '').trim())
          .map((entry) => ({
            sender: entry.sender === 'admin' ? 'admin' : 'customer',
            message: String(entry.message || '').trim(),
            sentAt: entry.sentAt || quote?.updatedAt || quote?.createdAt,
          }))
      : [];

    if (thread.length > 0) {
      return [...thread].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    }

    // Backward compatibility for older quotes created before conversation support
    const fallback = [];
    if (quote?.message) {
      fallback.push({ sender: 'customer', message: quote.message, sentAt: quote.createdAt });
    }
    if (quote?.adminResponse) {
      fallback.push({
        sender: 'admin',
        message: quote.adminResponse,
        sentAt: quote.respondedAt || quote.updatedAt || quote.createdAt,
      });
    }
    if (quote?.customerReply) {
      fallback.push({
        sender: 'customer',
        message: quote.customerReply,
        sentAt: quote.customerRepliedAt || quote.updatedAt || quote.createdAt,
      });
    }
    return fallback;
  };

  const handleReplySubmit = async (quoteId) => {
    const message = String(replyDrafts[quoteId] || '').trim();
    if (!message) return;

    setReplyMessage('');
    setReplySavingId(quoteId);
    try {
      const updated = await quoteService.reply(quoteId, { customerReply: message });
      setQuotes((prev) => prev.map((q) => (q._id === quoteId ? updated : q)));
      setReplyDrafts((prev) => ({ ...prev, [quoteId]: '' }));
      setReplyMessage('Reply sent successfully.');
    } catch (err) {
      setReplyMessage(err?.message || 'Failed to send reply');
    } finally {
      setReplySavingId('');
    }
  };

  if (loading) return <div className="text-gray-600">Loading quotes...</div>;
  if (!quotes?.length) return <div className="text-gray-600">No quotes yet.</div>;

  return (
    <div className="space-y-4">
      {replyMessage && <div className="text-sm text-blue-600">{replyMessage}</div>}
      {quotes.map((q) => (
        <div key={q._id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">{q.projectType || q.productType || 'Quote'}</div>
                <div className="text-xs text-gray-500 mt-1">Created: {new Date(q.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wide ${getStatusClass(q.status)}`}>
                  {q.status || 'new'}
                </span>
                {q.quotedPrice !== undefined && q.quotedPrice !== null && (
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                    £{Number(q.quotedPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Conversation Thread</div>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2 max-h-72 overflow-y-auto">
                  {getConversation(q).length ? (
                    getConversation(q).map((item, idx) => (
                      <div
                        key={`${item.sentAt || 'na'}-${idx}`}
                        className={`rounded-lg border p-3 ${
                          item.sender === 'admin'
                            ? 'bg-white border-blue-100'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                            item.sender === 'admin' ? 'text-blue-700' : 'text-indigo-700'
                          }`}>
                            {item.sender === 'admin' ? 'Team' : 'You'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {item.sentAt ? new Date(item.sentAt).toLocaleString() : '—'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                          {item.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600">
                      Awaiting response from our team.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Reply to this quote</label>
                <textarea
                  rows={3}
                  value={replyDrafts[q._id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Type your reply, requested changes, or approval..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleReplySubmit(q._id)}
                    disabled={replySavingId === q._id || !String(replyDrafts[q._id] || '').trim()}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replySavingId === q._id ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Artwork</div>
              {q.artworkUrl ? (
                <a href={q.artworkUrl} target="_blank" rel="noreferrer" className="block group">
                  <div className="w-full h-44 rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <img src={q.artworkUrl} alt="Artwork" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                  </div>
                  <div className="mt-2 text-xs text-blue-600 font-medium">Open full image</div>
                </a>
              ) : (
                <div className="w-full h-44 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm flex items-center justify-center">
                  No artwork attached
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChangePassword = () => {
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.newPassword || form.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <div className="text-sm text-blue-600">{message}</div>}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Current Password</label>
        <div className="relative">
          <input
            type={showPassword.currentPassword ? 'text' : 'password'}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            title={showPassword.currentPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword.currentPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPassword.newPassword ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title={showPassword.newPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword.newPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPassword.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title={showPassword.confirmPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword.confirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg">
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const prettyStatus = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'inprocess') return 'In Process';
    if (v === 'completed') return 'Completed';
    if (v === 'waiting') return 'Waiting';
    return v ? `${v.charAt(0).toUpperCase()}${v.slice(1)}` : '—';
  };
  const statusBadgeClass = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'completed' || v === 'delivered') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (v === 'inprocess' || v === 'processing' || v === 'shipped') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (v === 'waiting' || v === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (v === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await orderService.trackByTrackingNumber(trackingNumber);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking ID (e.g. RSP-2026-AB12CD34)" className="flex-1 border rounded-lg px-3 py-2" />
        <button type="submit" disabled={loading || !trackingNumber} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg">
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Tracking</div>
              <div className="font-semibold">{result.trackingNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(result.status)}`}>
                {prettyStatus(result.status)}
              </div>
            </div>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-gray-200 p-3 bg-gray-50">
              <div className="text-gray-500">Order title</div>
              <div className="font-semibold text-gray-900">{result.orderTitle || 'Order'}</div>
            </div>
            <div className="rounded-md border border-gray-200 p-3 bg-gray-50">
              <div className="text-gray-500">Total bill</div>
              <div className="font-semibold text-gray-900">
                {(result.currency || 'GBP') === 'GBP' ? '£' : `${result.currency || ''} `}
                {Number(result.total || 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(result.items || []).length === 0 ? (
              <div className="md:col-span-2 text-sm text-gray-500 border rounded-md p-3 bg-gray-50">
                Item details are not available yet for this order.
              </div>
            ) : (result.items || []).map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 border rounded-md p-3 bg-white">
                {it.imageUrl ? <img src={it.imageUrl} alt="" className="w-12 h-12 object-cover rounded-md" /> : <div className="w-12 h-12 bg-gray-100 rounded-md" />}
                <div className="min-w-0">
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-sm text-gray-600">Qty: {it.quantity || 1}</div>
                  {it.note ? <div className="text-xs text-gray-500 truncate" title={it.note}>{it.note}</div> : null}
                  {it.price != null ? (
                    <div className="text-xs font-semibold text-gray-800 mt-0.5">
                      {(result.currency || 'GBP') === 'GBP' ? '£' : `${result.currency || ''} `}
                      {Number(it.price || 0).toFixed(2)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Account = () => {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = React.useState('profile');

  if (!isAuthenticated()) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-gray-700">Please log in to access your account.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-6 overflow-x-auto">
        <div className="flex gap-2 md:gap-3">
          {['profile','quotes','change-password','track-order'].map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {key === 'profile' && 'View Profile'}
              {key === 'quotes' && 'View Quotes'}
              {key === 'change-password' && 'Change Password'}
              {key === 'track-order' && 'Track Order'}
            </button>
          ))}
        </div>
      </div>

      <Section title={tab === 'profile' ? 'Your Profile' : tab === 'quotes' ? 'Your Quotes' : tab === 'change-password' ? 'Change Password' : 'Track Order'}>
        {tab === 'profile' && <ViewProfile />}
        {tab === 'quotes' && <ViewQuotes />}
        {tab === 'change-password' && <ChangePassword />}
        {tab === 'track-order' && <TrackOrder />}
      </Section>
    </div>
  );
};

export default Account;
