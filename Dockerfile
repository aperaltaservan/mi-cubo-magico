# Imagen para desplegar en Dokploy (o en cualquier sitio con Docker).
#
# La app no tiene dependencias: son ficheros estaticos y un servidor
# minimo en Node. Por eso no hay ni npm install ni paso de compilacion.
FROM node:22-alpine

# Correr como usuario sin privilegios; la imagen ya trae el usuario "node"
WORKDIR /app

# Solo lo que hace falta para servir la app. Las pruebas y los scripts de
# desarrollo se quedan fuera (ver .dockerignore).
COPY --chown=node:node package.json server.js index.html ./
COPY --chown=node:node css/ ./css/
COPY --chown=node:node js/ ./js/

USER node

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    CONTENEDOR=1

EXPOSE 3000

# Dokploy y Docker miran aqui para saber si la app esta viva
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
