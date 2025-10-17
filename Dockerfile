# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Run the app when the container launches
CMD ["npm", "run", "serve"]