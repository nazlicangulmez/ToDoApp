//Callback
// const gorevleriGetir = (bittiginde) => {
//     setTimeout(() => {
//         bittiginde(["alışveriş yap", "ödevi bitir", "koşuya çık"]);
//     }, 2000);
// };
//
// console.log("görevler isteniyor...");
//
// gorevleriGetir((gorevler) => {
//     console.log("gelen görevler:", gorevler);
// });
//
// console.log("bu arada başka işler yapılıyor");

//Promise
// const gorevleriGetir = () => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(["alışveriş yap", "ödevi bitir", "koşuya çık"]);
//         }, 2000);
//     });
// };
//
// console.log("görevler isteniyor...");
//
// gorevleriGetir().then((gorevler) => {
//     console.log("gelen görevler:", gorevler);
// });
//
// console.log("bu arada başka işler yapılıyor");

//Async/Await

// const gorevleriGetir = () => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(["alışveriş yap", "ödevi bitir", "koşuya çık"]);
//         }, 2000);
//     });
// };
//
// const calistir = async () => {
//     console.log("görevler isteniyor...");
//
//     const gorevler = await gorevleriGetir();
//
//     console.log("gelen görevler:", gorevler);
// };
//
// calistir();

import readline from "readline/promises";

const arayuz = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const gorevler = [];

const gorevEkle = (baslik) => {
    gorevler.push({ baslik: baslik, tamamlandi: false });
    console.log("eklendi.");
};

const gorevleriListele = () => {
    if (gorevler.length === 0) {
        console.log("henüz görev yok.");
        return;
    }
    gorevler.forEach((gorev, index) => {
        const isaret = gorev.tamamlandi ? "[x]" : "[ ]";
        console.log(`${index + 1}. ${isaret} ${gorev.baslik}`);
    });
};

const gorevTamamla = (index) => {
    if (!gorevler[index]) {
        console.log("böyle bir görev yok.");
        return;
    }
    gorevler[index].tamamlandi = true;
    console.log("tamamlandı olarak işaretlendi.");
};

const gorevSil = (index) => {
    if (!gorevler[index]) {
        console.log("böyle bir görev yok.");
        return;
    }
    gorevler.splice(index, 1);
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
        gorevEkle(baslik);
    } else if (secim === "2") {
        gorevleriListele();
    } else if (secim === "3") {
        const numara = await arayuz.question("kaç numaralı görev? ");
        gorevTamamla(Number(numara) - 1);
    } else if (secim === "4") {
        const numara = await arayuz.question("kaç numaralı görev silinsin? ");
        gorevSil(Number(numara) - 1);
    } else if (secim === "5") {
        calisiyor = false;
    } else {
        console.log("geçersiz seçim.");
    }
}

arayuz.close();
console.log("görüşürüz.");