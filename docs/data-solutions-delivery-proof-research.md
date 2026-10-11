# Data Solutions delivery proof: research and decisions

Date: October 10, 2026. Branch: feat/solutions-delivery-proof.

## Observed patterns

- Stripe customer stories: a succinct commercial result and problem appear before the product stack. https://stripe.com/customers/retool
- Ramp customer stories: operational bottlenecks and saved work are expressed in language finance teams recognize. https://ramp.com/customers/
- Retool customer stories: workflows are grouped by business use case, with outcome-first summaries. https://retool.com/customers
- Brex through Retool: risk and operations teams needed maintainable tools, not more tooling for its own sake. https://retool.com/customers/brex
- Plaid stories: a consistent Problem / Solution / Key Results progression supports fast evaluation. https://plaid.com/customer-stories/penny-finance/
- W3C Reflow: support 320 CSS px with vertical reading order and no mandatory side scrolling. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

## Decisions

Keep the four existing offers. Change section 03 from independent project showcases to five anonymized examples of completed professional engineering: email-to-database automation, legacy report extraction, DAX-to-SQL, relational data sync, and reusable ingestion templates. Cards answer THE PROBLEM, WHAT I BUILT, THE RESULT; technologies are supporting labels. The first case gets a slightly larger layout and simple three-stage visual flow. Put the original independent Formula Vision and AetherFlow case studies in section 05, after the working process, before contact in section 06.

Do not invent prior consulting clients, quotes, measured savings, approval, or employer endorsements. Internal records were consulted privately and are not published. No company name, internal schema, source-specific metrics or private code in the cards.

## Engineering and release checks

- Existing services, contact copy/copy-email behavior, Portfolio, and projects source data unchanged.
- New public content confined to src/deliveryExamples.ts.
- New presentation confined to src/deliveryProof.css and phone-only additions in src/mobile.css.
- Old mobile stylesheet remains an exact prefix of the new stylesheet.
- Mobile portrait: stack cases, featured flow diagram vertical, two-up tools, no clipped headings.
- Landscape touch: compact layout; desktop normal screens keep desktop section layout.
- Preview Vercel READY confirms build only. Real 320/360/390/430 portrait, 667/844 landscape, and 1440px desktop screenshots remain needed before claiming pixel-level QA.
