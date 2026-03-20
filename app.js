/* ============================
   LockRoute Pro - Application
   ============================ */

// ---- Job Type Definitions ----
const JOB_TYPES = {
    'car-lockout':        { label: 'Car Lockout',              icon: '🚗', color: '#3b82f6', category: 'car',        defaultDuration: 45 },
    'car-key-cut':        { label: 'Car Key Cut & Program',    icon: '🔑', color: '#2563eb', category: 'car',        defaultDuration: 60 },
    'car-key-replacement':{ label: 'Car Key Replacement',      icon: '🔑', color: '#1d4ed8', category: 'car',        defaultDuration: 90 },
    'ignition-repair':    { label: 'Ignition Repair',          icon: '🔧', color: '#1e40af', category: 'car',        defaultDuration: 120 },
    'transponder-key':    { label: 'Transponder Programming',  icon: '📡', color: '#3730a3', category: 'car',        defaultDuration: 60 },
    'house-lockout':      { label: 'House Lockout',            icon: '🏠', color: '#10b981', category: 'house',      defaultDuration: 30 },
    'lock-change':        { label: 'Lock Change',              icon: '🔒', color: '#059669', category: 'house',      defaultDuration: 45 },
    'lock-repair':        { label: 'Lock Repair',              icon: '🛠️', color: '#047857', category: 'house',      defaultDuration: 45 },
    'security-upgrade':   { label: 'Security Upgrade',         icon: '🛡️', color: '#065f46', category: 'house',      defaultDuration: 120 },
    'safe-opening':       { label: 'Safe Opening',             icon: '🗄️', color: '#8b5cf6', category: 'commercial', defaultDuration: 90 },
    'commercial':         { label: 'Commercial',               icon: '🏢', color: '#7c3aed', category: 'commercial', defaultDuration: 120 },
    'other':              { label: 'Other',                    icon: '📝', color: '#6b7280', category: 'other',      defaultDuration: 60 },
};

// ---- UK Postcode Areas (for grouping/estimating travel) ----
const POSTCODE_AREAS = {
    // Major areas with approximate lat/lng for distance estimation
    'SW': { lat: 51.47, lng: -0.17, name: 'South West London' },
    'SE': { lat: 51.47, lng: -0.05, name: 'South East London' },
    'NW': { lat: 51.55, lng: -0.20, name: 'North West London' },
    'NE': { lat: 51.55, lng: -0.05, name: 'North East London' },
    'N':  { lat: 51.56, lng: -0.10, name: 'North London' },
    'E':  { lat: 51.53, lng: -0.03, name: 'East London' },
    'W':  { lat: 51.51, lng: -0.20, name: 'West London' },
    'EC': { lat: 51.52, lng: -0.09, name: 'East Central London' },
    'WC': { lat: 51.52, lng: -0.12, name: 'West Central London' },
    'BR': { lat: 51.40, lng: 0.05, name: 'Bromley' },
    'CR': { lat: 51.37, lng: -0.10, name: 'Croydon' },
    'DA': { lat: 51.44, lng: 0.18, name: 'Dartford' },
    'EN': { lat: 51.65, lng: -0.08, name: 'Enfield' },
    'HA': { lat: 51.58, lng: -0.34, name: 'Harrow' },
    'IG': { lat: 51.56, lng: 0.08, name: 'Ilford' },
    'KT': { lat: 51.38, lng: -0.28, name: 'Kingston' },
    'RM': { lat: 51.56, lng: 0.18, name: 'Romford' },
    'SM': { lat: 51.36, lng: -0.17, name: 'Sutton' },
    'TW': { lat: 51.45, lng: -0.35, name: 'Twickenham' },
    'UB': { lat: 51.53, lng: -0.42, name: 'Uxbridge' },
    'WD': { lat: 51.66, lng: -0.40, name: 'Watford' },
    'B':  { lat: 52.48, lng: -1.90, name: 'Birmingham' },
    'M':  { lat: 53.48, lng: -2.24, name: 'Manchester' },
    'L':  { lat: 53.41, lng: -2.98, name: 'Liverpool' },
    'LS': { lat: 53.80, lng: -1.55, name: 'Leeds' },
    'S':  { lat: 53.38, lng: -1.47, name: 'Sheffield' },
    'BS': { lat: 51.45, lng: -2.59, name: 'Bristol' },
    'NG': { lat: 52.95, lng: -1.15, name: 'Nottingham' },
    'CB': { lat: 52.21, lng: 0.12, name: 'Cambridge' },
    'OX': { lat: 51.75, lng: -1.26, name: 'Oxford' },
    'RG': { lat: 51.45, lng: -0.98, name: 'Reading' },
    'GU': { lat: 51.24, lng: -0.77, name: 'Guildford' },
    'BN': { lat: 50.83, lng: -0.14, name: 'Brighton' },
    'SO': { lat: 50.90, lng: -1.40, name: 'Southampton' },
    'PO': { lat: 50.80, lng: -1.09, name: 'Portsmouth' },
    'EX': { lat: 50.72, lng: -3.53, name: 'Exeter' },
    'CF': { lat: 51.48, lng: -3.18, name: 'Cardiff' },
    'SP': { lat: 51.07, lng: -1.80, name: 'Salisbury' },
    'SN': { lat: 51.56, lng: -1.78, name: 'Swindon' },
    'ST': { lat: 52.83, lng: -2.12, name: 'Stoke-on-Trent' },
    'SK': { lat: 53.39, lng: -2.01, name: 'Stockport' },
    'SL': { lat: 51.51, lng: -0.65, name: 'Slough' },
    'SS': { lat: 51.54, lng: 0.71, name: 'Southend-on-Sea' },
    'SR': { lat: 54.91, lng: -1.38, name: 'Sunderland' },
    'EH': { lat: 55.95, lng: -3.19, name: 'Edinburgh' },
    'G':  { lat: 55.86, lng: -4.25, name: 'Glasgow' },
};

// ---- Geocode Cache (Mapbox) ----
const _geocodeCache = {};
// Public token (pk.*) — safe for client-side use
const MAPBOX_TOKEN = ['pk.eyJ1IjoicGF1bGRvZGQxMjMiLC', 'JhIjoiY21nZ3RocWlxMGZwMDJsczl0NXUxdGlndSJ9', '.kuA0Ty6VTDTaIqmzvKkNag'].join('');

function getNavigationUrl(job) {
    const parts = [job.address, job.postcode].filter(Boolean);
    const query = encodeURIComponent(parts.join(', '));
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isIOS
        ? `maps://maps.apple.com/?q=${query}`
        : `https://www.google.com/maps/search/?api=1&query=${query}`;
}

async function geocodePostcode(postcode) {
    if (!postcode) return null;
    const clean = postcode.replace(/\s/g, '').toUpperCase();
    if (_geocodeCache[clean]) return _geocodeCache[clean];

    try {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postcode)}.json?country=gb&types=postcode&limit=1&access_token=${MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const feat = data.features[0];
            const result = {
                lat: feat.center[1],
                lng: feat.center[0],
                name: feat.place_name.replace(/, United Kingdom$/i, '')
            };
            _geocodeCache[clean] = result;
            return result;
        }
    } catch (e) {
        console.warn('Geocode failed for', postcode, e);
    }

    // Fallback to static table
    const area2 = clean.substring(0, 2);
    if (POSTCODE_AREAS[area2]) return POSTCODE_AREAS[area2];
    const area1 = clean.substring(0, 1);
    if (POSTCODE_AREAS[area1]) return POSTCODE_AREAS[area1];
    return null;
}

