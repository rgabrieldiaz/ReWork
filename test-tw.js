// test-tw.js
const axios = require('axios');
const https = require('https');

async function test() {
    const payload = {
        signer: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
        engagementId: `rework-auction-1-${Date.now()}`,
        title: `Puja para Silla`,
        description: `Bloqueando fondos para puja en el Marketplace por 500 XLM.`,
        roles: {
            approver: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
            serviceProvider: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
            platformAddress: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            releaseSigner: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
            disputeResolver: "GAX3K22T55C4K5L4C5YBY2P5YJ2P6A6L2P2C3OZX6KXX5K6A3E26E54H",
            receiver: "GATZYG2LVSUN5T5YNTG6X6EHKIXO2256KCYMYCCTH4DNO5TYR7AQLTIE",
        },
        amount: 500,
        platformFee: 1, // 1% platform fee
        milestones: [
            { description: "Recepción del artículo por el comprador" }
        ],
        trustline: {
            address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
            symbol: "XLM"
        }
    };

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    try {
        const response = await axios.post(
            "https://api.trustlesswork.com/deployer/single-release",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "Da2GpM9xnktaURrb4Tn7ug",
                },
                httpsAgent,
            }
        );
        console.log("SUCCESS:", response.data);
    } catch (e) {
        console.error("ERROR:", e.response?.data || e.message);
    }
}

test();
