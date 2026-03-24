import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const TopAnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    prefix: 'Top Announcement',
    message: 'Price Promise | UK wide delivery',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getTopAnnouncement();
        if (data) {
          setAnnouncement({
            enabled: data?.enabled !== false,
            prefix: data?.prefix,
            message: data?.message ,
          });
        }
      } catch (error) {
        // Silent fallback to defaults keeps UX resilient when API is unavailable.
        console.warn('Top announcement fallback:', error?.message);
      }
    };
    load();
  }, []);

  if (!announcement.enabled) {
    return null;
  }

  const [part1 = '', part2 = ''] = String(announcement.message || '').split('|').map(s => s.trim());

  return (
    <section className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/60">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="py-2.5 text-center">
          <p
            className="text-xs md:text-sm font-semibold text-white tracking-wide"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            <span className="text-yellow-400">{announcement.prefix}</span>
            {part1 ? <span className="mx-2 text-slate-300">|</span> : null}
            {part1}
            {part2 ? <span className="mx-2 text-slate-300">|</span> : null}
            {part2}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopAnnouncementBar;

