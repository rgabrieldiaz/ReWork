// test-tw.js
const axios = require('axios');
const https = require('https');

async function test() {
    const payload = {
        signer: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
        engagementId: `test-market-${Date.now()}`,
        title: "Test Bid Marketplace",
        description: `Bloqueando fondos para puja en el Marketplace por 10 XLM.`,
        roles: {
            approver: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE", // Buyer
            serviceProvider: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H", // Seller
            platformAddress: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
            releaseSigner: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
            disputeResolver: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
            receiver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H", // Seller's receiver
        },
        amount: 10,
        platformFee: 0.5,
        milestones: [
            { description: "Test Milestone Marketplace" }
        ],
        trustline: {
            address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
            symbol: "XLM"
        }
    };

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    // Cargar API Key desde .env.local para que coincida con la app
    const fs = require('fs');
    const path = require('path');
    let apiKey = "";
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            const keyLine = lines.find(line => line.startsWith('NEXT_PUBLIC_TW_API_KEY='));
            if (keyLine) apiKey = keyLine.split('=')[1].trim();
        }
    } catch (err) {
        console.log("Error reading .env.local:", err.message);
    }

    if (!apiKey) {
        console.error("CRITICAL: No API Key found in .env.local");
        return;
    }

    console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(
            "https://api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                httpsAgent,
            }
        );
        console.log("SUCCESS:", response.data);
    } catch (e) {
        if (e.response) {
            console.error("ERROR DATA:", JSON.stringify(e.response.data, null, 2));
            console.error("STATUS:", e.response.status);
        } else {
            console.error("ERROR MESSAGE:", e.message);
        }
    }
}

test();
