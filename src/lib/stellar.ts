import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";

export const config = {
    testnet: {
        horizonUrl: "https://horizon-testnet.stellar.org",
        rpcUrl: "https://soroban-testnet.stellar.org",
        networkPassphrase: StellarSdk.Networks.TESTNET,
    },
    mainnet: {
        horizonUrl: "https://horizon.stellar.org",
        rpcUrl: process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL || "",
        networkPassphrase: StellarSdk.Networks.PUBLIC,
    },
}[NETWORK as "testnet" | "mainnet"]!;

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);
export const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

// Direcciones oficiales de emisores de USDC en Stellar
export const STELLAR_USDC_ISSUER = {
    testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    mainnet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

export const USDC_ISSUER = NETWORK === "mainnet" ? STELLAR_USDC_ISSUER.mainnet : STELLAR_USDC_ISSUER.testnet;

// Dirección oficial de la plataforma ReWork para tarifas y arbitraje de contratos Escrow
export const REWORK_PLATFORM_ADDRESS = "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI";
