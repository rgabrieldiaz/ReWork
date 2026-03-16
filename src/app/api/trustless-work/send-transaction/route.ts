import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_TW_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Trustless Work API Key is missing." }, { status: 500 });
        }

        const { xdr } = await request.json();

        const response = await fetch("https://dev.api.trustlesswork.com/helper/send-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
            body: JSON.stringify({ xdr }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json({ 
                    error: "Unauthorized", 
                    message: "API Key de Trustless Work inválida." 
                }, { status: 401 });
            }
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error sending transaction:", error);
        return NextResponse.json({ error: "Failed to send transaction", message: error.message }, { status: 500 });
    }
}
