// repro-validation-v2.js
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
            if (line.startsWith('NEXT_PUBLIC_TW_API_KEY=')) {
                apiKey = line.split('=')[1].trim();
                break;
            }
        }
    } catch (err) {
        console.error("Could not read .env.local");
        return;
    }

    const payload = {
        signer: address,
        engagementId: "test-market-" + Date.now(),
        title: "Test Bid Marketplace",
        description: "Bloqueando fondos para puja en el Marketplace.",
        roles: {
            approver: address,
            serviceProvider: DUMMY_PLATFORM_ADDRESS,
            platformAddress: DUMMY_PLATFORM_ADDRESS,
            releaseSigner: address,
            disputeResolver: DUMMY_PLATFORM_ADDRESS,
            receiver: DUMMY_PLATFORM_ADDRESS,
        },
        amount: 10,
        platformFee: 0.5,
        milestones: [
            { description: "Test Milestone" }
        ],
        trustline: {
            address: XLM_TESTNET_CONTRACT,
            symbol: "XLM"
        }
    };

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    console.log("SENDING PAYLOAD...");
    try {
        const response = await axios.post(
            "https://dev.api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                },
                httpsAgent,
            }
        );
        console.log("SUCCESS");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.log("ERROR_DETAILS_START");
            console.log(JSON.stringify(e.response.data, null, 2));
            console.log("ERROR_DETAILS_END");
            console.log("STATUS:", e.response.status);
        } else {
            console.error("ERROR MESSAGE:", e.message);
        }
    }
}

test();
