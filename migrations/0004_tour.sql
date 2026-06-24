-- Tour Virtual 360° (TourMaker), editável pelo painel admin (aba "Tour Virtual 360°").
-- INSERT OR IGNORE: só cria o valor padrão se ainda não existir (seguro no remoto).
INSERT OR IGNORE INTO settings (key, value) VALUES
('tour', json('{
  "enabled": true,
  "eyebrow": "EXPLORE A POUSADA",
  "title": "Tour Virtual 360°",
  "subtitle": "Passeie pela Pousada Praia Bela como se estivesse aqui. Arraste para girar e explore cada ambiente.",
  "url": "https://tourmkr.com/F1biwwjN1X/46253449p&346.86h&78.42t&autorotate=true"
}'));
