package com.management.library.demo.example;

/**
 * 🎯 DEMO THỰC TẾ: TIGHT COUPLING VS LOOSE COUPLING
 * 
 * File này minh họa sự khác biệt giữa tight coupling và loose coupling
 * để giúp hiểu rõ hơn về lợi ích của Dependency Injection
 */

// ===============================================
// 1. VÍ DỤ TIGHT COUPLING (XẤU)
// ===============================================

/**
 * ❌ TIGHT COUPLING EXAMPLE
 * EmailService bị "kết dính" chặt chẽ với GmailSender
 */
class TightCouplingExample {
    
    // Concrete class - không linh hoạt
    static class GmailSender {
        public void sendEmail(String to, String message) {
            System.out.println("📧 Sending via Gmail to: " + to);
            System.out.println("💌 Message: " + message);
            // Logic gửi email qua Gmail API
        }
    }
    
    // ❌ BAD: EmailService phụ thuộc trực tiếp vào GmailSender
    static class EmailService {
        private GmailSender sender; // DEPENDENCY - nhưng TIGHT COUPLING
        
        public EmailService() {
            // Tự tạo dependency - KHÔNG LINH HOẠT
            this.sender = new GmailSender();
        }
        
        public void sendWelcomeEmail(String userEmail) {
            sender.sendEmail(userEmail, "Welcome to Library System!");
        }
        
        // ❌ VẤN ĐỀ:
        // - Muốn đổi sang Outlook? Phải sửa code!
        // - Muốn test mà không gửi email thật? KHÔNG THỂ!
        // - Muốn gửi SMS thay vì email? Phải viết lại class!
    }
}

// ===============================================
// 2. VÍ DỤ LOOSE COUPLING (TỐT)
// ===============================================

/**
 * ✅ LOOSE COUPLING EXAMPLE  
 * NotificationService chỉ phụ thuộc vào interface
 */
class LooseCouplingExample {
    
    // INTERFACE - Tạo abstraction
    interface MessageSender {
        void sendMessage(String to, String message);
    }
    
    // Concrete implementations
    static class GmailSender implements MessageSender {
        @Override
        public void sendMessage(String to, String message) {
            System.out.println("📧 Gmail: Sending to " + to + " - " + message);
        }
    }
    
    static class OutlookSender implements MessageSender {
        @Override
        public void sendMessage(String to, String message) {
            System.out.println("📨 Outlook: Sending to " + to + " - " + message);
        }
    }
    
    static class SMSSender implements MessageSender {
        @Override
        public void sendMessage(String to, String message) {
            System.out.println("📱 SMS: Sending to " + to + " - " + message);
        }
    }
    
    static class MockSender implements MessageSender {
        @Override
        public void sendMessage(String to, String message) {
            System.out.println("🧪 MOCK: Would send to " + to + " - " + message);
        }
    }
    
    // ✅ GOOD: NotificationService chỉ phụ thuộc vào interface
    static class NotificationService {
        private final MessageSender sender; // DEPENDENCY - nhưng LOOSE COUPLING
        
        // Constructor injection - nhận dependency từ bên ngoài
        public NotificationService(MessageSender sender) {
            this.sender = sender; // IMMUTABLE FIELD
        }
        
        public void sendWelcomeMessage(String userContact) {
            sender.sendMessage(userContact, "Welcome to Library System!");
        }
        
        // ✅ LỢI ÍCH:
        // - Muốn đổi implementation? Chỉ cần inject implementation khác!
        // - Muốn test? Inject MockSender!
        // - Muốn gửi SMS? Inject SMSSender!
        // - Không cần sửa code của NotificationService!
    }
}

// ===============================================
// 3. DEMO IMMUTABLE VS MUTABLE FIELDS
// ===============================================

/**
 * 🔒 DEMO: IMMUTABLE vs MUTABLE FIELDS
 */
class ImmutableVsMutableExample {
    
    static class DatabaseConnection {
        private String url;
        
        public DatabaseConnection(String url) {
            this.url = url;
        }
        
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
    
    // ❌ MUTABLE FIELDS - Có thể thay đổi
    static class MutableService {
        private DatabaseConnection connection; // Không có 'final'
        
        public MutableService(DatabaseConnection connection) {
            this.connection = connection;
        }
        
        public void riskyMethod() {
            // ❌ NGUY HIỂM: Ai đó có thể thay đổi connection
            this.connection = null; // Có thể gây NullPointerException
            this.connection = new DatabaseConnection("wrong-url");
        }
        
