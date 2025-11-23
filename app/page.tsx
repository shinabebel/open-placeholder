'use client';

import { formatHex, parse } from 'culori';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const [width, setWidth] = useState('512');
  const [height, setHeight] = useState('512');
  const [text, setText] = useState('placeholder');
  const [backgroundColor, setBackgroundColor] = useState('black');
  const [textColor, setTextColor] = useState('white');
  const url = useMemo(() => {
    const fallback = '/api/placeholder/512/black/white?text=invalid\\n';
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0)
      return `${fallback}size`;
    const size = w === h ? w : `${w}x${h}`;
    const bgc = parse(backgroundColor);
    const ttc = parse(textColor);
    if (!bgc || !ttc) return `${fallback}color`;
    const txt = text.replace(/\n/g, '\\n');
    return `/api/placeholder/${size}/${formatHex(bgc).slice(1)}/${formatHex(ttc).slice(1)}?text=${txt}`;
  }, [width, height, textColor, backgroundColor, text]);

  const copyToClipboard = async (text: string) => {
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const str = `${origin}${text}`;
      await navigator.clipboard.writeText(str);
      toast.success('Copied to clipboard', { description: str });
    } catch (err) {
      toast.error('Fail to copy text', { description: JSON.stringify(err) });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center font-sans">
      <div className="container flex flex-col min-h-screen items-center justify-center gap-4 p-8">
        <Label className="text-2xl">open placeholder</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4">
          <div className="flex flex-col gap-2">
            <Label>width</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>height</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>background color</Label>
            <Input
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>text color</Label>
            <Input
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Label>text</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        <Button onClick={() => copyToClipboard(url)}>Copy URL</Button>
        <div className="relative w-full flex-1 min-h-0">
          <Image src={url} fill alt="placeholder" className="object-contain" />
        </div>
      </div>
    </div>
  );
}
