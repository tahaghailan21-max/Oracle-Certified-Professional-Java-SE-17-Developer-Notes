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

##### Table 1.8 - formatting sequences (regular String vs. text block)
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
