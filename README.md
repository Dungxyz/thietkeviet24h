# Thiết Kế Việt 24h — WebApp Showcase, Kho Phần mềm & MCP Server

Nền tảng giới thiệu dịch vụ thiết kế WebApp theo yêu cầu, chia sẻ kho tiện ích phần mềm kèm trang quản trị đăng bài đầy đủ và máy chủ **Model Context Protocol (MCP 2024-11-05)** sẵn sàng đẩy lên GitHub và triển khai trực tiếp ra Vercel.

## Tính năng chính

- **Trang chủ giới thiệu dịch vụ WebApp**: Trình bày các giải pháp WebApp Quản lý Thu Chi, Hệ thống POS F&B, Quản lý Hợp đồng, tích hợp Google Sheets / AppSheet tối ưu chi phí vận hành.
- **Kho tiện ích phần mềm & Thủ thuật**: Tìm kiếm, lọc theo chuyên mục (Đồ họa & Thiết kế, Kỹ thuật & CAD, Văn phòng & Tiện ích, Thủ thuật WebApp), xem hướng dẫn cài đặt chi tiết và thống kê lượt tải.
- **Trang Quản trị Đăng bài (`/admin` hoặc tab Quản trị)**:
  - Đăng nhập bảo mật bằng HMAC Token (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
  - Trình soạn thảo bài viết đầy đủ: tiêu đề, slug tự động chuẩn tiếng Việt, phân loại, phiên bản, dung lượng, link tải, ảnh đại diện, Markdown editor kèm xem trước trực tiếp (Live Preview).
  - Quản lý danh sách yêu cầu tư vấn / báo giá từ khách hàng.
- **Chuẩn MCP (Model Context Protocol)**:
  - Endpoint JSON-RPC 2.0: `POST /api/mcp`
  - Discovery Manifest: `GET /.well-known/mcp.json`
  - Công cụ MCP hỗ trợ: `list_software_utilities`, `list_webapp_solutions`, `get_post_detail`, `submit_consultation_lead`, `publish_article_post`.

## Triển khai lên GitHub & Vercel

1. Đẩy mã nguồn lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: thietkeviet24h webapp & mcp portal"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/<repo>.git
   git push -u origin main
   ```
2. Đăng nhập [Vercel](https://vercel.com), chọn **Add New Project** → Import repository từ GitHub.
3. Trong mục **Environment Variables** trên Vercel, thiết lập:
   - `ADMIN_EMAIL`: Email đăng nhập trang quản trị (mặc định `admin@thietkeviet24h.vn`)
   - `ADMIN_PASSWORD`: Mật khẩu đăng nhập trang quản trị (mặc định `admin24h`)
   - `MCP_API_KEY`: Mã khóa Bearer dùng để bảo vệ tool ghi bài qua MCP (tùy chọn)
4. Nhấn **Deploy**. Vercel sẽ tự động nhận cấu hình `vercel.json`, build Vite (`dist/`) và chạy Serverless Function tại `api/index.ts`.

## Kết nối AI Agent qua MCP

Thêm cấu hình sau vào `claude_desktop_config.json` hoặc `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "thietkeviet24h": {
      "url": "https://ten-mien-cua-ban.vercel.app/api/mcp"
    }
  }
}
```
