import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-gray-500">Your trusted multi-tenant e-commerce platform.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/products" className="hover:text-primary-600">Products</a></li>
              <li><a href="/orders" className="hover:text-primary-600">My Orders</a></li>
              <li><a href="/cart" className="hover:text-primary-600">Cart</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Email: support@example.com</li>
              <li>WhatsApp Support Available</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} E-Commerce Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
