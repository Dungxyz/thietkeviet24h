import { ArrowRight, Download, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
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

  if (!post) return null;

  const typeLabel =
    post.type === 'webapp'
      ? 'Giải pháp WebApp'
      : post.type === 'software'
        ? 'Tiện ích phần mềm'
        : 'Thủ thuật & Hướng dẫn';

  async function handleDownload() {
    if (!post) return;
    setDownloading(true);
    setDownloadMessage(null);
    try {
      const res = await fetch(`/api/posts/${post.id}/download`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { downloads: number };
        onDownloadTracked(post.id, data.downloads);
      }
      if (post.downloadUrl && post.downloadUrl.startsWith('http')) {
        setDownloadMessage(`Đã ghi nhận lượt tải. Liên kết tải trực tiếp: ${post.downloadUrl}`);
      } else {
        setDownloadMessage(
          'Bộ cài đặt đang được cung cấp qua bộ phận kỹ thuật. Vui lòng liên hệ Zalo 0376.449.393 hoặc để lại thông tin để nhận link tốc độ cao.',
        );
      }
    } catch {
      setDownloadMessage('Không thể kết nối máy chủ ghi nhận lượt tải, vui lòng thử lại.');
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
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700"
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

          {downloadMessage && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-blue-900">{downloadMessage}</p>
                {post.downloadUrl && post.downloadUrl.startsWith('http') && (
                  <a
                    href={post.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-700 font-medium hover:underline"
                  >
                    Mở liên kết tải trong tab mới
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Cập nhật: {new Date(post.updatedAt).toLocaleDateString('vi-VN')} · Tác giả: {post.author}
          </div>
          <div className="flex items-center gap-3">
            {post.type === 'webapp' ? (
              <button
                type="button"
                onClick={() => onRequestWebApp(post)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Đăng ký thiết kế mẫu này
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={downloading}
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Đang xử lý...' : 'Tải tiện ích & Hướng dẫn'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
