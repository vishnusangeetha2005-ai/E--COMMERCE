'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StoreProductsContent />
    </Suspense>
  );
}

function StoreProductsContent() {
  const { storeUrl } = useParams() as { storeUrl: string };
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const base = `/store/${storeUrl}`;

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('sort', sort);
      params.set('page', page.toString());
      const res = await api.get(`/store/${storeUrl}/products?${params}`);
      setProducts(res.data.data);
      setTotalPages(res.data.pages);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (storeUrl) fetchProducts(); }, [storeUrl, category, sort, page]);

  useEffect(() => {
    if (storeUrl) api.get(`/store/${storeUrl}/categories`).then(res => setCategories(res.data.data)).catch(() => {});
  }, [storeUrl]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchProducts(); };

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post('/customer/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch { toast.error('Please login to add to cart'); }
  };

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">All Products</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" />
          </form>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field md:w-48">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="input-field md:w-48">
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} basePath={`${base}/products`} />
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 py-12">No products found.</p>}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 rounded-lg ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
