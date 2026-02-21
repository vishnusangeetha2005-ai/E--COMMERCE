'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import Link from 'next/link';
import { FiPackage } from 'react-icons/fi';

export default function StoreOrdersPage() {
  const { storeUrl } = useParams() as { storeUrl: string };
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const base = `/store/${storeUrl}`;

  useEffect(() => {
    api.get('/customer/orders').then(res => setOrders(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) return <><Navbar storeUrl={storeUrl} /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div></>;

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className="w-16 h-16 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500 text-lg">No orders yet</p>
            <Link href={`${base}/products`} className="btn-primary inline-block mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order._id} href={`${base}/orders/${order._id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.products.length} item(s)</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus] || 'bg-gray-100'}`}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                    <p className="mt-2 font-bold text-lg">&#8377;{order.totalAmount}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
