FROM node:12

RUN apt-get update \
    && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
