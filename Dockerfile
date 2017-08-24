FROM mhart/alpine-node:8.4

COPY package.json /tmp/package.json
COPY server/package.json /tmp/server/package.json

RUN cd /tmp \
    && npm install \
    && cd server \
    && npm install

RUN mkdir -p /app \
    && cp -a /tmp/node_modules /app/ \
    && cp -a /tmp/server/node_modules /app/server/

COPY . /app

WORKDIR /app
    
RUN npm run build

ENV NODE_ENV production

EXPOSE 1337
ENTRYPOINT node server/server.js