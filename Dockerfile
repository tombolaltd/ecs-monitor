FROM mhart/alpine-node:7.7.1

COPY . /app

WORKDIR /app

RUN npm install --production \
    && npm run build \
    && cd server \
    && npm install --production

ENV NODE_ENV production

EXPOSE 1337
ENTRYPOINT node server/server.js