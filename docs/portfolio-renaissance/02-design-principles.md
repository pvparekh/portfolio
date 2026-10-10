# 02 — Design principles

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

1. **Evidence before effects (REF-003, REF-010, DOC-05).** Title → problem → contribution → proof → demo/repository. A visual flourish is earned by real data/product media.
2. **Recruiter clarity in the first viewport (REF-022, REF-023, DOC-03).** Name, role, focus, current work and direct actions without interactions.
3. **Editorial hierarchy, not card proliferation (REF-001, REF-021, DOC-04).** Type size, whitespace, column logic and contrast establish order before panel borders.
4. **One brand, two audience journeys (REF-011, REF-017).** Homepage reads as an engineering profile; /solutions reads as an outcome-oriented service.
5. **Projects own their visual grammar (REF-020, REF-021).** Formula Vision: authentic product image + pipeline proof; Review Bot: webhook/review flow; AetherFlow: sample processing and real application UX.
6. **Unchanged professional experience semantics (REF-023).** Reorganize and group; no edits to role names, dates, locations or bullet strings.
7. **Progressive depth without buried proof (DOC-03, DOC-05).** The core value is visible before clicking; details are reachable via accessible disclosures.
8. **Interaction has a job (REF-008, DOC-10).** Navigation, spatial continuity, direct feedback or useful comparison; no general background animation quotas.
9. **Focus and touch get first-class states (DOC-09, DOC-10).** Keyboard and touch are not fallback layouts.
10. **Design-system economy (REF-019, DOC-08).** A small semantic token vocabulary, consistent focus style, deliberate surface and radius tiers.
11. **Visual variety within a common grid (REF-014, REF-020, DOC-04).** A shared editorial alignment makes asymmetrical modules feel related.
12. **Readable technical narrative (REF-022, DOC-07).** Constrain reading measure, separate headlines from metadata, avoid faux terminal decoration.
13. **Failure-honest media (DOC-09, DOC-14).** Each media surface needs alt text, stable dimensions, fallback and optional motion. No fake screenshots.
14. **Performance and factual fidelity are quality gates (DOC-09, DOC-14, DOC-15).** Real measurements and repository proof outrank visual intuition.
15. **Continuous design consistency (DOC-01, DOC-02).** Check the full site against this list at every stage; do not let the last touched component dictate the system.

## Design vocabulary to test visually
Charcoal/amber; editorial grid; human-readable sans for narrative; expressive but disciplined display type; monospace only for true labels/metadata; hairline rules; selective asymmetric full-bleed media; visible role progression; restrained 160–320ms action transitions as an initial hypothesis, subject to testing. Never animate reading-critical content into invisibility.
