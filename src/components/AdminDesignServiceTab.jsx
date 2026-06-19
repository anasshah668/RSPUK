import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { designService } from '../services/designService';
import { FileViewerLink } from './FileDocViewer';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const statusClass = (status) => {
  const v = String(status || '').toLowerCase();
  if (v === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (v === 'in_progress') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (v === 'paid') return 'bg-purple-50 text-purple-700 border-purple-100';
  if (v === 'cancelled') return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const AdminDesignServiceTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uploadingId, setUploadingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await designService.adminList({
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setRequests(data?.requests || []);
    } catch (err) {
      toast.error(err?.message || 'Failed to load design requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (row) => {
    setSelected(row);
    setAdminNotes(row.adminNotes || '');
  };

  const handleStatusUpdate = async (status) => {
    if (!selected?._id) return;
    try {
      const updated = await designService.adminUpdate(selected._id, {
        status,
        adminNotes,
      });
      toast.success('Design request updated');
      setSelected(updated);
      load();
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleDeliverableUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selected?._id) return;
    setUploadingId(selected._id);
    try {
      const updated = await designService.adminUploadDeliverable(selected._id, file);
      toast.success('Deliverable uploaded');
      setSelected(updated);
      load();
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingId('');
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-bold text-gray-900" style={font}>
            Paid design jobs
          </h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="in_progress">In progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {requests.length === 0 ? (
          <p className="text-gray-600 text-sm" style={font}>
            No paid design requests yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {requests.map((row) => (
                <button
                  key={row._id}
                  type="button"
                  onClick={() => openDetail(row)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selected?._id === row._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between gap-2 items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{row.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {row.customerName || row.user?.name || 'Customer'}
                        {(row.customerPhone || row.user?.phone) &&
                          ` · ${row.customerPhone || row.user?.phone}`}
                        {' · '}
                        {new Date(row.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${statusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{row.brief}</p>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 min-h-[320px]">
        {!selected ? (
          <p className="text-sm text-gray-500" style={font}>
            Select a design request to view details and upload the finished file.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900" style={font}>
                {selected.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                £{Number(selected.priceAmount || 0).toFixed(2)} ·{' '}
                <span className="text-emerald-700 font-semibold">Paid</span>
                {selected.orderReference ? ` · Ref ${selected.orderReference}` : ''}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer contact</p>
              <dl className="grid gap-1.5 text-sm text-gray-800">
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-20 shrink-0">Name</dt>
                  <dd>{selected.customerName || selected.user?.name || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-20 shrink-0">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${selected.customerEmail || selected.user?.email || ''}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selected.customerEmail || selected.user?.email || '—'}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-20 shrink-0">Phone</dt>
                  <dd>
                    {selected.customerPhone || selected.user?.phone ? (
                      <a
                        href={`tel:${selected.customerPhone || selected.user?.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selected.customerPhone || selected.user?.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                {(selected.customerAddress || selected.customerCity || selected.customerPostalCode) && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-20 shrink-0">Address</dt>
                    <dd>
                      {[selected.customerAddress, selected.customerCity, selected.customerPostalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                )}
                {selected.trackingId && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-20 shrink-0">Tracking</dt>
                    <dd>{selected.trackingId}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Brief</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.brief}</p>
            </div>

            {selected.productType && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Product type</p>
                <p className="text-sm text-gray-800">{selected.productType}</p>
              </div>
            )}

            {selected.referenceFiles?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Customer references
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.referenceFiles.map((file) => (
                    <FileViewerLink
                      key={file.url}
                      url={file.url}
                      label={file.originalName || 'Reference'}
                      className="text-xs underline"
                    />
                  ))}
                </div>
              </div>
            )}

            {selected.deliverables?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Deliverables</p>
                <ul className="space-y-1">
                  {selected.deliverables.map((d) => (
                    <li key={d.url}>
                      <FileViewerLink
                        url={d.url}
                        label={d.originalName || 'Download design'}
                        className="text-sm text-emerald-700 underline"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Admin notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleStatusUpdate('in_progress')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Mark in progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('delivered')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Mark delivered
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('cancelled')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Upload finished design (PDF / image)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={uploadingId === selected._id}
                onChange={handleDeliverableUpload}
                className="text-sm"
              />
              {uploadingId === selected._id && (
                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDesignServiceTab;
