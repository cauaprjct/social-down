@echo off
echo ============================================
echo   SocialDown - Script de Inicialização
echo ============================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python não encontrado. Instale Python 3.12+
    pause
    exit /b 1
)

echo [1/4] Verificando Python... OK

REM Verificar se está no diretório correto
if not exist "main.py" (
    echo [ERRO] Execute este script dentro da pasta backend
    pause
    exit /b 1
)

echo [2/4] Criando ambiente virtual...
if not exist "venv" (
    python -m venv venv
)

echo [3/4] Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo [4/4] Instalando dependências...
pip install -r requirements.txt >nul 2>&1

echo.
echo ============================================
echo   Instalação concluída!
echo ============================================
echo.
echo Para iniciar o backend, execute:
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo O backend estará disponível em: http://localhost:8000
echo Documentação da API: http://localhost:8000/docs
echo.
pause
