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

**The `x = x++` trap - post-increment assigned back to itself:**
```java
int pig = 4;
pig = pig++;
System.out.println(pig); // 4, not 5
```
This looks like it should increment pig, but it's a no-op. Here is exactly what happens:

Step 1: `pig++` runs. It returns the current value (4) to hand to the surrounding expression,
then increments pig to 5 as a side effect.

Step 2: The assignment `pig = 4` runs, using the value that `pig++` returned. This overwrites
pig with 4, wiping out the 5 that the side effect just wrote.

The increment happened, but the assignment immediately stomped on it. The returned value
always wins over the side effect when you assign post-increment back to the same variable.
This is always a no-op: `x = x++` leaves x unchanged.

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

**More examples of the same rules (different numbers, same mistakes):**
```java
// Missing closing parenthesis
double result = ((8.0 / 2) + 3;         // DOES NOT COMPILE - opened two, closed one

// Right parenthesis with no matching left
int x = 5 + 3) * 2;                     // DOES NOT COMPILE - ) appears before any (

// Equal number of parens but not properly nested - closes one that was never opened at that level
int y = (4 + 2) * 6) / (1 + 1;         // DOES NOT COMPILE - extra ) after 6, missing ) at end

// Brackets used for grouping instead of parentheses
int z = [10 - 3] * 2;                   // DOES NOT COMPILE - [] not valid for grouping
```

##### The one-liner rule
The deeper inside the parentheses you are, the sooner you get evaluated - innermost first,
outward last.
```java
int a = 2 * (3 + (4 - 1));
// innermost: (4 - 1) = 3
// next:      (3 + 3) = 6
// last:       2 * 6  = 12
```
```java
int b = (2 + 3) * (10 - (1 + 1));
// innermost: (1 + 1) = 2
// then:      (2 + 3) = 5,  (10 - 2) = 8
// last:       5 * 8  = 40
```


### Complement and Negation Operators

##### Negation operator (`-`)
Reverses the sign of a numeric expression. Straightforward - just flips positive to negative
and vice versa.
```java
int x = 5;
int y = -x;   // y = -5
```

##### Logical complement operator (`!`)
Flips a `boolean` value: `true` becomes `false`, `false` becomes `true`.
```java
boolean isAnimalAsleep = false;
System.out.print(isAnimalAsleep);    // false
isAnimalAsleep = !isAnimalAsleep;
System.out.print(isAnimalAsleep);    // true
```

##### Bitwise complement operator (`~`)
Flips all the bits (0s and 1s) in an integer. Only works on integer numeric types: `byte`,
`short`, `char`, `int`, `long`. Cannot be applied to `boolean` or floating-point types.

The formula is simple: `~x = -(x + 1)`.
```java
int value = 3;    // in binary (last 4 bits): 0011
int result = ~value;
System.out.print(result);   // -4
```
Bit-by-bit: `0011` flips to `1101`, which represents `-4` in two's complement. Same as
`-(3 + 1) = -4`.

### Numeric Promotion

When Java applies a binary operator to two numeric values of different types, it promotes
one or both operands before doing the operation. Four rules govern this.

##### The 4 rules
1. If two values have different data types, Java promotes the smaller one to the larger type.
2. If one value is integral and the other is floating-point, Java promotes the integral value
   to the floating-point type.
3. `byte`, `short`, and `char` are always promoted to `int` when used with a binary
   arithmetic operator - even if both operands are the same small type. Exception: unary
   operators like `++` do NOT trigger this promotion.
4. After all promotion, the result has the same type as the promoted operands.

Rules 3 and 4 are the exam traps. Rule 3 means two `short` values multiplied together
produce an `int`, not a `short`.

##### Worked examples

What is the type of `x * y`?
```java
int x = 1;
long y = 33;
var z = x * y;   // z is long - rule 1: int promoted to long
```

What is the type of `x + y`?
```java
double x = 39.21;
float y = 2.1;   // DOES NOT COMPILE - 2.1 is a double literal, not float; needs 2.1f
```

