'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import api from '@/utils/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/owner/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6"><Logo /></div>
        {done ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Password Updated!</h1>
            <p className="text-gray-600">Your password has been reset successfully.</p>
            <button onClick={() => router.push('/owner/login')} className="btn-primary w-full">Go to Login</button>
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
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Updating...' : 'Update Password'}</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function OwnerResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
