# Lưu Đồ C

Web app giúp học và vẽ lưu đồ (flowchart) cho ngôn ngữ C.

## Có gì

- **Hướng dẫn**: 4 khối hình cơ bản, rồi từng cấu trúc C (tuần tự, if-else, else if, while, for, do-while). Rê chuột vào dòng code để thấy khối tương ứng trong lưu đồ.
- **Phân tích đề**: dán đề bài, trang tìm đề cho gì, hỏi gì, các nhánh điều kiện, có lặp không, rồi gợi ý từng bước vẽ, lưu đồ mẫu và code C. Phân tích bằng từ khóa, chạy ngay trên máy, không gửi đề đi đâu.
- **Bảng vẽ**: thêm khối, kéo thả, nối mũi tên, nút **Kiểm tra** báo lỗi lưu đồ (thiếu nhánh Sai, sai hình, khối không tới được Kết thúc...). Tải ảnh PNG nền trắng để dán vào báo cáo. Bài vẽ tự lưu trên trình duyệt.

## Chạy trên máy

```bash
python -m http.server 4176
```

Mở http://localhost:4176

HTML, CSS, JS thuần, không cần cài gì. Font Chakra Petch và Saira từ Google Fonts.

## Cấu trúc

- `data/lessons.js`: nội dung bài hướng dẫn
- `data/examples.js`: đề mẫu
- `js/chart.js`: vẽ lưu đồ bằng SVG, xuất PNG
- `js/analyze.js`: phân tích đề, dựng lưu đồ và code C gợi ý
- `js/app.js`: giao diện, bảng vẽ, kiểm tra lỗi
