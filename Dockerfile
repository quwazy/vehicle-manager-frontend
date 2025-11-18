# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from previous stage
COPY --from=build /app/dist .

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy .env file for reference (not used by Nginx, but for debugging)
COPY .env /usr/share/nginx/html/.env

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
