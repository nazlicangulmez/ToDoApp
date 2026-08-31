import express from "express";
import cors from "cors";
import { havuz } from "./db/baglanti.js";

const uygulama = express();
const PORT = 3000;

uygulama.use(cors());
uygulama.use(express.json());

uygulama.get("/gorevler", async (istek, yanit) => {
    const sonuc = await havuz.query("SELECT * FROM gorevler ORDER BY id");
    yanit.json(sonuc.rows);
});

uygulama.post("/gorevler", async (istek, yanit) => {
    const { baslik } = istek.body;

    if (!baslik) {
        return yanit.status(400).json({ hata: "baslik zorunlu" });
    }

    const sonuc = await havuz.query(
        "INSERT INTO gorevler (baslik) VALUES ($1) RETURNING *",
        [baslik]
    );

    yanit.status(201).json(sonuc.rows[0]);
});

uygulama.put("/gorevler/:id", async (istek, yanit) => {
    const { id } = istek.params;
    const { durum } = istek.body;

    const gecerliDurumlar = ["bekliyor", "devam", "bitti"];
    if (!gecerliDurumlar.includes(durum)) {
        return yanit.status(400).json({ hata: "gecersiz durum" });
    }

    const sonuc = await havuz.query(
        "UPDATE gorevler SET durum = $1 WHERE id = $2 RETURNING *",
        [durum, id]
    );

    if (sonuc.rowCount === 0) {
        return yanit.status(404).json({ hata: "gorev bulunamadi" });
    }

    yanit.json(sonuc.rows[0]);
});

uygulama.delete("/gorevler/:id", async (istek, yanit) => {
    const { id } = istek.params;

    const sonuc = await havuz.query(
        "DELETE FROM gorevler WHERE id = $1 RETURNING *",
        [id]
    );

    if (sonuc.rowCount === 0) {
        return yanit.status(404).json({ hata: "gorev bulunamadi" });
    }

    yanit.json({ mesaj: "silindi" });
});

uygulama.listen(PORT, () => {
    console.log(`sunucu http://localhost:${PORT} adresinde`);
});