        public void doWork() {
            // Không chắc chắn connection còn đúng không
            System.out.println("Working with: " + connection.getUrl());
        }
    }
    
    // ✅ IMMUTABLE FIELDS - Không thể thay đổi
    static class ImmutableService {
        private final DatabaseConnection connection; // Có 'final'
        
        public ImmutableService(DatabaseConnection connection) {
            this.connection = connection;
        }
        
        public void safeMethod() {
            // ✅ AN TOÀN: Không thể thay đổi connection
            // this.connection = null; // ❌ COMPILE ERROR!
            // this.connection = new DatabaseConnection("wrong-url"); // ❌ COMPILE ERROR!
        }
        
        public void doWork() {
            // Chắc chắn connection luôn đúng như ban đầu
            System.out.println("Safely working with: " + connection.getUrl());
        }
    }
}

// ===============================================
// 4. DEMO: TRƯỚC VÀ SAU KHI CÓ IoC CONTAINER
// ===============================================

/**
 * 🏭 DEMO: Manual vs IoC Container
 */
class ManualVsIoCExample {
    
    // ❌ TRƯỚC KHI CÓ IoC - Tự quản lý tất cả
    static class ManualApproach {
        public static void main(String[] args) {
            System.out.println("=== ❌ MANUAL APPROACH ===");
            
            // Phải tự tạo tất cả dependencies theo đúng thứ tự
            LooseCouplingExample.GmailSender sender = new LooseCouplingExample.GmailSender();
            LooseCouplingExample.NotificationService notificationService = 
                new LooseCouplingExample.NotificationService(sender);
            
            // Nếu có nhiều dependencies phức tạp:
            // DatabaseConnection db = new DatabaseConnection("url");
            // UserRepository userRepo = new UserRepository(db);
            // UserService userService = new UserService(userRepo, notificationService);
            // UserController userController = new UserController(userService);
            
            notificationService.sendWelcomeMessage("user@example.com");
        }
    }
    
    // ✅ VỚI IoC - Spring Container tự quản lý
    /*
     * Spring tự động làm:
     * 
     * @Component
     * class GmailSender implements MessageSender { ... }
     * 
     * @Service 
     * class NotificationService {
     *     public NotificationService(MessageSender sender) { ... }
     * }
     * 
     * Spring Container sẽ:
     * 1. Tạo GmailSender
     * 2. Tạo NotificationService và inject GmailSender
     * 3. Lưu trong container
     * 4. Inject khi cần thiết
     */
}

// ===============================================
// 5. DEMO TESTING VỚI VÀ KHÔNG VỚI DI
// ===============================================

/**
 * 🧪 DEMO: Testing với và không với DI
 */
class TestingExample {
    
    // ❌ KHÓ TEST - Tight coupling
    static class HardToTestService {
        private LooseCouplingExample.GmailSender sender;
        
        public HardToTestService() {
            this.sender = new LooseCouplingExample.GmailSender(); // Luôn gửi email thật
        }
        
        public boolean sendWelcomeEmail(String email) {
            sender.sendMessage(email, "Welcome!");
            return true; // Làm sao biết có gửi thành công?
        }
        
        // ❌ VẤN ĐỀ KHI TEST:
        // - Mỗi lần test sẽ gửi email thật
        // - Cần internet để test
        // - Không kiểm soát được kết quả
        // - Test chậm và không ổn định
    }
    
    // ✅ DỄ TEST - Dependency injection
    static class EasyToTestService {
        private final LooseCouplingExample.MessageSender sender;
        
        public EasyToTestService(LooseCouplingExample.MessageSender sender) {
            this.sender = sender;
        }
        
        public boolean sendWelcomeEmail(String email) {
            sender.sendMessage(email, "Welcome!");
            return true;
        }
        
        // ✅ LỢI ÍCH KHI TEST:
        // - Inject MockSender để test
        // - Không cần internet
        // - Kiểm soát được behavior
        // - Test nhanh và ổn định
    }
    
