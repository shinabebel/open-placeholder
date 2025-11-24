'use client';

import { formatHex, parse } from 'culori';
import { CopyIcon, LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/stores/settings-store';

export default function Home() {
  const {
    width,
    setWidth,
    height,
    setHeight,
    text,
    setText,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    font,
    setFont,
    fontScale,
    setFontScale,
  } = useSettingsStore();

  const url = useMemo(() => {
    const fallback = '/api/placeholder/512/black/white?text=invalid\\n';
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0)
      return `${fallback}size`;
    const size = w === h ? w : `${w}x${h}`;
    const bgdCol = parse(backgroundColor);
    const txtCol = parse(textColor);
    if (!bgdCol || !txtCol) return `${fallback}color`;
    const bgdHex = formatHex(bgdCol).slice(1);
    const txtHex = formatHex(txtCol).slice(1);
    let result = `/api/placeholder/${size}/${bgdHex}/${txtHex}/image.png?`;
    if (fontScale !== 1) result += `fontScale=${fontScale}&`;
    if (font.length > 0) result += `font=${font}&`;
    const txt = text.replace(/\n/g, '\\n').trim();
    if (txt.length === 0) return `${fallback}text`;
    return `${result}text=${txt}`;
  }, [width, height, textColor, backgroundColor, fontScale, font, text]);

  const fullUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${url}`;
  }, [url]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard', { description: text });
    } catch (err) {
      toast.error('Fail to copy text', { description: JSON.stringify(err) });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center font-sans">
      <div className="container flex flex-col min-h-screen items-center justify-center gap-4 p-8">
        <Label className="text-2xl">open placeholder</Label>
        <div className="flex gap-4">
          <Link
            className="relative w-6 aspect-square"
            href="https://github.com/shinabebel/open-placeholder"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="./github.svg"
              alt="github"
              fill
              className="object-contain"
            />
          </Link>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
          <div className="flex flex-col gap-2">
            <Label>text</Label>
            <Textarea
              className="flex flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>font family & weight</Label>
              <Input value={font} onChange={(e) => setFont(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Label>font scale</Label>
                <Label className="font-mono">{fontScale}</Label>
              </div>
              <Slider
                value={[fontScale]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={(e) => setFontScale(e[0])}
              />
            </div>
          </div>
        </div>
        <Alert variant="default">
          <LinkIcon />
          <AlertTitle>URL</AlertTitle>
          <AlertDescription>{fullUrl}</AlertDescription>
        </Alert>
        <Button className="my-2" onClick={() => copyToClipboard(fullUrl)}>
          <CopyIcon />
          Copy Image URL
        </Button>
        <div className="relative w-full flex-1 min-h-0">
          <Image
            src={url}
            fill
            alt="placeholder"
            className="object-scale-down"
          />
        </div>
      </div>
    </div>
  );
}
