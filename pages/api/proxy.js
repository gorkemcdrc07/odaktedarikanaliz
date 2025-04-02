// api/proxy.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/proxy", async (req, res) => {
    try {
        const response = await fetch("https://api.odaklojistik.com.tr/api/tmsorders/getall", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 49223653afa4b7e22c3659762c835dcdef9725a401e928fd46f697be8ea2597273bf4479cf9d0f7e5b8b03907c2a0b4d58625692c3e30629ac01fc477774de75"
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatasý", error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Proxy sunucusu çalýþýyor: http://localhost:${PORT}`);
});
