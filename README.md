# Open Placeholder

A blazing fast, self-hostable placeholder image generator built with **Next.js 16** and **Edge Runtime**.

Open Placeholder allows you to generate dynamic images on the fly with custom dimensions, colors, text, and typography. It includes a modern frontend UI to easily configure and copy image URLs.

## Features

  * **⚡ Edge Runtime:** Powered by `@vercel/og` and Satori for sub-millisecond image generation.
  * **🎨 Fully Customizable:** Control width, height, background color, and text color.
  * **🔤 Google Fonts Support:** Dynamically load any font from Google Fonts (e.g., `IBM+Plex+Sans+JP:700`).
  * **📐 Smart Typography:** Automatic font sizing based on container dimensions and text length.
  * **🔗 Platform Friendly:** Returns proper headers and `.png` extensions for full compatibility with Notion, Discord, and Slack previews.
  * **🛠️ UI Generator:** Built-in dashboard to tweak settings and preview images in real-time.

## API Reference

The core functionality is exposed via a simple HTTP API.

### Basic Format

```
GET /api/placeholder/[size]/[backgroundColor]/[textColor]/image.png
```

### Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `size` | path | Dimensions. Can be a single number (square) or `WxH`. | `500` or `800x600` |
| `backgroundColor` | path | Hex code (without `#`). | `000000` or `ef4444` |
| `textColor` | path | Hex code (without `#`). | `ffffff` |
| `text` | query | Text content. Supports `\n` for newlines. | `?text=Hello+World` |
| `font` | query | **Optional.** Google Font family & weight. | `?font=Roboto:700` |
| `fontScale` | query | **Optional.** Multiplier for font size (default `1`). | `?fontScale=1.5` |

### Examples

**1. Basic Square (500x500)**

```
/api/placeholder/500/000000/ffffff/image.png?text=placeholder
```

**2. Custom Aspect Ratio (1200x630)**

```
/api/placeholder/1200x630/1e1e1e/e2e2e2/image.png?text=banner
```

**3. Custom Font**

```
/api/placeholder/800x400/indigo/white/image.png?text=Open+Source&font=Inter:900
```

## Tech Stack

  * **Framework:** Next.js 16 (App Router)
  * **Language:** TypeScript
  * **Runtime:** Edge (Vercel Edge Functions)
  * **Styling:** Tailwind CSS v4
  * **UI Components:** Radix UI, Lucide React
  * **State Management:** Zustand
  * **Package Manager:** Bun

## Getting Started

### Prerequisites

  * [Bun](https://bun.sh/) (Recommended) or Node.js

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/shinabebel/open-placeholder.git
    cd open-placeholder
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Run the development server:

    ```bash
    bun dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the generator UI.

## How It Works

1.  **Route Handling:** The API uses Next.js Route Handlers with Catch-all Segments to parse URL parameters.
2.  **Font Loading:** When a specific font is requested, the server fetches the CSS from Google Fonts, parses the source URL, and downloads the specific TTF file buffer. It uses specific User-Agent headers to ensure Satori-compatible formats (TTF) are returned instead of WOFF2.
3.  **Image Rendering:** `ImageResponse` (from `next/og`) renders a React component tree into a PNG buffer using Satori and Resvg.
4.  **Caching:** Responses include `Cache-Control: public, max-age=31536000, immutable` headers, ensuring images are cached aggressively by CDNs and browsers for optimal performance.

## License

[MIT](https://www.google.com/search?q=LICENSE)