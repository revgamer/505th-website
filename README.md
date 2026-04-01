# 505th Expeditionary Force — Official Website

Official website for the **505th Expeditionary Force**, a UNSC/Halo-themed Arma 3 OPTRE military simulation unit.

🔗 **Live Site:** [505expeditionaryforce.com](https://www.505expeditionaryforce.com)

**Website Developer:** SSgt S. "Davy" (RevGamer)

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
| **Hospital Corps Handbook** | Corpsman-specific SOPs and medical protocols |
| **Control Reference** | Arma 3 keybind guide |
| **Battalion Roster** | Live personnel database grouped by platoon with attendance pips and PT tracking |
| **After Action Reports** | Searchable mission archive with detail modals. Firebase v11.8.1 with real credentials — previously had placeholder config. |
| **Field Lexicon** | Military terminology glossary with category filtering |

### Desktop Navigation (≥1024px)
All public pages use a **fixed icon rail sidebar** on the left:
- Crosshair icon — opens/closes the slide-out nav panel with smooth slide animation
- Icons for Home, Career Paths, Media, Resources, Join Us, Account
- Clicking a nav icon opens a 200px slide panel with sub-links; clicking same icon or outside closes it
- Account icon popup — shows formatted rank + name + role when logged in, with My Profile, Command Panel (admin only), Logout links
- Panel overlay closes nav when clicking outside the rail

### Mobile Navigation (≤1023px)
Original top navbar + tactical slide-down menu — unchanged. Account section has dropdown with Profile, Command Panel, Logout.

---

## Admin Panel — Command Terminal

Access via `/admin.html` → `/boot.html` after login. Role-gated — admin roles only.

### Dashboard
- Live stat counters: Pending / Active / Roster / Total
- **Who's Online** — live presence widget showing all members currently in the admin panel
- Discord invite link status checker (live Discord API)
- Roster strength by platoon
- Inactive members widget — members flagged by `lastAttendedDate` > 3 months ago OR `status === inactive` OR never attended (uses same logic as Personnel Files INACTIVE tab)
- Reserves widget with colour-coded time indicators
- **Attendance Health widget (6 cards):**
  - OPS THIS MONTH — ops logged this calendar month
  - AT RISK (3M+) — members with no op in 3+ months (based on `lastAttendedDate`)
  - FULL ATT (3/3) — members at max monthly attendance
  - OVERALL ATT % — unit-wide all-time rate from `opsAttended`/`opsEligible`
  - BELOW 50% — members whose all-time rate is under 50%
  - PERFECT ATT — members with 100% all-time attendance
  - Each card has a hover tooltip. AT-RISK shows a scrollable list with name + duration since last op (colour coded by severity)
- Recruitment Source vertical bar chart
- Pending registrations list
- Recent joins

### Manpower
- **Personnel Files** — Full member list with platoon tabs for instant filtering. Tabs: ALL, COMMAND, 1ST PLT, 2ND PLT, 3RD PLT, FORCE RECON, CORPSMEN, PILOT, AWAITING BCT, RESERVES, INACTIVE. Member count shown per tab. Inline rank/role dropdowns, edit modal, remove.
  - **INACTIVE tab** — shows members where `status === 'inactive'` (manually set by staff) OR `lastAttendedDate` is 3+ months ago OR `opsAttended === 0` with eligible ops (never attended). Same 3-month logic used across dashboard AT-RISK, inactive widget, and Personnel Files.
- **Enlistment Queue** — Approve/deny pending registrations; amber badge on nav link

**Edit Operative Modal (Details tab)**
- Rank (full E1–O9 dropdown, all branches)
- First Name, Middle Initial, Last Name
- Callsign — locked to Staff NCO+ only
- Date Joined Unit
- Platoon — auto-logs transfer history on change
- Role — Commander/Developer only
- Recruitment Source

**Edit Operative Modal (History tab)**
- Promotion History — auto-logged on rank change, manual entry supported
- Warning History — Minor / Major / Final severity
- Commendation / Medal History — 8-medal visual picker
- Platoon / Transfer History — auto-logged on platoon change

### Battalion Ops
- **Attendance Tracker** — Log op attendance per event. Present/Excused/Absent cycle, platoon filter tabs, live multi-user sync via Firestore `onSnapshot`, presence bar showing other staff on same event, SAVE & LOCK finalises and writes to member counters.
  - **Stats row (6 cards):** THIS EVENT, ATTENDANCE RATE, EXCUSED, ABSENT / UA, TOTAL OPS (all-time locked count), OVERALL ATTEND % (unit-wide all-time rate)
  - Locking an event writes `opsAttended`, `opsEligible`, and `lastAttendedDate` to each member's user doc
  - `loadAttGlobalStats()` recalculates TOTAL OPS and OVERALL ATTEND % after allUsers loads and after every lock
- **After Action Reports** — 10-section report builder with Discord webhook and Cloudinary image attachments
- **Battalion Roster** — Live view from `users` collection. Attendance checkbox (+1), PT glow system, graduation date, time-in-unit
- **Unit Cards** — Open/Closed/Filled slot management synced to public about pages
- **Recruitment Source Tracker** — Bar chart + % breakdown + recent recruits table

### Intel Archive
- **Gallery** — Upload images to Cloudinary, categorise, toggle public visibility
- **Videos** — Upload or link videos, toggle public visibility

### Public Comms
- CMS slot system for all About pages — photo sliders, info cards, text content
- Comms Library — dedicated media storage for public-facing assets

### Discord & Network
- **Discord Invite Link** — Centralised URL used across all public pages, live status check
- **Discord Webhooks** — 7 webhook URL fields with TEST buttons. Rich embeds for: New Registration, Approved/Denied, Promotion, Warning, Platoon Transfer, AAR Submitted, Attendance Locked
- **Cortana Bot Integration** — Under construction

---

## Member Profile Page

- Dossier header: rank, name/callsign, platoon, role badge, status, time in unit, join date
- Medals & Awards grid
- Promotion History timeline
- Platoon / Transfer History timeline
- Editable name fields (first, middle, last)

---

## Authentication & Access Control

- Firebase Auth with role-based access
- Roles: `commander`, `developer`, `staff_nco`, `nco`, `recruiter`, `marine`, `enlistee`
- Login → boot animation → admin panel or return-to-origin
- Registration collects: recruit source, name, email, password. Callsign assigned by staff after approval
- Pending/denied members cannot log in

---

## Discord Webhooks

| Webhook | Trigger | Colour |
|---------|---------|--------|
| New Registration | On form submit | Amber |
| Approved | On enlistment approval | Green |
| Denied | On pending user removal | Red |
| Promotion | On any rank change | Purple |
| Warning | On warning history entry | Orange |
| Platoon Transfer | On platoon change | Cyan |
| AAR Submitted | On AAR submit | Result-dependent |
| Attendance Locked | On SAVE & LOCK | Teal |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | Vercel |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Media Storage | Cloudinary (`dwugtsdsx`) |
| Fonts | Google Fonts (Rajdhani, Share Tech Mono) |
| Webhooks | Discord Webhooks |

---

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | Single source of truth — auth profile, rank, role, platoon, attendance, history arrays, `displayPrefs`, `lastAttendedDate`, `opsAttended`, `opsEligible` |
| `media` | Gallery/video entries with visibility toggle |
| `aars` | After Action Report documents |
| `attendance_events` | Attendance tracker events — attendees[], excused[], locked state, date |
| `presence_sessions` | Live presence tracking — admin dashboard and attendance tracker multi-user awareness |
| `advert_logs` | Recruitment source logs |
| `settings/unit_cards` | Order of Battle slot assignments |
| `settings/page_content` | CMS slot data for About pages |
| `settings/site` | Discord invite link |
| `settings/webhooks` | Discord webhook URLs (7 keys) |
| `settings/roster_meta` | Monthly attendance reset tracking |

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
| Dashboard Stats | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Project Structure

```
505th-website/
├── css/
│   ├── style.css                      # Home page styles
│   ├── pages.css                      # Shared layout, nav, footer
│   ├── auth.css                       # Login button, dropdown, auth states
│   ├── admin.css                      # Admin panel base styles
│   ├── admin-mobile.css               # Admin panel mobile/tablet responsive
│   ├── discord-rules.css              # Rules page styling
│   ├── handbook.css                   # Handbook sections, rank cards
│   ├── roster.css                     # Roster page styles
│   ├── splash.css                     # Splash/boot screen styles
│   └── under-construction.css        # 404/under construction page
├── js/
│   ├── nav.js                         # Tactical dropdown menu toggle
│   ├── scroll.js                      # Auto-hide navbar on scroll
│   ├── auth.js                        # Firebase auth state, navbar updates
│   ├── cms.js                         # CMS slot rendering, Discord link sync
│   ├── handbook.js                    # Handbook TOC smooth scroll
│   ├── splash.js                      # Splash screen boot animation
│   └── units-cards-embed.js           # Unit card slot embed for about pages
├── images/
│   ├── logo.png
│   ├── logos/                         # Branch logos
│   ├── icons/                         # Nav menu icons
│   └── medal_emojis/                  # 8 medal images for commendation picker
├── home.html                          # Landing page (desktop sidebar + mobile nav)
├── login.html                         # Registration + login
├── admin.html                         # Command Terminal (admin panel)
├── profile.html                       # Operative dossier page
├── boot.html                          # Boot animation after login
├── index.html                         # Splash screen entry point
├── about-505th.html
├── about-alpha-company.html
├── about-stalker.html
├── about-corpsman.html
├── about-54th-air-wing.html
├── media-gallery.html
├── media-videos.html
├── resources-discord-rules.html
├── resources-handbook.html
├── resources-hospital-corps-handbook.html
├── resources-keybinds.html
├── resources-roster.html
├── resources-aar.html
└── resources-field-lexicon.html
```

---

## 🚧 Planned Features (TBC)

### Live Chat / Messaging
- Direct messaging between logged-in members
- Real-time via Firestore `onSnapshot`
- Small floating chat widget on public pages and admin panel
- Message history stored in `messages/{conversationId}/messages` subcollection

### Member Notifications
- In-app notification system on member profile page
- Notification types planned:
  - ⚠ **AT-RISK alert** — notified when flagged as inactive (3+ months no op)
  - 💬 **Direct message received** — someone sent you a message
  - 🏅 **Medal/commendation awarded** — staff added a commendation to your record
  - 📋 **AAR published** — new After Action Report posted
  - ⬆ **Promotion** — your rank was updated
  - ⚠ **Warning issued** — a warning was added to your record
- Stored in `notifications/{uid}/items` subcollection in Firestore
- Bell icon on profile page with unread badge count
- Mark as read / clear all

### Cortana Bot (Discord)
- Full Discord.js bot integration
- Event signup management
- Reminder scheduling
- Persistent embeds

---

© 2026 505th Expeditionary Force • 505th Dev Team