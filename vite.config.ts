// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, componentTagger (dev-only),
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error logger plugins,
//     and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // SPA mode: a single static index.html shell hydrates on the client.
    spa: { enabled: true },
  },
  // Explicit Netlify preset so the build produces .output/public on Netlify.
  // (In the Lovable sandbox the plugin forces Cloudflare regardless; local
  // builds may differ, but Netlify's build environment honors this.)
  nitro: {
    preset: "netlify",
  },
});
