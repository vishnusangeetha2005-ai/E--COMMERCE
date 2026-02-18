'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';
import { FiShoppingCart, FiDollarSign, FiTruck, FiClock, FiBox, FiUsers } from 'react-icons/fi';
import Link from 'next/link';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/client/dashboard').then(res => setStats(res.data.data)).catch(() => {});
    api.get('/client/orders?limit=5').then(res => setRecentOrders(res.data.data)).catch(() => {});

    // Real-time order and payment alerts
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('newOrder', () => {
      toast.success('New order received!', { icon: '🛒', duration: 5000 });
      // Refresh stats and recent orders
      api.get('/client/dashboard').then(res => setStats(res.data.data)).catch(() => {});
      api.get('/client/orders?limit=5').then(res => setRecentOrders(res.data.data)).catch(() => {});
    });
    socket.on('paymentReceived', () => {
      toast.success('Payment received!', { icon: '💰', duration: 5000 });
      api.get('/client/dashboard').then(res => setStats(res.data.data)).catch(() => {});
    });
    return () => { socket.disconnect(); };
  }, []);

  const statCards = [
    { icon: FiShoppingCart, label: "Today's Orders", value: stats.todayOrders || 0, color: 'text-blue-600 bg-blue-50' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, color: 'text-green-600 bg-green-50' },
    { icon: FiTruck, label: 'Shipped', value: stats.shippedOrders || 0, color: 'text-purple-600 bg-purple-50' },
    { icon: FiClock, label: 'Pending', value: stats.pendingOrders || 0, color: 'text-yellow-600 bg-yellow-50' },
    { icon: FiBox, label: 'Products', value: stats.totalProducts || 0, color: 'text-indigo-600 bg-indigo-50' },
    { icon: FiUsers, label: 'Customers', value: stats.totalCustomers || 0, color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

        {stats.profit !== undefined && (
          <div className="card mb-8">
            <h2 className="font-semibold mb-2">Profit Overview</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue || 0}</p><p className="text-xs text-gray-500">Revenue</p></div>
              <div><p className="text-2xl font-bold text-red-600">₹{stats.totalCost || 0}</p><p className="text-xs text-gray-500">Cost</p></div>
              <div><p className="text-2xl font-bold text-primary-600">₹{stats.profit || 0}</p><p className="text-xs text-gray-500">Profit</p></div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 text-gray-500 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50">
                    <td className="py-3 font-medium">#{order._id.slice(-8)}</td>
                    <td className="py-3">{order.customerId?.name || 'N/A'}</td>
                    <td className="py-3">₹{order.totalAmount}</td>
                    <td className="py-3"><span className="px-2 py-1 rounded-full text-xs bg-gray-100">{order.orderStatus}</span></td>
                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
