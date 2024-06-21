FROM node:20.14.0-alpine3.20

WORKDIR /app
COPY package.json .
RUN npm install -g pnpm
RUN pnpm install
COPY . .

CMD ["pnpm", "start"]
