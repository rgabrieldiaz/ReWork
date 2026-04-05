import { Keypair } from "@stellar/stellar-sdk";

/**
 * Generates a deterministic Stellar Keypair based on a unique string (like a Privy DID or Email).
 * It uses a global salt to ensure that even if the ID is known, the keypair cannot be derived without the salt.
 * 
 * @param uniqueId The stable identifier for the user (e.g. user.id)
 * @returns A Stellar Keypair object
 */
export async function generateDeterministicKeypair(uniqueId: string): Promise<Keypair> {
    const salt = process.env.NEXT_PUBLIC_APP_ENCRYPTION_SALT;
    if (!salt) {
        console.warn("WARNING: NEXT_PUBLIC_APP_ENCRYPTION_SALT is not set. Deterministic wallets will be insecure.");
    }
    const secureSalt = salt || "fallback_dev_salt_change_in_production";
    
    const data = new TextEncoder().encode(uniqueId + secureSalt);
    
    // Hash using WebCrypto API
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    
    // Convert ArrayBuffer to Uint8Array/Buffer format expected by Stellar SDK
    const seed = Buffer.from(hashBuffer);
    
    return Keypair.fromRawEd25519Seed(seed);
}
