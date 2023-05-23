package com.waktoolbox.waktool;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = {"pretty", "json:target/cucumber.json", "html:target/site/cucumber.html"}, glue = {"com.decathlon.tzatziki.steps", "com.waktoolbox.waktool"})
public class CucumberTest {
    // Do NOT delete this class, it enables tests on mvn test phase
}
