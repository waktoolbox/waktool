# =============================================================================
# Stage 1: Build frontend with pnpm
# =============================================================================
FROM node:22-alpine AS build-front

WORKDIR /front

# Install pnpm and cache dependencies
COPY front/package.json front/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --shamefully-hoist

# Set production mode after install to avoid skipping devDependencies
ENV NODE_ENV=production

COPY front/.env.production .env
COPY front/index.html index.html
COPY front/tsconfig*.json ./
COPY front/vite.config.ts vite.config.ts
COPY front/src/ src/
COPY front/public/ public/

RUN CI=true pnpm run build

# =============================================================================
# Stage 2: Build backend with Maven (dependency caching layer)
# =============================================================================
FROM maven:3-eclipse-temurin-21 AS build-back

WORKDIR /back

# Cache Maven dependencies in a separate layer
COPY back/pom.xml pom.xml
RUN mvn dependency:go-offline -B

# Build the application
COPY back/src/ src/
RUN mvn clean package -DskipTests -B

# =============================================================================
# Stage 3: Build a minimal JDK with jlink
# =============================================================================
FROM eclipse-temurin:21-jdk-alpine AS build-jdk

RUN jlink \
    --module-path /opt/java/openjdk/jmods \
    --compress=zip-6 \
    --add-modules java.base,java.compiler,java.desktop,java.instrument,java.logging,java.management,java.naming,java.scripting,java.security.jgss,java.sql,java.xml,jdk.crypto.ec,jdk.unsupported \
    --no-header-files \
    --no-man-pages \
    --output /opt/jdk

# =============================================================================
# Stage 4: Final minimal runtime image
# =============================================================================
FROM alpine:3.21

RUN apk update && apk add --no-cache ca-certificates && update-ca-certificates

ENV JAVA_OPTS="-XX:+ShowCodeDetailsInExceptionMessages -Xms128m -Xmx320m -XX:MaxMetaspaceSize=96m -XX:+UseSerialGC -Xss512k -XX:MaxDirectMemorySize=32m -XX:+ExitOnOutOfMemoryError"

WORKDIR /opt

RUN mkdir -p front/dist

COPY --from=build-front /front/dist/ front/dist/
COPY --from=build-back /back/target/back-*.jar app.jar
COPY --from=build-jdk /opt/jdk java

ENV JAVA_HOME=/opt/java
ENV PATH="$PATH:$JAVA_HOME/bin"
ENV RESOURCES_PATH=file:/opt/front/dist/

EXPOSE 8080

ENTRYPOINT java $JAVA_OPTS -jar app.jar --server.address=0.0.0.0
