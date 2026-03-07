import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('squads').insert([{
        name: 'test',
        description: 'test',
        specialty: 'test',
        is_open: true,
        emoji: '🎯',
        leader_id: 'e28ff0e3-4d64-44aa-9bd6-7b44d320b991' // hardcode an id or omit it to see if it's the missing error
    }]);

    if (error) {
        console.log("Error object:", error);
        console.log("Error JSON:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success:", data);
    }
}

test();
