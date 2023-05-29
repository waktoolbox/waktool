package com.waktoolbox.waktool;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
/**
 * Due to usage of SpringSteps in addition to Spring socket, there is too much beans for thread pool
 */
public class ExecutorOverride {

    @Bean
    @Primary
    public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }
}
