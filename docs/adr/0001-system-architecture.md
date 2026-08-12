# ADR 0001: Snacks E-Commerce System Architecture

Status: Accepted

Date: 2026-08-05

Owner: Product and Engineering

## Reviewer Blindspots Added Before Writing

Before finalizing this ADR, the architecture was reviewed for gaps, risky assumptions, and areas where the initial plan could mislead implementation.

1. Realtime cannot mean globally atomic distributed writes. PostgreSQL, Redis, OpenSearch, payment providers, email, SMS, and WhatsApp cannot all commit as one transaction. The system will provide a realtime user experience through transactional core writes, outbox events, workers, notifications, and SSE/WebSockets.
2. Delivery must be explicitly out of scope. Earlier architecture ideas included delivery partners, geospatial pricing, time slots, and tracking. The owner now wants delivery handled off-platform. The app stops at paid order, preparation, readiness notification, and completion marking.
3. MongoDB is not the best primary database for this product. The app has payment, inventory, order, tenant, audit, permission, and reporting requirements. PostgreSQL is selected as the source of truth. Flexible snack data uses JSONB.
4. Redis must not be the only source of truth for carts or checkout state. Redis is used for speed, queues, rate limits, locks, sessions, and ephemeral state. Authenticated carts and order-critical records persist in PostgreSQL.
5. Search must be treated as eventually consistent. OpenSearch is a read model, not a source of truth. Product and inventory changes sync through the outbox and worker pipeline, targeting sub-5-second freshness.
6. Manual payments introduce fraud and support risk. Receipt upload, admin approval, audit logs, private storage, rejection flow, and inventory reservation expiry are mandatory.
7. Multi-tenancy needs strict scoping from day one. Every tenant-owned resource must include tenant context, and authorization must be enforced in backend guards/policies, not only in frontend routes.
8. Perishable inventory needs batch and expiry modeling from the start. Snacks such as meat pies can spoil, so inventory is modeled by SKU and batch, with expiry dates and sellability rules.
9. Admin/customer order completion can create disputes. Both may mark an order completed, but admin can override with audit history.
10. The MVP timeline conflicts with the full feature set. Group carts, office snack planning, subscriptions, advanced loyalty, and recommendation scoring should be phased unless the team expands.
11. The $50/month budget is tight for managed OpenSearch, Redis, PostgreSQL, observability, workers, and media storage. MVP deployment should use free tiers and selective self-hosting, then migrate to managed services.
12. The component library choice should optimize implementation speed. Mantine is recommended over shadcn/ui for this admin-heavy MVP, while Tailwind still supports storefront customization.
13. TypeScript should prioritize ecosystem stability across frontend and backend. TypeScript 7.0.2 is the latest native compiler, but the current stack still depends on the TypeScript compiler API through Next.js, NestJS, Prisma, and typescript-eslint. The project will use TypeScript 6.0.3 as the stable fallback until TS7 support is clean across the toolchain.
14. The frontend animation system must be deliberate, not decorative noise. Use Motion for common UI interactions and page transitions, GSAP for complex hero and scroll-based storytelling, Lenis for smooth scrolling, and LottieFiles-compatible animations for lightweight designer-created illustrations and loading states.

## Context

We are building a medium-scale snacks e-commerce platform using an N-tier architecture. The system supports owned inventory and vendor or multi-tenant inventory. Customers can browse, search, receive recommendations, create carts, checkout, pay, and receive order readiness notifications. Admins and tenant users manage products, inventory, users, orders, manual payments, promotions, notifications, and reports.

The initial technology direction included Next.js, NestJS, MongoDB, Redis, OpenSearch, Tailwind CSS, and either Mantine or shadcn/ui.

The refined business direction is:

- Delivery is not managed inside the app.
- Customers place orders and pay.
- Admins receive notifications by email, SMS, or WhatsApp.
- Admins prepare orders using customer contact and address details.
- Customers are notified when orders are ready for pickup or external dispatch.
- The customer or admin can mark an order as completed.
- Admin can override completion disputes.

## Problem Statement

The platform must provide a fast, polished, realtime-feeling commerce experience while preserving correctness for payments, inventory reservations, order state transitions, tenant scoping, permissions, and audits.

The architecture must be practical for a medium-scale team and MVP timeline, while still giving the product room to grow into subscriptions, group carts, office snack planning, dynamic bundles, loyalty quests, recommendations, and multi-country expansion.

## Goals

- Build a medium-scale snacks e-commerce system with clear N-tier boundaries.
- Support B2C and B2B purchasing.
- Support owned products and vendor or tenant-managed products.
- Support product, inventory, user, and order management.
- Support individual products, SKUs, bundles, and combo packs.
- Support perishable inventory using expiry and batch tracking.
- Support online payments and manual payment proof approval.
- Support realtime admin and customer updates.
- Support SEO-friendly storefront pages.
- Support mobile-first customer experience.
- Support a polished admin dashboard.
- Support role and permission delegation.
- Support future multi-country expansion.
- Keep the system modular without starting with microservices.

## Non-Goals

- No in-app delivery partner management for MVP.
- No driver assignment.
- No route optimization.
- No geospatial delivery pricing.
- No third-party carrier quote engine.
- No live delivery tracking.
- No platform-vendor split payouts in MVP.
- No custom machine learning model in MVP.
- No microservice split in MVP.

## Key Assumptions

- Initial operating geography is the United States.
- Future expansion may include multiple countries.
- SEO is important from day one.
- Most customers will use mobile devices.
- The MVP target is approximately 3 weeks.
- The initial monthly infrastructure budget is around $50 where possible.
- The system should use the latest ecosystem-stable TypeScript compiler across frontend and backend.
- Frontend interactions should feel fluid through a standard animation stack.
- Realtime means fast event propagation and realtime UI updates, not distributed atomicity across every dependency.

## Constraints

- Frontend must use Next.js.
- Backend must use NestJS.
- Redis must be used for caching, rate limiting, queues, and realtime support.
- OpenSearch must be used for full search.
- Tailwind CSS must be available for customization.
- Component library must be either Mantine or shadcn/ui.
- The system must support admin-configurable manual payment methods such as CashApp, Venmo, and Zelle.
- Customer and payment receipt data must be protected.

## Decision Summary

Build the system as a PostgreSQL-backed NestJS modular monolith with an event-driven internal spine.

Selected stack:

- Frontend: Next.js App Router
- Frontend language: TypeScript 6.0.3 stable fallback
- Backend: NestJS modular monolith
- Backend language: TypeScript 6.0.3 stable fallback
- Primary database: PostgreSQL
- ORM: Prisma
- Cache and queues: Redis plus BullMQ
- Search: OpenSearch
- Object storage: Cloudflare R2
- Component library: Mantine
- Styling: Tailwind CSS
- UI motion: Motion
- Advanced animation: GSAP
- Smooth scrolling: Lenis
- Lottie animation runtime: lottie-react for LottieFiles-compatible assets
- Email: Resend
- SMS and WhatsApp: Twilio
- Realtime: SSE first, WebSockets only where bidirectional realtime is required
- API style: REST with OpenAPI
- Consistency pattern: transactional outbox plus idempotent workers

## Final Database Decision

Use PostgreSQL as the primary database.

MongoDB was considered because product catalog data can be flexible. However, this system has stronger relational and transactional needs:

- Orders
- Payments
- Refunds
- Inventory reservations
- Perishable stock batches
- Tenant scoping
- Role and permission management
- Audit logs
- Reports
- Promotion rules
- Subscription billing references

PostgreSQL better protects these workflows with relational constraints, transactions, indexes, foreign keys, reporting capability, and mature operational tooling.

Flexible product information should be modeled with JSONB, not a separate MongoDB dependency. Examples include allergens, nutrition facts, ingredients, taste profile, dietary flags, package dimensions, and other snack metadata.

## Architecture Style

Use N-tier architecture with strict module boundaries.

Layers:

```text
Presentation Layer
  Next.js storefront, account area, admin, vendor screens

API Layer
  NestJS controllers, DTOs, validation, guards, OpenAPI contracts

Application Layer
  Use cases, commands, queries, orchestration, transactions

Domain Layer
  Business entities, policies, domain events, state machines

Infrastructure Layer
  PostgreSQL, Redis, OpenSearch, R2, Resend, Twilio, Stripe, PayPal
```

Use a modular monolith rather than microservices. The monolith should be internally event-driven so future service extraction is possible without rewriting the domain model.

## High-Level System Flow

```text
Customer
  -> Next.js storefront
  -> NestJS REST API
  -> PostgreSQL transaction
  -> Outbox event
  -> Worker
  -> Redis invalidation
  -> OpenSearch sync
  -> Email/SMS/WhatsApp notification
  -> SSE/WebSocket realtime update
```