What is the type of `x * y`?
```java
short x = 10;
short y = 3;
var z = x * y;   // z is int - rule 3: both shorts promoted to int before multiplication
```

What is the type of `w * x / y`?
```java
short w = 14;
float x = 13;
double y = 30;
var z = w * x / y;
// w (short) -> int (rule 3), then -> float to match x (rule 1)
// w * x is float; float -> double to match y (rule 1)
// z is double
```

### Assigning Values and Casting

##### Widening vs narrowing
Java automatically promotes smaller types to larger ones (widening) - no cast needed.
Going the other way (narrowing) requires an explicit cast or the compiler errors.

```java
int x = 5;
long y = x;      // fine - widening, automatic
int z = y;       // DOES NOT COMPILE - narrowing requires cast
int z = (int) y; // fine
```

##### Cast syntax
Place the target type in parentheses to the left of the value.
```java
int fur = (int) 5;
short tail = (short)(4 + 10);   // cast wraps the whole expression
long feathers = 10(long);       // DOES NOT COMPILE - type must be on the left
```

Note: since cast is a unary operation, `(short) 4 + 10` only casts the `4`, not `4 + 10`.
Wrap the expression in parentheses when you want the cast to cover the whole thing.

##### Does-not-compile examples and why
```java
float egg = 2.0 / 9;     // DOES NOT COMPILE - 2.0/9 is double, can't assign to float without cast
int tadpole = (int)5 * 2L; // DOES NOT COMPILE - (int)5 is int, then int * long = long, can't assign to int
short frog = 3 - 2.0;    // DOES NOT COMPILE - 3 - 2.0 is double, can't narrow to short without cast
```

### Reviewing Primitive Assignments

Common exam patterns that don't compile:
```java
int fish = 1.0;                        // DOES NOT COMPILE - 1.0 is a double literal
short bird = 1921222;                  // DOES NOT COMPILE - value exceeds short's range
int mammal = 9f;                       // DOES NOT COMPILE - 9f is a float literal
long reptile = 192_301_398_193_810_323; // DOES NOT COMPILE - literal treated as int, out of int range
```

Fixes:
```java
int fish = (int) 1.0;                  // 1
short bird = (short) 1921222;          // compiles but overflows to 20678
int mammal = (int) 9f;                 // 9
long reptile = 192_301_398_193_810_323L; // L suffix tells compiler to treat it as long
```

Note: `(long)192_301_398_193_810_323` still does NOT compile - the compiler reads the
literal as `int` first and it's already out of range before the cast is even considered.
The fix is the `L` suffix, not a cast.

### Overflow and Underflow

**Overflow**: a value is too large for the data type - it wraps around to the lowest negative
value and counts up.
**Underflow**: a value is too small (too negative) for the data type - it wraps around to the
highest positive value.

##### Why it wraps - the clock analogy
Every integer type has a fixed number of bits and therefore a fixed range. Think of the range
as a circular clock. Go one step past the maximum and you land on the minimum. Go one step
below the minimum and you land on the maximum.

```
byte range: -128 to 127 (256 total values, 8 bits)

... 125 → 126 → 127 → -128 → -127 → -126 ...
                    ↑
               wraps here (overflow)

... -126 → -127 → -128 → 127 → 126 → 125 ...
                       ↑
                  wraps here (underflow)
```

Key ranges to know for the exam:
- `byte`:  -128 to 127
- `int`:   -2,147,483,648 to 2,147,483,647 (Integer.MAX_VALUE)

##### Examples
```java
// overflow - going one past byte MAX (127)
byte a = (byte)(Byte.MAX_VALUE + 1);   // (byte)(127 + 1) = (byte)128 → -128

// overflow - going one past int MAX
System.out.print(2147483647 + 1);      // -2147483648 (wraps to Integer.MIN_VALUE)

// underflow - going one below byte MIN (-128)
byte b = (byte)(Byte.MIN_VALUE - 1);   // (byte)(-128 - 1) = (byte)-129 → 127

// overflow via cast - value too large for the target type
short bird = (short)1921222;           // compiles, but stores 20678 due to overflow
```

