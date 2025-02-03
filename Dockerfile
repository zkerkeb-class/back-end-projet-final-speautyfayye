FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install
RUN npm run doc

EXPOSE 3001

ENTRYPOINT ["npm", "run"]
CMD ["start"]
