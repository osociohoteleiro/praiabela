-- Adiciona descrição detalhada às comodidades (exibida em popup flutuante no site).
ALTER TABLE amenities ADD COLUMN description TEXT NOT NULL DEFAULT '';
