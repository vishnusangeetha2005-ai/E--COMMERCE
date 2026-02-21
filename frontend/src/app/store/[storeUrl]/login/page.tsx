'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function StoreLoginPage() {
  const { storeUrl } = useParams() as { storeUrl: string };
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const base = `/store/${storeUrl}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/store/${storeUrl}/login`, { email, password });
      login(res.data);
      toast.success('Welcome back!');
      router.push(base);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href={`${base}/forgot-password`} className="text-primary-600 hover:underline">Forgot Password?</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Don&apos;t have an account? <Link href={`${base}/register`} className="text-primary-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </main>
    </>
  );
}
