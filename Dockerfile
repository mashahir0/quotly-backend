# 1. Use Node base image
FROM node:18

# 2. Create app directory
WORKDIR /app

# 3. Copy dependency files first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all files
COPY . .

# 6. Build TypeScript
RUN npm run build

# 7. Expose the port
EXPOSE 3000

# 8. Start the app
CMD ["npm", "start"]
