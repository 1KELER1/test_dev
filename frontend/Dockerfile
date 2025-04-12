FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV PUBLIC_URL=/
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Создаем кастомную конфигурацию nginx
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 