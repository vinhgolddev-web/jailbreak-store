FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy Source Code
COPY . .

# Build Next.js
# Build Next.js
RUN npm run build

# Expose Port
EXPOSE 3000

# Start Custom Server
CMD ["npm", "start"]
