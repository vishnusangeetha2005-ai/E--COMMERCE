'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';

export default function StoreHomePage() {
  const { storeUrl } = useParams() as { storeUrl: string };
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [storeName, setStoreName] = useState('');
  const base = `/store/${storeUrl}`;

  useEffect(() => {
    if (!storeUrl) return;
    const fetchData = async () => {
      try {
        const [prodRes, catRes, infoRes] = await Promise.all([
          api.get(`/store/${storeUrl}/products?limit=8`).catch(() => ({ data: { data: [] } })),
          api.get(`/store/${storeUrl}/categories`).catch(() => ({ data: { data: [] } })),
          api.get(`/store/${storeUrl}/info`).catch(() => ({ data: { data: {} } })),
        ]);
        setProducts(prodRes.data.data || []);
        setCategories(catRes.data.data || []);
        setStoreName(infoRes.data?.data?.storeName || '');
      } catch { /* ignore */ }
    };
    fetchData();
  }, [storeUrl]);

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post('/customer/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch {
      toast.error('Please login to add to cart');
    }
  };

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {storeName ? `Welcome to ${storeName}` : 'Discover Amazing Products'}
              </h1>
              <p className="mt-4 text-lg text-primary-100">Shop the best deals from trusted sellers. Quality products delivered to your doorstep.</p>
              <Link href={`${base}/products`} className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Shop Now <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiShoppingBag, title: 'Wide Selection', desc: 'Thousands of products' },
              { icon: FiTruck, title: 'Fast Delivery', desc: 'Quick and reliable' },
              { icon: FiShield, title: 'Secure Payment', desc: 'Safe transactions' },
              { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here to help' },
            ].map((f, i) => (
              <div key={i} className="text-center p-4">
                <f.icon className="w-8 h-8 mx-auto text-primary-600" />
                <h3 className="mt-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <Link key={cat} href={`${base}/products?category=${cat}`} className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Products */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <Link href={`${base}/products`} className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} basePath={`${base}/products`} />
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center text-gray-500 py-12">No products available yet.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
