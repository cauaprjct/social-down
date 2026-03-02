"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Link2, 
  Download, 
  Loader2, 
  Play, 
  Music, 
  Video, 
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink
} from "lucide-react";
import axios from "axios";

// ============================================
// SCHEMAS E TIPOS
// ============================================

/**
 * Schema de validação do formulário usando Zod
 * Valida se o URL é de uma plataforma suportada
 */
const downloadFormSchema = z.object({
  url: z
    .string()
    .min(1, "Por favor, cole um link válido")
    .refine(
      (url) => {
        const supportedPlatforms = [
          "instagram.com",
          "tiktok.com",
          "youtube.com",
          "youtu.be",
          "facebook.com",
          "fb.watch",
        ];
        return supportedPlatforms.some((platform) => url.includes(platform));
      },
      {
        message: "Plataforma não suportada. Use: Instagram, TikTok, YouTube ou Facebook",
      }
    ),
});

type DownloadFormData = z.infer<typeof downloadFormSchema>;

/**
 * Interface para os formatos de download retornados pela API
 */
interface VideoFormat {
  quality: string;
  url: string;
  type: "video" | "audio";
  extension: string;
  file_size?: string;
}

/**
 * Interface para a resposta da API
 */
interface VideoInfo {
  title: string;
  thumbnail: string;
  author: string;
  platform: string;
  duration?: string;
  formats: VideoFormat[];
}

// ============================================
// COMPONENTES UI
// ============================================

/**
 * Componente de Input com ícone
 */
function InputWithIcon({ 
  icon: Icon, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
  return (
    <div className="input-container">
      <Icon className="input-icon w-5 h-5" />
      <input {...props} className="input-field" />
    </div>
  );
}

/**
 * Componente de Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="result-card">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail skeleton */}
        <div className="w-full md:w-auto">
          <div className="video-thumbnail loading-pulse bg-bg-card" />
        </div>
        
        {/* Info skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-6 w-3/4 loading-pulse bg-bg-card rounded" />
          <div className="h-4 w-1/2 loading-pulse bg-bg-card rounded" />
          
          {/* Buttons skeleton */}
          <div className="space-y-2 mt-6">
            <div className="h-14 loading-pulse bg-bg-card rounded-lg" />
            <div className="h-14 loading-pulse bg-bg-card rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Card de Resultado
 */
