# backend-app/Dockerfile

FROM oven/bun:1.0.25

WORKDIR /app

COPY . .

RUN bun install

CMD ["bun", "run", "index.ts"]

