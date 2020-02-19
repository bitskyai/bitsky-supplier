FROM mhart/alpine-node:12

# create app directory
WORKDIR /usr/munew


COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 9099
CMD ["node", "build/index.js"]