'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const store = localStorage.getItem('storeUrl') || 'default';
      await api.post(`/store/${store}/forgot-password`, { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          {sent ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-gray-600">If that email is registered, a reset link has been sent.</p>
              <Link href="/login" className="text-primary-600 hover:underline text-sm">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                <Link href="/login" className="text-primary-600 hover:underline">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
