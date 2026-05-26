FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# -- --host 구문을 통해 외부(내 PC 브라우저)에서 컨테이너 내부 Vite 서버로 포워딩 허용
CMD ["npm", "run", "dev", "--", "--host"]