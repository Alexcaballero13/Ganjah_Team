package com.appganjah.backend.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final LoginRateLimitFilter loginRateLimitFilter;
    private final com.appganjah.backend.application.service.LoginRateLimitService loginRateLimits;

    public SecurityConfig(LoginRateLimitFilter loginRateLimitFilter,
                          com.appganjah.backend.application.service.LoginRateLimitService loginRateLimits) {
        this.loginRateLimitFilter = loginRateLimitFilter;
        this.loginRateLimits = loginRateLimits;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/swagger-ui/**", "/v3/api-docs/**", "/h2-console/**", "/actuator/health").permitAll()
                .antMatchers(org.springframework.http.HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "VIEWER")
                .antMatchers("/api/jugadores/**", "/api/matchdays/**").hasRole("ADMIN")
                .antMatchers("/api/reportes/**").hasAnyRole("ADMIN", "VIEWER")
                .anyRequest().authenticated()
            .and()
            .headers().frameOptions().sameOrigin()
            .and()
            .httpBasic()
                .authenticationEntryPoint((request, response, exception) -> {
                    Object fingerprint = request.getAttribute(LoginRateLimitFilter.FINGERPRINT_ATTRIBUTE);
                    boolean originalRequest = request.getDispatcherType() == javax.servlet.DispatcherType.REQUEST;
                    boolean alreadyRecorded = Boolean.TRUE.equals(
                            request.getAttribute(LoginRateLimitFilter.FAILURE_RECORDED_ATTRIBUTE));
                    if (originalRequest && !alreadyRecorded && fingerprint instanceof String) {
                        request.setAttribute(LoginRateLimitFilter.FAILURE_RECORDED_ATTRIBUTE, Boolean.TRUE);
                        loginRateLimits.registerFailure((String) fingerprint);
                    }
                    response.sendError(org.springframework.http.HttpStatus.UNAUTHORIZED.value(), "No autorizado");
                })
            .and()
            .addFilterBefore(loginRateLimitFilter, BasicAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${GANJAH_ADMIN_USER}") String adminUser,
            @Value("${GANJAH_ADMIN_USER_ALT:}") String alternateAdminUser,
            @Value("${GANJAH_ADMIN_PASSWORD}") String adminPassword,
            @Value("${GANJAH_ADMIN_PASSWORD_ALT:}") String alternateAdminPassword,
            @Value("${GANJAH_VIEWER_USER}") String viewerUser,
            @Value("${GANJAH_VIEWER_PASSWORD}") String viewerPassword,
            PasswordEncoder passwordEncoder) {
        List<UserDetails> users = new ArrayList<>();
        users.add(User.builder()
                .username(adminUser)
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build());

        if (!alternateAdminUser.isBlank() && !alternateAdminUser.equals(adminUser)) {
            users.add(User.builder()
                    .username(alternateAdminUser)
                    .password(passwordEncoder.encode(alternateAdminPassword.isBlank()
                            ? adminPassword
                            : alternateAdminPassword))
                    .roles("ADMIN")
                    .build());
        }

        users.add(User.builder()
                .username(viewerUser)
                .password(passwordEncoder.encode(viewerPassword))
                .roles("VIEWER")
                .build());

        return new InMemoryUserDetailsManager(users);
    }
}
