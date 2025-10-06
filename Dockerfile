# Use a lightweight Node.js base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# This step is cached, which speeds up future builds if dependencies don't change
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all application files (your server.js and index.html) into the container
COPY . .

# Expose the port your application listens on (e.g., 3001)
EXPOSE 3001

# Define the command to run your application
# This assumes you have a "start" script in your package.json
CMD ["npm", "start"]
