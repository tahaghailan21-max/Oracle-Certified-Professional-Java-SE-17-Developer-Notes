### Core APIs

---

### Creating and Manipulating Strings

##### What is a String?
A `String` is a sequence of characters. It is a **reference type**, but it is special: you
do not need `new` to create one.

All three of these produce the same `String` value `"Fluffy"`:

```java
String name = "Fluffy";                  // string literal
String name = new String("Fluffy");      // explicit new (rarely used)
String name = """
    Fluffy""";                           // text block
```

They are subtly different under the hood (covered later in this chapter), but the *value*
they hold is identical.

---

##### Text Block refresher

A **text block** is just a `String` written between triple double-quotes (`"""`). The
opening `"""` **must be followed by a newline** - you cannot put content on the same line
as the opening `"""`.

```java
String name = """
    Fluffy""";
```

Key rules to remember:
- The type is still `String`. Every `String` method works on a text block exactly as it
  does on a regular `String`.
- **Incidental whitespace** (indentation you add to align the code) is stripped at compile
  time and never becomes part of the value.
- **Essential whitespace** (spaces that are genuinely part of the content) is kept.
- The vertical line that separates the two is drawn at the **leftmost non-whitespace
  character** across all lines (including the closing `"""`).

---

##### What "this text block is the same as the previous variable" means

The book is making a simple but important point: the *value* stored in `name` is identical
no matter which of the three forms you use.

Take the text block version:

```java
String name = """
    Fluffy""";
```

The content between the `"""` markers is:

```
    Fluffy
```

There is leading whitespace (`    `) before `Fluffy`, but `Fluffy` itself is the leftmost
non-whitespace content, so the vertical incidental-whitespace line sits right at the `F`.
Everything to the left of `F` is incidental and gets stripped. What remains is just
`Fluffy` - no leading spaces, no trailing newline (because the closing `"""` is on the
**same line** as `Fluffy`, not on its own line).

So the final value stored in `name` is the six-character string `Fluffy` - exactly the
same as `"Fluffy"` and `new String("Fluffy")`.

That is all the book means: the three syntaxes are different ways to write the same thing.
Text blocks are not a different data type or a different kind of string - they are just a
more readable way to write a `String` literal, and when the content is simple like
`Fluffy`, the result is byte-for-byte identical.


---

##### CharSequence
`String` implements the `CharSequence` interface - a general way of representing text.
`StringBuilder` also implements it. More on interfaces in Chapter 7.

---

### String Concatenation

##### The three rules (memorise these)
1. If **both** operands are numeric, `+` means **numeric addition**.
2. If **either** operand is a `String`, `+` means **concatenation**.
3. The expression is evaluated **left to right**.

```java
System.out.println(1 + 2);           // 3      (rule 1)
System.out.println("a" + "b");       // ab     (rule 2)
System.out.println("a" + "b" + 3);   // ab3    (rules 2, 3)
System.out.println(1 + 2 + "c");     // 3c     (rules 1 then 2)
System.out.println("c" + 1 + 2);     // c12    (rule 2 twice)
System.out.println("c" + null);      // cnull  (null becomes the string "null")
```

Trace for `1 + 2 + "c"`: left to right, `1 + 2` → both numeric → `3`, then `3 + "c"` →
one is a String → `"3c"`.

Trace for `"c" + 1 + 2`: `"c" + 1` → one is a String → `"c1"`, then `"c1" + 2` → `"c12"`.

##### Variable types matter - check them carefully
```java
int three = 3;
String four = "4";
System.out.println(1 + 2 + three + four); // "64"
```
Trace: `1 + 2` → `3` (rule 1), `3 + three` → `6` (rule 1, `three` is `int`),
`6 + four` → `"64"` (rule 2, `four` is `String`).

##### `+=` with strings
`s += "2"` is just shorthand for `s = s + "2"`. Once `s` is a `String`, adding anything
to it concatenates.

```java
var s = "1";   // "1"
s += "2";      // "12"
s += 3;        // "123"  -- 3 is an int, but s is a String, so rule 2 applies
System.out.println(s); // 123
```

---

### Important String Methods

##### Key facts before the methods
- A `String` is a sequence of characters. Java indexes from **0**.
  `"animals"` → `a=0, n=1, i=2, m=3, a=4, l=5, s=6`
- `String` is **immutable** - calling a method on a `String` never changes it.
  It returns a **new** `String` object. The original is untouched.

---

#### `length()`

Returns the number of characters in the `String`.

```java
public int length()
```

```java
var name = "animals";
System.out.println(name.length()); // 7
```

0-based indexing only applies to **positions** (when accessing a specific character).
When counting the **total size**, Java counts normally from 1. `"animals"` has 7 characters,
so `length()` returns `7`.

---

#### `charAt(int index)`

Returns the `char` at the given index.

```java
public char charAt(int index)
```

```java
var name = "animals";
System.out.println(name.charAt(0)); // a
System.out.println(name.charAt(6)); // s
System.out.println(name.charAt(7)); // StringIndexOutOfBoundsException
```

- Valid indexes: `0` to `length() - 1`.
- Passing an index that doesn't exist throws `StringIndexOutOfBoundsException`. Unlike
  some other methods, `charAt()` has no "not found" return value - it always throws when
  the index is out of range.

---

#### `indexOf()`

Finds the first index in the `String` that matches a character or substring. Returns `-1`
if no match is found (never throws an exception for a missing match).

```java
public int indexOf(int ch)
public int indexOf(int ch, int fromIndex)
public int indexOf(String str)
public int indexOf(String str, int fromIndex)
```

```java
var name = "animals";
System.out.println(name.indexOf('a'));      // 0  - first 'a' is at index 0
System.out.println(name.indexOf("al"));    // 4  - substring "al" starts at index 4
System.out.println(name.indexOf('a', 4));  // 4  - search starts at index 4, finds 'a' there
System.out.println(name.indexOf("al", 5)); // -1 - search starts at index 5, already past the match
```

##### The `ch` vs `str` parameter name distinction
The parameter is declared as `int`, not `char` - because Java stores characters as numbers
internally (`'a'` = `97`). So passing `'a'` to an `int` parameter is a valid widening
conversion.

The parameter **name** tells you which overload you're dealing with:
- `ch` - searching for a **single character**; pass a `char` literal like `'a'`
- `str` - searching for a **substring**; pass a `String` like `"al"`

On the exam, whenever the parameter is named `ch`, you will always see a `char` literal
passed (e.g. `'a'`), never a raw int (e.g. `97`). Both compile and behave identically -
the exam just always uses the readable form.

```java
name.indexOf('a');  // what the exam uses - char literal, widened to int internally
name.indexOf(97);   // also valid, but won't appear on the exam
```


---

#### `substring()`

Returns a part of the `String`. The `beginIndex` is inclusive, the `endIndex` is
**exclusive** (the character at `endIndex` is not included).

```java
public String substring(int beginIndex)
public String substring(int beginIndex, int endIndex)
```

```java
// "animals" -> a=0, n=1, i=2, m=3, a=4, l=5, s=6
var name = "animals";
name.substring(3);     // "mals" -- from index 3 to the end
name.substring(3, 6);  // "mal"  -- indexes 3,4,5 included; 6 is the stop point (excluded)
name.substring(3, 7);  // "mals" -- 7 is one past the last character; still valid
```

##### The "stop at" vs "include" warning
`endIndex` means **stop before this index**, not **include this index**. This has two
practical consequences:

- `substring(3, 6)` returns 3 characters (indexes 3, 4, 5) - not 4.
- `endIndex` can legally equal `length()` even though that index has no character.
  `substring(3, 7)` on a 7-character string is valid and returns the tail of the string.
  Passing `endIndex > length()` throws `StringIndexOutOfBoundsException`.

This is the opposite of `charAt()`:
- `charAt(7)` on `"animals"` throws - index 7 has no character.
- `substring(3, 7)` on `"animals"` is fine - 7 is a legal stop point.

The exam may write `substring(0, name.length())` or use an `endIndex` equal to `length()`
to trip you up. It looks out of bounds but it isn't.

**Mental shortcut:** number of characters returned = `endIndex - beginIndex`.
So `substring(3, 6)` → `6 - 3 = 3` characters.


##### Full example set

```java
var name = "animals";
// a=0, n=1, i=2, m=3, a=4, l=5, s=6  (length = 7)

System.out.println(name.substring(3));                    // "mals"
System.out.println(name.substring(name.indexOf('m')));    // "mals" - indexOf returns 3
System.out.println(name.substring(3, 4));                 // "m"    - just index 3
System.out.println(name.substring(3, 7));                 // "mals" - 7 == length(), valid

System.out.println(name.substring(3, 3)); // ""        - start == end, empty string
System.out.println(name.substring(3, 2)); // exception - end < start, indexes are backward
System.out.println(name.substring(3, 8)); // exception - 8 > length(), no such stop point
                                          //             (7 is fine as the "end of string"
                                          //              invisible position, 8 is not)
```

---

