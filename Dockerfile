FROM node:alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm cache clean --force

RUN npm install --verbose --no-cache --timeout=120000 -g @angular/cli

RUN npm install

CMD ["ng", "serve", "--host", "0.0.0.0"]