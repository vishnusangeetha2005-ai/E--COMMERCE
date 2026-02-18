'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiHeart } from 'react-icons/fi';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/wishlist').then(res => setWishlist(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (productId: string) => {
    try {
      const res = await api.post('/customer/wishlist', { productId });
      setWishlist(res.data.data);
      toast.success('Wishlist updated');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post('/customer/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return <><Navbar /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div></>;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="w-16 h-16 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500 text-lg">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product: any) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} onToggleWishlist={handleToggle} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
