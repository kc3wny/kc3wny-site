Each photo is its own folder here:

```
content/photography/<slug>/
  index.md      — frontmatter: location (optional), description (optional)
  <photo>.jpg   — the photo (.jpg, .jpeg, .png, or .webp)
```

`index.md` example:

```markdown
---
location: "Yosemite National Park, CA"
description: "Half Dome at sunrise from Glacier Point."
---
```

Don't set `capturedAt` by hand — `pnpm run process:images` (also runs
automatically before every build) reads it from the photo's EXIF data and
writes it into `index.md` for you. It only fills it in once, so if EXIF is
missing or wrong you can set `capturedAt: "2026-03-15T00:00:00.000Z"`
yourself and it won't be overwritten.

This file isn't picked up as a photo — `lib/photography.ts` only reads
subfolders that have both an `index.md` and an image.
