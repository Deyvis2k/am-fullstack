FROM oven/bun:1.0.25

WORKDIR /app

RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libu2f-udev \
    libvulkan1 chromium

# Configura variável de ambiente usada pelo Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY . .

RUN bun install

CMD ["bun", "run", "index.ts"]

