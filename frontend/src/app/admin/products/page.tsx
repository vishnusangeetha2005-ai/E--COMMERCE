'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', costPrice: '', category: '', stock: '', sizes: '', colors: '', status: 'active' });
  const [images, setImages] = useState<FileList | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = () => {
    api.get(`/client/products?page=${page}`).then(res => {
      setProducts(res.data.data);
      setTotalPages(res.data.pages);
    }).catch(() => {});
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const openModal = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({ name: product.name, description: product.description, price: String(product.price), costPrice: String(product.costPrice), category: product.category, stock: String(product.stock), sizes: product.sizes?.join(', ') || '', colors: product.colors?.join(', ') || '', status: product.status });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', price: '', costPrice: '', category: '', stock: '', sizes: '', colors: '', status: 'active' });
    }
    setImages(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'sizes' || key === 'colors') {
        formData.append(key, JSON.stringify(val.split(',').map((s: string) => s.trim()).filter(Boolean)));
      } else {
        formData.append(key, val);
      }
    });
    if (images) { for (let i = 0; i < images.length; i++) formData.append('images', images[i]); }

    try {
      if (editing) {
        await api.put(`/client/products/${editing._id}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/client/products', formData);
        toast.success('Product added');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/client/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus /> Add Product</button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Image</th>
              <th className="text-left py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left py-3 text-gray-500 font-medium">Category</th>
              <th className="text-left py-3 text-gray-500 font-medium">Price</th>
              <th className="text-left py-3 text-gray-500 font-medium">Stock</th>
              <th className="text-left py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="py-3">
                    {p.images?.[0] ? <Image src={p.images[0]} alt="" width={40} height={40} className="rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                  </td>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3">{p.category}</td>
                  <td className="py-3">₹{p.price}</td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => openModal(p)} className="p-1.5 hover:bg-gray-100 rounded"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><FiTrash2 className="w-4 h-4" /></button>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Selling Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" required />
                  <input type="number" placeholder="Cost Price" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" required />
                  <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" />
                </div>
                <input type="text" placeholder="Sizes (comma separated)" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="input-field" />
                <input type="text" placeholder="Colors (comma separated)" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="input-field" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="input-field" />
                <button type="submit" className="btn-primary w-full">{editing ? 'Update' : 'Add'} Product</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
