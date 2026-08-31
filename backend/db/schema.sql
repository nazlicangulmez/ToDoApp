CREATE TABLE gorevler (
  id SERIAL PRIMARY KEY,
  baslik VARCHAR(255) NOT NULL,
  durum VARCHAR(20) DEFAULT 'bekliyor'
);


