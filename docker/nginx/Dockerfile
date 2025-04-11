FROM nginx:1.25-alpine

# Удаляем дефолтную конфигурацию
RUN rm /etc/nginx/conf.d/default.conf

# Копируем нашу конфигурацию
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем директории для статических файлов
RUN mkdir -p /app/static /app/media

# Устанавливаем права
RUN chown -R nginx:nginx /app/static /app/media

EXPOSE 80 