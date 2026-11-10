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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
            .headers().frameOptions().disable()
            .and()
            .httpBasic();

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
            @Value("${GANJAH_ADMIN_PASSWORD}") String adminPassword,
            @Value("${GANJAH_VIEWER_USER}") String viewerUser,
            @Value("${GANJAH_VIEWER_PASSWORD}") String viewerPassword,
            PasswordEncoder passwordEncoder) {
        UserDetails admin = User.builder()
                .username(adminUser)
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        UserDetails viewer = User.builder()
                .username(viewerUser)
                .password(passwordEncoder.encode(viewerPassword))
                .roles("VIEWER")
                .build();

        return new InMemoryUserDetailsManager(admin, viewer);
    }
}
