import { NextRequest, NextResponse } from 'next/server';
import { isBase64Image, uploadBase64ToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/upload - Upload a base64 image data URI to Cloudinary and return its URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawImage = typeof body.imageUrl === 'string' ? body.imageUrl : body.file;
    const publicId = typeof body.publicId === 'string' ? body.publicId : undefined;

    if (!isBase64Image(rawImage)) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng gửi ảnh dạng base64 (data:image/...;base64,...)' },
        { status: 400 }
      );
    }

    const url = await uploadBase64ToCloudinary(rawImage, publicId);
    return NextResponse.json({ success: true, data: { url } });
  } catch (error: unknown) {
    console.error('Error uploading image to Cloudinary:', error);
    const message = error instanceof Error ? error.message : 'Lỗi khi upload ảnh lên Cloudinary';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
