package com.appganjah.backend.infrastructure.config;

import com.appganjah.backend.application.service.LoginRateLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class LoginRateLimitFilter extends OncePerRequestFilter {
    public static final String FINGERPRINT_ATTRIBUTE = "ganjah.loginFingerprint";
    public static final String FAILURE_RECORDED_ATTRIBUTE = "ganjah.loginFailureRecorded";
    private static final AntPathRequestMatcher LOGIN_CHECK = new AntPathRequestMatcher("/api/auth/me", "GET");
    private final LoginRateLimitService rateLimits;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !LOGIN_CHECK.matches(request) || basicUsername(request) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String username = basicUsername(request);
        String fingerprint = rateLimits.fingerprint(username, clientAddress(request));
        long retryAfter = rateLimits.retryAfterSeconds(fingerprint);
        if (retryAfter > 0) {
            response.setStatus(429);
            response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"message\":\"Demasiados intentos. Intenta nuevamente más tarde.\"}");
            return;
        }
        request.setAttribute(FINGERPRINT_ATTRIBUTE, fingerprint);
        chain.doFilter(request, response);
    }

    public static String basicUsername(HttpServletRequest request) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Basic ")) return null;
        try {
            String value = new String(Base64.getDecoder().decode(authorization.substring(6)), StandardCharsets.UTF_8);
            int separator = value.indexOf(':');
            return separator > 0 ? value.substring(0, separator) : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String clientAddress(HttpServletRequest request) {
        // El backend no confía en cabeceras X-Forwarded-For aportadas por el cliente.
        // En Vercel queda detrás del binding privado y el usuario completa la clave.
        return request.getRemoteAddr();
    }
}
