### Strings & Text Blocks

#### Text Blocks

##### Definition
A **text block** (also called a **multiline string**) is a `String` that starts and ends
with three double quotes (`"""`). Its contents **don't need to be escaped**, and it can
span multiple lines.

- The type is still `String` — nothing special. All the `String` methods (Chapter 4) work
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
easier to read — no escaping required.

##### Incidental vs. Essential Whitespace
The whitespace inside a text block is split into two kinds:

- **Essential whitespace** — part of your `String`; it *matters* to the value.
- **Incidental whitespace** — just there to make the *code* easier to read. You can
  reformat the code and change the amount of incidental whitespace **without any impact**
  on the `String` value.

**How to tell them apart (the mental model):**
Imagine a vertical line drawn at the **leftmost non-whitespace character** in the whole
text block.
- Everything **to the left** of the line = **incidental** whitespace (stripped away).
- Everything **to the right** of the line = **essential** whitespace (kept in the value).

> The closing `"""`, if on its own line, also counts as a "non-whitespace" position — so
> putting the closing `"""` further left pushes the line left and turns more of your
> indentation into essential whitespace.

**Where each comes from (its source):**
- *Incidental* whitespace comes from the **indentation you add to line up the code nicely**
  inside your source file.
- *Essential* whitespace comes from indentation/spaces that sit **to the right of the
  leftmost character** — i.e. deliberate spacing that is meant to be part of the value.

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
  characters, the second has **one** — that whitespace fills in to match the line drawn by
  the closing `"""`.
