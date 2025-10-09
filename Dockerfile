# --- Stage 1: Build React (Vite) ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy & cài dependencies (caching hiệu quả)
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source code và build
COPY . .
RUN npm run build

# --- Stage 2: Serve build bằng vite preview ---
FROM node:20-alpine
WORKDIR /app

# Cài vite toàn cục để có lệnh 'vite preview'
RUN npm install -g vite

# Copy build output từ stage trước
COPY --from=builder /app/dist ./dist

# Expose port và khởi động server
EXPOSE 5173
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
