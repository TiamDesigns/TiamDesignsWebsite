# Review guide for this repository

This is Tiam Bennett's portfolio: a static site (plain HTML, `assets/styles.css`,
vanilla JS) deployed to Cloudflare Pages from `dist/`. Its job is to show
Tiam as an engineering student with an industrial design background. The
readers are recruiters and engineers.

CI already runs Jest, an HTML/accessibility linter, a local link checker, alt
text checks and an image size budget. Don't repeat what those catch. Spend
review comments on things a script can't judge.

## What to look for

- **Broken behaviour**: JS errors, layouts that break at phone width (390px)
  or desktop (1280px+), missing light or dark theme styles, focus states lost
  on interactive elements.
- **Images**: never crop away context on project pages; show full layouts.
  Project card thumbnails are the one exception and should fill the card.
  Image frames keep chamfered corners on all four sides with no gap, shadow
  or square corner showing.
- **Page weight**: images shown on a page should have a WebP version and a
  sensible size. Full-resolution files, CAD, spreadsheets and PDFs are meant
  to be downloadable from the site; flag them only if they are embedded
  where a preview would do.
- **Copy**: plain, specific, first-hand writing. Flag phrasing that reads as
  generated text, such as "not X, but Y" constructions, contrast hooks,
  stacked adjectives and vague claims without a number or example.
- **Facts**: Titan65 sold 450+ units. Its weighted base is a "brass weight",
  never a "brass plate" (a plate is the part that holds the switches).
  The name on the site is "Tiam Bennett".
- **Privacy**: no phone number or home address in anything under the site.
  Everything in `dist/` is public.

## What not to comment on

- Formatting and whitespace.
- Style preferences with no user-facing effect.
- Asking the author to "verify" or "consider" something without a concrete
  problem.
