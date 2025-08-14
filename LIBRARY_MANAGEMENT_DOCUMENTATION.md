# 📚 Library Management System - Complete Documentation

## 🎯 Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Database Design](#database-design)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Documentation](#api-documentation)
7. [Testing Guide](#testing-guide)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan Dự Án

### Mục Đích
Xây dựng một hệ thống quản lý thư viện hoàn chỉnh với các chức năng:
- **Quản lý sách**: Thêm, sửa, xóa, tìm kiếm sách
- **Quản lý thành viên**: Đăng ký, cập nhật thông tin thành viên
- **Quản lý mượn/trả**: Xử lý giao dịch mượn và trả sách
- **Thống kê**: Dashboard với các số liệu tổng quan

### Công Nghệ Sử Dụng

#### Backend
```
- Java 21
- Spring Boot 3.5.4
- Spring Data JPA (ORM)
- Spring Security (Authentication & Authorization)
- PostgreSQL (Database)
- Maven (Dependency Management)
```

#### Frontend
```
- HTML5/CSS3/JavaScript (Vanilla)
- Bootstrap 5.3.0 (UI Framework)
- Font Awesome 6.0 (Icons)
- Fetch API (HTTP Requests)
```

### Cấu Trúc Project
```
Library/
├── src/
│   ├── main/
│   │   ├── java/com/management/library/demo/
│   │   │   ├── DemoApplication.java          # Main class
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java       # Security configuration
│   │   │   ├── entity/                       # JPA Entities
│   │   │   │   ├── Book.java
│   │   │   │   ├── Member.java
│   │   │   │   └── Loan.java
│   │   │   ├── repository/                   # Data Access Layer
│   │   │   │   ├── BookRepository.java
│   │   │   │   ├── MemberRepository.java
│   │   │   │   └── LoanRepository.java
│   │   │   ├── service/                      # Business Logic Layer
│   │   │   │   ├── BookService.java
│   │   │   │   ├── MemberService.java
│   │   │   │   └── LoanService.java
│   │   │   └── controller/                   # REST API Layer
│   │   │       ├── BookController.java
│   │   │       ├── MemberController.java
│   │   │       └── LoanController.java
│   │   └── resources/
│   │       ├── application.properties        # Configuration
│   │       └── static/                       # Frontend files
│   │           ├── index.html
│   │           ├── books.html
│   │           ├── members.html
│   │           ├── loans.html
│   │           ├── css/style.css
│   │           └── js/
│   │               ├── api.js
│   │               ├── main.js
│   │               ├── books.js
│   │               ├── members.js
│   │               └── loans.js
│   └── test/                                 # Test files
└── pom.xml                                   # Maven configuration
```

---

## 🏗️ Kiến Trúc Hệ Thống

### Layered Architecture (Kiến trúc phân lớp)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)               │
├─────────────────────────────────────────────────────────┤
│                    REST API Layer                       │
│                   (Controllers)                         │
├─────────────────────────────────────────────────────────┤
│                  Business Logic Layer                   │
│                    (Services)                           │
├─────────────────────────────────────────────────────────┤
│                  Data Access Layer                      │
│                  (Repositories)                         │
├─────────────────────────────────────────────────────────┤
│                   Database Layer                        │
│                   (PostgreSQL)                          │
└─────────────────────────────────────────────────────────┘
```

### Mô Tả Từng Lớp

#### 1. **Frontend Layer**
- **Chức năng**: Giao diện người dùng, xử lý tương tác
- **Công nghệ**: HTML, CSS, JavaScript, Bootstrap
- **Nhiệm vụ**: 
  - Hiển thị dữ liệu
  - Thu thập input từ user
  - Gọi API backend
  - Xử lý response và cập nhật UI

#### 2. **Controller Layer (REST API)**
- **Chức năng**: Tiếp nhận HTTP requests, trả về HTTP responses
- **Annotation**: `@RestController`, `@RequestMapping`
- **Nhiệm vụ**:
  - Validate input parameters
  - Gọi business logic (Service layer)
  - Format response data
  - Handle HTTP status codes

#### 3. **Service Layer (Business Logic)**
- **Chức năng**: Chứa logic nghiệp vụ chính
- **Annotation**: `@Service`, `@Transactional`
- **Nhiệm vụ**:
  - Implement business rules
  - Coordinate between multiple repositories
  - Handle transactions
  - Data validation & transformation

#### 4. **Repository Layer (Data Access)**
- **Chức năng**: Tương tác với database
- **Interface**: Extends `JpaRepository`
- **Nhiệm vụ**:
  - CRUD operations
  - Custom queries
  - Data persistence

#### 5. **Entity Layer**
- **Chức năng**: Đại diện cho database tables
- **Annotation**: `@Entity`, `@Table`, `@Id`
- **Nhiệm vụ**:
  - Map Java objects to database tables
  - Define relationships between entities
  - Validation constraints

---

## 🗄️ Database Design

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     BOOKS       │       │     LOANS       │       │    MEMBERS      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ book_id (FK)    │──────►│ id (PK)         │
│ title           │       │ member_id (FK)  │       │ name            │
│ author          │       │ id (PK)         │       │ email           │
│ genre           │       │ borrow_date     │       │ password        │
│ published_year  │       │ return_date     │       └─────────────────┘
│ available       │       │ status          │
└─────────────────┘       └─────────────────┘
```

### Database Schema

#### 1. **Books Table**
```sql
CREATE TABLE books (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title VARCHAR(255),
    author VARCHAR(255),
    genre VARCHAR(255),
    published_year INTEGER NOT NULL,
    available BOOLEAN NOT NULL
);
```

**Giải thích các trường:**
- `id`: Primary key, auto-increment
- `title`: Tên sách
- `author`: Tác giả
- `genre`: Thể loại sách
- `published_year`: Năm xuất bản
- `available`: Trạng thái có sẵn để mượn (true/false)

#### 2. **Members Table**
```sql
CREATE TABLE members (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
);
```

**Giải thích các trường:**
- `id`: Primary key, auto-increment
- `name`: Họ tên thành viên
- `email`: Email (dùng để đăng nhập)
- `password`: Mật khẩu (trong thực tế cần mã hóa)

#### 3. **Loans Table**
```sql
CREATE TABLE loans (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    book_id BIGINT NOT NULL REFERENCES books(id),
    member_id BIGINT NOT NULL REFERENCES members(id),
    borrow_date DATE,
    return_date DATE,
    status VARCHAR(255)
);
```

**Giải thích các trường:**
- `id`: Primary key, auto-increment
- `book_id`: Foreign key tới books table
- `member_id`: Foreign key tới members table
- `borrow_date`: Ngày mượn sách
- `return_date`: Ngày trả sách (null nếu chưa trả)
- `status`: Trạng thái ('BORROWED', 'RETURNED', 'OVERDUE')

### Relationships (Mối quan hệ)

1. **Books ↔ Loans**: One-to-Many
   - Một cuốn sách có thể có nhiều giao dịch mượn (qua thời gian)
   
2. **Members ↔ Loans**: One-to-Many
   - Một thành viên có thể có nhiều giao dịch mượn

3. **Books ↔ Members**: Many-to-Many (thông qua Loans)
   - Một thành viên có thể mượn nhiều sách
   - Một cuốn sách có thể được mượn bởi nhiều thành viên (không cùng lúc)

---

## ⚙️ Backend Implementation

### 1. Configuration Files

#### `application.properties`
```properties
# Application name
spring.application.name=demo

# PostgreSQL DataSource Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/librarydb
spring.datasource.username=postgres
spring.datasource.password=0609
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

**Giải thích:**
- `ddl-auto=update`: Tự động tạo/cập nhật database schema
- `show-sql=true`: Hiển thị SQL queries trong console
- `format_sql=true`: Format SQL cho dễ đọc

#### `pom.xml` - Dependencies
```xml
<dependencies>
    <!-- Spring Boot Starter Web: REST API, embedded Tomcat -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA: ORM, Hibernate -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Spring Security: Authentication & Authorization -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2. Entity Classes

#### `Book.java`
```java
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String author;
    private String genre;
    private int publishedYear;
    private boolean available;
    
    // Constructors
    public Book() {}
    
    public Book(String title, String author, String genre, int publishedYear, boolean available) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.publishedYear = publishedYear;
        this.available = available;
    }
    
    // Getters and Setters
    // ... (standard getter/setter methods)
}
```

**Giải thích Annotations:**
- `@Entity`: Đánh dấu class này là JPA entity
- `@Table(name = "books")`: Map với table "books" trong DB
- `@Id`: Đánh dấu trường id là primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Auto-increment

#### `Member.java`
```java
@Entity
@Table(name = "members")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private String password; // Trong thực tế cần hash
    
    // Constructors, getters, setters...
}
```

#### `Loan.java`
```java
@Entity
@Table(name = "loans")
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private String status; // BORROWED, RETURNED, OVERDUE
    
    // Constructors, getters, setters...
}
```

**Giải thích Relationships:**
- `@ManyToOne`: Nhiều loans có thể thuộc về một book/member
- `@JoinColumn`: Chỉ định foreign key column

### 3. Repository Layer

#### `BookRepository.java`
```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Tìm sách theo title (không phân biệt hoa thường)
    List<Book> findByTitleContainingIgnoreCase(String title);
    
    // Tìm sách theo author
    List<Book> findByAuthorContainingIgnoreCase(String author);
    
    // Tìm sách theo genre
    List<Book> findByGenreIgnoreCase(String genre);
    
    // Tìm sách theo năm xuất bản
    List<Book> findByPublishedYear(int year);
    
    // Tìm sách có sẵn
    List<Book> findByAvailable(boolean available);
}
```

**Giải thích:**
- `JpaRepository<Book, Long>`: Cung cấp CRUD methods cơ bản
- Spring Data JPA tự động implement các method dựa trên tên method
- `ContainingIgnoreCase`: Tìm kiếm substring, không phân biệt hoa thường

#### `MemberRepository.java`
```java
@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    List<Member> findByNameContainingIgnoreCase(String name);
    List<Member> findByEmailContainingIgnoreCase(String email);
}
```

#### `LoanRepository.java`
```java
@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    List<Loan> findByMember(Member member);
    List<Loan> findByBook(Book book);
    List<Loan> findByStatus(String status);
    List<Loan> findByReturnDateBeforeAndStatus(LocalDate date, String status);
}
```

### 4. Service Layer

#### `BookService.java`
```java
@Service
@Transactional
public class BookService {
    
    private final BookRepository bookRepository;
    
    @Autowired
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
    
    // Lấy tất cả sách
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    // Lấy sách theo ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
    
    // Lưu sách (thêm mới hoặc cập nhật)
    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }
    
    // Xóa sách
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
    }
    
    // Tìm sách có sẵn
    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailable(true);
    }
    
    // Tìm kiếm sách
    public List<Book> searchBooks(String title, String author, String genre) {
        if (title != null && !title.isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCase(title);
        } else if (author != null && !author.isEmpty()) {
            return bookRepository.findByAuthorContainingIgnoreCase(author);
        } else if (genre != null && !genre.isEmpty()) {
            return bookRepository.findByGenreIgnoreCase(genre);
        }
        return getAllBooks();
    }
}
```

**Giải thích:**
- `@Service`: Đánh dấu class này là service layer
- `@Transactional`: Tự động quản lý database transactions
- `@Autowired`: Dependency injection
- Constructor injection được khuyến khích hơn field injection

#### `LoanService.java` - Business Logic Phức Tạp
```java
@Service
@Transactional
public class LoanService {
    
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    
    public static final String LOAN_STATUS_BORROWED = "BORROWED";
    public static final String LOAN_STATUS_RETURNED = "RETURNED";
    public static final String LOAN_STATUS_OVERDUE = "OVERDUE";
    
    // Constructor injection
    @Autowired
    public LoanService(LoanRepository loanRepository, 
                      BookRepository bookRepository, 
                      MemberRepository memberRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }
    
    // Mượn sách - Business Logic phức tạp
    public Loan borrowBook(Long bookId, Long memberId) {
        // Tìm sách và thành viên
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));
        
        // Kiểm tra sách có sẵn không
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available for loan: " + book.getTitle());
        }
        
        // Cập nhật trạng thái sách
        book.setAvailable(false);
        bookRepository.save(book);
        
        // Tạo loan record
        Loan loan = new Loan(book, member, LocalDate.now(), LOAN_STATUS_BORROWED);
        return loanRepository.save(loan);
    }
    
    // Trả sách
    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + loanId));
        
        // Kiểm tra sách đã được trả chưa
        if (LOAN_STATUS_RETURNED.equals(loan.getStatus())) {
            throw new RuntimeException("Book already returned for this loan: " + loanId);
        }
        
        // Cập nhật trạng thái sách và loan
        Book book = loan.getBook();
        book.setAvailable(true);
        bookRepository.save(book);
        
        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LOAN_STATUS_RETURNED);
        return loanRepository.save(loan);
    }
    
    // Tìm sách quá hạn
    public List<Loan> getOverdueLoans() {
        return loanRepository.findByReturnDateBeforeAndStatus(LocalDate.now(), LOAN_STATUS_BORROWED);
    }
}
```

### 5. Controller Layer

#### `BookController.java`
```java
@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Cho phép CORS
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    // GET /api/books - Lấy tất cả sách
    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }
    
    // GET /api/books/{id} - Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.getBookById(id);
        return book.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // POST /api/books - Thêm sách mới
    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookService.saveBook(book);
    }
    
    // PUT /api/books/{id} - Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, 
                                          @RequestBody Book bookDetails) {
        Optional<Book> optionalBook = bookService.getBookById(id);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            book.setTitle(bookDetails.getTitle());
            book.setAuthor(bookDetails.getAuthor());
            book.setGenre(bookDetails.getGenre());
            book.setPublishedYear(bookDetails.getPublishedYear());
            book.setAvailable(bookDetails.isAvailable());
            return ResponseEntity.ok(bookService.saveBook(book));
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE /api/books/{id} - Xóa sách
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (bookService.getBookById(id).isPresent()) {
            bookService.deleteBook(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // GET /api/books/available - Lấy sách có sẵn
    @GetMapping("/available")
    public List<Book> getAvailableBooks() {
        return bookService.getAvailableBooks();
    }
    
    // GET /api/books/search - Tìm kiếm sách
    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam(required = false) String title,
                                 @RequestParam(required = false) String author,
                                 @RequestParam(required = false) String genre) {
        return bookService.searchBooks(title, author, genre);
    }
}
```

**Giải thích Annotations:**
- `@RestController`: Kết hợp `@Controller` và `@ResponseBody`
- `@RequestMapping("/api/books")`: Base URL cho tất cả endpoints
- `@CrossOrigin(origins = "*")`: Cho phép CORS từ mọi domain
- `@GetMapping`, `@PostMapping`, etc.: HTTP method mapping
- `@PathVariable`: Lấy giá trị từ URL path
- `@RequestParam`: Lấy query parameters
- `@RequestBody`: Parse JSON request body thành Java object

### 6. Security Configuration

#### `SecurityConfig.java`
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF cho API
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/**").permitAll() // Cho phép tất cả API calls
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll() // Static resources
                .requestMatchers("/*.html", "/", "/index.html", "/books.html", "/members.html", "/loans.html").permitAll() // HTML pages
                .anyRequest().permitAll() // Cho phép tất cả requests (demo)
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())); // Security headers
        
        return http.build();
    }
}
```

**Giải thích:**
- Disable CSRF vì đây là REST API
- Permit all requests cho demo, trong production cần authentication
- Configure static resource access

---

## 🎨 Frontend Implementation

### 1. HTML Structure

#### `index.html` - Dashboard
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ Thống Quản Lý Thư Viện</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <!-- Navigation content -->
    </nav>

    <!-- Hero Section -->
    <div class="hero-section">
        <!-- Hero content -->
    </div>

    <!-- Stats Section -->
    <div class="stats-section py-5">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="stats-card text-center">
                        <div class="stats-icon">
                            <i class="fas fa-book text-primary"></i>
                        </div>
                        <h3 class="stats-number" id="totalBooks">0</h3>
                        <p class="stats-label">Tổng Số Sách</p>
                    </div>
                </div>
                <!-- More stats cards -->
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/api.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. CSS Styling

#### `style.css` - Custom Styles
```css
/* CSS Variables for consistency */
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --success-color: #198754;
    --info-color: #0dcaf0;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --light-color: #f8f9fa;
    --dark-color: #212529;
}

