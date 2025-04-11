FROM python:3.11-slim

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential libpq-dev \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt \
    && rm -rf /tmp/requirements.txt

WORKDIR /app
COPY . .
RUN chmod +x docker/*.sh
RUN chmod +x docker/entrypoint.sh

ENTRYPOINT [ "docker/entrypoint.sh" ]
CMD [ "docker/start.sh", "server" ]
