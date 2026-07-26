# LF Games — Vitrine Online

Site público de catálogo da LF Games. Não é uma loja com checkout: cada produto tem botões que direcionam o pedido para o **WhatsApp** e, quando cadastrado, para o **Mercado Livre**.

Os produtos vêm em tempo real do mesmo Firebase usado no ERP (`lf-games-app`) — cadastre o produto uma vez no sistema de gestão e ele aparece aqui automaticamente.

## Antes de publicar, edite em `src/App.jsx`:
- `WHATSAPP_NUMERO` — já preenchido com (15) 99813-4273
- `INSTAGRAM_USUARIO` — **trocar pelo @ real do Instagram** (está como placeholder "lfgames")
- `ENDERECO_TEXTO` / `ENDERECO_MAPA_QUERY` — endereço mostrado no rodapé/mapa

## Rodando localmente
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
