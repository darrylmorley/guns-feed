FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

COPY . .

RUN pnpm run build

RUN pnpm prune --prod

EXPOSE 3000

CMD ["node", "dist/index.js"]