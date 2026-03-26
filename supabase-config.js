/* ============================
   Supabase Configuration
   ============================ */

const SUPABASE_URL = 'https://klnerdcxmhrqqrwrleez.supabase.co';
const SUPABASE_ANON_KEY = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbmVyZGN4bWhycXFyd3JsZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzE1MTEsImV4cCI6MjA2MjEwNzUxMX0', 'q0LnY6FdQZm3SmmbFW0Lsz7oZabv4AINEwlWhuTML5A'].join('.');

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let supabaseReady = false;
let currentUserId = null;

// ---- Auth helpers ----
const auth = {
    async signUp(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session;
    },

    onAuthStateChange(callback) {
        supabaseClient.auth.onAuthStateChange(callback);
    }
};

// ---- Data Layer (same interface as old cloudDB) ----
// Maps camelCase (app.js) <-> snake_case (Supabase/Postgres) at the boundary

function jobToRow(job) {
    return {
        id: job.id,
        user_id: currentUserId,
        customer_name: job.customerName || null,
        customer_phone: job.customerPhone || null,
        postcode: job.postcode,
        address: job.address,
        type: job.type,
        duration: job.duration,
        notes: job.notes,
        vehicle_reg: job.vehicleReg,
        vehicle_info: job.vehicleInfo || null,
        price_quoted: job.priceQuoted || 0,
        vat_applied: job.vatApplied || false,
        vat_rate: job.vatRate || 0,
        date: job.date,
        time: job.time,
        priority: job.priority || 'normal',
        status: job.status || 'scheduled',
        customer_id: job.customerId || null,
        created_at: job.createdAt,
        updated_at: new Date().toISOString(),
    };
}