Critical writes happen in PostgreSQL. Side effects happen after commit through outbox workers.

## Frontend Architecture

Use Next.js App Router with route groups.

Rendering strategy:

- Product listing pages: SSR or ISR for SEO.
- Category pages: SSR or ISR.
- Product detail pages: SSR or ISR with live inventory lookup.
- Search pages: SSR for initial query, client updates for filters.
- Cart: client-interactive with server-backed persistence.
- Checkout: server-backed, transactional, guarded.
- Admin: authenticated application shell with client interactions.
- Vendor: authenticated scoped dashboard.

Use TanStack Query for server state, cache invalidation, optimistic UI where safe, and refetching after realtime events.

Use Mantine for:

- Admin layouts
- Forms
- Tables
- Modals
- Drawers
- Notifications
- Date/time inputs
- Complex management screens

Use Tailwind CSS for:

- Storefront brand styling
- Responsive layout
- Marketing/product content surfaces
- Fine-grained visual customization

## Frontend Separation Convention

Use domain-scoped top-level category folders for frontend code.

The rule is:

```text
apps/web/src/<category>/<DomainContext>/<DomainContextThing>
```

Examples:

```text
components/functional-components/AdminProduct/AdminProductTable.tsx
contents/functional-contents/AdminProduct/AdminProductContent.tsx
hooks/AdminProduct/useAdminProductForm.ts
validation/AdminProduct/adminProductValidation.ts
constants/AdminProduct/adminProductConstants.ts
types/AdminProduct/adminProductTypes.ts
services/AdminProduct/adminProductApi.ts
```

This convention is required because the app will have several domains and role-specific flows, such as:

- AdminProduct
- AdminOrder
- AdminInventory
- AdminUser
- CustomerCart
- CustomerCheckout
- CustomerProduct
- VendorProduct

Responsibilities:

- `components/functional-components/<DomainContext>/`: reusable UI components for the domain. Components receive props and should not own API calls.
- `contents/functional-contents/<DomainContext>/`: page or route composition for the domain. Contents connect hooks, components, loading states, empty states, and modal flow.
- `hooks/<DomainContext>/`: domain-specific React hooks for forms, modals, queries, mutations, and client workflow state.
- `validation/<DomainContext>/`: frontend validation helpers that mirror backend rules for better UX.
- `constants/<DomainContext>/`: domain-specific UI constants, query keys, option lists, and labels.
- `types/<DomainContext>/`: frontend domain types and view models.
- `services/<DomainContext>/`: API service functions that call NestJS endpoints.

Avoid generic files such as:

```text
hooks/useProductForm.ts
validation/productValidation.ts
components/ProductTable.tsx
services/productApi.ts
```

Use context-specific names instead:

```text
hooks/AdminProduct/useAdminProductForm.ts
validation/AdminProduct/adminProductValidation.ts
components/functional-components/AdminProduct/AdminProductTable.tsx
services/AdminProduct/adminProductApi.ts
```

Frontend UI workflow rules:

- If a page creates something, show a simple primary button first, such as "Create Product".
- Create, edit, archive, restore, and other important actions must open a modal or dialog before changing data.
- Destructive actions require confirmation.
- Long workflows must be step-based. Do not show several large forms at once.
- Tables must adapt on mobile using compact rows or cards.
- Forms must show inline validation errors.
- Loading, empty, success, and error states must be visible.
- Use simple grammar in UI text.
- Avoid technical words in UI labels unless necessary.
- Admin UI should be practical, responsive, and not visually overwhelming.

## Frontend Motion Strategy

Use a layered animation strategy:

- Motion is the default animation library for everyday UI interactions, microinteractions, modal transitions, list transitions, cart feedback, admin state changes, and page transitions.
- GSAP is reserved for complex hero animations, advanced scroll scenes, sequenced storytelling, SVG/canvas-heavy effects, and high-control branded storefront experiences.
- Lenis provides smooth scrolling for storefront and editorial/product discovery surfaces.
- LottieFiles-compatible JSON animations are rendered through `lottie-react` for lightweight designer-created illustrations, empty states, loading states, success states, and onboarding moments.

Animation rules:

- Respect `prefers-reduced-motion`.
- Keep admin motion subtle and fast.
- Use stronger animation only on storefront discovery, hero, campaign, and product storytelling surfaces.
- Do not animate checkout in a way that slows payment, review, or accessibility flows.
- Do not use animation to hide slow API responses; use honest loading and skeleton states.
- GSAP and Lottie assets should be lazy-loaded where possible.
- Lenis should be disabled or carefully scoped inside modals, drawers, tables, and admin data-heavy screens if it interferes with native scroll behavior.

## TeahTreats Storefront UI/UX Modernization Plan

The storefront brand is **TeahTreats**.

Brand positioning:

- Premium snack commerce for personal treats, office planning, gifting, bundles, and curated discovery.
- The visual language should feel editorial, refined, and food-first, not generic SaaS or empty dashboard UI.
- The screenshots and provided component templates establish the target direction: immersive dark storefront, red/gold accents, large serif headlines, real snack photography, strong spacing, motion-led discovery, and high-touch product cards.

Brand identity:

- Brand name: `TeahTreats`.
- Logo concept: snack-forward mark using a small circular snack image/illustration, paired with a refined wordmark.
- Primary palette:
  - Obsidian black: `#0A0A0A`
  - Deep black/charcoal: `#111111`, `#1A1A1A`
  - Crimson red: `#9B1B30`
  - Deep crimson: `#6B0F1F`
  - Gold: `#B8933E`
  - Light gold: `#D4AF37`
  - Cream text: `#FAF7F2`
  - Parchment/off-white: `#EDE8E0`
- Typography:
  - Display serif: `DM Serif Display` for hero and major editorial headings.
  - Editorial serif: `Playfair Display` for product names, testimonials, story headings, and premium accents.
  - Sans: `Inter` for navigation, metadata, filters, buttons, forms, and admin/work surfaces.
- Tone:
  - Customer-facing copy should be short, polished, sensory, and practical.
  - Admin copy should stay plain and efficient.

Storefront visual principles:

- Use real snack/product imagery as the primary visual asset. Avoid empty cards, generic gradients, or overly abstract decoration.
- Hero sections must be full-bleed or near full-bleed with product imagery and text layered over the image, not split-card marketing layouts.
- Use high-contrast dark sections with thin gold dividers, red call-to-action buttons, and cream/gold typography.
- Keep the storefront premium but still usable: important actions must remain obvious, readable, and reachable on mobile.
- Product cards should show image, name, category/tag, rating or review count where available, price, discount state, stock/availability, and one clear add-to-cart path.
- Favor asymmetric editorial grids for discovery sections, but preserve predictable layout and tap targets on mobile.
- Use skeleton and empty states that feel branded, not bare.

Mobile-first layout rules:

- Design every storefront section for mobile first, then expand to medium and large screens.
- Mobile hero:
  - Use a cropped product image background.
  - Keep the brand mark, search/cart actions, headline, and one primary CTA visible without overlap.
  - Use smaller serif display type with stable line-height; do not scale text with raw viewport width.
- Mobile navigation:
  - Use compact header with logo, search, cart, and menu/drawer.
  - Keep nav links in a drawer or bottom-friendly menu, not a crowded horizontal bar.
- Mobile product browsing:
  - Use one-column or two-column cards depending on width.
  - Filters open in a drawer/modal.
  - Add-to-cart opens a drawer/modal for SKU and quantity selection.
- Tablet/desktop:
  - Use editorial grids, category mosaics, side-by-side story sections, and wider product rows.
  - Keep max content widths controlled so large displays do not stretch text lines.

Required storefront surfaces:

- Home:
  - Full-bleed premium hero with TeahTreats logo, snack imagery, headline, short value copy, primary CTA, secondary CTA, and compact stats.
  - Category exploration section using an asymmetric image grid.
  - Trending products section with filters and product cards.
  - Brand story/heritage section with large food image and editorial copy.
  - Bundles section.
  - Office snack planning section.
  - Gifting section.
  - Testimonials section.
  - Marquee band for curated product names.
  - Newsletter/footer with privacy, terms, refund, and allergy links.
- Products:
  - Product grid with search, category filters, sort, availability, and polished loading/empty states.
  - Customer cards, not tables.
- Product detail:
  - Image gallery, product story, ingredients/allergens/nutrition, SKU selection, stock status, and add-to-cart drawer.
- Search:
  - Search-first layout with suggestions, recent/popular terms, and result cards.
- Cart:
  - Clean order summary, item quantity controls, coupon field, customer login prompt, and checkout start modal.
- Bundles, office planning, gifting, loyalty:
  - Step-based surfaces, not complex dashboards.

Motion and interaction plan:

