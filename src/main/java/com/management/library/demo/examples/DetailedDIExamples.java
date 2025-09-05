package com.management.library.demo.examples;

import org.springframework.stereotype.Service;

/**
 * 🎓 FILE DEMO CHI TIẾT - Giải thích từng khái niệm DI
 * 
 * File này chứa các ví dụ thực tế để hiểu rõ các khái niệm:
 * 1. Dependency là gì?
 * 2. Immutable Fields là sao?
 * 3. IoC quản lý DI như thế nào?
 * 4. Loose Coupling là gì?
 */
public class DetailedDIExamples {

    // ===============================================
    // 1. DEPENDENCY LÀ GÌ? - VÍ DỤ THỰC TẾ
    // ===============================================
    
    /**
     * 🔗 VÍ DỤ 1: DEPENDENCY TRONG ĐỜI SỐNG
     * 
     * Giống như trong đời sống:
     * - Xe ô tô PHỤ THUỘC vào xăng để chạy
     * - Điện thoại PHỤ THUỘC vào pin để hoạt động
     * - Người PHỤ THUỘC vào thức ăn để sống
     * 
     * Trong lập trình:
     * - Class A cần Class B để hoạt động → A PHỤ THUỘC vào B
     */
    
    // ❌ VÍ DỤ TRƯỚC KHI CÓ DI - TỰ TẠO DEPENDENCY
    static class BadBookController_WithoutDI {
        private BookService_Example bookService;
        
        public BadBookController_WithoutDI() {
            // ❌ Tự tạo dependency - TIGHT COUPLING
            this.bookService = new BookService_Example();
            //     👆 Đây chính là DEPENDENCY!
            //     BookController PHỤ THUỘC vào BookService
            //     để có thể xử lý các request về sách
        }
        
        public String getAllBooks() {
            return bookService.findAllBooks(); // Sử dụng dependency
        }
    }
    
    // ✅ VÍ DỤ SAU KHI CÓ DI - INJECT DEPENDENCY
    static class GoodBookController_WithDI {
        private final BookService_Example bookService; // IMMUTABLE FIELD
        
        // ✅ Constructor injection - Spring sẽ inject dependency
        public GoodBookController_WithDI(BookService_Example bookService) {
            this.bookService = bookService;
            //     👆 Dependency được INJECT từ bên ngoài
            //     Controller không tự tạo, chỉ nhận vào sử dụng
        }
        
        public String getAllBooks() {
            return bookService.findAllBooks(); // Sử dụng dependency
        }
    }
    
    // ===============================================
    // 2. IMMUTABLE FIELDS LÀ SAO? - VÍ DỤ CHI TIẾT
    // ===============================================
    
    /**
     * 🔒 IMMUTABLE = KHÔNG THỂ THAY ĐỔI
     * 
     * Ví dụ thực tế:
     * - Số CMND: Một khi cấp thì không đổi được (IMMUTABLE)
     * - Màu tóc: Có thể nhuộm đổi màu (MUTABLE)
     * - Ngày sinh: Không thể thay đổi (IMMUTABLE)
     * - Cân nặng: Có thể thay đổi (MUTABLE)
     */
    
    // ❌ MUTABLE FIELDS - CÓ THỂ THAY ĐỔI
    static class MutableExample {
        private BookService_Example bookService; // Không có 'final'
        
        public MutableExample(BookService_Example bookService) {
            this.bookService = bookService;
        }
        
        // ❌ Có thể thay đổi dependency sau khi tạo object
        public void changeService(BookService_Example newService) {
            this.bookService = newService; // ← CÓ THỂ THAY ĐỔI!
        }
        
        // Vấn đề: Không biết service nào đang được dùng!
    }
    
    // ✅ IMMUTABLE FIELDS - KHÔNG THỂ THAY ĐỔI
    static class ImmutableExample {
        private final BookService_Example bookService; // Có 'final'
        
        public ImmutableExample(BookService_Example bookService) {
            this.bookService = bookService; // Chỉ gán được 1 lần!
        }
        
        // ✅ Không thể thay đổi dependency
        // public void changeService(BookService_Example newService) {
        //     this.bookService = newService; // ← COMPILE ERROR!
        // }
        
        // Lợi ích: Luôn biết chính xác service nào đang được dùng!
    }
    
    // ===============================================
    // 3. IoC CONTAINER QUẢN LÝ DI NHƯ THẾ NÀO?
    // ===============================================
    
    /**
     * 🏭 IoC CONTAINER = NHÀ MÁY TỰ ĐỘNG
     * 
     * Tưởng tượng một nhà máy ô tô:
     * 1. Nhà máy biết cách làm từng bộ phận: động cơ, bánh xe, ghế ngồi
     * 2. Khi cần lắp ráp xe, nhà máy tự động lấy các bộ phận
     * 3. Lắp ráp thành xe hoàn chỉnh và giao cho khách hàng
     * 
     * IoC Container hoạt động tương tự:
     * 1. Container biết cách tạo các beans: BookService, BookRepository
     * 2. Khi cần BookController, container tự động lấy BookService
     * 3. Inject vào BookController và giao cho application sử dụng
     */
    
    // Bước 1: Container scan và tìm thấy các beans
    @Service // ← Container nhận ra đây là bean
    static class BookService_Example {
        public String findAllBooks() {
            return "Danh sách tất cả sách";
        }
    }
    
