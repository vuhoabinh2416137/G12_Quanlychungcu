package com.bluemoon.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class test {
    @GetMapping("/test")
    public ResponseEntity<String> testAPI(){
        return ResponseEntity.ok("thanh cong roi");
    }
}
