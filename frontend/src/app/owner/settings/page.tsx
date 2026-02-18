'use client';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FiCheckCircle, FiAlertCircle, FiCopy } from 'react-icons/fi';

export default function OwnerSettingsPage() {
  const [brandName, setBrandName] = useState('');
  const [currentLogo, setCurrentLogo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [upiId, setUpiId] = useState('');
  const [social, setSocial] = useState({
    whatsappNo: '', whatsappToken: '', whatsappPhoneNumberId: '',
    instagramId: '', instagramToken: '', facebookPage: '', facebookToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      setBrandName(res.data.data.brandName || '');
      setCurrentLogo(res.data.data.logo || '');
      setRazorpayKeyId(res.data.data.razorpayKeyId || '');
      setRazorpayKeySecret(res.data.data.razorpayKeySecret || '');
      setUpiId(res.data.data.upiId || '');
      setSocial({
        whatsappNo: res.data.data.whatsappNo || '',
        whatsappToken: res.data.data.whatsappToken || '',
        whatsappPhoneNumberId: res.data.data.whatsappPhoneNumberId || '',
        instagramId: res.data.data.instagramId || '',
        instagramToken: res.data.data.instagramToken || '',
        facebookPage: res.data.data.facebookPage || '',
        facebookToken: res.data.data.facebookToken || '',
      });
    }).catch(() => {});
    setApiUrl(window.location.origin.replace(':3000', ':5000'));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('brandName', brandName);
      if (logoFile) formData.append('logo', logoFile);
      const res = await api.put('/owner/settings', formData);
      setCurrentLogo(res.data.data.logo || '');
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    setLoading(false);
  };

  const handleSavePayment = async () => {
    setPaymentLoading(true);
    try {
      await api.put('/owner/settings', { razorpayKeyId, razorpayKeySecret, upiId });
      toast.success('Payment settings saved');
    } catch { toast.error('Failed to save'); }
    setPaymentLoading(false);
  };

  const handleSaveSocial = async () => {
    setSocialLoading(true);
    try {
      await api.put('/owner/settings', social);
      toast.success('Social media defaults saved');
    } catch { toast.error('Failed to save'); }
    setSocialLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const webhookUrl = `${apiUrl}/api/webhook`;

  return (
    <div className="flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

        <div className="max-w-lg space-y-6">
          {/* Branding */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform Logo</label>
                {currentLogo && (
                  <div className="mb-2">
                    <Image src={currentLogo} alt="Current logo" width={120} height={40} className="rounded border" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="input-field" />
                <p className="text-xs text-gray-400 mt-1">This logo will appear on all dashboards and storefronts. Clients cannot change it.</p>
              </div>
              <button onClick={handleSave} disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Settings'}</button>
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Payment Gateway</h2>
            <p className="text-xs text-gray-400 mb-3">These payment keys are used for all client stores and subscription payments.</p>
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Razorpay</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Razorpay Key ID</label>
                <input type="text" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} className="input-field" placeholder="rzp_live_XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Razorpay Key Secret</label>
                <input type="password" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} className="input-field" placeholder="Your Razorpay key secret" />
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <h3 className="font-medium text-sm text-gray-700 mb-2">UPI QR Code Payment</h3>
                <p className="text-xs text-gray-400 mb-2">Customers can scan QR code to pay via Google Pay, PhonePe, Paytm etc.</p>
                <label className="block text-sm font-medium mb-1">UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="input-field" placeholder="yourname@upi or yourname@paytm" />
              </div>
              <button onClick={handleSavePayment} disabled={paymentLoading} className="btn-primary">
                {paymentLoading ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </div>
          </div>

          {/* Default Social Media Keys */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-2">Default Social Media Keys</h2>
            <p className="text-xs text-gray-400 mb-4">These are used as defaults. Clients can override with their own keys from their Settings page.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">WhatsApp</h3>
                <div className="space-y-2">
                  <input type="text" value={social.whatsappNo} onChange={e => setSocial({ ...social, whatsappNo: e.target.value })} className="input-field" placeholder="WhatsApp Number (+91XXXXXXXXXX)" />
                  <input type="password" value={social.whatsappToken} onChange={e => setSocial({ ...social, whatsappToken: e.target.value })} className="input-field" placeholder="WhatsApp API Token" />
                  <input type="text" value={social.whatsappPhoneNumberId} onChange={e => setSocial({ ...social, whatsappPhoneNumberId: e.target.value })} className="input-field" placeholder="Phone Number ID" />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Instagram</h3>
                <div className="space-y-2">
                  <input type="text" value={social.instagramId} onChange={e => setSocial({ ...social, instagramId: e.target.value })} className="input-field" placeholder="Instagram Page ID" />
                  <input type="password" value={social.instagramToken} onChange={e => setSocial({ ...social, instagramToken: e.target.value })} className="input-field" placeholder="Instagram Access Token" />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Facebook</h3>
                <div className="space-y-2">
                  <input type="text" value={social.facebookPage} onChange={e => setSocial({ ...social, facebookPage: e.target.value })} className="input-field" placeholder="Facebook Page ID" />
                  <input type="password" value={social.facebookToken} onChange={e => setSocial({ ...social, facebookToken: e.target.value })} className="input-field" placeholder="Facebook Page Access Token" />
                </div>
              </div>
              <button onClick={handleSaveSocial} disabled={socialLoading} className="btn-primary">
                {socialLoading ? 'Saving...' : 'Save Social Media Defaults'}
              </button>
            </div>
          </div>

          {/* Webhook Setup Guide */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Social Media Webhook Setup</h2>
            <p className="text-sm text-gray-500 mb-4">Set this up once on Facebook Developers to enable chatbots for all clients.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <div className="flex gap-2">
                  <input type="text" value={webhookUrl} readOnly className="input-field flex-1 bg-gray-50" />
                  <button onClick={() => copyToClipboard(webhookUrl)} className="btn-secondary"><FiCopy /></button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Verify Token</label>
                <div className="flex gap-2">
                  <input type="text" value="ecomm_webhook_verify_2024_secure" readOnly className="input-field flex-1 bg-gray-50" />
                  <button onClick={() => copyToClipboard('ecomm_webhook_verify_2024_secure')} className="btn-secondary"><FiCopy /></button>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="font-medium text-sm mb-3">Setup Steps:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                  <span className="font-medium text-primary-600">1.</span>
                  Go to <a href="https://developers.facebook.com" target="_blank" className="text-primary-600 hover:underline">developers.facebook.com</a>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary-600">2.</span>
                  Create a Meta App (Business type)
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary-600">3.</span>
                  Add WhatsApp, Messenger, and Instagram products
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary-600">4.</span>
                  Go to each product → Webhooks → paste the URL and token above
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-primary-600">5.</span>
                  Subscribe to messages events
                </li>
              </ol>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You do this once. Each client then adds their own API tokens from their Store Admin → Settings page.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">How Social Media Works</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p><strong>You (Owner):</strong> Set up one Meta App with webhook URL pointing to your server</p>
              </div>
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p><strong>Default Keys:</strong> Set default social media keys above. These are used when a client hasn't configured their own.</p>
              </div>
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p><strong>Client Override:</strong> Each client can optionally add their own keys from their Settings page to override the defaults</p>
              </div>
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p><strong>Auto-routing:</strong> When a message arrives, the system matches it to the correct client and uses their token (or your default) to reply</p>
              </div>
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p><strong>Requirement:</strong> Your server must be accessible via HTTPS (use a domain with SSL for production)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
