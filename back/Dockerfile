FROM eclipse-temurin:20-jre

ENV JAVA_OPTS="-XX:+ShowCodeDetailsInExceptionMessages"

RUN useradd waktool -U
USER waktool:waktool

WORKDIR /opt

RUN mkdir -p front/dist

COPY target/back-*.jar app.jar
COPY ../front/dist/** front/dist/

ENTRYPOINT java $JAVA_OPTS -jar app.jar