FROM node:20-alpine

RUN apt-get -y update
RUN apt-get install -y ffmpeg

WORKDIR /app
COPY . .
RUN npm install
RUN npm run doc

EXPOSE 3001

ENTRYPOINT ["npm", "run"]
CMD ["start"]
