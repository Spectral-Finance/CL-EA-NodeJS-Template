### BASE
FROM node:14.17-alpine as base

WORKDIR /usr/src/app

### BUILDER
FROM node:14.17-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock tsconfig*.json ./

RUN yarn install --pure-lockfile

COPY src ./src

RUN yarn run build

### RUNNER
FROM node:14.17-alpine

ENV NODE_ENV=production

COPY package*.json ./

RUN yarn install

COPY --from=builder /usr/src/app/dist/ ./dist/

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]
