'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>({ payments: [], totalRevenue: 0, totalCost: 0, profit: 0 });

  useEffect(() => {
    api.get('/client/payments').then(res => setData(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Payments & Profit</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-green-600">₹{data.totalRevenue}</p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-red-600">₹{data.totalCost}</p>
            <p className="text-xs text-gray-500">Total Cost</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-primary-600">₹{data.profit}</p>
            <p className="text-xs text-gray-500">Net Profit</p>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <h2 className="font-semibold mb-4">Payment History</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Order</th>
              <th className="text-left py-3 text-gray-500 font-medium">Amount</th>
              <th className="text-left py-3 text-gray-500 font-medium">Method</th>
              <th className="text-left py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 text-gray-500 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {data.payments?.map((p: any) => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">#{(p.orderId?._id || p.orderId || '').toString().slice(-8)}</td>
                  <td className="py-3">₹{p.amount}</td>
                  <td className="py-3 capitalize">{p.method}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'refunded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  <td className="py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
