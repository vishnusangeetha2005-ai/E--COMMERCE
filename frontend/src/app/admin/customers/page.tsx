'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/client/customers?page=${page}`).then(res => { setCustomers(res.data.data); setTotalPages(res.data.pages); }).catch(() => {});
  }, [page]);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Customers</h1>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left py-3 text-gray-500 font-medium">Phone</th>
              <th className="text-left py-3 text-gray-500 font-medium">Joined</th>
            </tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3">{c.email}</td>
                  <td className="py-3">{c.phone || '-'}</td>
                  <td className="py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
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
