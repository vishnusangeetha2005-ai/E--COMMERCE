'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiDollarSign, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';

const links = [
  { href: '/admin', icon: FiHome, label: 'Dashboard' },
  { href: '/admin/products', icon: FiBox, label: 'Products' },
  { href: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { href: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
  { href: '/admin/messages', icon: FiMessageSquare, label: 'Messages' },
  { href: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); router.push('/admin/login'); };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <Logo />
        <p className="text-xs text-gray-500 mt-1">{user?.storeName || 'Store Admin'}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
