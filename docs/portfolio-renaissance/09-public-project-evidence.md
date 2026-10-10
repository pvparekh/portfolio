# 09 — Public engineering evidence and claim ledger

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

## Formula Vision
- **Sources inspected:** https://github.com/pvparekh/F1-Viewer and docs/v2/ENGINEERING_OVERVIEW.md.
- **Source-backed:** FastF1 acquisition, typed Parquet canonical snapshot and lineage, validated browser artifacts, immutable Cloudflare R2 releases, compare-and-swap catalog promotion, timing-authoritative race intelligence, lazy driver telemetry, MAP/CHASE perspective, React/TS Vite client, Vercel static frontend. README reports a catalog of 85 races at publication time; **verify up-to-date count before displaying**.
- **Do not conflate:** historical v1 FastAPI + WebSocket backend with current static-first v2 replay. Use v1→v2 as an engineering evolution story.
- **Media:** capture actual UI screenshot through controlled browser; no invented hero capture or private source assets.

## GitHub Review Bot
- **Source inspected:** https://github.com/pvparekh/github-review-bot README.
- **Backed as documented:** FastAPI webhook, HMAC-SHA256 verification, GitHub App JWT/installation token, custom diff-position mapping, 2-pass Claude analysis, inline comments, background processing; README says **Railway** deployment.
- **Conflict:** homepage PROJECTS description claims **AWS EC2**. Do not propagate this as settled; verify source/configuration and operational deployment, then update public project copy deliberately.
- **Nonclaims:** not yet verified independently: actual current availability, throughput, 'production-grade', consistent 10-second review latency.

## AetherFlow
- **Source inspected:** https://github.com/pvparekh/aetherflow README.
- **Backed as documented:** CSV/TXT/PDF upload parsing, GPT-4o-mini categorization, GPT-4o narrative insights, deterministic anomaly and vendor calculations, Next.js, Supabase/Postgres, auth, filters, export.
- **Conflict check:** homepage 'predict cash flow' and 'real time' claims must be verified against code and current demo, rather than inferred from a marketing sentence. README explicitly marks email digest preference as a coming-soon placeholder.
- **Presentation:** an authentic ingestion → deterministic stats → analysis UX story rather than unsupported business impact.

## Employer work
EXPERIENCE copy is protected as-is; publication review must separately ensure descriptions reveal no confidential architecture, customer data or employer-proprietary implementation. Do not recast professional work as independently owned case-study source code.
