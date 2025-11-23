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

function getVisualLength(text: string): number {
  let length = 0;
  for (const char of text) {
    if (char.charCodeAt(0) <= 127) {
      length += 0.6;
    } else {
      length += 1.0;
    }
  }
  return length;
}

function calculateFontSize(
  width: number,
  height: number,
  text: string,
): number {
  const lines = text.split('\n');
  const lineCount = lines.length;

  const maxVisualLength = Math.max(...lines.map(getVisualLength));

  const widthBasedSize = width / (maxVisualLength || 1);

  const lineHeight = 1.3;
  const heightBasedSize = height / (lineCount * lineHeight);

  let fontSize = Math.min(widthBasedSize, heightBasedSize);

  const minFontSize = 12;
  const maxFontSize = Math.min(width, height) * 0.5;

  fontSize = Math.max(minFontSize, Math.min(fontSize, maxFontSize));

  return Math.floor(fontSize);
}

function processColor(color: string): string {
  if (!color) return color;
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color)) {
    return `#${color}`;
  }
  return color;
}

interface Params {
  args: string[];
}

interface RouteProps {
  params: Promise<Params>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { args } = await params;
  const cleanArgs = args.filter(arg => arg !== 'image.png');
  const [sizeParam, bgParam, textParam] = cleanArgs;

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

  const backgroundColor = processColor(bgParam || 'cccccc');
  const textColor = processColor(textParam || '333333');

  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get('text') || `${width}x${height}`;
  const text = rawText.replace(/\\n/g, '\n');

  const fontName = searchParams.get('font') || 'IBM+Plex+Sans+JP:700';

  const fontData = await loadGoogleFont(fontName, text);

  const fontSize = calculateFontSize(width * 0.8, height * 0.8, text);

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
        style={{ fontSize, whiteSpace: 'pre-line' }}
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
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline; filename="image.png"',
      },
    },
  );
}
