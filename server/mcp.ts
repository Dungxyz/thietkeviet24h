import { ASSET_IMAGES } from '../src/shared/seedData.ts';
import type { McpJsonRpcRequest, McpJsonRpcResponse, McpToolDefinition, PostType } from '../src/shared/types.ts';
import { createLead, createPost, getPostByIdOrSlug, listPosts } from './store.ts';

export const MCP_PROTOCOL_VERSION = '2024-11-05';

export const MCP_SERVER_INFO = {
  name: 'thietkeviet24h-mcp',
  version: '1.0.0',
  title: 'Thiết Kế Việt 24h MCP Server',
  description:
    'Model Context Protocol server cung cấp danh mục WebApp, kho tiện ích phần mềm, đăng bài CMS và tiếp nhận yêu cầu tư vấn từ AI Agents.',
};

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'list_software_utilities',
    description: 'Tìm kiếm và liệt kê các tiện ích phần mềm, bộ cài đặt và bài hướng dẫn đã xuất bản.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Lọc theo danh mục (ví dụ: Đồ họa & Thiết kế, Kỹ thuật & CAD, Văn phòng & Tiện ích, Thủ thuật WebApp).',
        },
        query: {
          type: 'string',
          description: 'Từ khóa tìm kiếm theo tên phần mềm hoặc thẻ tag.',
        },
      },
    },
  },
  {
    name: 'list_webapp_solutions',
    description: 'Liệt kê các mẫu WebApp giải pháp doanh nghiệp (Thu chi, POS, Quản lý hợp đồng, Google Sheets).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Từ khóa tìm kiếm giải pháp WebApp.',
        },
      },
    },
  },
  {
    name: 'get_post_detail',
    description: 'Lấy nội dung chi tiết, hướng dẫn cài đặt, phiên bản và liên kết tải của một bài viết theo slug hoặc ID.',
    inputSchema: {
      type: 'object',
      properties: {
        slugOrId: {
          type: 'string',
          description: 'Slug hoặc ID của bài viết cần xem.',
        },
      },
      required: ['slugOrId'],
    },
  },
  {
    name: 'submit_consultation_lead',
    description: 'Gửi thông tin khách hàng cần tư vấn thiết kế WebApp hoặc cài đặt phần mềm vào hệ thống quản trị.',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', description: 'Họ và tên khách hàng.' },
        phone: { type: 'string', description: 'Số điện thoại hoặc Zalo liên hệ.' },
        email: { type: 'string', description: 'Địa chỉ email (nếu có).' },
        serviceType: { type: 'string', description: 'Loại dịch vụ quan tâm.' },
        message: { type: 'string', description: 'Mô tả nhu cầu chi tiết.' },
      },
      required: ['fullName', 'phone', 'serviceType'],
    },
  },
  {
    name: 'publish_article_post',
    description: 'Tạo và xuất bản nhanh một bài viết chia sẻ phần mềm hoặc mẫu WebApp lên hệ thống.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tiêu đề bài viết.' },
        type: {
          type: 'string',
          description: 'Loại bài viết.',
          enum: ['software', 'webapp', 'tutorial'],
        },
        category: { type: 'string', description: 'Danh mục hiển thị.' },
        excerpt: { type: 'string', description: 'Mô tả tóm tắt ngắn.' },
        content: { type: 'string', description: 'Nội dung chi tiết định dạng Markdown.' },
        version: { type: 'string', description: 'Phiên bản phần mềm/WebApp.' },
        platform: { type: 'string', description: 'Hệ điều hành hoặc nền tảng.' },
        downloadUrl: { type: 'string', description: 'Link tải (nếu có).' },
      },
      required: ['title', 'type', 'category', 'excerpt', 'content'],
    },
  },
];

export const MCP_RESOURCES = [
  {
    uri: 'thietkeviet24h://catalog/posts',
    name: 'Danh mục bài viết & Tiện ích phần mềm',
    description: 'Toàn bộ bài viết đã xuất bản trên Thiết Kế Việt 24h.',
    mimeType: 'application/json',
  },
  {
    uri: 'thietkeviet24h://services/webapp',
    name: 'Dịch vụ thiết kế WebApp theo yêu cầu',
    description: 'Danh sách các gói giải pháp WebApp, tích hợp Google Sheets/AppSheet và POS.',
    mimeType: 'application/json',
  },
];

export function getWellKnownMcpManifest(origin: string) {
  return {
    schema_version: '1.0',
    protocol: 'model-context-protocol',
    protocol_version: MCP_PROTOCOL_VERSION,
    server: MCP_SERVER_INFO,
    transport: {
      type: 'streamable-http',
      endpoint: `${origin}/api/mcp`,
    },
    capabilities: {
      tools: true,
      resources: true,
    },
    tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
    resources: MCP_RESOURCES.map((r) => ({ uri: r.uri, name: r.name })),
  };
}

