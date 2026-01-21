FROM gradle:8-jdk21-alpine AS build
LABEL authors="datapeice"

WORKDIR /home/gradle/project

COPY build.gradle settings.gradle ./

COPY src ./src

RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]