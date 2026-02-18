'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '@/utils/api';

interface LogoProps {
  storeUrl?: string;
  className?: string;
}

export default function Logo({ storeUrl, className = 'h-10 w-auto' }: LogoProps) {
  const [logo, setLogo] = useState('');
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (storeUrl) {
          const res = await api.get(`/store/${storeUrl}/info`);
          setLogo(res.data.data.logo);
          setBrandName(res.data.data.brandName);
        } else {
          const res = await api.get('/auth/profile');
          if (res.data.data.logo) setLogo(res.data.data.logo);
          if (res.data.data.brandName) setBrandName(res.data.data.brandName);
        }
      } catch { /* ignore */ }
    };
    fetchLogo();
  }, [storeUrl]);

  if (logo) {
    return <Image src={logo} alt={brandName || 'Logo'} width={120} height={40} className={className} />;
  }

  return <span className="text-xl font-bold text-primary-600">{brandName || 'E-Commerce'}</span>;
}
