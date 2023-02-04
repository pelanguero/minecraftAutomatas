# NPM
 Actualizar la libreria NPM
```
npm install npm@latest -g
```
Actualiza las dependencias de vendor
```
npm update 
```
Crear archivo zip con todo el npm que se sube
```
npm pack
```
Añadir tags y push
```
git tag 0.1.x
git push --tags
```

## Para revisar los paquetes desactualizados
Lo instalamos como paquete global
```
npm install -g npm-check-updates
```
Ver que paquetes están desactualizados
```
ncu
```
Instalar a SACO las actualizaciones: // Hacer backup ya que puede romper el programa
```
ncu -u
```

# Docker

## 
Ver contenedores en ejecucion, -a incluye los que están parados
```
docker ps
```
Crear una red en docker para que se puedan intercomunicar
```
docker network create nombreDeLaRed --attachable
```
Añadir un contenedor a la red creada
```
docker network connect nombreDeLaRed nombreContenedor
```
Para inspeccionar que contenedores están conectado a la red de docker
```
docker inspect nombreDeLaRed 
```
Para levantar el grupo de contenedores con docker-compose.yml
```
docker-compose up -d
```
Borrar las redes discos y contenedores no usados
```
minecraftlegionwebclient
```
Ver consumo de docker
```
docker stats
```