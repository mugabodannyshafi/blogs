FROM node:20

WORKDIR /usr/scr/app

COPY . .

RUN npm install --legacy-peer-deps

CMD ["npm", "run", "start:dev"]