#### `toUpperCase()` / `toLowerCase()`

Convert the case of all letter characters. Non-letter characters are left alone.
Returns a new `String` - the original is unchanged (immutable).

```java
public String toUpperCase()
public String toLowerCase()
```

```java
var name = "animals";
System.out.println(name.toUpperCase()); // ANIMALS
System.out.println("Abc123".toLowerCase()); // abc123 - digits untouched
System.out.println(name); // animals - original unchanged
```

---

#### `equals()` / `equalsIgnoreCase()`

Check whether two strings have exactly the same characters in the same order.
`String` values are **case-sensitive** by default.

```java
public boolean equals(Object obj)
public boolean equalsIgnoreCase(String str)
```

```java
System.out.println("abc".equals("ABC"));            // false - case differs
System.out.println("ABC".equals("ABC"));            // true
System.out.println("abc".equalsIgnoreCase("ABC"));  // true - case ignored
```

##### Why `equals()` takes `Object`, not `String`
`equals()` is inherited from `Object` and works on any type. If you pass something that
isn't a `String`, it just returns `false` - no exception.
`equalsIgnoreCase()` is `String`-specific, so its parameter is typed as `String`.

```java
// 1. Comparing with an object that is NOT a String
Object num = 42;                               // an Integer
System.out.println("42".equals(num));          // false - different types

// 2. Comparing with an object that IS a String
Object a = "hello";                            // runtime type is String
Object b = "hello";
System.out.println(a.equals(b));               // true - same characters

// 3. Variable declared as Object but holding a String
Object obj = "animals";
System.out.println("animals".equals(obj));     // true - equals() checks the actual value,
                                               //        not the declared type of obj

// 4. equalsIgnoreCase() only accepts String - won't compile with a plain Object
// "animals".equalsIgnoreCase(obj);            // DOES NOT COMPILE - obj is type Object
String s = (String) obj;
System.out.println("animals".equalsIgnoreCase(s)); // true - cast first, then call
```

The key takeaway: `equals()` is safe to call with any object - worst case it returns
`false`. `equalsIgnoreCase()` requires a `String` argument at compile time, so if you only
have an `Object` reference you must cast it first.


---

> **Note: Overriding `toString()`, `equals()`, and `hashCode()`**
>
> Not directly tested on the OCP 17 exam, but important background knowledge.
> Every class in Java inherits these three methods from `Object`. The defaults
> are rarely what you want, so you override them.
>
> ##### `toString()`
> Called automatically when you print an object or concatenate it with a `String`.
> The default prints something useless like `Dog@3764951d` (class name + memory address).
> Override it to print something meaningful.
>
> ```java
> class Dog {
>     String name;
>     Dog(String name) { this.name = name; }
>
>     @Override
>     public String toString() { return "Dog{name=" + name + "}"; }
> }
>
> Dog d = new Dog("Rex");
> System.out.println(d);        // Dog{name=Rex}   (toString() called automatically)
> System.out.println("Meet " + d); // Meet Dog{name=Rex}
> ```
>
> ##### `equals(Object)`
> The default `equals()` uses `==`, which checks if two variables point to the **exact
> same object in memory** - not whether they have the same content.
> Override it when you care about value equality.
>
> ```java
> class Dog {
>     String name;
>     Dog(String name) { this.name = name; }
> }
>
> Dog d1 = new Dog("Rex");
> Dog d2 = new Dog("Rex");
>
> // Without override:
> System.out.println(d1 == d2);        // false - different objects in memory
> System.out.println(d1.equals(d2));   // false - default equals() uses ==
>
> // With override that compares name:
> // equals() would return true because both have name "Rex"
> ```
>
> ##### `hashCode()`
> A hash code is an `int` that represents an object - used internally by collections
> like `HashMap` and `HashSet` to organise objects into buckets for fast lookup.
>
> The rule: **if two objects are equal (`equals()` returns `true`), they must have
> the same hash code.** If you override `equals()` but not `hashCode()`, you break
> this rule, and things like `HashMap` and `HashSet` will silently produce wrong results.
>
> ```java
> // Broken: equals() overridden but hashCode() not overridden
> Map<Dog, String> map = new HashMap<>();
> Dog d1 = new Dog("Rex");
> map.put(d1, "friendly");
>
> Dog d2 = new Dog("Rex");       // same name, equals() says true
> System.out.println(map.get(d2)); // null! hashCode() differs, so map can't find it
>
> // Fixed: override both equals() and hashCode() consistently
> // Now map.get(d2) returns "friendly" as expected
> ```
>
> **Simple rule to remember:** always override `equals()` and `hashCode()` together,
> never one without the other.


> ##### Full correct example: both overridden together
>
> ```java
> class Dog {
>     String name;
>     int age;
>
>     Dog(String name, int age) {
>         this.name = name;
>         this.age = age;
>     }
>
>     // Two Dogs are "equal" if they have the same name and age
>     @Override
>     public boolean equals(Object obj) {
>         if (this == obj) return true;             // same object in memory, definitely equal
>         if (!(obj instanceof Dog)) return false;  // not a Dog, can't be equal
>         Dog other = (Dog) obj;
>         return this.age == other.age && this.name.equals(other.name);
>     }
>
>     // hashCode must use the SAME fields as equals (name and age)
>     @Override
>     public int hashCode() {
>         return name.hashCode() + age;
>     }
> }
> ```
>
> ```java
> Dog d1 = new Dog("Rex", 3);
> Dog d2 = new Dog("Rex", 3);  // different object, same content
> Dog d3 = new Dog("Max", 3);  // different name
>
> System.out.println(d1.equals(d2)); // true  - same name and age
> System.out.println(d1.equals(d3)); // false - different name
>
> System.out.println(d1.hashCode() == d2.hashCode()); // true  - equal objects must have equal hash
> System.out.println(d1.hashCode() == d3.hashCode()); // false - unequal objects (likely differ)
>
> Map<Dog, String> map = new HashMap<>();
> map.put(d1, "friendly");
>
> System.out.println(map.get(d2)); // "friendly" - correct: d2 equals d1 and shares its hash
> System.out.println(map.get(d3)); // null        - correct: d3 is a different dog
> ```
>
> How `HashMap` uses both methods internally:
> 1. Calls `hashCode()` to find the right **bucket** (a slot in an internal array).
> 2. Calls `equals()` to find the **exact match** inside that bucket.
>
> If `hashCode()` is wrong, step 1 lands in the wrong bucket and `equals()` never gets
> called at all. That is why the two must always agree: same fields, same logic.


---

#### `startsWith()` / `endsWith()` / `contains()`

Check whether a string starts with, ends with, or contains a given value.
All three are case-sensitive.

```java
public boolean startsWith(String prefix)
public boolean endsWith(String suffix)
public boolean contains(CharSequence charSeq)
```

```java
System.out.println("abc".startsWith("a")); // true
System.out.println("abc".startsWith("A")); // false - case-sensitive
System.out.println("abc".endsWith("c"));   // true
System.out.println("abc".endsWith("a"));   // false
System.out.println("abc".contains("b"));   // true
System.out.println("abc".contains("B"));   // false - case-sensitive
```

##### `contains()` is a convenience method
The book notes that `contains()` saves you from writing this:

```java
str.indexOf(otherString) != -1
```

Both do the same thing - check if `otherString` appears anywhere inside `str`. But
`contains()` makes the intent obvious and is shorter to write. These two lines are
equivalent:

```java
System.out.println("abc".contains("b"));          // true
System.out.println("abc".indexOf("b") != -1);     // true - same result, more verbose
```

`indexOf()` returns `-1` when no match is found, so checking `!= -1` is the manual way
of asking "does this exist anywhere in the string?" `contains()` just wraps that check
and returns a `boolean` directly.


---

#### `replace()`

Replaces all occurrences of a character or substring with a new value.
Returns a new `String` - the original is unchanged.

```java
public String replace(char oldChar, char newChar)
public String replace(CharSequence target, CharSequence replacement)
```

```java
System.out.println("abcabc".replace('a', 'A'));   // AbcAbc - char version
System.out.println("abcabc".replace("a", "A"));   // AbcAbc - String version, same result
```

The two versions produce the same output here, but the `CharSequence` version is more
flexible - the replacement doesn't have to be the same length as the target:

```java
// Replace one char with multiple chars
System.out.println("abcabc".replace("a", "123")); // 123bc123bc

// Replace multiple chars with one char
System.out.println("aabbcc".replace("aa", "X"));  // Xbbcc

// Replace a whole word
System.out.println("I like cats".replace("cats", "dogs")); // I like dogs

// Replace with empty string (effectively deletes the target)
System.out.println("abcabc".replace("a", ""));    // bcbc

// No match - original string returned unchanged
System.out.println("abcabc".replace("z", "X"));   // abcabc
```

All occurrences are replaced, not just the first one.


---

#### `strip()` / `stripLeading()` / `stripTrailing()` / `trim()`

Remove whitespace from the beginning and/or end of a `String`.
Whitespace includes spaces, `\t` (tab), `\n` (newline), `\r` (carriage return), and others.

