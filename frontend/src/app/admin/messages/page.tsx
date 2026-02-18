'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [platform, setPlatform] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const fetchMessages = () => {
    const params = platform ? `?platform=${platform}` : '';
    api.get(`/client/messages${params}`).then(res => setMessages(res.data.data)).catch(() => {});
  };

  useEffect(() => { fetchMessages(); }, [platform]);

  const handleReply = async (msg: any) => {
    if (!replyText.trim()) return;
    try {
      await api.post('/client/messages/reply', {
        messageId: msg._id,
        reply: replyText,
        platform: msg.platform,
        customerPhone: msg.customerPhone,
        customerName: msg.customerName,
      });
      toast.success('Reply sent');
      setReplyText('');
      setReplyTo(null);
      fetchMessages();
    } catch { toast.error('Failed to send reply'); }
  };

  const platformColor: Record<string, string> = {
    whatsapp: 'bg-green-100 text-green-700',
    instagram: 'bg-pink-100 text-pink-700',
    facebook: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        <div className="flex gap-2 mb-4">
          {['', 'whatsapp', 'instagram', 'facebook'].map(p => (
            <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-full text-sm ${platform === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}`}>
              {p || 'All'}
            </button>
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
                    <span className={`text-xs ${msg.direction === 'incoming' ? 'text-blue-500' : 'text-gray-400'}`}>{msg.direction}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                  {msg.reply && <p className="text-sm text-green-600 mt-1 italic">Reply: {msg.reply}</p>}
                </div>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              {msg.direction === 'incoming' && (
                <div className="mt-3">
                  {replyTo === msg._id ? (
                    <div className="flex gap-2">
                      <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type reply..." className="input-field flex-1" onKeyDown={e => e.key === 'Enter' && handleReply(msg)} />
                      <button onClick={() => handleReply(msg)} className="btn-primary"><FiSend /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyTo(msg._id); setReplyText(''); }} className="text-sm text-primary-600 hover:underline">Reply</button>
                  )}
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && <p className="text-center text-gray-500 py-8">No messages yet.</p>}
        </div>
      </main>
    </div>
  );
}
