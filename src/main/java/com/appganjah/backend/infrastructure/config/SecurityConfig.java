package com.appganjah.backend.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
                .antMatchers("/h2-console/**", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .antMatchers(org.springframework.http.HttpMethod.GET, "/api/jugadores").hasAnyRole("ADMIN", "VIEWER")
                .antMatchers("/api/jugadores/**", "/api/matchdays/**").hasRole("ADMIN")
                .antMatchers("/api/reportes/**").hasAnyRole("ADMIN", "VIEWER")
                .anyRequest().authenticated()
            .and()
            .headers().frameOptions().disable() // Para H2 console
            .and()
            .httpBasic();
            
        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails adminJp = User.withDefaultPasswordEncoder()
                .username("jp")
                .password("admin123")
                .roles("ADMIN")
                .build();

        UserDetails adminAlex = User.withDefaultPasswordEncoder()
                .username("Alex")
                .password("admin123")
                .roles("ADMIN")
                .build();

        UserDetails viewer = User.withDefaultPasswordEncoder()
                .username("viewer")
                .password("viewer123")
                .roles("VIEWER")
                .build();

        return new InMemoryUserDetailsManager(adminJp, adminAlex, viewer);
    }
}