```java
public String strip()
public String stripLeading()
public String stripTrailing()
public String trim()
```

```java
System.out.println("abc".strip());          // abc   - nothing to remove
System.out.println("\t a b c\n".strip());   // a b c - leading tab+space and trailing newline removed
                                            //         spaces in the middle are untouched

String text = " abc\t ";
System.out.println(text.trim().length());          // 3 - "abc"
System.out.println(text.strip().length());         // 3 - "abc"
System.out.println(text.stripLeading().length());  // 5 - "abc\t " (removed leading space only)
System.out.println(text.stripTrailing().length()); // 4 - " abc"  (removed trailing tab+space)
```

##### What `\t` means - escape sequences refresher
A backslash followed by certain letters forms an **escape sequence** - a single character
that cannot be typed directly in a string literal:

| Sequence | Meaning         | Character count |
|----------|-----------------|-----------------|
| `\t`     | tab             | 1               |
| `\n`     | newline         | 1               |
| `\r`     | carriage return | 1               |
| `\\`     | literal `\`     | 1               |

So `"\t a b c\n"` is not 10 characters that include a backslash and a `t` - it is 9
characters where the first one is a tab and the last one is a newline. The backslash just
tells the compiler "treat the next letter as a special character, not a literal letter."

##### `strip()` vs `trim()` - what is the actual difference?
Both remove leading and trailing whitespace and produce the same result for everyday ASCII
strings. The difference is which characters they recognise as whitespace:

- `trim()` only removes characters with a Unicode value of `U+0020` (space) or below.
  That covers the common ones: space, tab, newline, carriage return.
- `strip()` uses the full Unicode definition of whitespace, which includes additional
  characters like `\u2000` (en quad), `\u3000` (ideographic space), and many others used
  in non-Latin scripts.

```java
char unicode = '\u2000'; // a Unicode whitespace character - looks like a space but isn't U+0020
String s = unicode + "abc" + unicode;

System.out.println(s.trim().length());  // 5 - trim() doesn't recognise \u2000 as whitespace
System.out.println(s.strip().length()); // 3 - strip() does, removes both, leaves "abc"
```

In practice: **always prefer `strip()`** - it does everything `trim()` does and handles
Unicode correctly. `trim()` only exists for historical reasons (it predates Java's Unicode
whitespace support). The exam may test that you know `strip()` is the Unicode-aware version.


---

#### `indent(int n)` / `stripIndent()`

```java
public String indent(int numberSpaces)
public String stripIndent()
```

##### `indent(n)` - adds or removes spaces at the start of every line

```java
String s = "hello\nworld";  // two lines: "hello" and "world"

System.out.print(s.indent(4));
// "    hello\n"
// "    world\n"
// 4 spaces added to the start of each line
```

```java
String s = "    hello\n    world\n";  // each line has 4 leading spaces

System.out.print(s.indent(-2));
// "  hello\n"
// "  world\n"
// 2 spaces removed from each line

System.out.print(s.indent(-10));
// "hello\n"
// "world\n"
// tried to remove 10, only 4 existed - all 4 removed, no error
```

##### `stripIndent()` - removes all incidental whitespace automatically

Applies the same rule as text block incidental whitespace stripping (the vertical line
trick from Ch1), but to a regular string. It finds the minimum indentation across all
non-blank lines and removes exactly that amount from every line. You don't specify a number.

```java
String s = "    hello\n    world\n      extra";
// "    hello"   - 4 spaces
// "    world"   - 4 spaces
// "      extra" - 6 spaces
// minimum indentation = 4

System.out.print(s.stripIndent());
// "hello\n"
// "world\n"
// "  extra"   - had 6 spaces, 4 removed, 2 remain
```

The difference from `indent(-n)`: `indent(-n)` removes a fixed number you specify.
`stripIndent()` calculates the minimum indentation itself and removes exactly that from
every line.

##### Normalisation - the extra thing both methods do automatically

Both methods silently do two extra things:

1. **`\r\n` to `\n`**: Windows line endings are converted to Unix line endings so the
   string behaves the same on all operating systems.
2. **Trailing newline**: `indent()` always adds a `\n` at the end if one is missing.
   `stripIndent()` does **not** add one.

```java
String s = "hello";             // no trailing newline

System.out.print(s.indent(0));    // "hello\n" - newline was added even though n=0
System.out.print(s.stripIndent()); // "hello"  - no newline added
```

This is why `indent(0)` is not a true no-op - even with zero spaces changed, it still
adds a trailing newline if one is missing.

##### Summary

| | `indent(n > 0)` | `indent(0)` | `indent(n < 0)` | `stripIndent()` |
|---|---|---|---|---|
| Indentation change | +n spaces per line | none | removes up to n spaces per line | removes all incidental whitespace automatically |
| Converts `\r\n` to `\n` | yes | yes | yes | yes |
| Adds trailing newline if missing | yes | yes | yes | **no** |


##### Worked examples

Two strings are used throughout. Keep their contents in mind for every example below.

```java
var block = """
        a
         b
        c""";
// value:  a\n b\nc
// chars:  a, \n, (space), b, \n, c  =  6 characters
// - no leading whitespace before 'a' or 'c' (stripped by text block rules)
// - one space before 'b' (essential whitespace)
// - no trailing newline (closing """ is on the same line as 'c')
```

```java
var concat = " a\n"
           + " b\n"
           + " c";
// value:  (space)a\n(space)b\n(space)c
// chars:  ' ', a, \n, ' ', b, \n, ' ', c  =  9 characters
// - every line starts with one space (these are real characters, nothing was stripped)
// - no trailing newline
```

---

```java
// before: var block = """
//             a
//              b
//             c""";
System.out.println(block.length()); // 6
// after: unchanged - length() doesn't modify the string
```
Characters: `a`, `\n`, ` `, `b`, `\n`, `c` = 6.
The text block compiler already stripped incidental whitespace, so no leading
spaces exist before `a` or `c`.

---

```java
// before: var concat = " a\n"
//                    + " b\n"
//                    + " c";
System.out.println(concat.length()); // 9
// after: unchanged - length() doesn't modify the string
```
Characters: ` `, `a`, `\n`, ` `, `b`, `\n`, ` `, `c` = 9.
Built manually so all leading spaces are real characters - nothing was stripped.

---

```java
// before: var block = """
//             a
//              b
//             c""";
System.out.println(block.indent(1).length()); // 10
// after: var result = "  a\n"
//                   + "   b\n"
//                   + "  c\n";
// (length 10 - 1 space added to every line + trailing newline added)
```
`indent(1)` adds 1 space to the start of each of the 3 lines: +3 characters.
`block` has no trailing newline, so `indent()` adds one: +1 character.
`6 + 3 + 1 = 10`.

---

```java
// before: var concat = " a\n"
//                    + " b\n"
//                    + " c";
System.out.println(concat.indent(-1).length()); // 7
// after: var result = "a\n"
//                   + "b\n"
//                   + "c\n";
// (length 7 - 1 space removed from every line + trailing newline added)
```
`indent(-1)` removes 1 space from the start of each of the 3 lines: -3 characters.
Each line has exactly 1 leading space so all 3 removals succeed.
`concat` has no trailing newline, so `indent()` adds one: +1 character.
`9 - 3 + 1 = 7`.

---

```java
// before: var concat = " a\n"
//                    + " b\n"
//                    + " c";
System.out.println(concat.indent(-4).length()); // 6
// after: var result = "a\n"
//                   + "b\n"
//                   + "c\n";
// (length 6 - tried to remove 4 spaces but only 1 existed per line + trailing newline added)
```
`indent(-4)` tries to remove 4 spaces from each line, but each line only has 1.
Java removes as many as it can: 1 per line, so still -3 characters.
Trailing newline added: +1.
`9 - 3 + 1 = 6`.
Same arithmetic as `indent(-1)` because there was only 1 space to remove per line regardless.

---

```java
// before: var concat = " a\n"
//                    + " b\n"
//                    + " c";
System.out.println(concat.stripIndent().length()); // 6
// after: var result = "a\n"
//                   + "b\n"
//                   + "c";
// (length 6 - 1 space removed from every line, NO trailing newline added)
```
`stripIndent()` finds the minimum indentation: every line has exactly 1 leading space,
so minimum = 1. Removes 1 space from each of the 3 lines: -3 characters.
`stripIndent()` does **not** add a trailing newline.
`9 - 3 = 6`.

Notice: `concat.indent(-1)` and `concat.stripIndent()` produce the same visible lines
(`a`, `b`, `c`) but different lengths (7 vs 6). The only difference is the trailing
newline that `indent()` adds and `stripIndent()` does not.

---

#### `translateEscapes()`

Scans the string for literal escape sequences (written as two characters, e.g. `\` + `t`)
and converts them into the actual character they represent.

```java
public String translateEscapes()
```

```java
var str = "1\\t2";
System.out.println(str);                    // 1\t2  - literal backslash + t, no tab
System.out.println(str.translateEscapes()); // 1	2  - actual tab character
```

##### What it does exactly
`"1\\t2"` stores the characters: `1`, `\`, `t`, `2`. There is no tab - just a backslash
followed by the letter t. `translateEscapes()` finds the two-character pair `\t` and
replaces it with a real tab. It does the same for all known escape sequences:

| Literal in string | Becomes |
|-------------------|---------|
| `\t`              | tab     |
| `\n`              | newline |
| `\s`              | space   |
| `\"`              | `"`     |
| `\'`              | `'`     |
| `\\`              | `\`     |

If it finds `\` followed by an unrecognised letter (e.g. `\q`), it throws
`IllegalArgumentException` - it does not silently drop the backslash or leave it alone.

##### When is this useful?
When a string arrives from outside your code (user input, a config file, a database) and
contains the literal text `\n` (two characters), but you want it treated as a real newline.
`translateEscapes()` does that conversion for you.

```java
String fromConfig = "line1\\nline2";  // stored as: line1\nline2 (no real newline)
System.out.println(fromConfig);                       // line1\nline2
System.out.println(fromConfig.translateEscapes());    // line1
                                                      // line2
