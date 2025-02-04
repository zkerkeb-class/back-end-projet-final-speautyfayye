FROM node:20-alpine

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY . .
RUN npm install
RUN npm run doc

EXPOSE 3001

ENTRYPOINT ["npm", "run"]
CMD ["start"]
