# ── Stage 1: build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# ── Stage 2: serve with nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA routing: send all 404s back to index.html
RUN printf 'server {\\n\\
    listen 80;\\n\\
    root /usr/share/nginx/html;\\n\\
    index index.html;\\n\\
    location / {\\n\\
        try_files $uri $uri/ /index.html;\\n\\
    }\\n\\
}\\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]