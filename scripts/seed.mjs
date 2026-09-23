import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCrowdfunds() {
    console.log("Seeding crowdfunds...");
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    const colectas = [
        {
            title: "Asado de equipo",
            description: "Ayudanos a financiar el evento de integración de fin de mes para celebrar los objetivos alcanzados de todo el equipo de ReWork.",
            organizer: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            destination_account: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            goal_amount: 150,
            current_amount: 127.5, // 85%
            donor_count: 24,
            tags: ["Equipo", "Celebración"],
            image: "🍖",
            deadline: deadline.toISOString(),
            status: "active",
        },
        {
            title: "Nuevas sillas ergonómicas",
            description: "Fondo común para mejorar el equipamiento de la oficina y cuidar la salud postural del equipo.",
            organizer: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            destination_account: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            goal_amount: 500,
            current_amount: 250, // 50%
            donor_count: 12,
            tags: ["Oficina", "Salud"],
            image: "💺",
            deadline: deadline.toISOString(),
            status: "active",
        },
        {
            title: "Suscripción a Inteligencia Artificial",
            description: "Colecta para pagar las herramientas de IA (ChatGPT, Claude, Midjourney) que utilizamos día a día.",
            organizer: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            destination_account: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            goal_amount: 100,
            current_amount: 10, // 10%
            donor_count: 2,
            tags: ["Herramientas", "IA"],
            image: "🤖",
            deadline: deadline.toISOString(),
            status: "active",
        }
    ];

    const { data, error } = await supabase.from('crowdfunds').insert(colectas).select();

    if (error) {
        console.error("Error inserting data:", error);
    } else {
        console.log("Successfully inserted metadata:", data.length);
    }
}

seedCrowdfunds();