```


---

#### `isEmpty()` / `isBlank()`

```java
public boolean isEmpty()
public boolean isBlank()
```

```java
System.out.println(" ".isEmpty());  // false - has a space character, not empty
System.out.println("".isEmpty());   // true  - zero characters
System.out.println(" ".isBlank());  // true  - only whitespace
System.out.println("".isBlank());   // true  - empty is also blank
```

- `isEmpty()` - true only if length is 0. A string with just spaces is NOT empty.
- `isBlank()` - true if length is 0 OR if every character is whitespace.

---

#### `format()` / `formatted()`

Build a formatted string by inserting values into a template using symbols.

```java
public static String format(String format, Object args...)
public static String format(Locale loc, String format, Object args...)
public String formatted(Object args...)
```

```java
var name = "Kate";
var orderId = 5;

// All three produce: "Hello Kate, order 5 is ready"
System.out.println("Hello " + name + ", order " + orderId + " is ready");
System.out.println(String.format("Hello %s, order %d is ready", name, orderId));
System.out.println("Hello %s, order %d is ready".formatted(name, orderId));
```

##### Format symbols

| Symbol | Meaning                          | Example value |
|--------|----------------------------------|---------------|
| `%s`   | any type converted to String     | `"Kate"`      |
| `%d`   | integer (`int`, `long`)          | `5`           |
| `%f`   | floating point (`float`,`double`)| `90.250000`   |
| `%n`   | newline (platform-safe)          |               |

```java
var name = "James";
var score = 90.25;
var total = 100;
System.out.println("%s:%n Score: %f out of %d".formatted(name, score, total));
// James:
//  Score: 90.250000 out of 100
```

##### Type mismatch throws at runtime
`formatted()` takes `Object...` so anything compiles. The type check happens at runtime.

```java
"Food: %d tons".formatted(2.0); // compiles fine, throws IllegalFormatConversionException
                                 // because %d expects an integer, not a double
```

##### Flags - controlling width, decimals, and padding

Flags go between `%` and the symbol: `%[zero-flag][width][.decimals]symbol`

- **width** - minimum total length of the output. Padded with spaces on the left if needed.
- **.decimals** - number of digits after the decimal point.
- **0 flag** - pad with zeros instead of spaces.
- Rounding is used, not truncation. `3.14159` to 2 places = `3.14`, to 3 places = `3.142` (rounds up because the 4th decimal is 5).

```java
var pi = 3.14159265359;

System.out.format("[%f]", pi);      // [3.141593]
// no flags - default 6 decimal places, no padding

System.out.format("[%12.8f]", pi);  // [  3.14159265]
// width 12, 8 decimals
// "3.14159265" = 10 chars, needs 2 more to reach 12 → 2 spaces on the left

System.out.format("[%012f]", pi);   // [00003.141593]
// width 12, default 6 decimals, pad with ZEROS
// "3.141593" = 8 chars, needs 4 more → 4 zeros on the left

System.out.format("[%12.2f]", pi);  // [        3.14]
// width 12, 2 decimals
// "3.14" = 4 chars, needs 8 more → 8 spaces on the left

System.out.format("[%.3f]", pi);    // [3.142]
// no width, 3 decimals
// 3.14159... rounded to 3 places → 3.142 (4th decimal is 1, rounds up from 5 in position 4)
```

The `0` flag: placing a `0` before the width number switches padding from spaces to zeros.
`%12f` → spaces on the left. `%012f` → zeros on the left.


---

### Method Chaining

Instead of storing each intermediate result in a variable, you can chain method calls
directly. Each method is called on the return value of the previous one.

```java
// verbose version - 4 separate variables
var start     = "AniMaL ";
var trimmed   = start.trim();              // "AniMaL"
var lowercase = trimmed.toLowerCase();     // "animal"
var result    = lowercase.replace('a','A');// "AnimAl"

// chained version - identical result, one line
String result = "AniMaL ".trim().toLowerCase().replace('a', 'A'); // "AnimAl"
```

Read left to right: `"AniMaL "` → `trim()` → `"AniMaL"` → `toLowerCase()` → `"animal"`
→ `replace('a','A')` → `"AnimAl"`.

##### Tricky chaining example

```java
String a = "abc";
String b = a.toUpperCase();                         // b = "ABC"
b = b.replace("B", "2").replace('C', '3');
System.out.println("a=" + a); // a=abc  - a was never reassigned
System.out.println("b=" + b); // b=A23
```

Trace line 3: `"ABC".replace("B","2")` → `"A2C"`, then `"A2C".replace('C','3')` → `"A23"`.
`a` is unchanged throughout because `String` is immutable and `a` was never reassigned.

---

### The StringBuilder Class

##### Why it exists
`String` is immutable - every modification creates a new object. This loop creates 27
objects (the empty string + one per letter), most immediately eligible for GC:

```java
String alpha = "";
for (char current = 'a'; current <= 'z'; current++)
    alpha += current; // new String object every iteration
```

`StringBuilder` solves this by mutating a single object in place:

```java
StringBuilder alpha = new StringBuilder();
for (char current = 'a'; current <= 'z'; current++)
    alpha.append(current); // same object modified each time
System.out.println(alpha); // abcdefghijklmnopqrstuvwxyz
```

Only 1 object created instead of 27.

> `StringBuffer` works the same way but is thread-safe and slower. It is not on the exam.
> Always use `StringBuilder`.

---

#### Mutability and Chaining with StringBuilder

`StringBuilder` is **mutable** - methods modify the object itself and return a reference
to the same object (not a new one). This is the key difference from `String` chaining.

```java
StringBuilder sb = new StringBuilder("start");
sb.append("+middle");                      // sb is now "start+middle"
StringBuilder same = sb.append("+end");    // sb is now "start+middle+end"
                                           // same points to the exact same object as sb
System.out.println(sb);   // start+middle+end
System.out.println(same); // start+middle+end  - same object
```

##### The exam trap: how many StringBuilder objects exist?

```java
StringBuilder a = new StringBuilder("abc");
StringBuilder b = a.append("de");           // a = "abcde", b points to same object as a
b = b.append("f").append("g");              // still the same object, now "abcdefg"
System.out.println("a=" + a); // a=abcdefg
System.out.println("b=" + b); // b=abcdefg
```

`new StringBuilder()` is called **once** - there is only ever one object. `a` and `b` are
just two variable names pointing to it. Every `append()` modifies that one object and
returns a reference to it. The reassignment `b = b.append(...)` does nothing new - `b`
was already pointing to the same object.

The exam will try to make you think `a` and `b` hold different values. They don't - there
is only one `StringBuilder`.


---

#### Creating a StringBuilder

```java
StringBuilder sb1 = new StringBuilder();        // empty, Java manages capacity
StringBuilder sb2 = new StringBuilder("animal");// starts with a value
StringBuilder sb3 = new StringBuilder(10);      // empty, capacity hint of 10 slots
```

The capacity hint (third form) is a performance hint - you're telling Java roughly how
large the string will grow so it can pre-allocate space and avoid resizing. It doesn't limit
the size; Java will expand automatically if needed.

---

#### Common methods shared with String

`substring()`, `indexOf()`, `length()`, `charAt()` work the same as on `String`.

```java
var sb = new StringBuilder("animals");
String sub = sb.substring(sb.indexOf("a"), sb.indexOf("al")); // "anim"
int len    = sb.length();   // 7
char ch    = sb.charAt(6);  // 's'
System.out.println(sub + " " + len + " " + ch); // anim 7 s
```

- `indexOf("a")` returns 0, `indexOf("al")` returns 4.
- `substring(0, 4)` returns `"anim"` (index 4 is exclusive).
- `length()` is the count of characters (normal counting from 1), not an index.
- `charAt(6)` is index-based (starts at 0), so it returns the 7th character `'s'`.
- `substring()` returns a **new `String`**, not a `StringBuilder`. `sb` is unchanged.

---

#### `append()`

Adds a value to the end of the `StringBuilder` and returns a reference to the same object.
Has overloads for all common types (`int`, `char`, `boolean`, `String`, etc.).

```java
var sb = new StringBuilder().append(1).append('c');
sb.append("-").append(true);
System.out.println(sb); // 1c-true
```

No need to convert values to `String` first - just call `append()` with any type.

---

#### `insert(int offset, String str)`

Inserts a value at the given index and returns a reference to the same object.
Characters at and after the offset are shifted right.

```java
var sb = new StringBuilder("animals"); // "animals"  indexes: a=0,n=1,i=2,m=3,a=4,l=5,s=6

