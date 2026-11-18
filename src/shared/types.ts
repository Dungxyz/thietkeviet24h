export type PostType = 'webapp' | 'software' | 'tutorial';

export type PostStatus = 'published' | 'draft';

export type LeadStatus = 'new' | 'consulting' | 'completed';

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  category: string;
  status: PostStatus;
  excerpt: string;
  content: string;
  coverImage: string;
  version: string;
  platform: string;
  fileSize: string;
  downloadUrl: string;
  demoUrl: string;
  priceLabel: string;
  tags: string[];
  downloads: number;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  budget: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

export interface AdminStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalDownloads: number;
  totalLeads: number;
  newLeads: number;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
