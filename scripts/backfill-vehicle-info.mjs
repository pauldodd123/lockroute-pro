/**
 * Backfill vehicleInfo for all jobs that have a vehicleReg but no vehicleInfo.
 *
 * Uses the service role key to bypass RLS — reads/updates all users' jobs.
 *
 * Usage:
 *   node scripts/backfill-vehicle-info.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://klnerdcxmhrqqrwrleez.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbmVyZGN4bWhycXFyd3JsZWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUzMTUxMSwiZXhwIjoyMDYyMTA3NTExfQ.iYT1bKGGe6bSO_mHeaSlCmOmaUVgBh1rlN8VvQnldPw';

const DELAY_MS = 500; // delay between DVLA API calls to avoid rate limiting

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function lookupReg(reg) {
    const { data, error } = await supabase.functions.invoke('vehicle-lookup', {
        body: { registration: reg },
    });
    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
    return {
        registrationNumber: data.registration || reg,
        make: data.make,
        colour: data.colour,
        yearOfManufacture: data.yearOfManufacture,
        fuelType: data.fuelType,
        motStatus: data.motStatus,
        taxStatus: data.taxStatus,
    };
}

async function main() {
    // Fetch all jobs with a vehicle_reg but null/empty vehicle_info
    const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, vehicle_reg, vehicle_info')
        .not('vehicle_reg', 'is', null)
        .neq('vehicle_reg', '')
        .is('vehicle_info', null);

    if (fetchError) {
        console.error('Failed to fetch jobs:', fetchError.message);
        process.exit(1);
    }

    console.log(`Found ${jobs.length} job(s) with a reg but no vehicle info.\n`);
    if (jobs.length === 0) {
        console.log('Nothing to do.');
        process.exit(0);
    }

    // Deduplicate regs so we only call the API once per unique reg
    const regToJobs = {};
    for (const job of jobs) {
        const reg = job.vehicle_reg.replace(/\s+/g, '').toUpperCase();
        if (!regToJobs[reg]) regToJobs[reg] = [];
        regToJobs[reg].push(job.id);
    }

    const uniqueRegs = Object.keys(regToJobs);
    console.log(`${uniqueRegs.length} unique reg(s) to look up.\n`);

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < uniqueRegs.length; i++) {
        const reg = uniqueRegs[i];
        const jobIds = regToJobs[reg];
        const displayReg = reg.length >= 5 ? reg.slice(0, -3) + ' ' + reg.slice(-3) : reg;

        process.stdout.write(`[${i + 1}/${uniqueRegs.length}] ${displayReg} — `);

        try {
            const vehicleInfo = await lookupReg(reg);
            const makeStr = [vehicleInfo.make, vehicleInfo.colour, vehicleInfo.yearOfManufacture].filter(Boolean).join(' ');
            console.log(`${makeStr || 'found'} (updating ${jobIds.length} job(s))`);

            const { error: updateError } = await supabase
                .from('jobs')
                .update({ vehicle_info: vehicleInfo, updated_at: new Date().toISOString() })
                .in('id', jobIds);

            if (updateError) throw updateError;
            succeeded += jobIds.length;
        } catch (err) {
            console.log(`FAILED — ${err.message}`);
            failed += jobIds.length;
        }

        if (i < uniqueRegs.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    console.log(`\nDone. ${succeeded} job(s) updated, ${failed} failed.`);
}

main();
