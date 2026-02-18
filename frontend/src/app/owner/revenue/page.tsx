'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OwnerRevenuePage() {
  const [data, setData] = useState<any>({ totalRevenue: 0, monthly: [], perClient: [] });

  useEffect(() => {
    api.get('/owner/revenue').then(res => setData(res.data.data)).catch(() => {});
  }, []);

  const maxMonthly = Math.max(...(data.monthly?.map((m: any) => m.revenue) || [1]));

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Revenue</h1>

        <div className="stat-card mb-8 text-center">
          <p className="text-4xl font-bold text-green-600">₹{data.totalRevenue}</p>
          <p className="text-sm text-gray-500">Total Platform Revenue</p>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="card mb-8">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-48">
            {data.monthly?.map((m: any) => (
              <div key={m._id} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-primary-500 rounded-t-lg transition-all" style={{ height: `${(m.revenue / maxMonthly) * 100}%`, minHeight: '4px' }} />
                <p className="text-xs text-gray-500 mt-2">{monthNames[m._id - 1]}</p>
                <p className="text-xs font-medium">₹{m.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Per Client Revenue */}
        <div className="card">
          <h2 className="font-semibold mb-4">Revenue by Client</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Store</th>
              <th className="text-left py-3 text-gray-500 font-medium">Orders</th>
              <th className="text-left py-3 text-gray-500 font-medium">Revenue</th>
            </tr></thead>
            <tbody>
              {data.perClient?.map((c: any) => (
                <tr key={c.clientId} className="border-b border-gray-50">
                  <td className="py-3 font-medium">{c.storeName}</td>
                  <td className="py-3">{c.orders}</td>
                  <td className="py-3 font-medium text-green-600">₹{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
