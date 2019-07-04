FROM node:8.16.0-jessie 
WORKDIR /bionitio
COPY . .

RUN npm install 
RUN npm install -g mocha
ENV PATH "/bionitio:${PATH}"
