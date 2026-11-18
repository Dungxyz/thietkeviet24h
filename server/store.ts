import fs from 'fs';
import path from 'path';
import { INITIAL_LEADS, INITIAL_POSTS } from '../src/shared/seedData.ts';
import type { AdminStats, LeadItem, LeadStatus, PostItem, PostStatus, PostType } from '../src/shared/types.ts';

interface DatabaseState {
  posts: PostItem[];
  leads: LeadItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let localMemoryStore: DatabaseState | null = null;
let supabaseSeededChecked = false;

function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function cloneSeed(): DatabaseState {
  return {
    posts: JSON.parse(JSON.stringify(INITIAL_POSTS)) as PostItem[],
    leads: JSON.parse(JSON.stringify(INITIAL_LEADS)) as LeadItem[],
  };
}

// Chuyển đổi snake_case (Postgres) <-> camelCase (TypeScript)
function rowToPost(row: Record<string, unknown>): PostItem {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    type: (row.type as PostType) || 'software',
    category: String(row.category ?? ''),
    status: (row.status as PostStatus) || 'published',
    excerpt: String(row.excerpt ?? ''),
    content: String(row.content ?? ''),
    coverImage: String(row.cover_image ?? ''),
    version: String(row.version ?? ''),
    platform: String(row.platform ?? ''),
    fileSize: String(row.file_size ?? ''),
    downloadUrl: String(row.download_url ?? ''),
    demoUrl: String(row.demo_url ?? ''),
    priceLabel: String(row.price_label ?? ''),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    downloads: Number(row.downloads ?? 0),
    featured: Boolean(row.featured),
    author: String(row.author ?? 'Thiết Kế Việt 24h'),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function postToRow(post: Partial<PostItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (post.id !== undefined) row.id = post.id;
  if (post.title !== undefined) row.title = post.title;
  if (post.slug !== undefined) row.slug = post.slug;
  if (post.type !== undefined) row.type = post.type;
  if (post.category !== undefined) row.category = post.category;
  if (post.status !== undefined) row.status = post.status;
  if (post.excerpt !== undefined) row.excerpt = post.excerpt;
  if (post.content !== undefined) row.content = post.content;
  if (post.coverImage !== undefined) row.cover_image = post.coverImage;
  if (post.version !== undefined) row.version = post.version;
  if (post.platform !== undefined) row.platform = post.platform;
  if (post.fileSize !== undefined) row.file_size = post.fileSize;
  if (post.downloadUrl !== undefined) row.download_url = post.downloadUrl;
  if (post.demoUrl !== undefined) row.demo_url = post.demoUrl;
  if (post.priceLabel !== undefined) row.price_label = post.priceLabel;
  if (post.tags !== undefined) row.tags = post.tags;
  if (post.downloads !== undefined) row.downloads = post.downloads;
  if (post.featured !== undefined) row.featured = post.featured;
  if (post.author !== undefined) row.author = post.author;
  if (post.createdAt !== undefined) row.created_at = post.createdAt;
  if (post.updatedAt !== undefined) row.updated_at = post.updatedAt;
  return row;
}

function rowToLead(row: Record<string, unknown>): LeadItem {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    serviceType: String(row.service_type ?? ''),
    budget: String(row.budget ?? ''),
    message: String(row.message ?? ''),
    status: (row.status as LeadStatus) || 'new',
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function leadToRow(lead: LeadItem): Record<string, unknown> {
  return {
    id: lead.id,
    full_name: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    service_type: lead.serviceType,
    budget: lead.budget,
    message: lead.message,
    status: lead.status,
    created_at: lead.createdAt,
  };
}

async function sbFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase REST error (${res.status}): ${errText}`);
  }
  return res;
}

async function ensureSupabaseSeeded(): Promise<void> {
  if (!isSupabaseConfigured() || supabaseSeededChecked) return;
  try {
    const res = await sbFetch('posts?select=id&limit=1');
    const existing = (await res.json()) as unknown[];
    if (Array.isArray(existing) && existing.length === 0) {
      const seed = cloneSeed();
      if (seed.posts.length > 0) {
        await sbFetch('posts', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(seed.posts.map(postToRow)),
        });
      }
      if (seed.leads.length > 0) {
        await sbFetch('leads', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(seed.leads.map(leadToRow)),
        });
      }
    }
    supabaseSeededChecked = true;
  } catch (err) {
    console.error('Supabase seed check error:', err);
  }
}

// Local file fallback (chỉ dùng khi chạy dev dưới máy chưa gắn Supabase)
function readLocalDb(): DatabaseState {
  if (localMemoryStore) return localMemoryStore;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseState>;
      localMemoryStore = {
        posts: Array.isArray(parsed.posts) ? parsed.posts : cloneSeed().posts,
        leads: Array.isArray(parsed.leads) ? parsed.leads : cloneSeed().leads,
      };
      return localMemoryStore;
    }
  } catch {
    // Fallback
  }
  localMemoryStore = cloneSeed();
  persistLocalDb(localMemoryStore);
  return localMemoryStore;
}

function persistLocalDb(state: DatabaseState): void {
  localMemoryStore = state;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Ignore on read-only FS
  }
}

export function slugifyVi(input: string): string {
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

export async function listPosts(filters?: {
  type?: PostType | 'all';
  category?: string;
  status?: PostStatus | 'all';
  q?: string;
}): Promise<PostItem[]> {
  let items: PostItem[];

  if (isSupabaseConfigured()) {
    await ensureSupabaseSeeded();
    const res = await sbFetch('posts?select=*&order=updated_at.desc');
    const rows = (await res.json()) as Record<string, unknown>[];
    items = rows.map(rowToPost);
  } else {
    items = [...readLocalDb().posts];
  }

  if (filters?.type && filters.type !== 'all') {
    items = items.filter((p) => p.type === filters.type);
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((p) => p.status === filters.status);
  }
  if (filters?.category && filters.category !== 'Tất cả' && filters.category !== 'all') {
    items = items.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.q && filters.q.trim()) {
    const query = filters.q.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }

  return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getPostByIdOrSlug(idOrSlug: string): Promise<PostItem | undefined> {
  if (isSupabaseConfigured()) {
    await ensureSupabaseSeeded();
    const encoded = encodeURIComponent(idOrSlug);
    const res = await sbFetch(`posts?or=(id.eq.${encoded},slug.eq.${encoded})&limit=1`);
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows[0] ? rowToPost(rows[0]) : undefined;
  }
  return readLocalDb().posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function createPost(
  payload: Omit<PostItem, 'id' | 'downloads' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string },
): Promise<PostItem> {
  const now = new Date().toISOString();
  const baseSlug = slugifyVi(payload.slug?.trim() || payload.title) || `bai-viet-${Date.now()}`;
  const existingPosts = await listPosts();
  const uniqueSlug = existingPosts.some((p) => p.slug === baseSlug)
    ? `${baseSlug}-${Date.now().toString().slice(-4)}`
    : baseSlug;

  const newPost: PostItem = {
    ...payload,
    id: `post-${Date.now()}`,
    slug: uniqueSlug,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const res = await sbFetch('posts', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(postToRow(newPost)),
    });
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows[0] ? rowToPost(rows[0]) : newPost;
  }

  const db = readLocalDb();
  db.posts.unshift(newPost);
  persistLocalDb(db);
  return newPost;
}

export async function updatePost(id: string, patch: Partial<PostItem>): Promise<PostItem | null> {
  const existing = await getPostByIdOrSlug(id);
  if (!existing) return null;

  const updated: PostItem = {
    ...existing,
    ...patch,
    id: existing.id,
    slug: patch.slug ? slugifyVi(patch.slug) || existing.slug : existing.slug,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const res = await sbFetch(`posts?id=eq.${encodeURIComponent(existing.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(postToRow(updated)),
    });
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows[0] ? rowToPost(rows[0]) : updated;
  }

  const db = readLocalDb();
  const idx = db.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.posts[idx] = updated;
  persistLocalDb(db);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const res = await sbFetch(`posts?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });
    const rows = (await res.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  }

  const db = readLocalDb();
  const initialLen = db.posts.length;
  db.posts = db.posts.filter((p) => p.id !== id);
  if (db.posts.length === initialLen) return false;
  persistLocalDb(db);
  return true;
}

export async function incrementPostDownload(id: string): Promise<PostItem | null> {
  const item = await getPostByIdOrSlug(id);
  if (!item) return null;
  return updatePost(item.id, { downloads: item.downloads + 1 });
}

export async function listLeads(): Promise<LeadItem[]> {
  if (isSupabaseConfigured()) {
    await ensureSupabaseSeeded();
    const res = await sbFetch('leads?select=*&order=created_at.desc');
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map(rowToLead);
  }
  const db = readLocalDb();
  return [...db.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createLead(payload: Omit<LeadItem, 'id' | 'status' | 'createdAt'>): Promise<LeadItem> {
  const newLead: LeadItem = {
    ...payload,
    id: `lead-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const res = await sbFetch('leads', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(leadToRow(newLead)),
    });
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows[0] ? rowToLead(rows[0]) : newLead;
  }

  const db = readLocalDb();
  db.leads.unshift(newLead);
  persistLocalDb(db);
  return newLead;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadItem | null> {
  if (isSupabaseConfigured()) {
    const res = await sbFetch(`leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status }),
    });
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows[0] ? rowToLead(rows[0]) : null;
  }

  const db = readLocalDb();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  persistLocalDb(db);
  return lead;
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const res = await sbFetch(`leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });
    const rows = (await res.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  }

  const db = readLocalDb();
  const initialLen = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== id);
  if (db.leads.length === initialLen) return false;
  persistLocalDb(db);
  return true;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [posts, leads] = await Promise.all([listPosts(), listLeads()]);
  return {
    totalPosts: posts.length,
    publishedPosts: posts.filter((p) => p.status === 'published').length,
    draftPosts: posts.filter((p) => p.status === 'draft').length,
    totalDownloads: posts.reduce((acc, p) => acc + p.downloads, 0),
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === 'new').length,
  };
}