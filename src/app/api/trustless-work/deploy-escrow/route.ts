import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_TW_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Trustless Work API Key is missing in environment variables." }, { status: 500 });
        }

        const payload = await request.json();

        // Creamos un agente HTTPS que ignore errores de certificado SSL en Node.js (unable to verify the first certificate)
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        const response = await axios.post(
            "https://dev.api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                },
                httpsAgent,
            }
        );
        return NextResponse.json(response.data);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const errorData = error.response?.data || { message: error.message };
        
        // Log expanded error to server console
        console.error(`[TW-API-ERROR] deploy-escrow (${status}):`, JSON.stringify(errorData, null, 2));

        return NextResponse.json(errorData, { status });
    }
}
