# Holis
## Comando para ejecutar el proyecto

Ahorita el proyecto no hace nada, pero pueden poner este comando
para que vean que el proyecto se ejecuta correctamente.

``` bash
mvn spring-boot:run
```

## Comandos de docker

### 1.- Para ver el contenedor en ejecución

``` docker
docker ps
```

Si quieres ver los contenedores que no estan en ejecución.

``` docker
docker ps -a
```

### 2.- Para ver las imagenes que tiene

``` docker
docker images
```

### 3.- Para detener los contenedores del proyecto

Estando dentro del proyecto tienes que ejecutar.

``` docker
docker compose down
```

Si quiere que tambien se borren los volumenes de docker (que no se guarde información).
Ejecutas este comando

``` docker
docker compose down -v
```

## Para consultar minio

Pueden poner esta url en el navegador:

``` http
http://localhost:9001
```

Y ponen las crendenciales que estan en su archivo .env
