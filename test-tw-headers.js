const axios = require('axios');
const https = require('https');

async function testCombination(name, url, headers) {
    console.log(`--- TESTING: ${name} ---`);
    const payload = {
        signer: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
        engagementId: `test-comb-${Date.now()}-${name.replace(/\s+/g, '-')}`,
        title: "Auth Test",
        description: "Testing auth combinations.",
        roles: {
            approver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            serviceProvider: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            platformAddress: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
            releaseSigner: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            disputeResolver: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
            receiver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
        },
        amount: 1,
        platformFee: 0,
        milestones: [{ description: "Test" }],
        trustline: {
            address: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            symbol: "TEST"
        }
    };

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
        const response = await axios.post(url, payload, { headers, httpsAgent });
        console.log(`Result: SUCCESS (${response.status})`);
    } catch (error) {
        console.log(`Result: ERROR (${error.response?.status})`);
        if (error.response?.data) {
            console.log("Response:", JSON.stringify(error.response.data).substring(0, 500));
        }
    }
}

async function runAll() {
    const apiKey = "f45rdiN1rElqjQ1vkFS8RA.bee042fe2da6f375b3fb1bce294c400634e8bd884c1bc3d684bfe507503894c0";
    const prodUrl = "https://api.trustlesswork.com/deployer/single-release";
    
    // Using addresses from the successful crowdfund part (supposedly)
    await testCombination("PROD + Bearer", prodUrl, { "Authorization": `Bearer ${apiKey}` });
}

runAll();