Overflow and underflow are silent at runtime - no exception is thrown, the value just wraps.
The compiler will not warn you. Casting silences the compiler but doesn't fix the data loss.

### Casting Values vs Variables

The compiler applies different rules depending on whether you're working with a **literal
value** or a **variable**.

##### Literals - compiler can verify at compile time
```java
byte hat = 1;          // fine - 1 fits in byte
byte gloves = 7 * 10;  // fine - compiler evaluates 70, knows it fits in byte
short scarf = 5;       // fine
short boots = 2 + 1;   // fine - compiler evaluates 3
```

##### Variables - compiler cannot assume the value fits
```java
byte hat = 1;
short boots = 2 + hat;   // DOES NOT COMPILE - hat is a variable; both promoted to int, result is int
byte gloves = 7 * 100;   // DOES NOT COMPILE - 700 overflows byte (max 127)
```

The rule: when a **variable** is involved in an arithmetic expression, promotion kicks in
and the compiler won't silently narrow the result. You need an explicit cast.
```java
short boots = (short)(2 + hat);  // fine
```

### Compound Assignment Operators

`+=`, `-=`, `*=`, `/=`, `%=` etc. are shorthand for apply-and-assign. The key exam detail:
they include an **implicit cast back to the left-hand variable's type**, which plain
assignment does not.

```java
long goat = 10;
int sheep = 5;
sheep = sheep * goat;  // DOES NOT COMPILE - long result can't assign to int
sheep *= goat;         // fine - compound operator implicitly casts result back to int
```

Equivalent to `sheep = (int)(sheep * goat)` - the cast is hidden but real.

Also, the left side must already be a declared variable:
```java
camel *= 3;  // DOES NOT COMPILE if camel hasn't been declared yet
```

### Return Value of Assignment Operators

An assignment expression doesn't just store a value - it **returns** the value that was
assigned. This means assignment can be used as an expression inside a larger statement.

```java
long wolf = 5;
long coyote = (wolf = 3);
System.out.println(wolf);    // 3
System.out.println(coyote);  // 3 - coyote received the return value of the assignment
```

##### The exam trap - assignment inside a condition
```java
boolean healthy = false;
if (healthy = true)
    System.out.print("Good!");   // prints "Good!"
```

This looks like it's testing whether `healthy` is `true`, but it's actually **assigning**
`true` to `healthy`. The assignment returns `true`, so the `if` block always runs. This is
a classic exam trick - watch for `=` vs `==` inside conditions.

### Equality Operators

`==` and `!=` compare two operands and return a `boolean`.

| Context | `==` means |
| --- | --- |
| Primitives | same value |
| Objects | same reference (same object in memory) |

##### You cannot mix incompatible types
```java
boolean monkey = true == 3;       // DOES NOT COMPILE - boolean vs int
boolean ape = false != "Grape";   // DOES NOT COMPILE - boolean vs String
boolean gorilla = 10.2 == "Koko"; // DOES NOT COMPILE - numeric vs String
```

##### Object equality vs value equality
```java
var monday = new File("schedule.txt");
var tuesday = new File("schedule.txt");
var wednesday = tuesday;

System.out.println(monday == tuesday);    // false - different objects in memory
System.out.println(tuesday == wednesday); // true  - same reference
```
Two variables pointing to objects with identical content are NOT `==` unless they literally
point to the same object. Deep/value equality is covered later with `.equals()`.

`null == null` is `true` in Java.

### Relational Operators

Compare two expressions and return a `boolean`.

| Operator | Meaning |
| --- | --- |
| `<` | strictly less than |
| `<=` | less than or equal to |
| `>` | strictly greater than |
| `>=` | greater than or equal to |
| `instanceof` | left reference is an instance of the right type |

