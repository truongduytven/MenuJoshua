<div align="center">
  <img src="public/logo.png" alt="Ăn Gì Hôm Nay - Menu Joshua Logo" width="180" style="border-radius: 24px;" />
  <h1>🍜 Ăn Gì Hôm Nay? (Menu Joshua)</h1>
  <p><strong>Bộ chọn quán ăn ngẫu nhiên vui vẻ, thông minh & tiện lợi dành cho nhóm bạn, cặp đôi và gia đình!</strong></p>
</div>

Giải quyết câu hỏi muôn thuở *"Hôm nay ăn gì?"* bằng trải nghiệm trực quan, vòng quay ngẫu nhiên sống động, chế độ lướt thẻ flashcard hiện đại cùng hệ thống quản lý địa điểm ăn uống yêu thích dễ dàng.

---

## ✨ Tính Năng Nổi Bật

### 🎲 1. Vòng Quay Chọn Quán Ăn (Random Picker)
- **Quay ngẫu nhiên:** Thuật toán chọn ngẫu nhiên quán ăn chưa thử hoặc từ toàn bộ danh sách.
- **Hiệu ứng âm thanh chân thực:** Tích hợp Web Audio API giả lập tiếng quay slot machine, tiếng click và âm thanh chiến thắng (fanfare).
- **Màn hình vinh danh (Winner Screen):** Hiệu ứng pháo hoa (`canvas-confetti`), hiển thị ảnh quán, ghi chú món ngon và nút mở trực tiếp Google Maps.

### 🃏 2. Chế Độ Lướt Thẻ Khám Phá (Card Deck Mode)
- Duyệt danh sách quán ăn theo phong cách thẻ flashcard trực quan.
- Thao tác lật thẻ xem thông tin chi tiết, đánh dấu yêu thích hoặc chọn ngay quán vừa ý.

### 📍 3. Quản Lý Quán Ăn Thông Minh (CRUD)
- **Tự động phân tích Google Maps:** Nhập đường dẫn Google Maps, hệ thống tự động bóc tách tên quán, địa chỉ và toạ độ.
- **Theo dõi trạng thái:** Phân loại rõ ràng *Chưa ăn* / *Đã ăn* (kèm mốc thời gian) và *Quán yêu thích*.
- **Ghi chú & Hình ảnh:** Lưu ý các món đặc trưng, mức giá, mẹo khi đi ăn.

### 💾 4. Lưu Trữ & Đồng Bộ Linh Hoạt (Dual Storage)
- **Chế độ Offline (LocalStorage):** Hoạt động ngay lập tức trên trình duyệt mà không cần tài khoản hay cấu hình phức tạp.
- **Đồng bộ Neon Database (PostgreSQL):** Hỗ trợ kết nối đám mây Neon serverless để dùng chung danh sách giữa nhiều thiết bị.
- **Quản lý dữ liệu JSON (Import / Export):** Sao lưu dữ liệu ra file JSON, phục hồi hoặc chèn thêm dữ liệu bất cứ lúc nào.

### 🎨 5. Tùy Biến Giao Diện & Trải Nghiệm (Themes & UX)
- Đa dạng chủ đề màu sắc:
  - 🍊 **Orange Food** (Cam ấm cúng, kích thích vị giác)
  - 🍓 **Strawberry** (Dâu tây ngọt ngào)
  - 🍋 **Fresh Lime** (Chanh tươi mát mẻ)
  - 🌊 **Ocean Food** (Đại dương thanh lịch)
  - 🍇 **Grape Dessert** (Nho tráng miệng cuốn hút)
  - 🌙 **Dark Warm** (Giao diện tối dịu mắt ban đêm)
