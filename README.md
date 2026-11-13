# Lưu Đồ C

Web app giúp học và vẽ lưu đồ (flowchart) cho ngôn ngữ C.

## Có gì

- **Hướng dẫn**: các khối hình (thêm khối Gọi hàm), rồi từng cấu trúc C: tuần tự, if-else, else if, while, for, do-while, switch-case, mảng, hàm có trả về, hàm void, struct. Rê chuột vào dòng code để thấy khối tương ứng trong lưu đồ.
- **Phân tích đề**: dán đề, hoặc tải/dán/kéo thả ảnh đề (đọc chữ bằng Tesseract.js trong trình duyệt). Trang tô màu từ khóa trong đề, tách đề cho gì / hỏi gì / ràng buộc, tìm các nhánh và vòng lặp, soát mốc điều kiện (hở, chồng), rồi gợi ý từng bước vẽ, lưu đồ mẫu và bảng chạy thử. Chỉ làm lưu đồ, không sinh code. Phân tích bằng từ khóa, chạy ngay trên máy.
- **Bảng vẽ**: thêm khối, kéo thả, nối mũi tên, nút **Kiểm tra** báo lỗi lưu đồ (thiếu nhánh Sai, sai hình, khối không tới được Kết thúc...). Tải ảnh PNG nền trắng để dán vào báo cáo. Bài vẽ tự lưu trên trình duyệt.

- **Tiếng Anh**: nút EN/VI ở góc trên đổi cả giao diện, bài học và kết quả phân tích sang tiếng Anh. Đề tiếng Anh cũng phân tích được (đọc theo từ khóa).

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
- `js/analyze.js`: phân tích đề, dựng lưu đồ, chạy thử lưu đồ
- `js/app.js`: giao diện, bảng vẽ, kiểm tra lỗi
- `js/i18n.js`: chữ giao diện tiếng Việt / tiếng Anh
- `data/lessons.en.js`: bài học tiếng Anh
- `js/analyze-en.js`: đọc đề tiếng Anh, dịch kết quả phân tích
