/* Tiếng Anh cho phần phân tích đề:
   1) Đề tiếng Anh → đổi từ khóa sang tiếng Việt để bộ phân tích hiểu.
   2) Kết quả tiếng Việt → dịch sang tiếng Anh khi giao diện đang là tiếng Anh. */
window.AnalyzerEN = (() => {
  const VI_CHARS = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
  const looksEnglish = t => !VI_CHARS.test(t) && /\b(the|enter|input|print|write|program|number|numbers|whether|function|array|if|read|display|output|find|calculate|compute|check)\b/i.test(t);

  // ---------- 1) Đề tiếng Anh → từ khóa tiếng Việt ----------
  const EN2VI = [
    [/\bdo\s*-?\s*while\b/gi, 'do-while'],
    [/\bwrite a (c )?program (that|to|which)\b/gi, 'Viết chương trình'],
    [/\b(write|create|define) an? (void )?function\b/gi, (m, a, v) => 'Viết hàm' + (v ? ' void' : '')],
    [/\b(does not|doesn't) return( a value| anything)?\b|\bno return value\b/gi, 'không trả về'],
    [/\bfunctions?\b/gi, 'hàm'], [/\breturns?\b/gi, 'trả về'],
    [/\bmultiplication table\b/gi, 'bảng cửu chương'],
    [/\b(how many|number of) days\b/gi, 'bao nhiêu ngày'],
    [/\bday of (the )?week\b|\bweekday\b/gi, 'thứ trong tuần'],
    [/\bleap years?\b/gi, 'năm nhuận'],
    [/\bquadratic( equation)?\b/gi, 'phương trình bậc 2'], [/\b(linear|first[- ]degree)( equation)?\b/gi, 'phương trình bậc nhất'],
    [/\bgreater than or equal to\b|\bat least\b/gi, 'lớn hơn hoặc bằng'], [/\bless than or equal to\b|\bat most\b/gi, 'nhỏ hơn hoặc bằng'],
    [/\bnot equal to\b/gi, 'khác'], [/\b(greater|larger|bigger|more) than\b/gi, 'lớn hơn'], [/\b(less|smaller|fewer) than\b/gi, 'nhỏ hơn'],
    [/\b(is )?equal to\b|\bequals\b/gi, 'bằng'],
    [/\b(largest|biggest|greatest|maximum|max|highest)\b/gi, 'lớn nhất'], [/\b(smallest|minimum|min|lowest)\b/gi, 'nhỏ nhất'],
    [/\bcompare\b/gi, 'so sánh'],
    [/\bpositive integers?\b/gi, 'số nguyên dương'], [/\breal numbers?\b/gi, 'số thực'], [/\bintegers?\b/gi, 'số nguyên'],
    [/\bpositive\b/gi, 'dương'], [/\bnegative\b/gi, 'âm'], [/\bzero\b/gi, '0'],
    [/\bdivisible by\b/gi, 'chia hết cho'],
    [/\bprime( numbers?)?\b/gi, 'số nguyên tố'], [/\bfactorial\b/gi, 'giai thừa'],
    [/\bsum of (the )?digits\b/gi, 'tổng các chữ số'], [/\bdigits?\b/gi, 'chữ số'],
    [/\bproduct of\b/gi, 'tích của'], [/\bsum( of)?\b/gi, 'tổng'], [/\bdifference\b/gi, 'hiệu'], [/\bquotient\b/gi, 'thương'],
    [/\b(average|mean)\b/gi, 'trung bình'],
    [/\btriangle\b/gi, 'tam giác'], [/\bsides?\b/gi, 'cạnh'], [/\bequations?\b/gi, 'phương trình'],
    [/\bcircle\b/gi, 'hình tròn'], [/\bradius\b/gi, 'bán kính'], [/\brectangle\b/gi, 'hình chữ nhật'],
    [/\blength\b/gi, 'chiều dài'], [/\bwidth\b/gi, 'chiều rộng'], [/\barea\b/gi, 'diện tích'], [/\bperimeter\b/gi, 'chu vi'],
    [/\btemperature\b/gi, 'nhiệt độ'], [/\bcelsius\b/gi, 'độ C'], [/\bfahrenheit\b/gi, 'độ F'],
    [/\barrays?\b/gi, 'mảng'], [/\belements?\b/gi, 'phần tử'], [/\blist of\b/gi, 'danh sách'],
    [/\bsort(ed|ing)?\b/gi, 'sắp xếp'], [/\bascending( order)?\b/gi, 'tăng dần'], [/\bdescending( order)?\b/gi, 'giảm dần'],
    [/\b(appears?|exists?|is in)\b/gi, 'có xuất hiện'],
    [/\b(re-?enter|ask again|input again)\b/gi, 'nhập lại'], [/\buntil\b/gi, 'cho đến khi'], [/\brepeat\b/gi, 'lặp lại'],
    [/\bfrom (\S+) to (\S+)/gi, 'từ $1 đến $2'], [/\bbetween (\S+) and (\S+)/gi, 'từ $1 đến $2'],
    [/\b(choices?|options?|select|choose)\b/gi, 'lựa chọn'],
    [/\b(addition|add)\b/gi, 'Cộng'], [/\b(subtraction|subtract)\b/gi, 'Trừ'], [/\b(multiplication|multiply)\b/gi, 'Nhân'],
    [/\b(division|divide)\b/gi, 'Chia'], [/\b(exit|quit)\b/gi, 'Thoát'], [/\bcalculator\b/gi, 'máy tính'],
    [/\bstruct(ure)?\b/gi, 'struct'], [/\b(including|consisting of|containing|with fields|has fields)\b/gi, 'gồm'],
    [/\bstudents?\b/gi, 'sinh viên'], [/\bemployees?\b/gi, 'nhân viên'], [/\bproducts?\b/gi, 'sản phẩm'],
    [/\bfull name\b/gi, 'họ tên'], [/\bnames?\b/gi, 'tên'], [/\b(id|code)\b/gi, 'mã'], [/\bprice\b/gi, 'giá'],
    [/\b(score|mark|gpa)s?\b/gi, 'điểm'],
    [/\b(classify|classification|grading|rank)\b/gi, 'xếp loại'], [/\b(academic performance|grade)\b/gi, 'học lực'],
    [/\bmonths?\b/gi, 'tháng'], [/\byears?\b/gi, 'năm'],
    [/\bvalid\b/gi, 'hợp lệ'], [/\binvalid\b/gi, 'không hợp lệ'],
    [/\bcheck (whether|if)\b/gi, 'kiểm tra'], [/\bcheck\b/gi, 'kiểm tra'], [/\b(determine|tell)( whether| if)?\b/gi, 'cho biết'],
    [/\b(calculate|compute)\b/gi, 'tính'], [/\b(search for|search|find)\b/gi, 'tìm'], [/\bcount\b/gi, 'đếm'],
    [/\b(enter|input|read|type in|reads)\b/gi, 'nhập'],
    [/\b(print|prints|output|outputs|display|displays|show|shows)\b/gi, 'in ra'],
    [/\bif\b/gi, 'nếu'], [/\bthen\b/gi, 'thì'], [/\b(otherwise|else)\b/gi, 'ngược lại'],
    [/\beven\b/gi, 'chẵn'], [/\bodd\b/gi, 'lẻ'], [/\bor\b/gi, 'hoặc'], [/\band\b/gi, 'và'],
    [/\bnumbers?\b/gi, 'số'], [/\bloop\b/gi, 'vòng lặp'], [/\b(is|are)\b/gi, 'là']
  ];
  function enToVi(t) {
    let s = t;
    for (const [re, rep] of EN2VI) s = s.replace(re, rep);
    return s;
  }

  // Tô màu đề tiếng Anh
  const HL_EN = [
    ['rule', /\(\s*-?\d+(?:\.\d+)?\s*[-–]\s*-?\d+(?:\.\d+)?\s*\)|positive integers?|real numbers?|integers?|non-?zero|valid/gi],
    ['loop', /\bfrom \S+ to [^\s.,;]+|\buntil\b|\brepeat\b|\bre-?enter\b|\beach\b|\bevery\b|\bloop\b|\bdo\s*-?\s*while\b|\bwhile\b|\bfor\b/gi],
    ['data', /\barrays?\b|\belements?\b|\blist\b|\bstruct(ure)?\b|\bfunctions?\b|\breturns?\b|\bvoid\b|\bswitch\b|\bcase\b|\bmenu\b|\bchoices?\b|\boptions?\b/gi],
    ['in', /\b(enter|input|read|given)\b/gi],
    ['out', /\b(print|output|display|show|calculate|compute|find|determine|check|count|sort|tell)\b/gi],
    ['cond', /\bif\b|\bthen\b|\botherwise\b|\belse\b|\bor\b|>=|<=|!=|==|≥|≤|>|</gi]
  ];
  function highlightEn(orig) {
    const tag = new Array(orig.length).fill('');
    for (const [c, re] of HL_EN) for (const m of orig.matchAll(re)) for (let i = m.index; i < m.index + m[0].length; i++) if (!tag[i]) tag[i] = c;
    const segs = [];
    for (let i = 0; i < orig.length; i++) {
      const last = segs[segs.length - 1];
      if (last && last.c === tag[i]) last.t += orig[i]; else segs.push({ c: tag[i], t: orig[i] });
    }
    return segs;
  }

  // ---------- 2) Kết quả tiếng Việt → tiếng Anh ----------
  // Chữ in ra trong khối Xuất và tên dạng bài.
  const WORDS = [
    ['Không là số nguyên tố', 'Not prime'], ['Là số nguyên tố', 'Prime'], ['Không phải PT bậc 2', 'Not a quadratic equation'],
    ['Vô số nghiệm', 'Infinitely many solutions'], ['Vô nghiệm', 'No solution'], ['Nghiệm kép', 'Double root'],
    ['Không nhuận', 'Not a leap year'], ['Năm nhuận', 'Leap year'], ['Không phải tam giác', 'Not a triangle'], ['Là tam giác', 'Is a triangle'],
    ['Số chẵn', 'Even'], ['Số lẻ', 'Odd'], ['Số dương', 'Positive'], ['Số âm', 'Negative'], ['Bằng 0', 'Zero'], ['Bằng nhau', 'Equal'],
    ['Không chia hết', 'Not divisible'], ['Chia hết', 'Divisible'], ['Không chia được cho 0', 'Cannot divide by 0'],
    ['Điểm không hợp lệ', 'Invalid score'], ['Tháng không hợp lệ', 'Invalid month'], ['Lựa chọn không hợp lệ', 'Invalid choice'],
    ['Không phải chữ số', 'Not a digit'], ['Không hợp lệ', 'Invalid'], ['Tạm biệt', 'Goodbye'], ['Bạn chọn:', 'You chose:'],
    ['Có, ở vị trí', 'Found at index'], ['Không có', 'Not found'], ['Chưa đạt', 'Fail'], ['Đạt', 'Pass'],
    ['Xuất sắc', 'Excellent'], ['Giỏi', 'Good'], ['Khá', 'Fair'], ['Trung bình', 'Average'], ['Yếu', 'Weak'], ['Kém', 'Poor'],
    ['Chủ nhật', 'Sunday'], ['Thứ hai', 'Monday'], ['Thứ ba', 'Tuesday'], ['Thứ tư', 'Wednesday'], ['Thứ năm', 'Thursday'],
    ['Thứ sáu', 'Friday'], ['Thứ bảy', 'Saturday'], ['a lớn hơn', 'a is larger'], ['b lớn hơn', 'b is larger'],
    ['Nhập n > 0', 'Enter n > 0'], ['Chẵn', 'Even'], ['Lẻ', 'Odd'],
    ['Cộng', 'Add'], ['Trừ', 'Subtract'], ['Nhân', 'Multiply'], ['Chia', 'Divide'], ['Thoát', 'Exit']
  ];
  const DIGITS = { 'không': 'zero', 'một': 'one', 'hai': 'two', 'ba': 'three', 'bốn': 'four', 'năm': 'five', 'sáu': 'six', 'bảy': 'seven', 'tám': 'eight', 'chín': 'nine' };
  const PATTERN = {
    'Giải phương trình bậc 2': 'Solve a quadratic equation', 'Giải phương trình bậc 1': 'Solve a linear equation',
    'Kiểm tra năm nhuận': 'Leap year check', 'Kiểm tra 3 cạnh tam giác': 'Triangle check (3 sides)', 'Kiểm tra số nguyên tố': 'Prime number check',
    'Tính giai thừa': 'Factorial', 'In bảng cửu chương': 'Multiplication table', 'Xử lý các chữ số của n': 'Digits of n',
    'Nhập lại cho đến khi hợp lệ': 'Re-enter until valid', 'Tính tổng từ 1 đến n': 'Sum from 1 to n', 'In dãy số từ 1 đến n': 'Print 1 to n',
    'Xếp loại điểm': 'Grade classification', 'Tìm số lớn nhất / nhỏ nhất trong 3 số': 'Largest / smallest of 3 numbers', 'So sánh 2 số': 'Compare 2 numbers',
    'Kiểm tra chẵn / lẻ': 'Even / odd check', 'Kiểm tra chia hết': 'Divisibility check', 'Kiểm tra số âm / dương': 'Positive / negative check',
    'Tính trung bình cộng': 'Average', 'Hình tròn: diện tích, chu vi': 'Circle: area, circumference', 'Hình chữ nhật: diện tích, chu vi': 'Rectangle: area, perimeter',
    'Đổi nhiệt độ C sang F': 'Celsius to Fahrenheit', 'Tính toán với 2 số': 'Arithmetic with 2 numbers', 'Mảng': 'Array',
    'switch: số ngày của tháng': 'switch: days in a month', 'switch: menu lựa chọn': 'switch: menu', 'switch: thứ trong tuần': 'switch: day of the week',
    'switch: đọc chữ số': 'switch: digit to word', 'struct: sinh viên': 'struct: student', 'struct: học sinh': 'struct: pupil',
    'struct: nhân viên': 'struct: employee', 'struct: sản phẩm': 'struct: product', 'struct: cuốn sách': 'struct: book'
  };
  const ENT = { 'sinh viên': 'student', 'học sinh': 'pupil', 'nhân viên': 'employee', 'sản phẩm': 'product', 'cuốn sách': 'book' };
  const ent = s => ENT[s] || s;

  // Câu mẫu: [regex, thay thế]. Xếp câu dài/cụ thể trước.
  const RULES = [
    // Hướng vẽ từng bước
    [/^Vẽ khối Bắt đầu \(hình viên thuốc\)\.$/, 'Draw the Start block (pill shape).'],
    [/^(\s*)Vẽ khối "(.*)" \(hình viên thuốc\)\.$/, (m, p, a) => `${p}Draw the "${node(a)}" block (pill shape).`],
    [/^Vẽ khối Kết thúc\.$/, 'Draw the End block.'],
    [/^(\s*)Vẽ khối "(.*)"\.$/, (m, p, a) => `${p}Draw the "${node(a)}" block.`],
    [/^(\s*)Khối Nhập\/Xuất \(bình hành\): (.*)\.$/, (m, p, a) => `${p}Input/Output block (parallelogram): ${node(a)}.`],
    [/^(\s*)Khối Xử lý \(chữ nhật\): (.*)\.$/, (m, p, a) => `${p}Process block (rectangle): ${a}.`],
    [/^(\s*)Khối Gọi hàm \(chữ nhật có 2 vạch đứng\): (.*)\.$/, (m, p, a) => `${p}Function call block (rectangle with 2 side bars): ${a}.`],
    [/^(\s*)Khối Xử lý: (.*) \(khởi tạo biến đếm\)\.$/, (m, p, a) => `${p}Process block: ${a} (set up the counter).`],
    [/^(\s*)Khối Điều kiện lặp \(thoi\): (.*) \?$/, (m, p, a) => `${p}Loop decision (diamond): ${a} ?`],
    [/^(\s*)Khối Điều kiện \(thoi\) đặt SAU thân lặp: (.*) \?$/, (m, p, a) => `${p}Decision (diamond) placed AFTER the loop body: ${a} ?`],
    [/^(\s*)Khối Điều kiện \(thoi\): (.*) \?$/, (m, p, a) => `${p}Decision block (diamond): ${a} ?`],
    [/^(\s*)→ Nhánh Đúng: đi thẳng xuống khối tiếp theo\.$/, '$1→ True branch: go straight down to the next block.'],
    [/^(\s*)→ Nhánh Sai: đi thẳng xuống khối tiếp theo\.$/, '$1→ False branch: go straight down to the next block.'],
    [/^(\s*)→ Nhánh Đúng:$/, '$1→ True branch:'], [/^(\s*)→ Nhánh Sai:$/, '$1→ False branch:'],
    [/^(\s*)Hai nhánh nhập lại rồi đi tiếp\.$/, '$1The two branches meet, then continue.'],
    [/^(\s*)→ Đúng: chạy thân lặp:$/, '$1→ True: run the loop body:'],
    [/^(\s*)→ Vẽ mũi tên quay ngược lên khối "(.*)"\.$/, '$1→ Draw an arrow back up to "$2".'],
    [/^(\s*)→ Sai: thoát vòng lặp, đi tiếp\.$/, '$1→ False: leave the loop, continue.'],
    [/^(\s*)Thân lặp \(chạy ít nhất 1 lần\):$/, '$1Loop body (runs at least once):'],
    [/^(\s*)→ Đúng: quay ngược lên đầu thân lặp\. Sai: đi tiếp\.$/, '$1→ True: go back up to the start of the body. False: continue.'],
    [/^(\s*)Xếp (\d+) khối Điều kiện \(thoi\) thành một cột dọc, xét từ trên xuống:$/, '$1Stack $2 decision blocks (diamonds) in a column, checked top to bottom:'],
    [/^(\s*)Khối thoi (\d+): (.*) \?  \(case (.*)\)$/, '$1Diamond $2: $3 ?  (case $4)'],
    [/^(\s*)Khối thoi (\d+): (.*) \?$/, '$1Diamond $2: $3 ?'],
    [/^(\s*)→ Đúng \(rẽ phải\): (.*), rồi break \(nhảy ra cuối switch\)\.$/, (m, p, a) => `${p}→ True (go right): ${brief(a)}, then break (jump to the end of switch).`],
    [/^(\s*)→ Đúng \(rẽ phải\): (.*)\.$/, (m, p, a) => `${p}→ True (go right): ${brief(a)}.`],
    [/^(\s*)→ Sai \(đi xuống\): tới khối thoi (\d+)\.$/, '$1→ False (go down): to diamond $2.'],
    [/^(\s*)→ Sai \(đi xuống\): default: (.*)\.$/, (m, p, a) => `${p}→ False (go down): default: ${brief(a)}.`],
    [/^(\s*)→ Sai \(đi xuống\): ra khỏi switch\.$/, '$1→ False (go down): leave the switch.'],
    [/^(\s*)→ Sai \(đi xuống\): (.*)\.$/, (m, p, a) => `${p}→ False (go down): ${brief(a)}.`],
    [/^(\s*)Các nhánh gom về một đường rồi đi tiếp\.$/, '$1The branches join into one line, then continue.'],
    [/^(\s*)switch \((.*)\): lưu đồ không có hình riêng cho switch, vẽ thành (\d+) khối thoi xếp dọc:$/, '$1switch ($2): flowcharts have no special shape for switch, draw it as $3 stacked diamonds:'],
    [/^Lưu đồ riêng của hàm (\w+) \(vẽ bên dưới lưu đồ chính\):$/, 'Separate flowchart for function $1 (drawn below the main flowchart):'],
    // Nhánh, vòng lặp
    [/^Nếu (.*?) → (.*?); ngược lại → bỏ qua$/, (m, c, a) => `If ${c} → ${brief(a)}; otherwise → skip`],
    [/^Nếu (.*?) → (.*?); ngược lại → (.*)$/, (m, c, a, b) => `If ${c} → ${brief(a)}; otherwise → ${brief(b)}`],
    [/^case (.*?) \((.*)\) → (.*)$/, (m, v, c, a) => `case ${v} (${c}) → ${brief(a)}`],
    [/^default \(không khớp case nào\) → (.*)$/, (m, a) => `default (no case matches) → ${a === 'bỏ qua' ? 'skip' : brief(a)}`],
    [/^Vòng lặp for: (.*); lặp khi (.*); mỗi vòng (.*)\.$/, 'for loop: $1; repeat while $2; each time $3.'],
    [/^Vòng lặp while: lặp khi (.*)\.$/, 'while loop: repeat while $1.'],
    [/^Vòng lặp do-while: làm trước, lặp lại khi (.*)\.$/, 'do-while loop: do first, repeat while $1.'],
    // Biến, ràng buộc
    [/^(.*): nhập từ bàn phím$/, '$1: read from the keyboard'], [/^(.*): biến đếm của vòng lặp$/, '$1: loop counter'],
    [/^(.*): biến tính toán \/ kết quả$/, '$1: working value / result'],
    [/^(.*) \(trong hàm (\w+)\): tham số, nhận giá trị từ lời gọi hàm$/, '$1 (in function $2): parameter, gets its value from the call'],
    [/^Giá trị trong khoảng (.*) đến (.*) \((".*")\)\. Nên có khối thoi kiểm tra dữ liệu hợp lệ\.$/, 'Values from $1 to $2 ($3). Add a diamond that checks the data is valid.'],
    [/^Số nguyên dương: phải lớn hơn 0\..*$/, 'Positive integer: must be greater than 0. Check n > 0, or re-enter with do-while.'],
    [/^Có giá trị phải khác 0.*$/, 'A value must not be 0 (usually the divisor).'],
    [/^Số thực: có thể có phần thập phân\.$/, 'Real number: may have a decimal part.'],
    // Xếp loại
    [/^(\d+) mức nối liền nhau, không hở, không chồng: mỗi điểm thuộc đúng 1 mức\.$/, '$1 levels join up with no gaps and no overlaps: every score belongs to exactly 1 level.'],
    [/^Đề giới hạn điểm từ (.*) đến (.*) → khối thoi đầu tiên kiểm tra điểm hợp lệ\.$/, 'The problem limits scores to $1–$2 → the first diamond checks the score is valid.'],
    [/^Đề không nói giới hạn điểm\..*$/, 'The problem gives no score limits. You can add a diamond that checks the score is between 0 and 10.'],
    [/^Đề không ghi mốc điểm, đang dùng mốc thường gặp\..*$/, 'The problem gives no thresholds, so common ones are used. If yours differ, change the numbers in the diamonds.'],
    [/^Hở mốc: điểm từ (.*) đến (.*) không thuộc mức nào \(giữa (.*) và (.*)\)\.$/, (m, a, b, x, y) => `Gap: scores from ${a} to ${b} fit no level (between ${word(x)} and ${word(y)}).`],
    [/^Chồng mốc: điểm từ (.*) đến (.*) thuộc cả (.*) và (.*)\. Lưu đồ xét mức cao trước nên sẽ ra (.*)\.$/, (m, a, b, x, y, z) => `Overlap: scores from ${a} to ${b} fit both ${word(x)} and ${word(y)}. The flowchart checks the higher level first, so the result is ${word(z)}.`],
    [/^Điểm đúng bằng (.*) thuộc cả (.*) và (.*)\.$/, (m, a, x, y) => `A score of exactly ${a} fits both ${word(x)} and ${word(y)}.`],
    [/^Điểm đúng bằng (.*) không thuộc mức nào\.$/, 'A score of exactly $1 fits no level.'],
    [/^Mức (.*) không ghi mốc trên, hiểu là dưới (.*)\.$/, (m, x, a) => `Level ${word(x)} has no upper bound, read as below ${a}.`],
    [/^Có (\d+) mức không có mốc dưới \((.*)\)\..*$/, (m, k, x) => `${k} levels have no lower bound (${x.split(', ').map(word).join(', ')}). Only 1 level can be "everything else".`],
    [/^Mức (.*) cần điểm (.*), lớn hơn điểm tối đa (.*)\.$/, (m, x, a, b) => `Level ${word(x)} needs a score ${a}, above the maximum ${b}.`],
    [/^diem: điểm của sinh viên \(từ (.*) đến (.*)\)$/, 'diem: the student\'s score (from $1 to $2)'],
    [/^diem: điểm của sinh viên$/, 'diem: the student\'s score'], [/^diem: điểm trung bình \(0 đến 10\)$/, 'diem: average score (0 to 10)'],
    [/^In ra học lực: (.*)$/, (m, a) => `Print the level: ${a.split(', ').map(word).join(', ')}`],
    [/^Xếp loại: Giỏi, Khá, Trung bình hoặc Yếu$/, 'Level: Good, Fair, Average or Weak'],
    [/^Xét từ mốc cao xuống thấp\..*$/, 'Check from the highest threshold down. Once you pass the False branch of a diamond above, the score is surely below that threshold, so each diamond only compares with its lower bound.'],
    [/^điểm ≥ (.*)$/, 'score ≥ $1'], [/^điểm > (.*)$/, 'score > $1'], [/^điểm < (.*)$/, 'score < $1'], [/^điểm ≤ (.*)$/, 'score ≤ $1'],
    [/^(.*) (≤|<) điểm (≤|<) (.*)$/, '$1 $2 score $3 $4'], [/^nhánh Sai cuối cùng$/, 'last False branch'],
    // Đề cho / hỏi gì của từng dạng
    [/^a, b, c: ba hệ số của phương trình (.*) \(số thực\)$/, 'a, b, c: the three coefficients of $1 (real numbers)'],
    [/^Nghiệm của phương trình \(vô nghiệm, nghiệm kép, hoặc 2 nghiệm\)$/, 'The roots (no solution, a double root, or 2 roots)'],
    [/^a, b: hai hệ số của phương trình (.*)$/, 'a, b: the two coefficients of $1'],
    [/^Nghiệm x, hoặc báo vô nghiệm \/ vô số nghiệm$/, 'The root x, or say there is no solution / infinitely many'],
    [/^nam: một năm \(số nguyên\)$/, 'nam: a year (integer)'], [/^Năm đó có phải năm nhuận không$/, 'Whether the year is a leap year'],
    [/^Năm nhuận: .*$/, 'Leap year: divisible by 4 but not by 100, or divisible by 400.'],
    [/^a, b, c: độ dài 3 cạnh$/, 'a, b, c: the lengths of the 3 sides'], [/^3 cạnh có tạo thành tam giác không$/, 'Whether the 3 sides form a triangle'],
    [/^Điều kiện: tổng 2 cạnh .*$/, 'Rule: any 2 sides together must be longer than the third.'],
    [/^n: một số nguyên dương$/, 'n: a positive integer'], [/^n có phải số nguyên tố không$/, 'Whether n is prime'],
    [/^Số nguyên tố có đúng 2 ước.*$/, 'A prime has exactly 2 divisors: 1 and itself. Count the divisors and compare with 2.'],
    [/^n: số nguyên không âm$/, 'n: a non-negative integer'], [/^n! = (.*)$/, 'n! = $1'],
    [/^n: bảng cửu chương cần in$/, 'n: the times table to print'], [/^Các dòng n × i với i từ 1 đến 10$/, 'The lines n × i for i from 1 to 10'],
    [/^Số lượng chữ số của n$/, 'How many digits n has'], [/^Tổng các chữ số của n$/, 'The sum of the digits of n'],
    [/^n % 10 lấy chữ số cuối.*$/, 'n % 10 takes the last digit, n / 10 drops the last digit.'],
    [/^(\w+): giá trị người dùng nhập$/, '$1: the value the user enters'],
    [/^Nhập lại đến khi (\w+) nằm trong (.*)\.\.(.*), rồi xuất (\w+)$/, 'Re-enter until $1 is within $2..$3, then print $4'],
    [/^Nhập lại đến khi (.*), rồi xuất (\w+)$/, 'Re-enter until $1, then print $2'],
    [/^Dùng do-while: .*$/, 'Use do-while: input at least once, then check.'],
    [/^n: số nguyên dương$/, 'n: a positive integer'],
    [/^Tổng các số (chẵn |lẻ )?từ 1 đến n$/, (m, k) => `Sum of the ${k === 'chẵn ' ? 'even ' : k === 'lẻ ' ? 'odd ' : ''}numbers from 1 to n`],
    [/^In các số (chẵn |lẻ )?từ 1 đến n$/, (m, k) => `Print the ${k === 'chẵn ' ? 'even ' : k === 'lẻ ' ? 'odd ' : ''}numbers from 1 to n`],
    [/^Xếp loại: (.*)$/, (m, a) => `Level: ${a.split(', ').map(word).join(', ')}`],
    [/^(.*): ba số$/, '$1: three numbers'], [/^Số (lớn|nhỏ) nhất trong 3 số$/, (m, k) => `The ${k === 'lớn' ? 'largest' : 'smallest'} of the 3 numbers`],
    [/^Mẹo: coi (\w+) là (\w+) trước, rồi so lần lượt với từng số còn lại\.$/, 'Tip: take $1 as $2 first, then compare with each remaining number.'],
    [/^(.*): hai số$/, '$1: two numbers'], [/^(\w+) lớn hơn, nhỏ hơn hay bằng (\w+)$/, 'Whether $1 is larger than, smaller than or equal to $2'],
    [/^Số (lớn|nhỏ) hơn trong 2 số$/, (m, k) => `The ${k === 'lớn' ? 'larger' : 'smaller'} of the 2 numbers`],
    [/^(\w+): một số nguyên$/, '$1: an integer'], [/^(\w+) là số chẵn hay số lẻ$/, 'Whether $1 is even or odd'],
    [/^Số chẵn là số chia 2 dư 0\..*$/, 'An even number leaves remainder 0 when divided by 2. In C: n % 2 == 0.'],
    [/^(\w+): số cần kiểm tra; (\w+): số chia$/, '$1: the number to check; $2: the divisor'], [/^(\w+): số cần kiểm tra$/, '$1: the number to check'],
    [/^(\w+) có chia hết cho (\w+) không$/, 'Whether $1 is divisible by $2'],
    [/^(\w+): một số$/, '$1: a number'], [/^(\w+) là số dương, số âm hay bằng 0$/, 'Whether $1 is positive, negative or zero'],
    [/^(.*): các số cần tính$/, '$1: the numbers'], [/^Trung bình cộng$/, 'The average'],
    [/^r: bán kính \(số thực\)$/, 'r: the radius (real number)'], [/^Diện tích S và chu vi C của hình tròn$/, 'Area S and circumference C of the circle'],
    [/^dai, rong: chiều dài, chiều rộng$/, 'dai, rong: length and width'], [/^Diện tích S và chu vi P$/, 'Area S and perimeter P'],
    [/^C: nhiệt độ theo độ C$/, 'C: temperature in Celsius'], [/^Nhiệt độ F tương ứng$/, 'The same temperature in Fahrenheit'],
    [/^Phép chia phải kiểm tra số chia khác 0.*$/, 'Division must check the divisor is not 0 → one extra diamond.'],
    [/^n: số phần tử$/, 'n: number of elements'], [/^a\[0\], a\[1\], \.\.\., a\[n-1\]: các phần tử của mảng$/, 'a[0], a[1], ..., a[n-1]: the array elements'],
    [/^Trung bình cộng các phần tử$/, 'Average of the elements'], [/^Tổng các phần tử$/, 'Sum of the elements'],
    [/^Phần tử lớn nhất$/, 'Largest element'], [/^Phần tử nhỏ nhất$/, 'Smallest element'],
    [/^Số phần tử (chẵn|lẻ|âm|dương)$/, (m, k) => `Number of ${{ 'chẵn': 'even', 'lẻ': 'odd', 'âm': 'negative', 'dương': 'positive' }[k]} elements`],
    [/^x có trong mảng không, ở vị trí nào$/, 'Whether x is in the array, and where'],
    [/^Sắp xếp mảng (tăng|giảm) dần$/, (m, k) => `Sort the array in ${k === 'tăng' ? 'ascending' : 'descending'} order`],
    [/^In các phần tử của mảng$/, 'Print the array elements'],
    [/^Mảng đánh số từ 0.*$/, 'Arrays start at index 0, so the loop runs i = 0 while i < n. Reading an array = one loop, reading one element a[i] each time.'],
    [/^thang, nam: tháng và năm$/, 'thang, nam: month and year'], [/^thang: số tháng \(1 đến 12\)$/, 'thang: month number (1 to 12)'],
    [/^Tháng đó có bao nhiêu ngày$/, 'How many days the month has'],
    [/^Nhiều case dùng chung .*$/, 'Several cases doing the same thing (case 1: case 3: ...) share one diamond.'],
    [/^n: một chữ số từ 0 đến 9$/, 'n: a digit from 0 to 9'], [/^Cách đọc của n bằng chữ$/, 'n written as a word'],
    [/^a, b: hai số$/, 'a, b: two numbers'], [/^chon: số người dùng chọn trong menu$/, 'chon: the number the user picks from the menu'],
    [/^Làm việc tương ứng với lựa chọn$/, 'Do the action for the chosen option'],
    [/^Đề muốn lặp lại menu nên bọc trong do-while: chạy đến khi chọn (\d+) \((.*)\)\.$/, (m, k, t) => `The menu repeats, so it is wrapped in do-while: run until option ${k} (${word(t)}) is chosen.`],
    [/^n: số từ (.*) đến (.*)$/, 'n: a number from $1 to $2'], [/^Thứ tương ứng$/, 'The matching day of the week'],
    [/^Đang hiểu 1 là Chủ nhật.*$/, 'Reading 1 as Sunday, 2 as Monday... If your problem numbers them differently, change the diamonds.'],
    [/^(\w+): một (.*), gồm (.*)$/, (m, v, e, f) => `${v}: one ${ent(e)}, with ${f}`],
    [/^In ra thông tin (.*)$/, (m, e) => `Print the ${ent(e)} information`],
    [/^n: số (.*)$/, (m, e) => `n: number of ${ent(e)}s`],
    [/^ds\[0\.\.n-1\]: mảng (.*), mỗi phần tử có (.*)$/, (m, e, f) => `ds[0..n-1]: array of ${ent(e)}s, each with ${f}`],
    [/^In danh sách (.*)$/, (m, e) => `Print the list of ${ent(e)}s`],
    [/^(.*) có (\w+) cao nhất$/, (m, e, f) => `The ${ent(e)} with the highest ${f}`],
    [/^struct gom nhiều thông tin của một (.*) vào một biến\. Trong lưu đồ ghi bằng dấu chấm: (.*)\. Không có hình riêng cho struct\.$/, (m, e, x) => `A struct groups the information of one ${ent(e)} into one variable. In the flowchart, use a dot: ${x}. There is no special shape for struct.`],
    // Phân tích chung
    [/^(.*): lấy từ "(.*)"$/, '$1: taken from "$2"'], [/^Đề không nói rõ\. Thường là các số cần nhập\.$/, 'Not stated. Usually the numbers to read.'],
    [/^Chưa rõ\. Tìm các chữ: .*$/, 'Not clear. Look for words like "calculate", "find", "print", "tell".'],
    [/^"(.*)" → khối Nhập$/, '"$1" → Input block'], [/^"(.*)" → khối Điều kiện$/, '"$1" → Decision block'],
    [/^"(.*)" → nhánh Sai$/, '"$1" → False branch'], [/^"(.*)" → khối Xử lý \+ khối Xuất$/, '"$1" → Process block + Output block'],
    // Ghi chú ghép (note) – từng câu
    [/Đề có ý lặp lại \(từ 1 đến n \/ nhiều số\) → cần vòng lặp for hoặc while\./g, 'The problem repeats something (1 to n / many numbers) → it needs a for or while loop.'],
    [/Không nhận ra dạng bài quen thuộc, đây là khung gợi ý\. Hãy mở trong Bảng vẽ và sửa lại cho đúng đề\./g, 'Not a familiar problem type, so this is a starting frame. Open it on the board and adjust it to the problem.'],
    [/Đề yêu cầu dùng (\S+) nên vòng lặp được vẽ theo kiểu do-while \(khối thoi nằm cuối thân lặp\)\./g, 'The problem asks for $1, so the loop is drawn as do-while (the diamond sits at the end of the body).'],
    [/Đề yêu cầu dùng (\S+) nên vòng lặp được vẽ theo kiểu while\./g, 'The problem asks for $1, so the loop is drawn as a while loop.'],
    [/Đề yêu cầu viết hàm\. Hàm (\w+) có trả về giá trị: vẽ lưu đồ riêng cho hàm, khối cuối ghi "(.*?)"\. Ở lưu đồ chính, lời gọi hàm là khối chữ nhật có 2 vạch đứng\./g, (m, f, e) => `The problem asks for a function. ${f} returns a value: draw a separate flowchart for it, whose last block says "${node(e)}". In the main flowchart, the call is a rectangle with 2 side bars.`],
    [/Hàm (\w+) không trả về giá trị \(void\): hàm tự làm và tự in kết quả, khối cuối ghi "Kết thúc hàm"\. Ở lưu đồ chính, lời gọi hàm là khối chữ nhật có 2 vạch đứng\./g, '$1 returns nothing (void): it does the work and prints the result itself, and its last block says "End function". In the main flowchart, the call is a rectangle with 2 side bars.'],
    [/Đề có nhắc tới hàm, nhưng dạng bài này nhập dữ liệu ở giữa chương trình nên vẫn vẽ trong lưu đồ chính\./g, 'The problem mentions a function, but this type reads input in the middle of the program, so it stays in the main flowchart.']
  ];
  function word(w) {
    const t = String(w).trim();
    for (const [vi, en] of WORDS) if (t === vi) return en;
    return t;
  }
  // Dịch chữ trong một khối lưu đồ (giữ biểu thức, dịch từ khóa và chuỗi "...").
  function node(text) {
    let s = String(text);
    s = s.replace(/^Bắt đầu/, 'Start').replace(/^Kết thúc hàm/, 'End function').replace(/^Kết thúc/, 'End')
      .replace(/^Trả về/, 'Return').replace(/^Nhập /, 'Input ').replace(/^Xuất /, 'Output ');
    s = s.replace(/"([^"]*)"/g, (m, q) => `"${quoted(q)}"`);
    return s;
  }
  function quoted(q) {
    if (DIGITS[q]) return DIGITS[q];
    if (/^Bạn chọn: /.test(q)) return 'You chose: ' + word(q.slice(10));
    return word(q);
  }
  // Danh sách việc rút gọn ("Xuất x, xét tiếp "..."", "switch theo x", "lặp", "đi tiếp")
  function brief(s) {
    return s.split(/, (?=Xuất|Nhập|xét tiếp|switch theo|lặp\b|đi tiếp)/).map(part => {
      if (/^xét tiếp "(.*)"$/.test(part)) return part.replace(/^xét tiếp "(.*)"$/, 'check "$1"');
      if (/^switch theo (.*)$/.test(part)) return part.replace(/^switch theo (.*)$/, 'switch on $1');
      if (part === 'lặp') return 'loop';
      if (part === 'đi tiếp') return 'continue';
      return node(part);
    }).join(', ');
  }
  function line(s) {
    if (typeof s !== 'string') return s;
    for (const [re, rep] of RULES) {
      if (re.global) { s = s.replace(re, rep); continue; }
      if (re.test(s)) return s.replace(re, rep);
    }
    return s;
  }
  function out(s) {
    // Một dòng kết quả chạy thử: dịch các cụm chữ đã biết.
    let r = String(s);
    if (DIGITS[r]) return DIGITS[r];
    if (/^Bạn chọn: /.test(r)) return 'You chose: ' + word(r.slice(10));
    for (const [vi, en] of WORDS) r = r.split(vi).join(en);
    return r.replace(/… \((\d+) dòng\)/, '… ($1 lines)');
  }
  function path(p) {
    return p.replace(/: Đúng$/, ': True').replace(/: Sai$/, ': False').replace(/^lặp (\d+) lần$/, 'looped $1 times')
      .replace(/^gọi /, 'call ').replace(/^switch (.*): case/, 'switch $1: case');
  }

  function translate(r) {
    r.pattern = r.pattern && (PATTERN[r.pattern] || r.pattern);
    for (const k of ['given', 'asked', 'branches', 'loops', 'steps', 'rules', 'vars', 'found']) r[k] = (r[k] || []).map(line);
    r.note = (r.notes || [r.note || '']).map(line).join(' ');
    r.checks = r.checks.map(c => ({ ...c, msg: line(c.msg) }));
    if (r.table) r.table = r.table.map(t => ({ ...t, name: word(t.name), range: line(t.range), block: line(t.block) }));
    r.tests = r.tests.map(t => ({ ...t, output: t.output.map(out), path: t.path.map(path) }));
    r.funcs = r.funcs.map(f => ({ ...f, ret: f.ret === '1 nếu đúng, 0 nếu sai' ? '1 if true, 0 if false' : f.ret }));
    r.chart = {
      nodes: r.chart.nodes.map(n => ({ ...n, text: node(n.text) })),
      edges: r.chart.edges.map(e => ({ ...e, label: e.label === 'Đúng' ? 'True' : e.label === 'Sai' ? 'False' : e.label }))
    };
    return r;
  }

  function analyze(text, lang) {
    const isEn = looksEnglish(text);
    const r = Analyzer.analyze(isEn ? enToVi(text) : text);
    if (!r) return null;
    if (isEn) {
      r.highlight = highlightEn(text.normalize('NFC').trim());
      r.found = [];
      if (r.table) r.table.forEach(t => { t.raw = t.raw.replace(/[Đđ]iểm/g, 'score'); });
      r.rules = r.rules.map(x => x.replace(/\("từ (\S+) đến (\S+)"\)/, '("from $1 to $2")'));
      if (!r.pattern) {
        // Khung chung: chữ trích từ đề đang là bản đã đổi từ khóa, lấy lại câu gốc tiếng Anh.
        const src = text.normalize('NFC').trim();
        const am = src.match(/\b(print|output|display|show|calculate|compute|find|tell|determine|check|count)\b[^.;\n]*/i);
        const im = src.match(/\b(enter|input|read|given)\b[^.;\n]*/i);
        r.given = r.given.map(g => g.replace(/: lấy từ ".*"$/, im ? `: lấy từ "${im[0].trim()}"` : ''));
        if (am) r.asked = [am[0].trim()];
      }
      r.inputNote = lang === 'en' ? T('enInputNote') : 'Đề tiếng Anh được đọc theo từ khóa. Nếu kết quả lạ, viết lại bằng từ đơn giản như enter, print, if, sum, largest.';
    }
    return lang === 'en' ? translate(r) : r;
  }

  return { analyze, node, enToVi, translate, looksEnglish };
})();
