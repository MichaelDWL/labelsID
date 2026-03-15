# LabelsID

**Gerador de Etiquetas Automático** — crie etiquetas padronizadas em segundos a partir de uma planilha Excel.

---

## 🔗 Link do projeto

> **Em produção:** [Adicione aqui o link após o deploy](#)

---

## 📸 Screenshots

### Tela inicial — Seleção do modelo de etiqueta

![Tela inicial - modelos de etiqueta](./assets/screenshot-home.png.png)

### Upload de planilha e logos

![Upload - planilha e logos](./assets/screenshot-upload.png.png)

### Pré-visualização e geração do PDF

![Pré-visualização A4](./assets/screenshot-preview.png.png)

---

## Sobre o projeto

O **LabelsID** é uma aplicação web que gera etiquetas em PDF a partir de um arquivo Excel. Você escolhe o tamanho da etiqueta, opcionalmente envia até duas logos em PNG e seleciona a planilha; cada linha vira uma etiqueta. O PDF é gerado no formato A4, pronto para impressão.

### Funcionalidades

- **Três modelos de etiqueta**
  - **Pequena:** 4,5 × 1,5 cm — ideal para bins menores
  - **Média:** 6,5 × 2 cm — bins médios e identificações
  - **Grande (Placa):** 18 × 7 cm — placas e avisos

- **Upload de logos** — até 2 imagens PNG por etiqueta (com tamanhos recomendados por modelo)

- **Planilha Excel** — uma linha = uma etiqueta; várias colunas são unidas com " - "

- **Pré-visualização em A4** — visualize como as etiquetas ficarão antes de gerar o PDF

- **Documentação** — página com instruções de uso, formato da planilha e especificações das imagens

### Tecnologias

- HTML5, CSS3, JavaScript
- [SheetJS (xlsx)](https://sheetjs.com/) — leitura de arquivos Excel
- [html2canvas](https://html2canvas.hertzen.com/) — captura das etiquetas para o PDF
- [jsPDF](https://github.com/parallax/jsPDF) — geração do PDF

---

## Como rodar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/labelsID.git
   cd labelsID
   ```

2. Sirva os arquivos com um servidor local (por exemplo):

   ```bash
   npx serve .
   ```

   Ou abra o `index.html` diretamente no navegador (algumas funcionalidades podem depender de um servidor por causa de CORS/arquivos).

3. Acesse no navegador: `http://localhost:3000` (ou a porta que o `serve` indicar).

---

## Documentação

A documentação de uso está na própria aplicação, no menu **Doc**, e inclui:

- Passo a passo de como usar
- Modelos de etiqueta e dimensões
- Como preparar a planilha Excel
- Especificações das logos (formato PNG e tamanhos recomendados: 60×60 px, 80×80 px, 150×80 px)
- Dicas de uso

---

## Estrutura do projeto

```
labelsID/
├── index.html          # Página principal (gerador de etiquetas)
├── doc.html            # Página de documentação
├── js/
│   └── script.js       # Lógica de upload, renderização e PDF
├── style/
│   ├── style.css       # Entrada principal de estilos
│   ├── global/         # Header, footer, global
│   ├── home/           # Estilos da home/upload
│   ├── docs/           # Estilos da documentação
│   └── util/           # Cores, tipografia, botões, etc.
├── assets/             # Logo e screenshots
└── docs/               # Documentação e página de licença
```

---

## Autor

**Michael Douglas**  
[LinkedIn](https://www.linkedin.com/in/michaeldwl) · [GitHub](https://www.github.com/michaeldwl)

---

## Licença

Este projeto é **gratuito para estudo e uso pessoal**. Uso comercial não é permitido — ninguém pode ganhar dinheiro com este software sem autorização. Veja a [página de licença](docs/license.html) ou o arquivo [LICENSE](LICENSE) para os termos completos.
