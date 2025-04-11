#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

postgres_ready() {
    python << END
import sys
import os
from psycopg2 import connect
from psycopg2.errors import OperationalError

try:
    print(f"Trying to connect to PostgreSQL with:")
    print(f"Host: {os.getenv('POSTGRES_HOST')}")
    print(f"Port: {os.getenv('POSTGRES_PORT')}")
    print(f"Database: {os.getenv('POSTGRES_DATABASE')}")
    print(f"User: {os.getenv('POSTGRES_USER')}")
    
    connect(
        dbname=os.getenv('POSTGRES_DATABASE'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT'),
    )
    print("Successfully connected to PostgreSQL!")
except OperationalError as e:
    print(f"Error connecting to PostgreSQL: {e}")
    sys.exit(-1)
END
}

until postgres_ready; do
  >&2 echo "Waiting for PostgreSQL to become available..."
  sleep 5
done
>&2 echo "PostgreSQL is available"

python3 manage.py collectstatic --noinput
python3 manage.py makemigrations
python manage.py migrate
#python3 manage.py loaddata db.json
exec "$@"
