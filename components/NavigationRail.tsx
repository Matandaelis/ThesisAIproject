'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  LayoutTemplate, 
  BookOpen, 
  CreditCard, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Theses', href: '/editor', icon: FileText },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Citations', href: '/citations', icon: BookOpen },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: Settings },
];

export default function NavigationRail({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <span className="font-bold text-xl text-indigo-600">ThesisAI</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <span className="font-bold text-2xl text-indigo-600 tracking-tight">ThesisAI</span>
          <button 
            className="md:hidden p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-neutral-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex items-center justify-around px-2 py-2 pb-safe z-30">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-lg transition-colors
                ${isActive ? 'text-indigo-600' : 'text-neutral-500 hover:text-neutral-900'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-indigo-50 text-indigo-600' : ''}`} />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
