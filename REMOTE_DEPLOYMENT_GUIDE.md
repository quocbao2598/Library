# 🚀 Library Management System - Remote Deployment Guide

## 📖 Hướng dẫn triển khai ứng dụng Library Management trên máy tính từ xa

Hướng dẫn này dành cho **người dùng cuối** muốn chạy ứng dụng Library Management System trên máy tính của mình mà **KHÔNG cần biết gì về lập trình**.

---

## 🎯 **Bạn sẽ có được gì:**

✅ **Ứng dụng quản lý thư viện** chạy trên máy tính của bạn  
✅ **Database PostgreSQL** lưu trữ dữ liệu vĩnh viễn  
✅ **Kibana Dashboard** để xem logs và thống kê  
✅ **Tất cả chạy tự động** chỉ với 1-2 lệnh đơn giản  

**🌐 Truy cập ứng dụng:** `http://localhost:8080`  
**📊 Dashboard:** `http://localhost:5601`

---

## 📋 **Yêu cầu hệ thống:**

### **Hệ điều hành hỗ trợ:**
- ✅ **Ubuntu/Linux** (Khuyến nghị)
- ✅ **Windows 10/11** (với WSL2)
- ✅ **macOS**

### **Phần cứng tối thiểu:**
- **RAM:** 4GB trở lên
- **Ổ cứng:** 2GB dung lượng trống
- **CPU:** 2 cores
- **Mạng:** Kết nối internet để tải Docker images

---

## 🔧 **Bước 1: Cài đặt Docker (Chỉ làm 1 lần)**

### **Ubuntu/Linux:**
```bash
# Copy và paste từng dòng vào terminal:

# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Thêm user vào nhóm docker (để không cần sudo)
sudo usermod -aG docker $USER

# Khởi động Docker
sudo systemctl enable docker
sudo systemctl start docker

# Khởi động lại máy tính
sudo reboot
```

### **Windows:**
1. Tải **Docker Desktop** từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động lại máy tính
3. Mở **PowerShell** hoặc **Command Prompt**

### **macOS:**
1. Tải **Docker Desktop** từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Mở **Terminal**

---

## 🚀 **Bước 2: Triển khai ứng dụng**

### **Cách 1: Tự động hoàn toàn (Khuyến nghị)**

**Copy và paste dòng này vào terminal:**

```bash
wget https://raw.githubusercontent.com/BossBlossom/Library/main/scripts/deploy-remote.sh && chmod +x deploy-remote.sh && ./deploy-remote.sh
```

**Hoặc nếu không có `wget`, dùng `curl`:**

```bash
curl -o deploy-remote.sh https://raw.githubusercontent.com/BossBlossom/Library/main/scripts/deploy-remote.sh && chmod +x deploy-remote.sh && ./deploy-remote.sh
```

### **Cách 2: Từng bước (Nếu cách 1 không hoạt động)**

```bash
# Bước 1: Tải file cấu hình
wget https://raw.githubusercontent.com/BossBlossom/Library/main/docker-compose.remote.yml

# Bước 2: Tải Docker image
docker pull baoquoc/library-management:latest

# Bước 3: Khởi động ứng dụng
docker-compose -f docker-compose.remote.yml up -d
```

---

## ⏳ **Quá trình cài đặt:**

Sau khi chạy lệnh, bạn sẽ thấy:

```
🚀 Deploying baoquoc/library-management:latest from Docker Hub
📥 Pulling latest image...
📝 Updating compose file...
🔄 Starting deployment...
⏳ Waiting for application...
Attempt 1/30...
Attempt 2/30...
...
✅ Application is healthy!
🎉 Deployment completed!
📱 App: http://localhost:8080
📊 Kibana: http://localhost:5601
```

**⏰ Thời gian:** 5-10 phút (tùy tốc độ mạng)

---

## 🎯 **Bước 3: Sử dụng ứng dụng**

### **Truy cập ứng dụng chính:**
1. Mở trình duyệt web
2. Vào địa chỉ: **http://localhost:8080**
3. Bạn sẽ thấy giao diện Library Management System

