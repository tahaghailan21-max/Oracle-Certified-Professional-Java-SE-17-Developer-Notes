### Strings & Text Blocks

#### Text Blocks

##### Definition
A **text block** (also called a **multiline string**) is a `String` that starts and ends
with three double quotes (`"""`). Its contents **don't need to be escaped**, and it can
span multiple lines.

- The type is still `String` - nothing special. All the `String` methods (Chapter 4) work
  on a text block exactly like on a regular `String`.
- The opening `"""` **must be followed by a line break**. `String block = """doe""";`
  **DOES NOT COMPILE**.

```java
String textBlock = """
    "Java Study Guide"

        by Scott & Jeanne""";
```

##### Purpose
To write complicated multiline strings in a **readable** way, without cramming in escape
characters.

The same value written as a regular `String` needs escape characters (`\"` for a literal
`"`, `\n` for a new line):
```java
String eyeTest = "\"Java Study Guide\"\n                  by Scott & Jeanne";
```
This works but is hard to read. The text block above produces the same value and is much
easier to read - no escaping required.

##### Incidental vs. Essential Whitespace
The whitespace inside a text block is split into two kinds:

- **Essential whitespace** - part of your `String`; it *matters* to the value.
- **Incidental whitespace** - just there to make the *code* easier to read. You can
  reformat the code and change the amount of incidental whitespace **without any impact**
  on the `String` value.

**How to tell them apart (the mental model):**
Imagine a vertical line drawn at the **leftmost non-whitespace character** in the whole
text block.
- Everything **to the left** of the line = **incidental** whitespace (stripped away).
- Everything **to the right** of the line = **essential** whitespace (kept in the value).

> The closing `"""`, if on its own line, also counts as a "non-whitespace" position - so
> putting the closing `"""` further left pushes the line left and turns more of your
> indentation into essential whitespace.

**Where each comes from (its source):**
- *Incidental* whitespace comes from the **indentation you add to line up the code nicely**
  inside your source file.
- *Essential* whitespace comes from indentation/spaces that sit **to the right of the
  leftmost character** - i.e. deliberate spacing that is meant to be part of the value.

##### Why this matters (the point)
Incidental whitespace is **stripped at compile time**, so it is **never part of the
`String` at all** - not "removed when printed." `s.length()`, `s.charAt(...)`, and
comparisons all behave as if those spaces were never typed. Printing just makes it visible.

The point: it lets you **indent the text block to line up with your surrounding code
without that code-indentation leaking into the string value**. The text block lives inside
indented code:

```java
class Zoo {
    void printMenu() {
        String menu = """
            Lion
            Tiger
            """;
        System.out.print(menu);
    }
}
```

The `Lion`/`Tiger` lines are indented ~12 spaces only so the code reads nicely inside the
class and method. But the value you want is:
```
Lion
Tiger
```
not:
```
············Lion
············Tiger
```
Incidental-whitespace stripping is Java saying: *the indentation you added to keep your
source tidy is not part of your data - I'll remove the common margin for you.* So you get
**readable code AND a clean string value** at the same time. It is a convenience for
humans, not a runtime "where to start writing" thing.

**For the exam:** your job is to work out the **real `String` value** from the source:
both (1) how many leading spaces survive (the essential ones) and (2) how many lines / whether
there is a trailing `\n` (depends on where the closing `"""` sits).

**Example (the pyramid):**
```java
String pyramid = """
  *
 * *
* * *
""";
System.out.print(pyramid);
```
- Four lines of output (lines with the stars, plus the blank line before the closing `"""`).
- The closing `"""` is at the leftmost position, so the vertical line is drawn there.
- No incidental whitespace here. The first star line has **two** essential whitespace
  characters, the second has **one** - that whitespace fills in to match the line drawn by
  the closing `"""`.

##### Worked examples: where the whitespace comes from
> In the outputs below, a `·` marks a **leading space that is actually in the String**
> (essential). Real Java prints a normal space - the dot is just so you can *see* it here.

