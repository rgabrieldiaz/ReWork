import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Creamos un agente HTTPS que ignore errores de certificado SSL en Node.js (unable to verify the first certificate)
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        const response = await axios.post(
            "https://api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_TW_API_KEY!,
                },
                httpsAgent, // Node.js bypass for SSL
            }
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        const data = error.response?.data || { message: error.message };
        const status = error.response?.status || 500;
        console.error("Error deploying escrow:", data);
        return NextResponse.json(data, { status });
    }
}
