FROM oven/bun:1 AS base
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libxdamage1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production

FROM base AS release
ENV PUPPETEER_CACHE_DIR=/home/bun/.cache/puppeteer

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/index.ts .
COPY --from=prerelease /app/src ./src

RUN bunx puppeteer browsers install chrome

USER bun
EXPOSE 3333
CMD ["bun", "run", "start"]

