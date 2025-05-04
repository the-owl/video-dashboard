FROM node:22-alpine

COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
COPY tsconfig.json .browserslistrc .eslint* babel.config.js config.defaults.yaml index.html vue.config.js postcss.config.js ./
COPY public ./public/
COPY src ./src/
COPY server ./server/
RUN npm run server:build
RUN npm run build
CMD ["node", "build-server/index.js"]
