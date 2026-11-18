import type { LeadItem, PostItem } from './types.ts';

export const ASSET_IMAGES = {
  heroStudio: '/src/assets/images/hero_webapp_studio_1794972110569.jpg',
  posShowcase: '/src/assets/images/webapp_pos_showcase_1794972110739.jpg',
  financeShowcase: '/src/assets/images/webapp_finance_showcase_1794972111314.jpg',
  softwareUtilities: '/src/assets/images/software_utilities_cover_1794972111702.jpg',
} as const;

export const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post-webapp-thu-chi',
    title: 'WebApp Quản lý Thu Chi & Công nợ Doanh nghiệp',
    slug: 'webapp-quan-ly-thu-chi-cong-no-doanh-nghiep',
    type: 'webapp',
    category: 'Tài chính & Kế toán nội bộ',
    status: 'published',
    excerpt:
      'Giải pháp theo dõi dòng tiền, phiếu thu chi, công nợ khách hàng và đối soát ngân hàng theo thời gian thực, đồng bộ hai chiều với Google Sheets.',
    content: `## Tổng quan giải pháp

WebApp Quản lý Thu Chi được thiết kế riêng cho doanh nghiệp vừa và nhỏ, hộ kinh doanh hoặc đội ngũ tài chính muốn thay thế thao tác nhập liệu rời rạc trên nhiều file Excel bằng một giao diện web tập trung.

### Tính năng cốt lõi
- **Ghi nhận Thu / Chi nhanh trong 15 giây**: Phân loại hạng mục dòng tiền, quỹ tiền mặt, tài khoản ngân hàng và đính kèm chứng từ ảnh.
- **Theo dõi công nợ phải thu / phải trả**: Tự động cảnh báo hóa đơn sắp đến hạn thanh toán qua Email hoặc Telegram/Zalo OA.
- **Đồng bộ Google Sheets & AppSheet**: Dữ liệu lưu trữ trực tiếp trên hệ thống đám mây hoặc Google Workspace của bạn, **0đ phí duy trì server**.
- **Phân quyền chi tiết**: Tách biệt quyền nhân viên nhập liệu, kế toán kiểm duyệt và ban giám đốc xem báo cáo lợi nhuận.

### Quy trình bàn giao
1. Khảo sát biểu mẫu thu chi thực tế của doanh nghiệp (1 ngày).
2. Thiết lập cấu trúc dữ liệu và giao diện WebApp chuẩn Mobile/Desktop (3–5 ngày).
3. Bàn giao mã nguồn, hướng dẫn vận hành và bảo hành kỹ thuật 12 tháng.`,
    coverImage: ASSET_IMAGES.financeShowcase,
    version: '2026.2',
    platform: 'Web Desktop & Mobile · Google Sheets / PostgreSQL',
    fileSize: 'Cloud SaaS / Source',
    downloadUrl: '',
    demoUrl: '#tu-van',
    priceLabel: 'Từ 3.500.000đ · Không phí server',
    tags: ['WebApp Thu Chi', 'Google Sheets', 'Quản lý công nợ'],
    downloads: 428,
    featured: true,
    author: 'Thiết Kế Việt 24h',
    createdAt: '2026-10-12T08:00:00.000Z',
    updatedAt: '2026-11-10T09:30:00.000Z',
  },
  {
    id: 'post-webapp-pos-cafe',
    title: 'Hệ thống POS Bán hàng Quán Cà phê, Trà sữa & Nhà hàng',
    slug: 'he-thong-pos-ban-hang-quan-ca-phe-tra-sua',
    type: 'webapp',
    category: 'F&B & Bán lẻ',
    status: 'published',
    excerpt:
      'WebApp gọi món tại bàn bằng mã QR, quản lý sơ đồ bàn, in hóa đơn nhiệt K80 và trừ kho nguyên vật liệu tự động theo từng đơn hàng.',
    content: `## Vận hành quán gọn nhẹ trên mọi thiết bị

Không cần mua máy POS đắt tiền hay trả phí thuê bao hàng tháng kéo dài, hệ thống chạy mượt trên máy tính bảng, điện thoại và máy thu ngân Windows.

### Điểm nổi bật của hệ thống POS
- **Sơ đồ bàn trực quan**: Trạng thái bàn trống, đang phục vụ, chờ thanh toán cập nhật tức thì giữa thu ngân và pha chế.
- **Menu QR tại bàn**: Khách tự quét mã gọi món, đơn đẩy thẳng xuống màn hình bếp/quầy bar.
- **Định lượng & Trừ kho nguyên liệu**: Tự động trừ gram cà phê, ml sữa, topping khi hoàn tất hóa đơn.
- **Báo cáo ca làm việc**: Chốt ca rõ ràng tiền mặt, chuyển khoản VietQR và đối soát chênh lệch.`,
    coverImage: ASSET_IMAGES.posShowcase,
    version: '2026.1',
    platform: 'WebApp PWA · Tablet / Mobile / Windows',
    fileSize: 'Triển khai trọn gói',
    downloadUrl: '',
    demoUrl: '#tu-van',
    priceLabel: 'Từ 4.500.000đ · Trọn đời',
    tags: ['POS F&B', 'Order QR', 'Quản lý kho'],
    downloads: 365,
    featured: true,
    author: 'Thiết Kế Việt 24h',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-11-12T14:20:00.000Z',
  },
  {
    id: 'post-webapp-hop-dong',
    title: 'Hệ thống Quản lý Hợp đồng, Hồ sơ & Tài liệu Số',
    slug: 'he-thong-quan-ly-hop-dong-ho-so-tai-lieu',
    type: 'webapp',
    category: 'Vận hành Doanh nghiệp',
    status: 'published',
    excerpt:
      'Số hóa toàn bộ hợp đồng kinh tế, phụ lục và hồ sơ khách hàng; tìm kiếm toàn văn trong 1 giây, tự động nhắc lịch gia hạn trước 30 ngày.',
    content: `## Kiểm soát rủi ro hồ sơ & tiến độ nghiệm thu

Hệ thống giúp phòng hành chính, pháp chế và kinh doanh lưu trữ hợp đồng tập trung thay vì thất lạc trong máy tính cá nhân.

### Chức năng chính
- **Lưu trữ & Phân loại thông minh**: Gắn mã hợp đồng, đối tác, giá trị, ngày ký, ngày hết hạn và đính kèm file PDF/Word lên Google Drive doanh nghiệp.
- **Lịch nhắc tự động**: Cảnh báo hợp đồng sắp hết hiệu lực hoặc đến kỳ thanh toán đợt 2, đợt 3.
- **Xuất hợp đồng mẫu tự động**: Chọn khách hàng và điền dữ liệu để sinh file hợp đồng Word/PDF chỉ với 1 lần nhấn.`,
    coverImage: ASSET_IMAGES.heroStudio,
    version: '2026.1',
    platform: 'WebApp · Google Drive & AppSheet / API',
    fileSize: 'Theo yêu cầu',
    downloadUrl: '',
    demoUrl: '#tu-van',
    priceLabel: 'Từ 4.000.000đ · Tùy biến theo mẫu',
    tags: ['Quản lý hợp đồng', 'Số hóa hồ sơ', 'Google Drive'],
    downloads: 214,
    featured: false,
    author: 'Thiết Kế Việt 24h',
    createdAt: '2026-10-25T08:30:00.000Z',
    updatedAt: '2026-11-08T11:00:00.000Z',
  },
  {
    id: 'post-soft-photoshop-2025',
    title: 'Adobe Photoshop 2025 Full — Bộ cài chuẩn & Tối ưu hiệu năng',
    slug: 'adobe-photoshop-2025-bo-cai-chuan-toi-uu-hieu-nang',
    type: 'software',
    category: 'Đồ họa & Thiết kế',
    status: 'published',
    excerpt:
      'Phiên bản Adobe Photoshop 2025 ổn định cho Windows 10/11 64-bit, hướng dẫn tắt tiến trình nền thừa giúp giảm 35% lượng RAM tiêu thụ.',
    content: `## Giới thiệu bản cài đặt

Adobe Photoshop 2025 mang lại cải tiến mạnh về xử lý tách nền, chỉnh màu Camera Raw 17 và tăng tốc phần cứng GPU cho máy cấu hình tầm trung.

### Yêu cầu cấu hình khuyến nghị
- **Hệ điều hành**: Windows 10 (22H2) hoặc Windows 11 64-bit.
- **Vi xử lý**: Intel Core i5 thế hệ 10 hoặc AMD Ryzen 5 trở lên.
- **RAM**: Tối thiểu 8 GB (khuyến nghị 16 GB khi mở file nhiều layer).
- **Dung lượng trống**: 10 GB trên ổ SSD.

### Hướng dẫn cài đặt sạch từng bước
1. Tắt tạm thời phần mềm diệt virus hoặc Windows Security Real-time Protection trước khi giải nén.
2. Giải nén gói cài đặt bằng WinRAR 7.0 trở lên vào thư mục không dấu.
3. Chạy tệp **Set-up.exe** với quyền Administrator và chọn đường dẫn mặc định.
4. Sau khi hoàn tất, mở **Preferences → Performance** và giới hạn mức RAM cấp cho Photoshop ở khoảng 65–70% để máy không bị giật lag khi mở song song trình duyệt.`,
    coverImage: ASSET_IMAGES.softwareUtilities,
    version: 'v26.3',
    platform: 'Windows 10/11 (64-bit)',
    fileSize: '4.6 GB',
    downloadUrl: 'https://drive.google.com/',
    demoUrl: '',
    priceLabel: 'Miễn phí chia sẻ',
    tags: ['Photoshop 2025', 'Đồ họa', 'Chỉnh sửa ảnh'],
    downloads: 1284,
    featured: true,
    author: 'Kỹ thuật 24h',
    createdAt: '2026-11-01T07:15:00.000Z',
    updatedAt: '2026-11-15T16:40:00.000Z',
  },
  {
    id: 'post-soft-autocad-2025',
    title: 'AutoCAD 2025 Architecture & Mechanical — Bộ cài kỹ thuật ổn định',
    slug: 'autocad-2025-bo-cai-ky-thuat-on-dinh',
    type: 'software',
    category: 'Kỹ thuật & CAD',
    status: 'published',
    excerpt:
      'Bộ cài đặt AutoCAD 2025 dành cho kỹ sư xây dựng, cơ khí và kiến trúc sư, kèm bộ Lisp hỗ trợ xuất khối lượng và đánh số bản vẽ nhanh.',
    content: `## Thông tin gói phần mềm

AutoCAD 2025 hỗ trợ mở bản vẽ DWG dung lượng lớn nhanh hơn 2 lần, tối ưu nhận diện block thông minh và tương thích ngược tốt với các phiên bản AutoCAD 2018–2024.

### Bộ quà tặng đi kèm trong thư mục
- Bộ font tiếng Việt đầy đủ (.SHX & .TTF) tránh lỗi font khi mở file từ đối tác.
- Bộ Lisp tính diện tích, cắt dim hàng loạt và in nhanh nhiều khung tên trong Model.

### Lưu ý khi cài đặt
- Gỡ sạch phiên bản Autodesk cũ bằng công cụ chuyên dụng nếu từng cài lỗi trước đó.
- Cài đặt thư viện Visual C++ Redistributable 2015–2022 có sẵn trong thư mục **Support**.`,
    coverImage: ASSET_IMAGES.softwareUtilities,
    version: '2025.1.1',
    platform: 'Windows 10/11 (64-bit)',
    fileSize: '3.2 GB',
    downloadUrl: 'https://drive.google.com/',
    demoUrl: '',
    priceLabel: 'Miễn phí chia sẻ',
    tags: ['AutoCAD 2025', 'Kỹ thuật', 'Bản vẽ DWG'],
    downloads: 942,
    featured: false,
    author: 'Kỹ thuật 24h',
    createdAt: '2026-11-03T09:00:00.000Z',
    updatedAt: '2026-11-14T10:15:00.000Z',
  },
  {
    id: 'post-soft-office-365',
    title: 'Microsoft Office 365 & Bộ công cụ Văn phòng Chuẩn hóa',
    slug: 'microsoft-office-365-va-bo-cong-cu-van-phong',
    type: 'software',
    category: 'Văn phòng & Tiện ích',
    status: 'published',
    excerpt:
      'Gói cài đặt Word, Excel, PowerPoint 365 giao diện tiếng Việt/Anh chính chủ, hướng dẫn cấu hình tự động lưu và tối ưu công thức Excel lớn.',
    content: `## Chi tiết gói tiện ích văn phòng

Phù hợp cho kế toán, nhân sự và doanh nghiệp cần bộ Office đầy đủ hàm mới như \`XLOOKUP\`, \`FILTER\`, \`TEXTSPLIT\` và hỗ trợ Power Query xử lý hàng trăm nghìn dòng dữ liệu.

### Quy trình thiết lập nhanh
1. Chạy file cài đặt Office Deployment Tool (ODT) kèm file cấu hình **Configuration-x64.xml** đã chọn sẵn Word, Excel, PowerPoint, Outlook.
2. Chờ quá trình tải trực tiếp từ máy chủ Microsoft (khoảng 5–10 phút tùy mạng).
3. Kiểm tra cập nhật định kỳ để đảm bảo an toàn bảo mật dữ liệu doanh nghiệp.`,
    coverImage: ASSET_IMAGES.financeShowcase,
    version: 'Build 2410',
    platform: 'Windows 10/11 · macOS',
    fileSize: '2.1 GB',
    downloadUrl: 'https://drive.google.com/',
    demoUrl: '',
    priceLabel: 'Miễn phí chia sẻ',
    tags: ['Office 365', 'Excel', 'Văn phòng'],
    downloads: 1620,
    featured: false,
    author: 'Thiết Kế Việt 24h',
    createdAt: '2026-11-05T11:20:00.000Z',
    updatedAt: '2026-11-16T08:00:00.000Z',
  },
  {
    id: 'post-soft-illustrator-2025',
    title: 'Adobe Illustrator 2025 — Bộ công cụ Thiết kế Vector & In ấn',
    slug: 'adobe-illustrator-2025-thiet-ke-vector-in-an',
    type: 'software',
    category: 'Đồ họa & Thiết kế',
    status: 'published',
    excerpt:
      'Phiên bản Illustrator 2025 chuyên dụng cho thiết kế logo, bao bì, ấn phẩm quảng cáo và xuất file in ấn chuẩn hệ màu CMYK.',
    content: `## Tính năng đáng chú ý trên Illustrator 2025

Cải thiện công cụ căn chỉnh kích thước đối tượng (Dimension Tool), tạo mockup bao bì trực tiếp và tối ưu hiệu năng khi xử lý file vector nhiều artboard.

### Mẹo xuất file in ấn không lỗi font
- Luôn chuyển toàn bộ văn bản sang dạng đường viền (**Ctrl + Shift + O**) trước khi gửi nhà in.
- Giữ độ phân giải Raster Effects ở mức **300 ppi** cho ấn phẩm khổ nhỏ và **150 ppi** cho backdrop khổ lớn.`,
    coverImage: ASSET_IMAGES.softwareUtilities,
    version: 'v29.1',
    platform: 'Windows 10/11 (64-bit)',
    fileSize: '2.8 GB',
    downloadUrl: 'https://drive.google.com/',
    demoUrl: '',
    priceLabel: 'Miễn phí chia sẻ',
    tags: ['Illustrator 2025', 'Vector', 'In ấn'],
    downloads: 780,
    featured: false,
    author: 'Kỹ thuật 24h',
    createdAt: '2026-11-07T14:00:00.000Z',
    updatedAt: '2026-11-14T15:30:00.000Z',
  },
  {
    id: 'post-tutorial-apps-script-webapp',
    title: 'Thủ thuật đồng bộ WebApp React với Google Sheets không tốn phí Server',
    slug: 'thu-thuat-dong-bo-webapp-react-voi-google-sheets',
    type: 'tutorial',
    category: 'Thủ thuật WebApp',
    status: 'published',
    excerpt:
      'Hướng dẫn kiến trúc kết nối giao diện WebApp hiện đại triển khai trên Vercel với Google Apps Script để đọc ghi dữ liệu hoàn toàn miễn phí.',
    content: `## Kiến trúc tiết kiệm chi phí cho doanh nghiệp nhỏ

Thay vì phải thuê VPS hoặc cơ sở dữ liệu trả phí hàng tháng cho các phần mềm quản lý nội bộ quy mô dưới 50.000 bản ghi, bạn có thể dùng **Vercel + Google Apps Script + Google Sheets**.

### Luồng hoạt động chuẩn
1. **Frontend WebApp (React / Vite)** triển khai trên Vercel với tốc độ CDN toàn cầu.
2. **Google Apps Script Web App** đóng vai trò REST API trung gian nhận JSON qua phương thức \`GET\` và \`POST\`.
3. **Google Sheets** lưu trữ dữ liệu dạng bảng, dễ dàng xuất Excel hoặc chia sẻ cho kế toán kiểm tra trực tiếp.

### Đoạn mã Apps Script mẫu
\`\`\`javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  const payload = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), payload.name, payload.phone, payload.note]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

Nếu doanh nghiệp cần triển khai hệ thống hoàn chỉnh có phân quyền, bảo mật token và giao diện chuyên biệt, hãy liên hệ đội ngũ Thiết Kế Việt 24h.`,
    coverImage: ASSET_IMAGES.heroStudio,
    version: 'Guide 2026',
    platform: 'Vercel · React · Apps Script',
    fileSize: 'Bài viết hướng dẫn',
    downloadUrl: '',
    demoUrl: '',
    priceLabel: 'Hướng dẫn miễn phí',
    tags: ['Apps Script', 'Google Sheets', 'Vercel'],
    downloads: 519,
    featured: false,
    author: 'Thiết Kế Việt 24h',
    createdAt: '2026-11-10T16:00:00.000Z',
    updatedAt: '2026-11-17T08:15:00.000Z',
  },
];

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-01',
    fullName: 'Nguyễn Minh Tuấn',
    phone: '0912 345 678',
    email: 'tuan.nm@noithatnamviet.vn',
    serviceType: 'WebApp Quản lý Thu Chi & Công nợ',
    budget: '5 - 10 triệu',
    message: 'Cần làm webapp theo dõi thu chi 3 chi nhánh đồng bộ Google Sheets và xuất báo cáo tuần cho giám đốc.',
    status: 'consulting',
    createdAt: '2026-11-16T09:45:00.000Z',
  },
  {
    id: 'lead-02',
    fullName: 'Trần Thị Lan Anh',
    phone: '0987 654 321',
    email: 'lananh@mocacafe.vn',
    serviceType: 'Hệ thống POS Quán Cà phê / Trà sữa',
    budget: 'Dưới 5 triệu',
    message: 'Quán mình có 18 bàn, cần gọi món trên tablet và in bill qua máy in K80 LAN.',
    status: 'new',
    createdAt: '2026-11-17T14:10:00.000Z',
  },
  {
    id: 'lead-03',
    fullName: 'Lê Hoàng Nam',
    phone: '0903 112 233',
    email: 'hoangnam.arc@gmail.com',
    serviceType: 'Hỗ trợ cài đặt & Phần mềm kỹ thuật',
    budget: 'Tư vấn gói doanh nghiệp',
    message: 'Cần tư vấn bộ công cụ thiết kế chuẩn hóa cho văn phòng kiến trúc 8 máy trạm Windows 11.',
    status: 'completed',
    createdAt: '2026-11-14T11:20:00.000Z',
  },
];