- Use Motion for:
  - Page transitions.
  - Modal/drawer transitions.
  - Product card hover/tap states.
  - Cart add feedback.
  - List reveal and filter transitions.
- Use GSAP only for:
  - Hero image/text sequencing.
  - Advanced scroll storytelling.
  - Brand story/heritage parallax.
  - Campaign-level scroll scenes.
- Use Lenis:
  - Storefront scrolling only.
  - Disable or avoid inside admin pages, modals, drawers, and dense data surfaces.
- Use Lottie:
  - Loading, empty cart, order success, and light branded illustrations where useful.
- Custom cursor:
  - Optional desktop-only enhancement.
  - Must be disabled on touch devices and when `prefers-reduced-motion` is enabled.
  - Must not hide native cursor for form-heavy admin screens.
- Always respect `prefers-reduced-motion`.

Implementation approach:

- Keep Mantine for admin and operational workflows.
- Use Mantine primitives only where useful on the storefront, but apply TeahTreats Tailwind styling for brand surfaces.
- Create storefront-specific domains:
  - `components/functional-components/TeahTreatsStorefront/`
  - `contents/functional-contents/TeahTreatsStorefront/`
  - `hooks/TeahTreatsStorefront/`
  - `constants/TeahTreatsStorefront/`
  - `types/TeahTreatsStorefront/`
  - `services/TeahTreatsStorefront/`
- Keep backend APIs unchanged where possible. UI modernization should consume existing storefront, cart, search, product, bundle, office plan, and loyalty endpoints.
- Use existing product image metadata first. Where seed/demo imagery is missing, add realistic snack placeholders through seed data rather than hardcoding fake data in UI.

Accessibility and performance rules:

- Maintain color contrast for cream/gold/red text on black backgrounds.
- Do not rely on color alone for stock, discount, or error states.
- Provide visible focus states for keyboard users.
- Keep buttons at least 44px tall on mobile.
- Lazy-load heavy imagery below the first viewport.
- Use responsive image sizes and avoid shipping full desktop images to mobile.
- Decorative motion must never block browsing, cart, checkout, login, payment, or admin workflows.

Admin visual boundary:

- Admin screens should not copy the luxury storefront wholesale.
- Admin remains work-focused: practical density, clear tables/cards, restrained motion, Mantine components, and simple grammar.
- Brand accents may appear in admin navigation, badges, buttons, and empty states, but admin usability wins over decoration.

First UI modernization pass acceptance:

- The home page must be reorganized into clear product and commerce sections: Hero, New Arrivals, Popular Snacks, Fresh Picks, Bundles, Office Snack Planning, Categories, Brand Story, Testimonials, and Newsletter/Footer.
- Product cards must support API-provided multi-image media. The primary image is shown by default, the secondary image appears on hover-capable devices, and indicators show when multiple images exist.
- On touch/mobile devices, product cards with multiple images must auto-transition through images smoothly because hover is unavailable. The transition should pause when the product details modal/drawer is open, respect `prefers-reduced-motion`, avoid layout shift, and never block tap targets.
- Product cards must provide explicit actions for viewing details and adding to cart. Details open a focused modal/drawer with image gallery, SKU selection, price, availability, tags, and backend-owned add-to-cart behavior.
- Missing product media must render a branded fallback treatment with snack/category cues. Do not show broken images, empty blocks, or skeletal placeholder cards as final UI.
- The optional custom cursor must never interfere with click or tap behavior. It must be disabled on touch/mobile devices and when reduced motion is preferred, use `pointer-events: none`, and use a conservative z-index below app overlays.
- The first admin polish pass must connect the dashboard to existing report data, refresh the admin auth experience, normalize page headers/states, and make modals/drawers scroll internally instead of pushing body scroll.
- Admin pages may receive shared shell/state improvements in this pass, but deep redesign of every admin domain belongs to later slices.

Second UI/operations correction pass:

- Category discovery may use remote snack imagery with motion treatment, but the images must remain content, not empty decoration. Hover and scroll motion must be disabled or softened for reduced-motion users.
- The brand story and testimonials should be interactive but lightweight: scroll reveal, parallax media, rotating testimonial cards, and culturally relevant customer names for the target audience.
- Newsletter subscription is a real backend action. The storefront posts to a tenant-scoped newsletter endpoint and persists subscription status; it must not be only local React state.
- Dashboard and reports must surface the real API error when tenant access, session, or permissions are missing. The UI must not hide authorization failures behind generic unavailable copy.
- Notification delivery must be smoke-testable from admin. A smoke test creates normal notification log records and attempts provider delivery for email, SMS, WhatsApp, and in-app channels.
- Reservation expiry must release held stock transactionally when an order expires in payment flow; Redis/OpenSearch/outbox side effects are not allowed to be the only release mechanism.
- Admin product creation should move toward a single multistep wizard with product basics, snack metadata, SKUs, and multi-image upload in one guided flow.

### Reference Brand UX Audit: iyatega.com

Reference reviewed directly on August 12, 2026: `https://iyatega.com/`.

Observed site profile:

- Iya Tega is positioned as African and intercontinental cuisine with the promise `Good Food | Great Service`.
- The site uses a simple restaurant structure: logo-led header, Home/Menu/About/Contact navigation, strong `Reservation` CTA, full-bleed food hero, welcome/about section, hours, menu preview, happy-hours/offer section, testimonials, social links, phone reservation CTA, and compact footer.
- The site appears to be WordPress/Elementor, with IBM Plex Sans as the body font, a pale lavender page background, dark CTA button, real food photography, menu item pricing, phone number, and social links.
- The strongest experience pattern is clarity: a customer immediately understands the food category, sees real food, can open the menu, and can reserve/contact without learning a complex interface.

Useful patterns TeahTreats should adapt:

- Lead with food, not abstract design. Iya Tega's strongest asset is real cuisine imagery in the first viewport. TeahTreats should keep snack/product photography as the first signal on the storefront hero and product sections.
- Keep the header simple. The Iya Tega nav uses a small set of obvious routes plus one primary CTA. TeahTreats should avoid crowded desktop navigation and keep mobile navigation compact: Products, Bundles, Office Plans, Search, Cart, Account.
- Make the primary conversion path obvious. Iya Tega uses `Reservation`; TeahTreats should use similarly direct CTAs: `Shop Snacks`, `Build a Bundle`, `Plan Office Snacks`, and `View Cart`.
- Use menu/product previews with names, descriptions, and prices. TeahTreats product cards should show name, short sensory description, price, availability, category/dietary tag, and one clear action.
- Add direct trust/contact cues. TeahTreats should expose support email/phone, order readiness expectations, refund/allergy links, and social links in the footer and checkout-adjacent surfaces.
- Use culturally warm storytelling. TeahTreats can borrow the approachable food-service tone without copying the restaurant brand: short story sections, customer quotes, and African/Nigerian customer names where appropriate.

Gaps in TeahTreats revealed by the reference:

- TeahTreats has richer commerce functionality, but parts of the storefront can feel more complex than the reference. The shopping journey must remain as simple as the restaurant journey: browse, choose, cart, checkout, payment, readiness notification.
- The homepage should not bury the product path under decorative sections. Product sections must be clearly separated into New Arrivals, Popular Snacks, Fresh Picks, Bundles, Office Planning, and Categories.
- Product cards must avoid empty or skeletal states. If a product image is missing, use a branded snack fallback and seed better product imagery instead of showing blank cards.
- The footer should behave like a trust and action hub, not only legal links. It should include support/contact, social links, order/payment help, refund policy, privacy, terms, and allergy disclaimer.
- Admin UI should not imitate the restaurant/storefront look. Admin should borrow only clarity: direct labels, obvious primary actions, short empty states, and predictable page structure.

Recommended TeahTreats improvements:

- Storefront hero:
  - Keep a real snack image background.
  - Use one short headline and two clear CTAs.
  - Add compact trust stats only if they do not compete with the action.
- Navigation:
  - Keep desktop nav route count small.
  - Keep search and cart as persistent actions.
  - Ensure notification overlays, custom cursors, and motion layers never intercept nav clicks.
- Product discovery:
  - Use menu-like product previews with price and a short description.
  - Add section-level intent: `New Arrivals`, `Popular Snacks`, `Fresh Picks`, `Bundles`, `Office Plans`.
  - Treat multi-image cards as product inspection aids, not decorative animation.
- Story and trust:
  - Use a concise `Our Story` section focused on fresh snacks, Nigerian/African-inspired treats, office planning, and reliable order readiness.
  - Use rotating testimonials with Nigerian/African names and practical claims: freshness, office reliability, gifting quality, and easy pickup/delivery handoff.
  - Show phone/email/contact and social links in footer.
- Checkout:
  - Keep checkout closer to restaurant reservation clarity: clear customer details, clear payment choice, clear success state, clear readiness notification.
