FROM eclipse-temurin:20-jre

ENV JAVA_OPTS="-XX:+ShowCodeDetailsInExceptionMessages"

RUN useradd waktool -U
USER waktool:waktool

WORKDIR /opt
COPY target/back-*.jar app.jar

ENTRYPOINT java $JAVA_OPTS -jar app.jar