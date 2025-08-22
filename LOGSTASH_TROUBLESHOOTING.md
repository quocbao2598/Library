# 🔧 Tài liệu khắc phục sự cố Logstash

## 📋 Tổng quan vấn đề

### ❌ Vấn đề ban đầu
Logstash container không thể khởi động và liên tục bị down với lỗi:
```
[ERROR][logstash.config.sourceloader] No configuration found in the configured sources.
[INFO ][logstash.config.source.local.configpathloader] No config files found in path
```

---

## 🔍 Nguyên nhân gốc rễ

### 1. **Vấn đề mount volume với Podman + SELinux**
- **SELinux Context**: File trên host có context `user_home_t` không tương thích với container
- **Podman Mount**: Không thể mount file config vào container đúng cách
- **Permission Issue**: Container không đọc được file config do quyền truy cập

### 2. **Cấu trúc thư mục không đúng**
- Logstash mong đợi file config ở `/usr/share/logstash/pipeline/*.conf`
- Hoặc `/etc/logstash/conf.d/*.conf` 
- Mount sai đường dẫn khiến Logstash không tìm thấy config

### 3. **Command line không chính xác**
- Sử dụng `command: logstash -f path` nhưng path không đúng
- Environment variable `path.config` không được set đúng

---

## ✅ Giải pháp đã áp dụng

### **Bước 1: Tạo thư mục config riêng**
```bash
mkdir -p ./logstash/config
mv ./logstash/pipeline/logstash.conf ./logstash/config/logstash.conf
```

### **Bước 2: Sử dụng SELinux-aware mount với flag `:Z`**
```yaml
# docker-compose.yml
volumes:
  - ./logstash/config/logstash.conf:/etc/logstash/conf.d/logstash.conf:ro,Z
  - ./logstash/pipeline/spring-app.log:/var/log/spring-app.log:ro,Z
```

**Giải thích flag `:Z`:**
- `:Z` = Relabel SELinux context để container có thể đọc được file
- `:ro` = Read-only mount
- Podman tự động fix SELinux permission khi có flag `:Z`

### **Bước 3: Sử dụng đường dẫn chuẩn của Logstash**
```yaml
command: logstash -f /etc/logstash/conf.d/logstash.conf
```

### **Bước 4: Cập nhật config file**
```properties
# /home/bao/Documents/publishRepo/Library/logstash/config/logstash.conf
input {
  file {
    path => "/var/log/spring-app.log"  # Đường dẫn trong container
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => json
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "library-logs-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
```

---

## 📁 Cấu trúc thư mục hiện tại

```
Library/
├── logstash/
│   ├── config/
│   │   └── logstash.conf          # ✅ File config chính (CẦN GIỮ)
│   └── pipeline/
│       ├── logstash.conf          # ❌ File cũ (có thể xóa)
│       └── spring-app.log         # ✅ File log từ Spring Boot
└── docker-compose.yml
```

### **❓ Có cần giữ file `/logstash/config/logstash.conf`?**
**✅ CÓ - File này BẮT BUỘC phải giữ vì:**
1. Đây là file config chính mà Logstash đang sử dụng
2. Chứa cấu hình input/output cho ELK stack
3. Được mount vào container qua docker-compose.yml
4. Nếu xóa → Logstash sẽ lại báo lỗi "No configuration found"

### **❓ File `/logstash/pipeline/logstash.conf` có thể xóa không?**
**✅ CÓ THỂ XÓA** - File này không được sử dụng nữa sau khi đã di chuyển sang `/config/`

---

## 🎯 Kết quả đạt được

### **✅ Thành công:**
- Logstash khởi động và chạy ổn định
- Đọc được file log từ Spring Boot application  
- Gửi dữ liệu thành công lên Elasticsearch
- Tạo index `library-logs-2025.08.22` với 129+ documents
- Web UI có thể truy cập: http://localhost:8080
- Kibana dashboard: http://localhost:5601

### **📊 Kiểm tra hoạt động:**
```bash
# 1. Kiểm tra container đang chạy
podman ps | grep logstash

# 2. Xem log của Logstash
podman logs library-logstash

# 3. Kiểm tra dữ liệu trong Elasticsearch
curl -s "http://localhost:9200/library-logs-*/_search?size=1&pretty"

# 4. Truy cập Kibana
firefox http://localhost:5601
```

---

## 🚀 Hướng dẫn sử dụng Kibana

### **Bước 1: Tạo Index Pattern**
1. Mở Kibana: http://localhost:5601
2. Vào **Management** → **Stack Management** → **Index Patterns**
3. Click **Create index pattern**
4. Nhập: `library-logs-*`
5. Chọn Time field: `@timestamp`
6. Click **Create index pattern**

### **Bước 2: Xem Log Data**
1. Vào **Discover**
2. Chọn index pattern `library-logs-*`
3. Xem logs từ Spring Boot application
4. Filter theo level, logger_name, message, v.v.

### **Bước 3: Tạo Dashboard**
1. Vào **Dashboard** → **Create dashboard**
2. Add visualizations (charts, tables, metrics)
3. Phân tích log patterns, error rates, performance

---

## 💡 Kinh nghiệm rút ra

### **Khi làm việc với Podman + SELinux:**
1. **Luôn sử dụng flag `:Z`** khi mount volumes
2. **Kiểm tra SELinux context** với `ls -laZ`
3. **Sử dụng đường dẫn chuẩn** của từng service trong container

### **Debug Logstash issues:**
1. **Kiểm tra file config syntax** trước khi mount
2. **Xem log chi tiết** với `podman logs -f container-name`
3. **Test config đơn giản** trước rồi mới phức tạp hóa

### **Best practices:**
1. **Tách biệt config và data** (config/ vs pipeline/)
2. **Sử dụng restart policies** trong docker-compose
3. **Monitor health** của các services với healthcheck

---

## 🔗 Tài liệu tham khảo

- [Logstash Configuration](https://www.elastic.co/guide/en/logstash/current/configuration.html)
- [Podman Volume Mounting](https://docs.podman.io/en/latest/markdown/podman-run.1.html#volume)
- [SELinux and Containers](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/using-selinux-with-container-workloads_using-selinux)
- [ELK Stack Tutorial](https://www.elastic.co/what-is/elk-stack)

---

*Tài liệu này được tạo để ghi lại quá trình troubleshooting và solution cho Library Management System.*
