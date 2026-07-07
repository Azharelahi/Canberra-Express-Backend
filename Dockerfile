# 1. Base image (Node.js environment)
FROM node:22-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy dependency files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy application source code
COPY . .

# 6. Expose application port
EXPOSE 3000

# 7. Start application
CMD ["npm", "start"]