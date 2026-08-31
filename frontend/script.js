const API = "http://localhost:3000";

const input = document.querySelector('#yeni-gorev');
const ekleBtn = document.querySelector('#ekle-btn');
const temaBtn = document.querySelector('#tema-btn');
const temaIkon = document.querySelector('#tema-ikon');

const listeler = {
  bekliyor: document.querySelector('#liste-bekliyor'),
  devam: document.querySelector('#liste-devam'),
  bitti: document.querySelector('#liste-bitti'),
};
const sayaclar = {
  bekliyor: document.querySelector('#sayac-bekliyor'),
  devam: document.querySelector('#sayac-devam'),
  bitti: document.querySelector('#sayac-bitti'),
};

const SIRA = ['bekliyor', 'devam', 'bitti'];

async function gorevleriYukle() {
  const yanit = await fetch(`${API}/gorevler`);
  const gorevler = await yanit.json();
  panoyuCiz(gorevler);
}

async function durumDegistir(id, yeniDurum) {
  await fetch(`${API}/gorevler/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ durum: yeniDurum }),
  });
  await gorevleriYukle();
}

function panoyuCiz(gorevler) {
  listeler.bekliyor.innerHTML = '';
  listeler.devam.innerHTML = '';
  listeler.bitti.innerHTML = '';

  const sayim = { bekliyor: 0, devam: 0, bitti: 0 };

  gorevler.forEach((gorev) => {
    sayim[gorev.durum]++;

    const kart = document.createElement('div');
    kart.className = 'kart';
    kart.dataset.durum = gorev.durum;

    const p = document.createElement('p');
    p.textContent = gorev.baslik;
    kart.appendChild(p);

    const aksiyonlar = document.createElement('div');
    aksiyonlar.className = 'kart-aksiyonlar';

    const suankiIndex = SIRA.indexOf(gorev.durum);

    if (suankiIndex > 0) {
      const geriBtn = document.createElement('button');
      geriBtn.textContent = '←';
      geriBtn.title = 'Önceki duruma al';
      geriBtn.addEventListener('click', () => {
        durumDegistir(gorev.id, SIRA[suankiIndex - 1]);
      });
      aksiyonlar.appendChild(geriBtn);
    }

    if (suankiIndex < SIRA.length - 1) {
      const ileriBtn = document.createElement('button');
      ileriBtn.textContent = '→';
      ileriBtn.title = 'Sonraki duruma al';
      ileriBtn.addEventListener('click', () => {
        durumDegistir(gorev.id, SIRA[suankiIndex + 1]);
      });
      aksiyonlar.appendChild(ileriBtn);
    }

    const silBtn = document.createElement('button');
    silBtn.className = 'sil-btn';
    silBtn.textContent = '✕';
    silBtn.title = 'Sil';
    silBtn.addEventListener('click', async () => {
      await fetch(`${API}/gorevler/${gorev.id}`, { method: 'DELETE' });
      await gorevleriYukle();
    });
    aksiyonlar.appendChild(silBtn);

    kart.appendChild(aksiyonlar);
    listeler[gorev.durum].appendChild(kart);
  });

  sayaclar.bekliyor.textContent = sayim.bekliyor;
  sayaclar.devam.textContent = sayim.devam;
  sayaclar.bitti.textContent = sayim.bitti;
}


async function gorevEkle() {
  const baslik = input.value.trim();
  if (baslik === '') return;

  await fetch(`${API}/gorevler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baslik: baslik }),
  });

  input.value = '';
  input.focus();
  await gorevleriYukle();
}

ekleBtn.addEventListener('click', gorevEkle);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gorevEkle();
});

let karanlikMi = false;

function temayiUygula() {
  document.body.classList.toggle('karanlik', karanlikMi);
  temaIkon.innerHTML = karanlikMi
      ? '<path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z"></path>'
      : `<circle cx="12" cy="12" r="4"></circle>
       <line x1="12" y1="1.5" x2="12" y2="4"></line>
       <line x1="12" y1="20" x2="12" y2="22.5"></line>
       <line x1="4.2" y1="4.2" x2="6" y2="6"></line>
       <line x1="18" y1="18" x2="19.8" y2="19.8"></line>
       <line x1="1.5" y1="12" x2="4" y2="12"></line>
       <line x1="20" y1="12" x2="22.5" y2="12"></line>
       <line x1="4.2" y1="19.8" x2="6" y2="18"></line>
       <line x1="18" y1="6" x2="19.8" y2="4.2"></line>`;
}

temaBtn.addEventListener('click', () => {
  karanlikMi = !karanlikMi;
  temayiUygula();
});

gorevleriYukle();