import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { auctionId, seller } = payload;

        if (!auctionId || !seller) {
            return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
        }

        // Simulamos la interacción con Stellar/Trustless Work para "cerrar contrato"
        // y devolver el depósito al creador.
        console.log(`[Trustless Mock] Cerrando contrato y devolviendo fondos para subasta ${auctionId} a la wallet ${seller}`);

        // Simular retraso de red
        await new Promise(resolve => setTimeout(resolve, 1500));

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
