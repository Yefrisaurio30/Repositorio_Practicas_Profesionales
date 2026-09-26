# ==============================================================================
# Frontend - React + Vite (modo desarrollo, HMR)
#
# Solo se instala lo necesario para arrancar el dev server. El codigo se monta
# desde el host en /app via docker-compose.
# Contexto de build: la raiz del proyecto (COPY frontend/...).
# ==============================================================================
FROM node:20-alpine

ENV NODE_ENV=development

WORKDIR /app

# package-lock.json SIEMPRE debe enviarse al build: `npm ci` lo necesita.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

EXPOSE 5173

CMD ["npm", "run", "dev"]
