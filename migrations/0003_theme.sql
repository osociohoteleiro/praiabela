-- Tema/paleta de cores do site, editável pelo painel admin (aba "Aparência").
-- INSERT OR IGNORE: só cria o valor padrão se ainda não existir, preservando
-- qualquer personalização já salva (seguro para rodar no banco remoto).
INSERT OR IGNORE INTO settings (key, value) VALUES
('theme', json('{
  "brand": "#2f8f63",
  "brandDark": "#246b4a",
  "brandLight": "#e6f1ea",
  "ink": "#1f3b30",
  "eyebrow": "#2f8f63"
}'));
