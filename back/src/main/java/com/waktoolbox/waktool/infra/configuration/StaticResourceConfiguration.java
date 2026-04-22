package com.waktoolbox.waktool.infra.configuration;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {
    @Value("${waktool.resources-path}")
    private String resourcesPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(resourcesPath)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected @Nullable Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource resource = location.createRelative(resourcePath);
                        if (resource.exists() && resource.isReadable()) {
                            return resource;
                        }
                        // SPA fallback: serve index.html for any unresolved path
                        Resource indexResource = location.createRelative("index.html");
                        if (indexResource.exists() && indexResource.isReadable()) {
                            return indexResource;
                        }
                        return null;
                    }
                });
    }
}
