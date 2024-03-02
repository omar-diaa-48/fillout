FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

ARG PORT
ARG FILL_OUT_API_KEY
ARG FILL_OUT_API_BASE_URL
ARG FILL_OUT_API_VERSION

RUN npm install

RUN npm run build

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]