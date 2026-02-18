'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';
import { FiUsers, FiShoppingCart, FiDollarSign, FiUserCheck, FiUserX, FiCalendar } from 'react-icons/fi';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.get('/owner/dashboard').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const statCards = [
    { icon: FiUsers, label: 'Total Clients', value: stats.totalClients || 0, color: 'text-blue-600 bg-blue-50' },
    { icon: FiUserCheck, label: 'Active', value: stats.activeClients || 0, color: 'text-green-600 bg-green-50' },
    { icon: FiUserX, label: 'Inactive', value: stats.inactiveClients || 0, color: 'text-red-600 bg-red-50' },
    { icon: FiShoppingCart, label: 'Total Orders', value: stats.totalOrders || 0, color: 'text-purple-600 bg-purple-50' },
    { icon: FiCalendar, label: "Today's Orders", value: stats.todayOrders || 0, color: 'text-indigo-600 bg-indigo-50' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="stat-card">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
