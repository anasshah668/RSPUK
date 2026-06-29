import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { quoteService } from '../services/quoteService';
import { orderService } from '../services/orderService';
import { designService } from '../services/designService';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const NAV_ITEMS = [
  { key: 'profile', label: 'Profile', description: 'Personal details & address' },
  { key: 'quotes', label: 'Quotes', description: 'Requests & conversations' },
  { key: 'design-orders', label: 'Design Orders', description: 'Paid design projects' },
  { key: 'track-order', label: 'Track Order', description: 'Order status lookup' },
  { key: 'change-password', label: 'Security', description: 'Update your password' },
];

const IconUser = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconDocument = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconPalette = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const IconPackage = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconLock = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const NAV_ICONS = {
  profile: IconUser,
  quotes: IconDocument,
  'design-orders': IconPalette,
  'track-order': IconPackage,
  'change-password': IconLock,
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
  </div>
);

const Alert = ({ type = 'info', children }) => {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[type] || styles.info}`} style={font}>
      {children}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900" style={font}>{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-gray-500" style={font}>{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

const StatusBadge = ({ status, className = '' }) => {
  const value = String(status || 'new').toLowerCase();
  const map = {
    quoted: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    converted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    closed: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    paid: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    inprocess: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    shipped: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    waiting: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  const tone = map[value] || 'bg-violet-50 text-violet-700 ring-violet-600/20';
  const label = value.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${tone} ${className}`}>
      {label}
    </span>
  );
};

