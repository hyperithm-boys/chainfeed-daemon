FROM node:lts-buster-slim

WORKDIR /app

COPY src ./src
COPY .graphclientrc.yml .
COPY package.json .
COPY yarn.lock .

RUN apt-get update && apt-get -y install python3 python3-dev build-essential
RUN yarn && yarn build

CMD ["yarn", "start"]
