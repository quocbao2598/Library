package com.management.library.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		System.out.println("=================================================");
        System.out.println("🚀 Library Management System đã sẵn sàng!");
        System.out.println("📚 Web UI: http://localhost:8080");
        System.out.println("📊 Kibana: http://localhost:5601");
        System.out.println("🔍 Elasticsearch: http://localhost:9200");
        System.out.println("=================================================");
		SpringApplication.run(DemoApplication.class, args);
	}
}