- Admin:
  - Use Iya Tega's clarity principle, not its visual style. Admin pages should show one primary action, one table/card list, and modals for changes.

Mobile-first rules from the reference:

- First viewport must show brand, food category, and primary action without requiring horizontal navigation.
- Food imagery must crop intentionally on mobile; text must not overlap faces, product details, or CTA buttons.
- Header must remain tappable with 44px minimum hit targets.
- Menu/product previews should stack vertically with short descriptions and visible prices.
- Social/contact actions should be reachable near the footer and after checkout/payment states.

What TeahTreats should avoid from the reference:

- Do not copy the pale lavender restaurant palette; TeahTreats keeps black, crimson, gold, and cream.
- Do not copy WordPress/Elementor layout artifacts, duplicate nav markup, decorative utensils, or chat widgets that cover primary content.
- Do not make the storefront only brochure-like; TeahTreats is transactional ecommerce and must keep product, cart, checkout, payment, and account flows first-class.
- Do not rely on large unoptimized images. TeahTreats should use responsive images, lazy loading below the fold, and seeded product media.
- Do not add floating widgets or notification containers that block nav/cart/search hit targets.

Risks and tradeoffs:

- Borrowing restaurant warmth can improve trust, but too much brochure-style storytelling may slow shopping. Product discovery and cart actions must stay dominant.
- Rich food imagery improves conversion but can harm performance if not responsive and lazy-loaded.
- Cultural storytelling helps brand specificity, but copy must remain inclusive and clear for all U.S. customers.
- Motion can make the storefront feel premium, but it must never interfere with clicks, scrolling, checkout, forms, or reduced-motion preferences.

Next recommended implementation slice:

- Implement a `Reference UX Storefront Refinement` slice:
  - tighten homepage navigation and CTA hierarchy,
  - add restaurant-style product/menu preview clarity to product cards,
  - improve footer trust/contact/social blocks,
  - refine story/testimonial content with Nigerian/African customer names,
  - audit mobile first viewport and hit targets,
  - remove or constrain any floating layer that can block nav/cart/search.

### African Food-Service Storefront Refinement

This refinement turns the TeahTreats storefront away from generic premium snack language and toward a simpler African food-service ecommerce experience.

Decision:

- The public storefront must lead with real TeahTreats products: Signature Zobo, puff puff trays, meat pie trays, samosa/spring roll trays, scotch egg bites, party snack combos, and custom celebration cakes.
- Generic seeded storefront products such as truffle almonds, pistachio mixes, wafers, popcorn, gummies, nuts, and abstract snack boxes are not part of the MVP public catalog and should be archived by seed cleanup.
- The homepage should feel closer to a calm food menu than a dense luxury marketplace. Customers should understand the business within three seconds: African snacks, custom cakes, zobo, visible prices, secure checkout, and readiness notifications.

Storefront structure:

- Hero: real food image, one clear headline, short copy, and two CTAs: `Order Snacks` and `Plan a Tray`.
- Menu preview: four to six recognizable products with name, short description, category, and price. Avoid long copy and avoid duplicating the full catalog.
- Product rails: group products by real food-service intent:
  - `Signature Drinks`
  - `Fresh Pastries`
  - `Party Trays`
  - `Custom Cakes`
  - `Popular Picks`
- Categories: use real product photos and simple labels: party trays, fresh pastries, signature drinks, celebration cakes, and office planning.
- Product cards: support multiple images, hover transition on desktop, automatic smooth image cycling on touch devices, visible price, availability, and one clear add action.
- Story/testimonials/footer: use warm family and food-service copy, Nigerian/African customer names, phone/social/contact cues, legal links, refund policy, privacy, terms, and allergy disclaimer.

Copy rules:

- Prefer plain words: `Puff Puff Tray`, `Classic Meat Pie Tray`, `Party Snack Combo`, `Custom Cake`.
- Avoid abstract product names unless they are actual branded items.
- Keep descriptions short and practical: what it is, who it is for, and whether it is fresh or made to order.
- Do not make the storefront sound like a chocolate boutique unless the actual product is chocolate.

Operational rules:

- Seed data for the platform tenant must keep the real MVP catalog active and archive retired generic seeded slugs.
- Storefront APIs remain backend-owned for visibility, price, availability, and inventory rules.
- Redis/OpenSearch may accelerate discovery but must not become the source of truth.
- Mobile product image transitions must not depend on hover or custom cursor behavior.

Risks and tradeoffs:

- A simpler food-service presentation may feel less “luxury marketplace,” but it improves clarity and conversion for actual snack/catering customers.
- Real product imagery improves trust but requires image hygiene, compression, and consistent alt text.
- Archiving old seeded products is correct for MVP demos, but production seed scripts must be careful not to archive merchant-created products accidentally.

## Mantine vs shadcn/ui Decision

Choose Mantine for MVP.

Mantine is better for this project because the MVP has a large admin surface: product management, inventory management, order management, manual payment review, users, permissions, reports, promotions, and settings. Mantine provides production-ready components that reduce implementation time.

shadcn/ui remains a valid later option for highly custom storefront sections, but it requires more assembly work. For a 3-week MVP, Mantine plus Tailwind is more practical.

## Backend Architecture

Use NestJS as a modular monolith.

Primary modules:

- Auth
- Users
- RBAC
- Tenancy
- Catalog
- Media
- Inventory
- Cart
- Checkout
- Orders
- Payments
- Manual Payments
- Promotions
- Loyalty
- Recommendations
- Search
- Notifications
- Audit
- Admin
- Vendor
- Reports
- Outbox
- Workers
- Realtime
- Webhooks

Each module should follow:

```text
module/
  application/
    commands/
    queries/
    services/
  domain/
    entities/
    events/
    policies/
    value-objects/
  infrastructure/
    repositories/
    mappers/
  presentation/
    controllers/
    dto/
```

## API Strategy

Use REST as the primary API style.

Reasons:

- Clear resource boundaries.
- Easy OpenAPI documentation.
- Easy webhook testing.
- Good fit for checkout, payment, inventory, and admin mutations.
- Works for future mobile apps and third-party integrations.
- Avoids tight frontend-backend coupling from tRPC.
- Avoids GraphQL authorization, caching, and mutation complexity for commerce workflows.

Route groups:

```text
/api/v1/shop/*
/api/v1/auth/*
/api/v1/account/*
/api/v1/admin/*
/api/v1/vendor/*
/api/v1/webhooks/*
/api/v1/realtime/*
```

API rules:

- Validate all inputs with DTOs.
- Use OpenAPI.
- Use idempotency keys for dangerous writes.
- Use request correlation IDs.
- Use rate limits.
- Use webhook signature verification.
- Use standard error responses.

## Realtime Strategy

Use SSE first for realtime updates.

SSE is enough for:

- New paid order alerts.
- Manual payment proof alerts.
- Order status updates.
- Inventory low-stock alerts.
- Search sync failure alerts.
- Notification failure alerts.
- Customer order readiness updates.

Use WebSockets later if the product needs bidirectional realtime features such as group carts, collaborative office snack planning, live admin chat, or multi-user cart editing.

## Data Model Overview

Core entities:

- Tenant
- TenantLocation
- User
- Role
- Permission
- Product
- ProductVariant
- SKU
- Category
- Brand
- ProductImage
- InventoryItem
- InventoryBatch
- InventoryReservation
- Cart
- CartItem
- Order
- OrderItem
- OrderStatusHistory
- Payment
- ManualPaymentProof
- Refund
- Promotion
- Coupon
- LoyaltyAccount
- LoyaltyEvent
- RecommendationEvent
- Notification
- NotificationTemplate
- AuditLog
- OutboxEvent
- SearchSyncJob

Important modeling rules:

- Product is the conceptual item.
- SKU is the sellable stock unit.
- Orders snapshot product name, SKU, price, discount, tax, image, and tenant at purchase time.
- Inventory is tracked by SKU and batch.
- Batches include expiry dates.
- Tenant-owned records include tenant scoping.
- Dangerous admin actions create audit logs.
- External side effects are emitted as outbox events.

## Product And SKU Model

SKU means Stock Keeping Unit.

Example:

```text
Product: Doritos
Variant: Nacho Cheese
SKU: Doritos Nacho Cheese 9.25oz Family Size Bag
```

Products may have:

- Variants
- Sizes
- Flavors
- Pack counts
- Brands
- Categories
- Tags
- Dietary labels
- Allergens
- Ingredients
- Nutrition facts
- Images
- Bundle eligibility
- Tenant-specific availability

Unavailable products should not appear as sellable, but may remain visible to admins.

## Multi-Tenancy Strategy

Use a shared PostgreSQL database with tenant-scoped rows.

Tenant examples:

- Platform-owned store
- Vendor
- Cafeteria
- Store location

