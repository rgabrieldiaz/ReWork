// test-key.js
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

async function testKey() {
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
        console.error("❌ No se pudo leer .env.local");
        process.exit(1);
    }

    if (!apiKey) {
        console.error("❌ NEXT_PUBLIC_TW_API_KEY no encontrada en .env.local");
        process.exit(1);
    }

    console.log("Testing API Key:", apiKey.substring(0, 5) + "...");

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
        const payload = {
            signer: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
            engagementId: "test-" + Date.now(),
            title: "Test",
            description: "Test",
            roles: {
                approver: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
                serviceProvider: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
                platformAddress: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
                releaseSigner: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
                disputeResolver: "GA4H24E2U264D4GBH2TYRDEJ2PNTKSY2PGLTYJ3CBL7QXYXOMJED74BW",
                receiver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            },
            amount: 1,
            platformFee: 1,
            milestones: [{ description: "Test" }],
            trustline: {
                address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
                symbol: "XLM"
            }
        };

        const response = await axios.post(
            "https://dev.api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: { "Content-Type": "application/json", "x-api-key": apiKey },
                httpsAgent
            }
        );
        console.log("✅ API Key aceptada por el Deployer.");
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.error("❌ ERROR 401: La API Key es INVÁLIDA o ha sido revocada.");
            console.log("Por favor, genera una nueva en https://dashboard.trustlesswork.com");
        } else if (e.response) {
            console.log("✅ API Key aceptada (recibimos un error de validación esperado, no un 401).");
            console.log("Código de estado:", e.response.status);
        } else {
            console.error("❌ Error de conexión:", e.message);
        }
    }
}

testKey();
