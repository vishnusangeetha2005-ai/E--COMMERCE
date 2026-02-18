'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    api.get(`/owner/orders?${params}`).then(res => { setOrders(res.data.data); setTotalPages(res.data.pages); }).catch(() => {});
  }, [status, page]);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">All Orders</h1>
        <div className="flex gap-2 mb-4">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 rounded-full text-sm ${status === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}`}>{s || 'All'}</button>
          ))}
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Order ID</th>
              <th className="text-left py-3 text-gray-500 font-medium">Store</th>
              <th className="text-left py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left py-3 text-gray-500 font-medium">Amount</th>
              <th className="text-left py-3 text-gray-500 font-medium">Payment</th>
              <th className="text-left py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 text-gray-500 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">#{o._id.slice(-8)}</td>
                  <td className="py-3">{o.clientId?.storeName || '-'}</td>
                  <td className="py-3">{o.customerId?.name || '-'}</td>
                  <td className="py-3">₹{o.totalAmount}</td>
                  <td className="py-3"><span className={`text-xs ${o.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{o.paymentStatus}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[o.orderStatus] || 'bg-gray-100'}`}>{o.orderStatus}</span></td>
                  <td className="py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
