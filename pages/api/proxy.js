export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST destekleniyor' });
    }

    const payload = req.body;

    try {
        const response = await fetch("https://api.odaklojistik.com.tr/api/tmsorders/getall", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 49223653afa4b7e22c3659762c835dcdef9725a401e928fd46f697be8ea2597273bf4479cf9d0f7e5b8b03907c2a0b4d58625692c3e30629ac01fc477774de75'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Proxy API hatasý:", error);
        return res.status(500).json({ error: 'API çaðrýsý baþarýsýz' });
    }
}
