"""
Router de Download - Lógica Principal
======================================

Gerencia o download de vídeos usando yt-dlp.
"""

import json
from typing import List, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from loguru import logger
import yt_dlp

from schemas import DownloadRequest, VideoInfo, VideoFormat

# Criar router
router = APIRouter()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


# ============================================
# DETECTOR DE PLATAFORMA
# ============================================

def detect_platform(url: str) -> str:
    """
    Detecta qual plataforma de vídeo baseada na URL
    
    Args:
        url: URL do vídeo
        
    Returns:
        Nome da plataforma
    """
    url = url.lower()
    
    if "instagram.com" in url:
        return "Instagram"
    elif "tiktok.com" in url:
        return "TikTok"
    elif "youtube.com" in url or "youtu.be" in url:
        return "YouTube"
    elif "facebook.com" in url or "fb.watch" in url:
        return "Facebook"
    else:
        return "Desconhecido"


def format_filesize(size_bytes: int) -> str:
    """
    Formata o tamanho do arquivo em formato legível
    
    Args:
        size_bytes: Tamanho em bytes
        
    Returns:
        String formatada (ex: "10.5 MB")
    """
    if not size_bytes:
        return "Desconhecido"
    
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    
    return f"{size_bytes:.1f} TB"


# ============================================
# OPÇÕES DO YT-DLP
# ============================================

def get_ydl_options() -> dict:
    """
    Retorna as opções padrão do yt-dlp
    O yt-dlp já detecta automaticamente a plataforma e aplica as melhores opções.
    """
    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        # Usar extractors específicos por plataforma
        "extractor_retries": 3,
        "fragment_retries": 3,
        # Não baixar arquivos, apenas obter informações
        "skip_download": True,
        # Ignorar erros de protocolo
        "ignoreerrors": False,
        # Não abortar em erros
        "nocheckcertificate": True,
    }
    
    return opts


# ============================================
# ROTA DE DOWNLOAD
# ============================================

@router.post("/download", response_model=VideoInfo)
@limiter.limit("10/minute")
async def download_video(request: Request, download_request: DownloadRequest):
    """
    Obtém informações do vídeo e formatos disponíveis para download
    
    Args:
        request: Objeto Request do FastAPI
        download_request: URL do vídeo
        
    Returns:
        VideoInfo com thumbnail, título e formatos disponíveis
    """
    url = download_request.url.strip()
    platform = detect_platform(url)
    
    logger.info(f"Processando vídeo: {url} (Plataforma: {platform})")
    
    # Validar plataforma suportada
    if platform == "Desconhecido":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plataforma não suportada. Use: Instagram, TikTok, YouTube ou Facebook"
        )
    
    try:
        # Opções do yt-dlp
        ydl_opts = get_ydl_options()
        
        # Executar yt-dlp
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extrair informações do vídeo
            # download=False é CRUCIAL para apenas obter metadados
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Não foi possível obter informações do vídeo"
                )
            
            # IMPORTANTE: Sanitizar info para JSON serialization
            # Isso remove objetos não-serializáveis
            info = ydl.sanitize_info(info)
            
            # Obter dados básicos
            title = info.get("title", "Vídeo sem título")
            thumbnail = info.get("thumbnail", "")
            author = info.get("uploader", info.get("channel", ""))
            
            # Duração
            duration = info.get("duration")
            duration_str = None
            if duration:
                minutes = int(duration // 60)
                seconds = int(duration % 60)
                duration_str = f"{minutes}:{seconds:02d}"
            
            # Processar formatos disponíveis
            formats: List[VideoFormat] = []
            
            # Obter formatos do vídeo
            video_formats = info.get("formats", [])
            
            if not video_formats:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Não foram encontrados formatos disponíveis para este vídeo"
                )
            
            # Filtrar e processar formatos de vídeo
            seen_qualities = set()
            
            for fmt in video_formats:
                # Ignorar formatos sem URL
                url_value = fmt.get("url")
                if not url_value:
                    continue
                
                # Obter resolução e extensão
                resolution = fmt.get("resolution", "")
                ext = fmt.get("ext", "mp4")
                filesize = fmt.get("filesize") or fmt.get("filesize_approx")
                
                # Ignorar apenas áudio (formato sem vídeo)
                if resolution == "audio only":
                    continue
                
                # Se não tem resolução mas tem codec de vídeo, é um formato válido
                if not resolution and fmt.get("vcodec") and fmt.get("vcodec") != "none":
                    resolution = fmt.get("format", "Desconhecida")
                
                if not resolution:
                    resolution = "Qualidade disponível"
                
                # Criar identificador de qualidade único
                quality_key = f"{resolution}_{ext}"
                
                # Evitar duplicatas
                if quality_key in seen_qualities:
                    continue
                seen_qualities.add(quality_key)
                
                # Criar formato
                video_format = VideoFormat(
                    quality=resolution,
                    url=url_value,
                    type="video",
                    extension=ext,
                    file_size=format_filesize(filesize) if filesize else None
                )
                formats.append(video_format)
            
            # Tentar adicionar formato de áudio separado
            # Procurar formatos que são apenas áudio
            for fmt in video_formats:
                url_value = fmt.get("url")
                if not url_value:
                    continue
                
                # Verificar se é apenas áudio
                if fmt.get("acodec") and fmt.get("acodec") != "none":
                    # Verificar se não tem vídeo
                    if fmt.get("vcodec") == "none" or not fmt.get("vcodec"):
                        # Verificar se já não existe
                        if not any(f.type == "audio" for f in formats):
                            audio_ext = fmt.get("ext", "m4a")
                            audio_filesize = fmt.get("filesize") or fmt.get("filesize_approx")
                            
                            formats.append(VideoFormat(
                                quality="Áudio MP3",
                                url=url_value,
                                type="audio",
                                extension=audio_ext,
                                file_size=format_filesize(audio_filesize) if audio_filesize else None
                            ))
                        break
            
            # Se ainda não tem formatos, usar fallback
            if not formats and video_formats:
                for fmt in reversed(video_formats):
                    if fmt.get("url"):
                        formats.append(VideoFormat(
                            quality="Melhor disponível",
                            url=fmt["url"],
                            type="video",
                            extension=fmt.get("ext", "mp4"),
                            file_size=None
                        ))
                        break
            
            logger.info(f"Vídeo processado: {title} - {len(formats)} formatos disponíveis")
            
            # Retornar informações
            return VideoInfo(
                title=title,
                thumbnail=thumbnail,
                author=author,
                platform=platform,
                duration=duration_str,
                formats=formats
            )
    
    except yt_dlp.DownloadError as e:
        logger.error(f"Erro ao baixar vídeo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Erro ao processar vídeo: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        )
