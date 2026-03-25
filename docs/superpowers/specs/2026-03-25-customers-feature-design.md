# Customers Feature Design
**Date:** 2026-03-25
**Project:** LockRoute Pro
**Status:** Approved

---

## Overview

Add a first-class "Customer" concept to LockRoute Pro. Customers are persistent records of people/businesses who have or may have jobs booked. Jobs are linked to customers via a foreign key. A dedicated Customers screen lets the locksmith view, edit, and manage customers and see their job history.

---

## Database Schema

### New: `customers` table

```sql
CREATE TABLE public.customers (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    postcode TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT customers_user_name_phone_unique UNIQUE (user_id, name, phone)
);
-- RLS: users can only see/modify their own customers
```

Customer IDs use the same pattern as jobs: `"cust_" + Date.now() + Math.random().toString(36).slice(2,7)`.

### Modified: `jobs` table

Add a nullable `customer_id` FK:
```sql
ALTER TABLE public.jobs ADD COLUMN customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL;
```

### Retroactive migration

The retroactive migration runs as raw SQL. Group existing jobs by `(user_id, customer_name, customer_phone)` where `customer_name` is not null/empty. For each unique group, insert a customer record using the SQL ID pattern `'cust_' || extract(epoch from now())::bigint || '_' || substring(md5(random()::text), 1, 5)` with `INSERT ... ON CONFLICT (user_id, name, phone) DO NOTHING` (idempotent). Then `UPDATE jobs SET customer_id = c.id FROM customers c WHERE jobs.user_id = c.user_id AND jobs.customer_name = c.name AND jobs.customer_phone = c.phone`. The migration is safe to re-run.

---

## UI: Combined Search Field (Job Form Step 1)

The `job-postcode` input becomes a dual-purpose search:

- **Postcode pattern** (`/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i`): triggers address lookup (existing behaviour, unchanged)
- **Non-postcode text** (anything else, ≥2 chars): after 400ms debounce, searches `app.customers` in-memory list (ilike on name) and shows customer results

The `.toUpperCase()` transform on the input is changed to only apply when the current value looks like a postcode (matches the postcode-start pattern), so customer name input is not forced to uppercase.

The shared dropdown (`#address-results`) shows either:
- Address items (existing, from postcode lookup)
- Customer items, labelled `"Joe Bloggs · SW1A 1AA"` — clicking auto-fills name, phone, address, postcode fields and stores `_selectedCustomerId`

The input placeholder updates to reflect dual purpose: `"Postcode or customer name"`.

---

## Auto-Create Customer on Save

`saveJob()` becomes `async`. After collecting form values:

1. If name is blank → skip customer linking (customer_id stays null)
2. If `_selectedCustomerId` is set → use it (customer was selected from search); update customer address/postcode from job if changed
3. Otherwise → look up customer by exact `(name, phone)` match in `app.customers` (in-memory, no extra network call)
   - Found → link to that customer_id; update customer address/postcode if changed
   - Not found → generate a new cust_ id, create customer record in memory + Supabase, link job to it

Customer name+phone is the matching key. Postcode/address on the customer record is always updated to match the latest job values on each link.

**Edit job flow:** When editing a job, `_selectedCustomerId` is pre-populated from `job.customerId`. `resetJobForm()` clears `_selectedCustomerId` to null.

---

## Customers Screen

New view `view-customers` added to navigation (people icon, between Route and Settings).

**List view:**
- Sorted A→Z by name
- Each row: name, phone, postcode — tap to open detail panel
- Search/filter bar at top (filters by name or postcode)

**Customer detail (modal or inline panel):**
- All customer fields (name, phone, address, postcode, email, notes)
- Edit button → inline edit form
- Delete button → confirmation, sets jobs.customer_id to NULL for linked jobs
- Job history: list of linked jobs (date, type, address) with tap-to-open

---

## Data Layer (supabase-config.js)

New mapping functions: `customerToRow`, `rowToCustomer`.

New `cloudDB` methods:
- `loadCustomers()` → all customers for current user, ordered by name
- `saveCustomer(customer)` → upsert
- `deleteCustomer(id)` → delete

`jobToRow` / `rowToJob` updated to include `customer_id`.

Customers follow the same localStorage + cloud sync pattern as jobs:
- localStorage key: `lockroute_customers`
- Loaded in `loadData()` alongside jobs (from localStorage first)
- `loadFromCloud()` extended to load customers from Supabase and merge
- `app.customers` array is the in-memory store
- `persistCustomer(customer)` saves to localStorage + Supabase (mirrors `persistJob`)
- `removeCustomer(id)` removes from localStorage + Supabase

---

## Navigation

Add a Customers nav item to the bottom nav bar. The nav currently has 6 items (Dashboard, Calendar, Add Job, Route, Jotter, Settings); adding Customers makes 7. To accommodate 7 items: hide text labels on all nav items (icon only) when the viewport is ≤390px wide, relying on the icon alone for identification. At wider widths (tablet/desktop) labels remain. Customers sits between Route and Jotter.

**Job history in customer detail:** Tapping a job in the customer detail view calls the existing `app.openJobModal(job)` — no new modal needed.

---

## Error Handling & Edge Cases

- **Duplicate customers**: All customers matching the search query are shown in the dropdown — user picks the right one.
- **No name on job**: customer_id remains null, no customer created.
- **Customer deleted while linked to jobs**: `ON DELETE SET NULL` on the FK preserves jobs.
- **Retroactive migration**: Runs as a Supabase SQL migration; safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING pattern).
- **Offline / localStorage users**: Customer search falls back gracefully if Supabase not ready (shows no customer results, address lookup still works).

---

## Out of Scope

- Customer portal or customer-facing features
- Bulk import of customers
- Customer merge/deduplication UI (auto-dedup happens silently on save)
