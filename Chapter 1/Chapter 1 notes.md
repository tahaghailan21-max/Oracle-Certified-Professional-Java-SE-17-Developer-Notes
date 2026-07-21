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

##### What each type defaults to (for fields / static / array elements)
| Type | Default |
|---|---|
| `boolean` | `false` |
| `byte`, `short`, `int`, `long` | `0` (for `long`, the value 0) |
| `float` | `0.0f` |
| `double` | `0.0` |
| `char` | the "null character" ` ` (numeric value `0`) |
| any **reference** type (`String`, arrays, `Integer`, any object) | `null` |

Remember: this only applies to **fields** (instance and `static`) and **array elements**.
**Local variables have no default at all.**

##### Review question - defaults
Which of the following are correct? (Choose all that apply.)
- A. An instance variable of type `float` defaults to `0`.
- B. An instance variable of type `char` defaults to `null`.
- C. A local variable of type `double` defaults to `0.0`.
- D. A local variable of type `int` defaults to `null`.
- E. A class variable of type `String` defaults to `null`.
- F. A class variable of type `String` defaults to the empty string `""`.
- G. None of the above.

**Answer: E only.**
- C, D wrong: **local variables don't have defaults** at all.
- A wrong: a `float` default is `0.0f` - it needs a decimal point; `0` (an int) is not accepted
  as the right answer.
- B wrong: `char` is a **primitive**, so it can't be `null` (it defaults to `\u0000 `).
- F wrong: a reference type defaults to `null`, **not** the empty string `""`.
- E correct: a `String` class variable defaults to `null`.

##### Edge cases / traps (when the "fields get defaults" rule bites)
- **`char` defaults to ` \u0000`, not `null`.** It is a primitive with numeric value `0` - the
  "null character", which is **not** the same as the `null` reference. *(Verified.)*
- **Reference types default to `null`**, never to an empty value like `""` or an empty array.
- **`float`/`double` defaults are `0.0f` / `0.0`** (with a decimal point), not `0`. The exam
  treats "`0`" as the wrong description for a floating-point default.
- **`final` fields do NOT auto-take the default.** A blank `final` field must be **explicitly
  assigned** (an instance `final` in its declaration or a constructor; a `static final` in its
  declaration or a static initializer). Otherwise it fails to compile:
  ```java
  public class F { final int x; }   // DOES NOT COMPILE: "variable x not initialized in the default constructor"
  ```
- **Array elements always default, even for a local array**, because the array object lives on
  the heap: `int[] a = new int[3];` gives `{0, 0, 0}`. (The array *reference* variable, if local,
  still has to be assigned - here it is, via `new`.)
- **Method parameters** are locals but are always given a value by the caller, so they never hit
  the "used before assignment" problem.

### The `final` Keyword

##### Definition
`final` is a modifier you can apply to **local variables**, **fields** (instance or static),
and (beyond this chapter) methods/classes. Applied to a variable, it means: **this variable can
be assigned a value at most once** - after that first assignment, any attempt to reassign it is
a **compile error**.

##### Where it changes things

**1. Declaration** - no new syntax, just add the modifier before the type:
```java
final int y = 10;
final int[] favoriteNumbers = new int[10];
```

**2. Initialization - "assign once, then locked"**
```java
final int y = 10;
int x = 20;
y = x + 10;   // DOES NOT COMPILE - y is final, already assigned
```
- **Blank final is legal**: you don't have to initialize at declaration, as long as it is
  assigned exactly once before it's used, on every path:
  ```java
  final int x;   // declared, not yet assigned
  x = 5;         // OK - the one and only assignment
  ```
- **`final` on a reference type locks the reference, not the object's contents.** You can
  still mutate what it points to; you just can't repoint it:
  ```java
  final int[] favoriteNumbers = new int[10];
  favoriteNumbers[0] = 10;    // OK - mutating the array's contents
  favoriteNumbers[1] = 20;    // OK
  favoriteNumbers = null;     // DOES NOT COMPILE - reassigning the reference
  ```

**3. Default values - this is where `final` actually changes behavior for fields**
- Normal rule (see *Initialization & Default Values* above): fields silently get a default
  (`0`, `false`, `null`...) if you don't initialize them.
