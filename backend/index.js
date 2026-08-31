
import readline from "readline/promises";
import { havuz } from "./db/baglanti.js";

const arayuz = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const gorevEkle = async (baslik) => {
    await havuz.query("INSERT INTO gorevler (baslik) VALUES ($1)", [baslik]);
    console.log("eklendi.");
};

const gorevleriListele = async () => {
    const sonuc = await havuz.query("SELECT * FROM gorevler ORDER BY id");
    const gorevler = sonuc.rows;

    if (gorevler.length === 0) {
        console.log("henüz görev yok.");
        return;
    }

    gorevler.forEach((gorev) => {
        const isaret = gorev.tamamlandi ? "[x]" : "[ ]";
        console.log(`${gorev.id}. ${isaret} ${gorev.baslik}`);
    });
};

const gorevTamamla = async (id) => {
    const sonuc = await havuz.query(
        "UPDATE gorevler SET tamamlandi = true WHERE id = $1",
        [id]
    );

    if (sonuc.rowCount === 0) {
        console.log("böyle bir görev yok.");
        return;
    }
    console.log("tamamlandı olarak işaretlendi.");
};

const gorevSil = async (id) => {
    const sonuc = await havuz.query("DELETE FROM gorevler WHERE id = $1", [id]);

    if (sonuc.rowCount === 0) {
        console.log("böyle bir görev yok.");
        return;
    }
    console.log("silindi.");
};

const menuGoster = () => {
    console.log("\n--- TODO ---");
    console.log("1. Görev ekle");
    console.log("2. Görevleri listele");
    console.log("3. Görevi tamamla");
    console.log("4. Görev sil");
    console.log("5. Çıkış");
};

let calisiyor = true;

while (calisiyor) {
    menuGoster();
    const secim = await arayuz.question("seçimin: ");

    if (secim === "1") {
        const baslik = await arayuz.question("görev başlığı: ");
        await gorevEkle(baslik);
    } else if (secim === "2") {
        await gorevleriListele();
    } else if (secim === "3") {
        const id = await arayuz.question("hangi id? ");
        await gorevTamamla(Number(id));
    } else if (secim === "4") {
        const id = await arayuz.question("hangi id silinsin? ");
        await gorevSil(Number(id));
    } else if (secim === "5") {
        calisiyor = false;
    } else {
        console.log("geçersiz seçim.");
    }
}

arayuz.close();
await havuz.end();
console.log("görüşürüz.");