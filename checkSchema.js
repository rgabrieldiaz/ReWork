import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://fvipnqkdnfzwekfjwjtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aXBucWtkbmZ6d2VrZmp3anRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzA1MDAsImV4cCI6MjA4NzcwNjUwMH0.kqsTTJELqBj9FpFOF-b98DtsfexV3IshdeDkojlhOcI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('auctions').select('*');
    if (error) {
        console.error('Error fetching:', error);
    } else {
        fs.writeFileSync('auctions_dump.json', JSON.stringify(data, null, 2));
        console.log('Saved to auctions_dump.json');
    }
}
checkSchema();
