package com.waktoolbox.waktool.infra.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {
    @Value("${waktool.resources-path}")
    private String resourcesPath;

    private String getFileSystemPath() {
        String path = resourcesPath;
        if (path.startsWith("file:///")) {
            path = path.substring(7);
        } else if (path.startsWith("file:")) {
            path = path.substring(5);
        }
        if (!path.endsWith("/")) {
            path += "/";
        }
        return path;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward root path to index.html
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String fsPath = getFileSystemPath();

        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + fsPath)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // Don't serve static files for API, WebSocket, or health paths
                        if (resourcePath.startsWith("api/") || resourcePath.startsWith("socket") || resourcePath.equals("health")) {
                            return null;
                        }

                        Resource requested = location.createRelative(resourcePath);
                        // Serve the exact file if it exists, otherwise fallback to index.html (SPA routing)
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        Resource index = new FileSystemResource(fsPath + "index.html");
                        return index.exists() && index.isReadable() ? index : null;
                    }
                });
    }
}
