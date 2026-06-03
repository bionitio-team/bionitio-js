FROM node:20
WORKDIR /bionitio
COPY . .

RUN npm install 
RUN npm install -g mocha
ENV PATH "/bionitio:${PATH}"
