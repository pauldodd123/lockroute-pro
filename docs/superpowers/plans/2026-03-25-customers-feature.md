# Customers Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class Customer concept to LockRoute Pro — persistent customer records linked to jobs, a combined postcode/name search in the job form, auto-create/link on save, and a dedicated Customers management screen.

**Architecture:** New `customers` Supabase table with a nullable FK from `jobs.customer_id`. Data follows the existing localStorage-first + Supabase-sync pattern used for jobs. The job form's postcode input becomes dual-purpose (postcode → address lookup, name → customer search). A new `view-customers` section is added to the sidebar nav and main content area.

**Tech Stack:** Vanilla JS (ES2020), HTML5, CSS3, Supabase (PostgreSQL + JS client v2), no build tools.

**Spec:** `docs/superpowers/specs/2026-03-25-customers-feature-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260325000000_add_customers.sql` | Create | Schema: customers table, jobs.customer_id FK, RLS, retroactive migration |
| `supabase-config.js` | Modify | customerToRow/rowToCustomer mapping, cloudDB.loadCustomers/saveCustomer/deleteCustomer, update jobToRow/rowToJob |
| `app.js` | Modify | app.customers[], loadData/loadFromCloud/persistCustomer/removeCustomer, async saveJob + customer-linking, dual-purpose search handler, renderCustomers/customer detail UI |
| `app.html` | Modify | Customers nav item (sidebar), view-customers section HTML |
| `styles.css` | Modify | Customer list/detail styles, 7-item nav label-hide at ≤390px |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260325000000_add_customers.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- ============================
-- Customers table
-- ============================
CREATE TABLE IF NOT EXISTS public.customers (
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

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Add customer_id FK to jobs
-- ============================
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL;

-- ============================
-- Retroactive migration: create customers from existing jobs
-- (idempotent — safe to re-run)
-- ============================
INSERT INTO public.customers (id, user_id, name, phone, address, postcode, created_at, updated_at)
SELECT DISTINCT ON (user_id, customer_name, customer_phone)
    'cust_' || extract(epoch from now())::bigint || '_' || substring(md5(random()::text), 1, 5) AS id,
    user_id,
    customer_name AS name,
    customer_phone AS phone,
    address,
    postcode,
    now() AS created_at,
    now() AS updated_at
FROM public.jobs
WHERE customer_name IS NOT NULL AND customer_name <> ''
ON CONFLICT (user_id, name, phone) DO NOTHING;

-- Link jobs back to their newly created customer records
UPDATE public.jobs j
SET customer_id = c.id
FROM public.customers c
WHERE j.user_id = c.user_id
  AND j.customer_name = c.name
  AND (j.customer_phone = c.phone OR (j.customer_phone IS NULL AND c.phone IS NULL))
  AND j.customer_id IS NULL;
```

- [ ] **Step 2: Apply the migration via Supabase CLI**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
supabase db push
```

Expected: migration applied successfully, no errors. If `supabase` CLI is not available, apply the SQL directly via the Supabase dashboard SQL editor at https://supabase.com/dashboard/project/klnerdcxmhrqqrwrleez/sql.

- [ ] **Step 3: Verify in Supabase dashboard**

Run this query in the SQL editor:
```sql
SELECT COUNT(*) FROM public.customers;
SELECT COUNT(*) FROM public.jobs WHERE customer_id IS NOT NULL;
```

Expected: customers count > 0 if there are existing jobs with names; jobs linked to customers.

- [ ] **Step 4: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add supabase/migrations/20260325000000_add_customers.sql
git commit -m "feat: add customers table migration with retroactive job linking"
```

---

## Task 2: Data Layer — supabase-config.js

**Files:**
- Modify: `supabase-config.js`

- [ ] **Step 1: Add customer mapping functions**

After the `rowToJob` function (around line 91), add:

```js
function customerToRow(customer) {
    return {
        id: customer.id,
        user_id: currentUserId,
        name: customer.name,
        phone: customer.phone || null,
        address: customer.address || null,
        postcode: customer.postcode || null,
        email: customer.email || null,
        notes: customer.notes || null,
        created_at: customer.createdAt,
        updated_at: new Date().toISOString(),
    };
}

function rowToCustomer(row) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        address: row.address,
        postcode: row.postcode,
        email: row.email,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
```

- [ ] **Step 2: Update jobToRow to include customer_id**

In `jobToRow`, add `customer_id: job.customerId || null` to the returned object.

In `rowToJob`, add `customerId: row.customer_id` to the returned object.

- [ ] **Step 3: Add cloudDB methods for customers**

Inside the `cloudDB` object, after `deleteJob`, add:

```js
async loadCustomers() {
    if (!supabaseReady) return null;
    try {
        const { data, error } = await supabaseClient
            .from('customers')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data.map(rowToCustomer);
    } catch (e) {
        console.error('Error loading customers from Supabase:', e);
        return null;
    }
},

async saveCustomer(customer) {
    if (!supabaseReady) return;
    try {
        const { error } = await supabaseClient.from('customers').upsert(customerToRow(customer));
        if (error) throw error;
    } catch (e) {
        console.error('Error saving customer to Supabase:', e);
    }
},

async deleteCustomer(id) {
    if (!supabaseReady) return;
    try {
        const { error } = await supabaseClient.from('customers').delete().eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.error('Error deleting customer from Supabase:', e);
    }
},
```

- [ ] **Step 4: Verify no syntax errors**

Open the browser dev tools console after loading the app. Expected: no JS errors on load.

- [ ] **Step 5: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add supabase-config.js
git commit -m "feat: add customer data layer to supabase-config.js"
```

---

## Task 3: App State — customers array, load/persist/remove

**Files:**
- Modify: `app.js` (top of `const app = {` object, `loadData`, `loadFromCloud`, `persistJob`, `removeJob` — add parallel customer functions)

- [ ] **Step 1: Add `customers` array and `_selectedCustomerId` to app state**

In `const app = {` at the top (around line 119), add after `_addressCache: {},`:

```js
customers: [],
_selectedCustomerId: null,
```

- [ ] **Step 2: Load customers from localStorage in `loadData()`**

In `loadData()`, after the `savedJotter` block, add:

```js
const savedCustomers = localStorage.getItem('lockroute_customers');
if (savedCustomers) this.customers = JSON.parse(savedCustomers);
```

- [ ] **Step 3: Load customers from Supabase in `loadFromCloud()`**

In `loadFromCloud()`, update the `Promise.all` to include customers. Leave the preceding `migrateFromLocalStorage` call untouched — only change the destructuring line and the Promise.all array:

```js
// Replace only this line (keep everything above and below):
const [cloudJobs, cloudSettings, cloudJotter, cloudBlocks] = await Promise.race([
    Promise.all([cloudDB.loadJobs(), cloudDB.loadSettings(), cloudDB.loadJotter(), cloudDB.loadBlocks()]),
    timeout(5000)
]);

// With:
const [cloudJobs, cloudSettings, cloudJotter, cloudBlocks, cloudCustomers] = await Promise.race([
    Promise.all([cloudDB.loadJobs(), cloudDB.loadSettings(), cloudDB.loadJotter(), cloudDB.loadBlocks(), cloudDB.loadCustomers()]),
    timeout(5000)
]);
```

Then after the `cloudBlocks` block, add:

```js
if (cloudCustomers !== null) {
    this.customers = cloudCustomers;
    localStorage.setItem('lockroute_customers', JSON.stringify(this.customers));
}
```

And at the end of the cloud sync re-render block, add:
```js
if (this.currentView === 'customers') this.renderCustomers();
```

- [ ] **Step 4: Add `persistCustomer` and `removeCustomer` methods**

After `removeJob()` (around line 282), add:

```js
persistCustomer(customer) {
    localStorage.setItem('lockroute_customers', JSON.stringify(this.customers));
    if (typeof cloudDB !== 'undefined' && supabaseReady) {
        cloudDB.saveCustomer(customer);
    }
},

removeCustomer(id) {
    localStorage.setItem('lockroute_customers', JSON.stringify(this.customers));
    if (typeof cloudDB !== 'undefined' && supabaseReady) {
        cloudDB.deleteCustomer(id);
    }
},

generateCustomerId() {
    return 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
},
```

- [ ] **Step 5: Verify app loads without errors**

Reload the page in a browser. Expected: no console errors, app loads normally, existing jobs/settings intact.

- [ ] **Step 6: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add app.js
git commit -m "feat: add customers array and load/persist/remove to app state"
```

---

## Task 4: Async saveJob with Customer Linking

**Files:**
- Modify: `app.js` — `saveJob()`, `resetJobForm()`, `editJob()`

- [ ] **Step 1: Make saveJob async and add customer linking**

Replace the existing `saveJob()` function (starting at line 717) with:

```js
async saveJob() {
    const id = document.getElementById('job-id').value || this.generateId();
    const isEdit = !!document.getElementById('job-id').value;

    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();
    const jobPostcode = document.getElementById('job-postcode').value.trim().toUpperCase();
    const jobAddress = document.getElementById('job-address').value.trim();

    // --- Customer linking ---
    let customerId = null;
    if (customerName) {
        if (this._selectedCustomerId) {
            // User picked from search dropdown
            customerId = this._selectedCustomerId;
            const existing = this.customers.find(c => c.id === customerId);
            if (existing) {
                // Update address/postcode to latest job values
                existing.postcode = jobPostcode || existing.postcode;
                existing.address = jobAddress || existing.address;
                existing.updatedAt = new Date().toISOString();
                this.persistCustomer(existing);
            }
        } else {
            // Look up by name+phone in memory
            const found = this.customers.find(
                c => c.name.toLowerCase() === customerName.toLowerCase() &&
                     (c.phone || '') === (customerPhone || '')
            );
            if (found) {
                customerId = found.id;
                found.postcode = jobPostcode || found.postcode;
                found.address = jobAddress || found.address;
                found.updatedAt = new Date().toISOString();
                this.persistCustomer(found);
            } else {
                // Create new customer
                const newCustomer = {
                    id: this.generateCustomerId(),
                    name: customerName,
                    phone: customerPhone,
                    address: jobAddress,
                    postcode: jobPostcode,
                    email: '',
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                this.customers.push(newCustomer);
                this.persistCustomer(newCustomer);
                customerId = newCustomer.id;
            }
        }
    }

    const job = {
        id,
        customerName,
        customerPhone,
        postcode: jobPostcode,
        address: jobAddress,
        customerId,
        type: document.getElementById('job-type').value,
        duration: parseInt(document.getElementById('job-duration').value),
        notes: document.getElementById('job-notes').value.trim(),
        vehicleReg: document.getElementById('job-reg').value.trim().toUpperCase(),
        vehicleInfo: this._lastVehicleInfo || null,
        priceQuoted: parseFloat(document.getElementById('job-price').value) || 0,
        vatApplied: this.settings.vatRegistered,
        vatRate: this.settings.vatRegistered ? this.settings.vatRate : 0,
        date: document.getElementById('job-date').value,
        time: document.getElementById('job-time').value,
        priority: (document.querySelector('input[name="priority"]')?.value) || 'normal',
        status: 'scheduled',
        createdAt: isEdit ? (this.jobs.find(j => j.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
        const idx = this.jobs.findIndex(j => j.id === id);
        if (idx !== -1) this.jobs[idx] = job;
    } else {
        this.jobs.push(job);
    }

    this.persistJob(job);
    this.resetJobForm();
    this.updateQuickStats();

    const friendlyTime = this.getFriendlyDateTime(job.date, job.time);
    this.toast(`Job ${isEdit ? 'updated' : 'scheduled'}: ${friendlyTime}`, 'success');
    this.showView('dashboard');
},
```

- [ ] **Step 2: Update resetJobForm to clear _selectedCustomerId**

In `resetJobForm()`, after `this._lastVehicleInfo = null;`, add:
```js
this._selectedCustomerId = null;
```

- [ ] **Step 3: Update editJob to pre-populate _selectedCustomerId**

In `editJob(id)`, after `document.getElementById('job-id').value = job.id;`, add:
```js
this._selectedCustomerId = job.customerId || null;
```

- [ ] **Step 4: Test saving a new job**

In the browser: create a new job with a customer name and phone. Check browser console — no errors. Check `app.customers` in console: `app.customers` should contain a new customer with matching name/phone. Save another job with the same name+phone — should link to the same customer (not create a new one).

- [ ] **Step 5: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add app.js
git commit -m "feat: async saveJob with auto-create/link customer on save"
```

---

## Task 5: Dual-Purpose Search Field (Postcode / Customer Name)

**Files:**
- Modify: `app.js` — postcode input handler (around line 323)

- [ ] **Step 1: Replace the postcode input handler**

Find the comment `// Postcode input formatting + auto address lookup` (around line 323). Replace the entire `document.getElementById('job-postcode').addEventListener('input', ...)` block with:

```js
// Postcode / customer name dual-purpose search
let _searchDebounceTimer = null;
document.getElementById('job-postcode').addEventListener('input', (e) => {
    const val = e.target.value;
    // Only uppercase if it looks like a postcode (starts with letters+digits)
    if (/^[A-Z0-9\s]*$/i.test(val) && /^[A-Z]{1,2}\d/i.test(val)) {
        e.target.value = val.toUpperCase();
    }
    this.updatePostcodeHint(e.target.value);
    this.generateSuggestions();

    clearTimeout(_searchDebounceTimer);
    const trimmed = e.target.value.trim();

    if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(trimmed)) {
        // Looks like a full postcode — do address lookup
        _searchDebounceTimer = setTimeout(() => this.findAddressFromPostcode(), 800);
    } else if (trimmed.length >= 2) {
        // Could be a customer name — search customers
        _searchDebounceTimer = setTimeout(() => this._searchCustomers(trimmed), 400);
    } else {
        // Too short — clear dropdown
        const results = document.getElementById('address-results');
        results.style.display = 'none';
    }
});
```

- [ ] **Step 2: Add `_searchCustomers` method**

After `_renderAddressResults` (around line 688), add:

```js
_searchCustomers(query) {
    const results = document.getElementById('address-results');
    const searchAgain = document.getElementById('search-again-link');
    searchAgain.style.display = 'none';

    const lower = query.toLowerCase();
    const matches = this.customers.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        (c.postcode && c.postcode.toLowerCase().includes(lower))
    );

    if (matches.length === 0) {
        results.style.display = 'none';
        return;
    }

    results.innerHTML = '';
    matches.forEach(customer => {
        const div = document.createElement('div');
        div.className = 'address-item customer-result';
        const label = [customer.name, customer.postcode].filter(Boolean).join(' · ');
        div.innerHTML = `<span class="customer-result-icon">👤</span> ${label}`;
        div.addEventListener('click', () => {
            this._selectedCustomerId = customer.id;
            document.getElementById('job-postcode').value = customer.postcode || '';
            document.getElementById('job-address').value = customer.address || '';
            document.getElementById('customer-name').value = customer.name || '';
            document.getElementById('customer-phone').value = customer.phone || '';
            results.style.display = 'none';
            this.updatePostcodeHint(customer.postcode || '');
            this.toast(`Customer loaded: ${customer.name}`, 'success');
        });
        results.appendChild(div);
    });
    results.style.display = 'block';
},
```

- [ ] **Step 3: Update the postcode input placeholder in app.html**

In `app.html`, find:
```html
<input type="text" id="job-postcode" placeholder="e.g. SW1A 1AA" required
```

Change to:
```html
<input type="text" id="job-postcode" placeholder="Postcode or customer name" required
```

Also update the label:
```html
<label for="job-postcode">Postcode <span class="required">*</span></label>
```

Change to:
```html
<label for="job-postcode">Postcode / Customer Search <span class="required">*</span></label>
```

- [ ] **Step 4: Test dual-purpose search**

In the browser, open New Job form:
1. Type a customer name (≥2 chars) → dropdown should appear with matching customers (if any exist)
2. Click a customer result → name, phone, address, postcode fields should auto-fill
3. Clear the field, type a valid postcode → address lookup fires as before
4. Verify `.toUpperCase()` applies to postcode-like input but NOT to name input (type "john" — stays lowercase)

- [ ] **Step 5: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add app.js app.html
git commit -m "feat: dual-purpose postcode/customer-name search in job form"
```

---

## Task 6: Customers View — HTML

**Files:**
- Modify: `app.html`

- [ ] **Step 1: Add Customers nav item to sidebar**

In the `<ul class="nav-links">`, after the route nav item and before jotter, add:

```html
<li class="nav-item" data-view="customers">
    <span class="nav-icon">👥</span>
    <span class="nav-label">Customers</span>
</li>
```

- [ ] **Step 2: Add customers view section**

In `app.html`, after the jotter section (`</section>` that closes `view-jotter`) and before the settings section, add:

```html
<!-- CUSTOMERS VIEW -->
<section id="view-customers" class="view">
    <div class="view-header">
        <h1>Customers</h1>
    </div>
    <div class="customers-container">
        <div class="card customers-search-card">
            <input type="search" id="customers-search" placeholder="Search by name or postcode…" class="customers-search-input">
        </div>
        <div id="customers-list">
            <div class="empty-state">
                <span class="empty-icon">👥</span>
                <p>No customers yet</p>
                <p class="empty-sub">Customers are created automatically when you save a job with a customer name.</p>
            </div>
        </div>
    </div>

    <!-- Customer Detail Panel (shown inline below list) -->
    <div id="customer-detail-panel" class="customer-detail-panel" style="display:none;">
        <div class="card customer-detail-card">
            <div class="customer-detail-header">
                <h2 id="detail-customer-name"></h2>
                <div class="customer-detail-actions">
                    <button class="btn btn-outline btn-sm" id="detail-edit-btn">Edit</button>
                    <button class="btn btn-outline btn-danger btn-sm" id="detail-delete-btn">Delete</button>
                    <button class="btn btn-outline btn-sm" id="detail-close-btn">✕</button>
                </div>
            </div>
            <div id="customer-detail-body"></div>
            <div id="customer-edit-form" style="display:none;">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="edit-customer-name">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="edit-customer-phone">
                    </div>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="edit-customer-address">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Postcode</label>
                        <input type="text" id="edit-customer-postcode">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="edit-customer-email">
                    </div>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="edit-customer-notes" rows="2"></textarea>
                </div>
                <div class="form-row" style="justify-content:flex-end;gap:8px;">
                    <button class="btn btn-outline btn-sm" id="edit-customer-cancel">Cancel</button>
                    <button class="btn btn-primary btn-sm" id="edit-customer-save">Save</button>
                </div>
            </div>
            <div id="customer-jobs-history">
                <h3 class="customer-section-title">Job History</h3>
                <div id="customer-jobs-list"></div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 3: Verify HTML structure**

Open the browser. The Customers item should appear in the sidebar nav. Clicking it should show an empty customers view. No JS errors in console.

- [ ] **Step 4: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add app.html
git commit -m "feat: add customers view HTML and nav item"
```

---

## Task 7: Customers View — Rendering Logic in app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add customers case to showView switch**

In `showView(viewName)` switch block, add:
```js
case 'customers':
    this.renderCustomers();
    break;
```

- [ ] **Step 2: Add `renderCustomers()` method**

After `renderSettings()` (or near the end of the object, before the final `}`), add:

```js
renderCustomers() {
    const searchVal = (document.getElementById('customers-search')?.value || '').toLowerCase();
    const list = document.getElementById('customers-list');
    if (!list) return;

    let filtered = [...this.customers].sort((a, b) => a.name.localeCompare(b.name));
    if (searchVal) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchVal) ||
            (c.postcode && c.postcode.toLowerCase().includes(searchVal))
        );
    }

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <span class="empty-icon">👥</span>
            <p>${searchVal ? 'No customers match your search' : 'No customers yet'}</p>
            ${!searchVal ? '<p class="empty-sub">Customers are created automatically when you save a job.</p>' : ''}
        </div>`;
        return;
    }

    list.innerHTML = filtered.map(c => `
        <div class="customer-row card" data-customer-id="${c.id}">
            <div class="customer-row-main">
                <span class="customer-name">${this.escapeHtml(c.name)}</span>
                <span class="customer-meta">${this.escapeHtml(c.phone || '')}${c.phone && c.postcode ? ' · ' : ''}${this.escapeHtml(c.postcode || '')}</span>
            </div>
            <span class="customer-row-arrow">›</span>
        </div>
    `).join('');

    list.querySelectorAll('.customer-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = row.dataset.customerId;
            this.openCustomerDetail(id);
        });
    });
},

openCustomerDetail(id) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;

    const panel = document.getElementById('customer-detail-panel');
    const body = document.getElementById('customer-detail-body');
    const editForm = document.getElementById('customer-edit-form');
    const jobsList = document.getElementById('customer-jobs-list');

    document.getElementById('detail-customer-name').textContent = customer.name;
    editForm.style.display = 'none';
    body.style.display = '';

    body.innerHTML = `
        <div class="customer-detail-fields">
            ${customer.phone ? `<div class="detail-field"><span class="detail-label">Phone</span><a href="tel:${customer.phone}" class="detail-value">${this.escapeHtml(customer.phone)}</a></div>` : ''}
            ${customer.address ? `<div class="detail-field"><span class="detail-label">Address</span><span class="detail-value">${this.escapeHtml(customer.address)}</span></div>` : ''}
            ${customer.postcode ? `<div class="detail-field"><span class="detail-label">Postcode</span><span class="detail-value">${this.escapeHtml(customer.postcode)}</span></div>` : ''}
            ${customer.email ? `<div class="detail-field"><span class="detail-label">Email</span><a href="mailto:${customer.email}" class="detail-value">${this.escapeHtml(customer.email)}</a></div>` : ''}
            ${customer.notes ? `<div class="detail-field"><span class="detail-label">Notes</span><span class="detail-value">${this.escapeHtml(customer.notes)}</span></div>` : ''}
        </div>
    `;

    // Job history
    const customerJobs = this.jobs
        .filter(j => j.customerId === id)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (customerJobs.length === 0) {
        jobsList.innerHTML = '<p class="empty-sub" style="padding:8px 0;">No jobs yet</p>';
    } else {
        jobsList.innerHTML = customerJobs.map(job => {
            const jobType = JOB_TYPES[job.type] || JOB_TYPES['other'];
            return `<div class="customer-job-row" data-job-id="${job.id}">
                <span class="customer-job-icon">${jobType.icon}</span>
                <div class="customer-job-info">
                    <span class="customer-job-type">${jobType.label}</span>
                    <span class="customer-job-date">${this.getFriendlyDateTime(job.date, job.time)}</span>
                </div>
                <span class="customer-job-status status-${job.status}">${job.status}</span>
            </div>`;
        }).join('');

        jobsList.querySelectorAll('.customer-job-row').forEach(row => {
            row.addEventListener('click', () => {
                this.showJobModal(row.dataset.jobId);
            });
        });
    }

    panel.style.display = 'block';
    panel.dataset.customerId = id;

    // Wire up action buttons
    document.getElementById('detail-close-btn').onclick = () => {
        panel.style.display = 'none';
    };

    document.getElementById('detail-edit-btn').onclick = () => {
        this.openCustomerEditForm(customer);
    };

    document.getElementById('detail-delete-btn').onclick = () => {
        if (confirm(`Delete customer "${customer.name}"? Their jobs will not be deleted.`)) {
            this.deleteCustomer(id);
        }
    };
},

openCustomerEditForm(customer) {
    const editForm = document.getElementById('customer-edit-form');
    const body = document.getElementById('customer-detail-body');
    body.style.display = 'none';
    editForm.style.display = 'block';

    document.getElementById('edit-customer-name').value = customer.name || '';
    document.getElementById('edit-customer-phone').value = customer.phone || '';
    document.getElementById('edit-customer-address').value = customer.address || '';
    document.getElementById('edit-customer-postcode').value = customer.postcode || '';
    document.getElementById('edit-customer-email').value = customer.email || '';
    document.getElementById('edit-customer-notes').value = customer.notes || '';

    document.getElementById('edit-customer-cancel').onclick = () => {
        editForm.style.display = 'none';
        body.style.display = '';
    };

    document.getElementById('edit-customer-save').onclick = () => {
        const updatedName = document.getElementById('edit-customer-name').value.trim();
        if (!updatedName) { this.toast('Name is required', 'error'); return; }

        customer.name = updatedName;
        customer.phone = document.getElementById('edit-customer-phone').value.trim();
        customer.address = document.getElementById('edit-customer-address').value.trim();
        customer.postcode = document.getElementById('edit-customer-postcode').value.trim().toUpperCase();
        customer.email = document.getElementById('edit-customer-email').value.trim();
        customer.notes = document.getElementById('edit-customer-notes').value.trim();
        customer.updatedAt = new Date().toISOString();

        this.persistCustomer(customer);
        this.toast('Customer updated', 'success');
        this.openCustomerDetail(customer.id);
        this.renderCustomers();
    };
},

deleteCustomer(id) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return;
    const name = this.customers[idx].name;
    this.customers.splice(idx, 1);

    // Unlink jobs that referenced this customer
    this.jobs.forEach(j => {
        if (j.customerId === id) {
            j.customerId = null;
            this.persistJob(j);
        }
    });

    this.removeCustomer(id);
    document.getElementById('customer-detail-panel').style.display = 'none';
    this.toast(`Customer "${name}" deleted`, 'info');
    this.renderCustomers();
},
```

- [ ] **Step 3: Bind the customers search input**

In `bindEvents()`, add after the existing search/filter bindings:

```js
// Customers search
document.getElementById('customers-search')?.addEventListener('input', () => {
    this.renderCustomers();
});
```

- [ ] **Step 4: Verify escapeHtml exists**

Search `app.js` for `escapeHtml`. If it doesn't exist, add this helper after `generateId()`:

```js
escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
},
```

- [ ] **Step 5: Test customers view**

In the browser:
1. Navigate to Customers — should render list (or empty state if no customers)
2. Save a job with a new customer name — navigate to Customers — customer should appear
3. Click a customer row — detail panel opens with fields + job history
4. Click Edit — edit form opens, change name, save — name updates in list and detail
5. Click Delete — confirmation, customer removed from list, job history unlinked

- [ ] **Step 6: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add app.js
git commit -m "feat: customers view rendering, detail panel, edit and delete"
```

---

## Task 8: Styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add nav label hide for 7-item nav at ≤390px**

Find the existing media query section in `styles.css`. Add a new rule (or extend the existing mobile media query):

```css
/* 7-item nav: hide labels on very small screens */
@media (max-width: 390px) {
    .nav-label {
        display: none;
    }
    .nav-item {
        justify-content: center;
        padding: 10px 8px;
    }
}
```

- [ ] **Step 2: Add customer list and detail styles**

Append to `styles.css`:

```css
/* ============================
   Customers View
   ============================ */

.customers-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.customers-search-card {
    padding: 12px 16px;
}

.customers-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-size: 0.95rem;
}

