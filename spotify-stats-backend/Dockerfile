#Use node.js image as base image
FROM node:18

# set the working dir
WORKDIR /usr/src/app

# copy package.json and package-lock.json
COPY package*.json ./

# install deps
RUN npm install

# copy rest of the app 
COPY . .

# build the app
RUN npm run build

#expose the port the app runs on
EXPOSE 3000

# start the app
CMD ["npm", "run", "start:prod"]