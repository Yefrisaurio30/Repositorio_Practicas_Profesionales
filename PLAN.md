# PLAN — Informe de cambios y mejoras (36 hallazgos)

Rama: `fix/informe-mejoras` (creada desde `feature/docker`).
Base del informe: `main, c710c80` + `Informe_Cambios_y_Mejoras.md` (8-oct-2026).
Metodología: TDD por hallazgo (prueba que falla → cambio mínimo → verde),
1 commit por hallazgo `fix(ID): ...`. Sin push. Sin reescribir historial.

## Estado Fase 1 — HECHA (2026-10-09, commits dad62ce..7a79f74)

S1..S6 aplicados con TDD (13 reproducciones en rojo → verde).
Suite: 80/81 en sqlite (sin Postgres/Docker en esta máquina; CI de T1 usará
Postgres). 1 fallo PREEXISTENTE verificado en base `87a9322` vía worktree:
`FlujoCompletoPublicacionTest` (staff ve borrador en `/publicas/` por rama de
preview en `PublicacionPublicViewSet.get_queryset`). No lo toqué: cambiarlo
altera el contrato del preview de staff → decisión en Fase 2/3.
Migraciones: sin cambios. `npm run build`: OK. ruff/eslint: sin gate en repo
(llega en F6, Fase 4); solo avisos preexistentes + 1 pulido propio (SIM117).

Estados: `confirmado` = verificado contra código real.
`ya resuelto` / `no aplica` = ninguno (35 confirmados plenos, 1 confirmado con matiz).

## Fase 1 — Urgente (antes de desplegar): S1, S2, S3, S4, S5, S6

| ID | Archivo | Estado | Fase | Pruebas a escribir |
|----|---------|--------|------|--------------------|
| S1 | `backend/apps/usuarios/views.py:21,109-210`, `permissions.py:4-11` | confirmado | 1 | Moderador `POST /api/roles/asignar/` a Superadmin → 403; no crea roles al vuelo (rol inexistente → 400); no cambia `is_staff`/desactiva/elimina admins; no actúa sobre sí mismo ni superusuarios |
| S2 | `backend/apps/imagenes/views.py:24-51` | confirmado | 1 | Usuario no borra/edita imagen ajena (`DELETE/PATCH` → 404); no mueve imagen cambiando `publicacion` |
| S3 | `backend/apps/publicaciones/views.py:25-28` | confirmado | 1 | Usuario común `POST/PATCH/DELETE /categorias/` → 403; `GET` público 200 |
| S4 | `backend/apps/imagenes/serializers.py:22-33`, `utils/storage.py:15-18` | confirmado | 1 | Subir `.html/.svg/.js` o MIME falso → 400; solo jpg/jpeg/png/webp/gif ≤10MB; Pillow verifica contenido |
| S5 | `config/settings/prod.py:11`, `.env.example`, historial `8b2b9b4:backend/.env` | confirmado | 1 | `prod.py` sin `SECRET_KEY` → error al arrancar; rechaza clave `django-insecure`/corta. SOLO código + lista de rotación manual (NO filter-repo, NO push) |
| S6 | `config/settings/local.py:72`, `prod.py:1` | confirmado | 1 | Registro con `password="1"` en settings prod → 400 (validadores activos) |

## Fase 2 — Corto plazo (1-2 semanas): S7, L1, L2, L3, C1, C2, R1, T1

