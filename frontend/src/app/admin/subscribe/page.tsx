'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import { FiCheck } from 'react-icons/fi';

declare global {
  interface Window { Razorpay: any; }
}

const planFeatures: Record<string, string[]> = {
  basic: ['Up to 100 products', 'Order management', 'Basic analytics', 'Email support'],
  pro: ['Up to 500 products', 'Advanced analytics', 'Priority support', 'WhatsApp bot'],
  enterprise: ['Unlimited products', 'Custom integrations', '24/7 support', 'All bot channels'],
};

export default function SubscribePage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    api.get('/subscription/plans').then(res => setPlans(res.data.data)).catch(() => {});

    // Load Razorpay script
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, []);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await api.post('/subscription/create', { planId });
      const { razorpayOrderId, amount, currency, key } = res.data.data;

      const options = {
        key,
        amount,
        currency,
        name: 'Platform Subscription',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - Monthly`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await api.post('/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            });
            toast.success('Subscription activated!');
            router.push('/admin');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#4F46E5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Logo />
          <h1 className="text-3xl font-bold mt-4">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">Subscribe to access your store dashboard and start selling</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`card border-2 ${plan.id === 'pro' ? 'border-indigo-500 relative' : 'border-transparent'}`}>
              {plan.id === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
              )}
              <h2 className="text-xl font-bold capitalize">{plan.name}</h2>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-bold">&#8377;{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {(planFeatures[plan.id] || []).map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <FiCheck className="text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-lg font-medium transition ${
                  plan.id === 'pro'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
