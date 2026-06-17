FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# without corepack manuall gotta do RUN npm install -g pnpm
RUN corepack enable
RUN pnpm install

COPY . .

ENV SKIP_ENV_VALIDATION=true
RUN pnpm build

CMD ["pnpm", "start"]