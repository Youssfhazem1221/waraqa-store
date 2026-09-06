<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SEO

This site's SEO has hard invariants (single canonical origin, symmetric
hreflang, hand-bumped sitemap `lastModified`, no fabricated review markup).
Before touching metadata, JSON-LD, `sitemap.ts`, `robots.ts`, `lib/seo.ts`,
`next.config.ts` headers, translations, or page copy — and before answering any
question about this site's rankings or indexing — read:

- `.claude/skills/waraqa-seo/SKILL.md` — the rules (invoke as `/waraqa-seo`)
- `SEO-AUDIT.md` — current findings, scores, and the prioritized action plan
