FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl openssl-dev cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev
COPY package*.json ./
RUN npm install --os=linux --libc=musl --cpu=x64
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]
