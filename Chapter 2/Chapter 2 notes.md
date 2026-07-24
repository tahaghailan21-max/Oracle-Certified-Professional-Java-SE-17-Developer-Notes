### Understanding Java Operators

##### Definition
A Java **operator** is a special symbol applied to a set of variables, values, or literals -
called **operands** - that returns a **result**.
```java
var c = a + b;
```
- `a` and `b` are the **operands**.
- `+` is the **operator**.
- The output is the **result**, which here gets stored into `c` via a *second* operation: the
  assignment operator (`=`).

##### Types of Operators
Java has three flavors, named by how many operands they act on:
- **Unary** - 1 operand (e.g. `-x`, `x++`)
- **Binary** - 2 operands (e.g. `a + b`)
- **Ternary** - 3 operands (e.g. `a ? b : c`)

##### Java does NOT just evaluate left-to-right through an expression
This is the key warning before precedence is introduced. Which operator you use decides the
order things happen in - not the order they're written in the line.
```java
int stock = 10;
double cost = 2 + 3 * --stock;
System.out.print("Updated cost: " + cost);
```
Trace:
1. `--stock` runs first: `stock` goes `10 → 9`, and the *value used* in the expression is `9`.
2. `3 * 9 = 27`.
3. `2 + 27 = 29`.
4. `29` is automatically promoted to `29.0` because `cost` is a `double`.

Output: `Updated cost: 29.0` (final `stock` is `9`, final `cost` is `29.0`).

### Operator Precedence

##### The idea
Just like in math, some operators are evaluated before others regardless of where they sit in
the expression - this is **operator precedence**.
```java
var invoiceTotal = 3 * unitCost + 2 * shippingFee;
```
is really evaluated as:
```java
var invoiceTotal = ((3 * unitCost) + (2 * shippingFee));
```
`*` has higher precedence than `+`, so both multiplications happen before the addition. `=` has
the *lowest* precedence of all, so the assignment to `invoiceTotal` happens last.

