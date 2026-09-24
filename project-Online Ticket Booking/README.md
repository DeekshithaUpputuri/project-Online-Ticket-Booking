# TicketHub — Online Ticket Booking System

A front-end ticket booking demo for movies, cricket matches, and live
events, with account creation/login, a multi-step booking flow,
seat selection with standard/premium tiers, promo codes, booking
history, a wishlist, dark mode, and an instant digital ticket.

This is a **static, front-end-only project** — everything (accounts,
bookings, wishlist) is stored in the browser's `localStorage`. There
is no server and no database yet. That's fine for a course project or
portfolio piece, but it means:

- Data lives only in one browser on one device — clearing site data
  wipes accounts and bookings.
- Passwords are stored in plain text client-side, which is fine for a
  demo but must never be done in a real product.
- Seat availability isn't shared between visitors — two people could
  "book" the same seat in two different browsers.

## Project structure

```
index.html   — page structure and markup for every section/modal
style.css    — design system (CSS variables), layout, dark theme, animations
script.js    — all app logic: auth, booking flow, seats, pricing, storage
```

`script.js` is organized top-to-bottom into clearly labeled sections
(state, storage helpers, booking flow, seat map, pricing, rendering)
rather than a build system with multiple modules, so it can be opened
directly in a browser without a bundler or local server.

## Features

- **Accounts** — sign up / log in / log out, session persisted locally.
- **Booking flow** — movies, cricket, and events each have their own
  step-by-step path (category → theatre/state → time/match → seats).
- **Seat map** — generated per booking with standard and premium
  (surcharge) rows, live pricing as you select seats.
- **Promo codes** — `FIRST50`, `STUDENT10`, `WELCOME20`.
- **My account** — booking history with cancel, and a saved-movies
  wishlist, both scoped to the logged-in user.
- **Search & filters** — search movies by name/genre, filter by genre chip.
- **Dark mode**, **mobile hamburger nav**, **scroll-reveal animations**,
  **animated stats counters**, **toast notifications**, **FAQ accordion**,
  **testimonials**, **printable ticket** (browser print → Save as PDF),
  **newsletter signup**.

## How to run it

Just open `index.html` in a browser — no install step, no server
needed. (For the cleanest experience, e.g. relative asset paths,
you can also serve the folder with any static file server such as
`npx serve` or the VS Code "Live Server" extension.)

## Adding a real backend later

If/when this needs to support real users, the front end can stay
almost exactly as-is — swap the `localStorage` calls for `fetch()`
calls to an API. Suggested path:

1. **API + database**: Node.js + Express (or Django/Flask) with
   PostgreSQL or MongoDB. Tables/collections: `users`, `bookings`,
   `wishlist`, `events` (movies/matches replacing the hardcoded
   catalogs in `script.js`).
2. **Auth**: hash passwords with `bcrypt`, issue a signed session
   (JWT or an HTTP-only cookie session). Never store or transmit
   plain-text passwords — replace `handleSignup`/`handleLogin` in
   `script.js` with calls to `POST /api/signup` and `POST /api/login`.
3. **Bookings & seat locking**: move `addBookingForUser` /
   `cancelBooking` to `POST /api/bookings` and
   `DELETE /api/bookings/:id`, with the server as the single source
   of truth for which seats are taken (this is what actually prevents
   two people from booking the same seat).
4. **Payments**: integrate a real gateway (Razorpay, Stripe) instead
   of the current "instant confirm" flow — create an order server-side,
   confirm the booking only after payment succeeds.
5. **Admin/organizer view**: a protected set of routes/pages for
   adding events, adjusting prices, and viewing sales analytics —
   this is the natural home for the "Organizer analytics" feature
   already advertised on the landing page.
6. **Deployment**: host the static front end (Netlify/Vercel/GitHub
   Pages) and the API separately (Render/Railway/a small VPS), or
   serve both together from one Node server.

None of this requires rewriting the UI — it's mostly replacing the
storage-helper functions in `script.js` with API calls and adjusting
error handling for network failures.
