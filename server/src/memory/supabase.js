const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Optional:
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY"
    );
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        realtime: {
            transport: WebSocket
        }
    }
);

module.exports = { supabase };