Use tenant IDs for tenant-owned resources.

Super-admin:

- Global access.

Admin/vendor staff:

- Scoped access by tenant and permissions.

This is more practical than separate databases per tenant for MVP.

## Authorization Model

Use role-based access control plus granular permissions.

Roles:

- Guest
- Customer
- Super Admin
- Admin
- Support Agent
- Vendor Owner
- Vendor Staff

Permissions should be delegatable.

Approval workflow:

- Super-admin/admin can create or update directly when permitted.
- Delegated users can submit changes for review.
- Approval rules are configurable by super-admin settings.

Support impersonation:

- Allowed only for authorized support/admin users.
- Requires reason.
- Must be audited.
- Must block payment actions, password changes, MFA changes, and destructive account actions.

## Authentication Design

Use custom NestJS auth.

Supported methods:

- Email/password
- Phone OTP
- Social login
- Email verification
- Password reset
- Admin MFA

Session strategy:

- Secure HTTP-only cookies.
- Refresh token rotation.
- Store refresh token hashes server-side.
- Use Redis for blocklist/session acceleration.
- Use CSRF protection where browser cookie flows require it.

User deletion:

- Use soft delete.
- Preserve order records for financial and support history.

## Inventory Strategy

Use reservation-based inventory.

Online payment flow:

```text
Checkout starts
-> Inventory reserved for 15 minutes
-> PaymentIntent created
-> Payment succeeds
-> Reservation converted to committed stock deduction
-> Order moves to paid/preparing
```

Manual payment flow:

```text
Checkout starts
-> Inventory reserved
-> Customer selects manual payment
-> Customer uploads receipt
-> Admin notified
-> Admin approves or rejects
-> Approval commits stock deduction
-> Rejection releases reservation
```

Defaults:

- Online payment reservation: 15 minutes.
- Manual payment reservation: configurable, default 2 hours.
- Admin override allowed with reason.

Perishable inventory:

- Track inventory batches.
- Each batch has expiry date.
- Expired batches are unsellable.
- Fulfillment should use earliest-expiring stock first.
- Low-stock and expiring-stock alerts should appear in admin.

## Cart And Checkout Strategy

Guests can browse and add to cart.

Account creation is required during checkout.

Cart storage:

- Guest cart: Redis plus browser identifier.
- Authenticated cart: PostgreSQL source of truth plus Redis hot cache.
- Cart persists across devices after login.

Cart behavior:

- Prices are recalculated at checkout.
- Inventory is reserved at checkout, not on casual cart add.
- Expired or unavailable SKUs block checkout.
- Checkout must be idempotent.

## Payment Strategy

Supported payment methods:

- Stripe PaymentIntent
- PayPal intent/order flow
- Manual payment methods: CashApp, Venmo, Zelle

Rules:

- Capture real payments immediately.
- Do not store raw card or payment details.
- Store provider IDs, status, amount, currency, timestamps, and metadata.
- Manual payment methods are admin-configurable.
- Manual payment receipts are uploaded to private object storage.
- Manual payment proof triggers admin notification.

Payment states:

```text
pending
requires_action
manual_proof_required
manual_proof_submitted
awaiting_admin_approval
approved
paid
failed
cancelled
refunded
partially_refunded
```

Payment provider webhooks must be idempotent.

## Order Lifecycle

```text
cart
-> checkout_started
-> inventory_reserved
-> payment_pending
-> manual_payment_proof_submitted
-> awaiting_admin_payment_approval
-> payment_approved
-> paid
-> preparing
-> ready_for_pickup_dispatch
-> completed
```

Alternative terminal states:

```text
cancelled
refunded
partially_refunded
payment_failed
expired
```

Rules:

- Admin receives notifications for paid online orders immediately.
- Admin receives manual payment notifications after receipt upload.
- Customer receives order confirmation after payment approval.
- Customer receives readiness notification when order is ready for pickup/dispatch.
- Admin or customer can mark completed.
- Admin can override completion disputes.
- Every status change is stored in order history.

## Delivery Scope

Delivery is outside the application.

The system collects:

- Customer name
- Phone
- Email
- Address
- Order notes
- Optional pickup or dispatch instructions

The system does not manage:

- Drivers
- Delivery partners
- Carrier quotes
- Route optimization
- Geospatial calculation
- Tracking numbers
- Live driver tracking
- Delivery fees

Customer-facing wording should use "Ready for pickup/dispatch" instead of "Out for delivery".

## Promotions, Coupons, And Loyalty

MVP promotion types:

- Bundle discounts
- Free shipping equivalent, if applicable to platform fees
- First-order discount
- Product/category/brand/user-specific coupons
- Scheduled promotions

Promotion rules:

- Backend calculates discounts.
- Coupon usage limits exist globally and per user.
- Stacking rules must be explicit.
- Promotions must be auditable.

Loyalty:

- Add loyalty points and loyalty events after core checkout stabilizes.
- Loyalty quests are a phase-two feature.

## Recommendation Strategy

No AI dependency in MVP.

Use an event-based recommendation engine:

- Past orders
- Product views
- Cart additions
- Category engagement
- Search clicks
- Repeat purchases
- Bundle affinity

Recommendation jobs can compute:

- Reorder suggestions
- Similar snacks
- Frequently bought together
- Dynamic bundle candidates
- Tenant/store popularity

Store events in `recommendation_events`.

## Search Architecture

Use OpenSearch for product search and discovery.

Search supports:

- Name
- Brand
- Flavor
- Ingredients
- Category
- Dietary tag
- Occasion
- Autocomplete
- Typo tolerance
- Filters/facets
- Popularity ranking
- Availability ranking

OpenSearch index includes:

```text
productId
skuId
tenantId
name
brand
categories
tags
flavor
ingredients
dietaryLabels
price
availability
popularityScore
promotionFlags
```

Sync:

```text
PostgreSQL write
-> Outbox event
-> Search sync worker
-> OpenSearch update
-> Search cache invalidation
```

Target search freshness: under 5 seconds.

Use aliases for zero-downtime reindexing.

## Redis Architecture

Redis responsibilities:

- Hot cart cache
- Guest cart storage
- Session acceleration
- Refresh token blocklist
- Rate limiting
- Product detail cache
- Product listing cache
- Search suggestion cache
- BullMQ queues
- Short-lived locks
- Realtime pub/sub support

Redis is not the durable system of record for order-critical data.

Recommended TTLs:

```text
guest cart: 7 days
authenticated cart cache: 30 days
product detail cache: 5-15 minutes
listing cache: 1-5 minutes
search suggestions: 10-30 minutes
online inventory reservation: 15 minutes
manual payment reservation: 2 hours by default
```

If Redis fails:

- Browsing degrades.
- Search suggestions degrade.
- Checkout inventory reservations fail closed.
- Rate limiting uses conservative fallback.

## Object Storage

Use Cloudflare R2.

Use cases:

- Product images
- Category images
- Brand images
- Manual payment receipt uploads
- Future generated thumbnails

Rules:

- Product images can be public via CDN.
- Receipt images must be private.
- Uploads use signed URLs.
- Backend stores metadata in PostgreSQL.
- Virus scanning or moderation can be added later for receipt uploads.

## Notification Architecture

Providers:

- Resend for email.
- Twilio for SMS and WhatsApp.
- Configurable SMTP or Gmail only for testing.

Notifications are sent through workers, not inline request handlers.

Notification channels:

- Email
- SMS
- WhatsApp
- In-app

Notification events:

- Signup
- Email verification
- Password reset
- Order confirmation
- Manual payment proof submitted
- Payment approved
- Payment rejected
- Order preparing
- Ready for pickup/dispatch
- Refund
- Promotion
- New product
- Admin new paid order alert

## Background Jobs And Outbox

Use BullMQ with Redis.

Use the transactional outbox pattern:

1. Business transaction writes domain data.
2. Same transaction writes an outbox event.
3. Worker reads outbox event.
4. Worker performs side effects.
5. Worker marks event processed.

Worker jobs:

- Send notifications.
- Sync OpenSearch.
- Invalidate Redis cache.
- Process payment webhooks.
- Expire inventory reservations.
- Detect low stock.
- Detect expiring batches.
- Compute recommendations.
- Export reports.

Workers must be idempotent and retryable.

## Observability

Use:

- Prometheus metrics.
- Structured JSON logs.
- Request correlation IDs.
- OpenTelemetry-compatible tracing.
- Optional Sentry for frontend/backend exceptions.

Track:

- Orders created.
- Payment failures.
- Manual payment approvals pending.
- Inventory reservation failures.
- Low stock.
- Expiring inventory.
- Notification failures.
- Search sync lag.
- Queue depth.
- Checkout conversion.
- Abandoned carts.

## Security

Security rules:

