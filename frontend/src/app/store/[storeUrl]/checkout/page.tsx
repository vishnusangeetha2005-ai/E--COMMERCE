'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

declare global { interface Window { Razorpay: any; } }

export default function StoreCheckoutPage() {
  const { storeUrl } = useParams() as { storeUrl: string };
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', country: 'India' });
  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [upiData, setUpiData] = useState<any>(null);
  const [upiConfirming, setUpiConfirming] = useState(false);
  const base = `/store/${storeUrl}`;

  useEffect(() => {
    api.get('/customer/cart').then(res => setCart(res.data.data)).catch(() => {});
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill in your complete address');
    }
    setLoading(true);

    try {
      const orderRes = await api.post('/customer/checkout', {
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon || undefined,
      });
      const order = orderRes.data.data;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        router.push(`${base}/orders/${order._id}`);
        return;
      }

      if (paymentMethod === 'upi') {
        const upiRes = await api.post('/payment/upi-order', { orderId: order._id });
        setUpiData({ ...upiRes.data.data });
        setLoading(false);
        return;
      }

      // Razorpay payment
      const paymentRes = await api.post('/payment/create-order', { orderId: order._id });
      const { razorpayOrderId, amount, key } = paymentRes.data.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'E-Commerce Store',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            router.push(`${base}/orders/${order._id}`);
          } catch { toast.error('Payment verification failed'); }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiConfirm = async () => {
    setUpiConfirming(true);
    try {
      await api.post('/payment/upi-confirm', { orderId: upiData.orderId });
      toast.success('Payment submitted! Store admin will verify.');
      router.push(`${base}/orders/${upiData.orderId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
    setUpiConfirming(false);
  };

  const upiLink = upiData ? `upi://pay?pa=${upiData.upiId}&pn=${encodeURIComponent(upiData.payeeName)}&am=${upiData.amount}&cu=INR&tn=Order-${upiData.orderId}` : '';

  return (
    <>
      <Navbar storeUrl={storeUrl} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* UPI QR Code Modal */}
        {upiData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-2">Scan to Pay</h2>
              <p className="text-gray-500 text-sm mb-4">Scan QR code with Google Pay, PhonePe, Paytm or any UPI app</p>
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 inline-block mb-4">
                <QRCodeSVG value={upiLink} size={200} level="H" />
              </div>
              <div className="text-left bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pay to</span>
                  <span className="font-medium">{upiData.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-lg">&#8377;{upiData.amount}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">After scanning and paying, click the button below</p>
              <button onClick={handleUpiConfirm} disabled={upiConfirming} className="btn-primary w-full mb-2">
                {upiConfirming ? 'Confirming...' : "I've Paid"}
              </button>
              <button onClick={() => setUpiData(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        <form onSubmit={handleCheckout}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
                <div className="space-y-3">
                  <input type="text" placeholder="Street Address" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="input-field" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="input-field" required />
                    <input type="text" placeholder="State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="input-field" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Pincode" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} className="input-field" required />
                    <input type="text" placeholder="Country" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="input-field" />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={e => { setPaymentMethod(e.target.value); setUpiData(null); }} />
                    <span>Pay Online (Razorpay)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={e => { setPaymentMethod(e.target.value); setUpiData(null); }} />
                    <div>
                      <span>UPI QR Code</span>
                      <p className="text-xs text-gray-400">Scan & pay with Google Pay, PhonePe, Paytm</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={e => { setPaymentMethod(e.target.value); setUpiData(null); }} />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card h-fit">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product?.name} x{item.quantity}</span>
                    <span>&#8377;{(item.product?.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Coupon Code" value={coupon} onChange={e => setCoupon(e.target.value)} className="input-field flex-1" />
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>&#8377;{total}</span>
              </div>
              <button type="submit" disabled={loading || cart.length === 0} className="btn-primary w-full mt-4 disabled:opacity-50">
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
