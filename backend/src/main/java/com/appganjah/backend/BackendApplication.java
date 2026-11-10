package com.appganjah.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
        SpringApplication.run(BackendApplication.class, args);
    }
}