.customer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s;
    margin-bottom: 8px;
}

.customer-row:hover {
    background: rgba(99, 102, 241, 0.08);
}

.customer-row-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.customer-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
}

.customer-meta {
    font-size: 0.82rem;
    color: var(--text-muted);
}

.customer-row-arrow {
    color: var(--text-muted);
    font-size: 1.2rem;
}

/* Customer detail panel */
.customer-detail-panel {
    padding: 16px;
}

.customer-detail-card {
    padding: 20px;
}

.customer-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
}

.customer-detail-header h2 {
    font-size: 1.2rem;
    margin: 0;
}

.customer-detail-actions {
    display: flex;
    gap: 8px;
}

.customer-detail-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.detail-field {
    display: flex;
    gap: 12px;
    align-items: baseline;
}

.detail-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    min-width: 70px;
    flex-shrink: 0;
}

.detail-value {
    font-size: 0.95rem;
    color: var(--text);
    word-break: break-word;
}

a.detail-value {
    color: var(--primary);
    text-decoration: none;
}

.customer-section-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin: 16px 0 8px;
}

.customer-job-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
}

.customer-job-row:last-child {
    border-bottom: none;
}

.customer-job-row:hover {
    background: rgba(99, 102, 241, 0.06);
}

.customer-job-icon {
    font-size: 1.2rem;
    width: 28px;
    text-align: center;
}

