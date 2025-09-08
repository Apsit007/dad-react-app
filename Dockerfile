# Step 1: Build stage
FROM node:20-alpine AS build
WORKDIR /app

# copy package.json / package-lock.json
COPY package*.json ./
RUN npm install

# copy source code
COPY . .

# build vite
RUN npm run build

# Step 2: Production stage (ใช้ nginx serve static files)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# ลบ default static
RUN rm -rf ./*

# copy build output จาก stage แรก
COPY --from=build /app/dist ./

# copy nginx config (ถ้าต้องการ custom routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
