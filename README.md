# Memo Booth (by AL)

> A modern, high-performance, client-side Web Photobooth app built with React, TypeScript, Tailwind CSS, and HTML5 Canvas API.

![Memo Booth Banner](https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80)

## Features
- **High-Res getUserMedia Camera Feed**: Requests 1080p/720p constraints directly from device.
- **Configurable Photo Strips**: Choose between 1, 2, or 3 photo strip layouts.
- **Timer Options**: Off, 3s, or 5s delay per shot with animated countdown.
- **Consistent Camera Mirroring**: Live feed and captured images stay mirrored for a natural self-view experience.
- **Clean Canvas Overlay (Requirement 9)**: Frames are rendered programmatically on Canvas, preserving raw photo data so frames can be swapped dynamically in preview without losing image quality.
- **Sleek Dark UI**: Elegant, professional dark mode UI.
- **100% Privacy Focused**: All image processing runs locally in your browser — zero photos are uploaded to any server.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Media Engine**: HTML5 Canvas API + `navigator.mediaDevices.getUserMedia`

## Local Setup
```bash
# Clone the repository
git clone https://github.com/your-username/memo-booth.git
cd memo-booth

# Install dependencies
npm install

# Start local development server
npm run dev
```

## License
MIT License • Created by AL
