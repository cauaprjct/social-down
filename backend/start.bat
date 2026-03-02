@echo off
echo Iniciando SocialDown Backend...
cd /d "%~dp0"
call venv\Scripts\activate.bat
uvicorn main:app --reload --host 0.0.0.0 --port 8000
