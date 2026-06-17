package com.bluemoon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BluemoonApplication {
    public static void main(String[] args) {
        SpringApplication.run(BluemoonApplication.class, args);
    }
}

