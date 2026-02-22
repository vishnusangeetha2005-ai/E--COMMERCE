'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { FiHome, FiUsers, FiShoppingCart, FiDollarSign, FiMessageSquare, FiCpu, FiSettings, FiLogOut } from 'react-icons/fi';

const links = [
  { href: '/owner', icon: FiHome, label: 'Dashboard' },
  { href: '/owner/clients', icon: FiUsers, label: 'Clients' },
  { href: '/owner/orders', icon: FiShoppingCart, label: 'Orders' },
  { href: '/owner/revenue', icon: FiDollarSign, label: 'Revenue' },
  { href: '/owner/messages', icon: FiMessageSquare, label: 'Messages' },
  { href: '/owner/bot', icon: FiCpu, label: 'Bot Templates' },
  { href: '/owner/settings', icon: FiSettings, label: 'Settings' },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); router.push('/owner/login'); };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Logo />
        <p className="text-xs text-gray-400 mt-1">Platform Owner</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 w-full">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
