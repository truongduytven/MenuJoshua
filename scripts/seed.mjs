import { neon } from '@neondatabase/serverless';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_luew6niNLh7k@ep-hidden-darkness-a1mgznkm-pooler.ap-southeast-1.aws.neon.tech/MenuJoshua?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

const INITIAL_DATA = [
  {
    id: 'res-1',
    name: 'Phở Thìn Lò Đúc',
    address: '13 Lò Đúc, Quận Hai Bà Trưng, Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-25T19:30:00.000Z',
    createdAt: '2026-08-20T09:00:00.000Z',
    note: 'Phở bò tái lăn đậm vị, thơm nức mùi hành lá xào gừng',
    isFavorite: true,
  },
  {
    id: 'res-2',
    name: "Pizza 4P's - Pizza Phô Mai Burrata",
    address: '8/15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-21T10:00:00.000Z',
    note: "Pizza phô mai tươi 4P's cực đỉnh, mì cua sốt kem béo ngậy",
    isFavorite: true,
  },
  {
    id: 'res-3',
    name: 'Cơm Tấm Ba Ghiền',
    address: '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-21T11:30:00.000Z',
    note: 'Miếng sườn nướng to khổng lồ che kín đĩa cơm tấm',
  },
  {
    id: 'res-4',
    name: 'Bún Bò Huế Đinh Tiên Hoàng',
    address: '143 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-22T12:00:00.000Z',
    createdAt: '2026-08-21T14:00:00.000Z',
    note: 'Nước dùng thơm sả ruốc đậm đà, chả cua và nạm bò mềm ngon',
  },
  {
    id: 'res-5',
    name: 'Sushi & Sashimi Hokkaido Sachi',
    address: '139 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-22T08:00:00.000Z',
    note: 'Cá hồi Na Uy, sò điệp và nhum biển tươi rói chuẩn Nhật',
    isFavorite: true,
  },
  {
    id: 'res-6',
    name: 'Lẩu Nấm Thiên Nhiên Ashima',
    address: '35A Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-22T15:30:00.000Z',
    note: 'Nước lẩu thanh ngọt tự nhiên cùng hơn 20 loại nấm quý',
  },
  {
    id: 'res-7',
    name: 'Bánh Mì Huỳnh Hoa (Bánh Mì Ô Môi)',
    address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-24T18:15:00.000Z',
    createdAt: '2026-08-23T09:10:00.000Z',
    note: 'Bánh mì ngập ngụa bơ pate, giò chả và chà bông giòn rụm',
    isFavorite: true,
  },
  {
    id: 'res-8',
    name: 'Nướng Hàn Quốc Meat & Meet BBQ',
    address: 'Tầng 4 Estella Place, 88 Song Hành, An Phú, TP. Thủ Đức',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-23T16:00:00.000Z',
    note: 'Thịt ba chỉ nướng cuốn lá mè, kim chi cay nồng chuẩn vị Seoul',
  },
  {
    id: 'res-9',
    name: 'Dimsum Tiến Phát - Điểm Tâm Hồng Kông',
    address: '18 Ký Hòa, Phường 11, Quận 5, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-24T07:45:00.000Z',
    note: 'Há cảo tôm thủy tinh giòn sần sật, bánh bao kim sa trứng muối chảy',
    isFavorite: true,
  },
  {
    id: 'res-10',
    name: 'Cà Phê Trứng & Trà Sữa Giảng',
    address: '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-26T10:00:00.000Z',
    createdAt: '2026-08-24T14:20:00.000Z',
    note: 'Lớp kem trứng đánh bông mịn ngậy trên nền cà phê phin đậm đà',
  },
];

async function seed() {
  console.log('Seeding initial data into Neon Postgres DB...');
  for (const item of INITIAL_DATA) {
    await sql`
      INSERT INTO restaurants (id, name, address, image_url, note, is_favorite, eaten, eaten_at, created_at)
      VALUES (
        ${item.id},
        ${item.name},
        ${item.address},
        ${item.imageUrl},
        ${item.note || null},
        ${Boolean(item.isFavorite)},
        ${Boolean(item.eaten)},
        ${item.eatenAt ? new Date(item.eatenAt).toISOString() : null},
        ${new Date(item.createdAt).toISOString()}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  const count = await sql`SELECT count(*) as count FROM restaurants;`;
  console.log(`✓ Seed complete! Total restaurants: ${count[0].count}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