| ID | Archivo | Estado | Fase | Pruebas a escribir |
|----|---------|--------|------|--------------------|
| S7 | `usuarios/views.py:33-106`, `solicitudes/views.py:22-35`, `settings/local.py:104-118` | confirmado | 2 | Login con ráfaga → 429; registro masivo → 429; `POST /solicitudes/nueva/` anónimo con throttle |
| L1 | `publicaciones/views.py:67-75` | confirmado | 2 | Autor edita publicada/archivada → vuelve a `EN_REVISION` (pendiente decisión: alternativa 403) |
| L2 | `usuarios/permissions.py`, `signals.py:6`, `publicaciones/imagenes/comentarios/actividad/solicitudes/views`, `frontend/src/utils/roles.js`, `pages/admin/Usuarios.jsx:157` | confirmado | 2 | `es_staff()` único central; paridad roles→`is_staff`; frontend usa `is_staff`/permisos API |
| L3 | `actividad/signals.py:9-112` | confirmado | 2 | Moderador aprueba comentario → registro con `usuario=moderador` (no autor). Decisión pendiente: vistas vs middleware contextvars vs django-simple-history |
| C1 | `config/settings.py`, `settings/local.py`, `settings/prod.py`, `settings/__init__.py` | confirmado (matiz: `__init__.py` ya documenta que el paquete tiene prioridad; el muerto no carga) | 2 | `base.py` común; `local.py`/`prod.py` heredan de `base`; `settings.py` eliminado |
| C2 | `config/settings/prod.py:46` | confirmado | 2 | Existe `SECURE_PROXY_SSL_HEADER`; `STORAGES` (no `STATICFILES_STORAGE`); `ALLOWED_HOSTS` con strip/filtro; sin `SECURE_BROWSER_XSS_FILTER` |
| R1 | `frontend/node_modules/` (2736), 83 `.pyc`, `backend/media/` | confirmado | 2 | `git ls-files` vacío en esos paths tras `git rm --cached` (puedes usar `git rm --cached`) |
| T1 | `publicaciones/tests.py` (único), sin CI | confirmado | 2 | `test_seguridad_*` S1-S4 + workflow GitHub Actions (`manage.py test`, `ruff`, `eslint`, `npm run build`) |

## Fase 3 — Mediano plazo (2-4 semanas): L4-L7, C3-C6, R2, P1-P3, F1-F3, T2

