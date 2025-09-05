package com.management.library.demo.controller;

import com.management.library.demo.config.DIConceptsDemo.BookValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 🎯 DEMO CONTROLLER - Minh họa các khái niệm DI trong thực tế
 * 
 * Controller này demonstrate cách DI hoạt động với các scope khác nhau
 * và cách Spring quản lý vòng đời của các beans
 */
@RestController
@RequestMapping("/api/demo/di")
public class DIConceptsDemoController {

    // ===============================================
    // CONSTRUCTOR INJECTION (KHUYÊN DÙNG)
    // ===============================================
    private final BookValidator primaryValidator;
    private final BookValidator secondaryValidator;
    private final ApplicationContext applicationContext;

    /**
     * 🏗️ Constructor Injection
     * - Spring tự động inject các dependencies
     * - @Qualifier giúp chỉ định bean cụ thể khi có nhiều implementations
     */
    public DIConceptsDemoController(
            @Qualifier("primaryValidator") BookValidator primaryValidator,
            @Qualifier("secondaryValidator") BookValidator secondaryValidator,
            ApplicationContext applicationContext) {
        
        this.primaryValidator = primaryValidator;
        this.secondaryValidator = secondaryValidator;
        this.applicationContext = applicationContext;
        
        System.out.println("🎯 DIConceptsDemoController được khởi tạo!");
        System.out.println("📌 Primary Validator: " + primaryValidator.getName());
        System.out.println("📌 Secondary Validator: " + secondaryValidator.getName());
    }

    // ===============================================
    // FIELD INJECTION (Chỉ để demo - không khuyên dùng)
    // ===============================================
    @Autowired
    @Qualifier("singletonValidator")
    private BookValidator singletonValidator;

    // ===============================================
    // DEMO ENDPOINTS
    // ===============================================