function ResultCard({ 
  videoInfo, 
  onReset 
}: { 
  videoInfo: VideoInfo;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (url: string, quality: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(quality);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "📸";
      case "tiktok":
        return "🎵";
      case "youtube":
        return "▶️";
      case "facebook":
        return "📘";
      default:
        return "📹";
    }
  };

  return (
    <div className="result-card">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        <div className="w-full md:w-auto shrink-0">
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="video-thumbnail"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                <span>{getPlatformIcon(videoInfo.platform)}</span>
                <span>{videoInfo.platform}</span>
                {videoInfo.author && (
                  <>
                    <span>•</span>
                    <span>{videoInfo.author}</span>
                  </>
                )}
              </div>
              <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
                {videoInfo.title}
              </h3>
            </div>
            <button
              onClick={onReset}
              className="shrink-0 p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              aria-label="Novo download"
            >
              <AlertCircle className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {/* Download Options */}
          <div className="mt-6 space-y-3">
            <p className="text-text-secondary text-sm font-medium">
              Escolha a qualidade:
            </p>

            {/* Video Formats */}
            {videoInfo.formats
              .filter((f) => f.type === "video")
              .map((format, index) => (
                <a
                  key={`video-${index}`}
                  href={format.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn group"
                >
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-primary-light" />
                    <div className="text-left">
                      <span className="font-medium">{format.quality}</span>
                      {format.file_size && (
                        <span className="text-text-muted text-sm ml-2">
                          • {format.file_size}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {copied === format.quality ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-green" />
                    ) : (
                      <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <Download className="w-5 h-5" />
                  </div>
                </a>
              ))}

            {/* Audio Format */}
            {videoInfo.formats.some((f) => f.type === "audio") && (
              <a
                href={videoInfo.formats.find((f) => f.type === "audio")?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn download-btn-audio group"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5" />
                  <div className="text-left">
                    <span className="font-medium">Áudio MP3</span>
                    {videoInfo.formats.find((f) => f.type === "audio")?.file_size && (
                      <span className="text-white/70 text-sm ml-2">
                        • {videoInfo.formats.find((f) => f.type === "audio")?.file_size}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                </div>
              </a>
            )}
          </div>

          {/* Info Text */}
          <p className="text-text-muted text-xs mt-4">
            💡 Dica: Clique no botão para baixar diretamente ou copie o link para compartilhar
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Página principal do SocialDown
 * Permite ao usuário colar um URL e baixar vídeos
 */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DownloadFormData>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: {
      url: "",
    },
  });

  // URL da API - Configure via variável de ambiente
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  /**
   * Função chamada quando o formulário é submetido
   * Envia o URL para a API e obtém as informações do vídeo
   */
  const onSubmit = async (data: DownloadFormData) => {
    setIsLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await axios.post<VideoInfo>(
        `${API_URL}/api/v1/download`,
        { url: data.url },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minutos de timeout
        }
      );

      if (response.data) {
        setVideoInfo(response.data);
        toast.success("Vídeo encontrado! Escolha a qualidade para baixar.");
      }
    } catch (err) {
      // Tratamento de erros
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Erro retornado pelo servidor
          const errorMessage = err.response.data?.detail || 
            err.response.data?.message || 
            "Erro ao processar o vídeo";
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (err.request) {
          // Erro de conexão
          setError("Não foi possível conectar ao servidor. Tente novamente.");
          toast.error("Erro de conexão. O servidor está disponível?");
        } else {
          // Erro na requisição
          setError("Erro ao processar a requisição");
          toast.error("Erro ao processar a requisição");
        }
      } else {
        setError("Erro desconhecido. Tente novamente.");
        toast.error("Erro desconhecido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para limpar o estado e permitir novo download
   */
  const handleReset = () => {
    setVideoInfo(null);
    setError(null);
    reset();
  };

  return (
    <div className="hero-section">
      {/* Logo e Título Principal */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">SocialDown</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-xl">
          Baixe vídeos do TikTok, Instagram, YouTube e Facebook gratuitamente
        </p>
      </div>

      {/* Plataformas Suportadas */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-text-muted text-sm">
        <span className="flex items-center gap-1">
          <span>📸</span> Instagram
        </span>
        <span className="flex items-center gap-1">
          <span>🎵</span> TikTok
        </span>
        <span className="flex items-center gap-1">
          <span>▶️</span> YouTube
        </span>
        <span className="flex items-center gap-1">
          <span>📘</span> Facebook
        </span>
      </div>

      {/* Formulário de Download */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <InputWithIcon
            icon={Link2}
            type="url"
            placeholder="Cole o link do vídeo aqui..."
            disabled={isLoading}
            {...register("url")}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Baixar
              </>
            )}
          </button>
        </div>

        {/* Erro de validação */}
        {errors.url && (
          <p className="text-accent-red text-sm mt-2 text-center">
            {errors.url.message}
          </p>
        )}
      </form>

      {/* Estado de Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Erro da API */}
      {error && !isLoading && (
        <div className="result-card border-accent-red/30">
          <div className="flex items-center gap-3 text-accent-red">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">Erro ao processar vídeo</p>
              <p className="text-text-muted text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 text-primary hover:underline text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Resultado do Download */}
      {videoInfo && !isLoading && (
        <ResultCard videoInfo={videoInfo} onReset={handleReset} />
      )}

      {/* Instruções */}
      {!videoInfo && !isLoading && !error && (
        <div className="mt-12 text-center text-text-muted text-sm max-w-lg">
          <p className="mb-4">Como usar:</p>
          <ol className="text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Copie o link do vídeo que deseja baixar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Cole o link no campo acima
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Escolha a qualidade e baixe o vídeo
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