function rowToJob(row) {
    return {
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        postcode: row.postcode,
        address: row.address,
        type: row.type,
        duration: row.duration,
        notes: row.notes,
        vehicleReg: row.vehicle_reg,
        vehicleInfo: row.vehicle_info,
        priceQuoted: row.price_quoted,
        vatApplied: row.vat_applied,
        vatRate: row.vat_rate,
        date: row.date,
        time: row.time,
        priority: row.priority,
        status: row.status,
        customerId: row.customer_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

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

const cloudDB = {
    async loadJobs() {
        if (!supabaseReady) return null;
        try {
            const { data, error } = await supabaseClient
                .from('jobs')
                .select('*')
                .order('date', { ascending: true });
            if (error) throw error;
            return data.map(rowToJob);
        } catch (e) {
            console.error('Error loading jobs from Supabase:', e);
            return null;
        }
    },

    async loadSettings() {
        if (!supabaseReady) return null;
        try {
            const { data, error } = await supabaseClient
                .from('settings')
                .select('*')
                .eq('user_id', currentUserId)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            if (!data) return null;
            return {
                workStart: data.work_start,
                workEnd: data.work_end,
                workingDays: data.working_days,
                lunchEnabled: data.lunch_enabled,
                lunchStart: data.lunch_start,
                lunchDuration: data.lunch_duration,
                homePostcode: data.home_postcode,
                defaultTravel: data.default_travel,
                bufferTime: data.buffer_time,
                vatRegistered: data.vat_registered,
                vatRate: data.vat_rate,
                jobDurations: data.job_durations || {},
                jobLabels: data.job_labels || {},
            };
        } catch (e) {
            console.error('Error loading settings from Supabase:', e);
            return null;
        }
    },

    async saveJob(job) {
        if (!supabaseReady) return;
        try {
            const { error } = await supabaseClient.from('jobs').upsert(jobToRow(job));
            if (error) throw error;
        } catch (e) {
            console.error('Error saving job to Supabase:', e);
        }
    },

    async deleteJob(id) {
        if (!supabaseReady) return;
        try {
            const { error } = await supabaseClient.from('jobs').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error('Error deleting job from Supabase:', e);
        }
    },

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

    async saveSettings(settings) {
        if (!supabaseReady) return;
        try {
            const { error } = await supabaseClient.from('settings').upsert({
                user_id: currentUserId,
                work_start: settings.workStart,
                work_end: settings.workEnd,
                working_days: settings.workingDays,
                lunch_enabled: settings.lunchEnabled,
                lunch_start: settings.lunchStart,
                lunch_duration: settings.lunchDuration,
                home_postcode: settings.homePostcode,
                default_travel: settings.defaultTravel,
                buffer_time: settings.bufferTime,
                vat_registered: settings.vatRegistered,
                vat_rate: settings.vatRate,
                job_durations: settings.jobDurations,
                job_labels: settings.jobLabels,
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
        } catch (e) {
            console.error('Error saving settings to Supabase:', e);
        }
    },

    async saveAllJobs(jobs) {
        if (!supabaseReady) return;
        try {
            const rows = jobs.map(jobToRow);
            const { error } = await supabaseClient.from('jobs').upsert(rows);
            if (error) throw error;
        } catch (e) {
            console.error('Error batch saving jobs to Supabase:', e);
        }
    },

    async saveJotter(notes) {
        if (!supabaseReady) return;
        try {
            await supabaseClient.from('jotter_notes').delete().eq('user_id', currentUserId);
            if (notes.length > 0) {
                const rows = notes.map(n => ({
                    id: n.id,
                    user_id: currentUserId,
                    text: n.text,
                    created_at: n.createdAt,
                }));
                const { error } = await supabaseClient.from('jotter_notes').insert(rows);
                if (error) throw error;
            }
        } catch (e) {
            console.error('Error saving jotter to Supabase:', e);
        }
    },

    async loadJotter() {
        if (!supabaseReady) return null;
        try {
            const { data, error } = await supabaseClient
                .from('jotter_notes')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(row => ({
                id: row.id,
                text: row.text,
                createdAt: row.created_at,
            }));
        } catch (e) {
            console.error('Error loading jotter from Supabase:', e);
            return null;
        }
    },

    async saveAllBlocks(blocks) {
        if (!supabaseReady) return;
        try {
            await supabaseClient.from('time_blocks').delete().eq('user_id', currentUserId);
            if (blocks.length > 0) {
                const rows = blocks.map(b => ({
                    id: b.id,
                    user_id: currentUserId,
                    label: b.label,
                    date: b.date,
                    start_time: b.startTime,
                    end_time: b.endTime,
                    repeat: b.repeat || 'none',
                    color: b.color || '#6b7280',
                }));
                const { error } = await supabaseClient.from('time_blocks').insert(rows);
                if (error) throw error;
            }
        } catch (e) {
            console.error('Error saving time blocks to Supabase:', e);
        }
    },

    async loadBlocks() {
        if (!supabaseReady) return null;
        try {
            const { data, error } = await supabaseClient
                .from('time_blocks')
                .select('*');
            if (error) throw error;
            return data.map(row => ({
                id: row.id,
                label: row.label,
                date: row.date,
                startTime: row.start_time,
                endTime: row.end_time,
                repeat: row.repeat,
                color: row.color,
            }));
        } catch (e) {
            console.error('Error loading time blocks from Supabase:', e);
            return null;
        }
    },

    async migrateFromLocalStorage(jobs, settings, blocks, jotterNotes) {
        if (!supabaseReady) return;
        try {
            const { data: existing } = await supabaseClient
                .from('jobs')
                .select('id')
                .limit(1);
            if (existing && existing.length > 0) return;

            console.log('Migrating localStorage data to Supabase...');
            if (jobs.length > 0) await this.saveAllJobs(jobs);
            if (settings) await this.saveSettings(settings);
            if (blocks && blocks.length > 0) await this.saveAllBlocks(blocks);
            if (jotterNotes && jotterNotes.length > 0) await this.saveJotter(jotterNotes);
            console.log(`Migrated ${jobs.length} jobs to Supabase`);
        } catch (e) {
            console.error('Migration failed:', e);
        }
    },

    async clearAll() {
        if (!supabaseReady) return;
        try {
            await Promise.all([
                supabaseClient.from('jobs').delete().eq('user_id', currentUserId),
                supabaseClient.from('time_blocks').delete().eq('user_id', currentUserId),
                supabaseClient.from('jotter_notes').delete().eq('user_id', currentUserId),
            ]);
        } catch (e) {
            console.error('Error clearing Supabase data:', e);
        }
    }
};

// ---- Auth UI Controller ----
function initAuthUI() {
    const authScreen = document.getElementById('auth-screen');
    const appEl = document.getElementById('app');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authError = document.getElementById('auth-error');

    function showAuth() {
        authScreen.style.display = 'flex';
        appEl.style.display = 'none';
    }

    function hideAuth() {
        authScreen.style.display = 'none';
        appEl.style.display = '';
    }

    // Toggle between login and signup
    document.addEventListener('click', (e) => {
        if (e.target.id === 'auth-toggle-link') {
            e.preventDefault();
            const isLoginVisible = loginForm.style.display !== 'none';
            loginForm.style.display = isLoginVisible ? 'none' : 'block';
            signupForm.style.display = isLoginVisible ? 'block' : 'none';
            document.getElementById('auth-toggle').innerHTML = isLoginVisible
                ? 'Already have an account? <a href="#" id="auth-toggle-link">Log in</a>'
                : 'Don\'t have an account? <a href="#" id="auth-toggle-link">Sign up</a>';
            authError.textContent = '';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Logging in...';
        try {
            await auth.signIn(
                document.getElementById('login-email').value,
                document.getElementById('login-password').value
            );
        } catch (err) {
            authError.textContent = err.message;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Log In';
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        if (password !== confirm) {
            authError.textContent = 'Passwords do not match';
            return;
        }
        if (password.length < 6) {
            authError.textContent = 'Password must be at least 6 characters';
            return;
        }
        const btn = signupForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creating account...';
        try {
            const data = await auth.signUp(
                document.getElementById('signup-email').value,
                password
            );
            if (data.user && !data.session) {
                // Supabase returns a user without session if email already exists (to prevent enumeration)
                // Check for fake/empty identities as a signal
                if (!data.user.identities || data.user.identities.length === 0) {
                    authError.style.color = '';
                    authError.textContent = 'An account with this email already exists. Please log in.';
                } else {
                    authError.style.color = 'var(--success)';
                    authError.textContent = 'Check your email to confirm your account';
                }
            }
        } catch (err) {
            authError.textContent = err.message;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });

    let appInitialised = false;

    auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUserId = session.user.id;
            supabaseReady = true;
            hideAuth();
            const userEl = document.getElementById('user-email');
            if (userEl) userEl.textContent = session.user.email;
            if (!appInitialised) {
                appInitialised = true;
                app.init();
            }
        } else {
            currentUserId = null;
            supabaseReady = false;
            appInitialised = false;
            showAuth();
        }
    });

    // Check for existing session on page load
    auth.getSession().then(session => {
        if (session) {
            currentUserId = session.user.id;
            supabaseReady = true;
            hideAuth();
            const userEl = document.getElementById('user-email');
            if (userEl) userEl.textContent = session.user.email;
            if (!appInitialised) {
                appInitialised = true;
                app.init();
            }
        } else {
            showAuth();
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initAuthUI);
