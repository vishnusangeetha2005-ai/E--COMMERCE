'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/customer/cart');
      setCart(res.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdate = async (id: string, quantity: number) => {
    try {
      const res = await api.put(`/customer/cart/${id}`, { quantity });
      setCart(res.data.data);
    } catch { toast.error('Failed to update cart'); }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await api.delete(`/customer/cart/${id}`);
      setCart(res.data.data);
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) return <><Navbar /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div></>;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <FiShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500 text-lg">Your cart is empty</p>
            <Link href="/products" className="btn-primary inline-block mt-4">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cart.map(item => (
                <CartItem key={item._id} item={item} onUpdate={handleUpdate} onRemove={handleRemove} />
              ))}
            </div>
            <div className="card h-fit">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Items ({cart.length})</span><span>&#8377;{total}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-green-600">Free</span></div>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>&#8377;{total}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full text-center mt-4 block">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
