/* Song ngữ Việt / Anh cho giao diện. T('khóa', ...tham số) trả về chữ theo ngôn ngữ đang chọn. */
window.I18N = (() => {
  const KEY = 'luu-do-c-lang';
  let lang = 'vi';
  try { lang = localStorage.getItem(KEY) || ((navigator.language || '').startsWith('vi') ? 'vi' : 'vi'); } catch (e) { }
  if (!['vi', 'en'].includes(lang)) lang = 'vi';

  const D = {
    vi: {
      title: 'Lưu Đồ C', desc: 'Học vẽ lưu đồ (flowchart) cho ngôn ngữ C: bài hướng dẫn, phân tích đề bài và bảng vẽ có kiểm tra lỗi.',
      tabLearn: 'Hướng dẫn', tabAnalyze: 'Phân tích đề', tabDraw: 'Bảng vẽ', langBtn: 'EN', langTitle: 'Switch to English',
      lessonsAria: 'Danh sách bài',
      anaTitle: 'Phân tích đề bài',
      anaIntro: 'Gõ hoặc dán đề bài vào đây, hoặc đưa ảnh chụp đề. Trang sẽ tìm: đề cho gì, hỏi gì, có những nhánh nào, có lặp không, rồi gợi ý cách vẽ lưu đồ.',
      anaPlaceholder: 'Ví dụ: Nhập vào một số nguyên n. Kiểm tra n là số chẵn hay số lẻ.\nCó ảnh đề? Bấm Ctrl+V để dán ảnh, hoặc kéo thả ảnh vào đây.',
      dropHint: 'Thả ảnh vào đây để đọc đề', btnAnalyze: 'Phân tích đề', btnImg: 'Tải ảnh đề',
      anaNote: 'Chạy ngay trên máy bạn, ảnh và đề không gửi đi đâu. Chỉ vẽ lưu đồ, không viết code. Đề lạ thì kết quả chỉ là khung gợi ý.',
      tryExamples: 'Thử đề mẫu:', imgAlt: 'Ảnh đề bài',
      addTerm: 'Bắt đầu/Kết thúc', addIo: 'Nhập/Xuất', addProc: 'Xử lý', addDec: 'Điều kiện', addSub: 'Gọi hàm',
      btnConnect: 'Nối mũi tên', btnUndo: 'Hoàn tác', btnDel: 'Xóa mục chọn', btnCheck: 'Kiểm tra', tplOpen: 'Mở mẫu…',
      btnFit: 'Xem toàn bộ', zoomOut: 'Thu nhỏ', zoomIn: 'Phóng to', btnPng: 'Tải ảnh PNG', btnClear: 'Xóa hết',
      autoLink: 'Tự nối mũi tên từ khối đang chọn', canvasAria: 'Bảng vẽ lưu đồ',
      // Hướng dẫn
      inC: 'Trong C:', arrowName: 'Mũi tên', arrowLook: 'Đường có đầu nhọn',
      arrowTip: 'Chỉ hướng chương trình chạy tiếp. Mũi tên ra từ khối thoi ghi <b>Đúng</b> hoặc <b>Sai</b>.',
      codeC: 'Code C', chart: 'Lưu đồ', notes: 'Lưu ý', mistakes: 'Lỗi hay gặp', tryDraw: 'Thử tự vẽ:',
      openSample: 'Mở mẫu này trong Bảng vẽ', openBoard: 'Mở bảng vẽ', nextLesson: 'Bài tiếp:',
      // OCR
      ocrCore: 'Đang tải bộ đọc chữ…', ocrInit: 'Đang khởi động bộ đọc chữ…', ocrLang: 'Đang tải dữ liệu đọc chữ (lần đầu hơi lâu)…',
      ocrApi: 'Đang chuẩn bị…', ocrRead: 'Đang đọc chữ trong ảnh…', ocrNotImg: 'Tệp này không phải ảnh.', ocrBusy: 'Đang đọc ảnh trước, chờ chút nhé.',
      ocrNone: 'Không đọc được chữ nào.', ocrNoneTip: 'Thử ảnh rõ hơn, chụp thẳng, đủ sáng, cắt sát phần đề.',
      ocrDone: 'Đã đọc xong đề từ ảnh.', ocrDoneTip: 'Máy đọc có thể sai vài chữ hoặc ký hiệu (như x², ≤). Hãy xem lại ô đề bài, sửa nếu cần rồi bấm Phân tích đề lần nữa.',
      ocrFail: 'Không đọc được ảnh.', ocrFailTip: 'Cần có mạng ở lần đầu để tải bộ đọc chữ. Hoặc gõ đề vào ô ở trên.',
      // Phân tích
      needText: 'Hãy dán đề bài vào ô trước.', none: 'Không có.', patternOk: 'Nhận ra dạng bài:', patternNo: 'Chưa nhận ra dạng bài quen thuộc, đây là khung gợi ý',
      step1: 'Bước 1. Đọc đề', lgIn: 'Nhập', lgOut: 'Xuất / câu hỏi', lgCond: 'Điều kiện', lgLoop: 'Lặp', lgData: 'Mảng, hàm, struct, switch', lgRule: 'Ràng buộc',
      step2: 'Bước 2. Tách đề', given: 'Đề cho gì (đầu vào)', asked: 'Đề hỏi gì (đầu ra)', vars: 'Biến dùng trong lưu đồ', rules: 'Ràng buộc trong đề', noRules: 'Đề không nêu giới hạn dữ liệu.',
      step3: 'Bước 3. Tìm nhánh và vòng lặp', branches: 'Các nhánh (khối thoi)', loops: 'Có lặp không', noLoop: 'Không cần vòng lặp.',
      funcs: 'Hàm', fnRet: r => `có trả về (${r})`, fnVoid: 'không trả về (void)',
      tbl: 'Bảng mốc đọc từ đề', tResult: 'Kết quả', tWritten: 'Trong đề ghi', tRange: 'Khoảng điểm', tBlock: 'Khối thoi so',
      audit: 'Soát lại đề', found: 'Câu chữ trong đề → khối',
      step4: 'Bước 4. Vẽ lưu đồ', howto: 'Hướng vẽ từng bước', suggested: 'Lưu đồ gợi ý', openEdit: 'Mở trong Bảng vẽ để sửa', suggestedName: 'lưu đồ gợi ý',
      step5: 'Bước 5. Chạy thử lưu đồ', runIntro: 'Đi theo lưu đồ gợi ý với từng bộ dữ liệu. Tự dò lưu đồ của bạn xem có ra cùng kết quả không.',
      tIn: 'Nhập', tPath: 'Đi qua', tOut: 'Kết quả in ra', straight: 'thẳng xuống', noPrint: '(không in gì)',
      enInputNote: '',
      // Bảng vẽ
      defStart: 'Bắt đầu', defEnd: 'Kết thúc', defIo: 'Nhập a', defProc: 'x = a + 1', defDec: 'a > b', defSub: 'kq = tenHam(a)',
      yes: 'Đúng', no: 'Sai',
      selfLink: 'Không nối một khối với chính nó.', dupLink: 'Đã có mũi tên này rồi.', twoOuts: 'Khối điều kiện chỉ nên có 2 mũi tên ra.',
      oneOut: 'Khối này đã có mũi tên ra. Muốn rẽ nhánh hãy dùng khối Điều kiện.', noSel: 'Chưa chọn khối hay mũi tên nào.',
      conn1: 'Nối mũi tên: bấm khối bắt đầu của mũi tên.', conn2: 'Giờ bấm khối mà mũi tên chỉ tới. (Bấm lại khối cũ để hủy)',
      conn3: 'Đã nối. Bấm khối khác để nối tiếp, hoặc tắt "Nối mũi tên".',
      clearAsk: 'Xóa hết lưu đồ trên bảng vẽ? (Có thể bấm Hoàn tác để lấy lại)', empty: 'Bảng vẽ đang trống.',
      pngName: 'luu-do.png', pngDone: 'Đã tải ảnh luu-do.png (nền trắng, dán được vào Word).', pngFail: 'Không tạo được ảnh. Thử lại nhé.',
      noUndo: 'Không còn gì để hoàn tác.', replaceAsk: n => `Thay lưu đồ trên bảng vẽ bằng ${n}? (Có thể bấm Hoàn tác để lấy lại)`,
      textLabel: 'Chữ trong khối (Enter để xuống dòng)', delBlock: 'Xóa khối', arrow: 'Mũi tên', fromTo: (a, b) => `Từ "${a}" tới "${b}"`,
      label: 'Nhãn', noLabel: 'Không ghi', flip: 'Đổi chiều', delArrow: 'Xóa mũi tên',
      arrowHint: 'Mũi tên đi ra từ khối Điều kiện phải ghi <b>Đúng</b> hoặc <b>Sai</b>.',
      howUse: 'Cách dùng',
      use: ['Bấm một khối trên thanh công cụ để thêm vào bảng.', 'Đang chọn một khối mà thêm khối mới thì mũi tên tự nối xuống.',
        'Kéo khối để di chuyển. Kéo nền để xem chỗ khác. Lăn chuột để phóng to.', 'Bấm 2 lần vào khối để sửa chữ.',
        '"Nối mũi tên": bấm khối đầu, rồi bấm khối cuối.', 'Bấm <b>Kiểm tra</b> để xem lưu đồ đúng quy tắc chưa.'],
      saved: 'Bài vẽ tự lưu trên trình duyệt này. Phím tắt: Ctrl+Z hoàn tác, Delete xóa, Esc bỏ chọn.', checkRes: 'Kết quả kiểm tra',
      // Kiểm tra
      blank: '(trống)', cEmpty: 'Bảng vẽ trống. Hãy thêm khối Bắt đầu.', cNoStart: 'Chưa có khối Bắt đầu (hình viên thuốc ghi "Bắt đầu").',
      cTwoStart: 'Lưu đồ chính chỉ có 1 khối Bắt đầu. Lưu đồ của hàm ghi "Bắt đầu tênHàm(...)".', cNoEnd: 'Chưa có khối Kết thúc.',
      cNoText: 'Có khối chưa ghi chữ.', cStartIn: 'Không có mũi tên nào được đi vào khối Bắt đầu.', cStartOut: 'Khối Bắt đầu cần đúng 1 mũi tên đi ra.',
      cEndOut: 'Khối Kết thúc không có mũi tên đi ra.', cEndIn: 'Chưa có mũi tên nào đi tới khối Kết thúc.',
      cTermName: n => `Khối viên thuốc ${n} nên ghi "Bắt đầu" hoặc "Kết thúc".`, cNoIn: n => `Khối ${n} chưa có mũi tên đi vào.`,
      cDecOuts: (n, k) => `Khối điều kiện ${n} cần đúng 2 mũi tên ra (Đúng và Sai), đang có ${k}.`,
      cDecLabels: n => `Ghi nhãn Đúng và Sai cho 2 mũi tên ra từ ${n}.`, cDecCmp: n => `Điều kiện ${n} nên là phép so sánh, ví dụ a > b.`,
      cNoOut: n => `Khối ${n} chưa có mũi tên đi ra.`, cManyOut: (n, k) => `Khối ${n} có ${k} mũi tên ra. Muốn rẽ nhánh hãy dùng khối Điều kiện (thoi).`,
      cProcIo: n => `${n} là nhập/xuất, nên dùng hình bình hành.`, cProcCall: n => `${n} là gọi hàm, nên dùng khối Gọi hàm (chữ nhật 2 vạch đứng).`,
      cSubParen: n => `Khối gọi hàm ${n} nên ghi tên hàm kèm ngoặc, ví dụ kq = giaiThua(n).`, cProcIf: n => `${n} là điều kiện, nên dùng hình thoi.`,
      cIoWord: n => `Khối Nhập/Xuất ${n} nên bắt đầu bằng "Nhập" hoặc "Xuất".`, cSelf: 'Có mũi tên tự nối vào chính khối của nó.',
      cUnreach: n => `Không đi tới được khối ${n} từ Bắt đầu.`, cNoEndPath: n => `Từ khối ${n} không đi tới được Kết thúc (có thể lặp mãi).`,
      cOk: 'Lưu đồ đúng quy tắc. Tốt lắm!', cOkToast: 'Lưu đồ đúng quy tắc!', cSum: (b, w) => `Có ${b} lỗi, ${w} lưu ý. Xem bảng bên phải.`
    },
    en: {
      title: 'C Flowchart', desc: 'Learn to draw flowcharts for C: lessons, problem analysis and a drawing board that checks your chart.',
      tabLearn: 'Lessons', tabAnalyze: 'Analyze', tabDraw: 'Draw', langBtn: 'VI', langTitle: 'Chuyển sang tiếng Việt',
      lessonsAria: 'Lesson list',
      anaTitle: 'Analyze a problem',
      anaIntro: 'Type or paste the problem here, or give a photo of it. The page finds what is given, what is asked, the branches and loops, then suggests how to draw the flowchart.',
      anaPlaceholder: 'Example: Enter an integer n. Check whether n is even or odd.\nHave a photo? Press Ctrl+V to paste it, or drag and drop it here.',
      dropHint: 'Drop the image here to read it', btnAnalyze: 'Analyze', btnImg: 'Upload a photo',
      anaNote: 'Runs on your device, nothing is sent anywhere. Flowcharts only, no code. For unusual problems the result is only a starting frame.',
      tryExamples: 'Try an example:', imgAlt: 'Photo of the problem',
      addTerm: 'Start/End', addIo: 'Input/Output', addProc: 'Process', addDec: 'Decision', addSub: 'Function call',
      btnConnect: 'Connect arrow', btnUndo: 'Undo', btnDel: 'Delete selected', btnCheck: 'Check', tplOpen: 'Open a sample…',
      btnFit: 'Fit to screen', zoomOut: 'Zoom out', zoomIn: 'Zoom in', btnPng: 'Download PNG', btnClear: 'Clear all',
      autoLink: 'Auto-connect from the selected block', canvasAria: 'Flowchart drawing board',
      inC: 'In C:', arrowName: 'Arrow', arrowLook: 'A line with an arrowhead',
      arrowTip: 'Shows where the program goes next. Arrows leaving a diamond are labeled <b>True</b> or <b>False</b>.',
      codeC: 'C code', chart: 'Flowchart', notes: 'Notes', mistakes: 'Common mistakes', tryDraw: 'Try it yourself:',
      openSample: 'Open this sample on the board', openBoard: 'Open the board', nextLesson: 'Next:',
      ocrCore: 'Loading the text reader…', ocrInit: 'Starting the text reader…', ocrLang: 'Loading language data (slow the first time)…',
      ocrApi: 'Getting ready…', ocrRead: 'Reading the text in the photo…', ocrNotImg: 'This file is not an image.', ocrBusy: 'Still reading the previous photo, please wait.',
      ocrNone: 'No text found.', ocrNoneTip: 'Try a sharper photo, taken straight on, well lit and cropped to the problem.',
      ocrDone: 'Finished reading the problem from the photo.', ocrDoneTip: 'The reader can get a few letters or symbols wrong (like x², ≤). Check the text box, fix it if needed, then press Analyze again.',
      ocrFail: 'Could not read the photo.', ocrFailTip: 'The first time needs an internet connection to load the reader. Or type the problem above.',
      needText: 'Paste a problem into the box first.', none: 'None.', patternOk: 'Recognized problem type:', patternNo: 'Not a familiar problem type, this is a starting frame',
      step1: 'Step 1. Read the problem', lgIn: 'Input', lgOut: 'Output / question', lgCond: 'Condition', lgLoop: 'Loop', lgData: 'Array, function, struct, switch', lgRule: 'Constraint',
      step2: 'Step 2. Break it down', given: 'What is given (input)', asked: 'What is asked (output)', vars: 'Variables in the flowchart', rules: 'Constraints in the problem', noRules: 'The problem gives no limits on the data.',
      step3: 'Step 3. Find branches and loops', branches: 'Branches (diamonds)', loops: 'Any loops?', noLoop: 'No loop needed.',
      funcs: 'Functions', fnRet: r => `returns a value (${r})`, fnVoid: 'returns nothing (void)',
      tbl: 'Thresholds read from the problem', tResult: 'Result', tWritten: 'Problem says', tRange: 'Score range', tBlock: 'Diamond checks',
      audit: 'Problem check', found: 'Wording in the problem → block',
      step4: 'Step 4. Draw the flowchart', howto: 'Step-by-step drawing guide', suggested: 'Suggested flowchart', openEdit: 'Open on the board to edit', suggestedName: 'the suggested flowchart',
      step5: 'Step 5. Trace the flowchart', runIntro: 'Follow the suggested flowchart with each set of data. Trace your own flowchart and see if you get the same results.',
      tIn: 'Input', tPath: 'Path', tOut: 'Printed', straight: 'straight down', noPrint: '(prints nothing)',
      enInputNote: 'English problems are read by keywords. If the result looks off, rephrase with simple words like enter, print, if, sum, largest.',
      defStart: 'Start', defEnd: 'End', defIo: 'Input a', defProc: 'x = a + 1', defDec: 'a > b', defSub: 'res = myFunc(a)',
      yes: 'True', no: 'False',
      selfLink: 'A block cannot connect to itself.', dupLink: 'That arrow already exists.', twoOuts: 'A decision block should have only 2 outgoing arrows.',
      oneOut: 'This block already has an outgoing arrow. Use a Decision block to branch.', noSel: 'Nothing is selected.',
      conn1: 'Connect arrow: click the block the arrow starts from.', conn2: 'Now click the block the arrow points to. (Click the first block again to cancel)',
      conn3: 'Connected. Click another block to keep connecting, or turn off "Connect arrow".',
      clearAsk: 'Clear the whole flowchart? (Undo can bring it back)', empty: 'The board is empty.',
      pngName: 'flowchart.png', pngDone: 'Downloaded flowchart.png (white background, ready for Word).', pngFail: 'Could not create the image. Please try again.',
      noUndo: 'Nothing left to undo.', replaceAsk: n => `Replace the flowchart on the board with ${n}? (Undo can bring it back)`,
      textLabel: 'Text in the block (Enter for a new line)', delBlock: 'Delete block', arrow: 'Arrow', fromTo: (a, b) => `From "${a}" to "${b}"`,
      label: 'Label', noLabel: 'None', flip: 'Reverse', delArrow: 'Delete arrow',
      arrowHint: 'Arrows leaving a Decision block must be labeled <b>True</b> or <b>False</b>.',
      howUse: 'How to use',
      use: ['Click a block in the toolbar to add it.', 'If a block is selected, the new block is placed below and connected automatically.',
        'Drag a block to move it. Drag the background to pan. Scroll to zoom.', 'Double-click a block to edit its text.',
        '"Connect arrow": click the first block, then the second.', 'Press <b>Check</b> to see if the flowchart follows the rules.'],
      saved: 'Your drawing is saved in this browser. Shortcuts: Ctrl+Z undo, Delete remove, Esc deselect.', checkRes: 'Check results',
      blank: '(empty)', cEmpty: 'The board is empty. Add a Start block.', cNoStart: 'There is no Start block (a pill shape that says "Start").',
      cTwoStart: 'The main flowchart has only 1 Start block. A function flowchart says "Start funcName(...)".', cNoEnd: 'There is no End block.',
      cNoText: 'A block has no text.', cStartIn: 'No arrow may point into the Start block.', cStartOut: 'The Start block needs exactly 1 outgoing arrow.',
      cEndOut: 'The End block has no outgoing arrows.', cEndIn: 'No arrow reaches the End block yet.',
      cTermName: n => `The pill block ${n} should say "Start" or "End".`, cNoIn: n => `Block ${n} has no incoming arrow.`,
      cDecOuts: (n, k) => `Decision ${n} needs exactly 2 outgoing arrows (True and False), it has ${k}.`,
      cDecLabels: n => `Label the 2 arrows leaving ${n} as True and False.`, cDecCmp: n => `Condition ${n} should be a comparison, like a > b.`,
      cNoOut: n => `Block ${n} has no outgoing arrow.`, cManyOut: (n, k) => `Block ${n} has ${k} outgoing arrows. Use a Decision block (diamond) to branch.`,
      cProcIo: n => `${n} is input/output, use a parallelogram.`, cProcCall: n => `${n} is a function call, use the Function call block (rectangle with 2 side bars).`,
      cSubParen: n => `Function call ${n} should include the name and parentheses, like res = factorial(n).`, cProcIf: n => `${n} is a condition, use a diamond.`,
      cIoWord: n => `Input/Output block ${n} should start with "Input" or "Output".`, cSelf: 'An arrow connects a block to itself.',
      cUnreach: n => `Block ${n} cannot be reached from Start.`, cNoEndPath: n => `From block ${n} you cannot reach End (maybe an endless loop).`,
      cOk: 'The flowchart follows the rules. Well done!', cOkToast: 'The flowchart follows the rules!', cSum: (b, w) => `${b} errors, ${w} warnings. See the panel on the right.`
    }
  };

  function T(key, ...a) {
    const v = D[lang][key] ?? D.vi[key];
    return typeof v === 'function' ? v(...a) : v;
  }
  function apply() {
    document.documentElement.lang = lang;
    document.title = T('title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', T('desc'));
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', T(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = T(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = T(el.dataset.i18nAlt); });
  }
  function set(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { }
    apply();
  }
  return { T, apply, set, get lang() { return lang; } };
})();
window.T = window.I18N.T;
