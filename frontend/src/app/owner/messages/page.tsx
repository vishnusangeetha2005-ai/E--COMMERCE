'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';

export default function OwnerMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    const params = platform ? `?platform=${platform}` : '';
    api.get(`/owner/messages${params}`).then(res => setMessages(res.data.data)).catch(() => {});
  }, [platform]);

  const platformColor: Record<string, string> = {
    whatsapp: 'bg-green-100 text-green-700', instagram: 'bg-pink-100 text-pink-700', facebook: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">All Messages</h1>
        <div className="flex gap-2 mb-4">
          {['', 'whatsapp', 'instagram', 'facebook'].map(p => (
            <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-full text-sm ${platform === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}`}>{p || 'All'}</button>
          ))}
        </div>
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{msg.customerName || msg.customerPhone || 'Unknown'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${platformColor[msg.platform] || 'bg-gray-100'}`}>{msg.platform}</span>
                    <span className="text-xs text-gray-400">via {msg.clientId?.storeName || 'Unknown Store'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                  {msg.reply && <p className="text-sm text-green-600 mt-1 italic">Reply: {msg.reply}</p>}
                </div>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-center text-gray-500 py-8">No messages yet.</p>}
        </div>
      </main>
    </div>
  );
}
