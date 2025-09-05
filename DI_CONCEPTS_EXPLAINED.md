# 🎯 DEPENDENCY INJECTION (DI) TRONG DỰ ÁN LIBRARY MANAGEMENT

## 📚 DI là gì?

**Dependency Injection** là một design pattern trong đó:
- Objects không tự tạo ra dependencies của mình
- Dependencies được "inject" (tiêm) từ bên ngoài
- Spring Framework sử dụng **IoC (Inversion of Control)** container để quản lý DI

### 🔄 Trước khi có DI:
```java
public class BookService {
    private BookRepository repository;
    
    public BookService() {
        // Tự tạo dependency - TIGHT COUPLING
        this.repository = new BookRepositoryImpl();
    }
}
```

### ✅ Với DI:
```java
@Service
public class BookService {
    private final BookRepository repository;
    
    // Constructor injection - Spring tự inject
    public BookService(BookRepository repository) {
        this.repository = repository;
    }
}
```

## 🛠️ CÁC CÁCH TRIỂN KHAI DI TRONG SPRING

### 1. 🏗️ Constructor Injection (KHUYÊN DÙNG)

**Ưu điểm:**
- ✅ Dependencies bắt buộc phải có
- ✅ Immutable fields (final)
- ✅ Dễ test
- ✅ Fail fast nếu thiếu dependency

**Ví dụ trong dự án:**
```java
@Service
public class BookService {
    private final BookRepository bookRepository;

    @Autowired // Optional từ Spring 4.3+
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
}
```

### 2. 📝 Field Injection (KHÔNG KHUYÊN DÙNG)

**Nhược điểm:**
- ❌ Khó test (không thể inject mock)
- ❌ Không thể tạo immutable fields
- ❌ Ẩn dependencies
- ❌ Circular dependency khó phát hiện

**Ví dụ:**
```java
@RestController
public class BookController {
    @Autowired
    private BookService bookService; // Không khuyên dùng
}
```

### 3. ⚙️ Setter Injection

**Khi nào dùng:**
- ✅ Optional dependencies
- ✅ Cần thay đổi dependency sau khi tạo object

**Ví dụ:**
```java
@Service
public class BookService {
    private BookRepository repository;
    
    @Autowired(required = false)
    public void setRepository(BookRepository repository) {
        this.repository = repository;
    }
}
```

## 🔄 BEAN SCOPES VÀ VÒNG ĐỜI

### 1. 🏠 Singleton Scope (Default)

**Đặc điểm:**
- ⭐ **MỘT** instance duy nhất trong toàn bộ Spring container
- 🏗️ Được tạo khi container khởi động (eager loading)
- ♻️ Được chia sẻ cho tất cả requests
- 🧠 Phù hợp cho **stateless** services

**Vòng đời:**
```
Container Start → Bean Created → Bean Initialized → Ready for Use → Container Shutdown → Bean Destroyed
```

**Ví dụ trong dự án:**
```java
@Service  // Mặc định là Singleton
public class BookService {
    // Chỉ có 1 instance của BookService trong toàn app
}
```

### 2. 🆕 Prototype Scope

**Đặc điểm:**
- 🔄 Instance **MỚI** mỗi khi được request
- 💾 Không được cached
- 🗑️ Spring không quản lý lifecycle sau khi tạo
- 🧠 Phù hợp cho **stateful** objects

**Vòng đời:**
```
Bean Requested → New Instance Created → Bean Initialized → Used → NOT managed by Spring
```

**Ví dụ:**
```java
@Component
@Scope("prototype")
public class BookValidator {
    // Mỗi lần inject sẽ tạo instance mới
}
```

### 3. 🌐 Request Scope (Web only)

**Đặc điểm:**
- 🔄 Instance mới cho mỗi **HTTP request**
- 🗑️ Bị destroy khi request kết thúc
- 🌐 Chỉ available trong web context

**Vòng đời:**
```
HTTP Request Start → Bean Created → Used in Request → Request End → Bean Destroyed
```

### 4. 👤 Session Scope (Web only)

**Đặc điểm:**
- 🔄 Instance mới cho mỗi **HTTP session**
- ⏰ Tồn tại suốt session của user
- 🗑️ Bị destroy khi session expire

**Vòng đời:**
```
New Session → Bean Created → Used throughout Session → Session Timeout → Bean Destroyed
```

### 5. 🔧 Application Scope

**Đặc điểm:**
- 🏠 Giống Singleton nhưng ở mức **ServletContext**
- 🌐 Một instance cho toàn bộ web application

## 🎯 @QUALIFIER VÀ @PRIMARY

### Khi nào cần dùng?
Khi có **nhiều implementations** của cùng 1 interface:

