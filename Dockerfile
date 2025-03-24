FROM node:18-alpine

WORKDIR /ai-chatbot-frontend

COPY ai-chatbot-frontend/package.json ai-chatbot-frontend/package-lock.json ./

RUN npm install --omit=dev

COPY ai-chatbot-frontend/ .

EXPOSE 3000

CMD ["node", "server.js"]