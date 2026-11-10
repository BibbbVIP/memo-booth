# Memo Booth (by AL)

> A modern, high-performance, client-side Web Photobooth app built with React, TypeScript, Tailwind CSS, and HTML5 Canvas API.

![Memo Booth Banner](coming soon).

## Features
- **High-Res getUserMedia Camera Feed**: Requests 1080p/720p constraints directly from device.
- **Configurable Photo Strips**: Choose between 1, 2, or 3 photo strip layouts.
- **Timer Options**: Off, 3s, or 5s delay per shot with animated countdown.
- **Consistent Camera Mirroring**: Live feed and captured images stay mirrored for a natural self-view experience.
- **Clean Canvas Overlay (Requirement 9)**: Frames are rendered programmatically on Canvas, preserving raw photo data so frames can be swapped dynamically in preview without losing image quality.
- **Spidey dark UI**: Elegant, red dark mode UI.
- **100% Privacy Focused**: All image processing runs locally in your browser — zero photos are uploaded to any server.
- **Upload Frame**: Can upload any frame from user directly.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Media Engine**: HTML5 Canvas API + `navigator.mediaDevices.getUserMedia`

## License
MIT License • Created by AL
