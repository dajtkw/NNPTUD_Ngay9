# Sử dụng Node.js LTS version
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Sao chép toàn bộ source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]