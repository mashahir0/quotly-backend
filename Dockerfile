# Base image with Node
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port (adjust to your app)
EXPOSE 3000

# Run the app (assumes output in 'dist/index.js')
CMD ["node", "dist/index.js"]
