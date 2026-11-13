/* Nội dung bài hướng dẫn. Tọa độ x, y là tâm khối. ln = số dòng code (đếm từ 0). */
window.SHAPES = {
  term: {
    name: 'Bắt đầu / Kết thúc', look: 'Hình viên thuốc (bo tròn 2 đầu)',
    c: 'int main() {   ...   return 0; }',
    tip: 'Mỗi lưu đồ có đúng 1 khối Bắt đầu và ít nhất 1 khối Kết thúc.'
  },
  io: {
    name: 'Nhập / Xuất', look: 'Hình bình hành (nghiêng)',
    c: 'scanf(...);   printf(...);',
    tip: 'Viết ngắn gọn: "Nhập a, b" hoặc "Xuất tong". Không cần ghi %d.'
  },
  proc: {
    name: 'Xử lý', look: 'Hình chữ nhật',
    c: 'tong = a + b;   i++;',
    tip: 'Một phép gán hoặc tính toán. Vài lệnh ngắn liền nhau có thể gộp vào 1 khối.'
  },
  dec: {
    name: 'Điều kiện', look: 'Hình thoi',
    c: 'if, else if, while, for, do-while',
    tip: 'Ghi điều kiện như trong C: a > b, i <= n. Luôn có 2 mũi tên đi ra: Đúng và Sai.'
  }
};