- Hỗ trợ bật / tắt âm thanh tiện lợi.
- Font chữ tiếng Việt chuẩn xác với **Be Vietnam Pro**.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + Modern CSS Variables
- **Cơ sở dữ liệu:** [Neon Database](https://neon.tech/) (`@neondatabase/serverless` - PostgreSQL)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Hiệu ứng:** [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Âm thanh:** Web Audio API (Synthesized sound effects)

---

## 🚀 Hướng Dẫn Bắt Đầu

### 1. Yêu cầu hệ thống
- **Node.js:** Phiên bản 18.18.0 trở lên (khuyên dùng Node 20+)
- Trình quản lý gói: `npm`, `pnpm`, `yarn` hoặc `bun`

### 2. Cài đặt

Clone repository và cài đặt các phụ thuộc:

```bash
git clone https://github.com/truongduytven/MenuJoshua.git
cd menu_joshua
npm install
```

### 3. Cấu hình biến môi trường (Tùy chọn)

Nếu bạn muốn sử dụng cơ sở dữ liệu PostgreSQL từ Neon để đồng bộ online, hãy tạo file `.env.local` ở thư mục gốc:

```env
DATABASE_URL="postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
```

> 💡 *Nếu không cấu hình `DATABASE_URL`, ứng dụng sẽ tự động sử dụng LocalStorage của trình duyệt.*

### 4. Khởi động môi trường phát triển

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.

---

## 📜 Các Lệnh Dự Án (Scripts)

| Lệnh | Chức năng |
| :--- | :--- |
| `npm run dev` | Khởi chạy local dev server với hot reload |
| `npm run build` | Build ứng dụng cho môi trường production |
| `npm run start` | Chạy production server sau khi build |
| `npm run lint` | Kiểm tra cú pháp và chất lượng mã nguồn với ESLint |
| `node scripts/seed.mjs` | Nạp dữ liệu quán ăn mẫu vào database |
| `node scripts/migrate.mjs`| Khởi tạo bảng dữ liệu trên database Neon |

---

## 📁 Cấu Trúc Thư Mục

```text
menu_joshua/
├── app/
│   ├── api/
│   │   └── restaurants/       # API Route xử lý CRUD và đồng bộ database
│   ├── favicon.ico
│   ├── globals.css            # Định nghĩa biến màu CSS theme, Tailwind v4
│   ├── layout.tsx             # Root layout cấu hình SEO và font Be Vietnam Pro
│   └── page.tsx               # Trang chính tích hợp các luồng chức năng
├── components/
│   ├── picker/
│   │   ├── RestaurantPickerModal.tsx  # Modal vòng quay ngẫu nhiên
│   │   └── WinnerScreen.tsx           # Giao diện quán ăn trúng giải
│   ├── AddEditRestaurantModal.tsx     # Modal thêm/sửa quán ăn & parse Maps
│   ├── DataManagerModal.tsx           # Modal quản lý JSON, backup, Neon DB
│   ├── FilterBar.tsx                  # Thanh tìm kiếm và bộ lọc trạng thái
│   ├── HeroBanner.tsx                 # Banner giới thiệu và nút gọi vòng quay
│   ├── Navbar.tsx                     # Header thanh công cụ, thống kê, theme, sound
│   ├── QuizletCardDeck.tsx            # Trải nghiệm duyệt quán kiểu thẻ flashcard
│   ├── RestaurantCard.tsx             # Thẻ hiển thị từng quán ăn
│   ├── RestaurantDetailModal.tsx      # Modal xem chi tiết quán ăn
│   ├── ThemeCustomizerModal.tsx       # Bảng chọn chủ đề giao diện
│   └── ToastContext.tsx               # Hệ thống thông báo toast notification
├── lib/
│   ├── api.ts                         # Client fetch API quán ăn
│   ├── audio.ts                       # Bộ xử lý âm thanh Web Audio API
│   ├── confetti.ts                    # Hiệu ứng pháo hoa canvas-confetti
│   ├── db.ts                          # Neon Database client connection
│   ├── gmaps-parser.ts                # Parser tách thông tin từ link Google Maps
│   └── storage.ts                     # Xử lý đồng bộ LocalStorage & Cloud DB
├── scripts/
│   ├── migrate.mjs                    # Tạo cấu trúc bảng restaurants
│   └── seed.mjs                       # Seed dữ liệu ẩm thực phong phú
├── types/
│   └── restaurant.ts                  # Type definitions (Restaurant, ThemePreset...)
├── package.json
└── README.md
```

---

## 🤝 Đóng Góp

Mọi ý kiến đóng góp, báo lỗi (issue) hoặc đề xuất tính năng mới luôn được hoan nghênh:
1. Fork dự án
2. Tạo nhánh mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Đẩy lên nhánh của bạn (`git push origin feature/AmazingFeature`)
5. Tạo một Pull Request

---

## 📄 Bản Quyền

Dự án được xây dựng bởi **Joshua** với mục tiêu chia sẻ niềm vui ẩm thực. Tự do sử dụng cho mục đích cá nhân!
