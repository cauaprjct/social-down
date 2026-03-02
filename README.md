# SocialDown - Baixe Vídeos de Redes Sociais

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-python-3.12?style=for-the-badge&logo=python" alt="FastAPI">
  <img src="https://img.shields.io/badge/Platform-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render" alt="Render">
</p>

> Site para download de vídeos do TikTok, Instagram, YouTube e Facebook. Estilo ssstik.io, sssinstagram.com.

## 🌐 Demo ao Vivo

**Acesse agora:** [https://social-down.vercel.app/](https://social-down.vercel.app/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tech Stack](#tech-stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação Local](#instalação-local)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Backend (FastAPI)](#backend-fastapi)
- [Deploy](#deploy)
  - [Frontend na Vercel](#frontend-na-vercel)
  - [Backend no Railway](#backend-no-railway)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Conectando Frontend ↔ Backend](#conectando-frontend--backend)
- [Adicionar Novas Plataformas](#adicionar-novas-plataformas)
- [Licença](#licença)

## 🚀 Sobre o Projeto

SocialDown é uma aplicação web completa para download de vídeos de redes sociais. O projeto é dividido em:

- **Frontend**: Next.js 15 (App Router) - Interface moderna e responsiva
- **Backend**: FastAPI (Python 3.12) - API que processa os vídeos usando yt-dlp

## ✨ Funcionalidades

- ✅ Página inicial limpa e moderna
- ✅ Campo para colar link + botão "Baixar"
- ✅ Suporte automático para:
  - Instagram (Reels, Posts, Stories)
  - TikTok (sem marca d'água)
  - YouTube
  - Facebook
- ✅ Preview do vídeo (thumbnail, título)
- ✅ Múltiplas opções de download (qualidade, áudio)
- ✅ Download direto (links diretos do CDN)
- ✅ Tratamento de erro amigável
- ✅ Loading com animação
- ✅ Design responsivo (mobile first)
- ✅ Rate limiting (proteção contra abuso)

## 🛠 Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Sonner](https://sonner.emilkowal.ski/) (toasts)
- [Lucide React](https://lucide.dev/) (ícones)
- [Axios](https://axios-http.com/)

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [Pydantic v2](https://docs.pydantic.dev/)
- [Uvicorn](https://www.uvicorn.org/)
- [SlowAPI](https://github.com/laurentS/slowapi) (rate limiting)

## 📁 Estrutura do Projeto

```
social-down/
├── frontend/                 # Next.js 15
│   ├── app/
│   │   ├── globals.css      # Estilos globais + Tailwind
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página principal
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── vercel.json
│   └── .env.example
│
├── backend/                  # FastAPI
│   ├── main.py              # Aplicação principal
│   ├── schemas.py           # Schemas Pydantic
│   ├── requirements.txt     # Dependências Python
│   ├── routers/
│   │   ├── __init__.py
│   │   └── download.py     # Lógica de download
│   └── .env.example
│
└── README.md
```

## 💻 Instalação Local

### Pré-requisitos

- Node.js 18+
- Python 3.12+
- FFmpeg (para processamento de áudio)

---

### Frontend (Next.js)

1. **Navegue para o diretório do frontend:**
   ```bash
   cd social-down/frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` e configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse:** http://localhost:3000

---

### Backend (FastAPI)

1. **Navegue para o diretório do backend:**
   ```bash
   cd social-down/backend
   ```

2. **Crie um ambiente virtual (recomendado):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

5. **Instale FFmpeg:**
   - **Windows:** Baixe em https://ffmpeg.org/download.html e adicione ao PATH
   - **Mac:** `brew install ffmpeg`
   - **Linux:** `sudo apt install ffmpeg`

6. **Inicie o servidor:**
   ```bash
   # Modo desenvolvimento
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Ou diretamente
   python main.py
   ```

7. **Acesse a documentação API:** http://localhost:8000/docs

---

## 🚢 Deploy

### Frontend na Vercel

1. **Crie uma conta na [Vercel](https://vercel.com/)** (grátis)

2. **Conecte seu repositório GitHub:**
   - Vá para https://vercel.com/new
   - Importe seu repositório

3. **Configure as variáveis de ambiente:**
   - Adicione `NEXT_PUBLIC_API_URL` com a URL do seu backend
   
   Exemplo:
   ```
   NEXT_PUBLIC_API_URL=https://socialdown-api.railway.app
   ```

4. **Deploy automático:**
   - A Vercel detectará automaticamente o Next.js
   - Clique em "Deploy"

### Backend no Railway

1. **Crie [Railway](https://railway.app/)** uma conta no (grátis)

2. **Crie um novo projeto:**
   - Clique em "New Project"
   - Escolha "Deploy from repo" ou "Empty Project"

3. **Configure as variáveis de ambiente:**
   - Vá para "Variables" no painel do Railway
   - Adicione as variáveis do `.env.example`

4. **Deploy:**
   - Railway detectará automaticamente o Python
   - Make sure to set the start command:
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

5. **Instale FFmpeg no Railway:**
   - Vá para " Nixpacks" > "Nixpacks Configuration"
   - Ou use o plano Pro com FFmpeg pré-instalado

**Alternativa: Render.com**
- Similar ao Railway, mas com opção gratuita mais limitada
- Configure同样的 variáveis de ambiente

---

## 🔧 Variáveis de Ambiente

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
APP_NAME=SocialDown API
DEBUG=False
API_VERSION=v1
RATE_LIMIT_REQUESTS=10
```

---

## 🔗 Conectando Frontend ↔ Backend

1. **Deploy do Backend primeiro:**
   - Faça deploy no Railway/Render
   - Copie a URL (ex: `https://socialdown-api.railway.app`)

2. **Configure o Frontend:**
   - No Vercel, adicione a variável `NEXT_PUBLIC_API_URL`
   - Valor: URL do seu backend

3. **Teste a conexão:**
   - Acesse seu site na Vercel
   - Cole um link de vídeo
   - Deve funcionar!

---

## 🆕 Adicionar Novas Plataformas

O yt-dlp já suporta centenas de plataformas. Para adicionar suporte:

1. **Edite `routers/download.py`:**

```python
def detect_platform(url: str) -> str:
    url = url.lower()
    
    # Adicione nova plataforma aqui
    if "twitter.com" in url or "x.com" in url:
        return "Twitter"
    if "threads.net" in url:
        return "Threads"
    # ... outras plataformas
    
    return "Desconhecido"
```

2. **O yt-dlp automaticamente detectará os formatos disponíveis**

3. **Teste localmente antes de fazer deploy**

---

## 📄 Licença

Este projeto é apenas para fins educacionais. Respeite os direitos autorais dos criadores de conteúdo.

---

<p align="center">Feito com ❤️ por SocialDown</p>
