# specs/host-listing.md

## Title
Host Listing Management (Web + API)

## Job To Be Done (JTBD)
As a Host, I want to create and manage room listings so that my spaces can be offered for booking.

---

## Scope

### In Scope
- Web application (desktop + mobile web)
- Backend API
- Stripe Connect onboarding (web-based)
- Automated end-to-end testing with Playwright
- Linting and type checking via Bun

### Out of Scope (Non-Goals)
- Native mobile apps (iOS / Android)
- Guest discovery, search, booking, or checkout flows
- Admin dashboard or approval UI
- Messaging, reviews, ratings
- Pricing strategies beyond the defined formula

---

## Actors
- **Host**: An authenticated user who owns and manages room listings

---

## Preconditions
- Host is authenticated
- Host has permission to create listings

---

## Success Criteria (Promise Definition)

This feature is considered **complete** only when **ALL** conditions below are met:

1. Host can create a listing via the defined multi-step flow
2. Listings are persisted with `approved = false`
3. Host can edit and delete only their own listings
4. Host can view all owned listings
5. Host can view today’s bookings in an agenda-style calendar
6. Pricing calculations exactly follow the defined formula
7. All required Playwright tests are written
8. All Playwright tests pass
9. All lint, type, and verification commands pass

---

## Core Features

### Listing Management
Hosts MUST be able to:
1. Create a listing
2. Edit a listing
3. Delete a listing
4. View all owned listings
5. View today’s bookings (`/host/today`)

---

## Create Listing Flow

### Entry Point
- Clicking **“Become a Host”** or **“Create Listing”** MUST navigate to:
/create-listing

### General Rules
- Multi-step flow (Airbnb-style)
- Linear progression with a visible progress tracker
- User MAY navigate backward before final confirmation
- State MUST persist until submission

---

## Create Listing Steps

### Step 1 — Basic Listing Info
- Collect basic listing metadata (e.g., title, description)
- Required fields MUST block progression if missing

---

### Step 2 — Select Amenities

#### Rules
- Amenities displayed as selectable cards
- Each card MUST include:
- Icon
- Label
- Amenities MUST be grouped by category
- Zero or more amenities MAY be selected

#### Amenity Model
```ts
type Amenity = {
key: string;
label: string;
icon: string;
};
Canonical Amenity Lists
ts
Copy code
const BASIC: Amenity[] = [
  { key: "wifi", label: "Wi-Fi", icon: "wifi" },
  { key: "aircon", label: "Air-con", icon: "air-conditioner" },
  { key: "toilet", label: "Toilet", icon: "toilet" },
  { key: "sofa", label: "Sofa", icon: "sofa" },
  { key: "fridge", label: "Refrigerator", icon: "fridge-outline" },
  { key: "drinks", label: "Drinks", icon: "cup" },
];

const ENTERTAINMENT: Amenity[] = [
  { key: "mahjong", label: "Mahjong Table", icon: "grid" },
  { key: "poker", label: "Poker", icon: "cards" },
  { key: "dice", label: "Dice", icon: "dice-multiple-outline" },
  { key: "chips", label: "Chips", icon: "chip" },
  { key: "board", label: "Board Game", icon: "puzzle" },
  { key: "ps", label: "PS4 / PS5", icon: "sony-playstation" },
  { key: "switch", label: "Switch", icon: "nintendo-switch" },
];

const AV: Amenity[] = [
  { key: "tv", label: "Television", icon: "television-classic" },
  { key: "speaker", label: "Speaker", icon: "speaker" },
  { key: "mic", label: "Microphone", icon: "microphone-outline" },
];
Step 3 — Confirm Address
Text input for address

Interactive map displayed

Host MAY:

Search for an address

Drop a pin on the map

Address MUST resolve to structured data (address + lat/lng)

Step 4 — Upload Photos
Minimum 5 photos required

Drag & drop or file picker

Each photo MUST:

Display a preview

Support deletion before submission

Step 5 — Pricing Setup
Required Inputs
Base price per hour (HKD)

Minimum hours (integer)

Discount percentage for additional hours

Included number of guests

Maximum number of guests

Extra person charge per hour (HKD)

Pricing Formula (Authoritative)
Let:

P = base price per hour

H = total hours

M = minimum hours

D = discount percentage / 100

GX = extra guests

E = extra person charge per hour

If H <= M:

base_cost = H × P
If H > M:

discounted_hourly_price = P × (1 - D)^(H - M)
base_cost = H × discounted_hourly_price
Extra guests:
extra_cost = GX × E × H
Total:
total_price = base_cost + extra_cost
Step 6 — Review & Confirm
Show full summary

Host MAY edit previous steps

Confirm submits listing

Submission Behavior
Listing is saved with:

ini
Copy code
approved = false
Email notification sent to:
rejoanahmed8@gmail.com
Cancellable confirmation dialog shown

Stripe Connect Onboarding
Prompt shown after submission

Stripe Connect required to accept payments

Payments disabled until onboarding completes

After onboarding, funds are transferred to the host’s Stripe account

Host Pages
Listings Page
Displays all host listings

Each card shows:

Cover image

Title

Approval status

Edit action

Today Page
/host/today
Agenda-style view

Only today’s bookings

Sorted by start time

Automated Testing Requirements (Mandatory)
Playwright End-to-End Tests
The agent MUST write Playwright tests covering:

Listing creation happy path

Step validation (cannot proceed with invalid input)

Pricing calculation correctness

Photo upload minimum enforcement

Listing appears in host listings page

Unauthorized edit/delete blocked

Today page renders bookings correctly

All Playwright tests MUST pass.

Verification & Completion Gate (Mandatory)
The agent MUST verify completion by running the following commands.

From Repository Root
bun check
bun check-types
bun fix
All auto-fixable lint errors MUST be fixed

After bun fix, bun check MUST still pass

Web App E2E Tests
cd apps/web
bun test:e2e
No skipped or flaky tests allowed

Command MUST exit with status code 0

Completion Definition (Non-Negotiable)
This spec is DONE only if ALL of the following are true:

Feature behavior matches this spec exactly

All Playwright tests are implemented

All Playwright tests pass

bun check exits with 0

bun check-types exits with 0

bun fix produces no remaining fixable issues

bun test:e2e exits with 0

If any condition fails, the promise is not fulfilled.
