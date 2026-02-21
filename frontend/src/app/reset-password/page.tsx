'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const store = searchParams.get('store') || localStorage.getItem('storeUrl') || 'default';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post(`/store/${store}/reset-password`, { token, password });
      setDone(true);
      toast.success('Password updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          {done ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Password Updated!</h1>
              <p className="text-gray-600">Your password has been reset successfully.</p>
              <Link href="/login" className="btn-primary block text-center">Go to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" required minLength={6} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
