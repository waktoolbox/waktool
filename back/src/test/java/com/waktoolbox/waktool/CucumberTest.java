package com.waktoolbox.waktool;

import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectPackages("com.waktoolbox.waktool")
public class CucumberTest {
    static {
        System.out.println("WAKTOOL: CucumberTest class loaded!");
    }
    // Do NOT delete this class, it enables tests on mvn test phase
}
