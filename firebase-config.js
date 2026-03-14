/* ============================
   Firebase Configuration
   ============================ */

// TODO: Replace with your Firebase project config
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Add a Web App (click </> icon)
// 4. Copy the config object below
// 5. Enable Firestore Database (Build > Firestore Database > Create)
//    - Start in TEST MODE for now
// 6. Deploy and test

const firebaseConfig = {
    apiKey: "AIzaSyA-g5uxQ_NJsuP-3RRACIhGhyPbSUnAbXQ",
    authDomain: "lockpro-4578d.firebaseapp.com",
    projectId: "lockpro-4578d",
    storageBucket: "lockpro-4578d.firebasestorage.app",
    messagingSenderId: "304826338991",
    appId: "1:304826338991:web:3c688d34c99fa9f3214e5a"
};

// ---- Initialize Firebase ----
let db = null;
let firebaseReady = false;

function initFirebase() {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn('Firebase not configured — using localStorage only. Edit firebase-config.js to enable cloud sync.');
            return;
        }
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('Firebase connected');
    } catch (e) {
        console.error('Firebase init failed:', e);
        firebaseReady = false;
    }
}

// ---- Firestore Data Layer ----
const cloudDB = {
    // Load all jobs from Firestore
    async loadJobs() {
        if (!firebaseReady) return null;
        try {
            const snapshot = await db.collection('jobs').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error('Error loading jobs from Firestore:', e);
            return null;
        }
    },

    // Load settings from Firestore
    async loadSettings() {
        if (!firebaseReady) return null;
        try {
            const doc = await db.collection('config').doc('settings').get();
            return doc.exists ? doc.data() : null;
        } catch (e) {
            console.error('Error loading settings from Firestore:', e);
            return null;
        }
    },

    // Save a single job (add or update)
    async saveJob(job) {
        if (!firebaseReady) return;
        try {
            await db.collection('jobs').doc(job.id).set(job);
        } catch (e) {
            console.error('Error saving job to Firestore:', e);
        }
    },

    // Delete a single job
    async deleteJob(id) {
        if (!firebaseReady) return;
        try {
            await db.collection('jobs').doc(id).delete();
        } catch (e) {
            console.error('Error deleting job from Firestore:', e);
        }
    },

    // Save settings
    async saveSettings(settings) {
        if (!firebaseReady) return;
        try {
            await db.collection('config').doc('settings').set(settings);
        } catch (e) {
            console.error('Error saving settings to Firestore:', e);
        }
    },

    // Bulk save all jobs (used for route optimization)
    async saveAllJobs(jobs) {
        if (!firebaseReady) return;
        try {
            const batch = db.batch();
            jobs.forEach(job => {
                batch.set(db.collection('jobs').doc(job.id), job);
            });
            await batch.commit();
        } catch (e) {
            console.error('Error batch saving jobs to Firestore:', e);
        }
    },

    // Save jotter notes
    async saveJotter(notes) {
        if (!firebaseReady) return;
        try {
            await db.collection('config').doc('jotter').set({ notes });
        } catch (e) {
            console.error('Error saving jotter to Firestore:', e);
        }
    },

    // Load jotter notes
    async loadJotter() {
        if (!firebaseReady) return null;
        try {
            const doc = await db.collection('config').doc('jotter').get();
            return doc.exists ? doc.data().notes : null;
        } catch (e) {
            console.error('Error loading jotter from Firestore:', e);
            return null;
        }
    },

    // Migrate localStorage data to Firestore (one-time)
    async migrateFromLocalStorage(jobs, settings) {
        if (!firebaseReady) return;
        try {
            const existing = await db.collection('jobs').limit(1).get();
            if (!existing.empty) return; // Already has data, skip migration

            console.log('Migrating localStorage data to Firestore...');
            const batch = db.batch();
            jobs.forEach(job => {
                batch.set(db.collection('jobs').doc(job.id), job);
            });
            batch.set(db.collection('config').doc('settings'), settings);
            await batch.commit();
            console.log(`Migrated ${jobs.length} jobs to Firestore`);
        } catch (e) {
            console.error('Migration failed:', e);
        }
    }
};

// Initialize on load
initFirebase();
