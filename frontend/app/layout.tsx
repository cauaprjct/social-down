import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

/**
 * Metadata padrão para o site SocialDown
 * Otimizado para SEO
 */
export const metadata: Metadata = {
  title: "SocialDown - Baixe Vídeos do TikTok, Instagram, YouTube e Facebook",
  description: "Baixe vídeos de redes sociais gratuitamente. Suporte para TikTok, Instagram Reels, YouTube, Facebook e mais. Download sem marca d'água.",
  keywords: ["download TikTok", "download Instagram", "download YouTube", "download Facebook", "video downloader", "ssstik", "sss instagram"],
  authors: [{ name: "SocialDown" }],
  openGraph: {
    title: "SocialDown - Baixe Vídeos de Redes Sociais",
    description: "Baixe vídeos do TikTok, Instagram, YouTube e Facebook gratuitamente",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialDown - Baixe Vídeos de Redes Sociais",
    description: "Baixe vídeos do TikTok, Instagram, YouTube e Facebook gratuitamente",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Componente RootLayout
 * Define a estrutura base da aplicação com header e footer
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {/* Header simples */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-text-primary">SocialDown</span>
              </div>
              
              {/* Links de navegação (opcional) */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                  Como usar
                </a>
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                  FAQ
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="pt-16">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-text-muted text-sm">
              <p>© {new Date().getFullYear()} SocialDown. Todos os direitos reservados.</p>
              <p className="mt-2">
                Este serviço é apenas para fins educacionais. Respeite os direitos autorais.
              </p>
            </div>
          </div>
        </footer>

        {/* Toast notifications */}
        <Toaster 
          position="bottom-center"
          richColors
          toastOptions={{
            style: {
              background: '#242424',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
