# 505th Expeditionary Force — Official Website

Official website for the **505th Expeditionary Force**, a UNSC/Halo-themed Arma 3 OPTRE military simulation unit.

🔗 **Live Site:** [505expeditionaryforce.com](https://www.505expeditionaryforce.com)

---

## Features

### Public Pages
- **Home** — Unit overview, career paths, recruitment CTA, video showcase
- **About Us** — Dedicated pages for each branch: 505th Overview, Alpha Company, JTF-23 Force Recon, Hospital Corpsman, 54th Air Wing
- **Media** — Dynamic gallery and video pages powered by Firestore with admin-controlled visibility
- **Resources**
  - Discord Rules & Enforcement policy
  - General Handbook (unit SOPs, rank structure, rules of engagement)
  - Control Reference (Arma 3 keybind guide)
  - Order of Battalion — Interactive hierarchy tree (pan/zoom/collapse) + unit cards with live slot data
  - Battalion Roster — Live personnel database with platoon groupings
  - After Action Reports — Searchable mission archive with detail modals
  - Field Lexicon — Military terminology glossary with category filtering

### Admin Panel (Command Terminal)
- **Dashboard** — Pending registrations, active personnel stats, recent joins
- **Personnel** — Approve/deny registrations, promote ranks, role-based access control
- **Media Library** — Upload images/videos to Cloudinary, toggle visibility on public pages
- **Unit Management**
  - After Action Reports — Full 10-section report builder with Discord webhook integration and Cloudinary image attachments
  - Battalion Roster — Attendance tracking (checkbox +1), PT glow system, monthly auto-reset with safety net promotion
  - Unit Cards — Manage all position slots (open/closed/filled), organised by squad, synced to Order of Battalion
- **Page Content** — CMS slot system for all about pages (photo sliders, info cards, text)
- **Site Settings** — Discord invite link management, Discord tracking

### Authentication & Access Control
- Firebase Auth with role-based access: Commander, Developer, Staff NCO, NCO, Recruiter, Marine, Enlistee
- Pages handle their own auth gates (no forced redirects)
- Login return-to-origin flow
- Profile page with rank history and time-in-unit tracking

### Accessibility
- High-contrast text throughout (WCAG-friendly on dark backgrounds)
- CSS variable overrides for consistent readability
- Enlarged touch targets on mobile (hierarchy tree toggle dots)
- Touch-aware pan/zoom with tap detection on mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | Vercel Hosting |
| Database | Firebase Database |
| Auth | Firebase Authentication |
| Media Storage | Cloudinary |
| Fonts | Google Fonts (Rajdhani, Share Tech Mono) |
| Webhooks | Discord Webhooks (AAR notifications) |

---

## Project Structure

```
505th-website/
├── css/
│   ├── pages.css          # Shared layout, nav, footer
│   ├── auth.css           # Login button, dropdown, auth states
│   ├── discord-rules.css  # Rules page styling
│   └── handbook.css       # Handbook sections, rank cards, info boxes
├── js/
│   ├── nav.js             # Tactical dropdown menu toggle
│   ├── scroll.js          # Auto-hide navbar on scroll
│   ├── auth.js            # Firebase auth state, navbar updates
│   └── cms.js             # CMS slot rendering, Discord link sync
├── images/
│   ├── logo.png           # 505th main logo
│   ├── logos/             # Branch logos (Alpha, Stalker, Corpsman, Air Wing)
│   └── icons/             # Nav menu icons
├── home.html
├── login.html
├── admin.html             # Command Terminal (admin panel)
├── profile.html
├── about-505th.html
├── about-alpha-company.html
├── about-stalker.html
├── about-corpsman.html
├── about-54th-air-wing.html
├── media-gallery.html
├── media-videos.html
├── resources-discord-rules.html
├── resources-handbook.html
├── resources-keybinds.html
├── resources-order-of-battle.html
├── resources-roster.html
├── resources-aar.html
└── resources-field-lexicon.html
```

---

## Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Auth profiles, roles, rank history |
| `media` | Gallery/video entries with visibility toggle |
| `roster` | Personnel records, attendance, PT tracking |
| `aars` | After Action Report documents |
| `settings/unit_cards` | Order of Battalion slot assignments |
| `settings/page_content` | CMS slot data for about pages |
| `settings/site` | Discord invite link |
| `settings/roster_meta` | Monthly attendance reset tracking |

---

## Role Permissions

| Role | Personnel | Media | Page Content | AAR | Roster | Settings |
|------|-----------|-------|-------------|-----|--------|----------|
| Commander | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Developer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staff NCO | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| NCO | ✅ | ✅ | — | ✅ | ✅ | — |
| Recruiter | ✅ | — | — | — | — | — |
| Marine | — | — | — | — | — | — |
| Enlistee | — | — | — | — | — | — |

---

## Development

**Developer:** RevGamer

---

© 2026 505th Expeditionary Force • 505th Dev Team