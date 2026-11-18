import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo.tsx';

interface NavbarProps {
  activeView: 'home' | 'admin';
  onNavigateView: (view: 'home' | 'admin', sectionId?: string) => void;
}

export function Navbar({ onNavigateView }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavClick(view: 'home' | 'admin', sectionId?: string) {
    setMobileOpen(false);
    onNavigateView(view, sectionId);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home', 'top');
          }}
          className="shrink-0 focus:outline-none"
        >
          <BrandLogo size="sm" />
        </a>

        {/* Menu chính (Desktop) - Đã ẩn nút Quản trị và tăng độ nổi bật */}
        <nav className="hidden md:flex items-center gap-2 text-[15px] font-semibold text-slate-700">
          <a
            href="#dich-vu"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'dich-vu');
            }}
            className="px-4 py-2 rounded-lg hover:text-blue-700 hover:bg-blue-50/80 transition-all whitespace-nowrap shrink-0 focus:outline-none"
          >
            Dịch vụ WebApp
          </a>
          <a
            href="#san-pham"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'san-pham');
            }}
            className="px-4 py-2 rounded-lg hover:text-blue-700 hover:bg-blue-50/80 transition-all whitespace-nowrap shrink-0 focus:outline-none"
          >
            Sản phẩm mẫu
          </a>
          <a
            href="#kho-phan-mem"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'kho-phan-mem');
            }}
            className="px-4 py-2 rounded-lg hover:text-blue-700 hover:bg-blue-50/80 transition-all whitespace-nowrap shrink-0 focus:outline-none"
          >
            Kho phần mềm
          </a>
        </nav>

        {/* Nút CTA nổi bật bên phải */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'tu-van')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm shadow-blue-700/20 hover:shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
          >
            Tư vấn dự án
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={mobileOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile - Cũng đã ẩn nút Quản trị */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'dich-vu')}
            className="block w-full text-left px-3.5 py-2.5 text-[15px] font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-lg focus:outline-none"
          >
            Dịch vụ WebApp
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'san-pham')}
            className="block w-full text-left px-3.5 py-2.5 text-[15px] font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-lg focus:outline-none"
          >
            Sản phẩm mẫu
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'kho-phan-mem')}
            className="block w-full text-left px-3.5 py-2.5 text-[15px] font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-lg focus:outline-none"
          >
            Kho phần mềm
          </button>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleNavClick('home', 'tu-van')}
              className="block w-full text-center px-4 py-3 text-[15px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm focus:outline-none"
            >
              Tư vấn dự án
            </button>
          </div>
        </div>
      )}
    </header>
  );
}