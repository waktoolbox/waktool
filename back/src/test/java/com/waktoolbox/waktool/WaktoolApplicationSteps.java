package com.waktoolbox.waktool;

import com.decathlon.tzatziki.steps.ObjectSteps;
import com.decathlon.tzatziki.utils.Guard;
import com.waktoolbox.waktool.utils.JwtHelper;
import io.cucumber.java.en.Given;
import io.cucumber.spring.CucumberContextConfiguration;
import io.jsonwebtoken.Claims;
import org.jetbrains.annotations.NotNull;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

import static com.decathlon.tzatziki.utils.Guard.GUARD;
import static com.decathlon.tzatziki.utils.MockFaster.url;
import static com.decathlon.tzatziki.utils.Patterns.*;

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

    private final ObjectSteps _objectSteps;
    private final JwtHelper _jwtHelper;

    public WaktoolApplicationSteps(ObjectSteps objectSteps, JwtHelper jwtHelper) {
        _objectSteps = objectSteps;
        _jwtHelper = jwtHelper;
    }

    private String randomUsername(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            builder.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return builder.toString();
    }

    private String randomNumber(int decimals) {
        String chars = "0123456789";
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < decimals; i++) {
            builder.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return builder.toString();
    }

    @Given(THAT + GUARD + VARIABLE + " is a valid token")
    public void generateToken(String name) {
        Claims claims = _jwtHelper.buildClaimsFromValues(
                JwtHelper.DISCORD_ID, randomNumber(10),
                JwtHelper.USERNAME, randomUsername(10),
                JwtHelper.DISCRIMINATOR, randomNumber(4)
        );

        _objectSteps.add(name, _jwtHelper.generateJwt(claims, null));
    }

    @Given(THAT + GUARD + VARIABLE + " is a valid token for " + NUMBER)
    public void generateToken(Guard guard, String name, int discordId) {
        generateToken(guard, name, String.valueOf(discordId));
    }

    @Given(THAT + GUARD + VARIABLE + " is a valid token for " + VARIABLE)
    public void generateToken(Guard guard, String name, String discordId) {
        Claims claims = _jwtHelper.buildClaimsFromValues(
                JwtHelper.DISCORD_ID, discordId,
                JwtHelper.USERNAME, randomUsername(10),
                JwtHelper.DISCRIMINATOR, randomNumber(4)
        );

        _objectSteps.add(name, _jwtHelper.generateJwt(claims, null));
    }
}
