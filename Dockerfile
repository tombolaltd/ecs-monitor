FROM mhart/alpine-node:7.7.1

COPY . /app

WORKDIR /app

RUN npm install \
    && cd server \
    && npm install
    
RUN npm run build

ENV NODE_ENV production

EXPOSE 1337
ENTRYPOINT node server/server.js