const { createClient } = require('@supabase/supabase-js');
const { throwHttpError } = require('./_errors');

let client = null;

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throwHttpError('Supabase server credentials are not configured.', 503);
    }

    if (!client) {
        client = createClient(url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }

    return client;
}

module.exports = { getSupabaseAdmin };