- Admin MFA is required.
- Use secure HTTP-only cookies.
- Hash passwords using Argon2 or bcrypt.
- Use route-level and user-level rate limits.
- Use bot protection for auth, search, checkout, and uploads.
- Verify payment webhook signatures.
- Never store raw card data.
- Store only payment provider references.
- Keep payment receipts private.
- Use signed upload URLs.
- Enforce tenant scoping in backend policies.
- Audit dangerous actions.
- Soft-delete users.
- Keep route errors generic where sensitive data is involved.
- Keep production provider dashboards behind team MFA.
- Store payment receipts in private object storage.

Audit logs should include:

- Actor
- Tenant
- Action
- Target resource
- Before/after summary where safe
- Reason when required
- Request ID
- Timestamp

MVP production security checklist:

- Strong token secrets configured.
- Admin MFA enabled before broad admin access.
- CORS restricted to real domains.
- CSRF enabled for unsafe cookie-auth browser requests.
- Webhook signatures configured and enforced.
- Upload content type and size limits enabled.
- Tenant isolation tested for catalog, inventory, orders, payments, users, and vendors.
- Audit review available for privileged actions.
- Rate limits enforced through Redis before multi-instance production.
- Legal/privacy/refund/allergy pages published.

## Compliance And Legal

The system should support:

- Tax calculation.
- Allergy disclaimers.
- Nutrition labeling.
- Refund policy.
- Terms of service.
- Privacy policy.
- CCPA-style data rights for US customers.
- Invoice or receipt numbering.

Because products are snacks and may be perishable, product pages and order snapshots should preserve allergen and nutrition information where provided.

## Deployment Architecture

MVP deployment uses separate web, API, and worker runtimes.

Runtime boundaries:

- Web runtime: Next.js storefront, account, admin, and vendor UI.
- API runtime: NestJS HTTP server from `apps/api/src/main.ts`.
- Worker runtime: NestJS application context from `apps/api/src/worker.ts`.
- PostgreSQL: durable source of truth.
- Redis: BullMQ, cache, rate limits, short-lived locks, and realtime fanout helper.
- OpenSearch: eventually consistent search read model.

Local development:

- Docker Compose runs PostgreSQL, Redis, and OpenSearch.
- The API and worker run separately in local terminals.
- Prisma schema is generated from root.
- Local database sync uses `prisma db push`; shared staging/prod environments use migrations.

Recommended MVP hosting:

- Next.js: Vercel.
- NestJS API: Render Web Service for staging and low-friction MVP deployment; Fly.io, Railway, or a small VPS remain alternatives.
- NestJS worker: Render Background Worker for staging/MVP, or the same backend host as a separate process/container.
- PostgreSQL: Supabase, Neon, Railway, or managed PostgreSQL.
- Redis: Upstash or self-hosted Redis.
- OpenSearch: self-hosted for MVP if budget requires.
- Object storage: Cloudflare R2.
- Email: Resend.
- SMS/WhatsApp: Twilio.

Hybrid deployment decision:

