import { ArrowRight, Clock, Download, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PostItem } from '../shared/types.ts';
import { MarkdownContent } from './MarkdownContent.tsx';
import { SafeImage } from './SafeImage.tsx';

interface PostDetailModalProps {
  post: PostItem | null;
  onClose: () => void;
  onRequestWebApp: (post: PostItem) => void;
  onDownloadTracked: (postId: string, newCount: number) => void;
}

export function PostDetailModal({
  post,
  onClose,
  onRequestWebApp,
  onDownloadTracked,
}: PostDetailModalProps) {
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [linkReady, setLinkReady] = useState(false);

  // Reset trạng thái tải mỗi khi mở bài viết khác
  useEffect(() => {
    setCountdown(null);
    setLinkReady(false);
    setDownloadMessage(null);
    setDownloading(false);
  }, [post?.id]);

  // Bộ đếm ngược 10 giây
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      void finalizeDownload();
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  if (!post) return null;

  const typeLabel =
    post.type === 'webapp'
      ? 'Giải pháp WebApp'
      : post.type === 'software'
        ? 'Tiện ích phần mềm'
        : 'Thủ thuật & Hướng dẫn';

  // Xác định đường dẫn Demo cho sản phẩm WebApp
  const demoHref = (() => {
    if (post.demoUrl && post.demoUrl.trim() !== '' && !post.demoUrl.startsWith('#')) {
      return post.demoUrl.trim();
    }
    if (post.downloadUrl && post.downloadUrl.trim() !== '' && post.downloadUrl !== '#') {
      return post.downloadUrl.trim();
    }
    const lowerTitle = post.title.toLowerCase();
    if (lowerTitle.includes('pos') || lowerTitle.includes('cà phê')) {
      return '/he-thong-pos-quan-ly/index.html';
    }
    if (lowerTitle.includes('thu chi') || lowerTitle.includes('công nợ')) {
      return '/quan-ly-thu-chi/index.html';
    }
    if (lowerTitle.includes('hợp đồng') || lowerTitle.includes('tài liệu')) {
      return '/demo-hop-dong/index.html';
    }
    return '';
  })();

  function startDownloadCountdown() {
    if (countdown !== null || downloading) return;
    if (linkReady && post?.downloadUrl && post.downloadUrl.startsWith('http')) {
      window.open(post.downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloadMessage(null);
    setLinkReady(false);
    setCountdown(10);
  }

  async function finalizeDownload() {
    if (!post) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/download`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { downloads: number };
        onDownloadTracked(post.id, data.downloads);
      }
      if (post.downloadUrl && post.downloadUrl.startsWith('http')) {
        setLinkReady(true);
        setDownloadMessage('Liên kết tải về tốc độ cao đã sẵn sàng!');
      } else {
        setDownloadMessage(
          'Bộ cài đặt đang được cung cấp qua bộ phận kỹ thuật. Vui lòng liên hệ Zalo 0376.449.393 hoặc để lại thông tin để nhận link tốc độ cao.',
        );
      }
    } catch {
      if (post.downloadUrl && post.downloadUrl.startsWith('http')) {
        setLinkReady(true);
        setDownloadMessage('Liên kết tải về đã sẵn sàng!');
      } else {
        setDownloadMessage('Không thể kết nối máy chủ ghi nhận lượt tải, vui lòng thử lại.');
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="text-xs text-slate-600 flex items-center gap-2 truncate">
            <span className="font-medium text-slate-900">{typeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{post.version}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer"
            aria-label="Đóng cửa sổ chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 space-y-6">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <SafeImage
              src={post.coverImage}
              alt={post.title}
              fallbackTitle={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2
              id="post-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance"
            >
              {post.title}
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{post.excerpt}</p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200 text-xs">
              <div>
                <div className="text-slate-500">Nền tảng</div>
                <div className="mt-1 font-medium text-slate-900">{post.platform}</div>
              </div>
              <div>
                <div className="text-slate-500">Phiên bản / Dung lượng</div>
                <div className="mt-1 font-medium text-slate-900 font-mono tabular-nums">
                  {post.version} · {post.fileSize}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Chi phí / Hình thức</div>
                <div className="mt-1 font-medium text-slate-900">{post.priceLabel}</div>
              </div>
              <div>
                <div className="text-slate-500">Lượt tải / Quan tâm</div>
                <div className="mt-1 font-medium text-slate-900 font-mono tabular-nums">
                  {post.downloads.toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          <MarkdownContent content={post.content} />

          {post.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
              Từ khóa: <span className="text-slate-700">{post.tags.join(' · ')}</span>
            </div>
          )}

          {countdown !== null && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  Hệ thống đang kiểm tra tệp tin và tạo liên kết tải trực tiếp, vui lòng chờ{' '}
                  <strong className="font-mono text-base text-amber-700">{countdown}s</strong>...
                </span>
              </div>
            </div>
          )}

          {downloadMessage && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-slate-800 flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium text-blue-900">{downloadMessage}</p>
              {linkReady && post.downloadUrl && post.downloadUrl.startsWith('http') && (
                <a
                  href={post.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống ngay
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Cập nhật: {new Date(post.updatedAt).toLocaleDateString('vi-VN')} · Tác giả: {post.author}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {post.type === 'webapp' ? (
              <>
                {demoHref && (
                  <a
                    href={demoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                    Chạy thử Demo
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onRequestWebApp(post)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Đăng ký thiết kế mẫu này
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={downloading || countdown !== null}
                onClick={startDownloadCountdown}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {countdown !== null ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Vui lòng chờ ({countdown}s)...
                  </>
                ) : downloading ? (
                  <>
                    <Download className="w-4 h-4" />
                    Đang tạo liên kết...
                  </>
                ) : linkReady ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Mở lại link tải về
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Tải tiện ích &amp; Hướng dẫn
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}