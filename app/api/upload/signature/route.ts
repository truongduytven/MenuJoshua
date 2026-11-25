import { NextRequest, NextResponse } from 'next/server';
import { createCloudinaryUploadSignature } from '@/lib/cloudinary';

/**
 * POST /api/upload/signature - Generate a signed payload for direct Cloudinary upload.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const publicId = typeof body?.publicId === 'string' ? body.publicId : undefined;
    const data = createCloudinaryUploadSignature(publicId);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error generating Cloudinary upload signature:', error);
    const message =
      error instanceof Error ? error.message : 'Không thể tạo chữ ký upload Cloudinary';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
