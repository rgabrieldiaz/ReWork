import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { auctionId, seller } = payload;

        if (!auctionId || !seller) {
            return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
        }

        console.log(`[Trustless Work API] Cancel escrow request for auction ${auctionId} - seller: ${seller}`);

        return NextResponse.json({
            success: true,
            message: "Contrato cerrado y fondos devueltos exitosamente."
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Error al cancelar el contrato" },
            { status: 500 }
        );
    }
}