- `final` **removes that fallback for fields**. A `final` field must be **explicitly**
  assigned - inline at declaration, in **every constructor** (instance `final`), or in a
  **static initializer block** (`static final`). Leaving it unassigned is a compile error,
  not a silent default:
  ```java
  public class F {
      final int x;   // DOES NOT COMPILE
                     // "variable x not initialized in the default constructor"
  }
  ```
- For **local** `final` variables, nothing changes vs. the normal rule - locals never had a
  default to begin with. `final` just adds "and can never be reassigned" on top of "must be
  assigned before use."

##### Legal vs. illegal - quick reference
| Code | Legal? | Why |
|---|---|---|
| `final int y = 10; y = 20;` | **NO** | reassigning a final variable |
| `final int x; x = 5;` (single assignment, no other path) | **YES** | blank final, assigned exactly once |
| `final int[] arr = new int[3]; arr[0] = 1;` | **YES** | mutating contents, not the reference |
| `final int[] arr = new int[3]; arr = null;` | **NO** | reassigning the reference |
| `class F { final int x; }` (never assigned anywhere) | **NO** | final field must be explicitly assigned |
| `class F { final int x = 5; }` | **YES** | assigned at declaration |
| `class F { final int x; F() { x = 5; } }` | **YES** | assigned in every constructor |

##### Review question
> Which of the following statements about garbage collection are correct? (Choose all that
> apply.)
> A. Calling `System.gc()` is guaranteed to free up memory by destroying objects eligible for
>    garbage collection.
> B. Garbage collection runs on a set schedule.
> C. Garbage collection allows the JVM to reclaim memory for other objects.
> D. Garbage collection runs when your program has used up half the available memory.
> E. An object may be eligible for garbage collection but never removed from the heap.
> F. An object is eligible for garbage collection once no references to it are accessible in
>    the program.
> G. Marking a variable `final` means its associated object will never be garbage collected.

**Answer: C, E, F.**
- **C** correct - that's the whole point of GC: reclaiming heap memory so it can be reused.
- **E** correct - GC is never *guaranteed* to run (see A/B/D), so an object can stay eligible
  without ever actually being collected (e.g., the program ends first).
