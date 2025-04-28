Lazy Songs is SPA for managing BeatSaber custom songs (maps) and playlists.

Inspired by [ModsBeforeFriday](https://github.com/Lauriethefish/ModsBeforeFriday) with WebUSB and ADB approach.

# Core technology

- [Nuxt](https://nuxt.com/) (no SSR)
- [Nuxt UI](https://ui.nuxt.com/)
- WebUSB API with ADB - [Tango](https://github.com/yume-chan/ya-webadb)

# Setup

Make sure to install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production (SPA mode):

```bash
pnpm generate
```
