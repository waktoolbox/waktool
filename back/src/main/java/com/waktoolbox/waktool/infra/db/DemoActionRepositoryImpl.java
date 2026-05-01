package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.repositories.DemoActionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DemoActionRepositoryImpl implements DemoActionRepository {
    private final DataSource _dataSource;
    private final ResourceLoader _resourceLoader;

    @Override
    public void executeSqlFile(String classpathResource) {
        try (Connection connection = _dataSource.getConnection()) {
            var resource = _resourceLoader.getResource(classpathResource);
            if (!resource.exists()) {
                throw new IllegalArgumentException("SQL resource not found: " + classpathResource);
            }
            ScriptUtils.executeSqlScript(connection, resource);
            log.info("Executed demo SQL file: {}", classpathResource);
        } catch (Exception e) {
            log.error("Failed to execute demo SQL file: {}", classpathResource, e);
            throw new RuntimeException("Failed to execute demo SQL file: " + classpathResource, e);
        }
    }
}

