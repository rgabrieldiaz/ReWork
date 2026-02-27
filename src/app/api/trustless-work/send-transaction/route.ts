import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { xdr } = await request.json();

        const response = await fetch("https://api.trustlesswork.com/helper/send-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.NEXT_PUBLIC_TW_API_KEY!,
            },
            body: JSON.stringify({ signedXdr: xdr }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error sending transaction:", error);
        return NextResponse.json({ error: "Failed to send transaction" }, { status: 500 });
    }
}
