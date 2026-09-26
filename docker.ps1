# ==============================================================================
# Inicio rapido de Docker - Sistema de Proyeccion Social UNIMINUTO
#
#   .\docker.ps1              Levanta todo (build + up)
#   .\docker.ps1 logs        Sigue los logs de todos los servicios
#   .\docker.ps1 seed         Carga datos de prueba en la BD
#   .\docker.ps1 superuser    Crea un superusuario de Django
#   .\docker.ps1 migrate      Aplica migraciones pendientes
#   .\docker.ps1 shell        Abre una shell en el contenedor del backend
#   .\docker.ps1 psql         Abre psql en el contenedor de la BD
#   .\docker.ps1 ps           Estado de los contenedores
#   .\docker.ps1 down         Detiene todo (conserva los datos)
#   .\docker.ps1 clean        Detiene todo y BORRA los volumenes (datos)
# ==============================================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet('up', 'down', 'logs', 'ps', 'build', 'seed', 'migrate',
        'superuser', 'shell', 'psql', 'clean', 'restart')]
    [string]$Command = 'up'
)

$ErrorActionPreference = 'Continue'
$RAIZ = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($n, $msg) { Write-Host "[$n] $msg" -ForegroundColor Yellow }
function Write-Ok($msg) { Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  ERR $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SISTEMA DE PROYECCION SOCIAL UNIMINUTO" -ForegroundColor Cyan
Write-Host " Docker - modo desarrollo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Prerrequisitos -----------------------------------------------------------
Write-Step "1/3" "Verificando Docker..."
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Fail "Docker no esta instalado. Descargalo de https://www.docker.com/"
    exit 1
}

# Se prefiere el plugin v2: `docker compose` (no `docker-compose`, que ya no se instala).
& docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "El plugin 'docker compose' no esta disponible. Actualiza Docker Desktop."
    exit 1
}
Write-Ok "Docker $((& docker --version) -join ' ')"

try { & docker info *> $null } catch {
    Write-Fail "El demonio de Docker no esta corriendo. Abre Docker Desktop."
    exit 1
}
if ($LASTEXITCODE -ne 0) {
    Write-Fail "El demonio de Docker no esta corriendo. Abre Docker Desktop."
    exit 1
}

# --- Archivo .env -------------------------------------------------------------
Write-Step "2/3" "Configurando archivo .env..."
if (Test-Path (Join-Path $RAIZ ".env")) {
    Write-Ok ".env ya existe"
}
elseif (Test-Path (Join-Path $RAIZ ".env.example")) {
    Copy-Item (Join-Path $RAIZ ".env.example") (Join-Path $RAIZ ".env")
    Write-Ok ".env creado desde .env.example"
}
else {
    Write-Fail "No se encontro .env ni .env.example"
    exit 1
}

# --- Ejecucion ----------------------------------------------------------------
function Invoke-Compose {
    & docker compose --project-directory $RAIZ @args
}

Write-Step "3/3" "Ejecutando: docker compose $Command"
Write-Host ""

switch ($Command) {
    'up' {
        # -d (detached): el script termina y deja el stack corriendo.
        # Para seguir los logs en vivo usa: .\docker.ps1 logs
        Invoke-Compose up --build -d
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host(" Contenedores levantados") -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host " Frontend (Vite):  http://localhost:5173" -ForegroundColor White
        Write-Host " Django Admin:     http://localhost:8080/admin/" -ForegroundColor White
        Write-Host " API publica:      http://localhost:8080/api/publicaciones/publicas/" -ForegroundColor White
        Write-Host " PostgreSQL:       localhost:5432" -ForegroundColor White
        Write-Host ""
        Write-Host " Comandos utiles:" -ForegroundColor Cyan
        Write-Host "   .\docker.ps1 logs        Ver logs en vivo" -ForegroundColor White
        Write-Host "   .\docker.ps1 seed        Cargar datos de prueba" -ForegroundColor White
        Write-Host "   .\docker.ps1 superuser   Crear superusuario" -ForegroundColor White
        Write-Host "   .\docker.ps1 down        Detener (conserva datos)" -ForegroundColor White
        Write-Host "   .\docker.ps1 clean       Detener y borrar datos" -ForegroundColor White
        Write-Host ""
    }
    'down'   { Invoke-Compose down }
    'clean'  { Invoke-Compose down -v }
    'restart' { Invoke-Compose restart }
    'logs'   { Invoke-Compose logs -f }
    'ps'     { Invoke-Compose ps }
    'build'  { Invoke-Compose build }
    'seed' {
        # seed_demo.py requiere que exista el superusuario 'admin'; en una BD
        # nueva todavia no existe, asi que se crea antes de sembrar.
        # El script viaja por stdin: pasar multilinea con `python -c` rompe el
        # escapado de comillas entre PowerShell y el contenedor.
        $py = @'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from django.contrib.auth.models import User
u, created = User.objects.get_or_create(
    username="admin",
    defaults={"email": "admin@uniminuto.edu", "is_staff": True, "is_superuser": True},
)
u.is_staff = u.is_superuser = True
u.set_password("admin123")
u.save()
print("superusuario 'admin' listo (contrasena: admin123)")
'@
        $py | & docker compose --project-directory $RAIZ exec -T backend python -
        Invoke-Compose exec backend python seed_demo.py
    }
    'migrate' {
        Invoke-Compose exec backend python manage.py migrate
    }
    'superuser' {
        Invoke-Compose exec backend python manage.py createsuperuser
    }
    'shell' {
        Invoke-Compose exec backend bash
    }
    'psql' {
        Invoke-Compose exec db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB'
    }
}
