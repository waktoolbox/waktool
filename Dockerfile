FROM node:20-alpine as build-front
WORKDIR /front

COPY front/*.json ./
RUN npm install

# Keep it after install to avoid chaos
ENV NODE_ENV=production

COPY front/.env.production .env
COPY front/index.html index.html
COPY front/vite.config.ts vite.config.ts
COPY front/src/ src/
COPY front/public/ public/

RUN npm run build

FROM maven:3-eclipse-temurin-21 as build-back

WORKDIR /back
COPY back/pom.xml pom.xml
COPY back/src/ src/

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine as build-jdk
RUN jlink \
    --module-path /opt/java/openjdk/jmods \
    --compress=2 \
    --add-modules java.base,java.compiler,java.desktop,java.instrument,java.logging,java.management,java.naming,java.scripting,java.security.jgss,java.sql,java.xml,jdk.crypto.ec,jdk.unsupported \
    --no-header-files \
    --no-man-pages \
    --output /opt/jdk

FROM alpine:3.18.2

RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
RUN update-ca-certificates

ENV JAVA_OPTS="-XX:+ShowCodeDetailsInExceptionMessages"

WORKDIR /opt

RUN mkdir -p front/dist

COPY --from=build-front /front/dist/ front/dist/
COPY --from=build-back /back/target/back-*.jar app.jar
COPY --from=build-jdk /opt/jdk java

ENV JAVA_HOME=/opt/java
ENV PATH="$PATH:$JAVA_HOME/bin"

ENTRYPOINT java $JAVA_OPTS -jar app.jar