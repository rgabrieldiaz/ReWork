const { Keypair } = require('@stellar/stellar-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
    const kp1 = Keypair.random();
    const kp2 = Keypair.random();
    const kp3 = Keypair.random();

    const address1 = kp1.publicKey();
    const address2 = kp2.publicKey();
    const address3 = kp3.publicKey();
    const PLATFORM_ADDR = "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI";

    const payload = {
        signer: address1,
        engagementId: `test-val-${Date.now()}`,
        title: "Test Validation",
        description: "Testing with guaranteed valid addresses",
        roles: {
            approver: address1,
            serviceProvider: address2,
            platformAddress: PLATFORM_ADDR,
            releaseSigner: address1,
            disputeResolver: PLATFORM_ADDR,
            receiver: address2,
        },
        amount: 10,
        platformFee: 0.5,
        milestones: [{ description: "Test Milestone", amount: 10 }],
        trustline: {
            address: "GCGBYBS7UWLYRUQLOV4Y6Z7NWFEOOUE6KHHP476HZ6RFRZHQ64SOYEPI",
            symbol: "USDC"
        }
    };

    let apiKey = "";
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            const keyLine = lines.find(line => line.startsWith('NEXT_PUBLIC_TW_API_KEY='));
            if (keyLine) apiKey = keyLine.split('=')[1].trim();
        }
    } catch (err) {}

    console.log("SENDING WITH VALID ADDRS:", address1, address2);
    try {
        const response = await axios.post(
            "https://dev.api.trustlesswork.com/deployer/single-release",
            payload,
            { headers: { "Content-Type": "application/json", "x-api-key": apiKey } }
        );
        console.log("SUCCESS!");
    } catch (e) {
        console.error("ERROR DATA:", JSON.stringify(e.response?.data, null, 2));
    }
}
test();
