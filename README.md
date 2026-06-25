# Quiz Funil — Servo Fiel

Landing page com funil de quiz para venda do curso online **Servo Fiel**, direcionado a **Pregadores** e **Servos de Deus**.

## Estrutura do funil

1. **Quiz** — 3 perguntas com segmentação em 2 trilhas (Pregador / Servo)
2. **Resultado** — 6 páginas personalizadas conforme a dor identificada
3. **Ponte** — Transição emocional antes da oferta
4. **Venda** — Página única com módulos, depoimentos, objeções e checkout

## Como visualizar

Abra o arquivo `index.html` no navegador ou use um servidor local:

```bash
npx serve .
```

## Personalização

- **Checkout**: edite o clique do botão em `js/app.js` (`#btnCheckout`) e aponte para sua URL da Hotmart, Kiwify, etc.
- **Preço e nome do curso**: edite a seção `.offer` em `index.html`
- **Vídeo da ponte**: substitua o placeholder em `#step-bridge` por um `<iframe>` do YouTube/Vimeo
- **Depoimentos**: substitua os textos de exemplo pelos depoimentos reais dos alunos
