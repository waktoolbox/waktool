package com.waktoolbox.waktool.infra.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Configuration
@AllArgsConstructor
public class RestTemplateConfiguration {
    private final ObjectMapper _mapper;


    @Bean
    public RestTemplate restTemplate() {
        MappingJackson2HttpMessageConverter formUrlEncodedConverter = new MappingJackson2HttpMessageConverter();
        formUrlEncodedConverter.setSupportedMediaTypes(List.of(MediaType.APPLICATION_FORM_URLENCODED));
        return new RestTemplateBuilder()
                .additionalMessageConverters(formUrlEncodedConverter)
                .additionalMessageConverters(new MappingJackson2HttpMessageConverter(_mapper))
                .build();
    }
}
