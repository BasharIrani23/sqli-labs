FROM python:3.11-slim

WORKDIR /app

# netcat-openbsd is used by wait-for-db.sh to poll the MySQL port
RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x wait-for-db.sh

EXPOSE 5000

CMD ["./wait-for-db.sh"]
