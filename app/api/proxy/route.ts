import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';

const FitSchema = z
  .enum(['contain', 'cover', 'fill', 'inside', 'outside'])
  .optional();

const FormatSchema = z.enum(['webp', 'avif', 'png', 'jpeg', 'jpg']).optional();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  const width = Number.parseInt(searchParams.get('w') ?? '', 10) || undefined;
  const height = Number.parseInt(searchParams.get('h') ?? '', 10) || undefined;
  const fit = FitSchema.parse(searchParams.get('fit') || undefined);
  const format = FormatSchema.parse(searchParams.get('format') || undefined);

  const placeholderUrl = new URL(
    '/512?text=Error',
    request.nextUrl.origin,
  ).toString();
  const age = 60 * 60 * 24 * 30;
  const cacheControlHeader = `public, max-age=${age}, s-maxage=${age}`;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const originalBuffer = await response.arrayBuffer();

    if (!width && !height && !format) {
      return new NextResponse(originalBuffer, {
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    let image = sharp(Buffer.from(originalBuffer));

    if (width || height) {
      image = image.resize({ width, height, fit });
    }

    let outputContentType =
      response.headers.get('content-type') || 'image/jpeg';

    if (format) {
      const quality = format === 'avif' ? 50 : 80;
      image = image.toFormat(format === 'jpg' ? 'jpeg' : format, { quality });
      outputContentType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    } else {
      image = image.webp({ quality: 80 });
      outputContentType = 'image/webp';
    }

    const resizedBuffer = await image.toBuffer();
    const imageBuffer: BodyInit = Uint8Array.from(resizedBuffer);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': outputContentType,
        'Cache-Control': cacheControlHeader,
      },
    });
  } catch (error) {
    console.error('Proxy request failed, fetching placeholder:', error);

    try {
      const placeholderRes = await fetch(placeholderUrl);
      if (!placeholderRes.ok) throw new Error('Placeholder fetch failed');

      return new NextResponse(placeholderRes.body, {
        status: 200,
        headers: {
          'Content-Type':
            placeholderRes.headers.get('content-type') || 'image/png',
          'Cache-Control': 'no-store',
        },
      });
    } catch (phError) {
      console.error('Placeholder failed:', phError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
}
