FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
