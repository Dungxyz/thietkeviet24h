import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo.tsx';

interface NavbarProps {
  activeView: 'home' | 'admin';
  onNavigateView: (view: 'home' | 'admin', sectionId?: string) => void;
}

export function Navbar({ activeView, onNavigateView }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavClick(view: 'home' | 'admin', sectionId?: string) {
    setMobileOpen(false);
    onNavigateView(view, sectionId);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home', 'top');
          }}
          className="shrink-0"
        >
          <BrandLogo size="sm" />
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#dich-vu"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'dich-vu');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Dịch vụ WebApp
          </a>
          <a
            href="#san-pham"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'san-pham');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Sản phẩm mẫu
          </a>
          <a
            href="#kho-phan-mem"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'kho-phan-mem');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Kho phần mềm
          </a>
          <button
            type="button"
            onClick={() => handleNavClick('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer underline-offset-4 ${
              activeView === 'admin'
                ? 'text-blue-700 font-semibold underline'
                : 'hover:text-slate-900 hover:underline'
            }`}
          >
            Quản trị
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'tu-van')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tư vấn dự án
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'dich-vu')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Dịch vụ WebApp
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'san-pham')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Sản phẩm mẫu
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'kho-phan-mem')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Kho phần mềm
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('admin')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            Trang quản trị đăng bài
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'tu-van')}
            className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg mt-2"
          >
            Tư vấn dự án
          </button>
        </div>
      )}
    </header>
  );
}
