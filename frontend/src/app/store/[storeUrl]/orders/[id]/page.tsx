'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTracker from '@/components/OrderTracker';
import api from '@/utils/api';

export default function StoreOrderDetailPage() {
  const { storeUrl, id } = useParams() as { storeUrl: string; id: string };
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get(`/customer/orders/${id}`).then(res => setOrder(res.data.data)).catch(() => {});
  }, [id]);

  if (!order) return <><Navbar storeUrl={storeUrl} /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div></>;

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Order #{order._id.slice(-8)}</h1>
        <p className="text-gray-500 mb-8">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

        <div className="card mb-8">
          <h2 className="font-semibold text-lg mb-4">Order Status</h2>
          <OrderTracker status={order.orderStatus} />
          {order.trackingId && <p className="mt-4 text-sm text-gray-600">Tracking ID: <span className="font-medium">{order.trackingId}</span></p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Items</h2>
            <div className="space-y-3">
              {order.products.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}</p>
                  </div>
                  <span className="font-medium">&#8377;{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold text-lg mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize">{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>{order.paymentStatus.toUpperCase()}</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-&#8377;{order.discount}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>&#8377;{order.totalAmount}</span></div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
