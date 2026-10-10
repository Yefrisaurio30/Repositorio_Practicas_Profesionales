# Sistema de Proyección Social UNIMINUTO

Backend **Django + DRF**, frontend **React + Vite**, base de datos **PostgreSQL**.
Manual de usuario final: `docs/MANUAL_USUARIO.md`.

## Requisitos

- Docker y Docker Compose (recomendado), o
- Python 3.12 + Node 20 + PostgreSQL 15 (instalación manual).

## Arranque rápido (desarrollo)

```bash
cp .env.example .env
# Genera una clave segura y ponla en SECRET_KEY y DB_PASSWORD del .env:
python -c "import secrets; print(secrets.token_urlsafe(50))"
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8080/api/publicaciones/publicas/

## Instalación manual

```bash
# Backend
cd backend
pip install -r requirements.txt        # versiones exactas (ver requirements.in)
python manage.py migrate
python manage.py createsuperuser       # superusuario inicial
python seed_demo.py                    # datos de demostración (idempotente)
python manage.py runserver 0.0.0.0:8080

# Frontend (otra terminal)
cd frontend
npm ci
npm run dev
```

## Pruebas

```bash
# Backend (requiere Postgres en marcha o Docker)
python backend/manage.py test

# Frontend
cd frontend && npm run build
```

## Producción

```bash
# Requiere SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS y DB_PASSWORD
docker compose -f docker-compose.prod.yml up --build -d
```

El backend corre con gunicorn (usuario no root) y el frontend con nginx
(`frontend/nginx.conf`). Postgres no publica puertos: solo red interna.

## Estructura

- `backend/apps/`: `usuarios`, `publicaciones`, `imagenes`, `comentarios`,
  `actividad`, `solicitudes`, `reportes`.
- `backend/config/settings/`: `base.py`, `local.py`, `prod.py`
  (se elige con `DJANGO_SETTINGS_ENV=local|prod`).
- `frontend/src/`: páginas, componentes, servicios, contexto y rutas.
- Plan de mejoras por fases: `PLAN.md`.
