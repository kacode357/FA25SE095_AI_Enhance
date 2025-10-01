## Staff Console (UI Only)

Ứng dụng này là giao diện (Next.js App Router + Tailwind) dành cho bộ phận Staff vận hành & hỗ trợ. Hiện tại chỉ build phần UI / mock data, CHƯA tích hợp API thật.

### Chức năng đã dựng UI
1. User Support: Danh sách ticket, xem chi tiết, thao tác unlock / change email placeholder.
2. Class Support: Yêu cầu tạo lớp, tạo lớp (mock), cấp lại mã mời, import/export placeholder.
3. Crawler Operations: Monitor job, restart failed (mock), quản lý danh sách nguồn bị chặn.
4. Data Inspection / Review: Duyệt mẫu, gán nhãn Correct / Incorrect, report vi phạm.
5. Quota Management: Bảng quota, mở modal cấp thêm trong giới hạn (logic UI).
6. Support Content: CRUD FAQ (in-memory), chỉnh sửa script chatbot.
7. Statistics & Reporting: Bộ lọc thời gian + bảng usage + placeholder chart.

### Cấu trúc thư mục chính
```
app/(auth)/login                # Trang đăng nhập Staff
app/(staff)/layout.tsx          # Shell điều hướng sidebar/topbar
app/(staff)/staff/*             # Các module chức năng
components/staff/*              # Thành phần UI chia theo domain (support, classes, quota,...)
services/staff.service.ts       # Mock service (delay + dữ liệu giả)
types/staff/*                   # Định nghĩa payload/response giả
```

### Phong cách & Khác biệt so với Admin
- Màu chủ đạo chuyển sang tông Sky / Indigo pha Emerald nhẹ.
- Header, gradient blob, badge và accent line thay đổi.
- Section header có avatar chữ cái đầu dynamic + radial mask subtle.

### Chạy dev
```
npm install
npm run dev
# mở http://localhost:3000
```

### TODO khi tích hợp backend
- Thay `StaffService` bằng gọi API thật (REST / GraphQL).
- Kết nối real-time cho Crawler monitor (WebSocket / SSE) nếu cần.
- Thêm phân quyền & bảo vệ route (middleware + session).
- Thay mock chart bằng thư viện (e.g. Recharts / Chart.js / Tremor).
- Thêm i18n nếu cần đa ngôn ngữ.

### Ghi chú
- Tất cả mutation hiện chỉ thay đổi state in-memory.
- Mã màu & spacing đã cố gắng responsive (grid -> 1 cột dưới md).
- Không dùng inline style cho phần động ngoại trừ chỗ cần biểu diễn width (đã lượng hóa thành step class).

© 2025 Staff Console UI.