| ID | Archivo | Estado | Fase | Pruebas a escribir |
|----|---------|--------|------|--------------------|
| L4 | `publicaciones/views.py:109-142`, `models.py:79-87` | confirmado | 3 | `archivar` borrador → 400; `enviar-revision` desde ARCHIVADA (staff) → 400; `TRANSICIONES` en modelo |
| L5 | `comentarios/views.py:59-80` | confirmado | 3 | `?publicacion_id=abc` → 400 (no 500); `publicos` solo de publicaciones visibles + paginado |
| L6 | `comentarios/serializers.py:41-58` (+ `views.py:47-54`: update/destroy caen en `IsAuthenticated`) | confirmado (matiz documentado) | 3 | Staff `PATCH contenido/publicacion` → 400/ignorado; ViewSet limitado a list/retrieve/create/destroy/aprobar/rechazar |
| L7 | `imagenes/utils/storage.py:40-43`, `utils/supabase.py:27-35`, `imagenes/models.py:6` | confirmado | 3 | Borrado en supabase llama `delete_image()`; sin `generate_filename` duplicado; `ruta` acepta `/media/...` (CharField) + `post_delete` limpia archivos |
| C3 | `settings/local.py:8-9,91-94` | confirmado | 3 | `DEBUG/ALLOWED_HOSTS/CORS` leídos de env (`decouple.config` + `Csv`) |
| C4 | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf` | confirmado | 3 | `docker-compose.prod.yml` válido; backend gunicorn + collectstatic no-root + healthcheck; frontend multi-stage nginx |
| C5 | `docker-compose.yml:18-24`, `.env.example:21` | confirmado | 3 | `ports` solo `127.0.0.1:`; plantilla sin `1234` |
| C6 | `requirements.txt`, `runtime.txt` | confirmado | 3 | `requirements.txt` pineado (`==`) desde `.in`; Python 3.12 unificado. Decisión pendiente: migrar a Django 5.2 LTS ahora o después |
| R2 | 4 `*.tar.gz` en raíz | confirmado | 3 | Solo añadir `*.tar.gz` a `.gitignore` (NO borrar/mover respaldos) |
| P1 | `publicaciones/serializers.py:36-91` | confirmado | 3 | `assertNumQueries` en listado 12 ítems (`annotate` + `Prefetch`) |
| P2 | `actividad/views.py:20`, `usuarios/views.py:115`, `solicitudes/views.py:43`, `comentarios/views.py:74-80` | confirmado | 3 | Listados paginados (`count`+`results`); `CursorPagination` en actividad |
| P3 | `publicaciones/filters.py`, `models.py` | confirmado | 3 | Migración `Meta.indexes (estado, -fechaPublicacion)`; búsqueda PG `SearchVector spanish`/trgm |
| F1 | `routes/RutaPrivada.jsx`, `RutaAutenticada.jsx`, `layout/Navbar.jsx` | confirmado | 3 | `AuthContext` 1 sola carga `/auth/user/`; `<RutaProtegida>` única (Vitest) |
| F2 | `services/api.js:31-42` | confirmado | 3 | 401 navega con router y guarda `?next=` sin `window.location.href` |
| F3 | ~18 `alert()` en `admin/*.jsx`, `Navbar.jsx`, `AdminLayout.jsx` | confirmado | 3 | Toast + traductor de errores API; cero `alert()` en `src`; modal propio vs `confirm` |
| T2 | `settings/local.py`, `imagenes/utils/supabase.py` | confirmado | 3 | Fallo Supabase → error claro (no 500); `LOGGING` en dev. Sentry solo si lo autorizas (nueva dependencia) |

## Fase 4 — Mejora continua: C7, R3, P4, F4-F6

| ID | Archivo | Estado | Fase | Pruebas a escribir |
|----|---------|--------|------|--------------------|
| C7 | `frontend/index.html:8-46` | confirmado | 4 | Build sin CDN; paleta en config Tailwind (requiere `tailwindcss` + plugin Vite — avisar antes, es dependencia) |
| R3 | raíz (falta `README.md`) | confirmado | 4 | Doc: requisitos, `cp .env.example .env`, `compose up --build`, superusuario, `seed_demo.py`, tests |
| P4 | `publicaciones/views.py:170-178`, `models.py:68-77`, `comentarios/models.py:44-53` | confirmado | 4 | 2ª vista misma sesión/IP no suma; `from_db()` sin `SELECT` extra |
| F4 | `Publicaciones.jsx` 548, `FormularioPublicacion.jsx` 532, `DetallePublicacion.jsx` 483 | confirmado | 4 | Refactor hooks/subcomponentes sin cambio de conducta (`@tanstack/react-query` solo si lo autorizas) |
| F5 | `Usuarios.jsx:23`, mensajes backend | confirmado | 4 | Barrido `contrasena/invalidas/Sesion/Moderator` → español correcto |
| F6 | `frontend/package.json` | confirmado | 4 | `npm run lint` (ESLint + react-hooks + Prettier) y `ruff` backend en verde |

## Decisiones pendientes (preguntar antes de aplicar)

1. L1: ¿editar publicada → `EN_REVISION` automático o 403?
2. L3: ¿auditoría en vistas (`request.user`) o middleware `contextvars` o `django-simple-history`/`auditlog`?
3. C1/C6: ¿migrar a Django 5.2 LTS ahora o solo pinear actual?
4. S5: solo código + lista de rotación manual. ¿Incluyo `ALLOWED_HOSTS` estricto en el mismo cambio?
5. F4/C7/T2-Sentry: ¿autorizas `tailwindcss`, `@tanstack/react-query`, `Sentry`? (Si no, se hacen sin dependencias nuevas.)

## Reglas duras aplicadas

- NO `filter-repo`/`rebase`/`push --force`; NO push (te pido autorización al final).
- S5: no muestro ni invento secretos.
- R1: `git rm --cached` permitido. R2: solo `*.tar.gz` al `.gitignore`, sin borrar/mover respaldos.
- Migración / cambio de contrato API / ruptura frontend → aviso previo.
- Español en respuestas y comentarios. Sin dependencias nuevas sin aviso.
