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

let memoryStore: DatabaseState | null = null;

function cloneSeed(): DatabaseState {
  return {
    posts: JSON.parse(JSON.stringify(INITIAL_POSTS)) as PostItem[],
    leads: JSON.parse(JSON.stringify(INITIAL_LEADS)) as LeadItem[],
  };
}

function readDb(): DatabaseState {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseState>;
      memoryStore = {
        posts: Array.isArray(parsed.posts) ? parsed.posts : cloneSeed().posts,
        leads: Array.isArray(parsed.leads) ? parsed.leads : cloneSeed().leads,
      };
      return memoryStore;
    }
  } catch {
    // Fallback to seed data if disk read fails
  }

  memoryStore = cloneSeed();
  persistDb(memoryStore);
  return memoryStore;
}

function persistDb(state: DatabaseState): void {
  memoryStore = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Serverless environments (e.g., Vercel) have a read-only filesystem; keep in-memory store active.
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

export function listPosts(filters?: {
  type?: PostType | 'all';
  category?: string;
  status?: PostStatus | 'all';
  q?: string;
}): PostItem[] {
  const db = readDb();
  let items = [...db.posts];

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

export function getPostByIdOrSlug(idOrSlug: string): PostItem | undefined {
  const db = readDb();
  return db.posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function createPost(
  payload: Omit<PostItem, 'id' | 'downloads' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string },
): PostItem {
  const db = readDb();
  const now = new Date().toISOString();
  const baseSlug = slugifyVi(payload.slug?.trim() || payload.title) || `bai-viet-${Date.now()}`;
  const uniqueSlug = db.posts.some((p) => p.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const newPost: PostItem = {
    ...payload,
    id: `post-${Date.now()}`,
    slug: uniqueSlug,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.posts.unshift(newPost);
  persistDb(db);
  return newPost;
}

export function updatePost(id: string, patch: Partial<PostItem>): PostItem | null {
  const db = readDb();
  const idx = db.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const existing = db.posts[idx];
  const updated: PostItem = {
    ...existing,
    ...patch,
    id: existing.id,
    slug: patch.slug ? slugifyVi(patch.slug) || existing.slug : existing.slug,
    updatedAt: new Date().toISOString(),
  };

  db.posts[idx] = updated;
  persistDb(db);
  return updated;
}

export function deletePost(id: string): boolean {
  const db = readDb();
  const initialLen = db.posts.length;
  db.posts = db.posts.filter((p) => p.id !== id);
  if (db.posts.length === initialLen) return false;
  persistDb(db);
  return true;
}

export function incrementPostDownload(id: string): PostItem | null {
  const db = readDb();
  const item = db.posts.find((p) => p.id === id);
  if (!item) return null;
  item.downloads += 1;
  persistDb(db);
  return item;
}

export function listLeads(): LeadItem[] {
  const db = readDb();
  return [...db.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createLead(payload: Omit<LeadItem, 'id' | 'status' | 'createdAt'>): LeadItem {
  const db = readDb();
  const newLead: LeadItem = {
    ...payload,
    id: `lead-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  db.leads.unshift(newLead);
  persistDb(db);
  return newLead;
}

export function updateLeadStatus(id: string, status: LeadStatus): LeadItem | null {
  const db = readDb();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  persistDb(db);
  return lead;
}

export function deleteLead(id: string): boolean {
  const db = readDb();
  const initialLen = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== id);
  if (db.leads.length === initialLen) return false;
  persistDb(db);
  return true;
}

export function getAdminStats(): AdminStats {
  const db = readDb();
  return {
    totalPosts: db.posts.length,
    publishedPosts: db.posts.filter((p) => p.status === 'published').length,
    draftPosts: db.posts.filter((p) => p.status === 'draft').length,
    totalDownloads: db.posts.reduce((acc, p) => acc + p.downloads, 0),
    totalLeads: db.leads.length,
    newLeads: db.leads.filter((l) => l.status === 'new').length,
  };
}
