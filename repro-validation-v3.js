// repro-validation-v3.js
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DUMMY_PLATFORM_ADDRESS = "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW";
const XLM_TESTNET_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const address = "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE";

async function test() {
    let apiKey = "";
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            if (line.includes('NEXT_PUBLIC_TW_API_KEY=')) {
                apiKey = line.split('=')[1].trim();
                break;
            }
        }
    } catch (err) {
        process.exit(1);
    }

    const payload = {
        signer: address,
        engagementId: "test-bid-" + Date.now(),
        title: "Test Bid",
        description: "Test description",
        roles: {
            approver: address,
            serviceProvider: DUMMY_PLATFORM_ADDRESS,
            platformAddress: DUMMY_PLATFORM_ADDRESS,
            releaseSigner: address,
            disputeResolver: DUMMY_PLATFORM_ADDRESS,
            receiver: DUMMY_PLATFORM_ADDRESS,
        },
        amount: 1,
        platformFee: 1,
        milestones: [{ description: "Test" }],
        trustline: { address: XLM_TESTNET_CONTRACT, symbol: "XLM" }
    };

    try {
        const response = await axios.post(
            "https://dev.api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: { "Content-Type": "application/json", "x-api-key": apiKey },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );
        console.log(JSON.stringify(response.data));
    } catch (e) {
        if (e.response) {
            console.log(JSON.stringify(e.response.data));
        } else {
            console.log(JSON.stringify({ error: e.message }));
        }
    }
}
test();
