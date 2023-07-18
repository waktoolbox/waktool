package com.waktoolbox.waktool.utils;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Arrays;
import java.util.Locale;

@Service
public class SpringLocaleResolver {
    private final AcceptHeaderLocaleResolver _resolver = new AcceptHeaderLocaleResolver();

    @PostConstruct
    public void setup() {
        _resolver.setSupportedLocales(Arrays.asList(Locale.ENGLISH, Locale.FRENCH));
        _resolver.setDefaultLocale(Locale.ENGLISH);
    }

    public String resolve(HttpServletRequest request) {
        return _resolver.resolveLocale(request).getLanguage();
    }
}