    /**
     * 🔗 Endpoint giải thích DEPENDENCY chi tiết
     */
    @GetMapping("/dependency-explained")
    public Map<String, Object> explainDependency() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "🔗 DEPENDENCY EXPLAINED");
        
        result.put("what_is_dependency", "Dependency = Class A cần Class B để hoạt động → A phụ thuộc vào B");
        
        Map<String, String> examples = new HashMap<>();
        examples.put("real_world", "Xe máy (A) cần xăng (B) để chạy → Xe máy phụ thuộc vào xăng");
        examples.put("code_example", "BookController cần BookService để xử lý → BookController phụ thuộc vào BookService");
        result.put("examples", examples);
        
        Map<String, String> inOurProject = new HashMap<>();
        inOurProject.put("controller_dependency", "BookController phụ thuộc BookService");
        inOurProject.put("service_dependency", "BookService phụ thuộc BookRepository");
        inOurProject.put("repository_dependency", "BookRepository phụ thuộc Database Connection");
        result.put("in_our_project", inOurProject);
        
        Map<String, String> problemWithoutDI = new HashMap<>();
        problemWithoutDI.put("tight_coupling", "BookController tự tạo BookService → không thể thay đổi");
        problemWithoutDI.put("hard_to_test", "Không thể inject mock service để test");
        problemWithoutDI.put("not_flexible", "Muốn dùng service khác phải sửa code");
        result.put("problems_without_di", problemWithoutDI);
        
        return result;
    }

    /**
     * 🎭 Endpoint demo thực tế về Tight vs Loose Coupling
     */
    @GetMapping("/coupling-demo")
    public Map<String, Object> demonstrateCoupling() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "🎭 TIGHT vs LOOSE COUPLING DEMO");
        
        result.put("tight_coupling_problem", "EmailService bị kết dính chặt với GmailSender - không linh hoạt");
        result.put("loose_coupling_solution", "NotificationService chỉ phụ thuộc interface - có thể thay đổi implementation");
        
        Map<String, String> examples = new HashMap<>();
        examples.put("tight_coupling", "new EmailService() → luôn dùng Gmail, không thể test");
        examples.put("loose_coupling", "new NotificationService(sender) → có thể inject Gmail, Outlook, SMS, hoặc Mock");
        result.put("examples", examples);
        
        Map<String, String> realWorld = new HashMap<>();
        realWorld.put("tight_coupling_example", "iPhone cũ → chỉ dùng sạc Lightning (kết dính chặt)");
        realWorld.put("loose_coupling_example", "Laptop hiện đại → dùng USB-C universal (kết nối lỏng)");
        result.put("real_world_analogy", realWorld);
        
        return result;
    }

    /**
     * 🔒 Endpoint demo về Immutable Fields
     */
    @GetMapping("/immutable-demo")
    public Map<String, Object> demonstrateImmutable() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "🔒 IMMUTABLE FIELDS DEMO");
        
        result.put("definition", "Immutable = Không thể thay đổi sau khi được gán");
        result.put("how_to_create", "Dùng từ khóa 'final' cho field");
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("mutable_field", "private BookService service; // Có thể thay đổi sau này");
        comparison.put("immutable_field", "private final BookService service; // Không thể thay đổi");
        comparison.put("benefit", "An toàn, ít bug, dễ dự đoán");
        result.put("code_comparison", comparison);
        
        Map<String, String> analogy = new HashMap<>();
        analogy.put("immutable_example", "Số CMND - một khi cấp không thể đổi");
        analogy.put("mutable_example", "Màu tóc - có thể nhuộm đổi màu");
        result.put("real_world_analogy", analogy);
        
        return result;
    }

    /**
     * 🏭 Endpoint giải thích IoC Container
     */
    @GetMapping("/ioc-container-demo")
    public Map<String, Object> explainIoCContainer() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "🏭 IoC CONTAINER EXPLANATION");
        
        result.put("what_is_ioc", "Inversion of Control - Đảo ngược quyền kiểm soát");
        result.put("before_ioc", "Objects tự tạo dependencies → Tự kiểm soát");
        result.put("after_ioc", "Container tạo và inject dependencies → Kiểm soát bị đảo ngược");
        
        Map<String, String> containerSteps = new HashMap<>();
        containerSteps.put("step1", "🔍 Scan: Tìm các class có @Component, @Service, @Repository");
        containerSteps.put("step2", "🏗️ Create: Tạo instances của các beans");
        containerSteps.put("step3", "📦 Store: Lưu beans trong container");
        containerSteps.put("step4", "🎯 Inject: Cung cấp beans khi cần");
        result.put("container_workflow", containerSteps);
        
        Map<String, String> factoryAnalogy = new HashMap<>();
        factoryAnalogy.put("before", "Công nhân tự làm tất cả: mua nguyên liệu → sản xuất → lắp ráp");
        factoryAnalogy.put("after", "Nhà máy chuẩn bị sẵn: công nhân chỉ cần yêu cầu → nhận ngay");
        result.put("factory_analogy", factoryAnalogy);
        
        return result;
    }

    /**
     * 🔍 Endpoint để kiểm tra Singleton Scope
     * - Gọi nhiều lần sẽ trả về cùng 1 instance
     */
    @GetMapping("/singleton-demo")
    public Map<String, Object> demonstrateSingleton() {
        Map<String, Object> result = new HashMap<>();
        
        // Lấy singleton bean nhiều lần
        BookValidator validator1 = applicationContext.getBean("singletonValidator", BookValidator.class);
        BookValidator validator2 = applicationContext.getBean("singletonValidator", BookValidator.class);
        BookValidator validator3 = singletonValidator; // Field injection
        
        result.put("message", "🔄 SINGLETON SCOPE DEMO");
        result.put("validator1_hashCode", validator1.hashCode());
        result.put("validator2_hashCode", validator2.hashCode());
        result.put("validator3_hashCode", validator3.hashCode());
        result.put("are_same_instance", validator1 == validator2 && validator2 == validator3);
        result.put("explanation", "Tất cả đều cùng 1 instance vì đây là Singleton scope");
        
        return result;
    }

    /**
     * 🆕 Endpoint để kiểm tra Prototype Scope
     * - Mỗi lần gọi sẽ tạo instance mới
     */
    @GetMapping("/prototype-demo")
    public Map<String, Object> demonstratePrototype() {
        Map<String, Object> result = new HashMap<>();
        
        // Lấy prototype bean nhiều lần
        BookValidator validator1 = applicationContext.getBean("prototypeValidator", BookValidator.class);
        BookValidator validator2 = applicationContext.getBean("prototypeValidator", BookValidator.class);
        BookValidator validator3 = applicationContext.getBean("prototypeValidator", BookValidator.class);
        
        result.put("message", "🆕 PROTOTYPE SCOPE DEMO");
        result.put("validator1_name", validator1.getName());
        result.put("validator1_hashCode", validator1.hashCode());
        result.put("validator2_name", validator2.getName());
        result.put("validator2_hashCode", validator2.hashCode());
        result.put("validator3_name", validator3.getName());
        result.put("validator3_hashCode", validator3.hashCode());
        result.put("are_different_instances", 
                   validator1 != validator2 && validator2 != validator3 && validator1 != validator3);
        result.put("explanation", "Mỗi lần request tạo ra instance khác nhau vì đây là Prototype scope");
        
        return result;
    }

    /**
     * 📊 Endpoint để so sánh các Scope
     */
    @GetMapping("/scope-comparison")
    public Map<String, Object> compareDifferentScopes() {
        Map<String, Object> result = new HashMap<>();
        
        // Singleton - luôn cùng instance
        BookValidator singleton1 = applicationContext.getBean("singletonValidator", BookValidator.class);
        BookValidator singleton2 = applicationContext.getBean("singletonValidator", BookValidator.class);
        
        // Prototype - mỗi lần khác instance
        BookValidator prototype1 = applicationContext.getBean("prototypeValidator", BookValidator.class);
        BookValidator prototype2 = applicationContext.getBean("prototypeValidator", BookValidator.class);
        
        result.put("message", "📊 SO SÁNH CÁC SCOPE");
        
        // Singleton comparison
        Map<String, Object> singletonInfo = new HashMap<>();
        singletonInfo.put("instance1_hash", singleton1.hashCode());
        singletonInfo.put("instance2_hash", singleton2.hashCode());
        singletonInfo.put("are_same", singleton1 == singleton2);
        singletonInfo.put("description", "Singleton: Cùng 1 instance được tái sử dụng");
        result.put("singleton", singletonInfo);
        
        // Prototype comparison
        Map<String, Object> prototypeInfo = new HashMap<>();
        prototypeInfo.put("instance1_name", prototype1.getName());
        prototypeInfo.put("instance1_hash", prototype1.hashCode());
        prototypeInfo.put("instance2_name", prototype2.getName());
        prototypeInfo.put("instance2_hash", prototype2.hashCode());
        prototypeInfo.put("are_different", prototype1 != prototype2);
        prototypeInfo.put("description", "Prototype: Mỗi lần tạo instance mới");
        result.put("prototype", prototypeInfo);
        
        return result;
    }

    /**
     * 🎯 Endpoint minh họa @Qualifier
     */
    @GetMapping("/qualifier-demo")
    public Map<String, Object> demonstrateQualifier() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("message", "🎯 QUALIFIER DEMO");
        result.put("primary_validator", primaryValidator.getName());
        result.put("secondary_validator", secondaryValidator.getName());
        result.put("singleton_validator", singletonValidator.getName());
        result.put("explanation", "@Qualifier giúp chỉ định chính xác bean nào được inject khi có nhiều implementations");
        
        return result;
    }

    /**
     * 📚 Endpoint giải thích khái niệm DI tổng quan
     */
    @GetMapping("/di-explanation")
    public Map<String, Object> explainDI() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("title", "📚 DEPENDENCY INJECTION (DI) EXPLAINED");
        
        result.put("what_is_di", 
            "DI là design pattern trong đó objects không tự tạo dependencies mà được inject từ bên ngoài");
        
        result.put("benefits", new String[]{
            "🔧 Loose coupling - Giảm sự phụ thuộc giữa các class",
            "🧪 Testable - Dễ dàng mock dependencies cho unit test",
            "🔄 Maintainable - Dễ thay đổi implementation",
            "♻️ Reusable - Có thể tái sử dụng code",
            "🎛️ Configurable - Dễ cấu hình từ bên ngoài"
        });
        
        result.put("di_types", new String[]{
            "🏗️ Constructor Injection (KHUYÊN DÙNG)",
            "📝 Field Injection (KHÔNG KHUYÊN DÙNG)",
            "⚙️ Setter Injection (CHO OPTIONAL DEPENDENCIES)"
        });
        
        result.put("spring_scopes", new String[]{
            "🔄 Singleton (default) - 1 instance cho toàn container",
            "🆕 Prototype - Instance mới mỗi khi request",
            "🌐 Request - Instance mới mỗi HTTP request",
            "👤 Session - Instance mới mỗi HTTP session",
            "🔧 Application - 1 instance cho toàn ServletContext"
        });
        
        return result;
    }
}
