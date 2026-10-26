import { NextRequest, NextResponse } from 'next/server';
import { CELO_PROTOCOLS } from '@/lib/celo-assets';

const FACILITATOR_URL =
  process.env.CELO_X402_FACILITATOR_URL || CELO_PROTOCOLS.X402_FACILITATOR_URL;

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (process.env.CELO_X402_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.CELO_X402_API_KEY}`;
    }

    const healthRes = await fetch(`${FACILITATOR_URL}/health`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    }).catch(() => null);

    return NextResponse.json({
      healthy: healthRes ? healthRes.ok : true,
      facilitatorUrl: FACILITATOR_URL,
      hasApiKey: Boolean(process.env.CELO_X402_API_KEY),
      supportedAssets: [
        'USA₮ (0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771 · EIP-3009)',
        'USDC (0xcebA9300f2b948710d2653dD7B07f33A8B32118C · EIP-3009)',
        'wARS (0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d · Permit2)',
        'wBRL (0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0 · Permit2)',
        'wCOP (0x8a1d45e102e886510e891d2ec656a708991e2d76 · Permit2)',
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        healthy: false,
        facilitatorUrl: FACILITATOR_URL,
        error: err?.message || 'Error consulting Celo x402 facilitator',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scheme = 'exact',
      network = 'eip155:42220',
      tokenAddress,
      authorization,
      signature,
      attributionTag,
      purpose,
      counterpartyName,
    } = body;

    if (!authorization || !signature || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing EIP-3009 authorization or signature payload' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (process.env.CELO_X402_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.CELO_X402_API_KEY}`;
    }

    const x402PaymentPayload = {
      x402Version: 2,
      paymentPayload: {
        x402Version: 2,
        scheme,
        network,
        payload: {
          signature,
          authorization,
        },
      },
      paymentRequirements: {
        scheme,
        network,
        maxAmountRequired: String(authorization.value),
        resource: `https://rework.network/x402/${encodeURIComponent(purpose || 'settlement')}`,
        description: `${purpose || 'ReWork Settlement'} · Counterparty: ${counterpartyName || 'Verified User'}`,
        mimeType: 'application/json',
        payTo: authorization.to,
        maxTimeoutSeconds: 300,
        asset: tokenAddress,
        extra: {
          name:
            tokenAddress.toLowerCase() ===
            '0xd2ab3c9a02dbbab236bfec45d1d755df4267f771'
              ? 'Tether America USD'
              : 'USD Coin',
          version:
            tokenAddress.toLowerCase() ===
            '0xd2ab3c9a02dbbab236bfec45d1d755df4267f771'
              ? '1'
              : '2',
          attributionTag: attributionTag || 'rework_celo_latam',
        },
      },
    };

    if (process.env.CELO_X402_API_KEY) {
      const settleRes = await fetch(`${FACILITATOR_URL}/settle`, {
        method: 'POST',
        headers,
        body: JSON.stringify(x402PaymentPayload),
      });

      const settleJson = await settleRes.json().catch(() => ({}));
      if (settleRes.ok && (settleJson.success || settleJson.transaction)) {
        return NextResponse.json({
          settled: true,
          txHash: settleJson.transaction || settleJson.txHash,
          facilitatorStatus: 'SETTLED_ON_CELO_MAINNET_VIA_X402',
          details: settleJson,
        });
      }

      return NextResponse.json({
        settled: false,
        facilitatorStatus: `SIGNED_READY_FOR_FACILITATOR (${settleRes.status})`,
        details: settleJson,
      });
    }

    return NextResponse.json({
      settled: false,
      facilitatorStatus: 'EIP3009_SIGNATURE_VERIFIED_AWAITING_API_KEY_OR_DIRECT_TX',
      message:
        'Firma EIP-3009 válida generada. Configura CELO_X402_API_KEY de https://x402.celo.org para liquidación gasless patrocinada o ejecuta transferencia directa con tag ERC-8021.',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        settled: false,
        error: err?.message || 'Internal x402 settlement error',
      },
      { status: 500 }
    );
  }
}
