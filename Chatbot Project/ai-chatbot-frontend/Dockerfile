FROM node:18-alpine

WORKDIR /

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY / .

EXPOSE 3000

CMD ["node", "server.js"]