    // Unit test example (không chạy được ở đây, chỉ để minh họa)
    /*
    @Test
    public void testSendWelcomeEmail() {
        // Arrange
        MessageSender mockSender = mock(MessageSender.class);
        EasyToTestService service = new EasyToTestService(mockSender);
        
        // Act
        boolean result = service.sendWelcomeEmail("test@example.com");
        
        // Assert
        assertTrue(result);
        verify(mockSender).sendMessage("test@example.com", "Welcome!");
    }
    */
}

// ===============================================
// 6. MAIN CLASS ĐỂ CHẠY DEMO
// ===============================================

/**
 * 🚀 CHẠY DEMO ĐỂ XEM SỰ KHÁC BIỆT
 */
public class DIConceptsDemo {
    
    public static void main(String[] args) {
        System.out.println("🎯 DEPENDENCY INJECTION CONCEPTS DEMO");
        System.out.println("=====================================");
        
        demonstrateTightCoupling();
        System.out.println();
        
        demonstrateLooseCoupling();
        System.out.println();
        
        demonstrateImmutableFields();
        System.out.println();
        
        demonstrateFlexibility();
    }
    
    private static void demonstrateTightCoupling() {
        System.out.println("❌ TIGHT COUPLING DEMO:");
        
        TightCouplingExample.EmailService emailService = 
            new TightCouplingExample.EmailService();
        emailService.sendWelcomeEmail("user@example.com");
        
        System.out.println("🚫 Vấn đề: Chỉ có thể gửi qua Gmail, không linh hoạt!");
    }
    
    private static void demonstrateLooseCoupling() {
        System.out.println("✅ LOOSE COUPLING DEMO:");
        
        // Có thể dễ dàng thay đổi implementation
        LooseCouplingExample.MessageSender gmailSender = 
            new LooseCouplingExample.GmailSender();
        LooseCouplingExample.NotificationService service1 = 
            new LooseCouplingExample.NotificationService(gmailSender);
        service1.sendWelcomeMessage("user@example.com");
        
        // Đổi sang Outlook mà không cần sửa NotificationService
        LooseCouplingExample.MessageSender outlookSender = 
            new LooseCouplingExample.OutlookSender();
        LooseCouplingExample.NotificationService service2 = 
            new LooseCouplingExample.NotificationService(outlookSender);
        service2.sendWelcomeMessage("user@example.com");
        
        // Đổi sang SMS
        LooseCouplingExample.MessageSender smsSender = 
            new LooseCouplingExample.SMSSender();
        LooseCouplingExample.NotificationService service3 = 
            new LooseCouplingExample.NotificationService(smsSender);
        service3.sendWelcomeMessage("0901234567");
        
        System.out.println("✨ Lợi ích: Linh hoạt, dễ thay đổi implementation!");
    }
    
    private static void demonstrateImmutableFields() {
        System.out.println("🔒 IMMUTABLE FIELDS DEMO:");
        
        ImmutableVsMutableExample.DatabaseConnection connection = 
            new ImmutableVsMutableExample.DatabaseConnection("postgresql://localhost:5432");
        
        ImmutableVsMutableExample.ImmutableService immutableService = 
            new ImmutableVsMutableExample.ImmutableService(connection);
        immutableService.doWork();
        
        // Thử với mutable service
        ImmutableVsMutableExample.MutableService mutableService = 
            new ImmutableVsMutableExample.MutableService(connection);
        mutableService.doWork();
        mutableService.riskyMethod(); // Có thể gây lỗi
        
        try {
            mutableService.doWork(); // Có thể crash
        } catch (Exception e) {
            System.out.println("💥 Lỗi do mutable field: " + e.getMessage());
        }
        
        System.out.println("🛡️ Immutable fields giúp code an toàn hơn!");
    }
    
    private static void demonstrateFlexibility() {
        System.out.println("🎭 FLEXIBILITY DEMO - Testing vs Production:");
        
        // Production: dùng real implementation
        LooseCouplingExample.MessageSender productionSender = 
            new LooseCouplingExample.GmailSender();
        LooseCouplingExample.NotificationService productionService = 
            new LooseCouplingExample.NotificationService(productionSender);
        System.out.println("🏭 Production mode:");
        productionService.sendWelcomeMessage("customer@example.com");
        
        // Testing: dùng mock implementation
        LooseCouplingExample.MessageSender mockSender = 
            new LooseCouplingExample.MockSender();
        LooseCouplingExample.NotificationService testService = 
            new LooseCouplingExample.NotificationService(mockSender);
        System.out.println("🧪 Testing mode:");
        testService.sendWelcomeMessage("test@example.com");
        
        System.out.println("🚀 Cùng một code, khác nhau implementation!");
    }
}