### **Các tính năng có sẵn:**
- ✅ **Quản lý sách:** Thêm, sửa, xóa, tìm kiếm sách
- ✅ **Quản lý thành viên:** Đăng ký thành viên mới
- ✅ **Quản lý mượn trả:** Cho mượn sách, trả sách
- ✅ **Báo cáo:** Thống kê sách, thành viên

### **Dashboard giám sát (Optional):**
1. Vào địa chỉ: **http://localhost:5601**
2. Xem logs và thống kê hệ thống

---

## 🔄 **Quản lý ứng dụng:**

### **Dừng ứng dụng:**
```bash
docker-compose -f docker-compose.remote.yml down
```

### **Khởi động lại:**
```bash
docker-compose -f docker-compose.remote.yml up -d
```

### **Cập nhật version mới:**
```bash
./deploy-remote.sh
```

### **Xem logs:**
```bash
docker-compose -f docker-compose.remote.yml logs -f app
```

### **Kiểm tra trạng thái:**
```bash
docker-compose -f docker-compose.remote.yml ps
```

---

## 💾 **Dữ liệu và Backup:**

### **Dữ liệu được lưu ở đâu?**
- **Database:** Tự động lưu trong Docker volumes
- **Backup tự động:** Khi chạy `deploy-remote.sh`
- **Vị trí:** `/var/lib/docker/volumes/`

### **Backup thủ công:**
```bash
# Backup database
docker-compose -f docker-compose.remote.yml exec postgres pg_dump -U libraryuser library_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose -f docker-compose.remote.yml exec -T postgres psql -U libraryuser library_db < backup_20250822.sql
```

---

## 🆘 **Xử lý sự cố:**

### **1. Lỗi "Cannot connect to the Docker daemon"**
```bash
# Khởi động Docker service
sudo systemctl start docker

# Hoặc trên Windows/Mac: Mở Docker Desktop
```

### **2. Port 8080 đã được sử dụng**
```bash
# Kiểm tra process đang dùng port 8080
sudo lsof -i :8080

# Kill process (thay PID bằng số thực tế)
sudo kill -9 PID
```

### **3. Ứng dụng không khởi động**
```bash
# Xem logs để debug
docker-compose -f docker-compose.remote.yml logs app

# Restart ứng dụng
docker-compose -f docker-compose.remote.yml restart app
```

### **4. Database connection error**
```bash
# Kiểm tra PostgreSQL
docker-compose -f docker-compose.remote.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.remote.yml restart postgres
```

### **5. Reset hoàn toàn**
```bash
# Dừng và xóa tất cả containers, volumes
docker-compose -f docker-compose.remote.yml down -v

# Chạy lại từ đầu
./deploy-remote.sh
```

---

## 📞 **Hỗ trợ:**

### **Kiểm tra tình trạng ứng dụng:**
```bash
# Health check
curl http://localhost:8080/actuator/health

# Kết quả mong đợi:
{"status":"UP"}
```

### **Thông tin hệ thống:**
```bash
# Version Docker
docker --version
docker-compose --version

# Tài nguyên đang sử dụng
docker stats

# Images đã tải
docker images baoquoc/library-management
```

---

## 🎉 **Hoàn thành!**

Bây giờ bạn đã có:

✅ **Library Management System** chạy tại `http://localhost:8080`  
✅ **Database PostgreSQL** lưu trữ dữ liệu  
✅ **Kibana Dashboard** tại `http://localhost:5601`  
✅ **Automatic backup** khi cập nhật  
✅ **Easy management** với Docker Compose  

### **Lưu ý quan trọng:**
- 📱 **Bookmark:** `http://localhost:8080` để truy cập nhanh
- 💾 **Data persistence:** Dữ liệu sẽ được giữ nguyên khi restart
- 🔄 **Auto updates:** Chạy `./deploy-remote.sh` để cập nhật version mới
- 🛡️ **Security:** Ứng dụng chỉ accessible từ máy local

**🎊 Chúc bạn sử dụng ứng dụng vui vẻ!**

---

## 📚 **Tài liệu tham khảo:**

- **GitHub Repository:** https://github.com/BossBlossom/Library
- **Docker Documentation:** https://docs.docker.com/
- **Docker Compose Guide:** https://docs.docker.com/compose/

---

*📝 Document này được tạo tự động. Nếu có vấn đề, vui lòng tạo issue trên GitHub repository.*