If the two numeric operands are different types, the smaller is promoted first (numeric
promotion rules apply).

```java
int gibbonFeet = 2, wolfFeet = 4, ostrichFeet = 2;
System.out.println(gibbonFeet < wolfFeet);    // true
System.out.println(gibbonFeet <= wolfFeet);   // true
System.out.println(gibbonFeet >= ostrichFeet); // true
System.out.println(gibbonFeet > ostrichFeet);  // false - same value, not strictly greater
```

##### instanceof
Returns `true` if the reference on the left is an instance of the type on the right (class,
interface, record, enum, or annotation). Returns `false` if the reference is `null`.
```java
String name = "Fluffy";
System.out.println(name instanceof String);  // true
System.out.println(null instanceof String);  // false
```

### instanceof Operator

Used to check whether an object reference is an instance of a particular type at runtime.
Returns a `boolean`. Most useful when working with polymorphism - when a variable's declared
type is broad (e.g. `Number`, `Object`) but the actual object at runtime could be something
more specific.

```java
Integer zooTime = Integer.valueOf(9);
Number num = zooTime;
Object obj = zooTime;

System.out.println(zooTime instanceof Integer); // true
System.out.println(num instanceof Integer);     // true
System.out.println(obj instanceof Integer);     // true
```
All three print `true` because of the inheritance chain: `Integer` extends `Number`, which
extends `Object`. A reference variable can point to any object that is a subtype of its
declared type, so both `Number num = zooTime` and `Object obj = zooTime` are valid.

Only one object exists in memory - all three variables point to the same one. The declared
type of the reference (e.g. `Number`, `Object`) only affects what methods the compiler lets
you call through it; it does not change what the object actually is underneath. `instanceof`
looks at the actual object, not the declared type of the reference holding it. Think of the
declared type as a lens that restricts what you can see - the object itself doesn't change.

The inheritance chain only works upward - an `Integer` IS-A `Number` and IS-A `Object`,
but the reverse is not true:
```java
// actual object is a plain Object - not an Integer
Object plain = new Object();
System.out.println(plain instanceof Integer); // false - Object is not an Integer

// actual object is a Double - also not an Integer
Number d = Double.valueOf(3.14);
System.out.println(d instanceof Integer);     // false - Double is not an Integer

// actual object is an Integer - it IS a Number and IS an Object (going up the chain)
Integer i = Integer.valueOf(9);
System.out.println(i instanceof Integer); // true
System.out.println(i instanceof Number);  // true  - Integer extends Number
System.out.println(i instanceof Object);  // true  - everything extends Object
```

##### Practical use - check before casting
```java
public void openZoo(Number time) {
    if (time instanceof Integer)
        System.out.print((Integer)time + " O'clock");
    else
        System.out.print(time);
}
```
Best practice: always use `instanceof` before casting to a narrower type.

##### Invalid instanceof - compiler catches impossible checks
If the compiler can determine that a type can never possibly hold the right-hand type, it
won't compile.
```java
public void openZoo(Number time) {
    if (time instanceof String)  // DOES NOT COMPILE - Number can never be a String
        System.out.print(time);
}
```

##### null and instanceof
Calling `instanceof` on `null` always returns `false`, regardless of the right-hand type.
```java
System.out.println(null instanceof Object); // false
Object noObjectHere = null;
System.out.println(noObjectHere instanceof String); // false
```
The one exception: `null` cannot be used on the **right side** of `instanceof`.
```java
System.out.println(null instanceof null); // DOES NOT COMPILE
```

### Logical Operators

`&`, `|`, and `^` can be applied to both `boolean` and integer numeric types.
- On `boolean` values: logical AND / inclusive OR / exclusive OR.
- On numeric values: bitwise operators (not tested on the exam - ignore for now).

**Always evaluate both sides** - no short-circuiting.

##### Truth table memory aids
- AND (`&`): only `true` if **both** sides are `true`
- Inclusive OR (`|`): only `false` if **both** sides are `false`
- Exclusive OR (`^`): only `true` if the sides are **different**