- Vercel owns the browser-facing Next.js runtime and only receives browser-safe public identifiers such as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_API_BASE_URL`, and the temporary public tenant identifier.
- Render owns the API and worker runtimes for staging and budget-conscious MVP production. API and worker share the same Docker image but run different commands.
- PostgreSQL, Redis, and OpenSearch should be managed services where practical. OpenSearch may be postponed in the lowest-budget MVP because storefront search has a PostgreSQL fallback.
- Provider secrets for Stripe, PayPal, Cloudinary, R2, Resend/Gmail, Twilio, cookies, CSRF, and MFA remain backend-only in Render or the backend secret manager.
- GitHub Actions may trigger Vercel and Render deployments from `main`, but production should use protected environments and migration/backup gates before broad launch.
- The full operational guide lives in `docs/deployment-production-readiness.md`.

Production deployment should prefer:

- Managed PostgreSQL with PITR backups.
- Managed Redis.
- Managed OpenSearch once search becomes business-critical.
- Dedicated API process.
- Dedicated worker process.
- Separate staging and production environments.
- Infrastructure as code once the deployment shape stabilizes.
- Secrets stored only in deployment provider secret managers.

Production deployment sequence:

```text
CI passes
-> build backend image
-> backup database
-> run Prisma migrate deploy
-> deploy API
-> confirm health
-> deploy worker
-> deploy Vercel web
-> run smoke checks
-> watch logs, queues, outbox lag, notifications, and payment webhooks
```

Do not auto-deploy production until explicit approval gates and rollback procedures exist.

## Availability And Disaster Recovery

Target MVP availability: 99.9% where practical.

Backup policy:

- Nightly backups minimum.
- Prefer managed PostgreSQL with point-in-time recovery.
- R2 object storage should retain private receipts.
- Scheduled GitHub Actions backups can run `pg_dump`, upload the artifact, and notify Telegram, Discord, Slack, or Teams when secrets are configured.
- Telegram and Discord can receive backup files directly; Slack and Teams incoming webhooks receive status messages unless a richer provider API is added later.

Recovery targets for MVP:

- RTO: under 1 hour.
- RPO: best effort based on managed database tier.

Fallbacks:

- If OpenSearch is down, product browsing should fall back to database-backed basic search where possible.
- If Redis is down, checkout should fail closed for inventory-sensitive operations.
- If notification provider is down, queue retries and show admin failure state.
- If Stripe is down, offer other configured payment methods.

## CI/CD

Use GitHub Actions.

Pipeline:

```text
install
Prisma schema validation
Prisma client generation
format check
shared typecheck/build
API typecheck/lint/build/test
web typecheck/lint/build/test
Docker image build
deploy staging
approve production
deploy production
```

Use preview deployments for frontend.

Use Docker for backend API and worker images. Use Docker Compose for local PostgreSQL, Redis, and OpenSearch.

CI must not auto-deploy production unless production secrets, approval environments, and rollback plans are configured.

## Environment Strategy

Use three environment tiers:

- Local: `.env`, Docker Compose infrastructure, seeded sample data.
- Staging: production-like managed services with sandbox Stripe/PayPal and test notification settings.
- Production: managed services, real payment providers, verified notification senders, locked-down secrets.

Environment rules:

- Never commit real secrets.
- Production cookies require secure transport.
- CORS must list exact web origins.
- Staging and production databases must be separate.
- Staging can use sandbox payment keys and test notification channels.
- Production migrations use `prisma migrate deploy`, not `prisma db push`.

## Local Development Workflow

Exact setup:

```text
pnpm install
pnpm dev:env
pnpm infra:start
pnpm db:generate
pnpm dev:db:push
pnpm db:seed
```

Run the app:

```text
pnpm dev:api
pnpm dev:worker
pnpm dev:web
```

Smoke checks:

```text
pnpm smoke:health
pnpm smoke:storefront
pnpm smoke:admin-login
pnpm smoke:customer-auth
pnpm smoke:local
```

The worker must run locally when testing outbox side effects, notifications, reservation expiry, cache invalidation, and OpenSearch sync.

## Testing Strategy

Required tests:

- Unit tests for domain rules.
- Integration tests for inventory reservations.
- Integration tests for checkout.
- Payment webhook idempotency tests.
- Manual payment approval tests.
- Permission and tenant isolation tests.
- Worker retry tests.
- API contract tests.
- Playwright tests for storefront checkout.
- Playwright tests for admin order management.

Critical flows that must not break:

- Registration/login.
- Add to cart.
- Checkout.
- Inventory reservation.
- Online payment success/failure.
- Manual payment proof upload.
- Admin payment approval/rejection.
- Order readiness notification.
- Admin/customer completion.
- Tenant-scoped admin access.

## Strong MVP Scope

Recommended MVP:

- Storefront.
- Auth.
- Catalog.
- Product images.
- SKU variants.
- Cart.
- Checkout.
- Stripe PaymentIntent.
- Manual payments with receipt upload.
- Basic PayPal support if time allows.
- Inventory reservation.
- Batch/expiry model.
- Admin dashboard.
- Product management.
- Inventory management.
- Order management.
- Manual payment review.
- User and permission management.
- Email notifications.
- SMS/WhatsApp notification adapter.
- Realtime admin operations center.
- OpenSearch product search.

Defer:

- Subscriptions.
- Group carts.
- Office snack planning.
- Loyalty quests.
- Advanced recommendation ranking.
- Vendor payout automation.
- Advanced analytics.

## MVP Acceptance Map

The MVP is not considered production-ready until the following backend and skeletal UI surfaces exist. Visual polish is important, but it must follow these functional foundations.

### Must Exist Before Production Beta

| Area                  | Required Backend                                                                                                         | Required Admin/Customer UI                                                          | Notes                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Product management    | Product CRUD, SKU CRUD, image metadata, signed upload, categories/brands/tags/allergens/nutrition JSONB, status workflow | Product table, create/edit modal, details modal, SKU step, image upload/manage step | Product image upload must be visible in admin, not only available as an API endpoint. |
| Inventory             | Batch CRUD, adjustments, expiry, reservations, low-stock/expiring-stock queries                                          | Inventory overview, create batch, adjust stock, expire batch, view ledger           | Perishable snacks require expiry and earliest-expiry fulfillment.                     |
| Storefront            | Active product listing/detail/search, availability, add-to-cart                                                          | Home, products, search, detail, add-to-cart drawer                                  | Draft/archived products must never leak into storefront APIs.                         |
| Cart and checkout     | Persistent cart, checkout reservation transaction, order draft, idempotency                                              | Cart, customer identity/login prompt, reservation summary                           | Redis is optional helper, PostgreSQL is source of truth.                              |
| Payments              | Stripe PaymentIntent, manual methods, receipt upload, manual approval/rejection, PayPal placeholder or basic flow        | Payment page, receipt upload, admin proof review                                    | Manual payment configuration must be admin-manageable before beta.                    |
| Orders                | Admin order list/detail, state transitions, readiness notification, completion, cancellation                             | Admin orders, customer order history/detail, complete action                        | Delivery remains out of scope; use pickup/dispatch wording.                           |
| Auth and RBAC         | Admin auth, customer auth, secure cookies, CSRF, permissions, tenant access                                              | Admin login, customer login/signup, users, roles, approvals                         | Admin MFA can be beta-blocking if real production access is enabled.                  |
| Tenant/vendor control | Tenant CRUD/settings, vendor/staff assignment, scoped inventory/catalog access                                           | Tenant settings, vendor dashboard, vendor users/products/inventory                  | Vendor module cannot remain an empty placeholder for vendor MVP.                      |
| Notifications         | Notification templates, Resend/Twilio adapters, outbox worker, retry state                                               | Notification settings, template preview, notification failure states                | Provider failure must not roll back core business state.                              |
| Search                | OpenSearch index/sync, PostgreSQL fallback, reindex job                                                                  | Search page, admin sync status or failure visibility                                | OpenSearch is a read model only.                                                      |
| Observability         | Health, structured logs, request IDs, queue/outbox status, metrics endpoint                                              | Admin operations center with real counts/failures                                   | Dashboard should show live operational risk, not static zeros.                        |
| Settings              | Tenant settings, manual payment methods, approval rules, notification channels, business profile                         | Admin settings pages                                                                | Avoid hard-coded operational settings in production.                                  |
| Compliance content    | Refund policy, allergy/nutrition capture, privacy/terms placeholders, receipt numbering                                  | Storefront footer/content surfaces and admin product fields                         | Perishable snack sales need clear allergy and refund wording.                         |

### Product Data Fields Required For MVP

Products should support these fields before beta:

- Name, slug, description, status.
- Brand, category, tags, flavor, occasion.
- Ingredients, allergens, nutrition facts, dietary labels.
- Perishable flag, storage instructions, shelf-life notes.
- Product images with alt text, sort order, and public/private storage rules.
- Bundle eligibility and combo metadata.
- SEO title, SEO description, and canonical slug.

SKUs should support:

- Name, price, currency, active status.
- Size, pack count, unit label, barcode/UPC if available.
- Weight/dimensions where useful for internal handling.
- Perishable override when needed.
- Metadata JSONB for snack-specific attributes.

### Admin Product Management UX Acceptance

The product admin page must remain step-based:

1. Show "Create Product" and product table/cards.
2. Create/edit product in a modal.
3. Open product details in a modal or dedicated details surface.
4. Manage SKUs inside product details.
5. Manage images inside product details.
6. Manage merchandising metadata in grouped sections, not one huge form.
7. Archive/restore only through confirmation modals.

### Vendor And Tenant MVP Boundary

Vendor support means more than a placeholder module.

For MVP, vendor support requires:

- Tenant records representing vendor/store/cafeteria ownership.
- Vendor owner and vendor staff roles.
- Tenant-scoped products, SKUs, inventory, and orders.
- Vendor dashboard with products, inventory, and orders limited to that tenant.
- Super-admin tenant settings and tenant access assignment.

Defer vendor payouts, commissions, settlement reports, and marketplace dispute tooling.

### Production Readiness Gates

Before production launch, the following gates must pass:

- All critical flows have backend policy tests.
- Tenant isolation tests cover catalog, inventory, orders, payments, users, and vendors.
- Checkout and inventory reservation concurrency tests pass.
- Payment webhook idempotency tests pass.
- Manual payment proof approval/rejection tests pass.
- Outbox and notification retry tests pass.
- OpenSearch sync failure fallback is tested.
- API health reports database, Redis, OpenSearch, and worker status.
- CI runs lint, typecheck, build, Prisma validate, and core tests.
- Production secrets are environment-driven and not committed.
- Admin MFA is enabled or explicitly blocked behind a beta-only exception.
- Nightly database backups are configured.
- Object storage bucket policies separate public product images from private receipts.
- API and worker are deployed as separate runtimes.
- Staging deployment has been exercised before production.
- Database restore rehearsal has been completed.
- Smoke checks pass against staging and production.
- Operational alerts cover API health, worker failures, queue depth, outbox lag, payment webhook failures, and notification failures.

### MVP Completion Sequence

The MVP was implemented in the following architectural sequence:

1. Scaffold: monorepo, shared package, Next.js, NestJS, Prisma, Redis, OpenSearch, and Docker Compose.
2. Product catalog: tenant-scoped product/SKU CRUD, metadata, image upload metadata, cache/search side-effect hooks.
3. Auth/RBAC/admin users: admin sessions, permissions, tenant access, delegation and approval foundations.
4. Inventory: perishable batches, adjustments, reservations, expiry rules, audit and outbox events.
5. Cart and checkout reservation: PostgreSQL cart source of truth, checkout-start reservations, pricing snapshots.
6. Payments: manual proof flow, payment provider foundations, webhooks, reconciliation, status snapshots.
7. Orders: admin order management, readiness notifications, customer completion, reservation release foundations.
8. Realtime/outbox/workers: SSE, outbox processing, notification worker, Redis fanout, side-effect placeholders.
9. Customer account: signup/login/logout, secure cookie sessions, guest cart migration, order history.
10. Storefront: browsing, search fallback, recommendations foundation, add-to-cart UX.
11. Tenant/vendor: tenant settings, vendor summaries, scoped vendor catalog/inventory/order surfaces.
12. Settings/promotions/loyalty/reports/security: admin operational settings, coupons, group-cart foundations, analytics, security hardening.
13. Deployment and CI/CD: API/worker runtime split, Dockerfiles, environment strategy, local/staging/prod docs, readiness checklist.

## Ingenious Product Features

Recommended first intelligent features:

1. Realtime Admin Operations Center.
2. Dynamic bundle candidates based on purchase and cart patterns.
3. Reorder intelligence based on repeat purchases and engagement.

Later:

- Group carts.
- Office snack planning.
- Loyalty quests.
- Mood/occasion-based discovery.
- Expiring-soon smart discounts.

## Full Monolith Directory Structure

The project should follow this structure throughout implementation.

```text
e-commerce/
  apps/
    web/
      src/
        app/
          (shop)/
            page.tsx
            products/
            categories/
            search/
          (auth)/
            login/
            register/
            forgot-password/
          (account)/
            orders/
            profile/
            addresses/
          (checkout)/
            cart/
            checkout/
            payment/
          (admin)/
            dashboard/
            products/
            inventory/
            orders/
            payments/
            users/
            roles/
            tenants/
            promotions/
            notifications/
            reports/
            settings/
          (vendor)/
            dashboard/
            products/
            inventory/
            orders/
        components/
          functional-components/
            AdminProduct/
            AdminOrder/
            AdminInventory/
            CustomerCart/
            CustomerCheckout/
          ui/
          layout/
          navigation/
          feedback/
          overlays/
          media/
        contents/
          functional-contents/
            AdminProduct/
            AdminOrder/
            AdminInventory/
            CustomerCart/
            CustomerCheckout/
          shop/
          admin/
          checkout/
          account/
          vendor/
        hooks/
          AdminProduct/
          AdminOrder/
          AdminInventory/
          CustomerCart/
          CustomerCheckout/
        validation/
          AdminProduct/
          AdminOrder/
          AdminInventory/
          CustomerCart/
          CustomerCheckout/
        constants/
          AdminProduct/
          AdminOrder/
          AdminInventory/
          CustomerCart/
          CustomerCheckout/
        types/
          AdminProduct/
          AdminOrder/
          AdminInventory/
          CustomerCart/
          CustomerCheckout/
        services/
          AdminProduct/
          AdminOrder/
          AdminInventory/
          CustomerCart/
          CustomerCheckout/
        lib/
          api/
          auth/
          query/
          realtime/
          formatters/
        providers/
        styles/
      public/
      next.config.mjs
      tsconfig.json

    api/
      src/
        main.ts
        app.module.ts
        common/
          constants/
          decorators/
          dto/
          errors/
          exceptions/
          filters/
          guards/
          interceptors/
          pipes/
          types/
          utils/
        config/
          app.config.ts
          auth.config.ts
          database.config.ts
          redis.config.ts
          search.config.ts
          storage.config.ts
          notifications.config.ts
          payments.config.ts
          env.schema.ts
        infrastructure/
          database/
            prisma.service.ts
            transaction.service.ts
          redis/
            redis.module.ts
            redis.service.ts
          queue/
            queue.module.ts
            bullmq.service.ts
          search/
            opensearch.module.ts
            opensearch.service.ts
          storage/
            r2.module.ts
            r2.service.ts
          notifications/
            email/
            sms/
            whatsapp/
          payments/
            stripe/
            paypal/
            manual/
          observability/
            logger/
            metrics/
            tracing/
        modules/
          auth/
            application/
            domain/
            infrastructure/
            presentation/
          users/
            application/
            domain/
            infrastructure/
            presentation/
          rbac/
            application/
            domain/
            infrastructure/
            presentation/
          tenancy/
            application/
            domain/
            infrastructure/
            presentation/
          catalog/
            application/
            domain/
            infrastructure/
            presentation/
          media/
            application/
            domain/
            infrastructure/
            presentation/
          inventory/
            application/
            domain/
            infrastructure/
            presentation/
          cart/
            application/
            domain/
            infrastructure/
            presentation/
          checkout/
            application/
            domain/
            infrastructure/
            presentation/
          orders/
            application/
            domain/
            infrastructure/
            presentation/
          payments/
            application/
            domain/
            infrastructure/
            presentation/
          manual-payments/
            application/
            domain/
            infrastructure/
            presentation/
          promotions/
            application/
            domain/
            infrastructure/
            presentation/
          loyalty/
            application/
            domain/
            infrastructure/
            presentation/
          recommendations/
            application/
            domain/
            infrastructure/
            presentation/
          search/
            application/
            domain/
            infrastructure/
            presentation/
          notifications/
            application/
            domain/
            infrastructure/
            presentation/
          audit/
            application/
            domain/
            infrastructure/
            presentation/
          admin/
            application/
            presentation/
          vendor/
            application/
            presentation/
          reports/
            application/
            infrastructure/
            presentation/
          outbox/
            application/
            domain/
            infrastructure/
        workers/
          worker.module.ts
          processors/
            outbox.processor.ts
            notifications.processor.ts
            search-sync.processor.ts
            cache-invalidation.processor.ts
            inventory-reservation.processor.ts
            recommendations.processor.ts
            expiry-alerts.processor.ts
            report-export.processor.ts
        realtime/
          realtime.module.ts
          sse.controller.ts
          events.gateway.ts
        webhooks/
          stripe.webhook.ts
          paypal.webhook.ts
      test/
      tsconfig.json

  packages/
    shared/
      src/
        constants/
        events/
        permissions/
        schemas/
        types/
        validation/
      tsconfig.json
    eslint-config/
    tsconfig/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  docker/
    postgres/
    redis/
    opensearch/

  docs/
    adr/
      0001-system-architecture.md
    architecture/
    api/

  .github/
    workflows/
      ci.yml
      deploy.yml

  docker-compose.yml
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

