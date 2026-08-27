import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { mapRowToRestaurant } from '../route';

// PUT or PATCH /api/restaurants/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await sql`SELECT * FROM restaurants WHERE id = ${id};`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy quán' }, { status: 404 });
    }

    const current = existing[0];
    const name = body.name !== undefined ? body.name : current.name;
    const address = body.address !== undefined ? body.address : current.address;
    const imageUrl = body.imageUrl !== undefined ? body.imageUrl : current.image_url;
    const note = body.note !== undefined ? body.note : current.note;
    const isFavorite = body.isFavorite !== undefined ? Boolean(body.isFavorite) : current.is_favorite;
    const eaten = body.eaten !== undefined ? Boolean(body.eaten) : current.eaten;
    const eatenAt =
      body.eatenAt !== undefined
        ? body.eatenAt
          ? new Date(body.eatenAt).toISOString()
          : null
        : eaten && !current.eaten
        ? new Date().toISOString()
        : current.eaten_at;

    await sql`
      UPDATE restaurants SET
        name = ${name},
        address = ${address},
        image_url = ${imageUrl},
        note = ${note || null},
        is_favorite = ${isFavorite},
        eaten = ${eaten},
        eaten_at = ${eatenAt}
      WHERE id = ${id};
    `;

    const updated = await sql`SELECT * FROM restaurants WHERE id = ${id};`;
    return NextResponse.json({ success: true, data: mapRowToRestaurant(updated[0]) });
  } catch (error: any) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật quán' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM restaurants WHERE id = ${id};`;
    return NextResponse.json({ success: true, message: 'Đã xóa quán thành công' });
  } catch (error: any) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa quán' },
      { status: 500 }
    );
  }
}
