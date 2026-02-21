'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

interface NavbarProps {
  storeUrl?: string;
}

export default function Navbar({ storeUrl }: NavbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = storeUrl ? `/store/${storeUrl}` : '';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={base || '/'} className="flex items-center gap-2">
            <Logo storeUrl={storeUrl} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href={`${base}/products`} className="text-gray-600 hover:text-primary-600 transition-colors">Products</Link>
            {user ? (
              <>
                <Link href={`${base}/orders`} className="text-gray-600 hover:text-primary-600 transition-colors">Orders</Link>
                <Link href={`${base}/cart`} className="text-gray-600 hover:text-primary-600 transition-colors">
                  <FiShoppingCart className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href={`${base}/login`} className="text-gray-600 hover:text-primary-600">Login</Link>
                <Link href={`${base}/register`} className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href={`${base}/products`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Products</Link>
            {user ? (
              <>
                <Link href={`${base}/orders`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link href={`${base}/cart`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Cart</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link href={`${base}/login`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href={`${base}/register`} className="block py-2 text-primary-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
