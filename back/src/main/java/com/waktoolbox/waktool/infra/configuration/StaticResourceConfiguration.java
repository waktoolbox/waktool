package com.waktoolbox.waktool.infra.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {
    @Value("${waktool.resources-path}")
    private String resourcesPath;

    // TODO find a better way than manual mapping...
    private static final String[] PATHS = {
            "/",
            "/account", "/account/**",
            "/draft", "/draft/**",
            "/tournament/**"
    };

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**").addResourceLocations(resourcesPath);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String path : PATHS) {
            registry.addViewController(path).setViewName("forward:/index.html");
        }
    }
}
