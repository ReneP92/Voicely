# Use the official Node.js image as the base image
FROM node:20

# Install MySQL client tools
RUN apt-get update && apt-get install -y default-mysql-client

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Install nodemon globally
RUN yarn global add nodemon

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Command to run the application with nodemon
CMD ["nodemon", "main.js"]