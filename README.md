# Petshop Management System

Dự án gồm 2 phần:
- `backend/`: Spring Boot (Maven)
- `frontend/`: React (CRA - `react-scripts`)

## Chạy Backend (Spring Boot)

> Lưu ý: Lệnh `mvn spring-boot:run` phải chạy trong thư mục có `pom.xml` (tức là `backend/`). Nếu chạy trong `frontend/` sẽ báo lỗi *No plugin found for prefix 'spring-boot'*. 

### Cách 1: CD vào backend

> Backend đọc cấu hình DB/JWT từ biến môi trường (tránh commit mật khẩu). Bạn có 2 cách:
> - Cách A (khuyến nghị): set biến môi trường `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
> - Cách B (local dev): copy `backend/src/main/resources/application.example.yml` thành `backend/src/main/resources/application.yml` và chỉnh theo máy bạn.

Ví dụ PowerShell (chỉ áp dụng cho phiên terminal hiện tại):

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/petshop_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
$env:DB_USERNAME='root'
$env:DB_PASSWORD='your_password'
$env:JWT_SECRET='your_strong_random_secret'
```

```powershell
cd backend
mvn spring-boot:run
```

### Cách 2: Chạy từ thư mục gốc (không cần cd)

```powershell
mvn -f backend/pom.xml spring-boot:run
```

## Chạy Frontend (React)

```powershell
cd frontend
npm install
npm start
```

## VS Code

Repo hiện đang `.gitignore` thư mục `.vscode/` (không commit cấu hình editor).
