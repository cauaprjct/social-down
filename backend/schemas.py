"""
Schemas Pydantic - Validação de Dados
=====================================

Define os schemas de requisição e resposta da API.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, HttpUrl, field_validator


# ============================================
# SCHEMAS DE REQUISIÇÃO
# ============================================

class DownloadRequest(BaseModel):
    """
    Schema para requisição de download de vídeo
    """
    url: str
    
    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Valida se a URL é de uma plataforma suportada"""
        if not v:
            raise ValueError("URL não pode estar vazia")
        
        # Remover espaços em branco
        v = v.strip()
        
        # Validar formato básico de URL
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL deve começar com http:// ou https://")
        
        return v


# ============================================
# SCHEMAS DE RESPOSTA
# ============================================

class VideoFormat(BaseModel):
    """
    Schema para formato de vídeo disponível
    """
    quality: str
    url: str
    type: Literal["video", "audio"]
    extension: str
    file_size: Optional[str] = None


class VideoInfo(BaseModel):
    """
    Schema para informações do vídeo
    """
    title: str
    thumbnail: str
    author: str
    platform: str
    duration: Optional[str] = None
    formats: List[VideoFormat]


class ErrorResponse(BaseModel):
    """
    Schema para resposta de erro
    """
    detail: str
    code: Optional[str] = None


class HealthResponse(BaseModel):
    """
    Schema para verificação de saúde
    """
    status: str
    service: str
