"""
SocialDown Backend - FastAPI
=============================

API para download de vídeos de redes sociais.
Suporta: Instagram, TikTok, YouTube, Facebook

Autor: SocialDown
Versão: 1.0.0
"""

import os
import re
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl, field_validator
from pydantic_settings import BaseSettings
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Importar routers
from routers import download

# ============================================
# CONFIGURAÇÕES
# ============================================

class Settings(BaseSettings):
    """Configurações da aplicação"""
    app_name: str = "SocialDown API"
    debug: bool = False
    api_version: str = "v1"
    
    # CORS - Configure para produção
    cors_origins: List[str] = ["*"]  # Permitir requisições de origens variadas (como a Vercel)
    
    # Rate limiting
    rate_limit_requests: int = 10
    rate_limit_window: int = 60  # segundos
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Configurar logging
# Em produção (Render), usar /tmp para logs
log_dir = "/tmp/logs" if os.getenv("RENDER") else "logs"
os.makedirs(log_dir, exist_ok=True)

logger.add(
    f"{log_dir}/app.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO"
)

# ============================================
# RATE LIMITING
# ============================================

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    logger.info(f"Iniciando {settings.app_name}...")
    
    yield
    
    logger.info("Encerrando aplicação...")


# ============================================
# APLICAÇÃO FASTAPI
# ============================================

app = FastAPI(
    title=settings.app_name,
    description="API para download de vídeos de redes sociais",
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configurar rate limiting
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Tratamento de erros de rate limiting"""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Muitas requisições. Tente novamente mais tarde.",
            "retry_after": exc.detail,
        }
    )


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(download.router, prefix="/api/v1", tags=["Download"])


# ============================================
# ROTAS
# ============================================

@app.get("/")
async def root():
    """Rota raiz - informações da API"""
    return {
        "name": settings.app_name,
        "version": settings.api_version,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "service": settings.app_name,
    }


# ============================================
# EXECUTAR SERVIDOR
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
    )
