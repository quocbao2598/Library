package com.management.library.demo.config;

import com.management.library.demo.entity.Book;
import com.management.library.demo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;

/**
 * Demo Configuration để minh họa các khái niệm DI và Bean Scopes
 * 
 * 🔍 DEPENDENCY INJECTION (DI) là gì?
 * - DI là một design pattern giúp quản lý dependencies giữa các objects
 * - Thay vì object tự tạo dependencies, chúng sẽ được "inject" từ bên ngoài
 * - Spring Framework sử dụng IoC (Inversion of Control) container để quản lý DI
 */
@Configuration
public class DIConceptsDemo {

    // ===============================================
    // 1. CÁC CÁCH TRIỂN KHAI DI TRONG SPRING
    // ===============================================

    /**
     * 📍 Method 1: Constructor Injection (KHUYÊN DÙNG)
     * - Inject dependencies qua constructor
     * - Đảm bảo dependencies được khởi tạo trước khi object được sử dụng
     * - Immutable dependencies (final fields)
     * - Dễ test (có thể mock dependencies)
     */
    public static class ConstructorInjectionExample {
        private final BookRepository repository;
        private final BookValidator validator;

        // Constructor injection - Spring tự động inject các dependencies
        public ConstructorInjectionExample(BookRepository repository, 
                                         @Qualifier("primaryValidator") BookValidator validator) {
            this.repository = repository;
            this.validator = validator;
        }
    }

    /**
     * 📍 Method 2: Field Injection (KHÔNG KHUYÊN DÙNG)
     * - Inject trực tiếp vào field
     * - Dễ viết nhưng khó test
     * - Không thể tạo immutable fields
     */
    public static class FieldInjectionExample {
        @Autowired
        private BookRepository repository;
        
        @Autowired
        @Qualifier("secondaryValidator")
        private BookValidator validator;
    }

    /**
     * 📍 Method 3: Setter Injection
     * - Inject qua setter methods
     * - Cho phép optional dependencies
     * - Có thể thay đổi dependencies sau khi object được tạo
     */
    public static class SetterInjectionExample {
        private BookRepository repository;
        private BookValidator validator;

        @Autowired
        public void setRepository(BookRepository repository) {
            this.repository = repository;
        }

        @Autowired(required = false) // Optional dependency
        public void setValidator(@Qualifier("optionalValidator") BookValidator validator) {
            this.validator = validator;
        }
    }

    // ===============================================
    // 2. BEAN SCOPES VÀ VÒNG ĐỜI
    // ===============================================

    /**
     * 🔄 SINGLETON SCOPE (Default)
     * - Chỉ có 1 instance duy nhất trong toàn bộ Spring container
     * - Instance được tạo khi container khởi động
     * - Được chia sẻ cho tất cả các requests
     * - Phù hợp cho stateless services
     */
    @Bean
    @Scope("singleton") // Hoặc @Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
    public BookValidator singletonValidator() {
        System.out.println("🏗️ Creating SINGLETON BookValidator instance");
        return new BookValidator("SingletonValidator");
    }

    /**
     * 🆕 PROTOTYPE SCOPE
     * - Tạo instance mới mỗi khi được request
     * - Không được cached
     * - Spring không quản lý lifecycle sau khi tạo
     * - Phù hợp cho stateful objects
     */
    @Bean
    @Scope("prototype") // Hoặc @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public BookValidator prototypeValidator() {
        System.out.println("🆕 Creating PROTOTYPE BookValidator instance");
        return new BookValidator("PrototypeValidator-" + System.currentTimeMillis());
    }

    /**
     * 🌐 REQUEST SCOPE (Web applications only)
     * - Tạo instance mới cho mỗi HTTP request
     * - Instance bị destroy khi request kết thúc
     * - Chỉ available trong web context
     */
    @Bean
    @Scope("request") // Hoặc @Scope(WebApplicationContext.SCOPE_REQUEST)
    public BookValidator requestValidator() {
        System.out.println("🌐 Creating REQUEST scope BookValidator instance");
        return new BookValidator("RequestValidator-" + Thread.currentThread().getName());
    }

    /**
     * 👤 SESSION SCOPE (Web applications only)
     * - Tạo instance mới cho mỗi HTTP session
     * - Instance tồn tại suốt session của user
     * - Bị destroy khi session expire
     */
    @Bean
    @Scope("session") // Hoặc @Scope(WebApplicationContext.SCOPE_SESSION)
    public BookValidator sessionValidator() {
        System.out.println("👤 Creating SESSION scope BookValidator instance");
        return new BookValidator("SessionValidator");
    }

    /**
     * 🔧 APPLICATION SCOPE
     * - Tương tự Singleton nhưng ở mức ServletContext
     * - Một instance cho toàn bộ web application
     */
    @Bean
    @Scope("application") // Hoặc @Scope(WebApplicationContext.SCOPE_APPLICATION)
    public BookValidator applicationValidator() {
        System.out.println("🔧 Creating APPLICATION scope BookValidator instance");
        return new BookValidator("ApplicationValidator");
    }

    // ===============================================
    // 3. QUALIFIER VÀ PRIMARY
    // ===============================================

    /**
     * 🎯 @Primary: Bean được ưu tiên khi có nhiều implementations
     */
    @Bean
    @Primary
    public BookValidator primaryValidator() {
        return new BookValidator("PrimaryValidator");
    }

    /**
     * 🏷️ @Qualifier: Chỉ định cụ thể bean nào được inject
     */
    @Bean
    @Qualifier("secondaryValidator")
    public BookValidator secondaryValidator() {
        return new BookValidator("SecondaryValidator");
    }

    @Bean
    @Qualifier("optionalValidator")
    public BookValidator optionalValidator() {
        return new BookValidator("OptionalValidator");
    }

    // ===============================================
    // 4. BEAN LIFECYCLE CALLBACKS
    // ===============================================

    /**
     * 🔄 Bean với lifecycle callbacks
     */
    @Bean(initMethod = "init", destroyMethod = "cleanup")
    public BookValidator lifecycleValidator() {
        return new BookValidator("LifecycleValidator");
    }

    // Demo class cho validators
    public static class BookValidator {
        private final String name;

        public BookValidator(String name) {
            this.name = name;
            System.out.println("📚 BookValidator constructor called: " + name);
        }

        public void init() {
            System.out.println("🚀 Init method called for: " + name);
        }

        public void cleanup() {
            System.out.println("🧹 Cleanup method called for: " + name);
        }

        public boolean validate(Book book) {
            System.out.println("✅ Validating book with: " + name);
            return book != null && book.getTitle() != null;
        }

        public String getName() {
            return name;
        }
    }
}
