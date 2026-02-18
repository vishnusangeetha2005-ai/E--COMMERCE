'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCreditCard } from 'react-icons/fi';

export default function OwnerClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeUrl: '', phone: '', plan: 'basic' });
  const [subModal, setSubModal] = useState<any>(null);
  const [subForm, setSubForm] = useState({ plan: 'basic', days: '30' });

  const fetchClients = () => {
    api.get('/owner/clients').then(res => setClients(res.data.data)).catch(() => {});
  };

  useEffect(() => { fetchClients(); }, []);

  const openModal = (client?: any) => {
    if (client) {
      setEditing(client);
      setForm({ name: client.name, email: client.email, password: '', storeName: client.storeName, storeUrl: client.storeUrl, phone: client.phone || '', plan: client.plan });
    } else {
      setEditing(null);
      setForm({ name: '', email: '', password: '', storeName: '', storeUrl: '', phone: '', plan: 'basic' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const { password, ...rest } = form;
        await api.put(`/owner/clients/${editing._id}`, rest);
        toast.success('Client updated');
      } else {
        await api.post('/owner/clients', form);
        toast.success('Client added');
      }
      setShowModal(false);
      fetchClients();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleActive = async (client: any) => {
    try {
      await api.put(`/owner/clients/${client._id}`, { isActive: !client.isActive });
      toast.success(`Client ${client.isActive ? 'deactivated' : 'activated'}`);
      fetchClients();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/owner/clients/${id}`);
      toast.success('Client deleted');
      fetchClients();
    } catch { toast.error('Failed to delete'); }
  };

  const handleActivateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/owner/clients/${subModal._id}/activate-subscription`, subForm);
      toast.success('Subscription activated');
      setSubModal(null);
      fetchClients();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Client Management</h1>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus /> Add Client</button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left py-3 text-gray-500 font-medium">Store</th>
              <th className="text-left py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left py-3 text-gray-500 font-medium">Plan</th>
              <th className="text-left py-3 text-gray-500 font-medium">Subscription</th>
              <th className="text-left py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3">{c.storeName} <span className="text-xs text-gray-400">/{c.storeUrl}</span></td>
                  <td className="py-3">{c.email}</td>
                  <td className="py-3 capitalize">{c.plan}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
                      c.subscriptionStatus === 'expired' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.subscriptionStatus || 'inactive'}
                    </span>
                    {c.subscriptionExpiry && (
                      <span className="text-xs text-gray-400 ml-1">
                        {new Date(c.subscriptionExpiry) > new Date() ? `exp ${new Date(c.subscriptionExpiry).toLocaleDateString()}` : 'expired'}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <button onClick={() => toggleActive(c)} className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => { setSubModal(c); setSubForm({ plan: c.subscriptionPlan || 'basic', days: '30' }); }} className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600" title="Activate Subscription"><FiCreditCard className="w-4 h-4" /></button>
                    <button onClick={() => openModal(c)} className="p-1.5 hover:bg-gray-100 rounded"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><FiTrash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editing ? 'Edit Client' : 'Add Client'}</h2>
                <button onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
                {!editing && <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" required />}
                <input type="text" placeholder="Store Name" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} className="input-field" required />
                <input type="text" placeholder="Store URL (slug)" value={form.storeUrl} onChange={e => setForm({ ...form, storeUrl: e.target.value })} className="input-field" required />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="input-field">
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <button type="submit" className="btn-primary w-full">{editing ? 'Update' : 'Add'} Client</button>
              </form>
            </div>
          </div>
        )}

        {subModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Activate Subscription</h2>
                <button onClick={() => setSubModal(null)}><FiX /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Manually activate subscription for <strong>{subModal.name}</strong></p>
              <form onSubmit={handleActivateSubscription} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Plan</label>
                  <select value={subForm.plan} onChange={e => setSubForm({ ...subForm, plan: e.target.value })} className="input-field">
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <input type="number" min="1" value={subForm.days} onChange={e => setSubForm({ ...subForm, days: e.target.value })} className="input-field" required />
                </div>
                <button type="submit" className="btn-primary w-full">Activate</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
