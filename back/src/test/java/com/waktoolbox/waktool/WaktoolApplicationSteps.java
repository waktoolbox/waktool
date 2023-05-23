package com.waktoolbox.waktool;

import io.cucumber.spring.CucumberContextConfiguration;
import org.jetbrains.annotations.NotNull;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

import static com.decathlon.tzatziki.utils.MockFaster.url;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = WaktoolApplication.class)
@ContextConfiguration(initializers = WaktoolApplicationSteps.Initializer.class)
public class WaktoolApplicationSteps {

    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:14.7")
            .withTmpFs(Map.of("/var:lib/postgresql/data", "rw"));

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(@NotNull ConfigurableApplicationContext applicationContext) {
            POSTGRES.start();

            TestPropertyValues.of(
                    "spring.datasource.url=" + POSTGRES.getJdbcUrl(),
                    "spring.datasource.username=" + POSTGRES.getUsername(),
                    "spring.datasource.password=" + POSTGRES.getPassword(),
                    "oauth2.discord.token-uri=" + url() + "/discord/token",
                    "oauth2.discord.user-info-uri=" + url() + "/discord/user",
                    "waktool.base-url=" + url() + "/mocked-front"
            ).applyTo(applicationContext);
        }
    }
}