    // Bước 2: Container tạo BookController và tự động inject BookService
    static class AutoWiredExample {
        private final BookService_Example bookService;
        
        // Container thấy constructor này, tự động inject BookService_Example
        public AutoWiredExample(BookService_Example bookService) {
            this.bookService = bookService;
            System.out.println("🏭 IoC Container đã inject BookService!");
        }
    }
    
    // ===============================================
    // 4. LOOSE COUPLING LÀ GÌ? - VÍ DỤ SINH ĐỘNG
    // ===============================================
    
    /**
     * 🎭 TIGHT COUPLING vs LOOSE COUPLING
     * 
     * Ví dụ thực tế:
     * 
     * TIGHT COUPLING (Kết dính chặt):
     * - iPhone cũ chỉ dùng được sạc Lightning
     * - Nếu hỏng sạc phải mua chính hãng, đắt đỏ
     * - Không thể dùng sạc của hãng khác
     * 
     * LOOSE COUPLING (Kết nối lỏng):
     * - Laptop hiện đại dùng USB-C
     * - Có thể dùng sạc của nhiều hãng khác nhau
     * - Linh hoạt, tiết kiệm, dễ thay thế
     */
    
    // ❌ TIGHT COUPLING - KẾT DÍNH CHẶT
    static class TightCouplingExample {
        private GmailSender emailSender; // Cứng nhắc - chỉ dùng Gmail
        
        public TightCouplingExample() {
            this.emailSender = new GmailSender(); // ← KẾT DÍNH CHẶT!
            // Muốn đổi sang Outlook? Phải sửa code!
        }
        
        public void sendNotification(String message) {
            emailSender.sendEmail(message); // Chỉ có thể gửi qua Gmail
        }
    }
    
    // ✅ LOOSE COUPLING - KẾT NỐI LỎNG
    static class LooseCouplingExample {
        private EmailSender emailSender; // Linh hoạt - dùng interface
        
        // Có thể inject bất kỳ implementation nào của EmailSender
        public LooseCouplingExample(EmailSender emailSender) {
            this.emailSender = emailSender; // ← KẾT NỐI LỎNG!
            // Có thể là Gmail, Outlook, SMS, hay Mock để test
        }
        
        public void sendNotification(String message) {
            emailSender.sendEmail(message); // Có thể gửi qua nhiều cách
        }
    }
    
    // Interface cho EmailSender
    interface EmailSender {
        void sendEmail(String message);
    }
    
    // Các implementations khác nhau
    static class GmailSender implements EmailSender {
        public void sendEmail(String message) {
            System.out.println("📧 Gửi qua Gmail: " + message);
        }
    }
    
    static class OutlookSender implements EmailSender {
        public void sendEmail(String message) {
            System.out.println("📧 Gửi qua Outlook: " + message);
        }
    }
    
    static class SMSSender implements EmailSender {
        public void sendEmail(String message) {
            System.out.println("📱 Gửi qua SMS: " + message);
        }
    }
    
    static class MockSender implements EmailSender {
        public void sendEmail(String message) {
            System.out.println("🧪 Mock sender cho testing: " + message);
        }
    }
    
    // ===============================================
    // 5. VÍ DỤ TRONG DỰ ÁN LIBRARY MANAGEMENT
    // ===============================================
    
    /**
     * 📚 CÁCH DI ĐƯỢC ÁP DỤNG TRONG DỰ ÁN CỦA CHÚNG TA
     * 
     * 1. BookController PHỤ THUỘC BookService (dependency)
     * 2. BookService PHỤ THUỘC BookRepository (dependency)
     * 3. BookRepository PHỤ THUỘC Database (dependency)
     * 
     * Spring IoC Container:
     * - Tự động tạo BookRepository
     * - Inject BookRepository vào BookService
     * - Inject BookService vào BookController
     * - Tất cả đều sử dụng immutable fields (final)
     */
    
    // Trong dự án thực tế:
    /*
    @RestController
    public class BookController {
        private final BookService bookService; // ← DEPENDENCY + IMMUTABLE
        
        // Constructor injection
        public BookController(BookService bookService) {
            this.bookService = bookService; // ← DI in action!
        }
    }
    
    @Service
    public class BookService {
        private final BookRepository bookRepository; // ← DEPENDENCY + IMMUTABLE
        
        // Constructor injection
        public BookService(BookRepository bookRepository) {
            this.bookRepository = bookRepository; // ← DI in action!
        }
    }
    */
}

/**
 * 🎯 TÓM TẮT CÁC KHÁI NIỆM:
 * 
 * 1. 🔗 DEPENDENCY: Class A cần Class B → A phụ thuộc B
 *    VD: BookController cần BookService để hoạt động
 * 
 * 2. 🔒 IMMUTABLE FIELDS: Dùng 'final', không thể thay đổi sau khi gán
 *    VD: private final BookService service; (như số CMND)
 * 
 * 3. 🏭 IoC CONTAINER: "Nhà máy" tự động tạo và inject dependencies
 *    - Scan → Create → Store → Inject
 * 
 * 4. 🎭 LOOSE COUPLING: Sử dụng interfaces, linh hoạt thay đổi implementations
 *    VD: Laptop dùng USB-C (nhiều loại sạc) thay vì Lightning (1 loại)
 * 
 * 💡 TẤT CẢ KẾT HỢP LẠI:
 * DI + IoC + Immutable + Loose Coupling = Code dễ test, maintain, flexible!
 */
