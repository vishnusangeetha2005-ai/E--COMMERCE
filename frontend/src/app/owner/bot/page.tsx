'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function OwnerBotPage() {
  const [templates, setTemplates] = useState<any>({
    welcome: '', orderConfirmation: '', shippingUpdate: '', deliveryUpdate: '', faq: [],
  });

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      if (res.data.data.botTemplates) setTemplates(res.data.data.botTemplates);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/owner/bot-templates', templates);
      toast.success('Bot templates saved');
    } catch { toast.error('Failed to save'); }
  };

  const addFaq = () => {
    setTemplates({ ...templates, faq: [...(templates.faq || []), { question: '', answer: '' }] });
  };

  const removeFaq = (index: number) => {
    const faq = [...templates.faq];
    faq.splice(index, 1);
    setTemplates({ ...templates, faq });
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const faq = [...templates.faq];
    faq[index] = { ...faq[index], [field]: value };
    setTemplates({ ...templates, faq });
  };

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Bot Templates</h1>
        <div className="max-w-2xl space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-3">Message Templates</h2>
            <p className="text-xs text-gray-400 mb-4">Use {'{orderId}'}, {'{trackingId}'} as placeholders</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Welcome Message</label>
                <textarea value={templates.welcome} onChange={e => setTemplates({ ...templates, welcome: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order Confirmation</label>
                <textarea value={templates.orderConfirmation} onChange={e => setTemplates({ ...templates, orderConfirmation: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Update</label>
                <textarea value={templates.shippingUpdate} onChange={e => setTemplates({ ...templates, shippingUpdate: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Update</label>
                <textarea value={templates.deliveryUpdate} onChange={e => setTemplates({ ...templates, deliveryUpdate: e.target.value })} className="input-field" rows={2} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">FAQ Auto-Replies</h2>
              <button onClick={addFaq} className="text-sm text-primary-600 hover:underline flex items-center gap-1"><FiPlus /> Add FAQ</button>
            </div>
            <div className="space-y-4">
              {templates.faq?.map((faq: any, i: number) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400">FAQ #{i + 1}</span>
                    <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                  <input type="text" placeholder="Question" value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} className="input-field mb-2" />
                  <textarea placeholder="Answer" value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} className="input-field" rows={2} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary">Save All Templates</button>
        </div>
      </main>
    </div>
  );
}
