import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  let size: number | undefined;
  const max = searchParams.get('max');
  if (max) {
    const v = Number.parseInt(max, 10);
    if (!Number.isNaN(v)) {
      size = v;
    }
  }

  const format = searchParams.get('format');
  const placeholderUrl = '/512?text=no\\nimage';
  const cacheControlHeader = `public, max-age=${60 * 60 * 24 * 30}`;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const originalBuffer = await response.arrayBuffer();
    let outputContentType =
      response.headers.get('content-type') || 'image/jpeg';

    if (size || format) {
      let image = sharp(Buffer.from(originalBuffer));

      if (size) {
        image = image.resize({
          width: size,
          height: size,
          fit: 'inside',
        });
      }

      if (format) {
        switch (format) {
          case 'webp':
            image = image.webp({ quality: 80 });
            outputContentType = 'image/webp';
            break;
          case 'avif':
            image = image.avif({ quality: 50 });
            outputContentType = 'image/avif';
            break;
          case 'png':
            image = image.png();
            outputContentType = 'image/png';
            break;
          case 'jpeg':
          case 'jpg':
            image = image.jpeg({ quality: 80 });
            outputContentType = 'image/jpeg';
            break;
        }
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
    }

    return new NextResponse(originalBuffer, {
      status: 200,
      headers: {
        'Content-Type': outputContentType,
        'Cache-Control': cacheControlHeader,
      },
    });
  } catch (error) {
    console.error('Proxy request failed, fetching placeholder:', error);

    try {
      const placeholderResponse = await fetch(placeholderUrl);
      if (!placeholderResponse.ok) {
        console.error('Placeholder fetch failed');
        return new NextResponse('Internal Server Error', { status: 500 });
      }

      const placeholderBuffer = await placeholderResponse.arrayBuffer();
      const placeholderContentType =
        placeholderResponse.headers.get('content-type') || 'image/png';

      return new NextResponse(placeholderBuffer, {
        status: 200,
        headers: {
          'Content-Type': placeholderContentType,
          'Cache-Control': cacheControlHeader,
        },
      });
    } catch (placeholderError) {
      console.error('Placeholder fetch failed:', placeholderError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
}
