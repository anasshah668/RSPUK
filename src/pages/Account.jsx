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
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile');
      setMessage('Profile updated');
      setProfile(data);
    } catch (err) {
      setMessage(err.message);
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

  if (loading) return <div className="text-gray-600">Loading quotes...</div>;
  if (!quotes?.length) return <div className="text-gray-600">No quotes yet.</div>;

  return (
    <div className="space-y-4">
      {quotes.map((q) => (
        <div key={q._id} className="border rounded-lg p-4 bg-white">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="font-semibold">{q.projectType || q.productType || 'Quote'}</div>
            <div className="text-sm text-gray-500">{new Date(q.createdAt).toLocaleString()}</div>
          </div>
          <div className="mt-2 text-sm text-gray-700">{q.adminResponse || 'Awaiting response'}</div>
          {q.quotedPrice !== undefined && (
            <div className="mt-1 text-sm text-blue-600 font-semibold">Quoted: £{Number(q.quotedPrice).toFixed(2)}</div>
          )}
          {q.artworkUrl && (
            <div className="mt-3">
              <a href={q.artworkUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">View uploaded artwork</a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ChangePassword = () => {
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

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
        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">New Password</label>
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
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
        <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="flex-1 border rounded-lg px-3 py-2" />
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
              <div className="font-semibold capitalize">{result.status}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(result.items || []).map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 border rounded-md p-3">
                {it.imageUrl ? <img src={it.imageUrl} alt="" className="w-12 h-12 object-cover rounded-md" /> : <div className="w-12 h-12 bg-gray-100 rounded-md" />}
                <div>
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
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