- **F** correct - this is the definition of eligibility: no reachable references left.
- A wrong - `System.gc()` is only a *suggestion*; the JVM is free to ignore it.
- B, D wrong - there's no fixed schedule or memory-usage threshold that triggers GC.
- **G wrong - this is the `final` trap.** `final` only locks the **reference variable** (you
  can't repoint it) - it says nothing about the **object's reachability**. A `final` local
  variable still goes out of scope like any other variable, and once nothing references its
  object anymore, that object is just as eligible for GC as if it weren't `final`. `final` and
  garbage-collection eligibility are unrelated concepts.

##### Follow-up: why is a blank `final` *local* OK but a blank `final` *field* is not?
- **Fields get a default because the JVM zeroes out all object/class memory the instant it's
  allocated**, before any of your code runs - `final` or not, every field slot starts as
  `0`/`false`/`null`. So a blank `final` field technically *does* have a value immediately.
  The compile error isn't "it has no value" - it's a **separate rule**: a `final` field must be
  **definitely assigned by the end of the constructor**, or you've defeated the point of
  declaring it a constant (an unintentional silent `0` forever). Java refuses to let that
  happen silently, so it forces you to write the assignment yourself.
- **Local variables never get a default at all** - there's no object being zeroed out for them,
  so `final` isn't "removing a fallback," because there was never one to remove. The rule for
  locals - `final` or not - is identical: **definite assignment before use**. `final` just adds
  "and it can never be reassigned again" on top of that pre-existing rule.
- **One-liner:** fields have defaults to take away (and `final` takes that away); locals never
  had defaults to begin with, so `final` doesn't change anything structural for them.

### Order of Initialization

##### Calling Constructors
- `new ClassName()` creates an instance. The constructor's name matches the class name and it
  has **no return type**. A method with a return type that matches the class name (e.g.
  `public void Chick() {}`) is **not** a constructor - just a regular method.
- The constructor's purpose is to initialize fields, though it can contain any code.
- Fields can *also* be initialized directly on the line where they're declared.
- If you don't write a constructor yourself, the compiler supplies a "do nothing" default
  constructor for you.

##### Instance Initializer Blocks
- Braces `{ }` mark a **code block**. A code block that sits **outside any method**, directly
  in the class body, is called an **instance initializer**.
- It only counts as an instance initializer if it's **not** inside a method - a block written
  inside `main()`, for instance, is just an inner block, not an instance initializer.
- Counting blocks = counting matched pairs of `{ }`; every class also has one enclosing pair for
  the class declaration itself.

##### The order rule (the core of this topic)
Two rules:
1. **Fields and instance initializer blocks run in the order in which they appear in the file.**
2. **The constructor runs after *all* fields and instance initializer blocks have run** -
   regardless of where the constructor is physically written inside the class.

You also can't refer to a field/block before it's been defined in the file:
```java
{ System.out.println(name); }   // DOES NOT COMPILE - name isn't declared yet at this point
private String name = "Fluffy";
```

**Worked example (Chick):**
```java
1: public class Chick {
2:    private String name = "Fluffy";
3:    { System.out.println("setting field"); }
4:    public Chick() {
5:       name = "Tiny";
6:       System.out.println("setting constructor");
7:    }
8:    public static void main(String[] args) {
9:       Chick chick = new Chick();
10:      System.out.println(chick.name); } }
```
Output:
```
setting field
setting constructor
Tiny
```
Trace: `main` calls `new Chick()`. Java initializes `name` to `"Fluffy"` (line 2), then runs the
instance initializer (line 3, prints "setting field") - both in file order. **Only then** does
the constructor run (lines 4-7): it reassigns `name` to `"Tiny"` and prints "setting
constructor". Back in `main`, `chick.name` prints `Tiny`.

**Worked example 2 (Egg) - the real trap: the constructor's position in the file is irrelevant:**
```java
public class Egg {
   public Egg() {
      number = 5;
   }
   public static void main(String[] args) {
      Egg egg = new Egg();
      System.out.println(egg.number);
   }
   private int number = 3;
   { number = 4; }
}
```
Output: `5`.
Even though the constructor is *written first* in the file, it still runs *last*. Fields and
instance-init blocks run in their own file order first (`number = 3`, then `number = 4`), and
only after both have finished does the constructor run (`number = 5`).

##### Review question (Chapter 1 Review Questions, Q21)
> What is the output of executing the following class?
> ```java
> 1:  public class Salmon {
> 2:     int count;
> 3:     { System.out.print(count+"-"); }
> 4:     { count++; }
> 5:     public Salmon() {
> 6:        count = 4;
> 7:        System.out.print(2+"-");
> 8:     }
> 9:     public static void main(String[] args) {
> 10:       System.out.print(7+"-");
> 11:       var s = new Salmon();
> 12:       System.out.print(s.count+"-"); } }
> ```
> A. `7-0-2-1-`  B. `7-0-1-`  C. `0-7-2-1-`  D. `7-0-2-4-`  E. `0-7-1-`
> F. The class does not compile because of line 3.  G. The class does not compile because of
> line 4.  H. None of the above.

**Answer: D - `7-0-2-4-`.**
Trace it exactly like Chick/Egg above:
- `main` runs first (nothing to do with object creation yet): `System.out.print(7+"-")` → `7-`
- `new Salmon()` triggers the fields/instance-init blocks, in file order:
  - `count` has no explicit initializer → **field default** `0`
  - Line 3 block: `System.out.print(count+"-")` → count is still `0` here → `0-`
  - Line 4 block: `count++` → count becomes `1`
- **Constructor runs last**, no matter that it's written before the blocks in some other
  examples - here: `count = 4;` then `System.out.print(2+"-")` → `2-`
- Back in `main`: `System.out.print(s.count+"-")` → count is now `4` → `4-`

Total output: `7-` + `0-` + `2-` + `4-` = **`7-0-2-4-`**

### Garbage Collection

##### Definition
**Garbage collection** is the process of automatically freeing heap memory by deleting objects
that are no longer reachable in the program. All Java objects live on the heap (also called the
*free store*). If a program keeps instantiating objects and leaving them on the heap, it will
eventually run out of memory and crash - garbage collection is what solves this.

##### Eligibility - the one rule that matters
An object is **eligible for garbage collection** the moment it is no longer reachable. That
happens in exactly one of two ways:
- **The object no longer has any references pointing to it**, or
- **All references to the object have gone out of scope.**

Being *eligible* is not the same as being *collected*. The JVM decides when (or even if) an
eligible object is actually reclaimed - that part is out of your control. The book's analogy:
making an object eligible is like sealing a package and putting it in your mailbox for the mail
carrier - you don't control when (or whether) they actually come pick it up.

Java gives you one built-in way to *suggest* that garbage collection run:
```java
System.gc();
```
Just like the post office, Java is free to ignore you. **This method is never guaranteed to do
anything.**

##### Objects vs. References
- A **reference** is a variable that has a name and is used to access an object's contents. A
  reference can be assigned to another reference, passed to a method, or returned from a method.
  All references are the same size, no matter their type.
- An **object** sits on the heap and does *not* have a name - it can only be accessed through a
  reference. Objects come in all shapes and sizes and consume varying amounts of memory.
- An object cannot be assigned to another object, and cannot be passed to or returned from a
  method - only references can. **It is the object that gets garbage collected, not the
  reference.**

##### Tracing eligibility - the exam technique
For any GC question: **draw a picture.** A box for each object created with `new`, and an arrow
from each reference variable's name to the box it currently points to. As code reassigns a
variable, sets it to `null`, or the variable goes out of scope, cross out that arrow. The moment
a box has zero arrows pointing to it, that object became eligible right then - track *when*, not
just *if*.

**Worked example from the book:**
```java
1: public class Scope {
2:    public static void main(String[] args) {
3:       String one, two;
4:       one = new String("a");
5:       two = new String("b");
6:       one = two;
7:       String three = one;
8:       one = null;
9:    } }
```
- Line 3: write `one` and `two` (just the words - no boxes/arrows yet, nothing is on the heap).
- Line 4: box `"a"`, arrow `one → "a"`.
- Line 5: box `"b"`, arrow `two → "b"`.
- Line 6: `one` now points to what `two` points to - erase `one → "a"`, draw `one → "b"`.
  `three` doesn't exist yet, so at this instant `"a"` has zero arrows pointing to it. **`"a"`
  becomes eligible for garbage collection right after line 6.**
- Line 7: new variable `three`, arrow `three → "b"` (it points to whatever `one` points to
  *right now* - `"b"` - not to what `one` originally pointed to).
- Line 8: `one = null` - cross out `one → "b"`. `"b"` still has `two` and `three` pointing to
  it, so it is **not yet eligible**. `"b"` only becomes eligible once `two` and `three` both go
  out of scope, which happens at the end of the method on line 9.

##### Review question 1
> Which statements about the following program are correct? (Choose all that apply.)
> ```java
> 2:  public class Bear {
> 3:     private Bear pandaBear;
> 4:     private void roar(Bear b) {
> 5:        System.out.println("Roar!");
> 6:        pandaBear = b;
> 7:     }
> 8:     public static void main(String[] args) {
> 9:        Bear brownBear = new Bear();
> 10:       Bear polarBear = new Bear();
> 11:       brownBear.roar(polarBear);
> 12:       polarBear = null;
> 13:       brownBear = null;
> 14:       System.gc(); } }
> ```
> A. The object created on line 9 is eligible for garbage collection after line 13.
> B. The object created on line 9 is eligible for garbage collection after line 14.
> C. The object created on line 10 is eligible for garbage collection after line 12.
> D. The object created on line 10 is eligible for garbage collection after line 13.
> E. Garbage collection is guaranteed to run.
> F. Garbage collection might or might not run.
> G. The code does not compile.

**Answer: A, D, F.**
Trace with boxes:
- Line 9: box `BB`, arrow `brownBear → BB`.
- Line 10: box `PB`, arrow `polarBear → PB`.
- Line 11: `roar` runs with `b = PB`; inside, `pandaBear = b` makes `BB`'s field
  `pandaBear → PB`. Now `PB` has **two** arrows pointing to it: `polarBear → PB` and
  `BB.pandaBear → PB`.
- Line 12: `polarBear = null` - erase `polarBear → PB`. But `BB.pandaBear → PB` still exists,
  so `PB` is **still reachable** (through `BB`) - **not** eligible yet. (This is why C is wrong.)
- Line 13: `brownBear = null` - erase `brownBear → BB`. `BB` now has zero arrows -
  **the line-9 object becomes eligible right after line 13** (A). Since `BB` is now
  unreachable, its field `pandaBear → PB` no longer counts as a path either - nothing reaches
  `PB` anymore, so **the line-10 object also becomes eligible right after line 13** (D).
- Line 14: `System.gc()` is only a suggestion - never guaranteed (F). B is wrong because `BB`
  was already eligible *before* line 14 ran; E is wrong because GC is never guaranteed.

##### Review question 2
> Which of the following statements about garbage collection are correct? (Choose all that
> apply.)
> A. Calling `System.gc()` is guaranteed to free up memory by destroying objects eligible for
>    garbage collection.
> B. Garbage collection runs on a set schedule.
> C. Garbage collection allows the JVM to reclaim memory for other objects.
> D. Garbage collection runs when your program has used up half the available memory.
> E. An object may be eligible for garbage collection but never removed from the heap.
> F. An object is eligible for garbage collection once no references to it are accessible in
>    the program.
> G. Marking a variable `final` means its associated object will never be garbage collected.

**Answer: C, E, F.**
- **C** correct - that's the whole point of GC: reclaiming heap memory so it can be reused.
- **E** correct - GC is never *guaranteed* to run, so an object can stay eligible without ever
  actually being collected (e.g., the program ends first).
- **F** correct - this is the definition of eligibility: no reachable references left.
- A wrong - `System.gc()` is only a *suggestion*; the JVM is free to ignore it.
- B, D wrong - there's no fixed schedule or memory-usage threshold that triggers GC.
- **G wrong - the `final` trap.** `final` only locks the **reference variable** (you can't
  repoint it) - it says nothing about the **object's reachability**. A `final` local variable
  still goes out of scope like any other variable, and once nothing references its object
  anymore, that object is just as eligible for GC as if it weren't `final`.

##### The whole topic in one phrase
**An object is eligible for GC the instant nothing reachable points to it anymore - track that
moment by drawing boxes and arrows and crossing arrows out as references get reassigned,
nulled, or fall out of scope; `System.gc()` and `final` are both irrelevant to that moment, since neither one guarantees or prevents collection.**

### Which packages are imported by default?

Only **`java.lang.*`** is automatically imported into **every** Java class - no import needed
for things like `String`, `System`, `Math`, `Object`, `Integer`, etc.

The other case where no import is needed (not a package auto-import, but has the same effect):
**classes in your own current package are automatically visible** to each other. Java looks in
the current package before anywhere else, so two classes declared in the same package can
reference each other with zero `import` statements.

**Clarifying the book's `NumberPicker` example** (it bundles two *separate* redundancies
together, which reads confusingly at a glance):
```java
3:  import java.util.Random;
4:  import java.util.*;
5:  public class NumberPicker {
6:     public static void main(String[] args) {
7:        Random r = new Random();
8:        System.out.println(r.nextInt(10));
9:     }
10: }
```
The book says three imports are redundant here. **`Random` is not part of `java.lang` at all -
it lives in `java.util`.** The two redundancies are unrelated to each other:
1. The example (as printed in the book) also had one or two `java.lang` imports earlier in the
   snippet (lines 1-2, not shown above) - those are redundant purely because `java.lang` is
   always auto-imported. This has **nothing to do with `Random`**.
2. Separately, **line 4 (`import java.util.*;`) is redundant only because line 3
   (`import java.util.Random;`) already imports the one class actually used.** If line 3 weren't
   there, line 4 would *not* be redundant - it would be the thing covering `Random`.
So: `Random` is only ever reached via a `java.util` import (explicit or wildcard) - never via
`java.lang`. The `java.lang` redundancy and the `java.util` redundancy in that example are two
independent points made side by side, not one point about `Random` being in `java.lang`.

### Does Java support default method parameter values?

**Not covered by Chapter 1 - flagging this rather than asserting it.** Nothing in this chapter's
material on declaring/initializing variables, constructors, or method parameters describes a
default-parameter-value syntax; method parameters are simply treated as locals that are always
"pre-initialized" *by the caller*, meaning the caller must supply a value for every parameter.
That's as far as Chapter 1's content actually goes on this question - if the answer is addressed
head-on anywhere in the book, it would be later (e.g., around method overloading), which hasn't
been reviewed yet.