/* Hero Section with Gradient */
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 100px 0;
    position: relative;
    overflow: hidden;
}

/* Stats Cards with Hover Effects */
.stats-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
}

.stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-section {
        padding: 60px 0;
    }
    
    .stats-card {
        margin-bottom: 1rem;
    }
}
```

### 3. JavaScript Architecture

#### `api.js` - API Communication Layer
```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Helper Class
class LibraryAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Books API Methods
    static async getAllBooks() {
        return this.request('/books');
    }

    static async createBook(book) {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(book),
        });
    }

    static async updateBook(id, book) {
        return this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        });
    }

    static async deleteBook(id) {
        return this.request(`/books/${id}`, {
            method: 'DELETE',
        });
    }
}

// Utility Functions
class Utils {
    static formatDate(dateString) {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    static showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    static handleApiError(error, defaultMessage = 'Có lỗi xảy ra') {
        console.error('API Error:', error);
        
        let message = defaultMessage;
        if (error.message.includes('404')) {
            message = 'Không tìm thấy dữ liệu';
        } else if (error.message.includes('400')) {
            message = 'Dữ liệu không hợp lệ';
        } else if (error.message.includes('500')) {
            message = 'Lỗi server, vui lòng thử lại sau';
        } else if (error.message.includes('Failed to fetch')) {
            message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        }
        
        this.showAlert(message, 'danger');
    }
}
```

#### `main.js` - Dashboard Logic
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadDashboardStats();
        await loadRecentActivity();
        addEventListeners();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        Utils.handleApiError(error, 'Không thể tải dữ liệu ban đầu');
    }
}

async function loadDashboardStats() {
    try {
        // Load all data in parallel for better performance
        const [books, members, loans, availableBooks] = await Promise.all([
            LibraryAPI.getAllBooks(),
            LibraryAPI.getAllMembers(),
            LibraryAPI.getAllLoans(),
            LibraryAPI.getAvailableBooks()
        ]);

        // Update stats display
        updateStatsDisplay({
            totalBooks: books.length,
            totalMembers: members.length,
            totalLoans: loans.length,
            availableBooks: availableBooks.length
        });

        // Animate numbers
        animateNumbers();

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default values if API fails
        updateStatsDisplay({
            totalBooks: 0,
            totalMembers: 0,
            totalLoans: 0,
            availableBooks: 0
        });
    }
}

function animateNumbers() {
    const counters = document.querySelectorAll('.stats-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        const increment = target / 50; // Animation duration
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}
```

#### `books.js` - Books Management
```javascript
let currentBooks = [];
let editingBookId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    initializeEventListeners();
});

async function loadBooks() {
    const tbody = document.getElementById('booksTableBody');
    
    try {
        Utils.showLoading(tbody);
        
        const books = await LibraryAPI.getAllBooks();
        currentBooks = books;
        
        displayBooks(books);
        updateBooksCount(books.length);
        
    } catch (error) {
        console.error('Failed to load books:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải danh sách sách. Vui lòng thử lại.
                </td>
            </tr>
        `;
        Utils.handleApiError(error, 'Không thể tải danh sách sách');
    }
}

