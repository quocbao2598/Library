## 1. Lệnh Docker

| Mục đích           | Lệnh Docker                    | Ghi chú                                  |
|--------------------|-------------------------------|------------------------------------------|
| Xem version        | `docker --version`            |                                          |
| Pull image         | `docker pull <image>`         |                                          |
| List images        | `docker images`               |                                          |
| Xóa image          | `docker rmi <image>`          |                                          |
| Chạy container     | `docker run <image>`          | Thường thêm `-d`, `-p`, `--name`         |
| Liệt kê container  | `docker ps`                   | Chỉ container đang chạy                  |
| Liệt kê tất cả     | `docker ps -a`                | Kể cả container đã dừng                  |
| Stop container     | `docker stop <container>`     |                                          |
| Start container    | `docker start <container>`    |                                          |
| Xóa container      | `docker rm <container>`       | Dừng trước khi xóa                       |
| Xem log container  | `docker logs <container>`     |                                          |
| Vào container      | `docker exec -it <container> bash` | Vào bash của container             |
| Compose up         | `docker-compose up -d`        | Khởi chạy các service trong compose      |
| Compose down       | `docker-compose down`         | Dừng và xóa toàn bộ service              |

---

## 2. Lệnh Podman

| Mục đích           | Lệnh Podman                    | Ghi chú                                  |
|--------------------|-------------------------------|------------------------------------------|
| Xem version        | `podman --version`            |                                          |
| Pull image         | `podman pull <image>`         |                                          |
| List images        | `podman images`               |                                          |
| Xóa image          | `podman rmi <image>`          |                                          |
| Chạy container     | `podman run <image>`          | Thường thêm `-d`, `-p`, `--name`         |
| Liệt kê container  | `podman ps`                   | Chỉ container đang chạy                  |
| Liệt kê tất cả     | `podman ps -a`                | Kể cả container đã dừng                  |
| Stop container     | `podman stop <container>`     |                                          |
| Start container    | `podman start <container>`    |                                          |
| Xóa container      | `podman rm <container>`       | Dừng trước khi xóa                       |
| Xem log container  | `podman logs <container>`     |                                          |
| Vào container      | `podman exec -it <container> bash` | Vào bash của container             |
| Compose up         | `podman-compose up -d`        | Khởi chạy các service trong compose      |
| Compose down       | `podman-compose down`         | Dừng và xóa toàn bộ service              |

---

## 3. Một số lưu ý khi chuyển từ Docker sang Podman

- **Podman không cần daemon** (không chạy nền như Docker).
- Lệnh và cú pháp gần như giống hệt Docker.
- Podman hỗ trợ rootless (không cần quyền root để chạy container).
- Podman có thể dùng file `docker-compose.yml` với `podman-compose`.

---

## 4. Một số lệnh hay dùng khác

### Kiểm tra port đang chạy
```bash
ss -tuln | grep <port>
```

### Kiểm tra tiến trình
```bash
ps aux | grep <tên>
```

### Xem thông tin image/container chi tiết
```bash
docker inspect <container hoặc image>
podman inspect <container hoặc image>
```

---

## 5. Nguồn tham khảo

- [Tài liệu Docker chính thức](https://docs.docker.com/)
- [Tài liệu Podman chính thức](https://docs.podman.io/)
- [Tài liệu Podman Compose](https://github.com/containers/podman-compose)