sb.insert(8, "-");  // exception - index 8 doesn't exist yet (length is 7, valid insert
                    // positions are 0-7; inserting AT 7 appends, 8 is out of bounds)
```

```java
var sb = new StringBuilder("animals");
sb.insert(7, "-"); // "animals-"  inserted at the end (index 7 = one past last char)
sb.insert(0, "-"); // "-animals-" inserted at the very beginning
sb.insert(4, "-"); // "-ani-mals-" inserted before index 4
System.out.println(sb); // -ani-mals-
```

Watch the shifting: after each insert the indexes of existing characters change.
Draw it out on paper when the exam chains multiple inserts.

---

#### `delete(int startIndex, int endIndex)` / `deleteCharAt(int index)`

Removes characters and returns a reference to the same object.
`delete()` removes from `startIndex` up to but not including `endIndex` (same exclusive
rule as `substring()`).

```java
var sb = new StringBuilder("abcdef");
sb.delete(1, 3);    // removes indexes 1 and 2 ('b','c') → "adef"
sb.deleteCharAt(5); // index 5 doesn't exist (only 4 chars left) → StringIndexOutOfBoundsException
```

`delete()` is forgiving with the end index - if it exceeds the length, Java treats it as
the end of the string:

```java
var sb = new StringBuilder("abcdef");
sb.delete(1, 100); // only 6 chars, but 100 is accepted → "a"
```

---

#### `replace(int startIndex, int endIndex, String newString)`

Deletes from `startIndex` to `endIndex` (exclusive), then inserts `newString` at
`startIndex`. The replacement does not have to be the same length as what was deleted.

```java
var builder = new StringBuilder("pigeon dirty");
builder.replace(3, 6, "sty");
System.out.println(builder); // pigsty dirty
// deleted indexes 3,4,5 ("eon") → "pig dirty"
// inserted "sty" at index 3   → "pigsty dirty"
```

Like `delete()`, the end index can go past the end of the string:

```java
var builder = new StringBuilder("pigeon dirty");
builder.replace(3, 100, "");
System.out.println(builder); // pig
// deleted from index 3 to end → "pig"
// inserted "" (nothing)       → "pig"
```

---

#### `reverse()`

Reverses the character sequence in place and returns a reference to the same object.

```java
var sb = new StringBuilder("ABC");
sb.reverse();
System.out.println(sb); // CBA
```

---

#### `toString()`

Converts the `StringBuilder` to a regular `String`. Needed when passing the result to a
method that expects a `String`.

```java
var sb = new StringBuilder("ABC");
String s = sb.toString(); // "ABC" as a String
```

`StringBuilder` is used internally for performance (building up a string piece by piece),
then converted to `String` at the end when the final value is needed.


---

### Comparing `equals()` and `==`

##### `==` with StringBuilder - checks reference equality
`==` asks: do these two variables point to the **exact same object in memory**?

```java
var one   = new StringBuilder();
var two   = new StringBuilder();
var three = one.append("a");

System.out.println(one == two);   // false - two separate objects created with new
System.out.println(one == three); // true  - append() returns a reference to the same
                                  //         object, so one and three point to the same thing
```

##### `equals()` with String - checks value equality
`String` has a custom `equals()` that compares the actual characters, not the reference.

```java
var x = "Hello World";
var z = " Hello World".trim();
System.out.println(x.equals(z)); // true - same characters, doesn't matter they are
                                  //        different objects in memory
System.out.println(x == z);      // false - different objects in memory
```

##### `equals()` with StringBuilder - still checks reference equality
The authors of `StringBuilder` did NOT override `equals()`. It inherits the default from
`Object`, which behaves the same as `==`.

```java
var sb1 = new StringBuilder("abc");
var sb2 = new StringBuilder("abc");

System.out.println(sb1.equals(sb2)); // false - different objects, equals() not overridden
System.out.println(sb1 == sb2);      // false - same reason
```

To compare two `StringBuilder` values, convert to `String` first:

```java
System.out.println(sb1.toString().equals(sb2.toString())); // true - String has proper equals()
```

##### `==` between incompatible types - does not compile
The compiler knows that a `String` and a `StringBuilder` can never be the same object
because they are completely different, unrelated types. Using `==` between them is a
compile error.

```java
var name    = "a";
var builder = new StringBuilder("a");
System.out.println(name == builder); // DOES NOT COMPILE
```

Compare this to `equals()`, which takes `Object` and always compiles - it just returns
`false` when the types don't match:

```java
System.out.println(name.equals(builder)); // compiles, returns false
```

##### Summary

| | `String` | `StringBuilder` |
|---|---|---|
| `==` | reference equality | reference equality |
| `equals()` | **value equality** (overridden) | reference equality (not overridden) |
| comparing values | use `equals()` | convert with `toString()`, then use `equals()` |


---

### The String Pool

Java reuses `String` literals to save memory. The **string pool** (also called the intern
pool) is a location in the JVM where literal strings are stored and shared.

- **String literals** and **compile-time constants** go into the pool automatically.
- Strings computed at **runtime** (via methods, `new String()`, `+=`, etc.) do not.

##### Same literal - same object

```java
var x = "Hello World";
var y = "Hello World";
System.out.println(x == y); // true - same pool entry, same reference
```

The JVM sees the same literal twice and reuses the one object already in the pool.

##### Runtime computation - new object outside the pool

```java
var x = "Hello World";
var z = " Hello World".trim(); // trim() is a method call - computed at runtime
System.out.println(x == z);   // false - z is a new object outside the pool
```

```java
var singleString = "hello world";
var concat = "hello ";
concat += "world";             // += creates a new String at runtime
System.out.println(singleString == concat); // false
```

##### `new String()` - forces a new object even for literals

```java
var x = "Hello World";
var y = new String("Hello World"); // explicitly bypasses the pool
System.out.println(x == y); // false - y is a brand new object
```

##### `intern()` - force pool lookup

```java
public String intern()
```

Tells Java: "look in the pool for a string with this value; use it if found, add it if not."

```java
var name  = "Hello World";
var name2 = new String("Hello World").intern(); // created with new, then interned
System.out.println(name == name2); // true - intern() returned the existing pool reference
```

##### Compile-time constants - the tricky exam case

A **compile-time constant** is an expression whose value Java can fully resolve while
compiling, before the program runs. These go into the pool automatically.

```java
var first  = "rat" + 1;                    // compile-time: "rat1" → goes into pool
var second = "r" + "a" + "t" + "1";        // compile-time: "rat1" → same pool entry
var third  = "r" + "a" + "t" + new String("1"); // runtime: new String() breaks it

