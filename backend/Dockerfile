
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY backend ./backend
COPY frontend ./frontend
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
