import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadGoogleFont(fontFamily: string, text: string) {
  if (!fontFamily) return null;

  try {
    const url = `https://fonts.googleapis.com/css?family=${fontFamily}&text=${encodeURIComponent(text)}`;
    const css = await fetch(url).then((res) => res.text());
    
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype|woff)'\)/,
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }
  } catch (e) {
    console.error('Font load failed:', e);
  }
  return null;
}

interface Params {
  args: string[];
}

interface RouteProps {
  params: Promise<Params>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { args } = await params;
  const [sizeParam, bgParam, textParam] = args;

  let width = 300;
  let height = 150;

  if (sizeParam) {
    if (sizeParam.includes('x')) {
      const [w, h] = sizeParam.split('x');
      width = Number.parseInt(w, 10);
      height = Number.parseInt(h, 10);
    } else {
      const size = Number.parseInt(sizeParam, 10);
      width = size;
      height = size;
    }
  }

  const backgroundColor = bgParam || '#cccccc';
  const textColor = textParam || '#333333';

  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || `${width}x${height}`;
  const fontName = searchParams.get('font') || 'Roboto';

  const fontData = await loadGoogleFont(fontName, text);
  console.log('font data is loaded');

  const targetWidth = width * 0.8;
  const textLength = text.length;
  let estimatedFontSize = targetWidth / (textLength * 5);
  const maxFontSize = height * 0.3;
  const minFontSize = 8;
  if (estimatedFontSize < 40) {
    estimatedFontSize = Math.sqrt((width * height) / textLength);
  }
  const fontSize = Math.floor(
    Math.min(Math.max(estimatedFontSize, minFontSize), maxFontSize),
  );
  console.log(fontSize);

  return new ImageResponse(
    <div
      tw="flex w-full h-full items-center justify-center"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: fontData ? `"${fontName}"` : 'sans-serif',
      }}
    >
      <div
        tw="flex w-[80%] flex-wrap items-center justify-center text-center"
        style={{ fontSize }}
      >
        {text}
      </div>
    </div>,
    {
      width: width,
      height: height,
      fonts: fontData
        ? [
            {
              name: fontName,
              data: fontData,
              style: 'normal',
            },
          ]
        : undefined,
    },
  );
}
