import { NextRequest, NextResponse } from 'next/server';
import {
  MAX_IMAGE_BYTES,
  getBase64DecodedBytes,
  isBase64Image,
  uploadBase64ToCloudinary,
} from '@/lib/cloudinary';

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

    const decodedBytes = getBase64DecodedBytes(rawImage);
    if (decodedBytes > MAX_IMAGE_BYTES) {
      const sizeMb = (decodedBytes / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `Dung lượng ảnh (${sizeMb} MB) vượt quá giới hạn tối đa 10MB.`,
        },
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
