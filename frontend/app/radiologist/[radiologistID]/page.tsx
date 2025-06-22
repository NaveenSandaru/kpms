'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Eye, Image as ImageIcon, Activity } from 'lucide-react';

/* ────────────────────────────────────────
   Types
────────────────────────────────────────── */
type Case = {
  id: string;
  patient: string;
  study: string;
  referring: string;
  status: 'URGENT' | 'REVISION' | 'PENDING';
};

type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  color: 'red' | 'amber' | 'blue' | 'gray';
};

type Scan = {
  id: string;
  patientName: string;
  type: string;
  date: string;
  url: string;
};

/* ────────────────────────────────────────
   Component
────────────────────────────────────────── */
export default function RadiologistDashboard() {
  // Next.js 15: useParams() instead of props
  const { radiologistID } = useParams() as { radiologistID: string };

  /* state */
  const [stats, setStats] = useState({ assignedToday: 0, pendingReview: 0, reportedToday: 0 });
  const [cases, setCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [todayScans, setTodayScans] = useState<Scan[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);

  /* mock fetch */
  useEffect(() => {
    const t = setTimeout(() => {
      /* stats */
      setStats({ assignedToday: 24, pendingReview: 9, reportedToday: 15 });

      /* cases – UNIQUE ids only */
      setCases([
        { id: '1', patient: 'James Davidson', study: 'Brain CT', referring: 'Dr. Michael Chen', status: 'URGENT' },
        { id: '2', patient: 'Emma Lewis', study: 'Chest X-Ray', referring: 'Dr. Sarah Johnson', status: 'REVISION' },
        { id: '3', patient: 'Robert Martinez', study: 'Abdominal MRI', referring: 'Dr. Jessica Lee', status: 'PENDING' },
        { id: '4', patient: 'Alice Peterson', study: 'Knee MRI', referring: 'Dr. Robert Wilson', status: 'PENDING' },
        { id: '5', patient: 'Thomas Nelson', study: 'Lumbar Spine CT', referring: 'Dr. Emily Parker', status: 'PENDING' },
      ]);

      /* notifications */
      setNotifications([
        { id: 'n1', title: 'Urgent study assigned', desc: 'Brain CT for James Davidson requires immediate attention', time: '6 m', color: 'red' },
        { id: 'n2', title: 'Revision requested', desc: 'Clarification requested on Emma Lewis study', time: '39 m', color: 'amber' },
        { id: 'n3', title: 'New studies assigned', desc: '3 new studies have been assigned to you', time: '1 h', color: 'blue' },
        { id: 'n4', title: 'System maintenance', desc: 'Scheduled maintenance tonight 2–4 AM', time: '2 h', color: 'gray' },
      ]);

      /* today’s scans */
      setTodayScans([
        { id: 'SCAN001', patientName: 'John Doe',  type: 'MRI',  date: new Date().toISOString().split('T')[0], url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=MRI+Scan' },
        { id: 'SCAN002', patientName: 'Jane Smith', type: 'CT',   date: new Date().toISOString().split('T')[0], url: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=CT+Scan' },
        { id: 'SCAN003', patientName: 'Mike Johnson', type: 'X-Ray', date: new Date().toISOString().split('T')[0], url: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=X-Ray' },
      ]);

      /* recent scans */
      setRecentScans([
        { id: 'SCAN004', patientName: 'Sarah Wilson', type: 'MRI', date: '2025-06-20', url: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=MRI+Scan' },
        { id: 'SCAN005', patientName: 'David Brown',  type: 'CT',  date: '2025-06-19', url: 'https://via.placeholder.com/300x200/EA580C/FFFFFF?text=CT+Scan' },
        { id: 'SCAN006', patientName: 'Lisa Davis',   type: 'X-Ray', date: '2025-06-18', url: 'https://via.placeholder.com/300x200/0891B2/FFFFFF?text=X-Ray' },
      ]);
    }, 250);

    return () => clearTimeout(t);
  }, [radiologistID]);

  /* UI */
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>

      {/* ── stats ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Assigned Today', value: stats.assignedToday, trend: '+12%', color: 'text-emerald-600' },
          { label: 'Pending Review', value: stats.pendingReview, trend: '-3%', color: 'text-orange-600' },
          { label: 'Reported Today', value: stats.reportedToday, trend: '+5%', color: 'text-emerald-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 mb-2">{s.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">{s.value}</span>
                <span className={`text-xs ${s.color}`}>{s.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── main grid ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* quick access table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Quick Access</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filters</Button>
                <Button variant="outline" size="sm">Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              <input className="w-full mb-4 px-3 py-2 border rounded text-sm" placeholder="Search by patient name, ID, or study type…" />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 uppercase border-b">
                      <th className="py-2 pr-4">Patient</th>
                      <th className="py-2 pr-4">Study</th>
                      <th className="py-2 pr-4">Referring&nbsp;MD</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{c.patient}</td>
                        <td className="py-3 pr-4">{c.study}</td>
                        <td className="py-3 pr-4">{c.referring}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'URGENT' ? 'bg-red-100 text-red-700' :
                            c.status === 'REVISION' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <a href="#" className="text-emerald-600 hover:underline">Open</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* notifications + workload */}
        <div className="space-y-4">
          {/* notifications */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <a href="#" className="text-sm text-emerald-600 hover:underline">View all</a>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded border-l-4 bg-gray-50 ${
                    n.color === 'red'   ? 'border-red-500'   :
                    n.color === 'amber' ? 'border-amber-500' :
                    n.color === 'blue'  ? 'border-blue-500'  : 'border-gray-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* workload */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Workload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'CT Studies', done: 6, total: 12, color: 'bg-indigo-500' },
                { label: 'MRI Studies', done: 5, total: 9, color: 'bg-blue-500' },
                { label: 'X-Ray',      done: 2, total: 3, color: 'bg-violet-500' },
              ].map((w) => (
                <div key={w.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{w.label}</span><span>{w.done}/{w.total}</span>
                  </div>
                  <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                    <div className={`${w.color} h-full`} style={{ width: `${(w.done / w.total) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Overall completion</span><span>15/24</span>
                </div>
                <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(15 / 24) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── today's scans ─────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Today's Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayScans.length === 0 ? (
            <p className="text-sm text-gray-500">No scans scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{scan.patientName}</p>
                    <p className="text-xs text-gray-500 truncate">{scan.type} • {scan.date}</p>
                  </div>
                  <a
                    href={scan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}