FROM node:24-alpine
WORKDIR /app
copy package*.json ./
RUN npm install --legacy-peer-deps
COPY . . 
EXPOSE 3000
CMD [ "npm","run","dev" ]