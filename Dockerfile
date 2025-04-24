FROM node:18-alpine

WORKDIR /app

# Instalar dependências necessárias para o node-gyp
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"] 