FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY client/dist /app/client/dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "index.js"]
