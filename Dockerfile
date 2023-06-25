FROM node:20-alpine as build
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

FROM maven:3.9.2-eclipse-temurin-20 as build2

WORKDIR /back
COPY back/pom.xml pom.xml
COPY back/src/ src/

RUN mvn clean package -DskipTests

FROM eclipse-temurin:20-jre

ENV JAVA_OPTS="-XX:+ShowCodeDetailsInExceptionMessages"

RUN useradd waktool -U

WORKDIR /opt

RUN mkdir -p front/dist

COPY --from=build /front/dist/** front/dist/
COPY --from=build2 /back/target/back-*.jar app.jar

RUN chown -R waktool:waktool /opt

USER waktool:waktool
ENTRYPOINT java $JAVA_OPTS -jar app.jar