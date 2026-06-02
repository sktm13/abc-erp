FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_SERVER=http://localhost:8080
ENV VITE_API_SERVER=${VITE_API_SERVER}

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# reactrouter 새로고침 문제 방지, nginx.conf 생성
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]