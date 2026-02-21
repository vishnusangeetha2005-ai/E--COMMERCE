'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function ClientLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'sent'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/client/login', { email, password });
      login(res.data);
      toast.success('Welcome!');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/client/forgot-password', { email: forgotEmail });
      setView('sent');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6"><Logo /></div>
        {view === 'login' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Store Admin Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setView('forgot')} className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
            </form>
          </>
        )}
        {view === 'forgot' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="input-field" required />
              </div>
              <button type="submit" disabled={forgotLoading} className="btn-primary w-full">{forgotLoading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              <button onClick={() => setView('login')} className="text-blue-600 hover:underline">Back to Login</button>
            </p>
          </>
        )}
        {view === 'sent' && (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-gray-600">If that email is registered, a reset link has been sent. Check your inbox.</p>
            <button onClick={() => setView('login')} className="text-blue-600 hover:underline text-sm">Back to Login</button>
          </div>
        )}
      </div>
    </main>
  );
}