```java
// Có nhiều BookValidator implementations
@Component
@Primary  // Được ưu tiên khi không chỉ định cụ thể
public class DefaultBookValidator implements BookValidator { }

@Component
@Qualifier("advanced")
public class AdvancedBookValidator implements BookValidator { }

@Component
@Qualifier("simple")
public class SimpleBookValidator implements BookValidator { }
```

### Cách sử dụng:
```java
@Service
public class BookService {
    private final BookValidator defaultValidator;
    private final BookValidator advancedValidator;
    
    public BookService(
        BookValidator defaultValidator,  // Sẽ inject @Primary
        @Qualifier("advanced") BookValidator advancedValidator
    ) {
        this.defaultValidator = defaultValidator;
        this.advancedValidator = advancedValidator;
    }
}
```

## 📊 CÁCH DI ĐƯỢC ÁP DỤNG TRONG DỰ ÁN CỦA CHÚNG TA

### 1. Controller Layer
```java
@RestController
@RequestMapping("/api/books")
public class BookController {
    @Autowired  // Field injection (trong code hiện tại)
    private BookService bookService;
    
    // KHUYÊN NÊN SỬA THÀNH:
    // private final BookService bookService;
    // public BookController(BookService bookService) {
    //     this.bookService = bookService;
    // }
}
```

### 2. Service Layer
```java
@Service
@Transactional
public class BookService {
    private final BookRepository bookRepository;

    @Autowired  // Constructor injection - GOOD!
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
}
```

### 3. Repository Layer
```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Spring Data JPA tự động tạo implementation
    // và register như một bean
}
```

## 🔧 LIFECYCLE CALLBACKS

Spring cho phép bạn hook vào lifecycle của beans:

```java
@Component
public class BookCacheManager {
    
    @PostConstruct  // Gọi sau khi bean được inject xong
    public void initialize() {
        System.out.println("📚 Initializing book cache...");
    }
    
    @PreDestroy  // Gọi trước khi bean bị destroy
    public void cleanup() {
        System.out.println("🧹 Cleaning up book cache...");
    }
}
```

## 🧪 TESTING VỚI DI

### Unit Testing:
```java
@ExtendWith(MockitoExtension.class)
class BookServiceTest {
    
    @Mock
    private BookRepository mockRepository;
    
    private BookService bookService;
    
    @BeforeEach
    void setUp() {
        // Constructor injection giúp dễ dàng inject mock
        bookService = new BookService(mockRepository);
    }
    
    @Test
    void testGetAllBooks() {
        // Test với mock repository
        when(mockRepository.findAll()).thenReturn(Arrays.asList(new Book()));
        
        List<Book> books = bookService.getAllBooks();
        
        assertThat(books).hasSize(1);
    }
}
```

## 🎯 BEST PRACTICES

### ✅ DO:
1. **Sử dụng Constructor Injection** cho required dependencies
2. **Sử dụng final fields** để đảm bảo immutability
3. **Sử dụng @Qualifier** khi có nhiều implementations
4. **Tránh circular dependencies**
5. **Prefer interfaces** over concrete classes

### ❌ DON'T:
1. **Tránh Field Injection** trừ khi thật sự cần thiết
2. **Không tạo quá nhiều dependencies** trong 1 class
3. **Không inject ApplicationContext** trừ khi cần thiết
4. **Tránh static fields/methods** trong Spring beans

## 🚀 TEST DI TRONG DỰ ÁN

Sau khi chạy application, bạn có thể test các endpoints sau:

```bash
# Demo Singleton scope
GET http://localhost:8080/api/demo/di/singleton-demo

# Demo Prototype scope  
GET http://localhost:8080/api/demo/di/prototype-demo

# So sánh các scope
GET http://localhost:8080/api/demo/di/scope-comparison

# Demo @Qualifier
GET http://localhost:8080/api/demo/di/qualifier-demo

# Giải thích khái niệm DI
GET http://localhost:8080/api/demo/di/di-explanation
```

## 🎯 TÓM TẮT

**Dependency Injection** là nền tảng của Spring Framework, giúp:
- 🔧 **Loose coupling** between components
- 🧪 **Better testability**
- ♻️ **Code reusability**
- 🎛️ **Configuration flexibility**

**Bean Scopes** quyết định vòng đời và cách thức tạo instances:
- **Singleton**: Một instance duy nhất
- **Prototype**: Instance mới mỗi lần request
- **Request/Session**: Gắn với lifecycle của HTTP request/session

Hiểu rõ DI sẽ giúp bạn xây dựng applications có **architecture tốt**, **dễ maintain** và **dễ test**! 🚀