## TypeScript Policy

Frontend and backend must use the latest TypeScript version that is stable across the selected toolchain.

As of 2026-08-05, TypeScript `7.0.2` is available as the latest native compiler package, but TS7 does not expose the compiler API needed by several tools in this stack. The project will therefore use TypeScript `6.0.3` as the stable fallback for implementation, linting, builds, and CI.

Policy:

- Pin TypeScript consistently across the monorepo.
- Share strict compiler settings through `tsconfig.base.json`.
- Enable strict mode.
- Use automated dependency updates.
- Upgrade to TypeScript 7 only when Next.js, NestJS, Prisma, and typescript-eslint validate cleanly together.
- Record any TypeScript major-version upgrade as a follow-up ADR or ADR amendment.

Baseline compiler expectations:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Alternatives Considered

### MongoDB Primary

Pros:

- Flexible product documents.
- Fast schema iteration.
- Natural JSON-like catalog modeling.

Cons:

- Less ideal for order, payment, permission, inventory, audit, and reporting relationships.
- Multi-document transactions add complexity.
- Financial workflows benefit from relational constraints.

Decision: rejected as primary database.

### GraphQL

Pros:

- Flexible client queries.
- Useful for nested dashboards and complex read models.

Cons:

- Harder authorization.
- Harder caching.
- More complex rate limiting.
- Mutations for checkout/payment/order state are procedural anyway.

Decision: defer.

### tRPC

Pros:

- Excellent TypeScript developer experience.
- Fast for one frontend and one backend team.

Cons:

- Tightly couples frontend and backend.
- Less suitable for future mobile apps, partner integrations, and public contracts.
- REST and OpenAPI are more durable for commerce APIs.

Decision: defer.

### Microservices

Pros:

- Independent scaling and deployment.

Cons:

- Too much complexity for MVP.
- Harder local development.
- Harder transactions.
- More operational burden.

Decision: rejected for MVP.

## Risks And Mitigations

Risk: MVP scope exceeds 3 weeks.

Mitigation: prioritize Strong MVP and defer group carts, office planning, subscriptions, advanced loyalty, and advanced recommendations.

Risk: OpenSearch exceeds budget.

Mitigation: self-host for MVP or temporarily fall back to PostgreSQL full-text search for early testing while preserving OpenSearch architecture.

Risk: Manual payment fraud.

Mitigation: private receipt upload, admin approval, audit trail, rejection flow, and clear order state.

Risk: Tenant data leakage.

Mitigation: tenant guards, scoped repositories, permission tests, and audit logging.

Risk: Inventory mistakes for perishable snacks.

Mitigation: SKU-level reservations, batch-level expiry tracking, earliest-expiry fulfillment, and low-stock/expiry alerts.

Risk: Cache/search stale data.

Mitigation: outbox-driven invalidation, short TTLs, idempotent sync workers, and fallback reads from PostgreSQL where correctness matters.

## Implementation Phases

Phase 1: Foundation

- Monorepo.
- Next.js app.
- NestJS app.
- TypeScript 6.0.3 stable fallback.
- PostgreSQL and Prisma.
- Auth.
- RBAC.
- Tenancy.
- Basic admin shell.

Phase 2: Commerce Core

- Catalog.
- SKUs.
- Product images.
- Inventory.
- Batch/expiry model.
- Cart.
- Checkout.
- Orders.

Phase 3: Payments And Notifications

- Stripe PaymentIntent.
- Manual payment receipt upload.
- Manual payment approval.
- PayPal support if time allows.
- Resend email.
- Twilio SMS/WhatsApp.
- In-app notifications.

Phase 4: Realtime, Search, And Workers

- SSE admin updates.
- Customer order updates.
- Redis caching.
- BullMQ workers.
- OpenSearch indexing.
- Outbox processing.
- Realtime Operations Center.

Phase 5: Growth Features

- Recommendations.
- Dynamic bundles.
- Loyalty.
- Group carts.
- Office snack planning.
- Subscriptions.
- Advanced reports.

## Consequences

Positive:

- Strong transactional foundation.
- Practical MVP path.
- Clear frontend/backend boundaries.
- Good future mobile/API compatibility.
- Strong auditability.
- Better inventory and payment correctness.
- Modular enough to split later.

Negative:

- PostgreSQL JSONB catalog modeling requires discipline.
- OpenSearch adds operational overhead.
- Event/outbox architecture adds worker complexity.
- Mantine may be less visually unique than a fully custom shadcn storefront.

## Final Recommendation

Use a PostgreSQL-backed NestJS modular monolith with a realtime event spine.

The final architecture is:

- Next.js App Router frontend.
- TypeScript 6.0.3 stable fallback across frontend and backend.
- Mantine plus Tailwind CSS.
- NestJS REST API.
- PostgreSQL plus Prisma as the source of truth.
- Redis plus BullMQ for cache, queues, locks, and realtime support.
- OpenSearch for search.
- Cloudflare R2 for media and private receipt storage.
- Resend for email.
- Twilio for SMS and WhatsApp.
- Transactional outbox for reliable side effects.
- SSE first for realtime user/admin experience.

This architecture is ambitious in the right places: it is not a fragile MVP script, and it is not premature microservices. It gives the owner a reliable commerce core, realtime operational visibility, and a clean path toward dynamic bundles, recommendations, loyalty, office snack planning, subscriptions, and larger multi-tenant growth.