System.out.println(first == second);        // true  - same pool entry
System.out.println(first == second.intern());// true  - intern() finds the same pool entry
System.out.println(first == third);         // false - third is outside the pool
System.out.println(first == third.intern()); // true  - intern() finds "rat1" in pool
```

- `first` and `second`: all operands are literals or constants → Java resolves both to
  `"rat1"` at compile time → same pool object → `==` is `true`.
- `third`: `new String("1")` is a constructor call → happens at runtime → Java can no
  longer resolve the whole expression at compile time → new object outside the pool →
  `==` is `false`.
- `third.intern()`: scans the pool for `"rat1"`, finds the entry already placed there by
  `first`, returns that reference → `==` with `first` is `true`.

**The rule:** any `new String(...)`, method call, or `+=` breaks compile-time constant
status and creates a new object outside the pool. Pure literal + literal (or literal +
number) stays in the pool.

> Never use `intern()` or `==` to compare strings in real code. Use `equals()`.
> These concepts exist only for the exam.


##### Compile-time vs runtime - quick reference

| Expression | Compile-time or Runtime? | Goes into pool? |
|---|---|---|
| `"hello"` | compile-time | yes |
| `"hel" + "lo"` | compile-time | yes |
| `"rat" + 1` | compile-time | yes |
| `"a" + "b" + "c" + "d"` | compile-time | yes |
| `new String("hello")` | runtime | no |
| `"hello".trim()` | runtime | no |
| `" hello".trim()` | runtime | no |
| `str + "world"` (where `str` is a variable) | runtime | no |
| `concat += "world"` | runtime | no |
| `"r" + "a" + "t" + new String("1")` | runtime (new String breaks it) | no |
| `new String("hello").intern()` | runtime, but intern() fetches pool entry | yes (returns pool ref) |


---

### Arrays

##### What is an array?
An array is a fixed-size, ordered container stored on the heap that holds multiple values
of the same type. It can contain duplicates. Each value sits at a numbered position
(index), starting at 0.

##### Three things to separate in your head

```java
char[] letters;
```

| Part | What it is | Primitive or object? |
|---|---|---|
| `char` | the type of each **element** stored inside | primitive |
| `[]` | means "array of" - read it as "array" | - |
| `letters` | a **reference variable** pointing to the array object on the heap | reference |

The array itself is an **object** (lives on the heap, accessed via a reference).
What it holds (`char`) is a **primitive**. These are two separate things.

##### Why arrays exist - the connection to String and StringBuilder
- `String` is implemented internally as a `char[]` with useful methods wrapped around it.
- `StringBuilder` is also implemented as a `char[]`, but it replaces itself with a larger
  array when it runs out of space (which is why it can grow).
- You could technically work with `char[]` directly, but you'd lose everything `String`
  gives you - like writing `"Java"` as a literal, or calling `toUpperCase()`, etc.

In practice you use `String` or `StringBuilder`. But understanding that they sit on top
of arrays is useful background for what follows.

##### Arrays are not limited to char
An array can hold any Java type - primitives or objects:

```java
int[]    numbers;    // array of ints
String[] names;      // array of String objects
double[] prices;     // array of doubles
```


---

#### Creating an Array of Primitives

```java
int[] numbers = new int[3];
```

Creates an `int` array of size 3. All elements default to `0` (the default for `int`).
`numbers` is a reference variable pointing to the array object on the heap.

```
index:    0    1    2
value:    0    0    0
```

##### Specifying initial values

```java
int[] moreNumbers = new int[]{42, 55, 99};  // explicit form
int[] moreNumbers = {42, 55, 99};           // anonymous array - shortcut
```

Both create a size-3 array with values `42`, `55`, `99`. The shortcut (anonymous array)
is allowed because Java already knows the type (from the left side) and the size (from the
number of values listed).

```
index:    0     1     2
value:    42    55    99
```

##### Bracket placement - all five are identical

```java
int[] numAnimals;
int [] numAnimals2;
int []numAnimals3;
int numAnimals4[];
int numAnimals5 [];
```

All declare an `int[]` variable. The `[]` can go after the type or after the variable name,
with or without a space. Use the first form in your own code. The exam may show any of them.

##### Multiple variables in one declaration - the trap

```java
int[] ids, types;   // BOTH are int[] - brackets before names, applies to all
int ids[], types;   // ids is int[], types is plain int - brackets on ids name only
```

When `[]` comes before the variable names, it applies to all variables on the line.
When `[]` comes after a specific variable name, it only applies to that variable.

Java reads `int ids[], types;` as:
- base type: `int`
- first variable: name is `ids`, has `[]` attached → type is `int[]`
- second variable: name is `types`, no `[]` → type is `int`

**Are `[]` part of the variable name?** No. `[]` is type syntax, not part of the name.
The variable name is still `ids`. You cannot use `[]` in a name anywhere else in code.


---

#### Creating an Array with Reference Variables

Arrays can hold any type, including objects like `String`.

```java
String[] bugs  = { "cricket", "beetle", "ladybug" };
String[] alias = bugs;

