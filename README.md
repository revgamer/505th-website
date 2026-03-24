# 505th Expeditionary Force — Official Website

Official website for the **505th Expeditionary Force**, a UNSC/Halo-themed Arma 3 OPTRE military simulation unit.

🔗 **Live Site:** [505expeditionaryforce.com](https://www.505expeditionaryforce.com)

---

## Public Pages

| Page | Description |
|------|-------------|
| **Home** | Unit overview, career paths, recruitment CTA, video showcase |
| **About 505th** | Full unit history and overview |
| **Alpha Company** | Alpha Company branch page |
| **JTF-23 Force Recon** | Stalker / Force Recon branch page |
| **Hospital Corpsman** | Corpsman branch page |
| **54th Air Wing** | Air Wing branch page |
| **Media Gallery** | Dynamic image gallery powered by Firestore with admin-controlled visibility |
| **Media Videos** | Video showcase, admin-controlled visibility |
| **Discord Rules** | Unit rules and enforcement policy |
| **General Handbook** | Unit SOPs, rank structure, rules of engagement |
| **Control Reference** | Arma 3 keybind guide |
| **Order of Battle** | Interactive hierarchy tree (pan/zoom/collapse) with live unit card slot data |
| **Battalion Roster** | Live personnel database grouped by platoon with attendance pips and PT tracking |
| **After Action Reports** | Searchable mission archive with detail modals |
| **Field Lexicon** | Military terminology glossary with category filtering |

---

## Admin Panel — Command Terminal

Access via `/admin.html`. Role-gated — admin roles only.

### Dashboard
- Live stat counters: Pending / Active / Roster / Total
- Discord invite link status checker (live Discord API)
- Roster strength by platoon (bar chart)
- Inactive members and Awaiting BCT tracker
- Reserves widget with colour-coded time indicators
- Attendance Health widget (ops this month, at-risk members, full attendance)
- Recruitment Source vertical bar chart (all roles)
- Pending registrations list → link to Enlistment Queue
- Recent joins

### Manpower
- **Personnel Files** — Full member list with inline rank/role dropdowns, edit modal, remove
- **Enlistment Queue** — Approve/deny pending registrations; source picker modal on approval; amber pending badge on nav link

**Edit Operative Modal (Details tab)**
- Rank (full E1–O9 dropdown, all branches). Auto-sets graduation date on any E2 promotion
- First Name, Middle Initial, Last Name
- Callsign — locked to Staff NCO+ only
- Date Joined Unit
- Platoon — auto-logs transfer history on change
- Role — Commander/Developer only
- Recruitment Source — where they heard about the unit

**Edit Operative Modal (History tab)**
- Promotion History — auto-logged on rank change, manual entry supported
- Warning History — Minor / Major / Final severity
- Commendation / Medal History — 8-medal visual picker
- Platoon / Transfer History — auto-logged on platoon change, manual entry supported

### Battalion Ops
- **Attendance Tracker** — Log ops attendance per event. Present checkboxes, platoon filter tabs, draft save, SAVE & LOCK finalises and updates member counters. DELETE (blocked on locked events), CLEAR form, RESET ALL COUNTERS utility. Monthly rate shown as X/Y per member
- **After Action Reports** — 10-section report builder with Discord webhook and Cloudinary image attachments
- **Battalion Roster** — Live view from `users` collection. Attendance checkbox (+1), PT glow system, graduation date, time-in-unit
- **Unit Cards** — Open/Closed/Filled slot management synced to Order of Battle public page
- **Recruitment Source Tracker** — Bar chart + % breakdown + recent recruits table. Data collected at approval and via Edit Operative

### Intel Archive
- **Gallery** — Upload images to Cloudinary, categorise, toggle public visibility
- **Videos** — Upload or link videos, toggle public visibility

### Public Comms
- CMS slot system for all About pages — photo sliders, info cards, text content

### Discord & Network
- **Discord Invite Link** — Centralised URL used across all public pages, live status check
- **Discord Webhooks** — 7 webhook URL fields with TEST buttons. Rich embeds for: New Registration, Approved/Denied, Promotion, Warning, Platoon Transfer, AAR Submitted, Attendance Locked
- **Cortana Bot Integration** — Under construction

---

## Authentication & Access Control

- Firebase Auth with role-based access
- Roles: `commander`, `developer`, `staff_nco`, `nco`, `recruiter`, `marine`, `enlistee`
- Pages handle their own auth gates
- Login return-to-origin flow
- Registration form collects: recruit source → first name → middle initial → last name → email → password. Callsign assigned by staff after approval
- Profile page with dossier header, medals, promotion/transfer history timeline

---

## Discord Webhooks

All 7 webhooks use styled Discord embeds (author block, thumbnail, bullet-point description, colour-coded, footer with category, timestamp).

| Webhook | Trigger | Colour |
|---------|---------|--------|
| New Registration | On form submit (`login.html`) | Amber |
| Approved | On enlistment approval | Green |
| Denied | On pending user removal | Red |
| Promotion | On any rank change (inline, modal, or manual) | Purple |
| Warning | On warning history entry | Orange |
| Platoon Transfer | On platoon change (modal or manual) | Cyan |
| AAR Submitted | On AAR submit | Result-dependent |
| Attendance Locked | On SAVE & LOCK | Teal |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | Vercel Hosting |
| Database | Firebase Firestore | 
| Auth | Firebase Authentication |
| Media Storage | Cloudinary |
| Fonts | Google Fonts (Rajdhani, Share Tech Mono) |
| Webhooks | Discord Webhooks |

---

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | Single source of truth — auth profile, rank, role, platoon, attendance, history arrays |
| `media` | Gallery/video entries with visibility toggle |
| `aars` | After Action Report documents |
| `attendance_events` | Attendance tracker events — attendees, excused, locked state |
| `advert_logs` | Recruitment source logs |
| `settings/unit_cards` | Order of Battle slot assignments |
| `settings/page_content` | CMS slot data for About pages |
| `settings/site` | Discord invite link |
| `settings/webhooks` | Discord webhook URLs (7 keys) |
| `settings/roster_meta` | Monthly attendance reset tracking |

> **Note:** The old `roster` collection has been removed. All member data now lives in `users`.

---

## Role Permissions

| Panel / Feature | Commander | Developer | Staff NCO | NCO | Recruiter |
|-----------------|:---------:|:---------:|:---------:|:---:|:---------:|
| Personnel Files | ✅ | ✅ | ✅ | — | — |
| Change Roles | ✅ | ✅ | — | — | — |
| Enlistment Queue | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance Tracker | ✅ | ✅ | ✅ | ✅ | — |
| After Action Reports | ✅ | ✅ | ✅ | ✅ | — |
| Battalion Roster | ✅ | ✅ | ✅ | ✅ | — |
| Unit Cards | ✅ | ✅ | ✅ | — | — |
| Recruitment Source | ✅ | ✅ | ✅ | ✅ | — |
| Intel Archive | ✅ | ✅ | ✅ | ✅ | — |
| Public Comms | ✅ | ✅ | ✅ | — | — |
| Discord Invite Link | ✅ | ✅ | ✅ | — | — |
| Discord Webhooks | ✅ | ✅ | — | — | — |
| Cortana Bot Integration | ✅ | ✅ | — | — | — |
| Recruitment Source Widget (Dashboard) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Project Structure

```
505th-website/
├── css/
│   ├── pages.css                      # Shared layout, nav, footer
│   ├── auth.css                       # Login button, dropdown, auth states
│   ├── discord-rules.css              # Rules page styling
│   └── handbook.css                   # Handbook sections, rank cards
├── js/
│   ├── nav.js                         # Tactical dropdown menu toggle
│   ├── scroll.js                      # Auto-hide navbar on scroll
│   ├── auth.js                        # Firebase auth state, navbar updates
│   └── cms.js                         # CMS slot rendering, Discord link sync
├── images/
│   ├── logo.png
│   ├── logos/                         # Branch logos
│   ├── icons/                         # Nav menu icons
│   └── medal_emojis/                  # 8 medal images for commendation picker
├── home.html
├── login.html                         # Registration + login
├── admin.html                         # Command Terminal (admin panel)
├── profile.html                       # Operative profile page
├── boot.html                          # Boot animation after login
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
├── resources-roster.html              # Reads from users collection
├── resources-aar.html
└── resources-field-lexicon.html
```

---

## Developer

** Website Developer:** SSgt S. "Davy" (RevGamer)

---

© 2026 505th Expeditionary Force • 505th Dev Team