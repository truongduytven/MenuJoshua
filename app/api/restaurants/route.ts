import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { resolveRestaurantImageUrl } from '@/lib/cloudinary';
import { Restaurant } from '@/types/restaurant';

// Helper to convert DB snake_case row to Restaurant type
export function mapRowToRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    name: row.name,
    address: row.address || '',
    imageUrl: row.image_url || '',
    note: row.note || undefined,
    isFavorite: Boolean(row.is_favorite),
    eaten: Boolean(row.eaten),
    eatenAt: row.eaten_at ? new Date(row.eaten_at).toISOString() : undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// Ensure table exists helper
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      note TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      eaten BOOLEAN DEFAULT FALSE,
      eaten_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// GET /api/restaurants
export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`
      SELECT id, name, address, image_url, note, is_favorite, eaten, eaten_at, created_at 
      FROM restaurants 
      ORDER BY created_at DESC;
    `;
    const restaurants = rows.map(mapRowToRestaurant);
    return NextResponse.json({ success: true, data: restaurants });
  } catch (error: any) {
    console.error('Error fetching restaurants from DB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải dữ liệu từ database' },
      { status: 500 }
    );
  }
}

// Resolve ID, timestamps, and upload base64 imageUrl to Cloudinary if needed
async function prepareRestaurantForDb(item: Restaurant) {
  const id = item.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const imageUrl = await resolveRestaurantImageUrl(item.imageUrl, id);
  const createdAt = item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString();
  const eatenAt = item.eatenAt
    ? new Date(item.eatenAt).toISOString()
    : item.eaten
    ? new Date().toISOString()
    : null;

  return {
    id,
    name: (item.name || '').trim(),
    address: (item.address || '').trim(),
    imageUrl,
    note: item.note ? item.note.trim() : null,
    isFavorite: Boolean(item.isFavorite),
    eaten: Boolean(item.eaten),
    eatenAt,
    createdAt,
  };
}

// POST /api/restaurants (create one or bulk insert / replace)
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();

    // Mode: 'bulk-replace' (replace entire list)
    if (body.mode === 'replace' && Array.isArray(body.items)) {
      const items: Restaurant[] = body.items;
      // Upload any base64 images before deleting existing rows so failures don't wipe data
      const preparedItems = [];
      for (const item of items) {
        preparedItems.push(await prepareRestaurantForDb(item));
      }

      await sql`DELETE FROM restaurants;`;

      for (const prepared of preparedItems) {
        await sql`
          INSERT INTO restaurants (id, name, address, image_url, note, is_favorite, eaten, eaten_at, created_at)
          VALUES (
            ${prepared.id},
            ${prepared.name},
            ${prepared.address},
            ${prepared.imageUrl},
            ${prepared.note},
            ${prepared.isFavorite},
            ${prepared.eaten},
            ${prepared.eatenAt},
            ${prepared.createdAt}
          );
        `;
      }

      const rows = await sql`SELECT * FROM restaurants ORDER BY created_at DESC;`;
      return NextResponse.json({ success: true, data: rows.map(mapRowToRestaurant) });
    }

    // Mode: 'bulk-append' (append multiple items)
    if (body.mode === 'append' && Array.isArray(body.items)) {
      const items: Restaurant[] = body.items;
      for (const item of items) {
        const prepared = await prepareRestaurantForDb(item);
        await sql`
          INSERT INTO restaurants (id, name, address, image_url, note, is_favorite, eaten, eaten_at, created_at)
          VALUES (
            ${prepared.id},
            ${prepared.name},
            ${prepared.address},
            ${prepared.imageUrl},
            ${prepared.note},
            ${prepared.isFavorite},
            ${prepared.eaten},
            ${prepared.eatenAt},
            ${prepared.createdAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            image_url = EXCLUDED.image_url,
            note = EXCLUDED.note,
            is_favorite = EXCLUDED.is_favorite,
            eaten = EXCLUDED.eaten,
            eaten_at = EXCLUDED.eaten_at;
        `;
      }

      const rows = await sql`SELECT * FROM restaurants ORDER BY created_at DESC;`;
      return NextResponse.json({ success: true, data: rows.map(mapRowToRestaurant) });
    }

    // Single item create / upsert
    const item: Restaurant = body;
    if (!item.name || !item.name.trim()) {
      return NextResponse.json({ success: false, error: 'Tên quán ăn là bắt buộc' }, { status: 400 });
    }

    const prepared = await prepareRestaurantForDb(item);

    await sql`
      INSERT INTO restaurants (id, name, address, image_url, note, is_favorite, eaten, eaten_at, created_at)
      VALUES (
        ${prepared.id},
        ${prepared.name},
        ${prepared.address},
        ${prepared.imageUrl},
        ${prepared.note},
        ${prepared.isFavorite},
        ${prepared.eaten},
        ${prepared.eatenAt},
        ${prepared.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        image_url = EXCLUDED.image_url,
        note = EXCLUDED.note,
        is_favorite = EXCLUDED.is_favorite,
        eaten = EXCLUDED.eaten,
        eaten_at = EXCLUDED.eaten_at;
    `;

    const savedRows = await sql`SELECT * FROM restaurants WHERE id = ${prepared.id};`;
    return NextResponse.json({
      success: true,
      data: savedRows[0] ? mapRowToRestaurant(savedRows[0]) : null,
    });
  } catch (error: any) {
    console.error('Error inserting restaurant into DB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lưu quán ăn vào database' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants (bulk delete or delete all)
export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));

    if (body.all) {
      await sql`DELETE FROM restaurants;`;
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ quán ăn' });
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      for (const id of body.ids) {
        await sql`DELETE FROM restaurants WHERE id = ${id};`;
      }
      return NextResponse.json({ success: true, message: `Đã xóa ${body.ids.length} quán ăn` });
    }

    return NextResponse.json({ success: false, error: 'Thiếu danh sách id cần xóa' }, { status: 400 });
  } catch (error: any) {
    console.error('Error deleting restaurants:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa dữ liệu' },
      { status: 500 }
    );
  }
}
