# Landing page redesign — decentralized infrastructure

## Positioning

“Human trust. Open infrastructure.” Lead with Aura as decentralized human verification for blockchain projects. Explain the distinction between wallet ownership and human uniqueness, then show applications in governance, grants/rewards, and community access. Promote docs and the project dashboard as the main builder paths, retaining participant verification.

## Design direction

Charcoal, off-white, and acid yellow; large DM Sans headlines, small DM Mono annotations, square geometry, visible rules, and a custom SVG network topology. An off-white protocol section separates the explanation from the dark application/integration sections. A yellow closing section highlights the builder CTA. No glow, gradients, fabricated adoption metrics, chain partnerships, or fake live network data.

## Content sequence

1. Protocol navigation and dashboard entry.
2. Hero and conceptual network map.
3. Wallets versus people; distributed evaluations, project requirements, BrightID relationships.
4. Governance, grant distribution, community access.
5. Builder integration: project setup, verification flow, participation rules.
6. Protocol FAQ.
7. Builder and participant calls to action; ecosystem footer.

## Scope and accuracy

Change landing components, scoped CSS, and metadata only. Keep remote routing and backend contracts. Preserve unrelated dashboard edits. Do not claim universal blockchain support or that evaluation takes place on-chain. Network illustration is conceptual and labeled accordingly.

## Validation

- Landing production Vite build and changed-component lint passed.
- No horizontal overflow at 320, 390, 768, 1024, and 1440px.
- Desktop and mobile previews reviewed. Mobile menu Escape assertion and FAQ disclosure passed; fragment targets all exist.
- Full-app type/lint errors previously identified in unchanged `remotes.ts` and `RemoteApp.tsx` remain outside scope.
- Deployment and remote login/dashboard workflows not exercised.
