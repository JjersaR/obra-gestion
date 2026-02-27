# MODEL IMAGE
FROM eclipse-temurin:21.0.3_9-jdk

# CONTAINER PORT
EXPOSE 8080

# CONTAINER ROOT DIRECTORY
WORKDIR /app

# COPY AND PAST INSIDE CONTAINER
COPY ./pom.xml /app
# ADD MAVEN
COPY ./.mvn /app/.mvn
# MAVEN EXEC
COPY ./mvnw /app

# DOWNLOAD DEPENDENCY
RUN ./mvnw dependency:go-offline

# COPY SRC
COPY ./src /app/src

# BUILD APPLICATION
RUN ./mvnw clean install

# lift application
ENTRYPOINT [ "java", "-jar", "/app/target/obra-gestion-0.0.1-SNAPSHOT.jar" ]
