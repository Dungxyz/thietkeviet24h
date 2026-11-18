import {
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ASSET_IMAGES } from '../shared/seedData.ts';
import type { AdminStats, LeadItem, LeadStatus, PostItem, PostStatus, PostType } from '../shared/types.ts';
import { MarkdownContent } from './MarkdownContent.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { SafeImage } from './SafeImage.tsx';

interface AdminDashboardProps {
  onPostsChanged: () => void;
  onBackHome: () => void;
  onPreviewPost: (post: PostItem) => void;
}

type AdminTab = 'overview' | 'posts' | 'editor' | 'leads';

const TOKEN_STORAGE_KEY = 'tkv24h_admin_token';

const COVER_PRESETS = [
  { label: 'Không gian WebApp Studio', url: ASSET_IMAGES.heroStudio },
  { label: 'WebApp Tài chính / Google Sheets', url: ASSET_IMAGES.financeShowcase },
  { label: 'Hệ thống POS Bán hàng', url: ASSET_IMAGES.posShowcase },
  { label: 'Kho phần mềm & Công cụ CAD', url: ASSET_IMAGES.softwareUtilities },
];

const CATEGORY_PRESETS = [
  'Đồ họa & Thiết kế',
  'Kỹ thuật & CAD',
  'Văn phòng & Tiện ích',
  'Thủ thuật WebApp',
  'Tài chính & Kế toán nội bộ',
  'F&B & Bán lẻ',
  'Vận hành Doanh nghiệp',
];

