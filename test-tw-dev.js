const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

async function test() {
    let apiKey = "f45rdiN1rElqjQ1vkFS8RA.bee042fe2da6f375b3fb1bce294c400634e8bd884c1bc3d684bfe507503894c0";
    
    // Test addresses from crowdfunding implementation (known to work)
    const ADDR = "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE";
    const VALID_PLATFORM = "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW";
    const XLM_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

    const payload = {
        signer: ADDR,
        engagementId: `rework-final-test-${Date.now()}`,
        title: "Final Test Marketplace",
        description: "Testing deployment with final app config.",
        roles: {
            approver: ADDR,
            serviceProvider: ADDR,
            platformAddress: VALID_PLATFORM,
            releaseSigner: ADDR,
            disputeResolver: VALID_PLATFORM,
            receiver: ADDR,
        },
        amount: 2,
        platformFee: 0.5,
        milestones: [
            { description: "Final Verification" }
        ],
        trustline: {
            address: XLM_CONTRACT,
            symbol: "XLM"
        }
    };

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    console.log("TESTING DEV API WITH x-api-key...");
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
        console.log("SUCCESS:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("ERROR DATA:", JSON.stringify(error.response?.data, null, 2));
    }
}

test();
