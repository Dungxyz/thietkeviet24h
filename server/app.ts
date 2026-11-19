import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import type { LeadStatus, McpJsonRpcRequest, PostStatus, PostType } from '../src/shared/types.ts';
import { getWellKnownMcpManifest, handleMcpJsonRpc, MCP_SERVER_INFO, MCP_TOOLS } from './mcp.ts';
import {
  createLead,
  createPost,
  deleteLead,
  deletePost,
  getAdminStats,
  getPostByIdOrSlug,
  incrementPostDownload,
  listLeads,
  listPosts,
  updateLeadStatus,
  updatePost,
} from './store.ts';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thietkeviet24h.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin24h';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'tkv24h-mcp-vercel-secret-key';

function signToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig !== expectedSig) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { exp?: number };
    return Boolean(parsed.exp && parsed.exp > Date.now());
  } catch {
    return false;
  }
}

function extractBearer(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7).trim();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn.' });
    return;
  }
  next();
}

async function sendZaloLeadNotification(lead: {
  fullName: string;
  phone: string;
  email?: string;
  serviceType: string;
  budget: string;
  message?: string;
}) {
  const botToken = (process.env.ZALO_BOT_TOKEN || '').trim();
  const chatId = (process.env.ZALO_CHAT_ID || '').trim();

  if (!botToken || !chatId) {
    return { sent: false, reason: 'missing_env' };
  }

  const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const textMessage = [
    '🔔 YÊU CẦU TƯ VẤN MỚI - THIẾT KẾ VIỆT 24H',
    `👤 Khách hàng: ${lead.fullName}`,
    `📞 SĐT / Zalo: ${lead.phone}`,
    lead.email ? `✉️ Email: ${lead.email}` : '',
    `🛠 Dịch vụ: ${lead.serviceType}`,
    `💰 Ngân sách: ${lead.budget}`,
    `📝 Nhu cầu: ${lead.message || 'Không có ghi chú thêm'}`,
    `⏰ Thời gian: ${timeStr}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const params = new URLSearchParams({
      chat_id: chatId,
      text: textMessage,
    });
    const url = `https://bot-api.zaloplatforms.com/bot${botToken}/sendMessage?${params.toString()}`;
    const zaloRes = await fetch(url, { method: 'GET' });
    const rawText = await zaloRes.text();
    if (!zaloRes.ok) {
      console.error('Zalo Bot API error:', zaloRes.status, rawText);
      return { sent: false, status: zaloRes.status, detail: rawText };
    }
    return { sent: true, detail: rawText };
  } catch (err) {
    console.error('Lỗi gửi thông báo Zalo Bot:', err);
    return { sent: false, reason: String(err) };
  }
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.use('/api', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.options('/api/*', (_req, res) => {
    res.status(204).end();
  });

  app.get('/api/health', (_req, res) => {
    const hasSupabase = Boolean(
      (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    );
    res.json({
      ok: true,
      service: 'thietkeviet24h',
      storage: hasSupabase ? 'supabase' : 'local-file',
      hasUrl: Boolean(process.env.SUPABASE_URL),
      hasKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasZaloBot: Boolean(process.env.ZALO_BOT_TOKEN && process.env.ZALO_CHAT_ID),
      mcp: MCP_SERVER_INFO,
    });
  });

  app.get('/.well-known/mcp.json', (req, res) => {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    res.json(getWellKnownMcpManifest(`${proto}://${host}`));
  });

  app.get('/api/mcp', (req, res) => {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    res.json({
      ...getWellKnownMcpManifest(`${proto}://${host}`),
      toolsDetail: MCP_TOOLS,
    });
  });

  app.post('/api/mcp', async (req, res) => {
    const mcpKey = process.env.MCP_API_KEY?.trim();
    const bearer = extractBearer(req);
    const isAuthorizedWrite = !mcpKey || bearer === mcpKey || verifyToken(bearer);
    const rpcReq = req.body as McpJsonRpcRequest;
    const rpcRes = await handleMcpJsonRpc(rpcReq, isAuthorizedWrite);
    res.json(rpcRes);
  });

  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = signToken(ADMIN_EMAIL);
      res.json({ ok: true, token, email: ADMIN_EMAIL });
      return;
    }
    res.status(401).json({ error: 'Email hoặc mật khẩu quản trị không chính xác.' });
  });

  app.get('/api/admin/verify', (req, res) => {
    const token = extractBearer(req);
    if (!verifyToken(token)) {
      res.status(401).json({ ok: false });
      return;
    }
    res.json({ ok: true, email: ADMIN_EMAIL });
  });

  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    const stats = await getAdminStats();
    res.json(stats);
  });

  app.get('/api/posts', async (req, res) => {
    const type = (req.query.type as PostType | 'all') || 'all';
    const category = (req.query.category as string) || 'all';
    const q = (req.query.q as string) || '';
    const isAdmin = verifyToken(extractBearer(req));
    const requestedStatus = (req.query.status as PostStatus | 'all') || 'published';
    const effectiveStatus = isAdmin ? requestedStatus : 'published';

    const items = await listPosts({
      type,
      category,
      status: effectiveStatus,
      q,
    });
    res.json({ posts: items });
  });

  app.get('/api/posts/:idOrSlug', async (req, res) => {
    const post = await getPostByIdOrSlug(req.params.idOrSlug);
    if (!post) {
      res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      return;
    }
    if (post.status !== 'published' && !verifyToken(extractBearer(req))) {
      res.status(404).json({ error: 'Bài viết chưa được xuất bản.' });
      return;
    }
    res.json({ post });
  });

  app.post('/api/posts', requireAdmin, async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const title = String(body.title ?? '').trim();
    const excerpt = String(body.excerpt ?? '').trim();
    const content = String(body.content ?? '').trim();

    if (!title || !excerpt || !content) {
      res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề, tóm tắt và nội dung bài viết.' });
      return;
    }

    const post = await createPost({
      title,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      type: (body.type as PostType) || 'software',
      category: String(body.category ?? 'Văn phòng & Tiện ích'),
      status: (body.status as PostStatus) || 'published',
      excerpt,
      content,
      coverImage: String(body.coverImage ?? '/src/assets/images/software_utilities_cover_1794972111702.jpg'),
      version: String(body.version ?? '2026.1'),
      platform: String(body.platform ?? 'Windows 10/11'),
      fileSize: String(body.fileSize ?? 'Đang cập nhật'),
      downloadUrl: String(body.downloadUrl ?? ''),
      demoUrl: String(body.demoUrl ?? ''),
      priceLabel: String(body.priceLabel ?? 'Miễn phí chia sẻ'),
      tags: Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(body.tags ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
      featured: Boolean(body.featured),
      author: String(body.author ?? 'Thiết Kế Việt 24h'),
    });

    res.status(201).json({ post });
  });

  app.put('/api/posts/:id', requireAdmin, async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { ...body };
    if (typeof body.tags === 'string') {
      patch.tags = body.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const updated = await updatePost(req.params.id, patch);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy bài viết cần cập nhật.' });
      return;
    }
    res.json({ post: updated });
  });

  app.delete('/api/posts/:id', requireAdmin, async (req, res) => {
    const ok = await deletePost(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Không tìm thấy bài viết cần xóa.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/posts/:id/download', async (req, res) => {
    const updated = await incrementPostDownload(req.params.id);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      return;
    }
    res.json({ downloads: updated.downloads });
  });

  app.post('/api/upload-image', requireAdmin, async (req, res) => {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      res.status(400).json({ error: 'Chưa cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trên server.' });
      return;
    }

    const { dataUrl, fileName } = req.body as { dataUrl?: string; fileName?: string };
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Dữ liệu hình ảnh không hợp lệ.' });
      return;
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Không thể giải mã định dạng ảnh.' });
      return;
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const cleanBase = (fileName || 'cover')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'cover';
    const objectPath = `covers/${Date.now()}-${cleanBase}.${ext}`;

    try {
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/images/${objectPath}`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true',
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        res.status(500).json({ error: `Lỗi tải lên Supabase Storage (${uploadRes.status}): ${errText}` });
        return;
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${objectPath}`;
      res.json({ url: publicUrl });
    } catch {
      res.status(500).json({ error: 'Lỗi kết nối tới Supabase Storage.' });
    }
  });

  app.get('/api/leads', requireAdmin, async (_req, res) => {
    const leads = await listLeads();
    res.json({ leads });
  });

  app.post('/api/leads', async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const fullName = String(body.fullName ?? '').trim();
      const phone = String(body.phone ?? '').trim();
      const email = String(body.email ?? '').trim();
      const serviceType = String(body.serviceType ?? 'Thiết kế WebApp theo yêu cầu').trim();
      const budget = String(body.budget ?? 'Theo tư vấn').trim();
      const message = String(body.message ?? '').trim();

      if (!fullName || !phone) {
        res.status(400).json({ error: 'Vui lòng nhập họ tên và số điện thoại liên hệ.' });
        return;
      }

      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 9 || phoneDigits.length > 12) {
        res.status(400).json({ error: 'Số điện thoại không hợp lệ (cần từ 9 đến 12 chữ số).' });
        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Định dạng email không hợp lệ.' });
        return;
      }

      const lead = await createLead({ fullName, phone, email, serviceType, budget, message });

      const zaloStatus = await sendZaloLeadNotification({
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        serviceType: lead.serviceType,
        budget: lead.budget,
        message: lead.message,
      });

      res.status(201).json({ lead, zaloStatus });
    } catch (err) {
      console.error('POST /api/leads error:', err);
      res.status(500).json({ error: 'Lỗi xử lý lưu dữ liệu trên máy chủ.' });
    }
  });

  app.patch('/api/leads/:id', requireAdmin, async (req, res) => {
    const status = req.body?.status as LeadStatus;
    if (!['new', 'consulting', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
      return;
    }
    const updated = await updateLeadStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy yêu cầu tư vấn.' });
      return;
    }
    res.json({ lead: updated });
  });

  app.delete('/api/leads/:id', requireAdmin, async (req, res) => {
    const ok = await deleteLead(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Không tìm thấy yêu cầu.' });
      return;
    }
    res.json({ ok: true });
  });

  return app;
}