function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AdminDashboard({ onPostsChanged, onBackHome, onPreviewPost }: AdminDashboardProps) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [checkingAuth, setCheckingAuth] = useState<boolean>(Boolean(token));

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filters
  const [postSearch, setPostSearch] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<PostType | 'all'>('all');
  const [postStatusFilter, setPostStatusFilter] = useState<PostStatus | 'all'>('all');

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<PostType>('software');
  const [category, setCategory] = useState('Đồ họa & Thiết kế');
  const [status, setStatus] = useState<PostStatus>('published');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>(ASSET_IMAGES.softwareUtilities);
  const [version, setVersion] = useState('2026.1');
  const [platform, setPlatform] = useState('Windows 10/11 (64-bit)');
  const [fileSize, setFileSize] = useState('1.5 GB');
  const [priceLabel, setPriceLabel] = useState('Miễn phí chia sẻ');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [author, setAuthor] = useState('Thiết Kế Việt 24h');
  const [editorPreview, setEditorPreview] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [editorNotice, setEditorNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : undefined),
    [token],
  );

  async function compressImageToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('File ảnh bị lỗi'));
        img.onload = () => {
          const maxWidth = 1280;
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(reader.result));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const outMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outMime, 0.84));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !authHeaders) return;

    setUploadingCover(true);
    setEditorNotice(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ dataUrl, fileName: file.name }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setEditorNotice({ kind: 'err', text: data.error || 'Tải ảnh thất bại.' });
        return;
      }
      setCoverImage(data.url);
      setEditorNotice({ kind: 'ok', text: 'Đã tải ảnh lên Supabase Storage thành công.' });
    } catch {
      setEditorNotice({ kind: 'err', text: 'Không thể xử lý hoặc tải file ảnh lên máy chủ.' });
    } finally {
      setUploadingCover(false);
    }
  }

  const loadAdminData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, postsRes, leadsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/posts?status=all', { headers }),
        fetch('/api/leads', { headers }),
      ]);

      if (statsRes.status === 401 || postsRes.status === 401) {
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return;
      }

      if (statsRes.ok) setStats((await statsRes.json()) as AdminStats);
      if (postsRes.ok) {
        const d = (await postsRes.json()) as { posts: PostItem[] };
        setPosts(d.posts);
      }
      if (leadsRes.ok) {
        const d = (await leadsRes.json()) as { leads: LeadItem[] };
        setLeads(d.leads);
      }
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          setToken(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [token]);

  useEffect(() => {
    if (token && !checkingAuth) {
      loadAdminData();
    }
  }, [token, checkingAuth, loadAdminData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setLoginError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
    } catch {
      setLoginError('Không thể kết nối máy chủ xác thực.');
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }

  function resetEditorForNew(defaultType: PostType = 'software') {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSlugTouched(false);
    setType(defaultType);
    setCategory(defaultType === 'webapp' ? 'Tài chính & Kế toán nội bộ' : 'Đồ họa & Thiết kế');
    setStatus('published');
    setExcerpt('');
    setContent(`## Giới thiệu chi tiết

Mô tả tính năng nổi bật hoặc điểm cải tiến của phiên bản này.

### Hướng dẫn cài đặt / triển khai
1. Bước thứ nhất...
2. Bước thứ hai...`);
    setCoverImage(
      defaultType === 'webapp' ? ASSET_IMAGES.financeShowcase : ASSET_IMAGES.softwareUtilities,
    );
    setVersion('2026.1');
    setPlatform(defaultType === 'webapp' ? 'WebApp · Desktop & Mobile' : 'Windows 10/11 (64-bit)');
    setFileSize(defaultType === 'webapp' ? 'Triển khai trọn gói' : '2.4 GB');
    setPriceLabel(defaultType === 'webapp' ? 'Liên hệ báo giá' : 'Miễn phí chia sẻ');
    setDownloadUrl('');
    setDemoUrl('');
    setTagsText('');
    setAuthor('Thiết Kế Việt 24h');
    setEditorPreview(false);
    setEditorNotice(null);
    setActiveTab('editor');
  }

  function startEditingPost(post: PostItem) {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setSlugTouched(true);
    setType(post.type);
    setCategory(post.category);
    setStatus(post.status);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCoverImage(post.coverImage);
    setVersion(post.version);
    setPlatform(post.platform);
    setFileSize(post.fileSize);
    setPriceLabel(post.priceLabel);
    setDownloadUrl(post.downloadUrl);
    setDemoUrl(post.demoUrl);
    setTagsText(post.tags.join(', '));
    setAuthor(post.author);
    setEditorPreview(false);
    setEditorNotice(null);
    setActiveTab('editor');
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!authHeaders) return;
    setEditorNotice(null);

    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setEditorNotice({
        kind: 'err',
        text: 'Vui lòng điền đầy đủ Tiêu đề, Tóm tắt ngắn và Nội dung chi tiết.',
      });
      return;
    }

    setSavingPost(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugifyClient(title),
        type,
        category: category.trim(),
        status,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || ASSET_IMAGES.softwareUtilities,
        version: version.trim() || '2026.1',
        platform: platform.trim() || 'Windows / Web',
        fileSize: fileSize.trim() || 'Đang cập nhật',
        priceLabel: priceLabel.trim() || 'Miễn phí chia sẻ',
        downloadUrl: downloadUrl.trim(),
        demoUrl: demoUrl.trim(),
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        author: author.trim() || 'Thiết Kế Việt 24h',
      };

      const url = editingId ? `/api/posts/${editingId}` : '/api/posts';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; post?: PostItem };
      if (!res.ok || !data.post) {
        setEditorNotice({ kind: 'err', text: data.error || 'Không thể lưu bài viết.' });
        return;
      }

      setEditingId(data.post.id);
      setEditorNotice({
        kind: 'ok',
        text: editingId
          ? 'Đã cập nhật bài viết thành công và đồng bộ lên trang chủ.'
          : 'Đã đăng bài viết mới thành công.',
      });
      await loadAdminData();
      onPostsChanged();
    } catch {
      setEditorNotice({ kind: 'err', text: 'Lỗi kết nối khi lưu bài viết.' });
    } finally {
      setSavingPost(false);
    }
  }

  async function handleTogglePublish(post: PostItem) {
    if (!authHeaders) return;
    const nextStatus: PostStatus = post.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadAdminData();
      onPostsChanged();
    }
  }

  async function handleDeletePost(id: string) {
    if (!authHeaders) return;
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) {
      setConfirmDeleteId(null);
      await loadAdminData();
      onPostsChanged();
    }
  }

  async function handleLeadStatusChange(id: string, nextStatus: LeadStatus) {
    if (!authHeaders) return;
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadAdminData();
    }
  }

  async function handleDeleteLead(id: string) {
    if (!authHeaders) return;
    const res = await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) {
      await loadAdminData();
    }
  }

  function insertMarkdownSnippet(snippet: string) {
    setContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (postTypeFilter !== 'all' && p.type !== postTypeFilter) return false;
      if (postStatusFilter !== 'all' && p.status !== postStatusFilter) return false;
      if (postSearch.trim()) {
        const q = postSearch.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, postTypeFilter, postStatusFilter, postSearch]);

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm text-slate-600">
        Đang kiểm tra phiên đăng nhập quản trị...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[82vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="mb-4">
              <BrandLogo size="md" showText={false} />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Đăng nhập Trang Quản trị
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Quản lý bài viết WebApp, kho phần mềm và phản hồi tư vấn khách hàng.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email quản trị
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@thietkeviet24h.vn"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {loggingIn ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Mặc định: <span className="font-mono text-slate-700">admin@thietkeviet24h.vn</span> /{' '}
              <span className="font-mono text-slate-700">admin24h</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@thietkeviet24h.vn');
                setLoginPassword('admin24h');
              }}
              className="text-blue-700 font-medium hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Điền nhanh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbLabel: Record<AdminTab, string> = {
    overview: 'Tổng quan hệ thống',
    posts: 'Danh sách bài viết & phần mềm',
    editor: editingId ? 'Chỉnh sửa bài viết' : 'Đăng bài viết mới',
    leads: 'Hộp thư yêu cầu tư vấn',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-slate-500">
            Quản trị Thiết Kế Việt 24h
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2.5 truncate">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Quản lý bài viết</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500">{posts.length}</span>
          </button>

          <button
            type="button"
            onClick={() => resetEditorForNew('software')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Đăng bài mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2.5 truncate">
              <Inbox className="w-4 h-4 shrink-0" />
              <span className="truncate">Yêu cầu tư vấn</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500">{leads.length}</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 space-y-1">
          <button
            type="button"
            onClick={onBackHome}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>Xem trang công khai</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span>Quản trị</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900">{breadcrumbLabel[activeTab]}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => resetEditorForNew('webapp')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Thêm mẫu WebApp
            </button>
            <button
              type="button"
              onClick={() => resetEditorForNew('software')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Đăng phần mềm mới
            </button>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Tổng bài viết</div>
                  <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {stats?.totalPosts ?? posts.length}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 tabular-nums">
                    {stats?.publishedPosts ?? 0} đã xuất bản · {stats?.draftPosts ?? 0} nháp
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Tổng lượt tải tiện ích</div>
                  <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {(stats?.totalDownloads ?? 0).toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Ghi nhận qua API thực tế</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Yêu cầu tư vấn</div>
                  <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {stats?.totalLeads ?? leads.length}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 tabular-nums">
                    {stats?.newLeads ?? 0} yêu cầu mới chưa xử lý
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Mẫu WebApp dịch vụ</div>
                  <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {posts.filter((p) => p.type === 'webapp').length}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Đang hiển thị trên trang chủ</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Bài viết cập nhật gần đây
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 font-medium">Tiêu đề</th>
                        <th className="py-3 px-4 font-medium">Phân loại</th>
                        <th className="py-3 px-4 font-medium">Trạng thái</th>
                        <th className="py-3 px-4 font-medium text-right">Lượt tải</th>
                        <th className="py-3 px-6 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posts.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-6 font-medium text-slate-900 max-w-xs truncate">
                            {p.title}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">{p.category}</td>
                          <td className="py-3 px-4 text-xs">
                            <span
                              className={
                                p.status === 'published' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'
                              }
                            >
                              {p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-700">
                            {p.downloads.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => startEditingPost(p)}
                              className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                            >
                              Chỉnh sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Tab: Posts Manager */}
          {activeTab === 'posts' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    placeholder="Tìm theo tiêu đề, slug..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={postTypeFilter}
                    onChange={(e) => setPostTypeFilter(e.target.value as PostType | 'all')}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="all">Tất cả loại bài</option>
                    <option value="software">Tiện ích phần mềm</option>
                    <option value="webapp">Mẫu WebApp</option>
                    <option value="tutorial">Thủ thuật &amp; Hướng dẫn</option>
                  </select>
                  <select
                    value={postStatusFilter}
                    onChange={(e) => setPostStatusFilter(e.target.value as PostStatus | 'all')}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="all">Mọi trạng thái</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </div>
              </div>

              {loadingData ? (
                <div className="p-8 text-center text-sm text-slate-500">Đang tải danh sách...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-sm text-slate-600">Không có bài viết nào phù hợp.</p>
                  <button
                    type="button"
                    onClick={() => resetEditorForNew('software')}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg cursor-pointer"
                  >
                    Đăng bài viết đầu tiên
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 font-medium">Bài viết</th>
                        <th className="py-3 px-4 font-medium">Loại / Chuyên mục</th>
                        <th className="py-3 px-4 font-medium">Phiên bản</th>
                        <th className="py-3 px-4 font-medium">Trạng thái</th>
                        <th className="py-3 px-4 font-medium text-right">Lượt tải</th>
                        <th className="py-3 px-6 font-medium text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPosts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-6 max-w-sm">
                            <div className="font-medium text-slate-900 truncate">{p.title}</div>
                            <div className="text-xs text-slate-500 font-mono truncate">/{p.slug}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            <div className="font-medium text-slate-800">
                              {p.type === 'webapp'
                                ? 'WebApp'
                                : p.type === 'software'
                                  ? 'Phần mềm'
                                  : 'Thủ thuật'}
                            </div>
                            <div>{p.category}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-slate-700">
                            {p.version}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(p)}
                              className={`font-medium hover:underline cursor-pointer ${
                                p.status === 'published' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs font-mono tabular-nums text-slate-700">
                            {p.downloads.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="inline-flex items-center gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() => onPreviewPost(p)}
                                className="text-slate-600 hover:text-slate-900 cursor-pointer"
                                title="Xem trước"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditingPost(p)}
                                className="text-blue-700 hover:text-blue-800 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {confirmDeleteId === p.id ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(p.id)}
                                    className="text-red-700 font-semibold hover:underline cursor-pointer"
                                  >
                                    Xác nhận xóa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-slate-500 hover:underline cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(p.id)}
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                  title="Xóa bài viết"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Full Post Editor */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {editingId ? 'Chỉnh sửa nội dung bài viết' : 'Soạn thảo bài viết mới'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorPreview((prev) => !prev)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {editorPreview ? 'Quay lại trình soạn' : 'Xem trước nội dung'}
                    </button>
                    <button
                      type="submit"
                      disabled={savingPost}
                      className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                    >
                      {savingPost
                        ? 'Đang lưu...'
                        : editingId
                          ? 'Cập nhật bài viết'
                          : 'Xuất bản bài viết'}
                    </button>
                  </div>
                </div>

                {editorNotice && (
                  <div
                    className={`p-3.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                      editorNotice.kind === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {editorNotice.kind === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <span>{editorNotice.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <label htmlFor="post-title" className="block text-xs font-medium text-slate-700 mb-1.5">
                        Tiêu đề bài viết *
                      </label>
                      <input
                        id="post-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTitle(val);
                          if (!slugTouched) setSlug(slugifyClient(val));
                        }}
                        placeholder="Ví dụ: Adobe Premiere Pro 2025 — Hướng dẫn cài đặt & Tối ưu Render"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="post-slug" className="block text-xs font-medium text-slate-700 mb-1.5">
                          Đường dẫn tĩnh (Slug)
                        </label>
                        <input
                          id="post-slug"
                          type="text"
                          value={slug}
                          onChange={(e) => {
                            setSlugTouched(true);
                            setSlug(e.target.value);
                          }}
                          placeholder="tu-dong-tao-tu-tieu-de"
                          className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="post-tags" className="block text-xs font-medium text-slate-700 mb-1.5">
                          Từ khóa SEO / MCP (cách nhau dấu phẩy)
                        </label>
                        <input
                          id="post-tags"
                          type="text"
                          value={tagsText}
                          onChange={(e) => setTagsText(e.target.value)}
                          placeholder="Photoshop, Đồ họa, Windows 11"
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="post-excerpt" className="block text-xs font-medium text-slate-700 mb-1.5">
                        Mô tả tóm tắt (hiển thị ngoài thẻ danh sách) *
                      </label>
                      <textarea
                        id="post-excerpt"
                        rows={2}
                        required
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Mô tả ngắn gọn 1–2 câu về tính năng hoặc lợi ích chính..."
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <label htmlFor="post-content" className="text-xs font-medium text-slate-700">
                          Nội dung chi tiết (Markdown) *
                        </label>
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('## Tiêu đề mục')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('### Mục nhỏ')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('- **Điểm nổi bật**: Nội dung mô tả')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            Danh sách
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('1. Bước thực hiện đầu tiên')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            Các bước
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertMarkdownSnippet('```javascript\n// Đoạn mã cấu hình mẫu\n```')
                            }
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            Khối mã
                          </button>
                        </div>
                      </div>

                      {editorPreview ? (
                        <div className="min-h-[300px] p-5 rounded-lg border border-slate-200 bg-slate-50">
                          <MarkdownContent content={content || 'Chưa có nội dung.'} />
                        </div>
                      ) : (
                        <textarea
                          id="post-content"
                          rows={13}
                          required
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full px-3.5 py-3 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 leading-relaxed"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right Sidebar Metadata */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                      <div>
                        <label htmlFor="post-type" className="block text-xs font-medium text-slate-700 mb-1.5">
                          Loại nội dung
                        </label>
                        <select
                          id="post-type"
                          value={type}
                          onChange={(e) => setType(e.target.value as PostType)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="software">Tiện ích phần mềm</option>
                          <option value="webapp">Mẫu WebApp dịch vụ</option>
                          <option value="tutorial">Thủ thuật &amp; Hướng dẫn</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="post-cat" className="block text-xs font-medium text-slate-700 mb-1.5">
                          Chuyên mục
                        </label>
                        <select
                          id="post-cat"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        >
                          {CATEGORY_PRESETS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="post-status" className="block text-xs font-medium text-slate-700 mb-1.5">
                          Trạng thái xuất bản
                        </label>
                        <select
                          id="post-status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value as PostStatus)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="published">Xuất bản công khai</option>
                          <option value="draft">Lưu bản nháp</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="post-ver" className="block text-xs font-medium text-slate-700 mb-1">
                            Phiên bản
                          </label>
                          <input
                            id="post-ver"
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label htmlFor="post-size" className="block text-xs font-medium text-slate-700 mb-1">
                            Dung lượng
                          </label>
                          <input
                            id="post-size"
                            type="text"
                            value={fileSize}
                            onChange={(e) => setFileSize(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="post-platform" className="block text-xs font-medium text-slate-700 mb-1">
                          Nền tảng hỗ trợ
                        </label>
                        <input
                          id="post-platform"
                          type="text"
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label htmlFor="post-price" className="block text-xs font-medium text-slate-700 mb-1">
                          Chi phí / Hình thức
                        </label>
                        <input
                          id="post-price"
                          type="text"
                          value={priceLabel}
                          onChange={(e) => setPriceLabel(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label htmlFor="post-dl" className="block text-xs font-medium text-slate-700 mb-1">
                          Liên kết tải về (Google Drive / GitHub)
                        </label>
                        <input
                          id="post-dl"
                          type="url"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label htmlFor="post-demo" className="block text-xs font-medium text-slate-700 mb-1">
                          Đường dẫn chạy thử Demo (WebApp)
                        </label>
                        <input
                          id="post-demo"
                          type="text"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="/he-thong-pos-quan-ly/index.html hoặc https://..."
                          className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="post-cover" className="block text-xs font-medium text-slate-700">
                          Ảnh đại diện bài viết
                        </label>
                        <label
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            uploadingCover
                              ? 'bg-slate-200 text-slate-500 pointer-events-none'
                              : 'bg-blue-700 hover:bg-blue-800 text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingCover ? 'Đang tải lên...' : 'Tải ảnh từ máy'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleCoverFileChange}
                            className="hidden"
                            disabled={uploadingCover}
                          />
                        </label>
                      </div>

                      <select
                        aria-label="Chọn ảnh mẫu có sẵn"
                        value={COVER_PRESETS.some((c) => c.url === coverImage) ? coverImage : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') setCoverImage(e.target.value);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        {COVER_PRESETS.map((preset) => (
                          <option key={preset.url} value={preset.url}>
                            {preset.label}
                          </option>
                        ))}
                        <option value="custom">Ảnh tải lên / Đường dẫn tùy chỉnh</option>
                      </select>

                      <input
                        id="post-cover"
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://... hoặc chọn nút Tải ảnh từ máy"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                      />

                      <div className="aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <SafeImage
                          src={coverImage}
                          alt={title || 'Xem trước ảnh đại diện'}
                          fallbackTitle={title || 'Xem trước ảnh bài viết'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Tab: Leads Inbox */}
          {activeTab === 'leads' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Danh sách khách hàng đăng ký tư vấn ({leads.length})
                </h2>
              </div>

              {leads.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Chưa có yêu cầu tư vấn nào được gửi.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 font-medium">Khách hàng</th>
                        <th className="py-3 px-4 font-medium">Dịch vụ &amp; Nhu cầu</th>
                        <th className="py-3 px-4 font-medium">Ngân sách</th>
                        <th className="py-3 px-4 font-medium">Trạng thái</th>
                        <th className="py-3 px-6 font-medium text-right">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/70 align-top">
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-900">{lead.fullName}</div>
                            <div className="text-xs font-mono text-slate-600 mt-0.5">{lead.phone}</div>
                            {lead.email && <div className="text-xs text-slate-500">{lead.email}</div>}
                          </td>
                          <td className="py-4 px-4 max-w-md">
                            <div className="text-xs font-semibold text-slate-800">{lead.serviceType}</div>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {lead.message || 'Không có ghi chú thêm.'}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap">
                            {lead.budget}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              aria-label={`Trạng thái xử lý của ${lead.fullName}`}
                              value={lead.status}
                              onChange={(e) =>
                                handleLeadStatusChange(lead.id, e.target.value as LeadStatus)
                              }
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                            >
                              <option value="new">Mới tiếp nhận</option>
                              <option value="consulting">Đang tư vấn</option>
                              <option value="completed">Đã hoàn thành</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                              title="Xóa yêu cầu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}