.customer-job-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.customer-job-type {
    font-weight: 500;
    font-size: 0.9rem;
}

.customer-job-date {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.customer-job-status {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.15);
    color: var(--primary);
}

.customer-job-status.status-completed {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

/* Customer search result in job form */
.customer-result {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.customer-result-icon {
    font-size: 1rem;
}

.empty-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 4px;
}
```

- [ ] **Step 3: Verify visual result in browser**

Navigate to Customers view. Verify:
- Customer rows render cleanly with name + meta info
- Detail panel opens on click, looks good
- Edit form lays out correctly
- On a narrow screen (≤390px), nav labels disappear and 7 icons fit

- [ ] **Step 4: Commit**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git add styles.css
git commit -m "feat: add customer view styles and 7-item nav label-hide"
```

---

## Task 9: End-to-End Verification and Push

- [ ] **Step 1: Full flow test**

In the browser, run through this sequence:

1. **New job → new customer created**: Create a job with name "Jane Smith", phone "07700 123456", postcode "SW1A 1AA". Save. Navigate to Customers → "Jane Smith" should appear.

2. **New job → existing customer linked**: Create another job with name "Jane Smith", phone "07700 123456". Check `app.customers.length` in console — still only 1 Jane Smith, not 2.

3. **Customer search in job form**: Start typing "Jan" in the postcode field → customer dropdown appears with "Jane Smith · SW1A 1AA". Click → fields auto-fill. Address lookup still works with a postcode.

4. **Customer detail**: In Customers view, click Jane Smith → detail panel shows fields + 2 jobs. Click a job → existing job modal opens.

5. **Edit customer**: Click Edit, change notes, save → detail panel updates immediately.

6. **Delete customer**: Delete Jane Smith → confirm → customer gone, jobs still exist.

7. **Postcode address lookup**: Start a new job, type "SW1A 1AA" in the search field — address lookup fires. Verify toUpperCase applies.

8. **Name input not uppercased**: Type "john smith" — stays lowercase.

- [ ] **Step 2: Check console for errors**

Open browser dev tools. Navigate through all views. Expected: no JS errors.

- [ ] **Step 3: Push to main**

```bash
cd "/Users/pauldodd/Desktop/Simons Project"
git push origin main
```

- [ ] **Step 4: Confirm push succeeded**

```bash
git log --oneline -8
```

Expected: all feature commits visible, latest on main.

---

## Summary of Commits

1. `feat: add customers table migration with retroactive job linking`
2. `feat: add customer data layer to supabase-config.js`
3. `feat: add customers array and load/persist/remove to app state`
4. `feat: async saveJob with auto-create/link customer on save`
5. `feat: dual-purpose postcode/customer-name search in job form`
6. `feat: add customers view HTML and nav item`
7. `feat: customers view rendering, detail panel, edit and delete`
8. `feat: add customer view styles and 7-item nav label-hide`
