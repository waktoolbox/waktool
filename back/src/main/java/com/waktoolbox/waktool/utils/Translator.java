package com.waktoolbox.waktool.utils;

import jakarta.annotation.PostConstruct;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class Translator {
    private final ResourceBundleMessageSource _messageSource = new ResourceBundleMessageSource();

    @PostConstruct
    public void setup() {
        _messageSource.setBasename("i18n/messages");
        _messageSource.setDefaultLocale(Locale.ENGLISH);
        _messageSource.setDefaultEncoding("ISO-8859-1");
    }

    public String get(String key, Locale locale, Object... args) {
        return _messageSource.getMessage(key, args, locale);
    }
}
