# ---------- Build ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # Instalar deps con caché eficiente
    COPY package*.json ./
    RUN npm ci --no-audit --no-fund
    
    # Copiar código
    COPY . .
    
    # Reemplazar placeholder en api.config.prod.ts con la URL del backend
    # La URL se pasa como build arg y se reemplaza antes del build
    ARG API_BASE_URL=http://localhost:8080/api/1/compra-tu-auto
    RUN sed -i "s|API_BASE_URL_PLACEHOLDER|${API_BASE_URL}|g" src/app/config/api.config.prod.ts
    
    # Compilar (produce dist/frontend/{browser,server})
    ARG ANGULAR_CONFIG=production
    RUN npm run build -- --configuration=${ANGULAR_CONFIG}
    
    # ---------- Runtime (Node) ----------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    
    # Sólo deps de producción (para el server SSR: express/fastify, etc.)
    COPY package*.json ./
    RUN npm ci --omit=dev --no-audit --no-fund
    
    # Copiar artefactos de build
    COPY --from=build /app/dist ./dist
    
    # (Opcional) usuario no root
    # RUN adduser -D appuser && chown -R appuser:appuser /app
    # USER appuser
    
    # El server.ts generado suele leer PORT de env y default 4000
    ENV NODE_ENV=production
    ENV PORT=4000
    
    EXPOSE 4000
   
    CMD ["node", "dist/frontend/server/server.mjs"]
    