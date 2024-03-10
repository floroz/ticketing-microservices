FROM node:lts-alpine
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the Next.js development server will be running on
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
