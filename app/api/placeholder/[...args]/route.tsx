import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const MAX_DIMENSION = 2048;
const DEFAULT_DIMENSION = 300;

async function loadGoogleFont(fontStr: string, text: string) {
  if (!fontStr) return null;

  const [rawFamily, rawWeight] = fontStr.split(':');
  const family = rawFamily;
  const weight = rawWeight || '400';

  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const DEFAULT_FONT = 'IBM+Plex+Sans+JP';

  try {
    const res = await fetch(url, { headers: {} });

    if (!res.ok) {
      console.warn(
        `Font not found: ${fontStr} (Status: ${res.status}). Falling back to default.`,
      );
      if (family !== DEFAULT_FONT) {
        return loadGoogleFont(`${DEFAULT_FONT}:${weight}`, text);
      }
      return null;
    }

    const css = await res.text();
    const resource = css.match(/src: url\((?:'|")?(.+?)(?:'|")?\)/);

    if (resource?.[1]) {
      const fontRes = await fetch(resource[1]);
      if (fontRes.status === 200) {
        return await fontRes.arrayBuffer();
      }
    }
  } catch (e) {
    console.error(`Unexpected error loading font ${fontStr}:`, e);
    if (family !== DEFAULT_FONT) {
      return loadGoogleFont(`${DEFAULT_FONT}:${weight}`, text);
    }
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
  const cleanArgs = args.filter((arg) => arg !== 'image.png');
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

  const fontParam = searchParams.get('font') || 'IBM+Plex+Sans+JP:700';
  const [fontFamilyName] = fontParam.split(':');

  const fontData = await loadGoogleFont(fontParam, text);

  let fontSize = calculateFontSize(width * 0.8, height * 0.8, text);
  const fontScale = Number.parseFloat(searchParams.get('fontScale') || '1');
  if (!Number.isNaN(fontScale)) {
    fontSize *= fontScale;
  }

  return new ImageResponse(
    <div
      tw="flex w-full h-full items-center justify-center"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: fontData ? `"${fontFamilyName}"` : 'sans-serif',
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
              name: fontFamilyName,
              data: fontData,
              style: 'normal',
              weight: parseInt(fontParam.split(':')[1] || '400', 10) as any,
            },
          ]
        : undefined,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, max-age=31536000, s-maxage=31536000, immutable',
        'Content-Disposition': 'inline; filename="image.png"',
      },
    },
  );
}
