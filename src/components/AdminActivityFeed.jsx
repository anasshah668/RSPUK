import React from 'react';
import { formatActivityTime } from '../utils/adminTabNotifications';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const TYPE_STYLES = {
  orders: 'bg-blue-50 text-blue-700 border-blue-100',
  quotes: 'bg-amber-50 text-amber-800 border-amber-100',
  designService: 'bg-violet-50 text-violet-700 border-violet-100',
};

const AdminActivityFeed = ({
  activities = [],
  onOpen,
  onDismiss,
  onDismissAll,
}) => {
  if (!activities.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5" style={font}>
        <h3 className="text-lg font-bold text-gray-900">Recent activity</h3>
        <p className="text-sm text-gray-500 mt-2">No new orders, quotes, or design requests right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" style={font}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/80">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent activity</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activities.length} new item{activities.length === 1 ? '' : 's'} — open to review, then they&apos;ll be hidden.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismissAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Dismiss all
        </button>
      </div>

      <ul className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
        {activities.map((entry) => (
          <li key={entry.id} className="group">
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => onOpen(entry)}
                className="flex-1 text-left px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${TYPE_STYLES[entry.storageType] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {entry.typeLabel}
                  </span>
                  <span className="text-xs text-gray-400">{formatActivityTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{entry.title}</p>
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{entry.subtitle}</p>
              </button>
              <button
                type="button"
                onClick={() => onDismiss(entry)}
                className="px-4 text-gray-300 hover:text-gray-600 hover:bg-gray-50 self-center"
                aria-label="Dismiss"
                title="Dismiss without opening"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminActivityFeed;
