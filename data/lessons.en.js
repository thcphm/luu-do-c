/* English text for the lessons. Charts and code come from lessons.js; block text is translated automatically. */
window.SHAPES_EN = {
  term: { name: 'Start / End', look: 'Pill shape (rounded ends)', c: 'int main() {   ...   return 0; }', tip: 'Every flowchart has exactly 1 Start block and at least 1 End block.' },
  io: { name: 'Input / Output', look: 'Parallelogram (slanted)', c: 'scanf(...);   printf(...);', tip: 'Keep it short: "Input a, b" or "Output sum". No need to write %d.' },
  proc: { name: 'Process', look: 'Rectangle', c: 'sum = a + b;   i++;', tip: 'One assignment or calculation. A few short statements in a row can share one block.' },
  dec: { name: 'Decision', look: 'Diamond', c: 'if, else if, while, for, do-while', tip: 'Write the condition as in C: a > b, i <= n. Always 2 arrows out: True and False.' },
  sub: { name: 'Function call', look: 'Rectangle with 2 vertical side bars', c: 'kq = giaiThua(n);   inSao(n);', tip: 'A function gets its own flowchart: it opens with "Start funcName(params)" and ends with "Return ..." (returns a value) or "End function" (void).' }
};

window.LESSONS_EN = {
  'khoi-hinh': {
    title: 'The basic shapes',
    body: ['A flowchart is a drawing that shows the order a program runs in.',
      'You only need 4 main shapes and the arrow. When the problem has functions, add the Function call block. Each shape matches a kind of C statement.']
  },
  'tuan-tu': {
    title: 'Sequence: sum of 2 numbers',
    body: ['The program runs top to bottom, one block per statement.', 'Hover (or tap) a line of code to see its block.'],
    tips: ['The declaration `int a, b, tong;` is usually not drawn.'],
    practice: 'Draw a flowchart for the area of a rectangle: input length and width, output the area.'
  },
  'if-else': {
    title: 'if - else: even or odd',
    body: ['`if` becomes a diamond. One branch is True, one is False.', 'The two branches go their own way, then meet again before moving on.'],
    tips: ['An `if` without `else`: the False branch goes straight to the next block.'],
    practice: 'Draw a flowchart that checks whether a number is negative or not.'
  },
  'else-if': {
    title: 'else if: comparing 2 numbers',
    body: ['Each `else if` adds another diamond on the False branch of the one before.', 'The final `else` is the False branch of the last diamond.'],
    practice: 'Draw a flowchart for grading: 8 and up "Good", 5 and up "Pass", otherwise "Fail".'
  },
  'while': {
    title: 'while: sum from 1 to n',
    body: ['A loop = a diamond + an arrow going back up.', 'The True branch runs the loop body, then goes back to check again. The False branch leaves the loop.'],
    tips: ['Forgetting the arrow back up is the most common mistake when drawing loops.'],
    practice: 'Draw a flowchart for n factorial: 1 × 2 × ... × n.'
  },
  'for': {
    title: 'for: print the numbers from 1 to n',
    body: ['`for (i = 1; i <= n; i++)` has 3 parts, split into 3 blocks:',
      'start `i = 1` (rectangle), condition `i <= n` (diamond), step `i++` (rectangle, at the end of the loop body).'],
    tips: ['`for` and `while` have the same flowchart. Only the code is written differently.'],
    practice: 'Draw a flowchart that prints the even numbers from 2 to n.'
  },
  'do-while': {
    title: 'do - while: ask until the input is valid',
    body: ['`do-while` runs the body first and checks afterwards. The body runs at least once.',
      'So the diamond sits BELOW the loop body, and the True branch goes back up.'],
    practice: 'Draw a flowchart that keeps asking for a score until it is between 0 and 10.'
  },
  'switch': {
    title: 'switch - case: choose by value',
    body: ['A flowchart has no special shape for `switch`. Each `case` becomes a diamond asking "variable == value?".',
      'The diamonds stack in a column: True goes right to do that case, then `break` (jump to the end). False goes down to the next case. `default` is the last False branch.'],
    tips: ['Without `break` the program falls through to the next case. A standard flowchart treats every case as having `break`.',
      'Several cases doing the same thing (case 1: case 3: ...) share one diamond: "month == 1, 3, 5...".'],
    practice: 'Draw a flowchart that reads a month number and prints how many days it has (use switch).'
  },
  'mang': {
    title: 'Arrays: read an array and add it up',
    body: ['An array is a row of values with one name: `a[0], a[1], ..., a[n-1]`. Indexes start at 0.',
      'Working with an array always needs a loop: reading the array is one loop, adding it up is another.'],
    tips: ['In the flowchart write an element as `a[i]`. The declaration `a[100]` is not drawn.',
      'Largest value: set `max = a[0]`, loop `i` from 1, and when `a[i] > max` set `max = a[i]`.'],
    practice: 'Draw a flowchart that reads an array of n integers and counts the even numbers.'
  },
  'ham-tra-ve': {
    title: 'Functions that return a value: factorial',
    body: ['Each function has its own flowchart. It starts with "Start funcName(params)" and ends with "Return value".',
      'In the main flowchart, the call is drawn with the Function call block: a rectangle with 2 vertical side bars.'],
    tips: ['The two flowcharts are not joined by arrows. The Function call block is where the program "jumps" into the function and comes back.',
      'The value after "Return" goes into the variable on the left of = in the Function call block (here kq).'],
    practice: 'Draw a flowchart for a function `tong(a, b)` that adds 2 numbers, and the main flowchart that calls it.'
  },
  'ham-void': {
    title: 'Functions that return nothing (void)',
    body: ['A `void` function does its job and gives nothing back. Its flowchart ends with "End function".',
      'The Function call block in main only has the function name, no "kq =".'],
    tips: ['Returns a value: ends with "Return x". Void: ends with "End function".'],
    practice: 'Draw a flowchart for a void function `inBangCuuChuong(n)` (print the times table of n) and the main that calls it.'
  },
  'struct': {
    title: 'struct: student information',
    body: ['`struct` groups several pieces of information about one thing into one variable, for example a student with a name and a score.',
      'There is no special shape for struct. Just write fields with a dot: `sv.ten`, `sv.diem`. The struct declaration is not drawn.'],
    tips: ['An array of structs: loop as with a normal array, writing `ds[i].ten`, `ds[i].diem`.'],
    practice: 'Draw a flowchart that reads a list of n students and prints the one with the highest score.'
  },
  'meo': {
    title: 'Drawing steps and common mistakes',
    body: ['Follow these 4 steps for every problem:'],
    steps: [
      'Read the problem: find what is given (input) and what is asked (output). The Analyze tab can help.',
      'Find where a choice is made (if... then...) → diamond. Find what repeats (from 1 to n, until...) → loop.',
      'Draw top to bottom: Start → Input → Process → Output → End.',
      'Press "Check" on the drawing board to see whether the flowchart follows the rules.'
    ],
    tips: [
      'Using a rectangle for `printf`/`scanf` is wrong. Input/Output must be a parallelogram.',
      'A diamond missing its False branch, or arrows without True/False labels.',
      'A loop without the arrow back to its diamond.',
      'A rectangle with 2 outgoing arrows. Branching needs a diamond.',
      'A block that is not connected, or cannot reach End.'
    ]
  }
};