function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    
    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-book-open me-2"></i>
                    Không có sách nào trong thư viện
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr class="fade-in-up">
            <td><strong>#${book.id}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(book.title)}</div>
            </td>
            <td>${escapeHtml(book.author)}</td>
            <td>
                <span class="badge bg-info">${escapeHtml(book.genre)}</span>
            </td>
            <td>${book.publishedYear}</td>
            <td>
                ${Utils.getStatusBadge(book.available ? 'available' : 'unavailable')}
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editBook(${book.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteBook(${book.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function saveBook() {
    const form = document.getElementById('bookForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const bookData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        genre: document.getElementById('bookGenre').value,
        publishedYear: parseInt(document.getElementById('bookYear').value),
        available: document.getElementById('bookAvailable').checked
    };
    
    // Validate data
    if (!validateBookData(bookData)) {
        return;
    }
    
    try {
        const saveBtn = document.querySelector('#addBookModal .btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang lưu...';
        saveBtn.disabled = true;
        
        if (editingBookId) {
            await LibraryAPI.updateBook(editingBookId, bookData);
            Utils.showAlert('Cập nhật sách thành công!', 'success');
        } else {
            await LibraryAPI.createBook(bookData);
            Utils.showAlert('Thêm sách mới thành công!', 'success');
        }
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
        modal.hide();
        
        await loadBooks();
        
    } catch (error) {
        console.error('Failed to save book:', error);
        Utils.handleApiError(error, editingBookId ? 'Không thể cập nhật sách' : 'Không thể thêm sách');
    } finally {
        const saveBtn = document.querySelector('#addBookModal .btn-primary');
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Lưu';
        saveBtn.disabled = false;
    }
}
```

---

## 📡 API Documentation

### Books API

#### 1. Get All Books
```http
GET /api/books
```

**Response:**
```json
[
    {
        "id": 1,
        "title": "Suy Tưởng",
        "author": "Marcus Aurelius",
        "genre": "Nghệ thuật",
        "publishedYear": 2023,
        "available": true
    }
]
```

#### 2. Get Book by ID
```http
GET /api/books/{id}
```

**Response:**
```json
{
    "id": 1,
    "title": "Suy Tưởng",
    "author": "Marcus Aurelius",
    "genre": "Nghệ thuật",
    "publishedYear": 2023,
    "available": true
}
```

#### 3. Create New Book
```http
POST /api/books
Content-Type: application/json

{
    "title": "Suy Tưởng",
    "author": "Marcus Aurelius",
    "genre": "Nghệ thuật",
    "publishedYear": 2023,
    "available": true
}
```

#### 4. Update Book
```http
PUT /api/books/{id}
Content-Type: application/json

{
    "title": "Suy Tưởng (Updated)",
    "author": "Marcus Aurelius",
    "genre": "Nghệ thuật",
    "publishedYear": 2023,
    "available": false
}
```

#### 5. Delete Book
```http
DELETE /api/books/{id}
```

#### 6. Search Books
```http
GET /api/books/search?title=suy&author=marcus&genre=nghệ thuật
```

#### 7. Get Available Books
```http
GET /api/books/available
```

### Members API

#### 1. Get All Members
```http
GET /api/members
```

#### 2. Create Member
```http
POST /api/members
Content-Type: application/json

{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "password": "password123"
}
```

### Loans API

#### 1. Get All Loans
```http
GET /api/loans
```

**Response:**
```json
[
    {
        "id": 1,
        "book": {
            "id": 1,
            "title": "Suy Tưởng",
            "author": "Marcus Aurelius"
        },
        "member": {
            "id": 1,
            "name": "Nguyễn Văn A",
            "email": "nguyenvana@email.com"
        },
        "borrowDate": "2024-01-15",
        "returnDate": null,
        "status": "BORROWED"
    }
]
```

#### 2. Create Loan (Borrow Book)
```http
POST /api/loans
Content-Type: application/json

{
    "member": {"id": 1},
    "book": {"id": 1},
    "borrowDate": "2024-01-15",
    "status": "BORROWED"
}
```

#### 3. Return Book
```http
POST /api/loans/{loanId}/return
```

#### 4. Get Overdue Loans
```http
GET /api/loans/overdue
```

---

## 🧪 Testing Guide

### 1. Manual Testing

#### Testing Books Management

**Test Case 1: Add New Book**
1. Navigate to `http://localhost:8080/books.html`
2. Click "Thêm Sách Mới"
3. Fill in the form:
   - Title: "Test Book"
   - Author: "Test Author"
   - Genre: "Văn học"
   - Year: 2024
   - Available: checked
4. Click "Lưu"
5. **Expected**: Book appears in the table with success message

**Test Case 2: Search Books**
1. In the search form, enter "Test" in title field
2. Click "Tìm kiếm"
3. **Expected**: Only books with "Test" in title are shown

**Test Case 3: Update Book**
1. Click edit button on a book
2. Change the title to "Updated Test Book"
3. Click "Lưu"
4. **Expected**: Book title is updated in the table

**Test Case 4: Delete Book**
1. Click delete button on a book
2. Confirm deletion in modal
3. **Expected**: Book is removed from table

#### Testing Members Management

**Test Case 1: Add New Member**
1. Navigate to `http://localhost:8080/members.html`
2. Click "Thêm Thành Viên"
3. Fill form and save
4. **Expected**: Member appears in table

#### Testing Loans Management

**Test Case 1: Borrow Book**
1. Navigate to `http://localhost:8080/loans.html`
2. Click "Mượn Sách"
3. Select member and available book
4. Click "Mượn Sách"
5. **Expected**: 
   - New loan appears in table
   - Book status changes to "Đã Mượn"
   - Stats are updated

**Test Case 2: Return Book**
1. Find a loan with status "BORROWED"
2. Click return button
3. Confirm return
4. **Expected**:
   - Loan status changes to "RETURNED"
   - Book becomes available again
   - Return date is set

### 2. API Testing with curl

#### Test Books API
```bash
# Get all books
curl -X GET http://localhost:8080/api/books

# Create new book
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "genre": "Test Genre",
    "publishedYear": 2024,
    "available": true
  }'

# Update book
curl -X PUT http://localhost:8080/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Book",
    "author": "Test Author",
    "genre": "Test Genre",
    "publishedYear": 2024,
    "available": false
  }'

# Delete book
curl -X DELETE http://localhost:8080/api/books/1

# Search books
curl -X GET "http://localhost:8080/api/books/search?title=test"
```

### 3. Database Testing

#### Verify Data Persistence
```sql
-- Check books table
SELECT * FROM books;

-- Check members table
SELECT * FROM members;

-- Check loans table with joins
SELECT 
    l.id,
    b.title as book_title,
    m.name as member_name,
    l.borrow_date,
    l.return_date,
    l.status
FROM loans l
JOIN books b ON l.book_id = b.id
JOIN members m ON l.member_id = m.id;
```

### 4. Error Handling Testing

**Test Case 1: Invalid Data**
- Try to create book with empty title
- **Expected**: Validation error message

**Test Case 2: Non-existent Resource**
- Try to get book with ID 999999
- **Expected**: 404 error handled gracefully

**Test Case 3: Server Down**
- Stop the Spring Boot application
- Try to load any page
- **Expected**: Connection error message displayed

---

## 🚀 Deployment

### 1. Local Development Setup

#### Prerequisites
```bash
# Java 21
java -version

# Maven
mvn -version

# PostgreSQL
psql --version
```

#### Database Setup
```sql
-- Create database
CREATE DATABASE librarydb;

-- Create user (optional)
CREATE USER library_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE librarydb TO library_user;
```

#### Application Configuration
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/librarydb
spring.datasource.username=postgres
spring.datasource.password=your_password
```

#### Run Application
```bash
# Clone repository
git clone <repository-url>
cd Library

# Install dependencies
mvn clean install

# Run application
mvn spring-boot:run

# Or run JAR file
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 2. Production Deployment

#### Build for Production
```bash
# Build JAR file
mvn clean package -DskipTests

# The JAR file will be in target/demo-0.0.1-SNAPSHOT.jar
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM openjdk:21-jdk-slim

COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/librarydb
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=librarydb
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Issue**: `Port 8080 already in use`
```
***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.
```

**Solution**:
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

#### 2. Database Connection Error

**Issue**: 
```
org.postgresql.util.PSQLException: Connection refused
```

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. Verify database exists:
   ```sql
   \l  -- List databases
   ```

3. Check connection string in `application.properties`

#### 3. CORS Issues

**Issue**: Frontend can't access API
```
Access to fetch at 'http://localhost:8080/api/books' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Already handled with `@CrossOrigin(origins = "*")` in controllers

#### 4. Frontend Not Loading

**Issue**: 404 when accessing HTML pages

**Solution**: 
1. Check files are in `src/main/resources/static/`
2. Restart Spring Boot application
3. Access via `http://localhost:8080/index.html`

#### 5. API Returns Empty Arrays

**Issue**: APIs return `[]` even after adding data

**Solution**:
1. Check database has data:
   ```sql
   SELECT * FROM books;
   ```
2. Check Hibernate is creating tables:
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```

### Debug Tips

#### 1. Enable Debug Logging
```properties
logging.level.org.springframework=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

#### 2. Check Application Health
```bash
# Application endpoints
curl http://localhost:8080/actuator/health
```

#### 3. Database Debugging
```sql
-- Check table structure
\d books
\d members  
\d loans

-- Check data
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM loans;
```

---

## 📋 Best Practices

### 1. Code Organization

#### Package Structure
```
com.management.library.demo/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── service/         # Business logic
├── repository/      # Data access
├── entity/          # JPA entities
├── dto/             # Data Transfer Objects (for complex APIs)
├── exception/       # Custom exceptions
└── util/            # Utility classes
```

#### Naming Conventions
- **Classes**: PascalCase (`BookService`)
- **Methods**: camelCase (`getAllBooks()`)
- **Variables**: camelCase (`bookRepository`)
- **Constants**: UPPER_SNAKE_CASE (`LOAN_STATUS_BORROWED`)
- **Database**: snake_case (`book_id`, `member_name`)

### 2. Error Handling

#### Custom Exception Classes
```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(Long id) {
        super("Book not found with id: " + id);
    }
}

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BookNotAvailableException extends RuntimeException {
    public BookNotAvailableException(String message) {
        super(message);
    }
}
```

#### Global Exception Handler
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBookNotFound(BookNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("BOOK_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "An error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### 3. Validation

#### Entity Validation
```java
@Entity
public class Book {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Author is required")
    private String author;
    
    @Min(value = 1000, message = "Published year must be at least 1000")
    @Max(value = 2024, message = "Published year cannot be in the future")
    private int publishedYear;
}
```

#### Controller Validation
```java
@PostMapping
public ResponseEntity<Book> createBook(@Valid @RequestBody Book book, 
                                      BindingResult result) {
    if (result.hasErrors()) {
        // Handle validation errors
        return ResponseEntity.badRequest().build();
    }
    
    Book savedBook = bookService.saveBook(book);
    return ResponseEntity.ok(savedBook);
}
```

### 4. Security Improvements

#### Password Hashing
```java
@Service
public class MemberService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public Member saveMember(Member member) {
        // Hash password before saving
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        return memberRepository.save(member);
    }
}
```

#### JWT Authentication (Advanced)
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) {
        // JWT validation logic
    }
}
```

### 5. Performance Optimization

#### Database Indexing
```sql
-- Add indexes for frequently searched columns
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_loans_status ON loans(status);
```

#### JPA Query Optimization
```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Use @Query for complex queries
    @Query("SELECT b FROM Book b WHERE b.available = true AND b.genre = :genre")
    List<Book> findAvailableBooksByGenre(@Param("genre") String genre);
    
    // Use projections for limited data
    @Query("SELECT new com.example.dto.BookSummary(b.id, b.title, b.author) FROM Book b")
    List<BookSummary> findBookSummaries();
}
```

#### Caching
```java
@Service
public class BookService {
    
    @Cacheable("books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @CacheEvict(value = "books", allEntries = true)
    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }
}
```

### 6. Testing Best Practices

#### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class BookServiceTest {
    
    @Mock
    private BookRepository bookRepository;
    
    @InjectMocks
    private BookService bookService;
    
    @Test
    void shouldReturnAllBooks() {
        // Given
        List<Book> books = Arrays.asList(new Book("Title", "Author", "Genre", 2024, true));
        when(bookRepository.findAll()).thenReturn(books);
        
        // When
        List<Book> result = bookService.getAllBooks();
        
        // Then
        assertEquals(1, result.size());
        assertEquals("Title", result.get(0).getTitle());
    }
}
```

#### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class BookControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldCreateBook() {
        Book book = new Book("Title", "Author", "Genre", 2024, true);
        
        ResponseEntity<Book> response = restTemplate.postForEntity("/api/books", book, Book.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getId());
    }
}
```

---

## 🎓 Learning Path & Next Steps

### Beginner Level (Completed)
- ✅ Basic Spring Boot setup
- ✅ JPA entities and relationships
- ✅ REST API development
- ✅ Basic frontend integration
- ✅ Database connectivity

### Intermediate Level (Next Steps)
1. **Advanced JPA**
   - Custom queries with @Query
   - Specifications for dynamic queries
   - Database migrations with Flyway

2. **Security Enhancement**
   - JWT authentication
   - Role-based authorization
   - Password encryption

3. **Testing**
   - Unit tests with JUnit 5
   - Integration tests
   - Test containers

4. **API Documentation**
   - OpenAPI/Swagger integration
   - API versioning

### Advanced Level (Future)
1. **Microservices Architecture**
   - Service decomposition
   - API Gateway
   - Service discovery

2. **Monitoring & Observability**
   - Spring Boot Actuator
   - Metrics with Micrometer
   - Logging with ELK stack

3. **Performance & Scalability**
   - Caching strategies
   - Database optimization
   - Load balancing

4. **DevOps & Deployment**
   - Docker containerization
   - Kubernetes deployment
   - CI/CD pipelines

---

## 📚 Additional Resources

### Documentation
- [Spring Boot Reference](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

### Learning Materials
- [Spring Boot Tutorial](https://spring.io/guides/gs/spring-boot/)
- [JPA & Hibernate Tutorial](https://www.baeldung.com/hibernate-tutorial)
- [REST API Best Practices](https://restfulapi.net/)

### Tools & Extensions
- **IDE**: IntelliJ IDEA, VS Code
- **Database**: pgAdmin, DBeaver
- **API Testing**: Postman, Insomnia
- **Version Control**: Git, GitHub

---

## 🏁 Conclusion

Dự án Library Management System này cung cấp một nền tảng vững chắc để học Spring Boot và phát triển web application. Bạn đã học được:

1. **Architecture**: Layered architecture với separation of concerns
2. **Backend**: Spring Boot, JPA, REST API development
3. **Frontend**: Modern web development với Bootstrap
4. **Database**: PostgreSQL integration và relationship management
5. **Integration**: Full-stack application development

Hệ thống này có thể được mở rộng thêm nhiều tính năng như:
- User authentication & authorization
- Advanced search & filtering
- Notification system
- Reports & analytics
- Mobile app integration

**Happy Coding! 🚀**

---

*Document này được tạo để hỗ trợ việc học Spring Boot. Nếu có thắc mắc hoặc cần hỗ trợ thêm, hãy tham khảo các tài liệu chính thức hoặc cộng đồng Spring Boot.*