const ContentPanel = ({ title, subtitle, children }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50">
    <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-5 sm:px-8">
      <h2 className="text-xl font-bold text-gray-900" style={font}>{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-gray-500" style={font}>{subtitle}</p> : null}
    </div>
    <div className="p-6 sm:p-8">{children}</div>
  </div>
);

const PasswordToggle = ({ show, onToggle, label }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-600"
    title={show ? 'Hide password' : 'Show password'}
    aria-label={show ? `Hide ${label}` : `Show ${label}`}
  >
    {show ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

const ViewProfile = () => {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('info');

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
      setMessage('Your profile has been updated successfully.');
      setMessageType('success');
      setProfile(data);
    } catch (err) {
      setMessage(err?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {message ? <Alert type={messageType}>{message}</Alert> : null}

      <div>
        <h3 className="mb-4 text-sm font-bold text-gray-900" style={font}>Personal information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} style={font}>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div>
            <label className={labelClass} style={font}>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} style={font}>Email</label>
            <input
              value={profile?.email || ''}
              disabled
              className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
              style={font}
            />
            <p className="mt-1.5 text-xs text-gray-400" style={font}>Email cannot be changed here.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8">
        <h3 className="mb-4 text-sm font-bold text-gray-900" style={font}>Delivery address</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} style={font}>Street</label>
            <input name="address.street" value={form.address?.street || ''} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div>
            <label className={labelClass} style={font}>City</label>
            <input name="address.city" value={form.address?.city || ''} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div>
            <label className={labelClass} style={font}>County / State</label>
            <input name="address.state" value={form.address?.state || ''} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div>
            <label className={labelClass} style={font}>Postcode</label>
            <input name="address.zipCode" value={form.address?.zipCode || ''} onChange={handleChange} className={inputClass} style={font} />
          </div>
          <div>
            <label className={labelClass} style={font}>Country</label>
            <input name="address.country" value={form.address?.country || ''} onChange={handleChange} className={inputClass} style={font} />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          style={font}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

const ViewQuotes = () => {
  const [quotes, setQuotes] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [replyDrafts, setReplyDrafts] = React.useState({});
  const [replySavingId, setReplySavingId] = React.useState('');
  const [replyMessage, setReplyMessage] = React.useState('');
  const [replyMessageType, setReplyMessageType] = React.useState('info');

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
      setReplyMessageType('success');
    } catch (err) {
      setReplyMessage(err?.message || 'Failed to send reply');
      setReplyMessageType('error');
    } finally {
      setReplySavingId('');
    }
  };

  if (loading) return <Spinner />;
  if (!quotes?.length) {
    return (
      <EmptyState
        icon={IconDocument}
        title="No quotes yet"
        description="When you request a quote from our team, it will appear here with pricing and conversation history."
        action={(
          <Link
            to="/get-free-quote"
            className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            style={font}
          >
            Request a quote
          </Link>
        )}
      />
    );
  }

  return (
    <div className="space-y-5">
      {replyMessage ? <Alert type={replyMessageType}>{replyMessage}</Alert> : null}
      {quotes.map((q) => (
        <article key={q._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-bold text-gray-900" style={font}>
                {q.projectType || q.productType || 'Quote request'}
              </h3>
              <p className="mt-1 text-xs text-gray-500" style={font}>
                Submitted {new Date(q.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={q.status || 'new'} />
              {q.quotedPrice !== undefined && q.quotedPrice !== null && (
                <span className="rounded-xl bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                  £{Number(q.quotedPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_220px]">
            <div className="space-y-5">
              <div>
                <p className={labelClass} style={font}>Conversation</p>
                <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  {getConversation(q).length ? (
                    getConversation(q).map((item, idx) => (
                      <div
                        key={`${item.sentAt || 'na'}-${idx}`}
                        className={`rounded-xl border p-3.5 ${
                          item.sender === 'admin'
                            ? 'border-blue-100 bg-white'
                            : 'ml-4 border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${
                            item.sender === 'admin' ? 'text-blue-700' : 'text-indigo-700'
                          }`}>
                            {item.sender === 'admin' ? 'RSP Team' : 'You'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {item.sentAt ? new Date(item.sentAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{item.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500" style={font}>Awaiting response from our team.</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass} style={font}>Your reply</label>
                <textarea
                  rows={3}
                  value={replyDrafts[q._id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Type your reply, requested changes, or approval…"
                  className={`${inputClass} resize-y`}
                  style={font}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(q._id)}
                    disabled={replySavingId === q._id || !String(replyDrafts[q._id] || '').trim()}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    style={font}
                  >
                    {replySavingId === q._id ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className={labelClass} style={font}>Artwork</p>
              {q.artworkUrl ? (
                <a href={q.artworkUrl} target="_blank" rel="noreferrer" className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    <img
                      src={q.artworkUrl}
                      alt="Quote artwork"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2 inline-flex text-xs font-semibold text-blue-600 group-hover:text-blue-700" style={font}>
                    View full image →
                  </span>
                </a>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400" style={font}>
                  No artwork
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

const ViewDesignOrders = () => {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await designService.listMy();
        if (mounted) setRequests(data?.requests || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const paidRequests = requests.filter((row) => row.paymentStatus === 'paid');

  if (loading) return <Spinner />;
  if (!paidRequests.length) {
    return (
      <EmptyState
        icon={IconPalette}
        title="No design orders yet"
        description="Paid design service requests will show here with your brief, uploads, and downloadable deliverables."
        action={(
          <Link
            to="/design-service"
            className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            style={font}
          >
            Request a design
          </Link>
        )}
      />
    );
  }

  return (
    <div className="space-y-5">
      {paidRequests.map((row) => (
        <article key={row._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-violet-50/60 to-white px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-bold text-gray-900" style={font}>{row.title}</h3>
              <p className="mt-1 text-xs text-gray-500" style={font}>
                Submitted {new Date(row.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={row.status || 'paid'} />
              <StatusBadge status="paid" />
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className={labelClass} style={font}>Your brief</p>
                <p className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-800">
                  {row.brief}
                </p>
              </div>
              {row.productType ? (
                <p className="text-xs text-gray-500" style={font}>
                  Format: <span className="font-medium text-gray-700">{row.productType}</span>
                </p>
              ) : null}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900" style={font}>
                  £{Number(row.priceAmount || 0).toFixed(2)}
                </span>
                {row.trackingId ? (
                  <span className="text-xs text-gray-500" style={font}>Ref: {row.trackingId}</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              {row.referenceFiles?.length > 0 && (
                <div>
                  <p className={labelClass} style={font}>Your uploads</p>
                  <ul className="space-y-2">
                    {row.referenceFiles.map((file) => (
                      <li key={file.url}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                          style={font}
                        >
                          <IconDocument className="h-4 w-4 shrink-0" />
                          {file.originalName || 'Reference file'}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {row.deliverables?.length > 0 ? (
                <div>
                  <p className={labelClass} style={font}>Finished design</p>
                  <ul className="space-y-2">
                    {row.deliverables.map((d) => (
                      <li key={d.url}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          style={font}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download {d.originalName || 'design file'}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900" style={font}>
                  Our team is working on your design. Downloads will appear here when ready.
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

const ChangePassword = () => {
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('info');
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
      setMessageType('error');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage('Password updated successfully');
      setMessageType('success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.message || 'Failed to change password');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900" style={font}>
        Use a strong password with at least 6 characters. You will stay signed in after updating.
      </div>

      {message ? <Alert type={messageType}>{message}</Alert> : null}

      <div>
        <label className={labelClass} style={font}>Current password</label>
        <div className="relative">
          <input
            type={showPassword.currentPassword ? 'text' : 'password'}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className={`${inputClass} pr-10`}
            style={font}
          />
          <PasswordToggle
            show={showPassword.currentPassword}
            onToggle={() => setShowPassword((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
            label="current password"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} style={font}>New password</label>
          <div className="relative">
            <input
              type={showPassword.newPassword ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
              style={font}
            />
            <PasswordToggle
              show={showPassword.newPassword}
              onToggle={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
              label="new password"
            />
          </div>
        </div>
        <div>
          <label className={labelClass} style={font}>Confirm password</label>
          <div className="relative">
            <input
              type={showPassword.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
              style={font}
            />
            <PasswordToggle
              show={showPassword.confirmPassword}
              onToggle={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              label="confirm password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          style={font}
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
};

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await orderService.trackByTrackingNumber(trackingNumber);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Order not found. Check your tracking ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 sm:p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <IconPackage className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900" style={font}>Track your order</h3>
          <p className="mt-2 text-sm text-gray-600" style={font}>
            Enter the tracking ID from your confirmation email (e.g. RSP-2026-AB12CD34).
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking ID"
              className={`${inputClass} sm:flex-1`}
              style={font}
            />
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              style={font}
            >
              {loading ? 'Searching…' : 'Track order'}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm font-medium text-red-600" style={font}>{error}</p> : null}
        </div>
      </div>

      {result && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/80 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={font}>Tracking ID</p>
              <p className="font-mono text-lg font-bold text-gray-900">{result.trackingNumber}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500" style={font}>Status</p>
              <StatusBadge status={result.status} />
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs text-gray-500" style={font}>Order</p>
              <p className="mt-1 font-semibold text-gray-900" style={font}>{result.orderTitle || 'Order'}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs text-gray-500" style={font}>Total</p>
              <p className="mt-1 text-xl font-bold text-gray-900" style={font}>
                {(result.currency || 'GBP') === 'GBP' ? '£' : `${result.currency || ''} `}
                {Number(result.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5">
            <p className={labelClass} style={font}>Items</p>
            {(result.items || []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500" style={font}>
                Item details are not available yet for this order.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(result.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <IconPackage className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900" style={font}>{it.productName}</p>
                      <p className="text-sm text-gray-500" style={font}>Qty {it.quantity || 1}</p>
                      {it.note ? (
                        <p className="truncate text-xs text-gray-400" title={it.note}>{it.note}</p>
                      ) : null}
                      {it.price != null ? (
                        <p className="mt-0.5 text-sm font-bold text-blue-700" style={font}>
                          {(result.currency || 'GBP') === 'GBP' ? '£' : `${result.currency || ''} `}
                          {Number(it.price || 0).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TAB_META = {
  profile: { title: 'Your profile', subtitle: 'Manage your personal details and delivery address' },
  quotes: { title: 'Your quotes', subtitle: 'View pricing, artwork, and chat with our team' },
  'design-orders': { title: 'Design orders', subtitle: 'Track paid design projects and download deliverables' },
  'change-password': { title: 'Security', subtitle: 'Keep your account safe with a strong password' },
  'track-order': { title: 'Track order', subtitle: 'Look up production and delivery status' },
};

const Account = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, getUserInitial, logout, authReady } = useAuth();
  const [tab, setTab] = React.useState('profile');

  if (!authReady) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-slate-50 to-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-blue-50/30 to-white px-4 py-16">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/60">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/30">
            <IconUser className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={font}>My Account</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500" style={font}>
            Sign in to manage your profile, track orders, view quotes, and download design files.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              style={font}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              style={font}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeMeta = TAB_META[tab] || TAB_META.profile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
      {/* Hero */}
      <div className="border-b border-gray-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-2 ring-white/20 backdrop-blur-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  getUserInitial()
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-200" style={font}>Welcome back</p>
                <h1 className="text-2xl font-bold text-white sm:text-3xl" style={font}>
                  {user?.name || 'My Account'}
                </h1>
                <p className="mt-1 text-sm text-blue-100/80" style={font}>{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { logout(); navigate('/'); }}
              className="self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:self-center"
              style={font}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm">
              {NAV_ITEMS.map((item) => {
                const Icon = NAV_ICONS[item.key];
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${active ? 'text-white' : 'text-blue-600'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold" style={font}>{item.label}</span>
                      <span className={`mt-0.5 block text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`} style={font}>
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.key];
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-700'
                  }`}
                  style={font}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <main className="min-w-0 lg:col-start-2">
            <ContentPanel title={activeMeta.title} subtitle={activeMeta.subtitle}>
              {tab === 'profile' && <ViewProfile />}
              {tab === 'quotes' && <ViewQuotes />}
              {tab === 'design-orders' && <ViewDesignOrders />}
              {tab === 'change-password' && <ChangePassword />}
              {tab === 'track-order' && <TrackOrder />}
            </ContentPanel>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
