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
  },
  sub: {
    name: 'Gọi hàm', look: 'Hình chữ nhật có 2 vạch đứng ở 2 bên',
    c: 'kq = giaiThua(n);   inSao(n);',
    tip: 'Hàm vẽ thành lưu đồ riêng: mở đầu "Bắt đầu tênHàm(tham số)", kết thúc "Trả về ..." (hàm có trả về) hoặc "Kết thúc hàm" (void).'
  }
};

window.LESSONS = [
  {
    id: 'khoi-hinh',
    title: 'Các khối hình cơ bản',
    body: [
      'Lưu đồ (flowchart) là hình vẽ cho thấy chương trình chạy theo thứ tự nào.',
      'Chỉ cần nhớ 4 khối hình chính và mũi tên. Khi bài có hàm thì thêm khối Gọi hàm. Mỗi khối ứng với một loại lệnh trong C.'
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
    id: 'switch',
    title: 'switch - case: chọn theo giá trị',
    body: [
      'Lưu đồ không có hình riêng cho `switch`. Mỗi `case` vẽ thành một khối thoi hỏi "biến == giá trị?".',
      'Các khối thoi xếp dọc: Đúng rẽ phải làm việc của case đó rồi `break` (đi về cuối). Sai đi xuống case tiếp theo. `default` là nhánh Sai cuối cùng.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    switch (n) {\n        case 1: printf("Chu nhat"); break;\n        case 2: printf("Thu hai"); break;\n        case 3: printf("Thu ba"); break;\n        default: printf("Khong hop le");\n    }\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [3] },
        { id: 'd1', type: 'dec', x: 0, y: 200, text: 'n == 1', ln: [4, 5] },
        { id: 'o1', type: 'io', x: 250, y: 200, text: 'Xuất "Chủ nhật"', ln: [5] },
        { id: 'd2', type: 'dec', x: 0, y: 310, text: 'n == 2', ln: [6] },
        { id: 'o2', type: 'io', x: 250, y: 310, text: 'Xuất "Thứ hai"', ln: [6] },
        { id: 'd3', type: 'dec', x: 0, y: 420, text: 'n == 3', ln: [7] },
        { id: 'o3', type: 'io', x: 250, y: 420, text: 'Xuất "Thứ ba"', ln: [7] },
        { id: 'od', type: 'io', x: 0, y: 530, text: 'Xuất "Không hợp lệ"', ln: [8] },
        { id: 'e', type: 'term', x: 0, y: 630, text: 'Kết thúc', ln: [9, 10, 11] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'd1' },
        { id: 'e3', from: 'd1', to: 'o1', label: 'Đúng' }, { id: 'e4', from: 'd1', to: 'd2', label: 'Sai' },
        { id: 'e5', from: 'd2', to: 'o2', label: 'Đúng' }, { id: 'e6', from: 'd2', to: 'd3', label: 'Sai' },
        { id: 'e7', from: 'd3', to: 'o3', label: 'Đúng' }, { id: 'e8', from: 'd3', to: 'od', label: 'Sai' },
        { id: 'e9', from: 'o1', to: 'e', fs: 'right', ts: 'right' }, { id: 'e10', from: 'o2', to: 'e', fs: 'right', ts: 'right' },
        { id: 'e11', from: 'o3', to: 'e', fs: 'right', ts: 'right' }, { id: 'e12', from: 'od', to: 'e' }
      ]
    },
    tips: [
      'Quên `break` thì chương trình chạy tiếp xuống case dưới. Lưu đồ chuẩn coi như mỗi case đều có `break`.',
      'Nhiều case làm cùng một việc (case 1: case 3: ...) thì gộp vào một khối thoi: "thang == 1, 3, 5...".'
    ],
    practice: 'Vẽ lưu đồ nhập số tháng, in ra tháng đó có bao nhiêu ngày (dùng switch).'
  },
  {
    id: 'mang',
    title: 'Mảng: nhập mảng và tính tổng',
    body: [
      'Mảng là dãy nhiều giá trị cùng tên: `a[0], a[1], ..., a[n-1]`. Chỉ số bắt đầu từ 0.',
      'Làm việc với mảng luôn cần vòng lặp: nhập mảng là 1 vòng lặp, tính tổng là 1 vòng lặp nữa.'
    ],
    code: '#include <stdio.h>\nint main() {\n    int n, i, s, a[100];\n    scanf("%d", &n);\n    for (i = 0; i < n; i++)\n        scanf("%d", &a[i]);\n    s = 0;\n    for (i = 0; i < n; i++)\n        s = s + a[i];\n    printf("%d", s);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [1] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [3] },
        { id: 'i0', type: 'proc', x: 0, y: 180, text: 'i = 0', ln: [4] },
        { id: 'd', type: 'dec', x: 0, y: 290, text: 'i < n', ln: [4] },
        { id: 'ia', type: 'io', x: 0, y: 400, text: 'Nhập a[i]', ln: [5] },
        { id: 'u', type: 'proc', x: 0, y: 490, text: 'i++', ln: [4] },
        { id: 'j0', type: 'proc', x: 0, y: 590, text: 's = 0\ni = 0', ln: [6, 7] },
        { id: 'd2', type: 'dec', x: 0, y: 700, text: 'i < n', ln: [7] },
        { id: 'c', type: 'proc', x: 0, y: 810, text: 's = s + a[i]', ln: [8] },
        { id: 'u2', type: 'proc', x: 0, y: 900, text: 'i++', ln: [7] },
        { id: 'o', type: 'io', x: 0, y: 1000, text: 'Xuất s', ln: [9] },
        { id: 'e', type: 'term', x: 0, y: 1090, text: 'Kết thúc', ln: [10, 11] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'i0' }, { id: 'e3', from: 'i0', to: 'd' },
        { id: 'e4', from: 'd', to: 'ia', label: 'Đúng' }, { id: 'e5', from: 'ia', to: 'u' }, { id: 'e6', from: 'u', to: 'd' },
        { id: 'e7', from: 'd', to: 'j0', label: 'Sai', fs: 'right', ts: 'right' },
        { id: 'e8', from: 'j0', to: 'd2' }, { id: 'e9', from: 'd2', to: 'c', label: 'Đúng' }, { id: 'e10', from: 'c', to: 'u2' },
        { id: 'e11', from: 'u2', to: 'd2' }, { id: 'e12', from: 'd2', to: 'o', label: 'Sai', fs: 'right', ts: 'right' },
        { id: 'e13', from: 'o', to: 'e' }
      ]
    },
    tips: [
      'Trong lưu đồ ghi phần tử là `a[i]`. Dòng khai báo `a[100]` không cần vẽ.',
      'Tìm lớn nhất: gán `max = a[0]`, rồi lặp `i` từ 1, gặp `a[i] > max` thì `max = a[i]`.'
    ],
    practice: 'Vẽ lưu đồ nhập mảng n số nguyên, đếm có bao nhiêu số chẵn.'
  },
  {
    id: 'ham-tra-ve',
    title: 'Hàm có trả về: giai thừa',
    body: [
      'Mỗi hàm có một lưu đồ riêng. Lưu đồ của hàm bắt đầu bằng "Bắt đầu tênHàm(tham số)" và kết thúc bằng "Trả về giá trị".',
      'Trong lưu đồ chính (main), chỗ gọi hàm vẽ bằng khối Gọi hàm: hình chữ nhật có 2 vạch đứng ở 2 bên.'
    ],
    code: '#include <stdio.h>\nint giaiThua(int n) {\n    int gt = 1, i;\n    for (i = 1; i <= n; i++)\n        gt = gt * i;\n    return gt;\n}\nint main() {\n    int n, kq;\n    scanf("%d", &n);\n    kq = giaiThua(n);\n    printf("%d", kq);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [7] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [9] },
        { id: 'k', type: 'sub', x: 0, y: 180, text: 'kq = giaiThua(n)', ln: [10] },
        { id: 'o', type: 'io', x: 0, y: 270, text: 'Xuất kq', ln: [11] },
        { id: 'e', type: 'term', x: 0, y: 360, text: 'Kết thúc', ln: [12, 13] },
        { id: 'fs', type: 'term', x: 0, y: 480, text: 'Bắt đầu giaiThua(n)', ln: [1] },
        { id: 'g', type: 'proc', x: 0, y: 570, text: 'gt = 1', ln: [2] },
        { id: 'i', type: 'proc', x: 0, y: 660, text: 'i = 1', ln: [3] },
        { id: 'd', type: 'dec', x: 0, y: 770, text: 'i <= n', ln: [3] },
        { id: 'm', type: 'proc', x: 0, y: 880, text: 'gt = gt * i', ln: [4] },
        { id: 'u', type: 'proc', x: 0, y: 970, text: 'i++', ln: [3] },
        { id: 'r', type: 'term', x: 260, y: 770, text: 'Trả về gt', ln: [5, 6] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'k' }, { id: 'e3', from: 'k', to: 'o' }, { id: 'e4', from: 'o', to: 'e' },
        { id: 'e5', from: 'fs', to: 'g' }, { id: 'e6', from: 'g', to: 'i' }, { id: 'e7', from: 'i', to: 'd' },
        { id: 'e8', from: 'd', to: 'm', label: 'Đúng' }, { id: 'e9', from: 'm', to: 'u' }, { id: 'e10', from: 'u', to: 'd' },
        { id: 'e11', from: 'd', to: 'r', label: 'Sai' }
      ]
    },
    tips: [
      'Hai lưu đồ không nối mũi tên với nhau. Khối Gọi hàm chính là chỗ "nhảy" sang lưu đồ của hàm rồi quay về.',
      'Giá trị sau "Trả về" được gán vào biến bên trái dấu = trong khối Gọi hàm (ở đây là kq).'
    ],
    practice: 'Vẽ lưu đồ cho hàm tính tổng 2 số `tong(a, b)` và lưu đồ main gọi hàm đó.'
  },
  {
    id: 'ham-void',
    title: 'Hàm không trả về (void)',
    body: [
      'Hàm `void` làm việc xong là thôi, không đưa giá trị nào về. Lưu đồ của hàm kết thúc bằng "Kết thúc hàm".',
      'Khối Gọi hàm trong main chỉ ghi tên hàm, không có "kq =".'
    ],
    code: '#include <stdio.h>\nvoid inSao(int n) {\n    int i;\n    for (i = 1; i <= n; i++)\n        printf("*");\n}\nint main() {\n    int n;\n    scanf("%d", &n);\n    inSao(n);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [6] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập n', ln: [8] },
        { id: 'k', type: 'sub', x: 0, y: 180, text: 'inSao(n)', ln: [9] },
        { id: 'e', type: 'term', x: 0, y: 270, text: 'Kết thúc', ln: [10, 11] },
        { id: 'fs', type: 'term', x: 0, y: 390, text: 'Bắt đầu inSao(n)', ln: [1] },
        { id: 'i', type: 'proc', x: 0, y: 480, text: 'i = 1', ln: [3] },
        { id: 'd', type: 'dec', x: 0, y: 590, text: 'i <= n', ln: [3] },
        { id: 'o', type: 'io', x: 0, y: 700, text: 'Xuất "*"', ln: [4] },
        { id: 'u', type: 'proc', x: 0, y: 790, text: 'i++', ln: [3] },
        { id: 'r', type: 'term', x: 260, y: 590, text: 'Kết thúc hàm', ln: [5] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'k' }, { id: 'e3', from: 'k', to: 'e' },
        { id: 'e4', from: 'fs', to: 'i' }, { id: 'e5', from: 'i', to: 'd' },
        { id: 'e6', from: 'd', to: 'o', label: 'Đúng' }, { id: 'e7', from: 'o', to: 'u' }, { id: 'e8', from: 'u', to: 'd' },
        { id: 'e9', from: 'd', to: 'r', label: 'Sai' }
      ]
    },
    tips: ['Hàm có trả về: kết thúc bằng "Trả về x". Hàm void: kết thúc bằng "Kết thúc hàm".'],
    practice: 'Vẽ lưu đồ hàm void `inBangCuuChuong(n)` và main gọi hàm đó.'
  },
  {
    id: 'struct',
    title: 'struct: thông tin sinh viên',
    body: [
      '`struct` gom nhiều thông tin của một đối tượng vào một biến, ví dụ sinh viên có tên và điểm.',
      'Lưu đồ không có hình riêng cho struct. Chỉ cần ghi tên trường bằng dấu chấm: `sv.ten`, `sv.diem`. Phần khai báo struct không vẽ.'
    ],
    code: '#include <stdio.h>\nstruct SinhVien {\n    char ten[30];\n    float diem;\n};\nint main() {\n    struct SinhVien sv;\n    scanf("%s %f", sv.ten, &sv.diem);\n    if (sv.diem >= 5)\n        printf("%s Dat", sv.ten);\n    else\n        printf("%s Chua dat", sv.ten);\n    return 0;\n}',
    chart: {
      nodes: [
        { id: 's', type: 'term', x: 0, y: 0, text: 'Bắt đầu', ln: [5] },
        { id: 'a', type: 'io', x: 0, y: 90, text: 'Nhập sv.ten, sv.diem', ln: [7] },
        { id: 'd', type: 'dec', x: 0, y: 200, text: 'sv.diem >= 5', ln: [8] },
        { id: 't', type: 'io', x: -210, y: 320, text: 'Xuất sv.ten, "Đạt"', ln: [9] },
        { id: 'f', type: 'io', x: 210, y: 320, text: 'Xuất sv.ten, "Chưa đạt"', ln: [10, 11] },
        { id: 'e', type: 'term', x: 0, y: 430, text: 'Kết thúc', ln: [12, 13] }
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a' }, { id: 'e2', from: 'a', to: 'd' },
        { id: 'e3', from: 'd', to: 't', label: 'Đúng' }, { id: 'e4', from: 'd', to: 'f', label: 'Sai' },
        { id: 'e5', from: 't', to: 'e' }, { id: 'e6', from: 'f', to: 'e' }
      ]
    },
    tips: ['Mảng struct: dùng vòng lặp như mảng thường, ghi `ds[i].ten`, `ds[i].diem`.'],
    practice: 'Vẽ lưu đồ nhập danh sách n sinh viên, in ra sinh viên có điểm cao nhất.'
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
