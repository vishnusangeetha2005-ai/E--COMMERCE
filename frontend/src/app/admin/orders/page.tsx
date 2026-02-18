'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    api.get(`/client/orders?${params}`).then(res => { setOrders(res.data.data); setTotalPages(res.data.pages); }).catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [status, page]);

  const updateStatus = async (orderId: string, newStatus: string, trackingId?: string) => {
    try {
      const body: any = { orderStatus: newStatus };
      if (trackingId) body.trackingId = trackingId;
      await api.put(`/client/orders/${orderId}`, body);
      toast.success('Order updated');
      fetchOrders();
    } catch { toast.error('Failed to update order'); }
  };

  const handleShip = (orderId: string) => {
    const trackingId = prompt('Enter tracking ID:');
    if (trackingId) updateStatus(orderId, 'shipped', trackingId);
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        <div className="flex gap-2 mb-4">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 rounded-full text-sm ${status === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Order ID</th>
              <th className="text-left py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left py-3 text-gray-500 font-medium">Items</th>
              <th className="text-left py-3 text-gray-500 font-medium">Amount</th>
              <th className="text-left py-3 text-gray-500 font-medium">Payment</th>
              <th className="text-left py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">#{order._id.slice(-8)}</td>
                  <td className="py-3">{order.customerId?.name || 'N/A'}</td>
                  <td className="py-3">{order.products.length}</td>
                  <td className="py-3">₹{order.totalAmount}</td>
                  <td className="py-3"><span className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus] || 'bg-gray-100'}`}>{order.orderStatus}</span></td>
                  <td className="py-3">
                    <select
                      value={order.orderStatus}
                      onChange={e => {
                        if (e.target.value === 'shipped') handleShip(order._id);
                        else updateStatus(order._id, e.target.value);
                      }}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
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
