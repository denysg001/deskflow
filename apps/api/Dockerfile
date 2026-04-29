FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* .npmrc ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspace @deskflow/api
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run prisma:generate && npm run build
EXPOSE 3001
CMD sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/src/server.js"
