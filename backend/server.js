import express from "express";
import cors from "cors";
import { havuz } from "./db/baglanti.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const uygulama = express();
const PORT = 3000;

uygulama.use(cors());
uygulama.use(express.json());

const tokenKontrol = (istek, yanit, sonraki) => {
    const baslik = istek.headers.authorization;

    if (!baslik || !baslik.startsWith("Bearer ")) {
        return yanit.status(401).json({ hata: "token gerekli" });
    }

    const token = baslik.split(" ")[1];

    try {
        const veri = jwt.verify(token, process.env.JWT_SECRET);
        istek.kullanici = veri;
        sonraki();
    } catch (hata) {
        return yanit.status(401).json({ hata: "gecersiz veya suresi dolmus token" });
    }
};

uygulama.post("/kayit", async (istek, yanit) => {
    const { eposta, sifre } = istek.body;

    if (!eposta || !sifre) {
        return yanit.status(400).json({ hata: "eposta ve sifre zorunlu" });
    }

    if (sifre.length < 6) {
        return yanit.status(400).json({ hata: "sifre en az 6 karakter olmali" });
    }

    const mevcut = await havuz.query(
        "SELECT id FROM kullanicilar WHERE eposta = $1",
        [eposta]
    );

    if (mevcut.rowCount > 0) {
        return yanit.status(409).json({ hata: "bu eposta zaten kayitli" });
    }

    const sifreHash = await bcrypt.hash(sifre, 10);

    const sonuc = await havuz.query(
        "INSERT INTO kullanicilar (eposta, sifre_hash) VALUES ($1, $2) RETURNING id, eposta",
        [eposta, sifreHash]
    );

    yanit.status(201).json(sonuc.rows[0]);
});

uygulama.post("/giris", async (istek, yanit) => {
    const { eposta, sifre } = istek.body;

    if (!eposta || !sifre) {
        return yanit.status(400).json({ hata: "eposta ve sifre zorunlu" });
    }

    const sonuc = await havuz.query(
        "SELECT * FROM kullanicilar WHERE eposta = $1",
        [eposta]
    );

    if (sonuc.rowCount === 0) {
        return yanit.status(401).json({ hata: "eposta veya sifre hatali" });
    }

    const kullanici = sonuc.rows[0];
    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);

    if (!sifreDogruMu) {
        return yanit.status(401).json({ hata: "eposta veya sifre hatali" });
    }

    const token = jwt.sign(
        { id: kullanici.id, eposta: kullanici.eposta },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    yanit.json({ token: token });
});

uygulama.get("/gorevler", tokenKontrol, async (istek, yanit) => {
    const sonuc = await havuz.query(
        "SELECT * FROM gorevler WHERE kullanici_id = $1 ORDER BY id",
        [istek.kullanici.id]
    );
    yanit.json(sonuc.rows);
});

uygulama.post("/gorevler", tokenKontrol, async (istek, yanit) => {
    const { baslik } = istek.body;

    if (!baslik) {
        return yanit.status(400).json({ hata: "baslik zorunlu" });
    }

    const sonuc = await havuz.query(
        "INSERT INTO gorevler (baslik, kullanici_id) VALUES ($1, $2) RETURNING *",
        [baslik, istek.kullanici.id]
    );

    yanit.status(201).json(sonuc.rows[0]);
});

uygulama.put("/gorevler/:id", tokenKontrol, async (istek, yanit) => {
    const { id } = istek.params;
    const { durum } = istek.body;

    const gecerliDurumlar = ["bekliyor", "devam", "bitti"];
    if (!gecerliDurumlar.includes(durum)) {
        return yanit.status(400).json({ hata: "gecersiz durum" });
    }

    const sonuc = await havuz.query(
        "UPDATE gorevler SET durum = $1 WHERE id = $2 AND kullanici_id = $3 RETURNING *",
        [durum, id, istek.kullanici.id]
    );

    if (sonuc.rowCount === 0) {
        return yanit.status(404).json({ hata: "gorev bulunamadi" });
    }

    yanit.json(sonuc.rows[0]);
});

uygulama.delete("/gorevler/:id", tokenKontrol, async (istek, yanit) => {
    const { id } = istek.params;

    const sonuc = await havuz.query(
        "DELETE FROM gorevler WHERE id = $1 AND kullanici_id = $2 RETURNING *",
        [id, istek.kullanici.id]
    );

    if (sonuc.rowCount === 0) {
        return yanit.status(404).json({ hata: "gorev bulunamadi" });
    }

    yanit.json({ mesaj: "silindi" });
});

uygulama.listen(PORT, () => {
    console.log(`sunucu http://localhost:${PORT} adresinde`);
});