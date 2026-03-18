# Stage 1: Build with Gradle
FROM gradle:7.6.3-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon -x test

# Stage 2: Run
FROM eclipse-temurin:17-jre-jammy
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