**The one rule that decides everything:**
Java looks at **every content line *and* the closing `"""` line**, finds the one with the
**least indentation** (fewest leading spaces), and draws the vertical line there.
- Left of the line → **incidental** → *removed from every line*.
- Right of the line → **essential** → *kept*.

So the **source of incidental whitespace** = the indentation that *all* lines share (the
common left margin, which usually only exists because your code is indented in the file).
The **source of essential whitespace** = any indentation a line has *beyond* that shared
minimum.

---

**Example A - closing `"""` on the far left → indentation is incidental (stripped):**
```java
String s = """
        apple
        banana
""";                 // <-- closing """ at column 0, the leftmost line
```
The closing line is the least-indented (0 spaces), so the cutoff is at column 0. Nothing
is to the *left* of column 0, so nothing gets stripped. The 8 spaces before
`apple`/`banana` are all to the *right* of the cutoff → **essential** → kept.
Output:
```
········apple
········banana
```
--> 8 leading spaces survive on each line. The indentation became **essential** only because
the closing `"""` sits further left than the text.

---

**Example B - same text, but move the closing `"""` under the text → indentation is incidental:**
```java
String s = """
        apple
        banana
        """;          // <-- closing """ now indented 8 spaces, same as the text
```
Now *every* line (both text lines and the closing line) has 8 leading spaces, so the least
indentation is 8. The cutoff is at column 8. Those 8 spaces are **left** of the cutoff →
**incidental** → stripped from every line.
Output:
```
apple
banana
```
--> No leading spaces. **Same text, only the closing `"""` moved** - that's the whole
difference between A and B. This is the "source" idea: incidental whitespace is the shared
margin, and you control it by where the least-indented line sits.

---

**Example C - one line indented *more* than the others → the extra is essential:**
```java
String s = """
        apple
            banana
        """;          // <-- least-indented lines have 8 spaces
```
Least indentation = 8 (the `apple` line and the closing `"""`). Cutoff at column 8.
- `apple`: 8 spaces − 8 = **0** essential.
- `banana`: 12 spaces − 8 = **4** essential (kept).
Output:
```
apple
····banana
```
--> The common 8 spaces are incidental (stripped); the *extra* 4 on `banana` are essential.

**Takeaway:** essential whitespace = "indentation this line has that the least-indented
line does *not*." Incidental whitespace = the common margin everyone shares. Move the
closing `"""` and you move the cutoff.

##### When does a text block create a new line?
Only **line breaks you type between content lines** become `\n` in the value. Two special
cases decide the leading and trailing newlines:

- **Rule 1 - the line break right after the opening `"""` is required and is NOT part of
  the string.** The content starts on the *next* line, so the opening delimiter never adds
  a newline at the front.
- **Rule 2 - there is a trailing newline only if the closing `"""` sits on its own line.**
  If the closing `"""` is on the same line as the last text, there is no trailing `\n`.

**Your exact question:**
```java
String pyramid = """
0""";
System.out.print(pyramid);
```
Value is `"0"` (length **1**). It prints just:
```
0
```
No newline before the `0` (Rule 1: the break after `"""` is discarded) and no newline after
it (Rule 2: the closing `"""` is on the same line as `0`). So it does **not** print a blank
line then `0` - it prints `0` on one line, nothing else. *(Verified with `javac`.)*

**Move the closing `"""` to its own line and you get a trailing newline:**
```java
String pyramid = """
0
""";
```
Value is `"0\n"` (length **2**): prints `0` and then moves to a new line. The only change
from the previous example is where the closing `"""` sits.

**A blank first line, on the other hand, IS content:**
```java
String s = """

0""";
```
Value is `"\n0"`. Rule 1 discards the *required* break after `"""`, but the blank line that
follows is a real content line, so its break becomes a `\n`. Prints a blank line, then `0`.

