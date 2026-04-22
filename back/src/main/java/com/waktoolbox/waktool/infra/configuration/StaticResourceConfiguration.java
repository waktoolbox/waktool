package com.waktoolbox.waktool.infra.configuration;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.File;

@Controller
@Configuration
public class StaticResourceConfiguration {
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

    @GetMapping("/**")
    public ResponseEntity<Resource> serveStaticOrFallback(HttpServletRequest request) {
        String path = request.getRequestURI().substring(1); // remove leading /
        String fsPath = getFileSystemPath();

        // Try to serve the exact file
        if (!path.isEmpty()) {
            File file = new File(fsPath + path);
            if (file.isFile() && file.canRead()) {
                Resource resource = new FileSystemResource(file);
                MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                        .orElse(MediaType.APPLICATION_OCTET_STREAM);
                return ResponseEntity.ok().contentType(mediaType).body(resource);
            }
        }

        // SPA fallback: serve index.html
        File indexFile = new File(fsPath + "index.html");
        if (indexFile.isFile() && indexFile.canRead()) {
            Resource resource = new FileSystemResource(indexFile);
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(resource);
        }

        return ResponseEntity.notFound().build();
    }
}
