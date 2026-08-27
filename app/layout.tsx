import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ăn Gì Hôm Nay? - Bộ chọn quán ăn thông minh & vui vẻ",
  description: "Lưu danh sách những quán ăn yêu thích và quay chọn quán ăn ngẫu nhiên hôm nay cùng bạn bè và người yêu!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-orange-200 selection:text-orange-900">
        {children}
      </body>
    </html>
  );
}
