CREATE TABLE gorevler (
  id SERIAL PRIMARY KEY,
  baslik VARCHAR(255) NOT NULL,
  tamamlandi BOOLEAN DEFAULT false
);

INSERT INTO gorevler (baslik) VALUES ('alışveriş yap');
SELECT * FROM gorevler;
UPDATE gorevler SET tamamlandi = true WHERE id = 1;
DELETE FROM gorevler WHERE id = 1;