window.LESSONS = [
  {
    id: 'khoi-hinh',
    title: 'Các khối hình cơ bản',
    body: [
      'Lưu đồ (flowchart) là hình vẽ cho thấy chương trình chạy theo thứ tự nào.',
      'Chỉ cần nhớ 4 khối hình và mũi tên. Mỗi khối ứng với một loại lệnh trong C.'
    ],
    shapes: true
  },
  {
    id: 'tuan-tu',
    title: 'Tuần tự: tính tổng 2 số',
    body: [
      'Chương trình chạy từ trên xuống dưới, mỗi lệnh thành một khối.',
      'Rê chuột (hoặc chạm) vào một dòng code để xem khối tương ứng.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int a, b, tong;\n    scanf("%d %d", &a, &b);\n    tong = a + b;\n    printf("%d", tong);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập a, b', ln: [3] },
        { id: 'b', type: 'proc', x: 0, y: 180, text: 'tong = a + b', ln: [4] },
        { id: 'c', type: 'io', x: 0, y: 270, text: 'Xuất tong', ln: [5] },
        { id: 'e', type: 'term', x: 0, y: 360, text: 'Kết thúc', ln: [6, 7] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'b' },
        { id: 'e3', from: 'b', to: 'c' }, { id: 'e4', from: 'c', to: 'e' }
      ]
    },
    tips: ['Dòng khai báo `int a, b, tong;` thường không cần vẽ.'],
    practice: 'Vẽ lưu đồ tính diện tích hình chữ nhật: nhập chiều dài, chiều rộng, xuất diện tích.'
  },
  {
    id: 'if-else',
    title: 'if - else: số chẵn hay lẻ',
    body: [
      '`if` thành khối hình thoi. Một nhánh Đúng, một nhánh Sai.',
      'Hai nhánh đi riêng rồi gặp lại nhau trước khi chạy tiếp.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    if (n % 2 == 0)\n        printf("Chan");\n    else\n        printf("Le");\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [3] },
        { id: 'd', type: 'dec', x: 0, y: 200, text: 'n % 2 == 0', ln: [4] },
        { id: 't', type: 'io', x: -190, y: 320, text: 'Xuất "Chẵn"', ln: [5] },
        { id: 'f', type: 'io', x: 190, y: 320, text: 'Xuất "Lẻ"', ln: [6, 7] },
        { id: 'e', type: 'term', x: 0, y: 430, text: 'Kết thúc', ln: [8, 9] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'd' },
        { id: 'e3', from: 'd', to: 't', label: 'Đúng' }, { id: 'e4', from: 'd', to: 'f', label: 'Sai' },
        { id: 'e5', from: 't', to: 'e' }, { id: 'e6', from: 'f', to: 'e' }
      ]
    },
    tips: ['`if` không có `else` thì nhánh Sai đi thẳng tới khối tiếp theo.'],
    practice: 'Vẽ lưu đồ kiểm tra một số là âm hay không âm.'
  },
  {
    id: 'else-if',
    title: 'else if: so sánh 2 số',
    body: [
      'Mỗi `else if` là thêm một khối điều kiện nằm ở nhánh Sai của khối trước.',
      'Nhánh `else` cuối cùng là nhánh Sai của khối điều kiện cuối.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    if (a > b)\n        printf("a lon hon");\n    else if (a < b)\n        printf("b lon hon");\n    else\n        printf("Bang nhau");\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập a, b', ln: [3] },
        { id: 'd1', type: 'dec', x: 0, y: 200, text: 'a > b', ln: [4] },
        { id: 'o1', type: 'io', x: -230, y: 440, text: 'Xuất "a lớn hơn"', ln: [5] },
        { id: 'd2', type: 'dec', x: 200, y: 320, text: 'a < b', ln: [6] },
        { id: 'o2', type: 'io', x: 70, y: 440, text: 'Xuất "b lớn hơn"', ln: [7] },
        { id: 'o3', type: 'io', x: 340, y: 440, text: 'Xuất "Bằng nhau"', ln: [8, 9] },
        { id: 'e', type: 'term', x: 60, y: 550, text: 'Kết thúc', ln: [10, 11] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'd1' },
        { id: 'e3', from: 'd1', to: 'o1', label: 'Đúng' }, { id: 'e4', from: 'd1', to: 'd2', label: 'Sai' },
        { id: 'e5', from: 'd2', to: 'o2', label: 'Đúng' }, { id: 'e6', from: 'd2', to: 'o3', label: 'Sai' },
        { id: 'e7', from: 'o1', to: 'e' }, { id: 'e8', from: 'o2', to: 'e' }, { id: 'e9', from: 'o3', to: 'e' }
      ]
    },
    practice: 'Vẽ lưu đồ xếp loại điểm: từ 8 trở lên "Giỏi", từ 5 trở lên "Đạt", còn lại "Chưa đạt".'
  },
  {
    id: 'while',
    title: 'while: tổng từ 1 đến n',
    body: [
      'Vòng lặp = khối điều kiện + mũi tên quay ngược lên.',
      'Nhánh Đúng chạy thân vòng lặp rồi quay lại kiểm tra. Nhánh Sai thoát ra ngoài.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n, i = 1, s = 0;\n    scanf("%d", &n);\n    while (i <= n) {\n        s = s + i;\n        i = i + 1;\n    }\n    printf("%d", s);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [3] },
        { id: 'b', type: 'proc', x: 0, y: 185, text: 'i = 1\ns = 0', ln: [2] },
        { id: 'd', type: 'dec', x: 0, y: 295, text: 'i <= n', ln: [4, 7] },
        { id: 'c', type: 'proc', x: 0, y: 410, text: 's = s + i', ln: [5] },
        { id: 'u', type: 'proc', x: 0, y: 500, text: 'i = i + 1', ln: [6] },
        { id: 'o', type: 'io', x: 250, y: 410, text: 'Xuất s', ln: [8] },
        { id: 'e', type: 'term', x: 250, y: 500, text: 'Kết thúc', ln: [9, 10] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'b' }, { id: 'e3', from: 'b', to: 'd' },
        { id: 'e4', from: 'd', to: 'c', label: 'Đúng' }, { id: 'e5', from: 'c', to: 'u' },
        { id: 'e6', from: 'u', to: 'd' }, { id: 'e7', from: 'd', to: 'o', label: 'Sai' }, { id: 'e8', from: 'o', to: 'e' }
      ]
    },
    tips: ['Quên mũi tên quay lại là lỗi hay gặp nhất khi vẽ vòng lặp.'],
    practice: 'Vẽ lưu đồ tính n giai thừa: 1 × 2 × ... × n.'
  },
  {
    id: 'for',
    title: 'for: in các số từ 1 đến n',
    body: [
      '`for (i = 1; i <= n; i++)` có 3 phần, tách ra thành 3 khối:',
      'khởi tạo `i = 1` (chữ nhật), điều kiện `i <= n` (thoi), tăng `i++` (chữ nhật, nằm cuối thân lặp).'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n, i;\n    scanf("%d", &n);\n    for (i = 1; i <= n; i++) {\n        printf("%d ", i);\n    }\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [3] },
        { id: 'b', type: 'proc', x: 0, y: 180, text: 'i = 1', ln: [4] },
        { id: 'd', type: 'dec', x: 0, y: 290, text: 'i <= n', ln: [4] },
        { id: 'c', type: 'io', x: 0, y: 400, text: 'Xuất i', ln: [5] },
        { id: 'u', type: 'proc', x: 0, y: 490, text: 'i++', ln: [4] },
        { id: 'e', type: 'term', x: 250, y: 400, text: 'Kết thúc', ln: [7, 8] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'b' }, { id: 'e3', from: 'b', to: 'd' },
        { id: 'e4', from: 'd', to: 'c', label: 'Đúng' }, { id: 'e5', from: 'c', to: 'u' },
        { id: 'e6', from: 'u', to: 'd' }, { id: 'e7', from: 'd', to: 'e', label: 'Sai' }
      ]
    },
    tips: ['Lưu đồ của `for` và `while` giống nhau. Chỉ khác cách viết code.'],
    practice: 'Vẽ lưu đồ in các số chẵn từ 2 đến n.'
  },
  {
    id: 'do-while',
    title: 'do - while: nhập đến khi đúng',
    body: [
      '`do-while` chạy thân lặp trước, kiểm tra sau. Thân lặp chạy ít nhất 1 lần.',
      'Vì vậy khối điều kiện nằm DƯỚI thân lặp, nhánh Đúng quay ngược lên.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n;\n    do {\n        printf("Nhap n > 0: ");\n        scanf("%d", &n);\n    } while (n <= 0);\n    printf("Ban vua nhap %d", n);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'p', type: 'io', x: 0, y: 90, text: 'Xuất "Nhập n > 0"', ln: [4] },
        { id: 'a', type: 'io', x: 0, y: 180, text: 'Nhập n', ln: [5] },
        { id: 'd', type: 'dec', x: 0, y: 290, text: 'n <= 0', ln: [3, 6] },
        { id: 'o', type: 'io', x: 0, y: 400, text: 'Xuất n', ln: [7] },
        { id: 'e', type: 'term', x: 0, y: 490, text: 'Kết thúc', ln: [8, 9] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'p' }, { id: 'e2', from: 'p', to: 'a' }, { id: 'e3', from: 'a', to: 'd' },
        { id: 'e4', from: 'd', to: 'p', label: 'Đúng' }, { id: 'e5', from: 'd', to: 'o', label: 'Sai' },
        { id: 'e6', from: 'o', to: 'e' }
      ]
    },
    practice: 'Vẽ lưu đồ nhập điểm cho đến khi điểm nằm trong khoảng 0 đến 10.'
  },
  {
    id: 'meo',
    title: 'Các bước vẽ và lỗi hay gặp',
    body: ['Làm theo 4 bước này cho mọi bài:'],
    steps: [
      'Đọc đề: tìm "cho gì" (nhập) và "hỏi gì" (xuất). Có thể dùng tab Phân tích đề.',
      'Tìm chỗ phải chọn (nếu... thì...) → khối thoi. Tìm việc lặp lại (từ 1 đến n, đến khi...) → vòng lặp.',
      'Vẽ từ trên xuống: Bắt đầu → Nhập → Xử lý → Xuất → Kết thúc.',
      'Bấm "Kiểm tra" trong Bảng vẽ để xem lưu đồ đã đúng quy tắc chưa.'
    ],
    tips: [
      'Dùng hình chữ nhật cho `printf`/`scanf` là sai. Nhập/Xuất phải là hình bình hành.',
      'Khối thoi thiếu nhánh Sai, hoặc không ghi nhãn Đúng/Sai.',
      'Vòng lặp quên mũi tên quay lại khối điều kiện.',
      'Một khối chữ nhật có 2 mũi tên đi ra. Muốn rẽ nhánh phải dùng khối thoi.',
      'Có khối không nối với ai, hoặc không đi tới được Kết thúc.'
    ]
  }
];
