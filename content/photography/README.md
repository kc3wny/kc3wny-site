Each photo is a single file in this folder, with its metadata in a sidecar
markdown file of the same name:

```
content/photography/
  half-dome.jpg   — the photo (.jpg, .jpeg, .png, or .webp)
  half-dome.md    — frontmatter: location (optional), description (optional)
```

`half-dome.md` example:

```markdown
---
location: "Yosemite National Park, CA"
description: "Half Dome at sunrise from Glacier Point."
capturedAt: "2026-03-15T00:00:00.000Z"
---
```

The image is what makes a photo exist — drop one in this folder and it shows
up in the gallery. The sidecar is optional; without one the photo appears with
just its date.

Don't write `capturedAt` by hand — `pnpm run process:images` (also runs
automatically before every build) reads it from the photo's EXIF data and
writes it into the sidecar for you, creating the sidecar if there isn't one.
It only fills it in once, so if EXIF is missing or wrong you can set
`capturedAt: "2026-03-15T00:00:00.000Z"` yourself and it won't be overwritten.

Only image extensions the site can serve are picked up (.jpg, .jpeg, .png,
.webp) — a .tif/.tiff dropped here is ignored until it's converted. This
README isn't picked up either, since there's no `README.jpg` beside it.