##### Table - Order of operator precedence
| Operator                        | Symbols and examples                                                       | Evaluation    |
| ------------------------------- | -------------------------------------------------------------------------- | ------------- |
| Post-unary operators            | `expression++`, `expression--`                                             | Left-to-right |
| Pre-unary operators             | `++expression`, `--expression`                                             | Left-to-right |
| Other unary operators           | `-`, `!`, `~`, `+`, `(type)`                                               | Right-to-left |
| Cast                            | `(Type)reference`                                                          | Right-to-left |
| Multiplication/division/modulus | `*`, `/`, `%`                                                              | Left-to-right |
| Addition/subtraction            | `+`, `-`                                                                   | Left-to-right |
| Shift operators                 | `<<`, `>>`, `>>>`                                                          | Left-to-right |
| Relational operators            | `<`, `>`, `<=`, `>=`, `instanceof`                                         | Left-to-right |
| Equal to/not equal to           | `==`, `!=`                                                                 | Left-to-right |
| Logical AND                     | `&`                                                                        | Left-to-right |
| Logical exclusive OR            | `^`                                                                        | Left-to-right |
| Logical inclusive OR            | `\|`                                                                       | Left-to-right |
| Conditional AND                 | `&&`                                                                       | Left-to-right |
| Conditional OR                  | `\|\|`                                                                     | Left-to-right |
| Ternary operators               | `boolean expression ? expression1 : expression2`                           | Right-to-left |
| Assignment operators            | `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `^=`, `\|=`, `<<=`, `>>=`, `>>>=` | Right-to-left |
| Arrow operator                  | `->`                                                                       | Right-to-left |

Rows are ordered by **decreasing precedence** (top = evaluated first). If two operators in the
*same* expression share a row (same precedence level), the **Evaluation** column decides which
one Java groups first.

##### What "left-to-right" / "right-to-left" actually means (the confusing part)
**It is not about the order the whole expression is evaluated in overall.** That part is decided
by **row position**: a row near the top has higher precedence, so that operator gets applied
first no matter where it's physically written.

**The Evaluation column only comes into play when two operators from the *same row* appear next
to each other in one expression.** It tells you which side Java starts grouping from. Across
*different* rows there is never a direction question at all - the higher row simply always goes
first. That's the general rule; the rest of this section walks through every row of the
precedence table above to make it concrete, one operator at a time, always pointing out *why*
we start where we start.

### Walking Through Every Operator in the table

##### Post-unary operators - `x++`, `x--`
Uses the variable's **current** value in the surrounding expression first, *then* increments/
decrements the variable as a side effect.
```java
int x = 5;
int y = x++;   // y = 5, x becomes 6
```
**Precedence in context:**
```java
int x = 5;
int result = 10 + x++ * 2;
```
- We start at `x++` because **post-unary operators are the top row of the whole table** -  stronger than `*`, stronger than `+`, stronger than everything else in this line, even though it's sitting in the middle of the expression. It yields the current value `5` (and `x` becomes`6` as a side effect) → `10 + 5 * 2`.
- Next: `*` is the next-highest row present → `5 * 2 = 10` → `10 + 10`.
- Finally `+` → `20`. Result: `result = 20`, `x = 6`.

##### Pre-unary operators - `++x`, `--x`
Increments/decrements the variable **first**, and the **new** value is what the rest of the
expression uses.
```java
int x = 5;
int y = ++x;   // x becomes 6, y = 6
```
**Precedence in context:**
```java
int x = 5;
int result = 10 + ++x * 2;
```
- We start at `++x` for the same reason as before: pre-unary ties with post-unary for the top row, so it's stronger than the `*` and `+` that come later in the line. `x` becomes `6`, and`6` is the value used → `10 + 6 * 2`.
- `*` is next-highest present → `6 * 2 = 12` → `10 + 12`.
- `+` → `22`. Result: `result = 22`, `x = 6`.

##### Other unary operators & Cast - `-`, `!`, `~`, `(type)`
- Unary `-`/`+`: negate a number / no-op.
- `!`: flips a `boolean` (`!true` → `false`).
- `~`: bitwise complement (rare on the exam, know it exists).
- `(type)`: a **cast**, converts a value to another type - e.g. `(int) 3.9` truncates the decimal part, giving `3`.
```java
boolean opposite = !true;      // false
int truncated = (int) 3.9;     // 3
```
This row (plus Cast, right below it) sits **right-to-left**, and both rank just above
Multiplication - one level below pre/post-unary.

**Precedence in context (cast vs. multiplication):**
```java
double price = 19.99;
int total = (int) price * 2;
```
- We start at `(int) price` because **Cast outranks Multiplication/division/modulus** - the
  cast binds to `price` alone, truncating it to `19`, *before* the `* 2` gets a chance to run.
  → `19 * 2 = 38`.
- Contrast with `(int) (price * 2)`, where parentheses force the multiplication (`19.99 * 2 =
  39.98`) to happen first, then truncate → `39`. Same numbers, different answer, purely because of where the cast's scope starts.

**Precedence in context (stacked unary - why "right-to-left" matters here too):**
```java
int x = 5;
int result = - -x;   // double negation
```
- Two `-` signs tied on the same row → right-to-left means the one **closer to the operand**
  (the second `-`, right next to `x`) applies first: `-x = -5`. Then the outer `-` applies to *that* result: `-(-5) = 5`.

##### Multiplication/division/modulus - `*`, `/`, `%`
Integer division truncates; `%` gives the remainder.
```java
int a = 7 / 2;   // 3 (decimal part dropped, not rounded)
int b = 7 % 2;   // 1
```
**Precedence in context:**
```java
int result = 2 + 3 * 4;
```
- We start at `*` because **Multiplication/division/modulus outranks Addition/subtraction** -
  `3 * 4 = 12` happens first, regardless of `+` appearing to its left in the line. → `2 + 12 =
  14`.

##### Addition/subtraction - `+`, `-`
Same row as each other (tie → left-to-right, already shown in the `10 - 4 - 3` example
earlier). The exam trap here: `+` on a `String` means **concatenation**, not addition.
```java
String s1 = "Result: " + 1 + 2;     // "Result: 12"
String s2 = "Result: " + (1 + 2);   // "Result: 3"
```
- In `s1`, `+` is left-to-right and there are two of them tied on this row: `"Result: " + 1`
  resolves first (string concatenation, since the left side is already a `String`), giving
  `"Result: 1"`; then `+ 2` concatenates again → `"Result: 12"`.
- In `s2`, the parentheses force `1 + 2` (plain numeric addition, `= 3`) to be treated as a
  single unit *before* the concatenation touches it, so you get `"Result: 3"` instead.

##### Shift operators - `<<`, `>>`, `>>>`
The book flags these as "know they exist, but you won't be tested on using them." `<<` shifts bits left (roughly: multiply by powers of 2); `>>` shifts right preserving the sign; `>>>`shifts right filling with zeros regardless of sign.
```java
int a = 8 << 1;    // 16
int b = -8 >> 1;   // -4
```
**Precedence in context (a lower row waiting on a higher one):**
```java
int result = 1 + 2 << 3;
```
- We start at `+`, **not** `<<`, even though `<<` is the next symbol you'd hit reading
  left-to-right - because **Addition/subtraction is a higher row than Shift operators**. `1 + 2
  = 3` first → `3 << 3 = 24`. The shift has to wait its turn.

##### Relational operators - `<`, `>`, `<=`, `>=`, `instanceof`
```java
boolean isAdult = age >= 18;
boolean isString = obj instanceof String;
```
**Precedence in context:**
```java
boolean result = 2 + 3 > 4;
```
- We start at `+` because **Addition/subtraction outranks Relational operators** - `2 + 3 = 5`
  resolves first → `5 > 4 = true`.

##### Equal to/not equal to - `==`, `!=`
```java
boolean eq = (5 == 5);    // true
boolean neq = (5 != 3);   // true
```
**Precedence in context:**
```java
boolean result = 5 > 3 == true;
```
- We start at `>` because **Relational operators outrank Equal-to/not-equal-to** (Relational
  sits one row above Equality in the table). `5 > 3 = true` resolves first → `true == true =
  true`.
##### Logical AND / XOR / OR - `&`, `^`, `|`
Applied to booleans, these behave like AND/XOR/OR but **always evaluate both sides** - unlike`&&`/`||`, there's no short-circuiting.
```java
boolean result = (5 > 3) & (10 / 2 > 1);   // both sides always run
```
**Precedence in context:**
```java
boolean result = 5 == 5 & 3 != 3;
```
- We start at `==` and `!=` because **Equal-to/not-equal-to outranks Logical AND** - both equality checks resolve first: `5 == 5 → true`, `3 != 3 → false`. Only then does `&` combine them: `true & false = false`.
##### Conditional AND / OR - `&&`, `||`
Same idea as `&`/`|`, but **short-circuiting**: `&&` skips evaluating its right side if the left is already `false`; `||` skips its right side if the left is already `true`. This is what makes the classic null-check pattern safe:
```java
String s = null;
if (s != null && s.length() > 0) { ... }   // s.length() never runs when s is null
```
**Precedence in context:**
```java
boolean result = 5 > 3 && 2 == 2;
```
- We start at `>` and `==` because **both Relational and Equality outrank Conditional AND** -
  every comparison finishes (`true`, `true`) before `&&` combines them into `true`.

##### Ternary operators - `a ? b : c`
Covered in detail above (see the ternary walkthrough). One more precedence-in-context example,
now that `&&` has been introduced:
```java
boolean isEligible = true;
int age = 20;
String status = isEligible && age >= 18 ? "approved" : "denied";
```
- We start at `age >= 18` (Relational) then `&&` (Conditional AND) because **both outrank the ternary operator** - the entire condition must collapse to one `true`/`false` value before the`?:` even looks at it. `age >= 18 → true`, then `isEligible && true → true`, and only then does
  the ternary pick `"approved"`.

##### Assignment operators - `=`, `+=`, `-=`, `*=`, ...
Beyond simple `=`, the **compound** assignment operators (`+=`, `-=`, etc.) do something sneaky:
they perform an **implicit cast back to the variable's own type**.
```java
byte b = 10;
b += 5;        // compiles! equivalent to b = (byte) (b + 5)
// b = b + 5;  // would NOT compile - b + 5 is an int, and int doesn't narrow to byte automatically
```
**Precedence in context (chained assignment, right-to-left):**
```java
int a, b;
int x = 5, y = 2, z = 3;
a = b = x - y - z;
```
- We start at `-` because **Addition/subtraction outranks Assignment** - and since `-` appears
  twice (tied on its own row, left-to-right), `x - y` resolves first (`5 - 2 = 3`), then `3 - z`
  (`3 - 3 = 0`) → `a = b = 0`.
- Only `=` is left, appearing twice, tied on the **lowest** row of the table, right-to-left: the rightmost `=` runs first (`b = 0`), and that result feeds leftward (`a = 0`).

##### Arrow operator - `->`
Used in **lambda expressions**, which belong to a much later chapter (functional interfaces) - not something to dig into yet. For now, just know it exists and sits on the same bottom row as assignment, right-to-left:
```java
// preview only - lambdas are covered much later in the book
Runnable r = () -> System.out.println("hi");
```

##### One-line mental model
**Row = "who goes first" (precedence between different operators). Evaluation column = "when two operators from the same row are stacked together, which one do I group starting from" (associativity) - it only ever settles ties inside one row, never a competition between rows.**

### Adding Parentheses

The precedence table applies "unless overridden with parentheses." Wrapping part of an
expression in `()` forces that part to be evaluated first, overriding whatever the table's row
order would otherwise dictate.
```java
int total = 3 * 4 + 2 * 5 - 6;         // normal precedence: * before +/-  -> 12 + 10 - 6 = 16
int total = 3 * ((4 + 2) * 5 - 6);     // parentheses force 4+2 first      -> 3 * (6*5 - 6)
                                        //                                  -> 3 * (30 - 6)
                                        //                                  -> 3 * 24 = 72
```
Same values, same operators, same order in the line - **only the parentheses changed**, and the
result went from `16` to `72`. That's the whole point: parentheses let you explicitly pick what
gets evaluated first instead of relying on (or fighting against) the table.

**Syntax rule - parentheses must be balanced:** every `(` needs a matching `)`, and reading
left to right, a `)` must always close a `(` that came before it.
```java
long score = 1 + ((4 * 2) / 4;       // DOES NOT COMPILE - unbalanced (missing a closing paren)
int total2 = (6 + 1) + 4) / (3 * 2;  // DOES NOT COMPILE - mismatched, not properly nested
```
Also: **Java does not allow `[]` in place of `()`** for grouping expressions - brackets are only
for arrays.
```java
short value = 5 + [(3 * 2) + 1];  // DOES NOT COMPILE - brackets aren't valid here
```