export async function handleMcpJsonRpc(
  reqBody: McpJsonRpcRequest,
  isAuthorizedWrite: boolean,
): Promise<McpJsonRpcResponse> {
  const id = reqBody.id ?? null;

  if (!reqBody || reqBody.jsonrpc !== '2.0' || !reqBody.method) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Invalid JSON-RPC 2.0 Request' },
    };
  }

  switch (reqBody.method) {
    case 'initialize': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
          serverInfo: MCP_SERVER_INFO,
        },
      };
    }

    case 'notifications/initialized': {
      return { jsonrpc: '2.0', id, result: {} };
    }

    case 'tools/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: MCP_TOOLS },
      };
    }

    case 'resources/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: { resources: MCP_RESOURCES },
      };
    }

    case 'resources/read': {
      const uri = String(reqBody.params?.uri ?? '');
      if (uri === 'thietkeviet24h://catalog/posts') {
        const posts = await listPosts({ status: 'published' });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(posts, null, 2),
              },
            ],
          },
        };
      }
      if (uri === 'thietkeviet24h://services/webapp') {
        const webapps = await listPosts({ type: 'webapp', status: 'published' });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(webapps, null, 2),
              },
            ],
          },
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Không tìm thấy resource: ${uri}` },
      };
    }

    case 'tools/call': {
      const toolName = String(reqBody.params?.name ?? '');
      const args = (reqBody.params?.arguments ?? {}) as Record<string, unknown>;

      if (toolName === 'list_software_utilities') {
        const category = typeof args.category === 'string' ? args.category : undefined;
        const query = typeof args.query === 'string' ? args.query : undefined;
        const allPosts = await listPosts({ status: 'published', category, q: query });
        const software = allPosts.filter((p) => p.type === 'software' || p.type === 'tutorial');
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  software.map((s) => ({
                    id: s.id,
                    title: s.title,
                    slug: s.slug,
                    type: s.type,
                    category: s.category,
                    version: s.version,
                    platform: s.platform,
                    fileSize: s.fileSize,
                    excerpt: s.excerpt,
                  })),
                  null,
                  2,
                ),
              },
            ],
          },
        };
      }

      if (toolName === 'list_webapp_solutions') {
        const query = typeof args.query === 'string' ? args.query : undefined;
        const webapps = await listPosts({ type: 'webapp', status: 'published', q: query });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  webapps.map((w) => ({
                    id: w.id,
                    title: w.title,
                    slug: w.slug,
                    category: w.category,
                    priceLabel: w.priceLabel,
                    platform: w.platform,
                    excerpt: w.excerpt,
                  })),
                  null,
                  2,
                ),
              },
            ],
          },
        };
      }

      if (toolName === 'get_post_detail') {
        const slugOrId = String(args.slugOrId ?? '');
        const post = await getPostByIdOrSlug(slugOrId);
        if (!post) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              isError: true,
              content: [{ type: 'text', text: `Không tìm thấy bài viết với mã "${slugOrId}".` }],
            },
          };
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(post, null, 2) }],
          },
        };
      }

      if (toolName === 'submit_consultation_lead') {
        const fullName = String(args.fullName ?? '').trim();
        const phone = String(args.phone ?? '').trim();
        const serviceType = String(args.serviceType ?? 'Tư vấn WebApp').trim();
        if (!fullName || !phone) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              isError: true,
              content: [{ type: 'text', text: 'Thiếu họ tên hoặc số điện thoại liên hệ.' }],
            },
          };
        }
        const lead = await createLead({
          fullName,
          phone,
          email: String(args.email ?? ''),
          serviceType,
          budget: 'Theo tư vấn',
          message: String(args.message ?? 'Gửi qua giao thức MCP'),
        });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true, leadId: lead.id, createdAt: lead.createdAt }, null, 2),
              },
            ],
          },
        };
      }

      if (toolName === 'publish_article_post') {
        if (!isAuthorizedWrite) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              isError: true,
              content: [{ type: 'text', text: 'Yêu cầu MCP_API_KEY hợp lệ trong header Authorization: Bearer <key>.' }],
            },
          };
        }

        const title = String(args.title ?? '').trim();
        const type = (args.type as PostType) || 'software';
        const category = String(args.category ?? 'Văn phòng & Tiện ích').trim();
        const excerpt = String(args.excerpt ?? '').trim();
        const content = String(args.content ?? '').trim();
        if (!title || !excerpt || !content) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              isError: true,
              content: [{ type: 'text', text: 'Thiếu tiêu đề, mô tả tóm tắt hoặc nội dung bài viết.' }],
            },
          };
        }
        const created = await createPost({
          title,
          type,
          category,
          status: 'published',
          excerpt,
          content,
          coverImage: type === 'webapp' ? ASSET_IMAGES.financeShowcase : ASSET_IMAGES.softwareUtilities,
          version: String(args.version ?? '2026.1'),
          platform: String(args.platform ?? 'Windows / Web'),
          fileSize: type === 'webapp' ? 'Cloud' : 'Đang cập nhật',
          downloadUrl: String(args.downloadUrl ?? ''),
          demoUrl: '',
          priceLabel: type === 'webapp' ? 'Liên hệ báo giá' : 'Miễn phí chia sẻ',
          tags: [category, type === 'webapp' ? 'WebApp' : 'Phần mềm'],
          featured: false,
          author: 'MCP Agent',
        });

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ success: true, post: created }, null, 2) }],
          },
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool không tồn tại: ${toolName}` },
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method không được hỗ trợ: ${reqBody.method}` },
      };
  }
}