```java
boolean eyesClosed = true;
boolean breathingSlowly = true;

boolean resting = eyesClosed | breathingSlowly;   // true  (inclusive OR)
boolean asleep  = eyesClosed & breathingSlowly;   // true  (AND)
boolean awake   = eyesClosed ^ breathingSlowly;   // false (XOR - both same, so false)
```

##### No short-circuit - both sides always run
```java
int x = 0;
boolean result = (x > 0) & (++x > 0);  // ++x runs even though left side is false
System.out.println(x);  // 1 - the right side was still evaluated
```
Contrast this with `&&`, where the right side would be skipped entirely.

### Conditional Operators

`&&` and `||` are the short-circuit versions of `&` and `|`. They behave identically except
the right side is **skipped** if the result is already determined by the left side.

- `&&`: if the left side is `false`, the whole expression is `false` - right side skipped.
- `||`: if the left side is `true`, the whole expression is `true` - right side skipped.

```java
int hour = 10;
boolean zooOpen = true || (hour < 4);
System.out.println(zooOpen); // true - right side never evaluated
```

##### Avoiding NullPointerException
The most common real-world use of `&&`. Using `&` here could throw at runtime:
```java
if (duck != null & duck.getAge() < 5) { }  // could throw NullPointerException if duck is null
```
With `&&`, the right side is never reached if duck is `null`:
```java
if (duck != null && duck.getAge() < 5) { }  // safe
```

##### Unperformed side effects - exam trap
Because the right side may be skipped, any variable modifications in it may never happen.
```java
int rabbit = 6;
boolean bunny = (rabbit >= 6) || (++rabbit <= 7);
System.out.println(rabbit); // 6 - ++rabbit was never reached, left side was already true
```
Contrast with the left side being false:
```java
int rabbit = 6;
boolean bunny = (rabbit >= 10) || (++rabbit <= 7);
System.out.println(rabbit); // 7 - left side false, so right side ran
```
On the exam, watch for any `++`/`--` or method call hiding inside a `&&`/`||` expression -
it may or may not execute depending on the left side.

### Ternary Operator

The only operator that takes three operands. Condensed form of an `if/else` that returns
a value.

```
booleanExpression ? expression1 : expression2
```
If the boolean is `true`, the result is `expression1`; if `false`, the result is
`expression2`.

```java
int owl = 5;
int food = owl < 2 ? 3 : 4;
System.out.println(food); // 4
```
Equivalent to:
```java
int food;
if (owl < 2) food = 3;
else food = 4;
```

##### Mismatched types
The two result expressions don't need to be the same type - but the context they're used in
matters.
```java
int stripes = 7;
System.out.print((stripes > 5) ? 21 : "Zebra");       // fine - print accepts Object
int animal = (stripes < 9) ? 3 : "Horse";             // DOES NOT COMPILE - can't assign String to int
```

##### Nested ternary
Legal but hard to read. Both forms below are equivalent - prefer the parenthesised version:
```java
int food1 = owl < 4 ? owl > 2 ? 3 : 4 : 5;
int food2 = (owl < 4 ? ((owl > 2) ? 3 : 4) : 5);  // same result, far more readable
```

##### Unperformed side effects
Like `&&`/`||`, only one of the two result expressions is evaluated at runtime. Any side
effect in the branch not taken does not happen.
```java
int sheep = 1, zzz = 1;
int sleep = zzz < 10 ? sheep++ : zzz++;
System.out.print(sheep + "," + zzz); // 2,1 - left was true, so sheep++ ran, zzz++ did not
```
```java
int sheep = 1, zzz = 1;
int sleep = sheep >= 10 ? sheep++ : zzz++;
System.out.print(sheep + "," + zzz); // 1,2 - left was false, so zzz++ ran, sheep++ did not
```
On the exam, whenever you see a `++`/`--` inside a ternary, check which branch actually
executes before deciding what the variable's final value is.