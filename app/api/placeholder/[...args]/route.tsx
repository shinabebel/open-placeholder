import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

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
  // const font = searchParams.get('font'); // 字型處理比較進階，需額外加載字型檔

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        fontSize: width / 10,
        color: textColor,
        background: backgroundColor,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      {text}
    </div>,
    {
      width: width,
      height: height,
    },
  );
}