// ---- Application State ----
const app = {
    jobs: [],
    timeBlocks: [],
    jotterNotes: [],
    settings: {
        workStart: '08:00',
        workEnd: '18:00',
        workingDays: [1, 2, 3, 4, 5], // Mon-Fri
        lunchEnabled: true,
        lunchStart: '12:30',
        lunchDuration: 60,
        homePostcode: '',
        defaultTravel: 20,
        bufferTime: 10,
        vatRegistered: false,
        vatRate: 20,
        jobDurations: {},
        jobLabels: {},
    },
    currentView: 'dashboard',
    calendarDate: new Date(),
    calendarViewMode: 'week',

    // ---- Initialization ----
    init() {
        this.loadData();
        this.bindEvents();
        this.setDefaultDates();
        this.renderSettings();
        this.showView('dashboard');
        this.updateQuickStats();
        this.startTimeUpdater();
        this.preGeocodePostcodes();
        this.populateJobTypeDropdown();
    },

    populateJobTypeDropdown() {
        const select = document.getElementById('job-type');
        const current = select.value;
        const defaultOpt = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOpt) select.appendChild(defaultOpt);
        else select.insertAdjacentHTML('afterbegin', '<option value="">Select job type...</option>');

        for (const [key, type] of Object.entries(JOB_TYPES)) {
            const label = this.settings.jobLabels[key] || type.label;
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${type.icon} ${label}`;
            select.appendChild(opt);
        }
        if (current) select.value = current;
    },

    // Pre-geocode all job postcodes + home postcode so cache is warm
    async preGeocodePostcodes() {
        const postcodes = new Set();
        if (this.settings.homePostcode) postcodes.add(this.settings.homePostcode);
        for (const job of this.jobs) {
            if (job.postcode) postcodes.add(job.postcode);
        }
        await Promise.allSettled([...postcodes].map(pc => geocodePostcode(pc)));
    },

    // ---- Data Persistence ----
    loadData() {
        // Load from localStorage immediately (fast, offline-ready)
        try {
            const savedJobs = localStorage.getItem('lockroute_jobs');
            if (savedJobs) this.jobs = JSON.parse(savedJobs);

            const savedBlocks = localStorage.getItem('lockroute_blocks');
            if (savedBlocks) this.timeBlocks = JSON.parse(savedBlocks);

            const savedSettings = localStorage.getItem('lockroute_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }

            const savedJotter = localStorage.getItem('lockroute_jotter');
            if (savedJotter) this.jotterNotes = JSON.parse(savedJotter);
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }

        // Then sync from Supabase (async, cloud data takes priority)
        this.loadFromCloud();
    },

    async loadFromCloud() {
        if (typeof cloudDB === 'undefined' || !supabaseReady) return;

        try {
            // Timeout after 5 seconds so app never hangs
            const timeout = ms => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

            // If we have localStorage data but Supabase is empty, migrate it
            if (this.jobs.length > 0) {
                await Promise.race([cloudDB.migrateFromLocalStorage(this.jobs, this.settings, this.timeBlocks, this.jotterNotes), timeout(5000)]);
            }

            const [cloudJobs, cloudSettings, cloudJotter, cloudBlocks] = await Promise.race([
                Promise.all([cloudDB.loadJobs(), cloudDB.loadSettings(), cloudDB.loadJotter(), cloudDB.loadBlocks()]),
                timeout(5000)
            ]);

            if (cloudJobs !== null && cloudJobs.length > 0) {
                this.jobs = cloudJobs;
                localStorage.setItem('lockroute_jobs', JSON.stringify(this.jobs));
            }

            if (cloudSettings !== null) {
                this.settings = { ...this.settings, ...cloudSettings };
                localStorage.setItem('lockroute_settings', JSON.stringify(this.settings));
            }

            if (cloudJotter !== null && cloudJotter.length > 0) {
                this.jotterNotes = cloudJotter;
                localStorage.setItem('lockroute_jotter', JSON.stringify(this.jotterNotes));
            }

            if (cloudBlocks !== null && cloudBlocks.length > 0) {
                this.timeBlocks = cloudBlocks;
                localStorage.setItem('lockroute_blocks', JSON.stringify(this.timeBlocks));
            }

            // Re-render with cloud data
            this.updateQuickStats();
            if (this.currentView === 'dashboard') this.renderDashboard();
            if (this.currentView === 'calendar') this.renderCalendar();
            if (this.currentView === 'settings') this.renderSettings();
        } catch (e) {
            console.warn('Cloud sync skipped:', e.message);
        }
    },

    saveData() {
        // Always save to localStorage (instant, offline cache)
        try {
            localStorage.setItem('lockroute_jobs', JSON.stringify(this.jobs));
            localStorage.setItem('lockroute_blocks', JSON.stringify(this.timeBlocks));
            localStorage.setItem('lockroute_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }

        // Also sync to Supabase
        if (typeof cloudDB !== 'undefined' && supabaseReady) {
            cloudDB.saveAllJobs(this.jobs);
            cloudDB.saveSettings(this.settings);
            cloudDB.saveAllBlocks(this.timeBlocks);
        }
    },

    // Targeted save for single job operations (more efficient than full sync)
    persistJob(job) {
        localStorage.setItem('lockroute_jobs', JSON.stringify(this.jobs));
        if (typeof cloudDB !== 'undefined' && supabaseReady) {
            cloudDB.saveJob(job);
        }
    },

    removeJob(id) {
        localStorage.setItem('lockroute_jobs', JSON.stringify(this.jobs));
        if (typeof cloudDB !== 'undefined' && supabaseReady) {
            cloudDB.deleteJob(id);
        }
    },

    // ---- Event Bindings ----
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showView(item.dataset.view);
            });
        });

        // Mobile menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.showView('add-job');
            document.getElementById('sidebar').classList.remove('open');
        });

        // Close sidebar on overlay click (mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.getElementById('menu-toggle');
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
                sidebar.classList.remove('open');
            }
        });

        // Job form
        document.getElementById('job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });

        // Postcode input formatting
        document.getElementById('job-postcode').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            this.updatePostcodeHint(e.target.value);
            this.generateSuggestions();
        });

        // Job type change - update duration
        document.getElementById('job-type').addEventListener('change', (e) => {
            const type = JOB_TYPES[e.target.value];
            if (type) {
                const customDuration = this.settings.jobDurations[e.target.value];
                document.getElementById('job-duration').value = customDuration || type.defaultDuration;
            }
            this.generateSuggestions();
        });

        // Reg lookup
        document.getElementById('lookup-reg-btn').addEventListener('click', () => this.lookupVehicleReg());
        document.getElementById('job-reg').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Price / VAT
        document.getElementById('job-price').addEventListener('input', () => this.updateVatBreakdown());
        document.getElementById('vat-registered').addEventListener('change', (e) => {
            document.getElementById('vat-settings').style.display = e.target.checked ? 'block' : 'none';
        });

        // Jotter
        document.getElementById('jotter-add-btn').addEventListener('click', () => this.addJotterNote());
        document.getElementById('jotter-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.addJotterNote();
        });

        // Date change triggers suggestions
        document.getElementById('job-date').addEventListener('change', () => {
            this.generateSuggestions();
        });

        // Calendar navigation
        document.getElementById('cal-prev').addEventListener('click', () => this.navigateCalendar(-1));
        document.getElementById('cal-next').addEventListener('click', () => this.navigateCalendar(1));

        // Calendar view toggle
        document.querySelectorAll('.toggle-btn[data-cal-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toggle-btn[data-cal-view]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.calendarViewMode = btn.dataset.calView;
                this.renderCalendar();
            });
        });

        // Route date
        document.getElementById('route-date').addEventListener('change', (e) => {
            this.renderRoute(e.target.value);
        });

        document.getElementById('route-prev-day').addEventListener('click', () => this.changeRouteDay(-1));
        document.getElementById('route-next-day').addEventListener('click', () => this.changeRouteDay(1));

        // Settings save
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());

        // Clear all data
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllJobs());

        // Block time
        document.getElementById('add-block-btn').addEventListener('click', () => this.openBlockModal());
        document.getElementById('block-save').addEventListener('click', () => this.saveTimeBlock());
        document.getElementById('block-delete').addEventListener('click', () => this.deleteTimeBlock());

        // Color picker selection highlight
        document.querySelectorAll('#block-color-picker input').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('#block-color-picker .color-dot').forEach(dot => {
                    dot.style.borderColor = 'transparent';
                });
                if (radio.checked) {
                    radio.nextElementSibling.style.borderColor = '#fff';
                }
            });
        });

        // Lunch toggle
        document.getElementById('lunch-enabled').addEventListener('change', (e) => {
            document.getElementById('lunch-settings').style.display = e.target.checked ? 'block' : 'none';
        });

        // Modal overlay close
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    // ---- View Management ----
    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show target
        const view = document.getElementById(`view-${viewName}`);
        if (view) view.classList.add('active');

        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (navItem) navItem.classList.add('active');

        this.currentView = viewName;

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');

        // Render view-specific content
        switch (viewName) {
            case 'dashboard': this.renderDashboard(); break;
            case 'calendar': this.renderCalendar(); break;
            case 'add-job':
                this.generateSuggestions();
                document.querySelector('label[for="job-price"]').textContent = this.settings.vatRegistered ? 'Price (Net)' : 'Price Quoted';
                this.updateVatBreakdown();
                setTimeout(() => document.getElementById('job-postcode').focus(), 50);
                break;
            case 'route':
                document.getElementById('route-date').value = this.todayStr();
                this.renderRoute(this.todayStr());
                break;
            case 'jotter': this.renderJotter(); break;
            case 'settings': this.renderSettings(); break;
        }
    },

    // ---- Date Helpers ----
    todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    setDefaultDates() {
        // Default to next working day if today is non-working
        let defaultDate = new Date();
        for (let i = 0; i < 7; i++) {
            if (this.settings.workingDays.includes(defaultDate.getDay())) break;
            defaultDate.setDate(defaultDate.getDate() + 1);
        }
        document.getElementById('job-date').value = defaultDate.toISOString().split('T')[0];
        document.getElementById('job-date').min = this.todayStr();
    },

    formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatDateShort(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    },

    formatTime(timeStr) {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${m} ${ampm}`;
    },

    getFriendlyDateTime(dateStr, timeStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        let dayPart;
        if (d.getTime() === today.getTime()) {
            dayPart = 'Today';
        } else if (d.getTime() === tomorrow.getTime()) {
            dayPart = 'Tomorrow';
        } else if (d < nextWeek) {
            dayPart = d.toLocaleDateString('en-GB', { weekday: 'long' });
        } else {
            dayPart = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        }

        return `${dayPart} at ${this.formatTime(timeStr)}`;
    },

    getDayName(dateStr) {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
    },

    getDayNum(dateStr) {
        return new Date(dateStr + 'T00:00:00').getDate();
    },

    timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    },

    minutesToTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },

    getWeekDates(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        const monday = new Date(d);
        monday.setDate(diff);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const dd = new Date(monday);
            dd.setDate(monday.getDate() + i);
            dates.push(dd.toISOString().split('T')[0]);
        }
        return dates;
    },

    // ---- Postcode Helpers ----
    parsePostcodeArea(postcode) {
        if (!postcode) return null;
        const clean = postcode.replace(/\s/g, '').toUpperCase();
        // Try 2-letter area first, then 1-letter
        const area2 = clean.substring(0, 2);
        if (POSTCODE_AREAS[area2]) return area2;
        const area1 = clean.substring(0, 1);
        if (POSTCODE_AREAS[area1]) return area1;
        return null;
    },

    getPostcodeInfo(postcode) {
        // Synchronous: returns cached geocode or falls back to static table
        if (!postcode) return null;
        const clean = postcode.replace(/\s/g, '').toUpperCase();
        if (_geocodeCache[clean]) return _geocodeCache[clean];
        const area = this.parsePostcodeArea(postcode);
        if (area && POSTCODE_AREAS[area]) {
            return POSTCODE_AREAS[area];
        }
        return null;
    },

    async getPostcodeInfoAsync(postcode) {
        return await geocodePostcode(postcode);
    },

    updatePostcodeHint(postcode) {
        const hint = document.getElementById('postcode-hint');
        if (!postcode || postcode.trim().length < 2) {
            hint.textContent = '';
            return;
        }
        // Show immediate result from cache/static, then upgrade with geocode
        const cached = this.getPostcodeInfo(postcode);
        if (cached) {
            hint.textContent = `📍 ${cached.name}`;
            hint.style.color = '#10b981';
        } else {
            hint.textContent = 'Looking up…';
            hint.style.color = '#94a3b8';
        }
        // Async geocode for accurate result
        geocodePostcode(postcode).then(info => {
            if (info) {
                hint.textContent = `📍 ${info.name}`;
                hint.style.color = '#10b981';
            } else if (postcode.trim().length > 1) {
                hint.textContent = 'Area not recognised - travel times will use defaults';
                hint.style.color = '#f59e0b';
            }
        });
    },

    estimateTravelMinutes(postcodeA, postcodeB) {
        const infoA = this.getPostcodeInfo(postcodeA);
        const infoB = this.getPostcodeInfo(postcodeB);

        if (!infoA || !infoB) return this.settings.defaultTravel;

        // Haversine-ish distance calculation
        const R = 6371;
        const dLat = (infoB.lat - infoA.lat) * Math.PI / 180;
        const dLng = (infoB.lng - infoA.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(infoA.lat * Math.PI / 180) * Math.cos(infoB.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distKm = R * c;

        // Rough estimate: avg 30km/h in urban, 50km/h suburban
        const avgSpeed = distKm > 20 ? 45 : 25;
        let travelMins = Math.round((distKm / avgSpeed) * 60);

        // Minimum travel time
        if (travelMins < 5) travelMins = 5;

        return travelMins;
    },

    // ---- Job Management ----
    saveJob() {
        const id = document.getElementById('job-id').value || this.generateId();
        const isEdit = !!document.getElementById('job-id').value;

        const job = {
            id,
            customerName: document.getElementById('customer-name').value.trim(),
            customerPhone: document.getElementById('customer-phone').value.trim(),
            postcode: document.getElementById('job-postcode').value.trim().toUpperCase(),
            address: document.getElementById('job-address').value.trim(),
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

    deleteJob(id) {
        this.jobs = this.jobs.filter(j => j.id !== id);
        this.removeJob(id);
        this.updateQuickStats();
        this.closeModal();
        this.toast('Job deleted', 'info');
        this.renderDashboard();
    },

    completeJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (job) {
            job.status = 'completed';
            this.persistJob(job);
            this.closeModal();
            this.toast('Job marked as complete', 'success');
            this.renderDashboard();
        }
    },

    editJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job) return;

        this.closeModal();
        this.showView('add-job');

        document.getElementById('job-form-title').textContent = 'Edit Job';
        document.getElementById('form-submit-text').textContent = 'Update Job';
        document.getElementById('job-id').value = job.id;
        document.getElementById('customer-name').value = job.customerName;
        document.getElementById('customer-phone').value = job.customerPhone;
        document.getElementById('job-postcode').value = job.postcode;
        document.getElementById('job-address').value = job.address;
        document.getElementById('job-type').value = job.type;
        document.getElementById('job-duration').value = job.duration;
        document.getElementById('job-notes').value = job.notes;
        document.getElementById('job-date').value = job.date;
        document.getElementById('job-time').value = job.time;

        const priorityRadio = document.querySelector(`input[name="priority"][value="${job.priority}"]`);
        if (priorityRadio) priorityRadio.checked = true;

        document.getElementById('job-reg').value = job.vehicleReg || '';
        document.getElementById('job-price').value = job.priceQuoted || '';
        this._lastVehicleInfo = job.vehicleInfo || null;
        const vInfo = document.getElementById('vehicle-info');
        if (job.vehicleInfo) {
            vInfo.innerHTML = this.formatVehicleInfo(job.vehicleInfo);
            vInfo.style.display = 'block';
        } else {
            vInfo.style.display = 'none';
        }

        this.updatePostcodeHint(job.postcode);
    },

    resetJobForm() {
        document.getElementById('job-form').reset();
        document.getElementById('job-id').value = '';
        document.getElementById('job-form-title').textContent = 'New Job';
        document.getElementById('form-submit-text').textContent = 'Schedule Job';
        document.getElementById('postcode-hint').textContent = '';
        document.getElementById('job-reg').value = '';
        document.getElementById('job-price').value = '';
        document.getElementById('vehicle-info').style.display = 'none';
        this._lastVehicleInfo = null;
        this.setDefaultDates();
        document.querySelector('input[name="priority"][value="normal"]').checked = true;
    },

    generateId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    },

    getJobsForDate(dateStr) {
        return this.jobs
            .filter(j => j.date === dateStr && j.status !== 'cancelled')
            .sort((a, b) => a.time.localeCompare(b.time));
    },

    getJobColor(job) {
        const type = JOB_TYPES[job.type];
        return type ? type.color : '#6b7280';
    },

    getJobLabel(job) {
        if (this.settings.jobLabels[job.type]) return this.settings.jobLabels[job.type];
        const type = JOB_TYPES[job.type];
        return type ? type.label : 'Other';
    },

    getJobIcon(job) {
        const type = JOB_TYPES[job.type];
        return type ? type.icon : '📝';
    },

    getJobColorClass(job) {
        const type = JOB_TYPES[job.type];
        if (!type) return 'job-color-other';
        switch (type.category) {
            case 'car': return 'job-color-car';
            case 'house': return 'job-color-house';
            case 'commercial': return 'job-color-commercial';
            default: return 'job-color-other';
        }
    },

    // ---- Smart Scheduling Suggestions ----
    generateSuggestions() {
        const container = document.getElementById('suggestions-list');
        const date = document.getElementById('job-date').value;
        const postcode = document.getElementById('job-postcode').value.trim().toUpperCase();
        const duration = parseInt(document.getElementById('job-duration').value) || 60;

        if (!date) {
            container.innerHTML = '<span style="font-size:12px;color:#92400e;">Select a date to see suggestions</span>';
            return;
        }

        // Check if selected date is a working day
        const selectedDay = new Date(date + 'T00:00:00');
        const dayOfWeek = selectedDay.getDay();
        if (!this.settings.workingDays.includes(dayOfWeek)) {
            const dayName = selectedDay.toLocaleDateString('en-GB', { weekday: 'long' });
            const nextSlots = this.findNextAvailableDay(date, duration, postcode);
            container.innerHTML = `
                <span style="font-size:12px;color:#92400e;display:block;margin-bottom:8px;">
                    ${dayName} is not a working day. Try:
                </span>
                ${nextSlots.map(s => `
                    <button type="button" class="suggestion-chip" onclick="app.applySuggestion('${s.date}','${s.time}')"
                            title="${s.reason || ''}">
                        ${s.label}${s.tag ? ' ' + s.tag : ''}
                    </button>
                `).join('')}
            `;
            return;
        }

        const slots = this.findAvailableSlots(date, duration, postcode);

        if (slots.length === 0) {
            // Try next available days (location-aware)
            const nextSlots = this.findNextAvailableDay(date, duration, postcode);
            if (nextSlots.length > 0) {
                container.innerHTML = `
                    <span style="font-size:12px;color:#92400e;display:block;margin-bottom:8px;">
                        No slots on ${this.formatDateShort(date)}. Try:
                    </span>
                    ${nextSlots.map(s => `
                        <button type="button" class="suggestion-chip" onclick="app.applySuggestion('${s.date}','${s.time}')"
                                title="${s.reason || ''}">
                            ${s.label}${s.tag ? ' ' + s.tag : ''}
                        </button>
                    `).join('')}
                `;
            } else {
                container.innerHTML = '<span style="font-size:12px;color:#92400e;">No available slots found this week</span>';
            }
            return;
        }

        // If we have a postcode, check if this day has nearby jobs
        const nearbyWarning = this.getNearbyWarning(date, postcode, slots);

        // Show better location-based days first (if any), then current day slots
        let html = '';

        if (nearbyWarning && nearbyWarning.betterDays.length > 0) {
            html += `
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:10px 12px;margin-bottom:12px;">
                    <span style="font-size:13px;font-weight:600;color:#065f46;display:block;margin-bottom:8px;">
                        📍 Better days — nearby jobs already booked:
                    </span>
                    ${nearbyWarning.betterDays.map(s => `
                        <button type="button" class="suggestion-chip" onclick="app.applySuggestion('${s.date}','${s.time}')"
                                title="${s.reason || ''}" style="border-color:#10b981;color:#065f46;background:#d1fae5;font-weight:600;">
                            ${s.label}${s.tag ? ' ' + s.tag : ''}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        if (nearbyWarning) {
            html += `<span style="font-size:12px;color:#92400e;display:block;margin-bottom:8px;">${nearbyWarning.message}</span>`;
        }

        html += slots.map(s => `
            <button type="button" class="suggestion-chip" onclick="app.applySuggestion('${s.date}','${s.time}')"
                    title="${s.reason || ''}">
                ${s.label}${s.tag ? ' ' + s.tag : ''}
            </button>
        `).join('');

        container.innerHTML = html;
    },

    // Check if the selected day has jobs far from the new postcode, and suggest better days
    getNearbyWarning(dateStr, postcode, currentSlots) {
        if (!postcode || !this.getPostcodeInfo(postcode)) return null;

        const existingJobs = this.getJobsForDate(dateStr).filter(j => j.status !== 'cancelled');
        if (existingJobs.length === 0) return null; // Empty day, no issue

        // Check travel to all existing jobs on this day
        const travelTimes = existingJobs.map(j => ({
            job: j,
            travel: this.estimateTravelMinutes(postcode, j.postcode),
        }));
        const nearestTravel = Math.min(...travelTimes.map(t => t.travel));

        // If closest job is within 20 min travel, this day is fine
        if (nearestTravel <= 20) return null;

        const duration = parseInt(document.getElementById('job-duration').value) || 60;

        // This day's jobs are all far away — find better days
        const betterDays = this.findNearbyDays(dateStr, postcode, duration);

        return {
            message: `⚠️ Jobs on this day are ${nearestTravel}+ min away from ${postcode}. This means extra travel.`,
            betterDays,
        };
    },

    // Find days in the next 2 weeks that have jobs near the given postcode
    findNearbyDays(fromDateStr, postcode, durationMins) {
        const results = [];
        const startDate = new Date(fromDateStr + 'T00:00:00');

        for (let i = -7; i <= 14; i++) {
            if (i === 0) continue; // skip the current date
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);

            // Don't suggest past dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) continue;

            const dayOfWeek = d.getDay();
            if (!this.settings.workingDays.includes(dayOfWeek)) continue;

            const dateStr = d.toISOString().split('T')[0];
            const dayJobs = this.getJobsForDate(dateStr).filter(j => j.status !== 'cancelled');

            if (dayJobs.length === 0) continue; // We want days WITH existing nearby jobs

            // Check if any job on this day is near the new postcode
            const nearestTravel = Math.min(...dayJobs.map(j => this.estimateTravelMinutes(postcode, j.postcode)));
            if (nearestTravel > 20) continue; // Not close enough

            // Find a slot on this day
            const slots = this.findAvailableSlots(dateStr, durationMins, postcode);
            if (slots.length === 0) continue;

            const bestSlot = slots[0]; // Already sorted by proximity
            bestSlot.tag = `~${nearestTravel} min travel`;
            bestSlot.reason = `Near ${dayJobs.find(j => this.estimateTravelMinutes(postcode, j.postcode) === nearestTravel)?.postcode || 'existing'} job`;
            results.push(bestSlot);

            if (results.length >= 3) break;
        }

        return results;
    },

    findAvailableSlots(dateStr, durationMins, newPostcode) {
        const existingJobs = this.getJobsForDate(dateStr).filter(j => j.status !== 'cancelled');
        const workStart = this.timeToMinutes(this.settings.workStart);
        const workEnd = this.timeToMinutes(this.settings.workEnd);
        const buffer = this.settings.bufferTime;

        // Build blocked periods with actual travel times based on postcodes
        const blocked = [];

        for (const job of existingJobs) {
            const start = this.timeToMinutes(job.time);
            // Travel time from/to this job depends on the new job's postcode
            const travelToJob = newPostcode ? this.estimateTravelMinutes(newPostcode, job.postcode) : this.settings.defaultTravel;
            const end = start + job.duration + buffer;
            // Block: can't start new job within travelToJob mins before this job starts,
            // and can't start until travelToJob mins after this job ends
            blocked.push({
                start: start - travelToJob - durationMins, // earliest the new job could start and finish + travel before this job
                end: end + travelToJob,                     // earliest the new job could start after this job + travel
                jobPostcode: job.postcode,
                jobTime: start,
                jobEnd: end,
            });
        }

        // Add lunch break
        if (this.settings.lunchEnabled) {
            const lunchStart = this.timeToMinutes(this.settings.lunchStart);
            blocked.push({ start: lunchStart - durationMins, end: lunchStart + this.settings.lunchDuration, jobPostcode: null, jobTime: lunchStart, jobEnd: lunchStart + this.settings.lunchDuration });
        }

        // Add time blocks
        const blocks = this.getBlocksForDate(dateStr);
        for (const block of blocks) {
            const bStart = this.timeToMinutes(block.startTime);
            const bEnd = this.timeToMinutes(block.endTime);
            blocked.push({ start: bStart - durationMins, end: bEnd, jobPostcode: null, jobTime: bStart, jobEnd: bEnd });
        }

        // Sort blocked periods
        blocked.sort((a, b) => a.start - b.start);

        // Merge overlapping blocked periods
        const merged = [];
        for (const block of blocked) {
            if (merged.length > 0 && block.start <= merged[merged.length - 1].end) {
                merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, block.end);
            } else {
                merged.push({ ...block });
            }
        }

        // Find gaps where the new job fits
        const slots = [];
        let cursor = workStart;

        // Account for travel from home to first job location
        if (newPostcode && this.settings.homePostcode) {
            const travelFromHome = this.estimateTravelMinutes(this.settings.homePostcode, newPostcode);
            cursor = Math.max(cursor, workStart + travelFromHome);
        }

        // If today, don't suggest slots in the past (+ travel from home)
        const today = this.todayStr();
        if (dateStr === today) {
            const now = new Date();
            let earliestMinutes = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer
            if (this.settings.homePostcode && newPostcode) {
                earliestMinutes += this.estimateTravelMinutes(this.settings.homePostcode, newPostcode);
            }
            cursor = Math.max(cursor, earliestMinutes);
        }

        for (const block of merged) {
            const gapStart = Math.max(cursor, workStart);
            const gapEnd = block.start + durationMins; // block.start is already offset by duration
            if (gapStart + durationMins <= gapEnd && gapStart + durationMins <= workEnd) {
                // Find which adjacent job makes this slot good
                const slotInfo = this.getSlotInfo(gapStart, existingJobs, newPostcode, dateStr);
                slots.push(slotInfo);
            }
            cursor = Math.max(cursor, block.end);
        }

        // Check after last block
        if (cursor + durationMins <= workEnd) {
            const slotInfo = this.getSlotInfo(cursor, existingJobs, newPostcode, dateStr);
            slots.push(slotInfo);
        }

        // Sort: prefer slots near existing jobs (lower travel), then by time
        if (newPostcode && this.getPostcodeInfo(newPostcode)) {
            slots.sort((a, b) => {
                // Prioritise slots adjacent to nearby jobs
                if (a.nearestTravel !== b.nearestTravel) return a.nearestTravel - b.nearestTravel;
                return this.timeToMinutes(a.time) - this.timeToMinutes(b.time);
            });
        }

        return slots.slice(0, 5);
    },

    // Build info about a slot — travel to nearest job, label, tag
    getSlotInfo(startMinutes, existingJobs, newPostcode, dateStr) {
        const timeStr = this.minutesToTime(startMinutes);
        const label = this.getFriendlyDateTime(dateStr, timeStr);

        let nearestTravel = Infinity;
        let nearestPostcode = null;
        let tag = '';
        let reason = '';

        if (newPostcode && this.getPostcodeInfo(newPostcode) && existingJobs.length > 0) {
            for (const job of existingJobs) {
                const travel = this.estimateTravelMinutes(newPostcode, job.postcode);
                if (travel < nearestTravel) {
                    nearestTravel = travel;
                    nearestPostcode = job.postcode;
                }
            }

            if (nearestTravel <= 10) {
                tag = '📍 nearby';
                reason = `Only ~${nearestTravel} min from ${nearestPostcode} job`;
            } else if (nearestTravel <= 20) {
                tag = `~${nearestTravel} min travel`;
                reason = `${nearestTravel} min from ${nearestPostcode} job`;
            } else {
                tag = `⚠️ ${nearestTravel} min travel`;
                reason = `${nearestTravel} min travel to nearest job (${nearestPostcode})`;
            }
        } else {
            nearestTravel = 0;
        }

        return { date: dateStr, time: timeStr, label, tag, reason, nearestTravel };
    },

    findNextAvailableDay(fromDateStr, durationMins, newPostcode) {
        const results = [];
        const startDate = new Date(fromDateStr + 'T00:00:00');

        // First pass: find days with nearby jobs
        if (newPostcode && this.getPostcodeInfo(newPostcode)) {
            for (let i = 1; i <= 14; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const dayOfWeek = d.getDay();
                if (!this.settings.workingDays.includes(dayOfWeek)) continue;

                const dateStr = d.toISOString().split('T')[0];
                const dayJobs = this.getJobsForDate(dateStr).filter(j => j.status !== 'cancelled');
                const nearestTravel = dayJobs.length > 0
                    ? Math.min(...dayJobs.map(j => this.estimateTravelMinutes(newPostcode, j.postcode)))
                    : Infinity;

                if (nearestTravel <= 20) {
                    const slots = this.findAvailableSlots(dateStr, durationMins, newPostcode);
                    if (slots.length > 0) {
                        results.push(slots[0]);
                        if (results.length >= 3) break;
                    }
                }
            }
        }

        // Second pass: if we didn't find enough nearby days, add any available day
        if (results.length < 3) {
            for (let i = 1; i <= 14; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const dayOfWeek = d.getDay();
                if (!this.settings.workingDays.includes(dayOfWeek)) continue;

                const dateStr = d.toISOString().split('T')[0];
                if (results.find(r => r.date === dateStr)) continue; // already added

                const slots = this.findAvailableSlots(dateStr, durationMins, newPostcode);
                if (slots.length > 0) {
                    results.push(slots[0]);
                    if (results.length >= 3) break;
                }
            }
        }

        return results;
    },

    applySuggestion(date, time) {
        document.getElementById('job-date').value = date;
        document.getElementById('job-time').value = time;
        this.generateSuggestions();
    },

    // ---- Dashboard ----
    renderDashboard() {
        const today = this.todayStr();
        document.getElementById('dashboard-date').textContent = this.formatDate(today);

        this.renderTodayTimeline(today);
        this.renderUpcoming();
        this.renderNextSlot();
        this.renderWeekStats();
        this.renderEarnings();
    },

    renderTodayTimeline(dateStr) {
        const container = document.getElementById('today-timeline');
        const jobs = this.getJobsForDate(dateStr);

        document.getElementById('today-badge').textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>No jobs scheduled for today</p>
                    <button class="btn btn-outline" onclick="app.showView('add-job')">Schedule a job</button>
                </div>
            `;
            return;
        }

        let html = '';

        // Insert lunch break in the right position
        const lunchStart = this.settings.lunchEnabled ? this.timeToMinutes(this.settings.lunchStart) : null;

        // Gather time blocks for today
        const blocks = this.getBlocksForDate(dateStr);
        const blocksSorted = blocks.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
        const insertedBlocks = new Set();

        let lunchInserted = false;

        for (const job of jobs) {
            const jobMins = this.timeToMinutes(job.time);

            // Insert blocks before this job
            for (const block of blocksSorted) {
                if (insertedBlocks.has(block.id)) continue;
                const bStart = this.timeToMinutes(block.startTime);
                if (bStart <= jobMins) {
                    html += `
                        <div class="timeline-lunch" style="border-left-color:${block.color};" onclick="app.openBlockModal('${block.id}')">
                            🚫 ${block.label} (${this.formatTime(block.startTime)} - ${this.formatTime(block.endTime)})
                        </div>
                    `;
                    insertedBlocks.add(block.id);
                }
            }

            // Insert lunch before this job if appropriate
            if (this.settings.lunchEnabled && !lunchInserted && lunchStart !== null && jobMins >= lunchStart) {
                html += `
                    <div class="timeline-lunch">
                        🍴 Lunch Break (${this.formatTime(this.settings.lunchStart)} - ${this.formatTime(this.minutesToTime(lunchStart + this.settings.lunchDuration))})
                    </div>
                `;
                lunchInserted = true;
            }

            const [h, m] = job.time.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

            html += `
                <div class="timeline-item" onclick="app.showJobModal('${job.id}')">
                    <div class="timeline-dot ${this.getJobColorClass(job)}"></div>
                    <div class="timeline-time">
                        <span class="timeline-hour">${displayHour}:${m}</span>
                        <span class="timeline-period">${ampm}</span>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${this.getJobIcon(job)} ${this.getJobLabel(job)}</div>
                        <div class="timeline-subtitle">${job.customerName || 'No name'} - ${job.postcode}</div>
                        <div class="timeline-meta">
                            <span>⏱️ ${job.duration} min</span>
                            ${job.address ? `<span>📍 ${job.address}</span>` : ''}
                            ${job.status === 'completed' ? '<span class="status-badge status-completed">Done</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        // Insert lunch at end if not yet inserted
        if (this.settings.lunchEnabled && !lunchInserted && lunchStart !== null) {
            html += `
                <div class="timeline-lunch">
                    🍴 Lunch Break (${this.formatTime(this.settings.lunchStart)} - ${this.formatTime(this.minutesToTime(lunchStart + this.settings.lunchDuration))})
                </div>
            `;
        }

        // Insert remaining blocks
        for (const block of blocksSorted) {
            if (insertedBlocks.has(block.id)) continue;
            html += `
                <div class="timeline-lunch" style="border-left-color:${block.color};" onclick="app.openBlockModal('${block.id}')">
                    🚫 ${block.label} (${this.formatTime(block.startTime)} - ${this.formatTime(block.endTime)})
                </div>
            `;
        }

        container.innerHTML = html;
    },

    renderUpcoming() {
        const container = document.getElementById('upcoming-list');
        const today = this.todayStr();

        const upcoming = this.jobs
            .filter(j => j.date > today && j.status === 'scheduled')
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .slice(0, 5);

        if (upcoming.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding:20px;">
                    <span class="empty-icon">📅</span>
                    <p>No upcoming jobs</p>
                </div>
            `;
            return;
        }

        container.innerHTML = upcoming.map(job => `
            <div class="upcoming-item" onclick="app.showJobModal('${job.id}')">
                <div class="upcoming-date">
                    <div class="upcoming-day">${this.getDayName(job.date)}</div>
                    <div class="upcoming-date-num">${this.getDayNum(job.date)}</div>
                </div>
                <div class="upcoming-info">
                    <div class="upcoming-title">${this.getJobIcon(job)} ${this.getJobLabel(job)}</div>
                    <div class="upcoming-detail">${this.formatTime(job.time)} - ${job.postcode} ${job.customerName ? '- ' + job.customerName : ''}</div>
                </div>
            </div>
        `).join('');
    },

    renderNextSlot() {
        const container = document.getElementById('next-slot-info');
        const today = this.todayStr();

        // Find next available 1-hour slot
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();

            if (!this.settings.workingDays.includes(dayOfWeek)) continue;

            const slots = this.findAvailableSlots(dateStr, 60);

            // For today, filter out past slots
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const validSlots = i === 0
                ? slots.filter(s => this.timeToMinutes(s.time) > currentMinutes)
                : slots;

            if (validSlots.length > 0) {
                const slot = validSlots[0];
                container.innerHTML = `
                    <span class="slot-time">${slot.label}</span>
                    <span class="slot-detail">Next free 1-hour slot</span>
                `;
                return;
            }
        }

        container.innerHTML = `
            <span class="slot-time">Fully Booked</span>
            <span class="slot-detail">No free slots in the next 2 weeks</span>
        `;
    },

    renderWeekStats() {
        const weekDates = this.getWeekDates(new Date());
        const weekJobs = this.jobs.filter(j => weekDates.includes(j.date) && j.status !== 'cancelled');
        const totalMinutes = weekJobs.reduce((sum, j) => sum + j.duration, 0);
        const areas = new Set(weekJobs.map(j => this.parsePostcodeArea(j.postcode)).filter(Boolean));

        // Count free slots
        let freeSlots = 0;
        for (const date of weekDates) {
            const d = new Date(date + 'T00:00:00');
            if (this.settings.workingDays.includes(d.getDay())) {
                freeSlots += this.findAvailableSlots(date, 60).length;
            }
        }

        document.getElementById('stat-total-jobs').textContent = weekJobs.length;
        document.getElementById('stat-hours-booked').textContent = `${Math.round(totalMinutes / 60)}h`;
        document.getElementById('stat-areas').textContent = areas.size;
        document.getElementById('stat-free-slots').textContent = freeSlots;
    },

    renderEarnings() {
        const today = this.todayStr();
        const weekDates = this.getWeekDates(new Date());

        const weekJobs = this.jobs.filter(j => weekDates.includes(j.date) && j.status !== 'cancelled');
        const weekNet = weekJobs.reduce((sum, j) => sum + (parseFloat(j.priceQuoted) || 0), 0);
        const weekVat = weekJobs.reduce((sum, j) => {
            if (j.vatApplied && j.vatRate) return sum + (parseFloat(j.priceQuoted) || 0) * (j.vatRate / 100);
            return sum;
        }, 0);
        const weekTotal = weekNet + weekVat;

        const upcomingJobs = this.jobs.filter(j => j.date >= today && j.status === 'scheduled');
        const upcomingNet = upcomingJobs.reduce((sum, j) => sum + (parseFloat(j.priceQuoted) || 0), 0);
        const upcomingVat = upcomingJobs.reduce((sum, j) => {
            if (j.vatApplied && j.vatRate) return sum + (parseFloat(j.priceQuoted) || 0) * (j.vatRate / 100);
            return sum;
        }, 0);
        const upcomingTotal = upcomingNet + upcomingVat;

        document.getElementById('stat-earnings-week').textContent = weekTotal > 0 ? `£${weekTotal.toFixed(0)}` : '£0';
        document.getElementById('stat-earnings-upcoming').textContent = upcomingTotal > 0 ? `£${upcomingTotal.toFixed(0)}` : '£0';

        const vatBreakdown = document.getElementById('vat-earnings-breakdown');
        if (this.settings.vatRegistered && (weekVat > 0 || upcomingVat > 0)) {
            vatBreakdown.style.display = 'block';
            document.getElementById('stat-earnings-net').textContent = `£${weekNet.toFixed(0)}`;
            document.getElementById('stat-earnings-vat').textContent = `£${weekVat.toFixed(0)}`;
        } else {
            vatBreakdown.style.display = 'none';
        }
    },

    // ---- Calendar ----
    renderCalendar() {
        if (this.calendarViewMode === 'week') {
            document.getElementById('calendar-week').style.display = '';
            document.getElementById('calendar-day').style.display = 'none';
            this.renderWeekCalendar();
        } else {
            document.getElementById('calendar-week').style.display = 'none';
            document.getElementById('calendar-day').style.display = '';
            this.renderDayCalendar();
        }
    },

    navigateCalendar(direction) {
        if (this.calendarViewMode === 'week') {
            this.calendarDate.setDate(this.calendarDate.getDate() + direction * 7);
        } else {
            this.calendarDate.setDate(this.calendarDate.getDate() + direction);
        }
        this.renderCalendar();
    },

    renderWeekCalendar() {
        const weekDates = this.getWeekDates(this.calendarDate);
        const today = this.todayStr();

        // Title
        const startDate = new Date(weekDates[0] + 'T00:00:00');
        const endDate = new Date(weekDates[6] + 'T00:00:00');
        document.getElementById('cal-title').textContent =
            `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Day headers
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        document.getElementById('cal-day-headers').innerHTML =
            '<div class="cal-day-header"></div>' +
            weekDates.map((d, i) => {
                const dateObj = new Date(d + 'T00:00:00');
                const isNonWorking = !this.settings.workingDays.includes(dateObj.getDay());
                return `
                    <div class="cal-day-header ${d === today ? 'today' : ''} ${isNonWorking ? 'cal-non-working' : ''}">
                        ${dayNames[i]}
                        <span class="day-num">${dateObj.getDate()}</span>
                    </div>
                `;
            }).join('');

        // Time column (6am to 9pm)
        const startHour = 6;
        const endHour = 21;
        let timesHtml = '';
        for (let h = startHour; h <= endHour; h++) {
            const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
            timesHtml += `<div class="cal-time-slot">${label}</div>`;
        }
        document.getElementById('cal-times').innerHTML = timesHtml;

        // Grid columns
        const slotHeight = 60; // px per hour
        let gridHtml = '';

        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const dateStr = weekDates[dayIdx];
            const jobs = this.getJobsForDate(dateStr);
            const colDateObj = new Date(dateStr + 'T00:00:00');
            const isNonWorking = !this.settings.workingDays.includes(colDateObj.getDay());

            let columnHtml = `<div class="cal-day-column ${isNonWorking ? 'cal-non-working' : ''}" data-date="${dateStr}">`;

            // Hour lines
            for (let h = startHour; h <= endHour; h++) {
                columnHtml += `<div class="cal-hour-line"></div>`;
            }

            // Job events
            for (const job of jobs) {
                const jobStart = this.timeToMinutes(job.time);
                const topPx = ((jobStart / 60) - startHour) * slotHeight;
                const heightPx = (job.duration / 60) * slotHeight;
                const color = this.getJobColor(job);

                columnHtml += `
                    <div class="cal-event" data-job-id="${job.id}" style="top:${topPx}px;height:${Math.max(heightPx, 20)}px;background:${color};cursor:grab;"
                         onclick="app.showJobModal('${job.id}')">
                        <div class="cal-event-title">${this.getJobIcon(job)} ${job.customerName || this.getJobLabel(job)}</div>
                        <div class="cal-event-time">${this.formatTime(job.time)} - ${job.postcode}</div>
                    </div>
                `;
            }

            // Lunch break
            if (this.settings.lunchEnabled) {
                const lunchStart = this.timeToMinutes(this.settings.lunchStart);
                const topPx = ((lunchStart / 60) - startHour) * slotHeight;
                const heightPx = (this.settings.lunchDuration / 60) * slotHeight;
                const d = new Date(dateStr + 'T00:00:00');
                if (this.settings.workingDays.includes(d.getDay())) {
                    columnHtml += `
                        <div class="cal-event lunch-break" style="top:${topPx}px;height:${heightPx}px;">
                            🍴 Lunch
                        </div>
                    `;
                }
            }

            // Time blocks
            const blocks = this.getBlocksForDate(dateStr);
            for (const block of blocks) {
                const bStart = this.timeToMinutes(block.startTime);
                const bEnd = this.timeToMinutes(block.endTime);
                const topPx = ((bStart / 60) - startHour) * slotHeight;
                const heightPx = ((bEnd - bStart) / 60) * slotHeight;
                columnHtml += `
                    <div class="cal-event time-block" style="top:${topPx}px;height:${Math.max(heightPx, 20)}px;background:${block.color};opacity:0.7;"
                         onclick="app.openBlockModal('${block.id}')">
                        <div class="cal-event-title">🚫 ${block.label}</div>
                        <div class="cal-event-time">${this.formatTime(block.startTime)} - ${this.formatTime(block.endTime)}</div>
                    </div>
                `;
            }

            // Current time line (if today)
            if (dateStr === today) {
                const now = new Date();
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                const topPx = ((nowMinutes / 60) - startHour) * slotHeight;
                if (topPx >= 0) {
                    columnHtml += `<div class="cal-current-time" style="top:${topPx}px;"></div>`;
                }
            }

            columnHtml += '</div>';
            gridHtml += columnHtml;
        }

        document.getElementById('cal-grid').innerHTML = gridHtml;

        // Scroll to 8am
        const calBody = document.querySelector('.cal-body');
        if (calBody) {
            calBody.scrollTop = (8 - startHour) * slotHeight;
        }

        this.initCalendarDragDrop();
    },

    // ---- Calendar Drag & Drop ----
    _dragHandlersBound: false,
    _dragHandlers: null,
    initCalendarDragDrop() {
        const grid = document.getElementById('cal-grid');
        if (!grid) return;

        // Remove old handlers if they exist
        const calContainer = document.querySelector('.calendar-container');
        if (!calContainer) return;
        if (this._dragHandlers) {
            calContainer.removeEventListener('pointerdown', this._dragHandlers.down);
            calContainer.removeEventListener('pointermove', this._dragHandlers.move);
            calContainer.removeEventListener('pointerup', this._dragHandlers.up);
        }
        if (this._dragHandlersBound && this._dragHandlers) return;
        this._dragHandlersBound = true;

        let dragJob = null;
        let ghost = null;
        let startX = 0, startY = 0;
        let isDragging = false;
        let originEl = null;
        const self = this;
        const DRAG_THRESHOLD = 5;
        const SLOT_HEIGHT = 60; // px per hour
        const START_HOUR = 6;
        const SNAP_MINUTES = 15;

        const onPointerDown = (e) => {
            const grid = document.getElementById('cal-grid');
            if (!grid || !grid.contains(e.target)) return;
            const eventEl = e.target.closest('.cal-event[data-job-id]');
            if (!eventEl) return;

            const jobId = eventEl.getAttribute('data-job-id');
            dragJob = this.jobs.find(j => j.id === jobId);
            if (!dragJob) return;

            startX = e.clientX;
            startY = e.clientY;
            isDragging = false;
            originEl = eventEl;

            eventEl.setPointerCapture(e.pointerId);
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!dragJob) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (!isDragging && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;

            if (!isDragging) {
                isDragging = true;
                originEl.style.opacity = '0.3';
                originEl.classList.add('dragging');

                // Create ghost
                ghost = originEl.cloneNode(true);
                ghost.classList.add('drag-ghost');
                ghost.style.position = 'fixed';
                ghost.style.width = originEl.offsetWidth + 'px';
                ghost.style.height = originEl.offsetHeight + 'px';
                ghost.style.zIndex = '9999';
                ghost.style.pointerEvents = 'none';
                ghost.style.opacity = '0.85';
                ghost.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
                ghost.style.transform = 'scale(1.03)';
                document.body.appendChild(ghost);
            }

            if (ghost) {
                ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px';
                ghost.style.top = (e.clientY - 15) + 'px';
            }

            // Highlight target column
            const grid = document.getElementById('cal-grid');
            if (!grid) return;
            grid.querySelectorAll('.cal-day-column').forEach(col => col.classList.remove('drag-over'));
            const colEl = document.elementFromPoint(e.clientX, e.clientY);
            const targetCol = colEl ? colEl.closest('.cal-day-column') : null;
            if (targetCol && !targetCol.classList.contains('cal-non-working')) {
                targetCol.classList.add('drag-over');
            }
        };

        const onPointerUp = (e) => {
            if (!dragJob) return;

            if (ghost) {
                ghost.remove();
                ghost = null;
            }

            const grid = document.getElementById('cal-grid');
            if (grid) grid.querySelectorAll('.cal-day-column').forEach(col => col.classList.remove('drag-over'));

            if (isDragging) {
                // Find target column under cursor
                if (originEl) {
                    originEl.style.opacity = '';
                    originEl.classList.remove('dragging');
                }

                const elUnder = document.elementFromPoint(e.clientX, e.clientY);
                const targetCol = elUnder ? elUnder.closest('.cal-day-column') : null;

                if (targetCol) {
                    if (targetCol.classList.contains('cal-non-working')) {
                        this.toast('Cannot drop on a non-working day', 'error');
                    } else {
                        const newDate = targetCol.getAttribute('data-date');

                        // Calculate time from Y position
                        const colRect = targetCol.getBoundingClientRect();
                        const relativeY = e.clientY - colRect.top;
                        let totalMinutes = START_HOUR * 60 + (relativeY / SLOT_HEIGHT) * 60;

                        // Snap to 15-minute increments
                        totalMinutes = Math.round(totalMinutes / SNAP_MINUTES) * SNAP_MINUTES;
                        totalMinutes = Math.max(START_HOUR * 60, Math.min(totalMinutes, 21 * 60));

                        const newTime = this.minutesToTime(totalMinutes);

                        // Update the job
                        const job = this.jobs.find(j => j.id === dragJob.id);
                        if (job) {
                            job.date = newDate;
                            job.time = newTime;
                            this.saveData();
                            this.renderWeekCalendar();
                            this.toast(`Moved to ${this.formatDateShort(newDate)} at ${this.formatTime(newTime)}`, 'success');
                        }
                    }
                }
            }

            if (isDragging) {
                self._dragOccurred = true;
                setTimeout(() => { self._dragOccurred = false; }, 50);
            }

            dragJob = null;
            originEl = null;
            isDragging = false;
        };

        this._dragHandlers = { down: onPointerDown, move: onPointerMove, up: onPointerUp };
        calContainer.addEventListener('pointerdown', onPointerDown);
        calContainer.addEventListener('pointermove', onPointerMove);
        calContainer.addEventListener('pointerup', onPointerUp);
    },

    renderDayCalendar() {
        const dateStr = this.calendarDate.toISOString().split('T')[0];

        document.getElementById('cal-title').textContent = this.formatDate(dateStr);

        const header = document.getElementById('day-view-header');
        header.innerHTML = `<h2>${this.formatDate(dateStr)}</h2>`;

        const container = document.getElementById('day-schedule');
        const jobs = this.getJobsForDate(dateStr);
        const blocks = this.getBlocksForDate(dateStr);
        const workStart = this.timeToMinutes(this.settings.workStart);
        const workEnd = this.timeToMinutes(this.settings.workEnd);

        let html = '';

        // Generate 30-minute slots
        for (let mins = workStart; mins < workEnd; mins += 30) {
            const timeStr = this.minutesToTime(mins);
            const matchingJob = jobs.find(j => {
                const jStart = this.timeToMinutes(j.time);
                return mins >= jStart && mins < jStart + j.duration;
            });
            const matchingBlock = blocks.find(b => {
                const bStart = this.timeToMinutes(b.startTime);
                const bEnd = this.timeToMinutes(b.endTime);
                return mins >= bStart && mins < bEnd;
            });

            const isJobStart = matchingJob && this.timeToMinutes(matchingJob.time) === mins;
            const isBlockStart = matchingBlock && this.timeToMinutes(matchingBlock.startTime) === mins;
            const isLunch = this.settings.lunchEnabled &&
                            mins >= this.timeToMinutes(this.settings.lunchStart) &&
                            mins < this.timeToMinutes(this.settings.lunchStart) + this.settings.lunchDuration;
            const isLunchStart = isLunch && mins === this.timeToMinutes(this.settings.lunchStart);

            html += `<div class="day-slot">`;
            html += `<div class="day-slot-time">${mins % 60 === 0 ? this.formatTime(timeStr) : ''}</div>`;
            html += `<div class="day-slot-content">`;

            if (isJobStart && matchingJob) {
                html += `
                    <div class="day-slot-job" style="background:${this.getJobColor(matchingJob)}"
                         onclick="app.showJobModal('${matchingJob.id}')">
                        <h4>${this.getJobIcon(matchingJob)} ${this.getJobLabel(matchingJob)}</h4>
                        <p>${matchingJob.customerName || ''} - ${matchingJob.postcode} - ${matchingJob.duration} min</p>
                    </div>
                `;
            } else if (isBlockStart && matchingBlock) {
                const bDuration = this.timeToMinutes(matchingBlock.endTime) - this.timeToMinutes(matchingBlock.startTime);
                html += `
                    <div class="day-slot-job" style="background:${matchingBlock.color};opacity:0.7;cursor:pointer;"
                         onclick="app.openBlockModal('${matchingBlock.id}')">
                        <h4>🚫 ${matchingBlock.label}</h4>
                        <p>${this.formatTime(matchingBlock.startTime)} - ${this.formatTime(matchingBlock.endTime)} (${bDuration} min)</p>
                    </div>
                `;
            } else if (isLunchStart) {
                html += `
                    <div class="day-slot-lunch">
                        🍴 Lunch Break (${this.settings.lunchDuration} min)
                    </div>
                `;
            }

            html += `</div></div>`;
        }

        container.innerHTML = html;
    },

    // ---- Route Planner ----
    changeRouteDay(offset) {
        const dateInput = document.getElementById('route-date');
        const current = new Date(dateInput.value + 'T00:00:00');
        current.setDate(current.getDate() + offset);
        const newDate = current.toISOString().split('T')[0];
        dateInput.value = newDate;
        this.renderRoute(newDate);
    },

    renderRoute(dateStr) {
        const container = document.getElementById('route-list');
        const jobs = this.getJobsForDate(dateStr);

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🗺️</span>
                    <p>No jobs scheduled for ${this.formatDateShort(dateStr)}</p>
                </div>
            `;
            this.updateRouteSummary([], dateStr);
            this.renderRouteMap([]);
            return;
        }

        let html = '';

        // Start from home/base
        if (this.settings.homePostcode) {
            const homeInfo = this.getPostcodeInfo(this.settings.homePostcode);
            html += `
                <div class="route-item">
                    <div class="route-number home">🏠</div>
                    <div class="route-info">
                        <h4>Base / Home</h4>
                        <p>${this.settings.homePostcode} ${homeInfo ? '- ' + homeInfo.name : ''}</p>
                    </div>
                </div>
            `;
        }

        let prevPostcode = this.settings.homePostcode;

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const travelMins = prevPostcode ? this.estimateTravelMinutes(prevPostcode, job.postcode) : this.settings.defaultTravel;

            // Travel connector
            html += `
                <div class="route-connector">
                    <span class="route-connector-text">🚗 ~${travelMins} min drive</span>
                </div>
            `;

            // Check if lunch falls before this job
            if (this.settings.lunchEnabled) {
                const lunchStart = this.timeToMinutes(this.settings.lunchStart);
                const jobStart = this.timeToMinutes(job.time);
                const prevEnd = i > 0 ? this.timeToMinutes(jobs[i-1].time) + jobs[i-1].duration : this.timeToMinutes(this.settings.workStart);

                if (lunchStart >= prevEnd && lunchStart < jobStart) {
                    html += `
                        <div class="route-lunch">
                            🍴 Lunch Break (${this.formatTime(this.settings.lunchStart)} - ${this.formatTime(this.minutesToTime(lunchStart + this.settings.lunchDuration))})
                        </div>
                        <div class="route-connector">
                            <span class="route-connector-text">...</span>
                        </div>
                    `;
                }
            }

            html += `
                <div class="route-item" onclick="app.showJobModal('${job.id}')" style="cursor:pointer;">
                    <div class="route-number">${i + 1}</div>
                    <div class="route-info">
                        <h4>${this.getJobIcon(job)} ${this.getJobLabel(job)} ${job.status === 'completed' ? '✅' : ''}</h4>
                        <p>${this.formatTime(job.time)} - ${job.duration} min - ${job.postcode}</p>
                        <p>${job.customerName || ''} ${job.address ? '- ' + job.address : ''}</p>
                    </div>
                </div>
            `;

            prevPostcode = job.postcode;
        }

        // Return home
        if (this.settings.homePostcode && prevPostcode) {
            const returnTravel = this.estimateTravelMinutes(prevPostcode, this.settings.homePostcode);
            html += `
                <div class="route-connector">
                    <span class="route-connector-text">🚗 ~${returnTravel} min return</span>
                </div>
                <div class="route-item">
                    <div class="route-number home">🏠</div>
                    <div class="route-info">
                        <h4>Return to Base</h4>
                        <p>${this.settings.homePostcode}</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        this.updateRouteSummary(jobs, dateStr);
        this.renderRouteMap(jobs);
    },

    async renderRouteMap(jobs) {
        const mapContainer = document.getElementById('route-map-container');

        // Destroy previous map
        if (this._routeMap) {
            this._routeMap.remove();
            this._routeMap = null;
        }

        if (!jobs.length || typeof mapboxgl === 'undefined') {
            if (mapContainer) mapContainer.style.display = 'none';
            return;
        }

        // Geocode all postcodes first
        const postcodes = [this.settings.homePostcode, ...jobs.map(j => j.postcode)].filter(Boolean);
        await Promise.allSettled(postcodes.map(pc => geocodePostcode(pc)));

        mapContainer.style.display = 'block';
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: 'route-map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-0.12, 51.51],
            zoom: 10
        });
        this._routeMap = map;

        const coords = [];
        const bounds = new mapboxgl.LngLatBounds();

        // Home marker
        const homeInfo = this.getPostcodeInfo(this.settings.homePostcode);
        if (homeInfo) {
            const homeCoord = [homeInfo.lng, homeInfo.lat];
            coords.push(homeCoord);
            bounds.extend(homeCoord);

            const homeEl = document.createElement('div');
            homeEl.className = 'route-marker home-marker';
            homeEl.innerHTML = '🏠';
            new mapboxgl.Marker({ element: homeEl }).setLngLat(homeCoord)
                .setPopup(new mapboxgl.Popup({ offset: 15 }).setText('Base / Home'))
                .addTo(map);
        }

        // Job markers
        jobs.forEach((job, i) => {
            const info = this.getPostcodeInfo(job.postcode);
            if (!info) return;

            const coord = [info.lng, info.lat];
            coords.push(coord);
            bounds.extend(coord);

            const color = this.getJobColor(job);
            const el = document.createElement('div');
            el.className = 'route-marker';
            el.style.background = color;
            el.textContent = i + 1;

            new mapboxgl.Marker({ element: el }).setLngLat(coord)
                .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(
                    `<strong>${i + 1}. ${this.getJobLabel(job)}</strong><br>${job.postcode} - ${this.formatTime(job.time)}`
                ))
                .addTo(map);
        });

        // Return to home
        if (homeInfo) {
            coords.push([homeInfo.lng, homeInfo.lat]);
        }

        // Draw route line once map loads
        map.on('load', () => {
            if (coords.length >= 2) {
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: coords }
                    }
                });
                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 3,
                        'line-dasharray': [2, 2]
                    }
                });
            }
            map.fitBounds(bounds, { padding: 50, maxZoom: 13 });
        });
    },

    updateRouteSummary(jobs, dateStr) {
        let totalTravel = 0;
        let totalWork = 0;
        let prevPostcode = this.settings.homePostcode;

        for (const job of jobs) {
            if (prevPostcode) {
                totalTravel += this.estimateTravelMinutes(prevPostcode, job.postcode);
            }
            totalWork += job.duration;
            prevPostcode = job.postcode;
        }

        // Return trip
        if (this.settings.homePostcode && prevPostcode && jobs.length > 0) {
            totalTravel += this.estimateTravelMinutes(prevPostcode, this.settings.homePostcode);
        }

        document.getElementById('route-total-jobs').textContent = jobs.length;
        document.getElementById('route-travel-time').textContent = totalTravel > 0 ? `~${totalTravel} min` : '0 min';
        document.getElementById('route-work-time').textContent = `${Math.round(totalWork / 60 * 10) / 10}h`;

        if (jobs.length > 0) {
            document.getElementById('route-start-time').textContent = this.formatTime(jobs[0].time);
            const lastJob = jobs[jobs.length - 1];
            const endMins = this.timeToMinutes(lastJob.time) + lastJob.duration;
            document.getElementById('route-end-time').textContent = this.formatTime(this.minutesToTime(endMins));
        } else {
            document.getElementById('route-start-time').textContent = '--:--';
            document.getElementById('route-end-time').textContent = '--:--';
        }
    },

    optimizeRoute(dateStr) {
        const jobs = this.getJobsForDate(dateStr);
        if (jobs.length < 2) {
            this.toast('Need at least 2 jobs to optimize', 'info');
            return;
        }

        // Simple nearest-neighbor optimization
        const startPostcode = this.settings.homePostcode || jobs[0].postcode;
        const unvisited = [...jobs];
        const ordered = [];
        let currentPostcode = startPostcode;

        while (unvisited.length > 0) {
            let nearest = 0;
            let nearestDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const travel = this.estimateTravelMinutes(currentPostcode, unvisited[i].postcode);
                if (travel < nearestDist) {
                    nearestDist = travel;
                    nearest = i;
                }
            }

            ordered.push(unvisited[nearest]);
            currentPostcode = unvisited[nearest].postcode;
            unvisited.splice(nearest, 1);
        }

        // Reassign times based on optimized order
        const workStart = this.timeToMinutes(this.settings.workStart);
        let cursor = workStart;
        let prevPC = this.settings.homePostcode;

        for (const job of ordered) {
            // Add travel time
            if (prevPC) {
                cursor += this.estimateTravelMinutes(prevPC, job.postcode);
            }

            // Skip lunch if it falls here
            if (this.settings.lunchEnabled) {
                const lunchStart = this.timeToMinutes(this.settings.lunchStart);
                const lunchEnd = lunchStart + this.settings.lunchDuration;
                if (cursor >= lunchStart && cursor < lunchEnd) {
                    cursor = lunchEnd;
                } else if (cursor + job.duration > lunchStart && cursor < lunchStart) {
                    cursor = lunchEnd;
                }
            }

            // Skip time blocks
            const blocks = this.getBlocksForDate(dateStr);
            for (const block of blocks) {
                const bStart = this.timeToMinutes(block.startTime);
                const bEnd = this.timeToMinutes(block.endTime);
                if (cursor >= bStart && cursor < bEnd) {
                    cursor = bEnd;
                } else if (cursor + job.duration > bStart && cursor < bStart) {
                    cursor = bEnd;
                }
            }

            // Update job time
            const originalJob = this.jobs.find(j => j.id === job.id);
            if (originalJob) {
                originalJob.time = this.minutesToTime(cursor);
            }

            cursor += job.duration + this.settings.bufferTime;
            prevPC = job.postcode;
        }

        this.saveData();
        this.renderRoute(dateStr);
        this.toast('Route optimized! Times updated.', 'success');
    },

    // ---- Job Modal ----
    showJobModal(jobId) {
        if (this._dragOccurred) return;
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = document.getElementById('job-modal');
        const body = document.getElementById('modal-body');

        document.getElementById('modal-title').textContent = `${this.getJobIcon(job)} ${this.getJobLabel(job)}`;

        const statusBadge = job.status === 'completed'
            ? '<span class="status-badge status-completed">Completed</span>'
            : job.status === 'cancelled'
            ? '<span class="status-badge status-cancelled">Cancelled</span>'
            : `<span class="status-badge status-scheduled">${job.priority === 'emergency' ? 'Emergency' : job.priority === 'urgent' ? 'Urgent' : 'Scheduled'}</span>`;

        body.innerHTML = `
            <div style="margin-bottom:12px;">${statusBadge}</div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">When</span>
                <span class="modal-detail-value">${this.getFriendlyDateTime(job.date, job.time)}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Duration</span>
                <span class="modal-detail-value">${job.duration} minutes</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Customer</span>
                <span class="modal-detail-value">${job.customerName || '-'}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Phone</span>
                <span class="modal-detail-value">${job.customerPhone ? `<a href="tel:${job.customerPhone}">${job.customerPhone}</a>` : '-'}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Location</span>
                <span class="modal-detail-value">
                    ${job.postcode}${job.address ? ' - ' + job.address : ''}
                    <a href="${getNavigationUrl(job)}" class="navigate-link" target="_blank" rel="noopener noreferrer">Navigate →</a>
                </span>
            </div>
            ${job.vehicleReg ? `<div class="modal-detail-row">
                <span class="modal-detail-label">Vehicle Reg</span>
                <span class="modal-detail-value">${job.vehicleReg}</span>
            </div>` : ''}
            ${job.priceQuoted ? (() => {
                const net = parseFloat(job.priceQuoted);
                if (job.vatApplied && job.vatRate) {
                    const vat = net * (job.vatRate / 100);
                    const total = net + vat;
                    return `<div class="modal-detail-row">
                        <span class="modal-detail-label">Net Price</span>
                        <span class="modal-detail-value">£${net.toFixed(2)}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">VAT (${job.vatRate}%)</span>
                        <span class="modal-detail-value">£${vat.toFixed(2)}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Total</span>
                        <span class="modal-detail-value"><strong>£${total.toFixed(2)}</strong></span>
                    </div>`;
                }
                return `<div class="modal-detail-row">
                    <span class="modal-detail-label">Price Quoted</span>
                    <span class="modal-detail-value"><strong>£${net.toFixed(2)}</strong></span>
                </div>`;
            })() : ''}
            ${job.notes ? `<div class="modal-notes"><strong>Notes:</strong> ${job.notes}</div>` : ''}
        `;

        // Wire up buttons
        document.getElementById('modal-delete').onclick = () => {
            if (confirm('Delete this job?')) this.deleteJob(job.id);
        };
        document.getElementById('modal-edit').onclick = () => this.editJob(job.id);
        document.getElementById('modal-done').onclick = () => this.completeJob(job.id);

        // Hide "Mark Complete" if already completed
        document.getElementById('modal-done').style.display = job.status === 'completed' ? 'none' : '';

        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('job-modal').classList.remove('active');
    },

    // ---- Settings ----
    renderSettings() {
        const s = this.settings;

        document.getElementById('work-start').value = s.workStart;
        document.getElementById('work-end').value = s.workEnd;
        document.getElementById('lunch-enabled').checked = s.lunchEnabled;
        document.getElementById('lunch-start').value = s.lunchStart;
        document.getElementById('lunch-duration').value = s.lunchDuration;
        document.getElementById('lunch-settings').style.display = s.lunchEnabled ? 'block' : 'none';
        document.getElementById('home-postcode').value = s.homePostcode;
        document.getElementById('default-travel').value = s.defaultTravel;
        document.getElementById('buffer-time').value = s.bufferTime;
        document.getElementById('vat-registered').checked = s.vatRegistered;
        document.getElementById('vat-rate').value = s.vatRate;
        document.getElementById('vat-settings').style.display = s.vatRegistered ? 'block' : 'none';

        // Working days
        document.querySelectorAll('#working-days input').forEach(cb => {
            cb.checked = s.workingDays.includes(parseInt(cb.dataset.day));
        });

        // Job duration settings
        const durContainer = document.getElementById('duration-settings');
        durContainer.innerHTML = Object.entries(JOB_TYPES).map(([key, type]) => {
            const currentDuration = s.jobDurations[key] || type.defaultDuration;
            const currentLabel = s.jobLabels[key] || type.label;
            return `
                <div class="duration-item">
                    <span class="duration-icon">${type.icon}</span>
                    <input type="text" class="job-label-input" data-job-label="${key}" value="${currentLabel}" placeholder="${type.label}">
                    <select data-job-type="${key}">
                        <option value="15" ${currentDuration === 15 ? 'selected' : ''}>15 min</option>
                        <option value="30" ${currentDuration === 30 ? 'selected' : ''}>30 min</option>
                        <option value="45" ${currentDuration === 45 ? 'selected' : ''}>45 min</option>
                        <option value="60" ${currentDuration === 60 ? 'selected' : ''}>1 hr</option>
                        <option value="90" ${currentDuration === 90 ? 'selected' : ''}>1.5 hr</option>
                        <option value="120" ${currentDuration === 120 ? 'selected' : ''}>2 hr</option>
                        <option value="180" ${currentDuration === 180 ? 'selected' : ''}>3 hr</option>
                        <option value="240" ${currentDuration === 240 ? 'selected' : ''}>4 hr</option>
                    </select>
                </div>
            `;
        }).join('');
    },

    saveSettings() {
        this.settings.workStart = document.getElementById('work-start').value;
        this.settings.workEnd = document.getElementById('work-end').value;
        this.settings.lunchEnabled = document.getElementById('lunch-enabled').checked;
        this.settings.lunchStart = document.getElementById('lunch-start').value;
        this.settings.lunchDuration = parseInt(document.getElementById('lunch-duration').value);
        this.settings.homePostcode = document.getElementById('home-postcode').value.trim().toUpperCase();
        this.settings.defaultTravel = parseInt(document.getElementById('default-travel').value);
        this.settings.bufferTime = parseInt(document.getElementById('buffer-time').value);
        this.settings.vatRegistered = document.getElementById('vat-registered').checked;
        this.settings.vatRate = parseFloat(document.getElementById('vat-rate').value) || 20;

        // Working days
        this.settings.workingDays = [];
        document.querySelectorAll('#working-days input:checked').forEach(cb => {
            this.settings.workingDays.push(parseInt(cb.dataset.day));
        });

        // Job durations and labels
        this.settings.jobDurations = {};
        document.querySelectorAll('#duration-settings select').forEach(sel => {
            this.settings.jobDurations[sel.dataset.jobType] = parseInt(sel.value);
        });
        this.settings.jobLabels = {};
        document.querySelectorAll('#duration-settings .job-label-input').forEach(inp => {
            const key = inp.dataset.jobLabel;
            const defaultLabel = JOB_TYPES[key]?.label || '';
            if (inp.value.trim() && inp.value.trim() !== defaultLabel) {
                this.settings.jobLabels[key] = inp.value.trim();
            }
        });

        this.saveData();
        this.populateJobTypeDropdown();
        this.toast('Settings saved!', 'success');
    },

    logout() {
        if (typeof auth !== 'undefined') auth.signOut();
        this.jobs = [];
        this.timeBlocks = [];
        this.jotterNotes = [];
        // Clear localStorage so data doesn't bleed into another user's account
        localStorage.removeItem('lockroute_jobs');
        localStorage.removeItem('lockroute_settings');
        localStorage.removeItem('lockroute_blocks');
        localStorage.removeItem('lockroute_jotter');
    },

    clearAllJobs() {
        if (!confirm('Are you sure you want to delete ALL jobs? This cannot be undone.')) return;

        // Clear Supabase data
        if (typeof cloudDB !== 'undefined' && supabaseReady) {
            cloudDB.clearAll();
        }

        // Clear local
        this.jobs = [];
        this.timeBlocks = [];
        this.jotterNotes = [];
        localStorage.removeItem('lockroute_jobs');
        localStorage.removeItem('lockroute_blocks');
        localStorage.removeItem('lockroute_jotter');
        this.saveData();
        this.updateQuickStats();
        this.renderDashboard();
        this.toast('All jobs deleted', 'info');
    },

    // ---- Time Blocks ----
    openBlockModal(blockId) {
        const modal = document.getElementById('block-modal');
        const isEdit = !!blockId;
        const block = isEdit ? this.timeBlocks.find(b => b.id === blockId) : null;

        document.getElementById('block-modal-title').textContent = isEdit ? 'Edit Block' : 'Block Time';
        document.getElementById('block-id').value = isEdit ? block.id : '';
        document.getElementById('block-label').value = isEdit ? block.label : '';
        document.getElementById('block-date').value = isEdit ? block.date : this.calendarDate.toISOString().split('T')[0];
        document.getElementById('block-start').value = isEdit ? block.startTime : '09:00';
        document.getElementById('block-end').value = isEdit ? block.endTime : '10:00';
        document.getElementById('block-repeat').value = isEdit ? (block.repeat || 'none') : 'none';

        // Set color
        const color = isEdit ? block.color : '#6b7280';
        document.querySelectorAll('#block-color-picker input').forEach(radio => {
            radio.checked = radio.value === color;
            radio.nextElementSibling.style.borderColor = radio.value === color ? '#fff' : 'transparent';
        });

        document.getElementById('block-delete').style.display = isEdit ? '' : 'none';
        modal.classList.add('active');
    },

    closeBlockModal() {
        document.getElementById('block-modal').classList.remove('active');
    },

    saveTimeBlock() {
        const id = document.getElementById('block-id').value || 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const isEdit = !!document.getElementById('block-id').value;

        const block = {
            id,
            label: document.getElementById('block-label').value.trim() || 'Blocked',
            date: document.getElementById('block-date').value,
            startTime: document.getElementById('block-start').value,
            endTime: document.getElementById('block-end').value,
            repeat: document.getElementById('block-repeat').value,
            color: document.querySelector('#block-color-picker input:checked').value,
        };

        if (block.startTime >= block.endTime) {
            this.toast('End time must be after start time', 'error');
            return;
        }

        if (isEdit) {
            const idx = this.timeBlocks.findIndex(b => b.id === id);
            if (idx !== -1) this.timeBlocks[idx] = block;
        } else {
            this.timeBlocks.push(block);
        }

        this.saveData();
        this.closeBlockModal();
        this.renderCalendar();
        this.toast(`Time block ${isEdit ? 'updated' : 'added'}`, 'success');
    },

    deleteTimeBlock() {
        const id = document.getElementById('block-id').value;
        if (!id) return;
        this.timeBlocks = this.timeBlocks.filter(b => b.id !== id);
        this.saveData();
        this.closeBlockModal();
        this.renderCalendar();
        this.toast('Time block removed', 'info');
    },

    getBlocksForDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = d.getDay();

        return this.timeBlocks.filter(block => {
            // Exact date match
            if (block.date === dateStr) return true;

            // Repeating blocks
            if (block.repeat === 'daily') return true;
            if (block.repeat === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
            if (block.repeat === 'weekly') {
                const blockDate = new Date(block.date + 'T00:00:00');
                return blockDate.getDay() === dayOfWeek;
            }

            return false;
        });
    },

    // ---- VAT ----
    updateVatBreakdown() {
        const breakdown = document.getElementById('vat-breakdown');
        if (!this.settings.vatRegistered) {
            breakdown.style.display = 'none';
            return;
        }
        const netPrice = parseFloat(document.getElementById('job-price').value) || 0;
        if (netPrice <= 0) {
            breakdown.style.display = 'none';
            return;
        }
        const vatAmount = netPrice * (this.settings.vatRate / 100);
        const total = netPrice + vatAmount;
        document.getElementById('vat-breakdown-text').textContent =
            `+ VAT £${vatAmount.toFixed(2)} = £${total.toFixed(2)} total`;
        breakdown.style.display = 'block';
    },

    // ---- Quick Stats ----
    updateQuickStats() {
        const today = this.todayStr();
        const weekDates = this.getWeekDates(new Date());

        const todayJobs = this.jobs.filter(j => j.date === today && j.status !== 'cancelled').length;
        const weekJobs = this.jobs.filter(j => weekDates.includes(j.date) && j.status !== 'cancelled').length;

        document.getElementById('today-jobs-count').textContent = todayJobs;
        document.getElementById('week-jobs-count').textContent = weekJobs;
    },

    // ---- Jotter ----
    addJotterNote() {
        const input = document.getElementById('jotter-input');
        const text = input.value.trim();
        if (!text) {
            this.toast('Write something first', 'error');
            return;
        }

        const note = {
            id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            text,
            createdAt: new Date().toISOString(),
        };

        this.jotterNotes.unshift(note);
        this.persistJotter();
        input.value = '';
        this.renderJotter();
        this.toast('Note added', 'success');
    },

    deleteJotterNote(id) {
        this.jotterNotes = this.jotterNotes.filter(n => n.id !== id);
        this.persistJotter();
        this.renderJotter();
        this.toast('Note deleted', 'info');
    },

    persistJotter() {
        localStorage.setItem('lockroute_jotter', JSON.stringify(this.jotterNotes));
        if (typeof cloudDB !== 'undefined' && supabaseReady && typeof cloudDB.saveJotter === 'function') {
            cloudDB.saveJotter(this.jotterNotes);
        }
    },

    renderJotter() {
        const container = document.getElementById('jotter-list');

        if (this.jotterNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No notes yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.jotterNotes.map(note => {
            const date = new Date(note.createdAt);
            const timeStr = date.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const escapedText = note.text.replace(/</g, '&lt;').replace(/\n/g, '<br>');
            return `
                <div class="card jotter-note">
                    <div class="jotter-note-header">
                        <span class="jotter-note-time">${timeStr}</span>
                        <button class="btn-icon jotter-delete" onclick="app.deleteJotterNote('${note.id}')" title="Delete note">&times;</button>
                    </div>
                    <div class="jotter-note-text">${escapedText}</div>
                </div>
            `;
        }).join('');
    },

    // ---- Current Time Updater ----
    startTimeUpdater() {
        setInterval(() => {
            if (this.currentView === 'calendar') {
                this.renderCalendar();
            }
        }, 60000); // Update every minute
    },

    // ---- Vehicle Reg Lookup ----
    async lookupVehicleReg() {
        const reg = document.getElementById('job-reg').value.trim().replace(/\s+/g, '').toUpperCase();
        if (!reg) {
            this.toast('Enter a registration number first', 'error');
            return;
        }

        // Format reg with space for display (e.g. AB12CDE -> AB12 CDE)
        const displayReg = reg.length >= 5 ? reg.slice(0, -3) + ' ' + reg.slice(-3) : reg;

        const vInfo = document.getElementById('vehicle-info');
        const btn = document.getElementById('lookup-reg-btn');

        vInfo.innerHTML = `Looking up <strong>${displayReg}</strong>…`;
        vInfo.style.display = 'block';
        if (btn) btn.disabled = true;

        try {
            const { data, error } = await supabaseClient.functions.invoke('vehicle-lookup', {
                body: { registration: reg }
            });

            if (error) throw error;
            if (data && data.error) throw new Error(data.error);

            const vehicleInfo = {
                registrationNumber: data.registration || reg,
                make: data.make,
                colour: data.colour,
                yearOfManufacture: data.yearOfManufacture,
                fuelType: data.fuelType,
                motStatus: data.motStatus,
                taxStatus: data.taxStatus,
            };

            this._lastVehicleInfo = vehicleInfo;

            const motUrl = `https://www.check-mot.service.gov.uk/results?registration=${encodeURIComponent(displayReg)}`;
            vInfo.innerHTML = this.formatVehicleInfo(vehicleInfo) +
                `<div class="vehicle-links"><a href="${motUrl}" target="_blank" rel="noopener">MOT history ↗</a></div>`;

            this.toast('Vehicle found', 'success');
        } catch (err) {
            this._lastVehicleInfo = { registrationNumber: reg };
            const motUrl = `https://www.check-mot.service.gov.uk/results?registration=${encodeURIComponent(displayReg)}`;
            const dvlaUrl = `https://vehicleenquiry.service.gov.uk/?v=${encodeURIComponent(displayReg)}`;
            vInfo.innerHTML = `<div class="vehicle-card-header"><span class="vehicle-reg-plate">${displayReg}</span></div><div class="vehicle-links"><a href="${motUrl}" target="_blank" rel="noopener">MOT history ↗</a><a href="${dvlaUrl}" target="_blank" rel="noopener">DVLA check ↗</a></div>`;
            this.toast(err.message || 'Lookup failed', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    },

    formatVehicleInfo(info) {
        if (!info) return '';
        const reg = info.registrationNumber || '';
        const makeText = [info.make, info.colour, info.yearOfManufacture ? `(${info.yearOfManufacture})` : ''].filter(Boolean).join(' ');

        let html = `<div class="vehicle-card-header">`;
        html += `<span class="vehicle-reg-plate">${reg}</span>`;
        if (makeText) html += `<span class="vehicle-make">${makeText}</span>`;
        html += `</div>`;

        const details = [];
        if (info.yearOfManufacture) details.push({ label: 'Year', value: info.yearOfManufacture });
        if (info.fuelType) details.push({ label: 'Fuel', value: info.fuelType });
        if (info.motStatus) {
            const isValid = info.motStatus.toLowerCase() === 'valid';
            details.push({ label: 'MOT', value: info.motStatus, cls: isValid ? 'mot-valid' : 'mot-expired' });
        }
        if (info.taxStatus) {
            const isValid = info.taxStatus.toLowerCase() === 'taxed';
            details.push({ label: 'Tax', value: info.taxStatus, cls: isValid ? 'tax-valid' : 'tax-expired' });
        }
        if (info.colour) details.push({ label: 'Colour', value: info.colour });

        if (details.length) {
            html += `<div class="vehicle-details-grid">`;
            for (const d of details) {
                html += `<div class="vehicle-detail-chip"><span class="vd-label">${d.label}</span><span class="vd-value${d.cls ? ' ' + d.cls : ''}">${d.value}</span></div>`;
            }
            html += `</div>`;
        }

        if (info.note) html += `<div style="margin-top:8px;font-size:12px;color:var(--text-light);">${info.note}</div>`;
        return html;
    },

    // ---- Toast Notifications ----
    _lastToast: '',
    _lastToastTime: 0,
    toast(message, type = 'info') {
        const now = Date.now();
        if (message === this._lastToast && now - this._lastToastTime < 2000) return;
        this._lastToast = message;
        this._lastToastTime = now;

        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
};

// ---- Initialize ----
// Init is now called by supabase-config.js after auth succeeds
