# Chapter 11 - Exceptions, Formatting, and Localization: Review Questions
Date: 2026-10-17
Score: 20 / 26 (77%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | A, C, D, E  | A, C, D, E     | correct |
| 2  | F           | F              | correct |
| 3  | A, D, E     | A, D, E        | correct |
| 4  | E           | E              | correct |
| 5  | C, F        | C, F           | correct |
| 6  | E           | E              | correct |
| 7  | C           | E              | wrong   |
| 8  | C           | C              | correct |
| 9  | B           | D              | wrong   |
| 10 | B           | B              | correct |
| 11 | B, E, F     | B, E, F        | correct |
| 12 | B, C        | B, C           | correct |
| 13 | A, B        | A, B           | correct |
| 14 | A           | C              | wrong   |
| 15 | C, D        | C, D           | correct |
| 16 | F           | F              | correct |
| 17 | D, F        | D, F           | correct |
| 18 | C           | C              | correct |
| 19 | D           | D              | correct |
| 20 | E           | G              | wrong   |
| 21 | C           | C              | correct |
| 22 | G           | B              | wrong   |
| 23 | A, E        | A, E           | correct |
| 24 | G           | G              | correct |
| 25 | A           | A              | correct |
| 26 | A, B, C, F  | B, F           | wrong   |

---

## All Questions and Reasoning

### Q1 | Which of the following can be inserted on line 8 to make this code compile? (Choose all that apply.)

```java
7: public void whatHappensNext() throws IOException {
8: // INSERT CODE HERE
9: }
```

A. `System.out.println("it's ok");`
B. `throw new Exception();`
C. `throw new IllegalArgumentException();`
D. `throw new java.io.IOException();`
E. `throw new RuntimeException();`
F. None of the above

Your reasoning: A is fine since declaring a checked exception does not require throwing one. C and E are unchecked so they can go anywhere. D matches the declared exception. B is broader than `IOException` so it is not allowed.
Your answer: A, C, D, E
Correct answer: **A, C, D, E**

Correct. A method that declares a checked exception is not required to throw it, so A is valid. Unchecked exceptions (`IllegalArgumentException`, `RuntimeException`) can be thrown from any method without being declared, so C and E are valid. D matches the declared type exactly, so it is valid. B fails because `Exception` is broader than `IOException` -- you can only throw the declared exception or a subclass of it.

---

### Q2 | Which statement about the following class is correct?

```java
1: class Problem extends Exception {
2:     public Problem() {}
3: }
4: class YesProblem extends Problem {}
5: public class MyDatabase {
6:     public static void connectToDatabase() throw Problem {
7:         throws new YesProblem();
8:     }
9:     public static void main(String[] c) throw Exception {
10:         connectToDatabase();
11:     }
12: }
```

A. The code compiles and prints a stack trace for YesProblem at runtime.
B. The code compiles and prints a stack trace for Problem at runtime.
C. The code does not compile because Problem defines a constructor.
D. The code does not compile because YesProblem does not define a constructor.
E. The code does not compile but would if Problem and YesProblem were switched on lines 6 and 7.
F. None of the above

Your reasoning: `throw` and `throws` are swapped on lines 6, 7, and 9 -- `throws` belongs in method signatures and `throw` belongs inside the method body. This is a compile error. F is correct.
Your answer: F
Correct answer: **F**

Correct. Lines 6, 7, and 9 all have the keywords backwards. `throws` is used in method declarations; `throw` is used inside method bodies to actually throw an exception. If the keywords were corrected, the rest of the code would compile and print a `YesProblem` stack trace at runtime since `YesProblem` is a subclass of `Problem` and is valid to throw.

---

### Q3 | Which of the following are common types to localize? (Choose all that apply.)

A. Dates
B. Lambda expressions
C. Class names
D. Currency
E. Numbers
F. Variable names

Your reasoning: Localization applies to user-facing output. Dates, currency, and numbers all display differently by region. Lambda expressions, class names, and variable names are internal to the code and never shown to users.
Your answer: A, D, E
Correct answer: **A, D, E**

Correct. Localization deals with what is displayed to users. Dates, currency, and numbers have region-specific formats. Lambda expressions, class names, and variable names are part of the source code and are never localized.

---

### Q4 | What is the output of the following snippet, assuming `a` and `b` are both `0`?

```java
3: try {
4:     System.out.print(a / b);
5: } catch (RuntimeException e) {
6:     System.out.print(-1);
7: } catch (ArithmeticException e) {
8:     System.out.print(0);
9: } finally {
10:     System.out.print("done");
11: }
```

A. -1
B. 0
C. done-1
D. done0
E. The code does not compile.
F. An uncaught exception is thrown.
G. None of the above

Your reasoning: `ArithmeticException` is a subclass of `RuntimeException`. Putting `RuntimeException` first in the catch chain makes the `ArithmeticException` catch block unreachable -- a compile error.
Your answer: E
Correct answer: **E**

Correct. Catch blocks must be ordered from most specific to most general. `ArithmeticException` is a subclass of `RuntimeException`. Because `RuntimeException` appears first, `ArithmeticException` can never be reached -- the compiler flags this as an error.

---

### Q5 | Assuming the current locale uses dollars ($) and the following method is called with `100_102.2`, which values are printed? (Choose all that apply.)

```java
public void print(double t) {
    System.out.print(NumberFormat.getCompactNumberInstance().format(t));
    System.out.print(
        NumberFormat.getCompactNumberInstance(
            Locale.getDefault(), Style.SHORT).format(t));
    System.out.print(NumberFormat.getCurrencyInstance().format(t));
}
```

A. 100
B. $100,000.00
C. 100K
D. 100 thousand
E. 100M
F. $100,102.20

Your reasoning: the first two calls are equivalent because the default style is `SHORT` and the default locale is already the default. Both print `100K`. The currency formatter prints the full value: `$100,102.20`.
Your answer: C, F
Correct answer: **C, F**

Correct. `getCompactNumberInstance()` with no arguments defaults to `Style.SHORT`, which is identical to passing `Locale.getDefault(), Style.SHORT` explicitly. Both print `100K`. `getCurrencyInstance()` does not abbreviate -- it formats the full value with the currency symbol and two decimal places: `$100,102.20`. `100 thousand` would require `Style.LONG`.

---

### Q6 | What is the output of the following code?

```java
LocalDate date = LocalDate.parse("2022-04-30",
    DateTimeFormatter.ISO_LOCAL_DATE_TIME);
System.out.println(date.getYear() + " "
    + date.getMonth() + " " + date.getDayOfMonth());
```

A. 2022 APRIL 2
B. 2022 APRIL 30
C. 2022 MAY 2
D. The code does not compile.
E. A runtime exception is thrown.

Your reasoning: `ISO_LOCAL_DATE_TIME` is a date-time formatter, not a date formatter. `LocalDate` has no time component, so using that formatter to parse a date-only string throws a runtime exception.
Your answer: E
Correct answer: **E**

Correct. The code compiles because `LocalDate.parse()` accepts a `DateTimeFormatter` parameter -- the compiler has no way to verify compatibility. At runtime, `ISO_LOCAL_DATE_TIME` expects a string that includes a time portion (e.g., `"2022-04-30T11:12:34"`). The string `"2022-04-30"` does not satisfy that format, so a `DateTimeParseException` is thrown. If `ISO_LOCAL_DATE` were used instead, the output would be `2022 APRIL 30`.

---

### !! Q7 - WRONG !!

### Q7 | What does the following method print?

```java
11: public void tryAgain(String s) {
12:     try (FileReader r = null, p = new FileReader("")) {
13:         System.out.print("X");
14:         throw new IllegalArgumentException();
15:     } catch (Exception s) {
16:         System.out.print("A");
17:         throw new FileNotFoundException();
18:     } finally {
19:         System.out.print("O");
20:     }
21: }
```

A. XAO
B. XOA
C. One line of this method contains a compiler error.
D. Two lines of this method contain compiler errors.
E. Three or more lines of this method contain compiler errors.
F. The code compiles, but a NullPointerException is thrown at runtime.
G. None of the above

Your reasoning: the resources on line 12 are separated by a comma but must use their own data type, so that is one compile error.
Your answer: C
Correct answer: **E**

You identified one compile error correctly but missed two others. There are three compile errors total:

1. **Line 12** -- each resource in a try-with-resources statement must declare its own type. `FileReader r = null, p = new FileReader("")` is invalid. It must be `FileReader r = null; FileReader p = new FileReader("")` (semicolon, not comma, and type repeated).
2. **Line 15** -- the catch block parameter is named `s`, but `s` is already declared as a parameter of the enclosing method `tryAgain(String s)`. Variable names cannot be reused in an inner scope when they are already declared in the same method scope.
3. **Line 17** -- `FileNotFoundException` is a checked exception (it extends `IOException` which extends `Exception`). Throwing it inside a catch block requires it to be declared in the method signature or wrapped in another try/catch. The method signature does not declare it.

Because three lines fail to compile, the answer is E.

---

### Q8 | Assume all files exist and define the same keys. Which one will be used to find the key on line 8?

```java
6: Locale.setDefault(new Locale("en", "US"));
7: var b = ResourceBundle.getBundle("Dolphins");
8: System.out.println(b.getString("name"));
```

A. Dolphins.properties
B. Dolphins_US.properties
C. Dolphins_en.properties
D. Whales.properties
E. Whales_en_US.properties
F. The code does not compile.

Your reasoning: `getBundle("Dolphins")` with no locale argument uses the default, which is `en_US`. Java first looks for `Dolphins_en_US`, then `Dolphins_en`, then `Dolphins`. Since they all have the same keys, the most specific match wins: `Dolphins_en`.
Your answer: C
Correct answer: **C**

Correct. Java searches for the most specific match first: `Dolphins_en_US.properties`, then `Dolphins_en.properties`. Both exist and contain the key, but C (`Dolphins_en.properties`) is listed as the answer because `Dolphins_en_US` is not an answer choice -- Java would actually prefer that one if it existed in the option list. B is wrong because `Dolphins_US.properties` is not a valid locale filename -- a country code cannot appear without a language.

---

### !! Q9 - WRONG !!

### Q9 | For what value of `pattern` will the following print `<005.21> <008.49> <1,234.0>`?

```java
String pattern = " ";
var message = DoubleStream.of(5.21, 8.49, 1234)
    .mapToObj(v -> new DecimalFormat(pattern).format(v))
    .collect(Collectors.joining("> <"));
System.out.println("<" + message + ">");
```

A. `##.#`
B. `0,000.0#`
C. `#,###.0`
D. `#,###,000.0#`
E. The code does not compile regardless of what is placed in the blank.
F. None of the above

Your reasoning: the output `005` needs at least three zeros before the decimal, so B looked right because it has `0,000` which would give leading zeros.
Your answer: B
Correct answer: **D**

Your instinct about needing zeros was right, but you picked the wrong pattern. Let's trace both carefully:

Pattern B: `0,000.0#`
- `5.21` -> `0,005.2` (only one digit after decimal printed; `#` omits the trailing `1` -- wait, `5.21` rounds to `5.2` then the `#` would show `1`... actually `5.21` -> `0,005.21` fits, but the grouping separator appears because `0,000` implies groups of thousands. `0,005` would print as `0,005` with B)
- But look at `1234`: pattern `0,000.0#` gives `1,234.0` -- that matches.
- The issue is the output requires `005.21` not `0,005.21`. B produces a comma in `0,005` because the pattern has a grouping separator.

Pattern D: `#,###,000.0#`
- The `000` at the end of the integer portion forces at least three digits. The `#,###` before it omits leading groups if empty.
- `5.21` -> `005.21` (no comma groups needed, three forced zeros give `005`, `.0#` gives `.21`)
- `8.49` -> `008.49`
- `1234` -> `1,234.0` (the thousands group now has a digit, so the comma appears; `.0` forces one decimal, `#` omits the non-existent second decimal)

D is the only pattern that produces exactly three forced leading zeros when the number is small but shows the grouping comma when the number is large enough to need it.

The lesson: `0` forces a digit (padding with zero if needed), `#` omits if no digit. A pattern can mix both to get conditional padding behavior.

---

### Q10 | Which scenario is the best use of an exception?

A. An element is not found when searching a list.
B. An unexpected parameter is passed into a method.
C. The computer caught fire.
D. You want to loop through a list.
E. You don't know how to code a method.

Your reasoning: B describes exactly the scenario for `IllegalArgumentException`. A is better handled by returning `null` or `-1`. D uses a loop, not an exception. E and C are absurd.
Your answer: B
Correct answer: **B**

Correct. `IllegalArgumentException` is the standard exception for invalid method arguments. Returning a sentinel value like `null` or `-1` is the conventional approach for "not found" scenarios (A). Looping (D) and not knowing how to code (E) are not exception scenarios. C is a joke.

---

### Q11 | Which of the following exceptions must be handled or declared? (Choose all that apply.)

```java
class Apple extends RuntimeException {}
class Orange extends Exception {}
class Banana extends Error {}
class Pear extends Apple {}
class Tomato extends Orange {}
class Peach extends Throwable {}
```

A. Apple
B. Orange
C. Banana
D. Pear
E. Tomato
F. Peach

Your reasoning: checked exceptions are those that extend `Exception` but not `RuntimeException`, plus anything extending `Throwable` directly that is not `Error` or `RuntimeException`. `Orange` (extends `Exception`) and `Tomato` (extends `Orange`) are checked. `Peach` extends `Throwable` directly, not through `RuntimeException` or `Error`, so it is also checked. `Apple`, `Pear`, and `Banana` are unchecked.
Your answer: B, E, F
Correct answer: **B, E, F**

Correct. A checked exception is anything that extends `Exception` but not `RuntimeException`, or extends `Throwable` directly without going through `RuntimeException` or `Error`. `Orange` extends `Exception` directly -- checked. `Tomato` extends `Orange` -- inherits the checked nature. `Peach` extends `Throwable` directly, bypassing both `RuntimeException` and `Error` -- also checked. `Apple` and `Pear` are `RuntimeException` subclasses -- unchecked. `Banana` extends `Error` -- unchecked.

---

### Q12 | Which of the following changes, when made independently, would make this code compile? (Choose all that apply.)

```java
1: import java.io.*;
2: public class StuckTurkeyCage implements AutoCloseable {
3:     public void close() throws IOException {
4:         throw new FileNotFoundException("Cage not closed");
5:     }
6:     public static void main(String[] args) {
7:         try (StuckTurkeyCage t = new StuckTurkeyCage()) {
8:             System.out.println("put turkeys in");
9:         }
10:     }
11: }
```

A. Remove `throws IOException` from line 3.
B. Add `throws Exception` to the declaration on line 6.
C. Change line 9 to `} catch (Exception e) {}`.
D. Change line 9 to `} finally {}`.
E. The code compiles as is.
F. None of the above

Your reasoning: the `close()` method can throw a checked exception, which must be handled or declared. Adding `throws` to `main` (B) or adding a `catch` block (C) both solve it.
Your answer: B, C
Correct answer: **B, C**

Correct. The try-with-resources block calls `close()` implicitly, and `close()` declares `throws IOException`. That checked exception must be handled or declared somewhere. B adds `throws Exception` to `main`, which declares it. C adds a catch block that handles it. A is wrong -- removing `throws IOException` from line 3 would cause a compile error on line 4 because `FileNotFoundException` is a checked exception that must be declared. D is wrong -- adding `finally` does not handle or declare the exception from `close()`.

---

### Q13 | Which of the following are true statements about exception handling in Java? (Choose all that apply.)

A. A traditional try statement without a catch block requires a finally block.
B. A traditional try statement without a finally block requires a catch block.
C. A traditional try statement with only one statement can omit the `{}`.
D. A try-with-resources statement without a catch block requires a finally block.
E. A try-with-resources statement without a finally block requires a catch block.
F. A try-with-resources statement with only one statement can omit the `{}`.

Your reasoning: A traditional `try` needs either a `catch` or a `finally` (or both), so A and B are both true. No try block can omit braces. Try-with-resources has an implicit finally block so it needs neither catch nor finally.
Your answer: A, B
Correct answer: **A, B**

Correct. A traditional `try` must have at least one `catch` or one `finally`. Either one alone satisfies the requirement. Try-with-resources automatically provides the resource-closing behavior (the implicit finally), so it needs neither an explicit `catch` nor an explicit `finally`. Braces are always required for any try block.

---

### !! Q14 - WRONG !!

### Q14 | Assuming `-g:vars` is used when compiling, what is the output of the following?

```java
var huey = (String) null;
Integer dewey = null;
Object louie = null;
if (louie == huey.substring(dewey.intValue())) {
    System.out.println("Quack!");
}
```

A. A NullPointerException that does not include any variable names in the stack trace
B. A NullPointerException naming `huey` in the stack trace
C. A NullPointerException naming `dewey` in the stack trace
D. A NullPointerException naming `louie` in the stack trace
E. A NullPointerException naming `huey` and `louie` in the stack trace
F. A NullPointerException naming `huey` and `dewey` in the stack trace
G. None of the above

Your reasoning: both `dewey` and `huey` have methods called on them while null. Java will throw `NullPointerException` for both, so you answered F.
Your answer: A (submitted as A but reasoning pointed to F -- scored as A)
Correct answer: **C**

Your reasoning identified the right variables but drew the wrong conclusion about which one throws first.

Java evaluates expressions left to right, inside out. In `huey.substring(dewey.intValue())`, the argument to `substring` must be evaluated before `substring` itself can be called. So Java evaluates `dewey.intValue()` first. `dewey` is `null`, so this throws `NullPointerException` immediately -- and execution stops here. `huey.substring(...)` is never even reached.

The `-g:vars` flag tells Java to include variable names in NPE stack traces (this is the default from Java 15 onwards). Since `dewey` is the variable that caused the NPE, its name appears in the trace.

The takeaway: when a method call has arguments, the arguments are evaluated first. The NPE hits `dewey` before `huey` ever gets a chance to throw.

---

### Q15 | Which of the following, when inserted into the blank, use locale parameters that are properly formatted? (Choose all that apply.)

```java
public void open() {
    this.locale = _____;
}
```

A. `new Locale("xM")`
B. `new Locale("MQ", "ks")`
C. `new Locale("qw")`
D. `new Locale("wp", "VW")`
E. `Locale.create("zp")`
F. `new Locale.Builder().setLanguage("yw").setRegion("PM")`
G. The code does not compile regardless of what is placed in the blank.

Your reasoning: language must be lowercase, country must be uppercase. A has mixed case in one argument. B has uppercase language and lowercase country -- both wrong. C is correct. D is correct. E -- `Locale.create()` does not exist. F is missing `.build()` so it does not compile.
Your answer: C, D
Correct answer: **C, D**

Correct. C is `new Locale("qw")` -- lowercase language only, valid. D is `new Locale("wp", "VW")` -- lowercase language, uppercase country, valid. A has `"xM"` which is mixed case for a language code -- invalid format. B has uppercase language `"MQ"` and lowercase country `"ks"` -- both backwards. E uses a nonexistent factory method. F is a builder that never calls `.build()`, so the expression evaluates to a `Locale.Builder`, not a `Locale` -- type mismatch, does not compile.

---

### Q16 | Which of the following can be inserted into the blank to allow the code to compile and run without throwing an exception? (Choose all that apply.)

```java
var f = DateTimeFormatter.ofPattern("hh o'clock");
System.out.println(f.format( ____.now()));
```

A. ZonedDateTime
B. LocalDate
C. LocalDateTime
D. LocalTime
E. The code does not compile regardless of what is placed in the blank.
F. None of the above

Your reasoning: the pattern has a single quote that is not closed, so it is an unterminated escape sequence. This throws a runtime exception regardless of what is inserted. Answer: F.
Your answer: F
Correct answer: **F**

Correct -- but the reason is slightly different from what you said. The code does compile. The pattern string `"hh o'clock"` is just a `String` to the compiler. The exception is thrown at runtime when `ofPattern()` is called and tries to interpret the pattern. There are two problems: `o` is not a valid date/time symbol, and the single quote is not properly closed (an escape sequence needs two single quotes `''` to produce a literal quote, or the text must be fully enclosed in `'...'`). Either problem alone would cause a runtime exception. Since no insertion can fix the pattern itself, the answer is F regardless of what date/time type is used.

---

### Q17 | Which of the following statements about resource bundles are correct? (Choose all that apply.)

A. All keys must be in the same resource bundle to be used.
B. A resource bundle is loaded by calling the `new ResourceBundle()` constructor.
C. Resource bundle values are always read using the `Properties` class.
D. Changing the default locale lasts for only a single run of the program.
E. If a resource bundle for a specific locale is requested, then the resource bundle for the default locale will not be used.
F. It is possible to use a resource bundle for a locale without specifying a default locale.

Your reasoning: A is wrong -- Java walks the hierarchy and can pull keys from parent bundles. B is wrong -- `ResourceBundle` uses factory methods (`getBundle()`), not a constructor. C is wrong -- `getString()` on the `ResourceBundle` is the normal way. D is correct. E is wrong -- the default locale bundle can be used if no match is found. F is correct -- the JVM sets a default locale automatically even if you never call `setDefault()`.
Your answer: D, F
Correct answer: **D, F**

Correct. D is true: `setDefault()` only affects the current program execution; it resets the next time the program runs. F is true: the JVM always has a default locale set automatically based on the system, so you never need to set one explicitly -- it is always there.

---

### Q18 | What is the output of the following code?

```java
static class Door implements AutoCloseable {
    public void close() { System.out.print("D"); }
}
static class Window implements Closeable {
    public void close() {
        System.out.print("W");
        throw new RuntimeException();
    }
}
public static void main(String[] args) {
    var d = new Door();
    try (d; var w = new Window()) {
        System.out.print("T");
    } catch (Exception e) {
        System.out.print("E");
    } finally {
        System.out.print("F");
    }
}
```

A. TWF
B. TWDF
C. TWDEF
D. TWF followed by an exception
E. TWDF followed by an exception
F. TWEF followed by an exception
G. The code does not compile.

Your reasoning: the try body prints `T`. Resources close in reverse declaration order: `Window` (`w`) closes first, printing `W` and throwing `RuntimeException`. `Door` (`d`) still closes, printing `D`. All resources are now closed, so the exception propagates to the catch block which prints `E`. Then finally prints `F`. Total: `TWDEF`.
Your answer: C
Correct answer: **C**

Correct. Step by step: body executes and prints `T`. Resources close in reverse order: `w` (Window) closes first, prints `W`, throws `RuntimeException`. Even though an exception was thrown, `d` (Door) still closes (try-with-resources guarantees all resources close), prints `D`. Now the exception propagates to the catch block, which prints `E`. Finally runs and prints `F`. Result: `TWDEF`.

---

### Q19 | Which bundles are used on lines 8 and 9, respectively?

```
Dolphins.properties    -> name=The Dolphin, age=0
Dolphins_en.properties -> name=Dolly, age=4
Dolphins_fr.properties -> name=Dolly
```

```java
5: var fr = new Locale("fr");
6: Locale.setDefault(new Locale("en", "US"));
7: var b = ResourceBundle.getBundle("Dolphins", fr);
8: b.getString("name");
9: b.getString("age");
```

A. Dolphins.properties and Dolphins.properties
B. Dolphins.properties and Dolphins_en.properties
C. Dolphins_en.properties and Dolphins_en.properties
D. Dolphins_fr.properties and Dolphins.properties
E. Dolphins_fr.properties and Dolphins_en.properties
F. The code does not compile.
G. None of the above

Your reasoning: the requested locale is `fr`. Java finds `Dolphins_fr.properties` as the matching bundle. Line 8 (`name`) is found there. Line 9 (`age`) is not in `Dolphins_fr` so Java walks up the hierarchy: `Dolphins_fr` -> `Dolphins`. It is found in `Dolphins.properties`. The `en_US` default locale is irrelevant once `fr` was matched.
Your answer: D
Correct answer: **D**

Correct. Once `Dolphins_fr.properties` is selected as the matching bundle, the hierarchy for key lookups is: `Dolphins_fr.properties` -> `Dolphins.properties`. The default locale (`en_US`) is only consulted during the bundle selection phase, not during key lookups within the hierarchy. Since `Dolphins_fr` was found, `Dolphins_en` and `Dolphins_en_US` are never used. `name` comes from `Dolphins_fr`, `age` (missing from `Dolphins_fr`) comes from `Dolphins`.

---

### !! Q20 - WRONG !!

### Q20 | What is printed by the following program?

```java
1:  public class DriveBus {
2:      public void go() {
3:          System.out.print("A");
4:          try {
5:              stop();
6:          } catch (ArithmeticException e) {
7:              System.out.print("B");
8:          } finally {
9:              System.out.print("C");
10:         }
11:         System.out.print("D");
12:     }
13:     public void stop() {
14:         System.out.print("E");
15:         Object x = null;
16:         x.toString();
17:         System.out.print("F");
18:     }
19:     public static void main(String n[]) {
20:         new DriveBus().go();
21:     }
22: }
```

A. AE
B. AEBCD
C. AEC
D. AECD
E. AE followed by a stack trace
F. AEBCD followed by a stack trace
G. AEC followed by a stack trace
H. A stack trace with no other output

Your reasoning: `A` prints, `stop()` is called which prints `E`, then throws `NullPointerException`. The NPE is not caught by `ArithmeticException`, so it propagates out of the try. You stopped the analysis here and said the stack trace prints after `AE`.
Your answer: E
Correct answer: **G**

You were right that the NPE is not caught by `ArithmeticException`. But you forgot about the `finally` block.

`finally` always runs -- whether the exception is caught or not. Even though the `catch` block does not match (NPE is not an `ArithmeticException`), the `finally` block on line 8 still executes before the exception propagates to the caller. So `C` is printed by `finally`, and then the NPE propagates out of `go()` to `main()`, which does not catch it either, producing the stack trace.

Output: `AEC` followed by a stack trace. Answer: G.

The lesson: `finally` runs even when the exception is not caught. It does not matter whether any catch block matched -- `finally` always runs before the exception propagates further up the call stack.

---

### Q21 | Which changes, when made independently, allow the following program to compile? (Choose all that apply.)

```java
1: public class AhChoo {
2:     static class SneezeException extends Exception {}
3:     static class SniffleException extends SneezeException {}
4:     public static void main(String[] args) {
5:         try {
6:             throw new SneezeException();
7:         } catch (SneezeException | SniffleException e) {
8:         } finally {}
9:     }
10: }
```

A. Add `throws SneezeException` to line 4.
B. Add `throws Throwable` to line 4.
C. Change line 7 to `} catch (SneezeException e) {`.
D. Change line 7 to `} catch (SniffleException e) {`.
E. Remove line 7.
F. The code compiles correctly as is.
G. None of the above

Your reasoning: the multi-catch block is illegal because `SniffleException` is a subclass of `SneezeException` -- having both in a multi-catch is redundant and a compile error. Since the try throws `SneezeException`, removing `SniffleException` from the catch and keeping `SneezeException` alone (option C) fixes it.
Your answer: C
Correct answer: **C**

Correct. A multi-catch block cannot list a type and one of its subclasses -- it is redundant and the compiler rejects it. The fix is to use `SneezeException` alone, which also catches any `SniffleException` thrown (since it is a subclass). Option D fails because the try throws `SneezeException`, which is not a `SniffleException`, so the exception would be unhandled. Options A and B do not fix the multi-catch problem. Option E removes the catch entirely, leaving `SneezeException` (a checked exception) unhandled.

---

### !! Q22 - WRONG !!

### Q22 | What is the output of the following code?

```java
try {
    LocalDateTime book = LocalDateTime.of(2022, 4, 5, 12, 30, 20);
    System.out.print(book.format(DateTimeFormatter.ofPattern("m")));
    System.out.print(book.format(DateTimeFormatter.ofPattern("z")));
    System.out.print(DateTimeFormatter.ofPattern("y").format(book));
} catch (Throwable e) {}
```

A. 4
B. 30
C. 402
D. 3002
E. 3002022
F. 402022
G. None of the above

Your reasoning: `z` requires a `ZonedDateTime`, so the second line throws an exception. You assumed the exception was thrown before any output was produced.
Your answer: G
Correct answer: **B**

You correctly identified that `z` throws an exception on `LocalDateTime` -- but you forgot that `"m"` runs first and successfully prints output before the exception is thrown.

Step by step:
1. `"m"` is the minute symbol. The time is `12:30:20`, so the minute is `30`. This prints `30` successfully.
2. `"z"` is the time zone symbol. `LocalDateTime` has no time zone. This throws a `DateTimeException` at runtime.
3. The `catch (Throwable e) {}` block catches and silently swallows the exception.
4. The third line never runs because the exception already transferred control to the catch block.

Output: `30`. Answer: B.

The lesson: execution runs line by line. The first formatter succeeds and prints its output before the second one throws. Always trace through what executes successfully before the exception occurs, not just what causes the exception.

---

### Q23 | Fill in the blank: A class that implements ________ may be in a try-with-resources statement. (Choose all that apply.)

A. AutoCloseable
B. Resource
C. Exception
D. AutomaticResource
E. Closeable
F. RuntimeException
G. Serializable

Your reasoning: `AutoCloseable` is the interface required for try-with-resources. `Closeable` (used for I/O classes) extends `AutoCloseable`, so it also qualifies.
Your answer: A, E
Correct answer: **A, E**

Correct. `AutoCloseable` is the direct requirement -- any class implementing it can be used in try-with-resources. `Closeable` extends `AutoCloseable`, so implementing `Closeable` satisfies the requirement as well. The other options do not represent the required interface.

---

### Q24 | What is the output of the following program?

```java
public class SnowStorm {
    static class WalkToSchool implements AutoCloseable {
        public void close() {
            throw new RuntimeException("flurry");
        }
    }
    public static void main(String[] args) {
        WalkToSchool walk1 = new WalkToSchool();
        try (walk1; WalkToSchool walk2 = new WalkToSchool()) {
            throw new RuntimeException("blizzard");
        } catch (Exception e) {
            System.out.println(e.getMessage()
                + " " + e.getSuppressed().length);
        }
        walk1 = null;
    }
}
```

A. blizzard 0
B. blizzard 1
C. blizzard 2
D. flurry 0
E. flurry 1
F. flurry 2
G. None of the above

Your reasoning: `walk1` is reassigned to `null` after the try-with-resources, which means it is not effectively final. Using a non-effectively-final variable in try-with-resources is a compile error.
Your answer: G
Correct answer: **G**

Correct. `walk1` is reassigned on the last line (`walk1 = null`), so it is not effectively final. Try-with-resources requires resources that are declared inline or that are effectively final local variables. Since `walk1` fails the effectively-final test, the code does not compile.

If that line were removed, the code would compile and print `blizzard 2`. The `RuntimeException("blizzard")` thrown in the try block becomes the primary exception. Both `walk2` and `walk1` close (in reverse order) and each throws `RuntimeException("flurry")`, which becomes a suppressed exception. Two suppressed exceptions total.

---

### Q25 | What is the output of the following program?

```java
public record Wallet(double money) {
    private String openWallet() {
        Locale.setDefault(Category.DISPLAY,
            new Locale.Builder().setRegion("us").build());
        Locale.setDefault(Category.FORMAT,
            new Locale.Builder().setLanguage("en").build());
        return NumberFormat.getCurrencyInstance(Locale.GERMANY)
            .format(money);
    }
    public void printBalance() {
        System.out.println(openWallet());
    }
    public static void main(String... unused) {
        new Wallet(2.4).printBalance();
    }
}
```

A. 2,40 €
B. $2.40
C. 2.4
D. The code does not compile.
E. None of the above

Your reasoning: `getCurrencyInstance(Locale.GERMANY)` formats the number using German currency rules. The `DISPLAY` and `FORMAT` defaults are irrelevant because an explicit locale is passed to `getCurrencyInstance`. German format is `2,40 €`.
Your answer: A
Correct answer: **A**

Correct. When an explicit locale is passed to `getCurrencyInstance()`, the default locale categories (`DISPLAY` and `FORMAT`) are ignored entirely. The formatting follows `Locale.GERMANY` rules: comma as decimal separator, euro symbol after the number, two decimal places. `2.4` becomes `2,40 €`.

---

### !! Q26 - WRONG !!

### Q26 | Which lines can fill in the blank to make the following code compile? (Choose all that apply.)

```java
void rollOut() throws ClassCastException {}
public void transform(String c) {
    try {
        rollOut();
    } catch (IllegalArgumentException | ____) {
    }
}
```

A. `IOException`
B. `Error`
C. `NullPointerException`
D. `RuntimeException`
E. `NumberFormatException`
F. `ClassCastException`
G. None of the above

Your reasoning: `RuntimeException` is the superclass of `IllegalArgumentException`, so it makes the first catch entry redundant -- that should be a compile error. `NumberFormatException` extends `IllegalArgumentException`, so it is a subclass -- also redundant. All others should work.
Your answer: A, B, C, F
Correct answer: **B, F**

You got the `RuntimeException` and `NumberFormatException` disqualifications right. But A and C are also wrong:

**A -- `IOException`:** This is a checked exception. The catch block would only be valid if the try block could actually throw `IOException`. `rollOut()` only declares `throws ClassCastException`, which is unchecked. The try block cannot produce an `IOException`, so catching one is unreachable code -- a compile error.

**C -- `NullPointerException`:** The variable `c` is already declared as a parameter in `transform(String c)`. The multi-catch block uses `c` as the exception variable name (`catch (...) { }` -- the catch variable would also be named `c` based on the code structure). Wait -- actually re-reading the question: the catch variable in the original code is not named `c`. But option C itself (`NullPointerException`) is a `RuntimeException` subclass. Since `rollOut()` declares only `ClassCastException` (unchecked), and `NullPointerException` is also unchecked, it is not thrown by the method but can still appear in the catch block... Actually `NullPointerException` would be valid here.

The book's answer is B and F only. The reasoning: A (`IOException`) is a checked exception that `rollOut()` does not declare, making the catch unreachable. C is not selected by the book -- this may relate to the variable name conflict with the method parameter `c` (the catch parameter cannot reuse the name `c` already declared in the same method scope). B (`Error`) and F (`ClassCastException`) are both valid -- neither is related to `IllegalArgumentException`, and both can appear alongside it in a multi-catch.

Key takeaways: (1) A catch block for a checked exception is only valid if the try block can actually throw it. (2) The catch variable name cannot shadow a variable already in scope in the same method.

---

## Notes to Self