System.out.println(bugs.equals(alias)); // true  - reference equality (same object)
System.out.println(bugs.toString());    // [Ljava.lang.String;@160bc7c0
```

- `equals()` on arrays checks **reference equality**, not element equality. It does not
  compare the contents. `bugs.equals(alias)` is `true` because both variables point to
  the same array object.
- `toString()` on an array prints a cryptic string (`[L` = array, then the type, then the
  hash code). To print the contents nicely, use `Arrays.toString(bugs)` → `[cricket, beetle, ladybug]`.
- An array is always an **object** even if it holds primitives. `int[]` is a reference type.

##### What the array actually stores
An array of objects does not store the objects themselves - it stores **references** to
where the objects live on the heap. Each slot holds a pointer, not the value directly.

```
bugs
  [0] → "cricket"
  [1] → "beetle"
  [2] → "ladybug"
```

##### Uninstantiated array - review from Ch1

```java
class Names {
    String names[];           // null - reference variable declared but never instantiated
}

class Names {
    String names[] = new String[2]; // array of size 2, both slots are null
                                    // null means the slot exists but points to nothing yet
}
```

##### Casting arrays

```java
String[] strings      = { "stringValue" };  // String[]
Object[] objects      = strings;             // no cast needed - Object is broader than String
String[] againStrings = (String[]) objects;  // cast needed - moving to more specific type
againStrings[0] = new StringBuilder();       // DOES NOT COMPILE - String[] only holds Strings
objects[0]      = new StringBuilder();       // compiles, but throws at runtime!
```

##### Why `objects[0] = new StringBuilder()` throws at runtime

The compiler sees `objects` as `Object[]` and `StringBuilder` as an `Object` - looks
valid. It allows it.

But at runtime, Java checks what the array **actually is** in memory. It was created as
a `String[]` on line 1 and never changed. `objects` is just an `Object[]` lens looking
at that same `String[]`. When Java tries to store a `StringBuilder` into a `String[]`,
it finds the types are incompatible and throws `ArrayStoreException`.

**The rule:** The actual type of the array (set at creation time) is enforced at runtime,
regardless of what reference type you use to access it. You can view a `String[]` through
an `Object[]` variable, but you can never store a non-`String` into it.

The compiler cannot catch this because it only knows the declared type (`Object[]`), not
the actual runtime type (`String[]`). The check happens at runtime when the store occurs.

##### What actually happens when you assign a subtype to a broader type

This is the part that makes the exception confusing. Let's trace it step by step.

```java
String[] strings = { "stringValue" };  // one String[] object created in memory
Object[] objects = strings;            // objects now points to that SAME String[] object
```

After line 2, there is still only **one array object** in memory. No new array was created.
`objects` and `strings` are two different variable names pointing to the exact same object.

Think of it like a nickname. The array's real identity is `String[]`. You gave it a second
nickname `objects` of type `Object[]`. But the array didn't change. It is still a `String[]`
underneath.

```
Memory:
  One array object: String[] { "stringValue" }
                        ^               ^
                        |               |
                     strings          objects
                   (String[] ref)   (Object[] ref)
                   both point to the same object
```

Now when you do:
```java
objects[0] = new StringBuilder();
```

The compiler thinks: "`objects` is `Object[]`, `StringBuilder` is an `Object`, this is fine."
But at runtime Java looks at the actual array object and sees it is a `String[]`. It checks:
"can I store a `StringBuilder` into a `String[]`?" - No. Throws `ArrayStoreException`.

**The key insight:** assigning a subtype array (`String[]`) to a broader type variable
(`Object[]`) does NOT create a new array or change the array's type. It only gives you
a second variable with a broader declared type. The array's actual identity never changes.
This is why the store check at runtime catches what the compiler missed.

---

#### Using an Array

```java
String[] mammals = {"monkey", "chimp", "donkey"};
System.out.println(mammals.length); // 3  - note: no parentheses, length is a field not a method
System.out.println(mammals[0]);     // monkey
System.out.println(mammals[1]);     // chimp
System.out.println(mammals[2]);     // donkey
```

- `length` is a **field**, not a method. `mammals.length()` does not compile.
- Indexes start at 0. Valid indexes: `0` to `length - 1`.
- `length` counts allocated slots, not filled ones:

```java
var birds = new String[6];
System.out.println(birds.length); // 6 - all six slots are null, but 6 slots exist
```

##### Common loop pattern

```java
var numbers = new int[10];
for (int i = 0; i < numbers.length; i++)
    numbers[i] = i + 5;
```

##### `ArrayIndexOutOfBoundsException` traps

```java
numbers[10] = 3;               // invalid - valid range is 0-9
numbers[numbers.length] = 5;   // invalid - length is 10, so this is index 10
for (int i = 0; i <= numbers.length; i++)  // invalid - <= should be <
    numbers[i] = i + 5;
```

All three throw `ArrayIndexOutOfBoundsException`. The max valid index is always
`length - 1`.

---

#### Sorting - `Arrays.sort()`

Requires import: `import java.util.Arrays;` or `import java.util.*;`

```java
int[] numbers = {6, 9, 1};
Arrays.sort(numbers);
System.out.println(Arrays.toString(numbers)); // [1, 6, 9]
```

**Strings sort alphabetically, not numerically:**

```java
String[] strings = {"10", "9", "100"};
Arrays.sort(strings);
System.out.println(Arrays.toString(strings)); // [10, 100, 9]
```

`"1"` comes before `"9"` alphabetically, so `"10"` and `"100"` sort before `"9"`.
Numbers sort before letters, uppercase sorts before lowercase.

---

#### Searching - `Arrays.binarySearch()`

Only works correctly on a **sorted** array. On an unsorted array the result is undefined.

| Scenario | Return value |
|---|---|
| Element found | index of the match |
| Element not found | `-(insertion point) - 1` |
| Unsorted array | undefined - unpredictable output |

The insertion point is the index where the element would need to go to keep the array sorted.

```java
int[] numbers = {2, 4, 6, 8};
System.out.println(Arrays.binarySearch(numbers, 2)); //  0  found at index 0
System.out.println(Arrays.binarySearch(numbers, 4)); //  1  found at index 1
System.out.println(Arrays.binarySearch(numbers, 1)); // -1  not found; would insert at 0 → -(0)-1 = -1
System.out.println(Arrays.binarySearch(numbers, 3)); // -2  not found; would insert at 1 → -(1)-1 = -2
System.out.println(Arrays.binarySearch(numbers, 9)); // -5  not found; would insert at 4 → -(4)-1 = -5
```

If you see an unsorted array with `binarySearch()` on the exam, immediately look for
an answer that says "unpredictable/undefined output."

---

#### Comparing - `Arrays.compare()`

Compares two arrays of the same type. Returns:
- negative → first array is smaller
- zero → arrays are equal
- positive → first array is larger

Arrays must be the same type or the code does not compile:
```java
Arrays.compare(new int[]{1}, new String[]{"a"}); // DOES NOT COMPILE
```

**Rules for comparing elements:**
- `null` is smaller than any other value
- Numbers use normal numeric order
- For strings: a prefix is smaller than the longer string (`"a"` < `"aa"`)
- Numbers sort before letters (`"1"` < `"a"`)
- Uppercase is smaller than lowercase (`"A"` < `"a"`)

**Rules for comparing arrays of different lengths:**
- All elements same, second array longer → negative (first is smaller)
- All elements same, first array longer → positive (first is larger)
- First differing element decides the result using the element rules above

```java
// same elements, first array longer → positive
Arrays.compare(new int[]{1, 2}, new int[]{1}); // positive

// exact match → zero
Arrays.compare(new int[]{1, 2}, new int[]{1, 2}); // 0

// "a" is a prefix of "aa" → "a" is smaller → negative
Arrays.compare(new String[]{"a"}, new String[]{"aa"}); // negative

// "A" is uppercase, "a" is lowercase → uppercase smaller → "a" is larger → positive
Arrays.compare(new String[]{"a"}, new String[]{"A"}); // positive

// null is smaller than "a" → "a" is larger → positive
Arrays.compare(new String[]{"a"}, new String[]{null}); // positive
```

##### The uppercase/lowercase and prefix rules with more examples

```java
// uppercase < lowercase
Arrays.compare(new String[]{"A"}, new String[]{"a"}); // negative - "A" is smaller
Arrays.compare(new String[]{"a"}, new String[]{"A"}); // positive - "a" is larger

// prefix rule - shorter string is smaller if it matches the start of the longer one
Arrays.compare(new String[]{"hi"}, new String[]{"hi!"}); // negative - "hi" is a prefix
Arrays.compare(new String[]{"hi!"}, new String[]{"hi"});  // positive - "hi!" is longer

// number characters sort before letter characters
Arrays.compare(new String[]{"1"}, new String[]{"a"}); // negative - "1" < "a"
Arrays.compare(new String[]{"a"}, new String[]{"1"}); // positive - "a" > "1"

// null is smaller than everything
Arrays.compare(new String[]{null}, new String[]{"a"}); // negative - null is smaller
Arrays.compare(new String[]{"a"}, new String[]{null}); // positive - "a" is larger

// when neither string is a prefix of the other, compare character by character
// from left to right - the first character that differs decides the whole result
Arrays.compare(new String[]{"abc"}, new String[]{"efg"}); // negative - 'a' < 'e', done
Arrays.compare(new String[]{"efg"}, new String[]{"abc"}); // positive - 'e' > 'a', done
Arrays.compare(new String[]{"abc"}, new String[]{"abd"}); // negative - first two chars match,
                                                           //            'c' < 'd' decides it
Arrays.compare(new String[]{"xyz"}, new String[]{"aaa"}); // positive - 'x' > 'a', done
```

Everything after the first differing character is ignored entirely.

---

#### `Arrays.mismatch()`

Returns the index of the first element where two arrays differ.
Returns `-1` if the arrays are equal.

```java
Arrays.mismatch(new int[]{1}, new int[]{1});           // -1  - arrays are equal
Arrays.mismatch(new String[]{"a"}, new String[]{"A"}); //  0  - differ at index 0
Arrays.mismatch(new int[]{1, 2}, new int[]{1});        //  1  - match at 0, differ at 1
                                                        //       (second array has no element 1)
```

##### Summary table

| Method | Arrays equal | Arrays different |
|---|---|---|
| `equals()` | `true` | `false` |
| `compare()` | `0` | positive or negative number |
| `mismatch()` | `-1` | index of first difference (0 or positive) |

---

#### Varargs - `String... args`

**Varargs** (variable arguments) is a method parameter syntax that lets the caller pass
any number of values of the same type without explicitly creating an array.

```java
public static void main(String[] args)   // regular array parameter
public static void main(String... args)  // varargs - behaves identically inside the method
```

Inside the method, a varargs parameter **is** a regular array. You use it exactly the same
way - `args.length`, `args[0]`, for loops, etc.

```java
static void printAll(String... words) {
    System.out.println(words.length); // works - it's just a String[]
    System.out.println(words[0]);     // works
}

// caller can pass values directly - Java packages them into a String[] automatically
printAll("hello", "world", "java");

// caller can also pass an array directly
printAll(new String[]{"hello", "world"});
```

The `...` only affects how the **caller** passes values. Inside the method there is no
difference - it is always a regular array.


---

#### Multidimensional Arrays

A 2D array is not a grid with coordinate pairs - it is an **array of arrays**. Each slot in
the outer array points to a separate inner array.

##### Declaring

```java
int[][] vars1;          // 2D array
int vars2[][];          // 2D array - same thing
int[] vars3[];          // 2D array - confusing style, avoid
int[] vars4[], space[][];  // vars4 is 2D, space is 3D - on the same line
```

Count the `[]` pairs to determine the number of dimensions. The exam uses the confusing
styles to trip you up.

##### Creating

```java
String[][] rectangle = new String[3][2];
```

This creates:
- 1 outer array with 3 slots
- each slot points to an inner array with 2 slots
- all values default to `null`

```
rectangle
  [0] → [ null | null ]
  [1] → [ null | null ]
  [2] → [ null | null ]
```

##### Accessing

```java
rectangle[0][1] = "set";
```

- `rectangle[0]` → gets the first inner array
- `[1]` → gets the second slot of that inner array
- stores `"set"` there

```
rectangle
  [0] → [ null | "set" ]
  [1] → [ null | null  ]
  [2] → [ null | null  ]
```

You always do two separate lookups. There is no coordinate pair syntax like `[0, 1]` in
Java - that does not exist.

##### Asymmetric (jagged) arrays
The inner arrays don't have to be the same size. You can create them individually:

```java
int[][] jagged = new int[3][];  // outer array has 3 slots, inner arrays not created yet
jagged[0] = new int[2];         // first row has 2 elements
jagged[1] = new int[4];         // second row has 4 elements
jagged[2] = new int[1];         // third row has 1 element
```

```
jagged
  [0] → [ 0 | 0 ]
  [1] → [ 0 | 0 | 0 | 0 ]
  [2] → [ 0 ]
```



---

#### Looping Through a Multidimensional Array

The most common operation on a 2D array is iterating through every element with nested loops.

##### Traditional for loop

```java
var twoD = new int[3][2];

for (int i = 0; i < twoD.length; i++) {
    for (int j = 0; j < twoD[i].length; j++)
        System.out.print(twoD[i][j] + " "); // print each element
    System.out.println();                    // new line after each row
}
```

Two key points:
- The outer loop uses `twoD.length` - the number of rows (inner arrays) in the outer array.
- The inner loop uses `twoD[i].length` - the number of elements in **that specific row**.
  This matters for jagged arrays where rows can have different lengths.
- Use different variable names (`i` and `j`) for each loop. Reusing the same name would
  make the inner loop overwrite the outer loop's counter.

Output for a default `int[3][2]` (all zeros):
```
0 0 
0 0 
0 0 
```

##### Enhanced for loop (cleaner)

```java
for (int[] inner : twoD) {
    for (int num : inner)
        System.out.print(num + " ");
    System.out.println();
}
```

Same output, but simpler to read:
- No index variables, no terminating conditions to get wrong.
- The outer loop gives you each row as an `int[]`.
- The inner loop gives you each element in that row as an `int`.

The enhanced for loop is preferred whenever you just need to read every element and don't
need the index for anything else.


---

### Calculating with Math APIs

Java's `Math` class is in `java.lang` - no import needed. All methods are `static`, so
you always call them as `Math.methodName(...)`.

---

#### `Math.min()` / `Math.max()`

Return the smaller or larger of two values respectively.

```java
public static int    min(int a,    int b)
public static long   min(long a,   long b)
public static float  min(float a,  float b)
public static double min(double a, double b)
// max() has the exact same four overloads
```

Each overload takes **two values of the same type** and returns that same type.
There is no single method that takes mixed types - Java picks the overload via the normal
numeric promotion rules (e.g. passing an `int` and a `double` promotes both to `double`).

```java
int    a = Math.max(3, 7);      // 7    - larger of 3 and 7
int    b = Math.min(7, -9);     // -9   - smaller of 7 and -9 (negatives are always smaller)
double c = Math.max(1.5, 1.9);  // 1.9
double d = Math.min(1.5, 1.9);  // 1.5
long   e = Math.max(100L, 50L); // 100L
```

##### The "only two arguments" rule - why this matters on the exam

Each method takes **exactly two** values. There is no `Math.max(1, 2, 3)`.
To find the max/min of more than two values, chain the calls:

```java
// largest of three values
int biggest = Math.max(Math.max(10, 25), 7);
// step 1: Math.max(10, 25) = 25
// step 2: Math.max(25, 7)  = 25
System.out.println(biggest); // 25

// smallest of four values
int smallest = Math.min(Math.min(4, 8), Math.min(1, 6));
// step 1: Math.min(4, 8) = 4
// step 2: Math.min(1, 6) = 1
// step 3: Math.min(4, 1) = 1
System.out.println(smallest); // 1
```

##### Mixed types - what happens

Passing two different numeric types triggers numeric promotion. Both values are promoted
to the wider type, and the wider overload is used:

```java
// int + double → both promoted to double → Math.max(double, double) used
double result = Math.max(3, 7.5);  // 7.5

// int + long → both promoted to long → Math.min(long, long) used
long result2 = Math.min(5, 10L);   // 5L
```

The exam may ask about the **return type** when mixed types are involved. The return type
matches the overload selected after promotion - not the original types you passed.

```java
// What is the type of result?
var result = Math.min(3, 7.0); // double - not int, because 3 was promoted to double
```

##### Negative numbers - common trap

Negative numbers are always less than positive ones:

```java
Math.min(0, -1);   // -1  - zero is larger than -1
Math.max(-5, -10); // -5  - -5 is closer to zero, so it's larger
Math.min(-5, -10); // -10 - further from zero = smaller
```

Think of a number line: numbers to the left are smaller. `-10` is to the left of `-5`.

```
← smaller              larger →
... -10  -5  -1  0  1  5  10 ...
```

---

#### `Math.round()`

Rounds a decimal number to the nearest whole number and returns it as an integer type.

```java
public static long round(double num)
public static int  round(float num)
```

**The return type depends on what you pass in:**
- Pass a `double` → returns `long`
- Pass a `float` → returns `int`

This exists because `double` has a larger range than `float`, so its rounded result needs
a `long` to guarantee it fits.

##### Rounding rules

| Fractional part | Action | Example |
|---|---|---|
| less than `.5` | round **down** (drop the decimal) | `1.4` → `1` |
| exactly `.5` | round **up** | `1.5` → `2` |
| more than `.5` | round **up** | `1.6` → `2` |

"Round up" means toward positive infinity - it always goes to the next higher integer,
not just "away from zero". This matters for negative numbers (see below).

```java
long a = Math.round(123.45);  // 123 - .45 < .5, round down
long b = Math.round(123.50);  // 124 - .50 == .5, round up
long c = Math.round(123.51);  // 124 - .51 > .5, round up
long d = Math.round(123.99);  // 124 - .99 > .5, round up

int e = Math.round(123.45f);  // 123 - float passed -> int returned
int f = Math.round(123.50f);  // 124 - float passed -> int returned
```

##### Negative numbers - the trap

"Round up" means toward positive infinity, not away from zero.
For negative numbers this can feel backwards:

```java
long g = Math.round(-123.45); // -123 - .45 < .5, round up (toward zero for negatives)
long h = Math.round(-123.50); // -123 - exactly .5, round up (toward positive infinity)
long i = Math.round(-123.51); // -124 - .51 > .5, round down (away from zero)
```

Visualised on a number line:

```
← smaller                             larger →
...  -124  [-123.51]  -123.50  [-123.45]  -123  ...
                ↓          ↓        ↓
              -124        -123    -123
```

`-123.45` rounds to `-123` (the higher number), and `-123.50` also rounds to `-123`
(the rule is "at exactly .5, go up", and up = toward positive infinity).

##### Return type trap on the exam

```java
long result1 = Math.round(9.5);   // fine  - double -> long
int  result2 = Math.round(9.5f);  // fine  - float  -> int
int  result3 = Math.round(9.5);   // DOES NOT COMPILE - double -> long, can't fit in int
long result4 = Math.round(9.5f);  // fine  - int widens to long automatically
```

Line 3 is the exam trap: `9.5` is a `double` literal, so `round()` returns `long`.
Assigning a `long` directly to an `int` without a cast does not compile.

---

#### `Math.ceil()` / `Math.floor()`

```java
public static double ceil(double num)
public static double floor(double num)
```

Both always return a `double` - even though the result is always a whole number, the
decimal `.0` is still there.

- `ceil()` - always rounds **up** to the next whole number. If already whole, returns as-is.
- `floor()` - always rounds **down** by dropping everything after the decimal. If already whole, returns as-is.

```java
double a = Math.ceil(3.14);  // 4.0 - any fraction, go up to next whole number
double b = Math.ceil(3.9);   // 4.0 - doesn't matter how big the fraction is, still just +1
double c = Math.ceil(3.0);   // 3.0 - already whole, no change

double d = Math.floor(3.14); // 3.0 - drop the fraction entirely
double e = Math.floor(3.9);  // 3.0 - even .9 is dropped, floor always goes down
double f = Math.floor(3.0);  // 3.0 - already whole, no change
```

##### Negative numbers

The "up" and "down" directions are always toward positive or negative infinity on the
number line - not toward or away from zero:

```java
Math.ceil(-3.14);  // -3.0 - up means toward positive infinity, so -3 (not -4)
Math.floor(-3.14); // -4.0 - down means toward negative infinity, so -4 (not -3)
```

```
← smaller (negative infinity)      larger (positive infinity) →
...  -4   [-3.14]   -3   ...   3   [3.14]   4  ...
           ↓    ↓                  ↓    ↓
         -4.0  -3.0              3.0   4.0
        floor  ceil             floor  ceil
```

##### `ceil` / `floor` vs `round` - the key difference

| Method | Behaviour |
|---|---|
| `Math.ceil()` | always goes **up**, no matter how small the fraction |
| `Math.floor()` | always goes **down**, no matter how large the fraction |
| `Math.round()` | goes up only if fraction is `.5` or higher, otherwise down |

```java
Math.ceil(3.1);  // 4.0 - ceil goes up regardless
Math.floor(3.9); // 3.0 - floor goes down regardless
Math.round(3.1); // 3   - round stays down (.1 < .5)
Math.round(3.9); // 4   - round goes up   (.9 >= .5)
```

Also note: `ceil` and `floor` return `double`. `round` returns `long` or `int`.


---

#### `Math.pow()`

```java
public static double pow(double number, double exponent)
```

Raises `number` to the power of `exponent`. Always returns `double`.

```java
double squared = Math.pow(5, 2);   // 25.0  - 5² = 5 * 5
double cubed   = Math.pow(3, 3);   // 27.0  - 3³ = 3 * 3 * 3
double root    = Math.pow(16, 0.5);// 4.0   - 16^0.5 = square root of 16
double any     = Math.pow(5, 1);   // 5.0   - anything to the power of 1 is itself
double zero    = Math.pow(5, 0);   // 1.0   - anything to the power of 0 is 1
```

The result is always `double` - even `Math.pow(5, 2)` returns `25.0`, not `25`.

---

#### `Math.random()`

```java
public static double random()
```

Returns a random `double` in the range **`[0.0, 1.0)`** - meaning:
- `0.0` is possible (inclusive)
- `1.0` is never returned (exclusive)

```java
double num = Math.random(); // e.g. 0.372941...
```

##### The exact range - exam rules

| Value | Possible? | Why |
|---|---|---|
| `0.0` | yes | lower bound is inclusive |
| `0.999...` | yes | less than 1.0 |
| `1.0` | **no** | upper bound is exclusive |
| any negative | **no** | range starts at 0.0 |

> `Random` class (`java.util.Random`) is more flexible and common in real code, but it is
> not on the exam.

---

#### Math API - full summary

| Method | Parameter(s) | Returns | What it does |
|---|---|---|---|
| `Math.min(a, b)` | two of same type | same type | smaller of the two |
| `Math.max(a, b)` | two of same type | same type | larger of the two |
| `Math.round(n)` | `double` / `float` | `long` / `int` | nearest whole number (.5 rounds up) |
| `Math.ceil(n)` | `double` | `double` | always rounds up |
| `Math.floor(n)` | `double` | `double` | always rounds down |
| `Math.pow(n, e)` | two `double`s | `double` | n raised to the power e |
| `Math.random()` | none | `double` | random value in `[0.0, 1.0)` |
