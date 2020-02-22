FROM mhart/alpine-node:12

LABEL maintainer="Munew docker maintainers <help.munewio@gmail.com>"
ENV REFRESHED_AT 2020-02-19

# create app directory
WORKDIR /usr/munew


COPY package*.json ./

# Only install 
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 9099
CMD ["node", "build/index.js"]

# Metadata
LABEL munew.image.vendor="Munew" \
    munew.image.url="https://munew.io" \
    munew.image.title="Munew Browser Extension Agent" \
    munew.image.description="Response for collect intelligence data and send back to Analyst Service. It contains Google Chrome, Firefox and Opera extensions." \
    munew.image.documentation="https://docs.munew.io"