##### Table - formatting sequences (regular String vs. text block)
> Reminder: `·` marks a space that is really in the value (so you can see it).

| Sequence                         | In a regular `String`                                         | In a text block                                                      |
| -------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `\"`                             | `"`                                                           | `"` (you don't *need* to escape quotes in a text block, but you may) |
| `\"""`                           | invalid                                                       | `"""` (escape so it isn't read as the closing delimiter)             |
| `\"\"\"`                         | `"""`                                                         | `"""`                                                                |
| a space at the **end of a line** | stays a space                                                 | **ignored / stripped**                                               |
| `\s`                             | a space (preserves the space; stops trailing-space stripping) | a space (same)                                                       |
| `\` at the **end of a line**     | invalid                                                       | **omits the newline** on that line (joins to next)                   |

**Row by row, with an example for each side (`·` = a real space):**

*Row 1 - `\"` produces a literal `"`.*
- Regular String: you **must** escape quotes, or a bare `"` ends the string.
  ```java
  String r = "She said \"hi\"";   // value: She said "hi"
  ```
- Text block: quotes need **no** escaping (a lone `"` is safe), but `\"` still works:
  ```java
  String t = """
  She said "hi" and \"bye\"""";    // value: She said "hi" and "bye"
  ```

*Rows 2 and 3 - `\"""` and `\"\"\"` both produce `"""`.* Same problem: how to put three
literal quotes in a text block when `"""` means "end the block." You escape at least one.
- Regular String: `\"""` alone is **invalid**; `\"\"\"` is fine -> `"""`:
  ```java
  String r = "\"\"\"";             // value: """  (length 3)
  ```
- Text block: both `\"""` and `\"\"\"` give `"""`:
  ```java
  String t = """
  three: \"""
  """;                             // value: three: """
  ```

*Row 4 - a space at the end of a line.*
- Regular String: **kept**.
  ```java
  String r = "hi···";              // length 5, spaces stay
  ```
- Text block: **stripped** (trailing spaces on every line are deleted).
  ```java
  String t = """
  hi···
  """;                             // value: "hi\n", length 3
  ```

*Row 5 - `\s` is a space that survives stripping.*
- Regular String: just a space.
  ```java
  String r = "hi\s";               // value: "hi·", length 3
  ```
- Text block: the trailing space is **kept** (not treated as trailing whitespace).
  ```java
  String t = """
  hi\s
  """;                             // value: "hi·\n", length 4
  ```

*Row 6 - `\` at the end of a line omits that line's newline.*
- Regular String: **invalid** (you can't split a regular literal across source lines).
- Text block: the `\` **removes the newline**, joining to the next line:
  ```java
  String t = """
  line1 \
  line2
  """;                             // value: "line1 line2\n" - one line
  ```

**Mental summary:** rows 1-3 = how to get literal `"` characters (escaping); rows 4-5 =
trailing spaces (stripped by default, `\s` keeps one); row 6 = `\` joins lines.

**Two rows are the ones that actually change behavior - study these:**

> **What is a trailing space?** A space (or spaces) at the **end** of a line, after the last
> visible character and before the line break. The opposite is a **leading** space, at the
> **start** of a line (indentation). Both are real characters you just can't see:
> `"hi···"` has 3 trailing spaces and a length of 5, not 2.

**1. Trailing spaces are stripped.** Every line of a text block has its trailing whitespace
removed. So this:
```java
String s = """
    hello
    """;
```
gives `"hello\n"` even if you accidentally left spaces after `hello`. To *keep* a trailing
space, end the line with `\s` (which is a space that survives stripping):
```java
String s = """
    hello\s
    """;
```
gives `"hello·\n"` - one real trailing space.

**2. `\` at the end of a line removes that line's newline** (line continuation). From the
book (verified):
```java
String block = """
   doe \
   deer""";
```
is **one line**: `"doe deer"` (length 8). The `\` after `doe ` cancels the newline that the
line break would have created, so `doe ` and `deer` join.

**Contrast - literal `\n` plus real line breaks stack up:**
```java
String block = """
   doe \n
   deer
   """;
```
This is **four lines**. The value is `"doe \n\ndeer\n"`:
- `doe ` then a *literal* `\n` you typed, then
- the real line break after that line -> another `\n` (that is the blank line),
- `deer`, then
- the real line break before the closing `"""` on its own line -> trailing `\n`.

So printing it gives: `doe ` / (blank line) / `deer` / (newline). *(Verified: 4 lines.)*

### Primitive Types

##### Definition
Java has **eight built-in data types**, called the **primitive types**. They are the building
blocks for all Java objects. A primitive is **not** an object and does not represent one - it
is just a **single value in memory**, such as a number or a character.

##### Table - Primitive types
| Keyword | Type | Min value | Max value | Default value | Example |
|---|---|---|---|---|---|
| `boolean` | true or false | n/a | n/a | `false` | `true` |
| `byte` | 8-bit integral value | -128 | 127 | `0` | `123` |
| `short` | 16-bit integral value | -32,768 | 32,767 | `0` | `123` |
| `int` | 32-bit integral value | -2,147,483,648 | 2,147,483,647 | `0` | `123` |
| `long` | 64-bit integral value | -2^63 | 2^63 - 1 | `0L` | `123L` |
| `float` | 32-bit floating-point value | n/a | n/a | `0.0f` | `123.45f` |
| `double` | 64-bit floating-point value | n/a | n/a | `0.0` | `123.456` |
| `char` | 16-bit Unicode value | 0 | 65,535 | `\u0000` | `'a'` |

> **Note:** these default values only apply to **fields** (instance variables and `static`
> variables) and **array elements** - **not** to local variables. More on that below.

##### Writing Literals
A **literal** is a number written directly in the code. Two default-type rules matter:

- An **integer** literal (no decimal point) is assumed to be an **`int`** by default.
- A **decimal** literal is assumed to be a **`double`** by default.

Because an integer literal defaults to `int`, a value too big for `int` fails to compile even
if you assign it to a `long`:
```java
long max = 3123456789;    // DOES NOT COMPILE - the literal is an int, and it's out of int range
long max = 3123456789L;   // OK - the L makes it a long literal
```
- Add **`L`** (or `l`) to make an integer literal a `long`. Use **uppercase `L`** - lowercase
  `l` looks like the digit `1`.
- Add **`f`** (or `F`) to make a decimal literal a `float`; without it a decimal is a `double`.
  ```java
  float f = 1.0;    // DOES NOT COMPILE - 1.0 is a double, doesn't fit float without a cast/suffix
  float f = 1.0f;   // OK
  ```

**Number bases.** Java literals default to base 10 (decimal), but you can also write:

| Base | Digits allowed | Prefix | Example |
|---|---|---|---|
| Octal | 0-7 | `0` | `017` |
| Hexadecimal | 0-9, A-F / a-f (case-insensitive) | `0x` or `0X` | `0xFF`, `0xff`, `0XFf` |
| Binary | 0-1 | `0b` or `0B` | `0b10`, `0B10` |

> The exam won't ask you to *convert* between bases - only to **recognize valid literals**.

**Underscores in literals** (for readability): `1_000_000` is the same as `1000000`. You may
put `_` between digits, but **NOT**:
- at the **beginning** of the literal,
- at the **end** of the literal,
- **right before** a decimal point, or
- **right after** a decimal point.

Multiple underscores in a row *are* allowed (just ugly). Examples (verified with `javac`):
```java
double notAtStart   = _1000.00;      // DOES NOT COMPILE (starts with _)
double notAtEnd     = 1000.00_;      // DOES NOT COMPILE (ends with _)
double notByDecimal = 1000_.00;      // DOES NOT COMPILE (_ right before the .)
double annoyingLegal = 1_00_0.0_0;   // compiles (ugly, but legal)
double reallyUgly    = 1__________2; // compiles (multiple _ in a row)
```

##### Review question - numeric literals
> Which expressions, inserted independently into the blank, let the code compile?
> ```java
> public void printMagicData() {
>     var magic = ______ ;
>     System.out.println(magic);
> }
> ```
> A. `3_1`  B. `1_329_.0`  C. `3_13.0_`  D. `5_291._2`  E. `2_234.0_0`  F. `9___6`  G. `_1_3_5_0`

**Answer: A, E, F.** An underscore can go in any numeric literal *as long as* it is not at the
beginning, at the end, or next to a decimal point. Multiple underscores next to each other are
fine.
- A `3_1` -> valid (`int` 31). **compiles**
- E `2_234.0_0` -> valid (underscores only between digits). **compiles**
- F `9___6` -> valid (multiple underscores between digits). **compiles**
- B `1_329_.0` -> `_` is right before the decimal point. invalid
- D `5_291._2` -> `_` is right after the decimal point. invalid
- C `3_13.0_` -> `_` is at the end of the literal. invalid
- G `_1_3_5_0` -> `_` is at the beginning of the literal. invalid

##### What type is a literal written in another base? (hex / octal / binary)
Writing a number in another base is **just different notation for the same value** - it does
**NOT** change the type. The type rule is identical to a decimal literal:

- An integer literal, **in any base**, is an **`int` by default**, or a **`long`** if you add
  `L`. So `0xFF`, `012`, and `0b10` are all `int` (values 255, 10, 2); `0xFFL` is a `long`.
- Therefore `var x = 0xFF;` makes `x` an **`int`** with value **255**. `var y = 0xFFL;` makes
  `y` a **`long`**. (`var` just copies the literal's type.)

**Can any type be assigned `0x34`, `012`, etc.?** Yes - subject to the **same "does the value
fit?" rules as any decimal literal**, because underneath it is the same `int` value. Verified
with `javac`:

| Assignment | Result | Why |
|---|---|---|
| `int i = 0xFF;` | OK | it is an `int` |
| `long l = 0xFF;` | OK | `int` widens to `long` |
| `double d = 0xFF;` | OK | `255` becomes `255.0` |
| `byte b = 0x7F;` | OK | 127 fits in `byte` (constant that fits is allowed) |
| `byte b = 0xFF;` | DOES NOT COMPILE | 255 does not fit `byte` ("possible lossy conversion from int to byte") |

**Rule to remember:** the base is cosmetic. A hex/octal/binary literal is an `int` (or `long`
with `L`), and assigning it follows the normal "does the value fit the target type?" rules.

> Edge note (NOT on the exam): hex *floating-point* literals exist but need a `p` exponent,
> e.g. `0x1.8p1`. For 1Z0-829, treat hex/octal/binary as **integer** literals only.

### Reference Types (vs. Primitives)

A **reference type** refers to an **object** (an instance of a class). Unlike a primitive,
which holds its value directly, a reference does **not** hold the object's value - it holds the
object's **memory address** and "points to" it. Java never lets you see the actual address; you
only ever use the reference.

```java
String greeting;                          // a reference that can point to a String
greeting = new String("How are you?");    // now points to a new String object
```
A reference gets a value in one of two ways: assigned to **another object** of the same/
compatible type, or assigned to a **new object** with `new`. The object itself has no name -
you can only reach it through a reference.

**Three differences between primitives and reference types:**
1. **Naming:** primitive type names are **lowercase** (`int`, `double`); class names start
   **uppercase** (`String`, `Integer`). Convention (not enforced), but always follow it.
2. **Methods:** a reference (if not `null`) can call methods; a **primitive has none**.
   ```java
   String reference = "hello";
   int len = reference.length();   // OK - String has methods
   int bad = len.length();         // DOES NOT COMPILE - len is an int (primitive), no methods
   ```
3. **`null`:** reference types can be `null` (pointing to nothing); primitives **cannot**.
   ```java
   int value = null;    // DOES NOT COMPILE
   String name = null;  // OK
   ```
   -> If you need an integer that can be "unknown"/`null`, use the wrapper **`Integer`**
   instead of `int`. This is the motivation for wrapper classes.

##### Creating Wrapper Classes
Each primitive has a matching **wrapper class**: an **object** type that holds one primitive
value inside it.

###### Table - Wrapper classes
| Primitive | Wrapper class | Inherits `Number`? | Example of creating |
|---|---|---|---|
| `boolean` | `Boolean` | No | `Boolean.valueOf(true)` |
| `byte` | `Byte` | Yes | `Byte.valueOf((byte) 1)` |
| `short` | `Short` | Yes | `Short.valueOf((short) 1)` |
| `int` | `Integer` | Yes | `Integer.valueOf(1)` |
| `long` | `Long` | Yes | `Long.valueOf(1)` |
| `float` | `Float` | Yes | `Float.valueOf((float) 1.0)` |
| `double` | `Double` | Yes | `Double.valueOf(1.0)` |
| `char` | `Character` | No | `Character.valueOf('c')` |

**The methods - what each one does:**

- **`valueOf(primitive)`** -> returns a **wrapper object** that boxes the primitive.
  `Integer.valueOf(1)` gives an `Integer` holding `1`.
- **`valueOf(String)`** -> parses the text and returns a **wrapper object**.
  `Integer.valueOf("123")` gives an `Integer`.
- **`parseInt(String)` / `parseXxx(String)`** -> parses the text and returns a **primitive**.
  `Integer.parseInt("123")` gives an `int` (no object created).
- **`xxxValue()`** (called on a wrapper instance) -> returns the stored value **as the requested
  primitive type**. Numeric wrappers have `byteValue()`, `shortValue()`, `intValue()`,
  `longValue()`, `floatValue()`, `doubleValue()` (from `Number`); `Boolean`/`Character` have
  `booleanValue()`/`charValue()`. Narrowing here **can lose data**.

**The difference that gets tested - return type of `parseInt` vs `valueOf`:**
```java
int prim     = Integer.parseInt("123");   // primitive int
Integer wrap = Integer.valueOf("123");     // Integer object
```
Mnemonic: **`parseXxx` -> primitive**, **`valueOf` -> the value Object (wrapper)**.

`xxxValue()` extracting (and possibly losing) data (verified with `javac`):
```java
Double apple = Double.valueOf("200.99");
apple.byteValue();    // -56    (200 doesn't fit in byte -> wraps around)
apple.intValue();     // 200    (decimal part truncated)
apple.doubleValue();  // 200.99
```

**What happens in the background:**
- A wrapper is just an object with one primitive stored inside. Putting a primitive into a
  wrapper is **boxing**; taking it back out is **unboxing** (Java can do both automatically -
  *autoboxing*, Chapter 5).
- `valueOf(String)` = **parse + box** (text -> primitive -> wrapper object).
  `parseInt(String)` = **parse only** (text -> primitive, no object).
- Background gotcha (Chapter 5, but worth knowing now): `Integer.valueOf(int)` **reuses cached
  objects** for small values (-128 to 127). So two `Integer.valueOf(127)` are the **same
  object** (`==` is `true`), but two `Integer.valueOf(1000)` are **different objects**
  (`==` is `false`). *(Verified.)* This is why you compare wrapper objects with `.equals()`,
  not `==`.

###### Table - conversion methods at a glance
| Method                                            | Input / called on          | Returns                             |
| ------------------------------------------------- | -------------------------- | ----------------------------------- |
| `Integer.parseInt(String)` (and other `parseXxx`) | a `String`                 | **primitive** (e.g. `int`)          |
| `Integer.valueOf(String)`                         | a `String`                 | **wrapper object** (e.g. `Integer`) |
| `Integer.valueOf(primitive)`                      | a primitive                | **wrapper object** (e.g. `Integer`) |
| `intValue()`, `doubleValue()`, ...                | called on a wrapper object | **primitive** (the requested type)  |

### Variable Types & Scope

Three kinds of variables, distinguished by **where they are declared** (not by their name):

| Kind | Where declared | Scope / lifetime |
|---|---|---|
| **Local variable** | inside a method or block (a **method parameter** counts too) | from its declaration to the **end of that block** `{ }`; a parameter lasts the whole method |
| **Instance variable** (field) | in the class body, **without** `static` | from declaration **until the object is eligible for garbage collection** (one per object) |
| **Class variable** | in the class body, **with** `static` | from declaration **until the program ends** (one, shared by all instances) |

Braces `{ }` open a new block, and each block has its own scope. An inner block can see
variables from the outer block, but **not** the other way around.

```java
public class Mouse {
    final static int MAX_LENGTH = 5;        // class variable (static)
    int length;                             // instance variable
    public void grow(int inches) {          // inches -> local (method parameter)
        if (length < MAX_LENGTH) {
            int newSize = length + inches;  // local, scoped to the if block only
            length = newSize;
        }
    }
}
```

##### When does each variable come into existence?
- **Instance variable:** one copy **per object**, created when that object is created (`new`).
  Ten objects -> ten separate copies.
- **Class (`static`) variable:** exactly **one copy total**, belonging to the **class itself**,
  not to any object. It is created when the **class is first loaded/initialized by the JVM** -
  i.e. the first time the class is actively used (first object created, or first access to a
  static member, whichever comes first). That happens **before any objects exist**, and the
  variable exists **even if you never create a single instance**. It lives until the **program
  ends**.
- Because it belongs to the class, you access it as `ClassName.var` (e.g. `Mouse.MAX_LENGTH`)
  and all instances share that one value.

| | Instance variable | Class (`static`) variable |
|---|---|---|
| How many copies | one **per object** | **one total** (shared) |
| Created when | that object is created (`new`) | the **class is first loaded** (before any object) |
| Lives until | the object is eligible for GC | the **program ends** |
| Accessed via | an object reference | `ClassName.var` |

**When exactly is a class "loaded" (so its `static` variables come into existence)?**
A class initializes on its **first active use** - you do **not** need to create an object first.
Any of these triggers it (whichever happens first):
- launching it with `java ClassName` (the launched class is initialized before `main` runs),
- creating an instance (`new`),
- accessing or assigning a **non-constant** `static` member,
- calling a `static` method.

Demonstration (`>>` lines print exactly when each class initializes):
```java
class A { static int x = Demo.report("A"); }   // only used as a reference type
class B { static int x = Demo.report("B"); }   // static field is read
class C { static int x = Demo.report("C"); }   // an object is created
class D { static int x = Demo.report("D"); }   // never touched

public class Demo {
    static { System.out.println(">> Demo initialized (ran `java Demo`)"); }
    static int report(String n){ System.out.println(">> " + n + " initialized"); return 0; }
    public static void main(String[] args){
        A a;              // (1) declare a reference   -> A NOT initialized
        int v = B.x;      // (2) read a static field   -> B initialized (no object!)
        C c = new C();    // (3) create an object      -> C initialized
                          // (4) D is never touched     -> D NEVER initialized
    }
}
```
Output:
```
>> Demo initialized (ran `java Demo`)
>> B initialized
>> C initialized
```
So `A` and `D` are **never** initialized - their `static` variables never come into existence.

**Cases where the class is NOT initialized:**
- Declaring a reference of that type (`A a;`) - a reference is not "active use".
- Never using the class at all (`D`).
- Reading a `static final` **compile-time constant**, e.g. `Const.X` where
  `static final int X = 5;` - the compiler **inlines** the value, so the class is not loaded.

##### Review question - variable scope
How many variables are in scope on the line marked `// SCOPE` (line 14)?
```java
1:  public class Camel {
2:     { int hairs = 3_000_0; }
3:     long water, air=2;
4:     boolean twoHumps = true;
5:     public void spit(float distance) {
6:        var path = "";
7:           { double teeth = 32 + distance++; }
8:           while(water > 0) {
9:              int age = twoHumps ? 1 : 2;
10:             short i=-1;
11:             for(i=0; i<10; i++) {
12:                var Private = 2;
13:             }
14:             // SCOPE
15:          }
16:      }
17: }
```
A. 2  B. 3  C. 4  D. 5  E. 6  **F. 7**  G. None of the above

**Answer: F (7).** Trace the braces `{ }` to see what is still open at line 14:
- **Out of scope** by line 14: `hairs` (line 2, its own one-line block), `teeth` (line 7, one-line
  block), and `Private` (line 12, scoped to the `for` loop on lines 11-13).
- **In scope** at line 14:
  - 3 instance variables: `water`, `air` (line 3) and `twoHumps` (line 4) - fields are available
    throughout every instance method.
  - 4 locals: `distance` (the method parameter, line 5), `path` (line 6), `age` (line 9), and
    `i` (line 10) - the method and the `while` block are both still open.
- Total = 3 + 4 = **7**.

### Initialization & Default Values

##### What "default value" means
The default value is what a variable gets **automatically when you don't initialize it** - but
this only happens for **fields**, not for every variable. "Defaults are a field thing."

| Kind of variable | Declared where | Gets a default? |
|---|---|---|
| Instance variable (field) | in the class body | **Yes** (the table value) |
| Static / class variable | in the class body with `static` | **Yes** (the table value) |
| Array elements | any `new int[3]` etc. | **Yes** (filled with defaults) |
| **Local variable** | inside a method / block | **NO** - must be assigned before use, or it **does not compile** |

```java
public class Example {
    int instanceInt;          // field    -> defaults to 0
    static boolean flag;      // static   -> defaults to false

    void method() {
        int localInt;                     // local -> NO default
        System.out.println(localInt);     // DOES NOT COMPILE
                                          // "variable localInt might not have been initialized"
        System.out.println(instanceInt);  // fine: prints 0
    }
}
```

- A local variable read before a value is assigned = **compile error** (not a runtime crash,
  not garbage). Java forces you to assign it first.
- It is not "declared but never assigned" that fails - it is *using* it before assignment.
  `int x; x = 5; System.out.println(x);` is fine.

**Examples (all defaults verified with `javac`):**
```java
public class Defaults {
    static int staticInt;      // class var    -> 0
    static boolean staticBool; // class var    -> false
    int instanceInt;           // instance var -> 0
    double instanceDouble;     // instance var -> 0.0
    String instanceRef;        // instance var (reference) -> null

    public static void main(String[] a) {
        Defaults d = new Defaults();
        System.out.println(d.instanceInt);      // 0
        System.out.println(d.instanceDouble);   // 0.0
        System.out.println(d.instanceRef);      // null
        System.out.println(staticInt);          // 0
        System.out.println(staticBool);         // false

        int[] arr = new int[3];
        System.out.println(arr[0]);             // 0     (array elements get defaults)
        boolean[] barr = new boolean[2];
        System.out.println(barr[0]);            // false
        String[] sarr = new String[2];
        System.out.println(sarr[0]);            // null  (reference elements default to null)
    }
}
```
Notice the default for any **reference type** (like `String`) is **`null`**, not an empty value.

Contrast - a **local** variable has no default, so using it before assignment fails:
```java
public static void main(String[] a) {
    int x;
    System.out.println(x);   // DOES NOT COMPILE: "variable x might not have been initialized"
}
```
