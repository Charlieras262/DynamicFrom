# Usa Node.js 14, compatible con Angular 11
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala Angular CLI versión 11 de forma global
RUN npm install -g @angular/cli@11

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de archivos del proyecto
COPY . .

# Expone el puerto 4200 (Angular dev server)
EXPOSE 4200

# Comando por defecto (puede ser override en docker run)
CMD ["ng", "serve", "--host", "0.0.0.0"]
