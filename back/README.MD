# Useful tips

## Identify an authenticated user

An authenticated user should have a cookie `token` in headers  
This cookie is decoded in `TokenInterceptor` and an attribute is injected on the Spring request

Attribute is injected as method parameter using `@RequestAttribute String discordId`