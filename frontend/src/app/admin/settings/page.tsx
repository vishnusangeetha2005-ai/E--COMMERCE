'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    whatsappNo: '',
    whatsappToken: '',
    whatsappPhoneNumberId: '',
    instagramId: '',
    instagramToken: '',
    facebookPage: '',
    facebookToken: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      const d = res.data.data;
      setForm({
        whatsappNo: d.whatsappNo || '',
        whatsappToken: d.whatsappToken || '',
        whatsappPhoneNumberId: d.whatsappPhoneNumberId || '',
        instagramId: d.instagramId || '',
        instagramToken: d.instagramToken || '',
        facebookPage: d.facebookPage || '',
        facebookToken: d.facebookToken || '',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/client/settings', form);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    setLoading(false);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

        <div className="max-w-lg space-y-6">
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Store Information</h2>
            <div className="space-y-3 text-sm">
              <div><label className="text-gray-500">Store Name</label><p className="font-medium">{user?.storeName || '-'}</p></div>
              <div><label className="text-gray-500">Email</label><p className="font-medium">{user?.email || '-'}</p></div>
              <div><label className="text-gray-500">Name</label><p className="font-medium">{user?.name || '-'}</p></div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-lg mb-4">WhatsApp Integration</h2>
            <p className="text-xs text-gray-400 mb-3">Get these from developers.facebook.com → WhatsApp Business API. Leave empty to use platform defaults.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                <input type="text" value={form.whatsappNo} onChange={e => setForm({ ...form, whatsappNo: e.target.value })} className="input-field" placeholder="+91XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp API Token</label>
                <input type="password" value={form.whatsappToken} onChange={e => setForm({ ...form, whatsappToken: e.target.value })} className="input-field" placeholder="Your WhatsApp Business API token" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                <input type="text" value={form.whatsappPhoneNumberId} onChange={e => setForm({ ...form, whatsappPhoneNumberId: e.target.value })} className="input-field" placeholder="WhatsApp phone number ID" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Instagram Integration</h2>
            <p className="text-xs text-gray-400 mb-3">Get from developers.facebook.com → Instagram API. Leave empty to use platform defaults.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Instagram Page ID</label>
                <input type="text" value={form.instagramId} onChange={e => setForm({ ...form, instagramId: e.target.value })} className="input-field" placeholder="Your Instagram page ID" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram Access Token</label>
                <input type="password" value={form.instagramToken} onChange={e => setForm({ ...form, instagramToken: e.target.value })} className="input-field" placeholder="Your Instagram access token" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Facebook Integration</h2>
            <p className="text-xs text-gray-400 mb-3">Get from developers.facebook.com → Facebook Page. Leave empty to use platform defaults.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook Page ID</label>
                <input type="text" value={form.facebookPage} onChange={e => setForm({ ...form, facebookPage: e.target.value })} className="input-field" placeholder="Your Facebook page ID" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facebook Page Access Token</label>
                <input type="password" value={form.facebookToken} onChange={e => setForm({ ...form, facebookToken: e.target.value })} className="input-field" placeholder="Your Facebook page access token" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}
