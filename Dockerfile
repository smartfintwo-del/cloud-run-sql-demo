
FROM node:18-alpine
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

ENV PORT=8080
EXPOSE 8080
CMD ["cd","backend"]
CMD ["npm","start"]
