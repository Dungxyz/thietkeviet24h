import { ArrowRight, CheckCircle2, Download, ExternalLink, Mail, MessageCircle, Phone, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ASSET_IMAGES } from '../shared/seedData.ts';
import type { PostItem } from '../shared/types.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { SafeImage } from './SafeImage.tsx';

interface PublicHomeProps {
  posts: PostItem[];
  loading: boolean;
  onSelectPost: (post: PostItem) => void;
  preselectedService: string;
  onClearPreselectedService: () => void;
  onOpenAdmin: () => void;
}

const SOFTWARE_CATEGORIES = [
  'Tất cả',
  'Đồ họa & Thiết kế',
  'Kỹ thuật & CAD',
  'Văn phòng & Tiện ích',
  'Thủ thuật WebApp',
];

export function PublicHome({
  posts,
  loading,
  onSelectPost,
  preselectedService,
  onClearPreselectedService,
  onOpenAdmin,
}: PublicHomeProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Consultation Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState(
    preselectedService || 'WebApp Quản lý Thu Chi & Công nợ',
  );
  const [budget, setBudget] = useState('Từ 3 – 8 triệu');
  const [message, setMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedService) {
      setServiceType(preselectedService);
    }
  }, [preselectedService]);

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts],
  );

  const webappPosts = useMemo(
    () => publishedPosts.filter((p) => p.type === 'webapp'),
    [publishedPosts],
  );

  const softwarePosts = useMemo(() => {
    return publishedPosts.filter((p) => {
      if (p.type !== 'software' && p.type !== 'tutorial') return false;
      if (activeCategory !== 'Tất cả' && p.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [publishedPosts, activeCategory, searchQuery]);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLeadError(null);
    setLeadSuccess(null);

    if (!fullName.trim() || !phone.trim()) {
      setLeadError('Vui lòng nhập họ tên và số điện thoại hoặc Zalo.');
      return;
    }

    setSubmittingLead(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          serviceType,
          budget,
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; lead?: { id: string } };
      if (!res.ok) {
        setLeadError(data.error || 'Không thể gửi yêu cầu, vui lòng kiểm tra lại thông tin.');
        return;
      }

      setLeadSuccess(
        'Đã tiếp nhận yêu cầu tư vấn thành công. Đội ngũ Thiết Kế Việt 24h sẽ liên hệ lại qua Zalo/Điện thoại trong giờ làm việc.',
      );
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
      onClearPreselectedService();
    } catch {
      setLeadError('Lỗi kết nối máy chủ, vui lòng thử lại hoặc gọi trực tiếp 0376.449.393.');
    } finally {
      setSubmittingLead(false);
    }
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section: 2-Column Balanced Split + Full-width 4-Column Metric Strip */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-blue-700 tracking-wide">
                thietkeviet24h.vn · Giải pháp WebApp &amp; Phần mềm
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.15rem,3.8vw,3.35rem)] font-bold text-slate-900 leading-[1.12] tracking-tight text-balance">
                Thiết kế WebApp theo yêu cầu và kho tiện ích phần mềm chuẩn hóa.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                Xây dựng ứng dụng web quản trị nội bộ, POS bán hàng và tự động hóa quy trình đồng bộ
                Google Sheets, AppSheet với chi phí tối ưu. Kèm thư viện phần mềm đồ họa, kỹ thuật
                và hướng dẫn cài đặt chi tiết.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('tu-van')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Nhận báo giá WebApp
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('kho-phan-mem')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Khám phá kho phần mềm
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>Hỗ trợ kỹ thuật: 0376.449.393</span>
                <span aria-hidden="true">·</span>
                <span>info@thietkeviet24h.vn</span>
                <span aria-hidden="true">·</span>
                <span>Triển khai nhanh trên Vercel</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] lg:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafeImage
                  src={ASSET_IMAGES.heroStudio}
                  alt="Không gian thiết kế và phát triển WebApp tại Thiết Kế Việt 24h"
                  fallbackTitle="Thiết Kế Việt 24h — WebApp Engineering Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column proof strip strictly below the split */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-200">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                50+
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Mẫu WebApp quản lý &amp; bán hàng triển khai thực tế
              </div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                0đ / tháng
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Phí thuê máy chủ khi dùng Google Sheets &amp; AppSheet
              </div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {publishedPosts.length}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Bài viết phần mềm, giải pháp &amp; thủ thuật đã xuất bản
              </div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                12 tháng
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Bảo hành kỹ thuật &amp; hỗ trợ cài đặt từ xa trọn vẹn
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: Core Services Asymmetric Bento Grid */}
      <section id="dich-vu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            01. Dịch vụ thiết kế WebApp &amp; tự động hóa quy trình
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Chúng tôi chuyển hóa các bảng tính Excel rời rạc thành phần mềm web trực quan, phân
            quyền chặt chẽ và chạy ổn định trên cả điện thoại lẫn máy tính.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-blue-700">
                Giải pháp trọng tâm · Không tốn phí server hàng tháng
              </div>
              <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold text-slate-900">
                WebApp Quản trị Tùy biến trên nền Google Sheets, AppSheet &amp; Vercel
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed text-[15px] max-w-2xl">
                Phù hợp cho doanh nghiệp SME, cửa hàng F&amp;B, văn phòng kiến trúc và đội kinh
                doanh muốn sở hữu trọn đời công cụ quản lý thu chi, công nợ, hợp đồng và chấm công
                mà không phụ thuộc vào phần mềm thuê bao đắt đỏ.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              <div>
                <div className="text-sm font-semibold text-slate-900">Triển khai 3–7 ngày</div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Thiết kế đúng quy trình thực tế của doanh nghiệp, bàn giao nhanh.
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Đồng bộ thời gian thực</div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Xuất báo cáo Excel, PDF và gửi thông báo tự động qua Zalo/Email.
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Triển khai GitHub &amp; Vercel</div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Mã nguồn gọn nhẹ, hỗ trợ kết nối API, webhook và chạy tốc độ cao trên Vercel.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500">
                Hỗ trợ kỹ thuật · Cài đặt từ xa
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
                Thư viện Phần mềm &amp; Tối ưu Máy trạm
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">
                Cung cấp bộ cài đặt sạch các phần mềm đồ họa, kỹ thuật CAD, văn phòng Office kèm
                hướng dẫn tối ưu RAM và xử lý lỗi phát sinh qua UltraViewer / TeamViewer.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Cập nhật hàng tuần</span>
              <button
                type="button"
                onClick={() => scrollToSection('kho-phan-mem')}
                className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
              >
                Xem kho phần mềm →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: WebApp Showcase */}
      <section id="san-pham" className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                02. Sản phẩm WebApp tiêu biểu sẵn sàng bàn giao
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Các hệ thống đã được kiểm thử thực tế, có thể tùy chỉnh giao diện, trường dữ liệu và
                biểu mẫu in ấn theo yêu cầu riêng của từng đơn vị.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs font-medium text-slate-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Thêm mẫu WebApp trong Quản trị
            </button>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-xl bg-slate-100 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : webappPosts.length === 0 ? (
            <div className="mt-8 p-8 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-600">
              Chưa có sản phẩm WebApp nào được xuất bản. Hãy thêm bài viết loại WebApp trong trang
              Quản trị.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webappPosts.map((item) => (
                <article
                  key={item.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-slate-200">
                      <SafeImage
                        src={item.coverImage}
                        alt={item.title}
                        fallbackTitle={item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-xs text-slate-500 flex items-center gap-2 truncate">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.version}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {item.priceLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectPost(item)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Xem chi tiết
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 03: Software Utilities & Guides Library */}
      <section id="kho-phan-mem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              03. Kho tiện ích phần mềm &amp; thủ thuật kỹ thuật
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Tổng hợp các bộ cài đặt phần mềm đồ họa, kỹ thuật CAD, công cụ văn phòng và bài viết
              hướng dẫn cấu hình WebApp do đội ngũ biên tập và kiểm duyệt.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Photoshop, AutoCAD, Office..."
              aria-label="Tìm kiếm phần mềm và thủ thuật"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* Interactive Segmented Category Filter */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg w-fit max-w-full overflow-x-auto">
          {SOFTWARE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : softwarePosts.length === 0 ? (
          <div className="mt-8 p-10 bg-white border border-slate-200 rounded-xl text-center">
            <p className="text-sm text-slate-600">
              Không tìm thấy tiện ích phần mềm nào khớp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Tất cả');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-medium text-blue-700 hover:underline cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwarePosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 truncate">
                    <span>{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{post.version}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{post.fileSize}</span>
                  </div>

                  <h3 className="mt-2.5 font-display text-lg font-semibold text-slate-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => onSelectPost(post)}
                      className="text-left hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {post.title}
                    </button>
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {post.downloads.toLocaleString('vi-VN')} lượt tải
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPost(post)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Hướng dẫn &amp; Tải về
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Section 04: Consultation & Quote Form */}
      <section id="tu-van" className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              04. Đăng ký tư vấn thiết kế WebApp &amp; hỗ trợ kỹ thuật
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Gửi yêu cầu về nghiệp vụ quản lý bạn đang cần số hóa hoặc phần mềm cần cài đặt. Mọi
              thông tin được lưu trực tiếp về trang Quản trị để đội kỹ thuật phản hồi sớm nhất.
            </p>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-sky-100 shrink-0">
                  <img
                    src="/assets/aistudio/image_e1e2b99d.png"
                    alt="Vũ Đức Dũng — Website Developer"
                    referrerPolicy="no-referrer"
                    className="absolute max-w-none w-[248%] -left-[70%] -top-[34%]"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
                    Vũ Đức Dũng
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Website Developer · Since 2017
                  </p>
                  <p className="text-sm text-slate-700 mt-1.5">
                    Nhận làm WebApp theo yêu cầu
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
                <a
                  href="https://zalo.me/0376449393"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Liên hệ Zalo
                </a>
                <a
                  href="tel:0376449393"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  0376.449.393
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  Facebook
                </a>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <a
                  href="mailto:info@thietkeviet24h.vn"
                  className="inline-flex items-center gap-1.5 hover:text-slate-900"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  info@thietkeviet24h.vn
                </a>
                <span aria-hidden="true">·</span>
                <span>thietkeviet24h.vn</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <form onSubmit={handleLeadSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Họ và tên *
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Số điện thoại / Zalo *
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email liên hệ
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@congty.vn"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label htmlFor="lead-budget" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Ngân sách dự kiến
                  </label>
                  <select
                    id="lead-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Dưới 3 triệu">Dưới 3 triệu (Tiện ích / Gói cơ bản)</option>
                    <option value="Từ 3 – 8 triệu">Từ 3 – 8 triệu (WebApp theo mẫu)</option>
                    <option value="Từ 8 – 20 triệu">Từ 8 – 20 triệu (Thiết kế riêng theo quy trình)</option>
                    <option value="Cần tư vấn báo giá">Cần tư vấn báo giá chi tiết</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="lead-service" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dịch vụ quan tâm
                </label>
                <input
                  id="lead-service"
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="lead-message" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mô tả nhu cầu chi tiết
                </label>
                <textarea
                  id="lead-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ví dụ: Cần làm WebApp quản lý thu chi cho 2 chi nhánh đồng bộ Google Sheets, hoặc cần hỗ trợ cài bộ phần mềm thiết kế..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              {leadError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  {leadError}
                </div>
              )}

              {leadSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{leadSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {submittingLead ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu tư vấn'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <BrandLogo size="sm" />
            <p className="mt-2 text-xs text-slate-500">
              Giải pháp WebApp tùy biến &amp; Kho tiện ích phần mềm · Vũ Đức Dũng (Since 2017) · thietkeviet24h.vn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <a href="#dich-vu" className="hover:text-slate-900">
              Dịch vụ WebApp
            </a>
            <a href="#san-pham" className="hover:text-slate-900">
              Sản phẩm mẫu
            </a>
            <a href="#kho-phan-mem" className="hover:text-slate-900">
              Kho phần mềm
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-slate-900 cursor-pointer"
            >
              Quản trị
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
