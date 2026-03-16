const { StrKey } = require('@stellar/stellar-sdk');
const addr = "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW";
try {
    const isValid = StrKey.isValidEd25519PublicKey(addr);
    console.log(`Address ${addr} is valid: ${isValid}`);
} catch (e) {
    console.log(`Error checking address: ${e.message}`);
}
