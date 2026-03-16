// repro-validation.js
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Mock data from the app's context
const DUMMY_PLATFORM_ADDRESS = "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW";
const XLM_TESTNET_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const address = "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE"; // Example signer

async function test() {
    let apiKey = "";
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_TW_API_KEY=(.*)/);
        if (match && match[1]) apiKey = match[1].trim();
    } catch (err) {
        console.error("Could not read .env.local");
        return;
    }

    const XLM_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
    const PLATFORM_ADDR = "GADS4SSWFTND6ICGXQORWH3VX4BAXF6JFFQ3EWW75QDUCHJ7A2LFHACTJ";

    const payload = {
        signer: address,
        engagementId: `test-market-${Date.now()}`,
        title: `Puja para Item de Prueba`,
        description: `Bloqueando fondos para oferta de 10 XLM en Marketplace ReWork.`,
        roles: {
            approver: address,
            serviceProvider: PLATFORM_ADDR,
            platformAddress: PLATFORM_ADDR,
            releaseSigner: address,
            disputeResolver: PLATFORM_ADDR,
            receiver: PLATFORM_ADDR,
        },
        amount: 10,
        platformFee: 0.5,
        milestones: [
            { description: "Aprobación y entrega del artículo por el vendedor" }
        ],
        trustline: {
            address: XLM_CONTRACT,
            symbol: "XLM"
        }
    };

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    console.log("SENDING PAYLOAD TO DEV API...");
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
        console.log("SUCCESS:", response.data);
    } catch (e) {
        if (e.response) {
            console.error("ERROR DATA (Full validation details):", JSON.stringify(e.response.data, null, 2));
            console.error("STATUS:", e.response.status);
        } else {
            console.error("ERROR MESSAGE:", e.message);
        }
    }
}

test();
