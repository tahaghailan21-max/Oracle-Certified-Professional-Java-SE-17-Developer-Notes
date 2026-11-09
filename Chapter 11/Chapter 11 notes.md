# Exceptions, Formatting, and Localization

This chapter covers three ways of making applications adapt to change:

- **Exceptions** -- handling things that go wrong at runtime, whether from bad user
  input, coding mistakes, or external failures like a lost network connection.
- **Formatting** -- presenting data (numbers, dates, currency) in a way that fits the
  context.
- **Localization** -- building applications that can support multiple languages and
  geographic regions without a rewrite.

---

### Understanding Exceptions

#### What an exception is

An exception is Java's way of saying "I don't know what to do here -- you deal with it."
When a method encounters a situation it cannot handle, it throws an exception and
stops executing. The responsibility shifts to the calling code.

There are two broad categories of failure:

- **Coding mistakes** -- accessing an invalid array index, calling a method on `null`,
  dividing by zero. These are bugs.
- **External failures** -- the database goes down, the network drops, a file is missing.
  These are beyond the program's control but must still be handled.

Java gives you a structured framework for dealing with both.

---

#### Return codes vs. exceptions

One alternative to exceptions is returning a special value to signal failure:

```java
public int indexOf(String[] names, String name) {
    for (int i = 0; i < names.length; i++) {
        if (names[i].equals(name)) return i;
    }
    return -1; // signals "not found"
}
```

This works for simple searches but has problems:

- The caller must remember to check the return value. The compiler does not enforce it.
- A magic value like `-1` can be confused with a legitimate result.
- There is no standard way to attach a message or context to the failure.

Java provides exceptions precisely to avoid these problems. Prefer exceptions over
return codes for signaling failure.

---

### Exception Types

#### The hierarchy

Everything that can be thrown in Java inherits from `Throwable`. The hierarchy has three
important branches:

```
java.lang.Throwable              (checked)
├── java.lang.Exception          (checked)
│   └── java.lang.RuntimeException  (unchecked)
└── java.lang.Error              (unchecked)
```

- `Throwable` is checked, but you should never catch or declare it directly in
  application code.
- `Exception` and its subclasses (excluding `RuntimeException`) are **checked**.
- `RuntimeException` and its subclasses are **unchecked**.
- `Error` and its subclasses are **unchecked**.

---

#### Checked exceptions

A checked exception is one the compiler forces you to deal with. Every checked exception
that could be thrown inside a method must either be:

1. Caught in a `try/catch` block inside that method, or
2. Declared in the method signature with `throws`

**How does the compiler know a checked exception could be thrown?**

The compiler knows because the method you are calling declares it with `throws`. That
declaration is a contract: "if you call me, be aware I might throw this." The compiler reads
that contract and checks whether you have honoured it.

```java
// FileReader declares: throws FileNotFoundException (a checked exception)
public FileReader(String fileName) throws FileNotFoundException { ... }

// If you call it without handling it, the compiler rejects your code:
void readFile() {
    FileReader fr = new FileReader("data.txt"); // DOES NOT COMPILE
    // error: unreported exception FileNotFoundException; must be caught or declared
}

// Fix option 1 -- catch it
void readFile() {
    try {
        FileReader fr = new FileReader("data.txt");
    } catch (FileNotFoundException e) {
        System.out.println("File not found: " + e.getMessage());
    }
}

// Fix option 2 -- declare it and pass the responsibility to the caller
void readFile() throws FileNotFoundException {
    FileReader fr = new FileReader("data.txt");
}
```

The chain continues: whoever calls `readFile()` must now also handle or declare
`FileNotFoundException`. The responsibility travels up until someone catches it.

**When can you ignore an exception entirely?**

When the exception is unchecked (a `RuntimeException` or `Error`). The compiler does
not require you to handle or declare those. You can call a method that throws an unchecked
exception and do nothing about it -- the code compiles fine.

```java
// Integer.parseInt throws NumberFormatException, which is unchecked (RuntimeException)
void parseInput(String input) {
    int value = Integer.parseInt(input); // compiles fine -- no catch, no throws required
    System.out.println(value);
}
```

If `input` is `"abc"`, this throws `NumberFormatException` at runtime and the program
crashes. The compiler allowed it because `NumberFormatException` is unchecked. You
chose not to handle it, and Java respects that choice.

You can still handle it if you want:

```java
void parseInput(String input) {
    try {
        int value = Integer.parseInt(input);
        System.out.println(value);
    } catch (NumberFormatException e) {
        System.out.println("Not a valid number.");
    }
}
```

Both versions compile. The difference is that with a checked exception you have no
choice -- you must handle or declare it. With an unchecked exception, handling it is
optional.

Checked exceptions extend `Exception` but not `RuntimeException`. They tend to
represent anticipated failures -- things the programmer should think about, like a missing
file or a failed network connection.

**`throw` vs `throws` -- two different keywords:**

```java
// throws in the signature: declares the method MIGHT throw this exception
void fall(int distance) throws IOException {
    if (distance > 10)
        throw new IOException(); // throw: actually throws the exception
}
```

- `throw` -- used inside the method body to actually throw an exception object.
- `throws` -- used in the method signature to declare that the method may throw that
  exception. It is a warning to callers, not a guarantee.

**Handling a checked exception with try/catch:**

```java
void fall(int distance) {
    try {
        if (distance > 10)
            throw new IOException();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

The catch block uses `Exception`, not `IOException` directly. That is fine -- since
`IOException` is a subclass of `Exception`, the catch block can catch it. A catch block
catches the declared type and any of its subclasses.

---

#### Unchecked exceptions

An unchecked exception does not need to be declared or handled. The compiler does not
enforce the handle or declare rule for them.

Unchecked exceptions are:
- Subclasses of `RuntimeException`
- Subclasses of `Error`

They tend to represent unexpected conditions. `NullPointerException` is a common
example -- almost any line that uses an object reference could throw one if the reference
is `null`. Requiring every method to declare `NullPointerException` would clutter every
method signature in every program.

You are allowed to catch or declare unchecked exceptions, but it is not required:

```java
void fall(String input) {
    System.out.println(input.toLowerCase()); // throws NullPointerException if input is null
}
```

This compiles without any `throws` declaration even though it can throw
`NullPointerException` at runtime.

---

#### Errors

`Error` represents something so catastrophically wrong that the program should not try to
recover -- out of memory, a missing class file, the JVM crashing. These are abnormal
conditions you are unlikely to encounter and cannot meaningfully handle.

You can technically catch an `Error`, but you should not. Let it propagate.

---

#### Summary table

| Type | Inherits from | Compiler enforces handle/declare? | OK to catch? |
|---|---|---|---|
| Unchecked exception | `RuntimeException` | No | Yes |
| Checked exception | `Exception` (not `RuntimeException`) | Yes | Yes |
| Error | `Error` | No | No (not recommended) |
| Throwable | nothing above it | Yes | No (not recommended) |

The exam rule: `Throwable` is either an `Exception` or an `Error`. Do not catch
`Throwable` or `Error` directly in application code.

---

### Throwing an Exception

#### Two ways an exception appears in code

**1. Code that is wrong at runtime:**

```java
String[] animals = new String[0];
System.out.println(animals[0]); // ArrayIndexOutOfBoundsException
```

The array has no elements. Accessing index 0 throws at runtime. The code compiles fine
-- the compiler does not catch this. Exam questions about something else (arrays, loops,
etc.) may have this hiding inside them.

Exam tip: when you see code calling a method on a `null` reference or accessing an
invalid array or `List` index, the answer is that the code throws an exception at runtime,
not a compile error.

**2. Explicitly throwing with `throw`:**

```java
throw new Exception();
throw new Exception("Ow! I fell.");
throw new RuntimeException();
throw new RuntimeException("Ow! I fell.");
```

The optional `String` argument is a message. It is a convention -- most exception classes
provide a constructor that accepts one, but it is not guaranteed.

An exception is an object. You can store it in a variable before throwing it:

```java
var e = new RuntimeException();
throw e; // perfectly legal
```

---

#### `throw` vs `throws`

These are two different keywords used in different places:

| Keyword | Where it goes | What it does |
|---|---|---|
| `throw` | Inside a method body | Actually throws an exception object |
| `throws` | At the end of a method signature | Declares that the method might throw that exception |

```java
void fall(int distance) throws IOException {  // throws: declaration
    if (distance > 10)
        throw new IOException();              // throw: the actual action
}
```

---

#### Common exam traps with `throw`

**Missing `new`:**

```java
throw RuntimeException(); // DOES NOT COMPILE -- missing new
throw new RuntimeException(); // correct
```

An exception must be instantiated with `new`. `throw` alone is not enough.

**Unreachable code after `throw`:**

```java
try {
    throw new RuntimeException();
    throw new ArrayIndexOutOfBoundsException(); // DOES NOT COMPILE -- unreachable
} catch (Exception e) {}
```

Once `throw` executes, the method exits immediately. Any statement after it in the same
block is unreachable. The compiler detects this and rejects it.

---

#### Calling methods that throw checked exceptions

The handle or declare rule applies at the call site too. If you call a method that declares
a checked exception, you must handle or declare it:

```java
class NoMoreCarrotsException extends Exception {}

public class Bunny {
    public static void main(String[] args) {
        eatCarrot(); // DOES NOT COMPILE -- checked exception not handled or declared
    }
    private static void eatCarrot() throws NoMoreCarrotsException {}
}
```

Fix with declare:

```java
public static void main(String[] args) throws NoMoreCarrotsException {
    eatCarrot();
}
```

Fix with catch:

```java
public static void main(String[] args) {
    try {
        eatCarrot();
    } catch (NoMoreCarrotsException e) {
        System.out.print("sad rabbit");
    }
}
```

Note that `eatCarrot()` does not actually throw anything -- it just declares that it could.
That declaration alone is enough for the compiler to require callers to handle or declare.
Declaring an exception you never actually throw is legal. It gives you the option to add
the throw later without breaking callers.

**Catching a checked exception that cannot be thrown:**

```java
public void bad() {
    try {
        eatCarrot();
    } catch (NoMoreCarrotsException e) { // DOES NOT COMPILE
        System.out.print("sad rabbit");
    }
}
private void eatCarrot() {} // no throws declaration
```

This is the reverse trap. `eatCarrot()` declares no checked exceptions, so the compiler
knows the catch block for `NoMoreCarrotsException` can never be reached. It rejects it
as unreachable code.

The rule: a catch block for a checked exception must correspond to a try block that is
actually capable of throwing it (or a subclass of it). This rule does not apply to unchecked
exceptions -- you can catch `RuntimeException` even if nothing in the try block declares it.

```java
// Checked -- compile error if the try block cannot throw it
public void example() {
    try {
        System.out.println("hello"); // nothing here throws NoMoreCarrotsException
    } catch (NoMoreCarrotsException e) { // DOES NOT COMPILE -- unreachable
        System.out.print("sad rabbit");
    }
}

// Unchecked -- always allowed, even if nothing in the try block throws it
public void example() {
    try {
        System.out.println("hello"); // nothing here throws RuntimeException
    } catch (RuntimeException e) { // compiles fine -- no restriction on unchecked
        System.out.print("something went wrong");
    }
}
```

The reasoning: the compiler cannot always predict every possible unchecked exception
at compile time (a `NullPointerException` could theoretically come from almost
anywhere), so it does not attempt to verify whether the try block can actually throw
one. For checked exceptions it can verify this, so it does.

---

#### Overriding methods and checked exceptions

An overridden method may not declare any new or broader checked exceptions than the
method it overrides:

```java
class CanNotHopException extends Exception {}

class Hopper {
    public void hop() {}
}

class Bunny extends Hopper {
    public void hop() throws CanNotHopException {} // DOES NOT COMPILE
}
```

The superclass `hop()` declares no checked exceptions. The subclass cannot add one.
If it could, code written against `Hopper` would not know to handle
`CanNotHopException` when a `Bunny` is used in its place.

An overridden method may declare fewer exceptions or a narrower (subclass) exception:

```java
class Hopper {
    public void hop() throws CanNotHopException {}
}

class Bunny extends Hopper {
    public void hop() {} // fine -- declaring fewer exceptions is allowed
}
```

Callers of `Hopper.hop()` already handle `CanNotHopException`. If `Bunny.hop()`
never throws it, that is fine -- the caller is just handling something that never happens.

---

#### Printing an exception

Three ways to print exception information:

```java
5:  public static void main(String[] args) {
6:      try {
7:          hop();
8:      } catch (Exception e) {
9:          System.out.println(e + "\n");
10:         System.out.println(e.getMessage() + "\n");
11:         e.printStackTrace();
12:     }
13: }
14: private static void hop() {
15:     throw new RuntimeException("cannot hop");
16: }
```

Output:

```
java.lang.RuntimeException: cannot hop       <- from line 9: println(e)

cannot hop                                   <- from line 10: getMessage()

java.lang.RuntimeException: cannot hop       <- from line 11: printStackTrace()
    at Handling.hop(Handling.java:15)
    at Handling.main(Handling.java:7)
```

- `println(e)` -- prints the exception type and message. Calls `toString()` on the
  exception internally.
- `getMessage()` -- returns just the message string passed to the constructor.
- `printStackTrace()` -- prints the full call stack: the exception, the message, and
  every method call that led to the throw. Most useful for debugging because it shows
  exactly where in the code the exception originated and how it got there.

**How to read a stack trace:**

```
java.lang.RuntimeException: cannot hop
    at Handling.hop(Handling.java:15)
    at Handling.main(Handling.java:7)
```

Each `at` line follows this format:

```
at ClassName.methodName(FileName.java:lineNumber)
```

- `Handling` -- the class the method belongs to.
- `hop` -- the method that was executing at that point.
- `Handling.java` -- the source file.
- `15` -- the line number inside that file where the call happened.

The stack trace reads top to bottom, from the most recent call to the oldest:

- Line 1 (`at Handling.hop:15`) -- this is where the exception was actually thrown.
  Line 15 is `throw new RuntimeException("cannot hop")`.
- Line 2 (`at Handling.main:7`) -- this is what called `hop()`. Line 7 is the `hop()`
  call inside `main`.

If there were more method calls in between, they would each appear as additional `at`
lines in between. The very top `at` line is always the exact line that threw the exception.
Everything below it is the chain of calls that led there.

---


### Recognizing Exception Classes

For the exam you need to know three groups: `RuntimeException` subclasses (unchecked),
`Exception` subclasses excluding `RuntimeException` (checked), and `Error` subclasses
(unchecked). For each exception you need to know: which group it belongs to, whether
it is thrown by the JVM or by the programmer, and any inheritance relationships.

**JVM-thrown vs programmer-thrown:**

A JVM-thrown exception is one the JVM detects and throws automatically during
execution -- you do not write any `throw` statement for it. The JVM notices something
illegal happening (dividing by zero, accessing a null reference, casting to the wrong type)
and throws the exception on your behalf without any instruction from your code.

```java
int[] arr = new int[2];
System.out.println(arr[5]); // JVM throws ArrayIndexOutOfBoundsException automatically
                             // -- no throw statement written anywhere
```

A programmer-thrown exception is one you explicitly throw yourself with the `throw`
keyword. You decide the condition that warrants the exception and write the code to
throw it.

```java
public void setAge(int age) {
    if (age < 0)
        throw new IllegalArgumentException("Age cannot be negative"); // programmer throws this
}
```

The distinction matters because JVM-thrown exceptions can appear on any line that
triggers that illegal condition, while programmer-thrown exceptions only appear where
the programmer wrote `throw`. On the exam, knowing which is which helps you figure
out whether a `throw` statement would even make sense in context.

A programmer can technically throw any exception, including ones listed as JVM-thrown:

```java
throw new NullPointerException();         // legal, but unusual
throw new ArrayIndexOutOfBoundsException(); // legal, but unusual
```

When the table says an exception is "thrown by JVM", it means the JVM throws it
automatically when it detects the illegal condition -- you do not need to write `throw`
yourself. It does not mean a programmer is forbidden from throwing it manually. The
column describes the typical and expected source, not an exclusive rule.

The asymmetry only goes one way:
- Exceptions listed as JVM-thrown can also be thrown manually by the programmer.
- Exceptions listed as programmer-thrown are never thrown by the JVM. The JVM only
  throws exceptions for violations it can detect mechanically. It has no concept of
  "this argument violates your business rule" -- only your code knows that.

```java
public void setSpeed(int speed) {
    if (speed < 0 || speed > 300)
        throw new IllegalArgumentException("Speed must be between 0 and 300");
    this.speed = speed;
}
```

The JVM could never throw this. From the JVM's perspective, `speed = -50` is a
perfectly valid `int`. It is not null, not a bad array index, not a division by zero.
Nothing illegal is happening at the language level. The rule that speed must be between
0 and 300 exists only in your application's logic -- it is a business rule, not a Java rule.
Only your code knows that `-50` is unacceptable here, so only your code can throw the
exception.

---

#### Unchecked exceptions (RuntimeException subclasses)

| Exception | Thrown by | Description |
|---|---|---|
| `ArithmeticException` | JVM | Integer division by zero |
| `ArrayIndexOutOfBoundsException` | JVM | Array index is negative or >= array length |
| `ClassCastException` | JVM | Cast fails at runtime because object is not an instance of the target type |
| `NullPointerException` | JVM | Method or field accessed on a `null` reference |
| `IllegalArgumentException` | Programmer | Method received an illegal or inappropriate argument |
| `NumberFormatException` | Programmer | Subclass of `IllegalArgumentException`. String cannot be parsed as a number |

**`ArithmeticException`:**

```java
int answer = 11 / 0; // ArithmeticException: / by zero
```

Only integer division by zero throws this. Floating-point division by zero produces
`Infinity` or `NaN` instead of throwing.

**`ArrayIndexOutOfBoundsException`:**

```java
int[] counts = new int[3];
System.out.println(counts[-1]); // ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 3
```

Valid indexes are `0` to `length - 1`. Negative indexes and indexes equal to or greater
than the length both throw this.

**`ClassCastException`:**

```java
String type = "moose";
Integer number = (Integer) type; // DOES NOT COMPILE -- compiler catches impossible cast

String type = "moose";
Object obj = type;
Integer number = (Integer) obj; // ClassCastException at runtime
```

The compiler only catches casts it can prove are impossible. When the cast goes through
a broader type like `Object`, the compiler cannot be sure, so it allows the code. The JVM
checks at runtime and throws `ClassCastException` if the actual object is not an instance
of the target type.

**`NullPointerException`:**

```java
1: public class Frog {
2:     public void hop(String name, Integer jump) {
3:         System.out.print(name.toLowerCase() + " " + jump.intValue());
4:     }
5:
6:     public static void main(String[] args) {
7:         new Frog().hop(null, 1);
8:     }
9: }
```

Output:

```
NullPointerException: Cannot invoke "String.toLowerCase()" because "<parameter1>" is null
```

Java 17 includes Helpful NullPointerExceptions -- the JVM tells you exactly which
reference was `null`. By default, parameters are shown as `<parameter1>`,
`<parameter2>` etc. based on their position. Compile with `-g:vars` to see actual
variable names instead.

Changing line 7 to `new Frog().hop("Kermit", null)` changes the output to:

```
NullPointerException: Cannot invoke "Integer.intValue()" because "<parameter2>" is null
```

**`IllegalArgumentException`:**

Thrown by the programmer to reject bad input early and loudly:

```java
public void setNumberEggs(int numberEggs) {
    if (numberEggs < 0)
        throw new IllegalArgumentException("# eggs must not be negative");
    this.numberEggs = numberEggs;
}
```

Output when called with `-2`:

```
IllegalArgumentException: # eggs must not be negative
```

**`NumberFormatException`:**

A subclass of `IllegalArgumentException`. Thrown when a `String` cannot be parsed
into a number:

```java
Integer.parseInt("abc"); // NumberFormatException: For input string: "abc"
```

Know this inheritance: `NumberFormatException` extends `IllegalArgumentException`.
A catch block for `IllegalArgumentException` will also catch `NumberFormatException`.

---

#### Checked exceptions (Exception subclasses, not RuntimeException)

These must be handled or declared. Know the inheritance relationships.

| Exception | Inherits from | Thrown by | Description |
|---|---|---|---|
| `IOException` | `Exception` | Programmer | Problem reading or writing a file |
| `FileNotFoundException` | `IOException` | Programmer | File does not exist |
| `NotSerializableException` | `IOException` | Programmer | Attempt to serialize a non-serializable class |
| `ParseException` | `Exception` | Programmer | Problem parsing input |
| `SQLException` | `Exception` | Programmer | Error accessing a database |

**`IOException`:**

The general exception for file read/write failures. Any I/O operation that goes wrong
and is not covered by a more specific subclass throws this:

```java
public void writeFile() throws IOException {
    FileWriter fw = new FileWriter("output.txt");
    fw.write("hello");
    fw.close();
}
```

If writing fails for any reason (disk full, permissions, etc.), an `IOException` is thrown.
You must declare or catch it.

**`FileNotFoundException`:**

A subclass of `IOException`. Thrown when you try to open a file that does not exist:

```java
public void readFile() throws FileNotFoundException {
    FileReader fr = new FileReader("missing.txt"); // throws FileNotFoundException if file is absent
}
```

Because `FileNotFoundException` extends `IOException`, a catch block for `IOException`
will also catch `FileNotFoundException`. The reverse is not true.

```java
try {
    FileReader fr = new FileReader("missing.txt");
} catch (IOException e) {        // catches FileNotFoundException too
    System.out.println("File error: " + e.getMessage());
}
```

**`NotSerializableException`:**

A subclass of `IOException`. Thrown when you try to serialize an object whose class
does not implement `Serializable`:

```java
// Animal does not implement Serializable
class Animal {}

ObjectOutputStream out = new ObjectOutputStream(...);
out.writeObject(new Animal()); // throws NotSerializableException
```

**`ParseException`:**

Thrown when input cannot be parsed into the expected format. Common with date
parsing:

```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
sdf.parse("not-a-date"); // throws ParseException
```

**`SQLException`:**

Thrown when something goes wrong with a database operation -- bad query, connection
dropped, constraint violated:

```java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/mydb");
Statement stmt = conn.createStatement();
stmt.execute("SELECT * FROM nonexistent_table"); // throws SQLException
```

Key inheritance to know: `FileNotFoundException` and `NotSerializableException` are
both subclasses of `IOException`. A catch block for `IOException` will catch both.

---

#### Errors (Error subclasses, unchecked)

Thrown by the JVM. Should not be caught or declared. The program typically cannot
recover from these.

| Error | Description |
|---|---|
| `ExceptionInInitializerError` | A static initializer block threw an exception and did not handle it |
| `StackOverflowError` | A method called itself too many times (infinite recursion) |
| `NoClassDefFoundError` | A class was available at compile time but missing at runtime |

For the exam: these are unchecked, thrown by the JVM, and the program usually cannot
recover from them.

---

### Using try and catch Statements

#### Syntax

```java
try {
    // protected code -- runs normally
    // if an exception is thrown here, execution jumps to the catch block
} catch (ExceptionType identifier) {
    // exception handler -- only runs if the try block threw a matching exception
}
```

- `ExceptionType` -- the type of exception to catch. Also catches any subclass of it.
- `identifier` -- the variable name for the caught exception object (commonly `e`).
  You use it inside the catch block to access the exception (e.g. `e.getMessage()`).
- Curly braces are required on both blocks, even if there is only one statement inside.
  Unlike `if` statements and loops, you cannot omit them.

If no exception is thrown in the try block, the catch block is skipped entirely and
execution continues after the try/catch.

---

#### How execution flows

```java
3:  void explore() {
4:      try {
5:          fall();
6:          System.out.println("never get here");
7:      } catch (RuntimeException e) {
8:          getUp();
9:      }
10:     seeAnimals();
11: }
12: void fall() { throw new RuntimeException(); }
```

- Line 5 calls `fall()`.
- Line 12 throws a `RuntimeException`.
- Java immediately jumps to the catch block on line 7, skipping line 6.
- Line 8 runs (`getUp()`).
- The try/catch is done. Execution continues at line 10 (`seeAnimals()`).

Line 6 is unreachable because `fall()` always throws before it returns. Anything after
a `throw` or a method that always throws is never executed.

---

#### Compile errors with try/catch

**Missing curly braces:**

```java
try           // DOES NOT COMPILE
    fall();
catch (Exception e)
    System.out.println("get up");
```

Curly braces are mandatory on try and catch blocks. Unlike `if` or loops, there is no
single-statement shorthand.

**try block with nothing after it:**

```java
try {         // DOES NOT COMPILE
    fall();
}
```

A try block must be followed by at least one catch block or a finally block. A try
alone has no purpose -- the point is to handle something if it goes wrong.

---


### Chaining catch Blocks

A try block can have multiple catch blocks. Java evaluates them top to bottom and runs
the first one that matches the thrown exception. At most one catch block runs.

```java
class AnimalsOutForAWalk extends RuntimeException {}
class ExhibitClosed extends RuntimeException {}
class ExhibitClosedForLunch extends ExhibitClosed {}

public void visitPorcupine() {
    try {
        seeAnimal();
    } catch (AnimalsOutForAWalk e) {
        System.out.print("try back later");
    } catch (ExhibitClosed e) {
        System.out.print("not today");
    }
}
```

Three outcomes:
- No exception thrown -- neither catch block runs.
- `AnimalsOutForAWalk` thrown -- first catch block runs, second is skipped.
- `ExhibitClosed` thrown -- first catch block does not match, second runs.

Both exceptions extend `RuntimeException` but not each other, so either order works
for these two.

---

#### Order rule -- subclass must come before superclass

When exception types inherit from each other, the more specific (subclass) catch block
must appear before the more general (superclass) one. If the superclass appears first, the
subclass catch block can never be reached and the code does not compile.

**Correct order -- subclass first:**

```java
public void visitMonkeys() {
    try {
        seeAnimal();
    } catch (ExhibitClosedForLunch e) { // subclass -- more specific
        System.out.print("try back later");
    } catch (ExhibitClosed e) {         // superclass -- more general
        System.out.print("not today");
    }
}
```

If `ExhibitClosedForLunch` is thrown, the first block catches it. If `ExhibitClosed`
(but not the subclass) is thrown, the second block catches it. Both blocks are reachable.

**Wrong order -- superclass first:**

```java
public void visitMonkeys() {
    try {
        seeAnimal();
    } catch (ExhibitClosed e) {         // superclass first -- catches everything
        System.out.print("not today");
    } catch (ExhibitClosedForLunch e) { // DOES NOT COMPILE -- unreachable
        System.out.print("try back later");
    }
}
```

`ExhibitClosed` catches `ExhibitClosedForLunch` too (because it is a subclass). The
second catch block can never execute. The compiler rejects it as unreachable code.

---

#### Exam trap -- knowing the inheritance of built-in exceptions

The same rule applies to the standard library exceptions you are required to know:

```java
try {
} catch (IllegalArgumentException e) {
} catch (NumberFormatException e) { // DOES NOT COMPILE
}
```

`NumberFormatException` extends `IllegalArgumentException`. The first block catches
both, making the second unreachable.

```java
try {
} catch (IOException e) {
} catch (FileNotFoundException e) { // DOES NOT COMPILE
}
```

`FileNotFoundException` extends `IOException`. Same problem.

For the exam: whenever you see chained catch blocks, check whether any of the
exception types inherit from each other. If a superclass appears before a subclass, it
does not compile.

---

#### Exception variable scope

The exception variable declared in a catch block exists only within that catch block.
It cannot be referenced from a different catch block:

```java
public void visitManatees() {
    try {
    } catch (NumberFormatException e1) {
        System.out.println(e1);
    } catch (IllegalArgumentException e2) {
        System.out.println(e1); // DOES NOT COMPILE -- e1 is out of scope here
    }
}
```

Each catch block has its own scope. `e1` is only accessible inside the first catch block.
`e2` is only accessible inside the second.

---


### Multi-catch Blocks

When two or more exceptions should be handled the same way, use a multi-catch block
instead of repeating the same catch logic:

```java
// Repetitive -- same body in two catch blocks
try {
    System.out.println(Integer.parseInt(args[1]));
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Missing or invalid input");
} catch (NumberFormatException e) {
    System.out.println("Missing or invalid input");
}

// Multi-catch -- cleaner, no duplication
try {
    System.out.println(Integer.parseInt(args[1]));
} catch (ArrayIndexOutOfBoundsException | NumberFormatException e) {
    System.out.println("Missing or invalid input");
}
```

The `|` separates the exception types. Think of it as "or" -- catch either of these.
There is one single variable name at the end, shared by all listed types.

---

#### Multi-catch syntax rules

The variable name appears once, at the end, after all the exception types:

```java
catch (Exception1 e | Exception2 e | Exception3 e)  // DOES NOT COMPILE -- e appears 3 times
catch (Exception1 e1 | Exception2 e2 | Exception3 e3) // DOES NOT COMPILE -- 3 variable names
catch (Exception1 | Exception2 | Exception3 e)        // compiles -- one name at the end
```

---

#### Redundant types in multi-catch

You cannot list a subclass and its superclass in the same multi-catch block. The subclass
is already covered by the superclass, making it redundant, and the compiler rejects it:

```java
try {
    throw new IOException();
} catch (FileNotFoundException | IOException e) {} // DOES NOT COMPILE
// FileNotFoundException is already caught by IOException
```

Fix: just use the superclass alone.

```java
try {
    throw new IOException();
} catch (IOException e) {} // compiles fine
```

The order of types within a single multi-catch does not matter -- unlike chained catch
blocks where superclass before subclass causes a compile error, multi-catch simply
forbids listing related types together at all.

---

### Adding a finally Block

A `finally` block runs after the try (and catch, if present) regardless of whether an
exception was thrown:

```java
try {
    // protected code
} catch (ExceptionType e) {
    // runs only if exception thrown
} finally {
    // always runs
}
```

The `catch` block is optional when `finally` is present. The `finally` block is not
optional when there is no `catch` -- one of the two must exist.

---

#### Required order

The order must be: `try` then `catch` (zero or more) then `finally`. Any other order
does not compile:

```java
try {              // DOES NOT COMPILE -- finally before catch
    fall();
} finally {
    System.out.println("all better");
} catch (Exception e) {
    System.out.println("get up");
}

try {              // DOES NOT COMPILE -- no catch or finally
    fall();
}

try {              // compiles -- catch is optional when finally is present
    fall();
} finally {
    System.out.println("all better");
}
```

---

#### Execution flow with finally

```java
12: void explore() {
13:     try {
14:         seeAnimals();
15:         fall();
16:     } catch (Exception e) {
17:         getHugFromDaddy();
18:     } finally {
19:         seeMoreAnimals();
20:     }
21:     goHome();
22: }
```

- No exception thrown: try block completes, catch skipped, finally runs (line 19),
  then line 21.
- Exception thrown: catch runs (line 17), then finally runs (line 19), then line 21.

Either way, `finally` runs and execution continues at line 21.

---

#### finally with return -- the return value trap

```java
12: int goHome() {
13:     try {
14:         // optionally throw an exception here
15:         System.out.print("1");
16:         return -1;
17:     } catch (Exception e) {
18:         System.out.print("2");
19:         return -2;
20:     } finally {
21:         System.out.print("3");
22:         return -3;
23:     }
24: }
```

- No exception: prints `1`, tries to return `-1`, but `finally` runs first, prints `3`,
  and the `return -3` in `finally` overrides the earlier return. Return value: `-3`.
- Exception thrown: prints `2`, tries to return `-2`, but `finally` runs first, prints `3`,
  return value is again `-3`.

The printed output is always `13` or `23` depending on whether an exception is thrown.
The return value is always `-3`. The `finally` block interrupts the return statement from
both `try` and `catch` and replaces it with its own.

`return` inside `try` or `catch` does not immediately exit the method. It schedules the
return value, then Java still runs `finally` before actually leaving. If `finally` has its
own `return`, the scheduled value is thrown away and replaced.

The sequence for the no-exception case:

```
1. try block runs, prints "1"
2. return -1 encountered -- Java notes "-1 as the scheduled return value"
3. before actually returning, finally runs, prints "3"
4. return -3 encountered in finally -- Java replaces "-1" with "-3"
5. method exits with -3
```

The `-1` was never delivered. It was overwritten in step 4.

If `finally` does not have a `return`, the scheduled value from `try` or `catch` is
preserved and delivered after `finally` finishes:

```java
int goHome() {
    try {
        return -1;
    } finally {
        System.out.print("3"); // runs, but no return here
    }
}
// prints "3", returns -1 -- finally ran but did not override the return
```

Having a `return` inside `finally` is considered bad practice in real code because it
silently swallows whatever `try` or `catch` was going to return. The exam tests it
precisely because it is a trap.

---

#### finally can itself fail

`finally` always executes, but it may not complete. If an exception is thrown inside
`finally`, execution stops at that line:

```java
} finally {
    info.printDetails(); // throws NullPointerException if info is null -- stops here
    System.out.print("Exiting"); // never reached
    return "zoo";                // never reached
}
```

`finally` started, but it did not finish. The lines after the throw are skipped.

---

#### The one exception: System.exit()

`System.exit()` shuts down the JVM immediately. If called in a `try` or `catch` block,
the `finally` block does not run:

```java
try {
    System.exit(0);
} finally {
    System.out.print("Never going to get here"); // not printed
}
```

`System.exit()` is the only situation where a `finally` block is guaranteed not to run.

---

### Try-with-Resources

#### The problem: closing resources manually is messy

A resource is anything that needs to be opened and closed -- a file, a database
connection, a network stream. If you forget to close it, you cause a resource leak.
A resource leak means the connection stays open indefinitely, eventually exhausting
the available connections and making the resource unreachable to all programs.

Closing resources manually with `finally` produces verbose, nested code:

```java
4:  public void readFile(String file) {
5:      FileInputStream is = null;
6:      try {
7:          is = new FileInputStream("myfile.txt");
8:          // Read file data
9:      } catch (IOException e) {
10:         e.printStackTrace();
11:     } finally {
12:         if (is != null) {
13:             try {
14:                 is.close();
15:             } catch (IOException e2) {
16:                 e2.printStackTrace();
17:             }
18:         }
19:     }
20: }
```

Half the lines exist purely to close the resource. With multiple resources the nesting
gets worse, and you must be careful not to let one close failure prevent another from
being closed.

---

#### try-with-resources syntax

Declare the resource inside parentheses after `try`. Java closes it automatically when
the block ends:

```java
public void readFile(String file) {
    try (FileInputStream is = new FileInputStream("myfile.txt")) {
        // Read file data
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

Same behavior, half the lines. The resource `is` is guaranteed to be closed as soon as
the try block exits, whether normally or via an exception.

Behind the scenes the compiler rewrites this as a try/finally. The `finally` that closes
the resource is called an **implicit finally block** -- it is generated by the compiler, not
written by you. It always runs before any programmer-written `finally` block.

---

#### Important rules

- Resources must be declared inside the parentheses of the `try` statement, not before it.
- Unlike regular objects, resources are not closed when they go out of scope through
  garbage collection. You must close them explicitly -- try-with-resources does this for
  you automatically.
- The `catch` block is optional with try-with-resources, just as it is with a regular
  try/finally.
- If you add your own `finally` block, the implicit close happens first, then your
  `finally` runs.

---


#### Multiple resources

Multiple resources can be declared in one try-with-resources statement, separated by
semicolons. They are closed in the reverse order they were opened:

```java
try (var in = new FileInputStream("data.txt");
     var out = new FileOutputStream("output.txt")) {
    // protected code
} catch (IOException e) {
    // exception handler
} finally {
    // optional programmer finally -- runs after implicit close
}
```

A trailing semicolon after the last resource is optional.

---

#### AutoCloseable requirement

Only classes that implement `AutoCloseable` can be used in a try-with-resources
statement. `AutoCloseable` requires one method:

```java
public interface AutoCloseable {
    public void close() throws Exception;
}
```

The implemented `close()` can throw `Exception`, a subclass of it, or nothing at all.
Classes that do not implement `AutoCloseable` cause a compile error:

```java
try (String reptile = "lizard") {} // DOES NOT COMPILE -- String is not AutoCloseable
```

`Closeable` (used in Chapter 14) extends `AutoCloseable` and is also supported. The
only difference: `Closeable.close()` declares `IOException`, while
`AutoCloseable.close()` declares the broader `Exception`.

---

#### Declaring multiple resources -- syntax rules

Each resource must have its own data type declaration and be separated by a semicolon,
not a comma:

```java
try (MyFileClass is = new MyFileClass(1),      // DOES NOT COMPILE -- comma, missing type
     os = new MyFileClass(2)) {}

try (MyFileClass ab = new MyFileClass(1),      // DOES NOT COMPILE -- comma
     MyFileClass cd = new MyFileClass(2)) {}

try (MyFileClass ab = new MyFileClass(1);      // compiles -- semicolon, each has its type
     MyFileClass cd = new MyFileClass(2)) {}
```

`var` is allowed since resources are local variables:

```java
try (var f = new BufferedInputStream(new FileInputStream("it.txt"))) {
    // process file
}
```

---

#### Scope of resources

Resources declared in the try clause are only in scope within the try block. They are
not accessible in catch or finally blocks -- the implicit close has already run by then:

```java
3: try (Scanner s = new Scanner(System.in)) {
4:     s.nextLine();
5: } catch (Exception e) {
6:     s.nextInt(); // DOES NOT COMPILE -- s is out of scope
7: } finally {
8:     s.nextInt(); // DOES NOT COMPILE -- s is out of scope
9: }
```

This is intentional. You cannot accidentally use a resource after it has been closed.

In a traditional try/finally, you have to declare the resource before the try block
because both the try and finally need to access it. That means the variable stays in
scope for the entire rest of the method -- including all the code after the try/finally
ends. Nothing stops you from accidentally using it after it has been closed:

```java
// Traditional try -- resource declared outside, stays in scope everywhere
Scanner s = null;
try {
    s = new Scanner(System.in);
    s.nextLine();
} finally {
    if (s != null) s.close(); // closed here
}
s.nextLine(); // compiles fine -- but s is closed! runtime error
```

The compiler has no way to know that `s` was closed inside the finally block. From its
perspective, `s` is just a variable that is still in scope, and it allows the call.

With try-with-resources, the resource is declared inside the parentheses of the try
statement. Its scope is limited to that try block only. The moment the block ends, the
variable is gone. The compiler enforces this:

```java
// Try-with-resources -- resource goes out of scope when try block ends
try (Scanner s = new Scanner(System.in)) {
    s.nextLine();
}
s.nextLine(); // DOES NOT COMPILE -- s is out of scope
```

You physically cannot use `s` after the try block because it does not exist outside it.
The scope restriction is what makes the accidental use impossible.

---

#### Order of operations with multiple resources

Resources close in reverse order of creation. The implicit closes happen before the
catch and finally blocks.

The `MyFileClass` used in the example is a custom class whose `close()` method
simply prints a message. This is how you can see when each resource is closed:

```java
public class MyFileClass implements AutoCloseable {
    private final int num;
    public MyFileClass(int num) { this.num = num; }

    @Override public void close() {
        System.out.println("Closing: " + num); // prints when Java calls close()
    }
}
```

```java
public static void main(String... xyz) {
    try (MyFileClass bookReader = new MyFileClass(1);   // resource 1 opened first
         MyFileClass movieReader = new MyFileClass(2)) { // resource 2 opened second
        System.out.println("Try Block");
        throw new RuntimeException();
    } catch (Exception e) {
        System.out.println("Catch Block");
    } finally {
        System.out.println("Finally Block");
    }
}
```

Step by step:

1. `bookReader` is created with `num=1`. `movieReader` is created with `num=2`.
2. The try block starts. `"Try Block"` is printed.
3. `throw new RuntimeException()` is hit. The try block stops immediately.
4. Before Java goes to the catch block, the implicit finally runs and closes the
   resources in reverse order of creation:
   - `movieReader.close()` is called first (opened second, closed first) -- prints `"Closing: 2"`
   - `bookReader.close()` is called next (opened first, closed last) -- prints `"Closing: 1"`
5. Now the catch block runs -- prints `"Catch Block"`.
6. The programmer-written finally runs -- prints `"Finally Block"`.

Output:

```
Try Block
Closing: 2
Closing: 1
Catch Block
Finally Block
```

The implicit resource-closing always happens before the catch and before the
programmer-written finally. The catch and finally only run after all resources are
already closed.

---

#### Effectively final requirement

A resource variable used in a try-with-resources statement must be effectively final --
it cannot be reassigned after declaration:

```java
var writer = Files.newBufferedWriter(path);
try (writer) {                               // compiles if writer is effectively final
    writer.append("Welcome to the zoo!");
}
writer = null;                               // reassignment -- writer is no longer effectively final
```

If the reassignment on the last line is present, the `try (writer)` line does not compile.

You can also write to a resource before the try-with-resources block, but not after it
has been closed:

```java
41: var writer = Files.newBufferedWriter(path);
42: writer.append("permitted but a bad idea");
43: try (writer) {
44:     writer.append("Welcome to the zoo!");
45: }
46: writer.append("This write will fail!"); // IOException: Stream closed
```

Line 46 compiles but throws at runtime because the resource was already closed at the
end of the try block on line 45.

---

### Suppressed Exceptions

When a try-with-resources block exits, Java automatically calls `close()` on each
resource. If `close()` throws an exception, that exception needs somewhere to go.

If no exception was thrown in the try block, the close exception propagates normally
and can be caught:

```java
1: public class JammedTurkeyCage implements AutoCloseable {
2:     public void close() throws IllegalStateException {
3:         throw new IllegalStateException("Cage door does not close");
4:     }
5:     public static void main(String[] args) {
6:         try (JammedTurkeyCage t = new JammedTurkeyCage()) {
7:             System.out.println("Put turkeys in");
8:         } catch (IllegalStateException e) {
9:             System.out.println("Caught: " + e.getMessage());
10:        }
11:    }
12: }
```

Output:

```
Caught: Cage door does not close
```

No exception in the try block, so the exception from `close()` becomes the primary
exception and is caught normally.

---

#### When the try block also throws -- suppressed exceptions

If the try block throws an exception and `close()` also throws an exception, Java
cannot propagate both as primary exceptions. The rule is:

- The exception thrown in the try block is the **primary exception**.
- Any exceptions thrown by `close()` during automatic resource management are
  **suppressed exceptions** -- they are attached to the primary exception, not lost.

```java
5:  public static void main(String[] args) {
6:      try (JammedTurkeyCage t = new JammedTurkeyCage()) {
7:          throw new IllegalStateException("Turkeys ran off");
8:      } catch (IllegalStateException e) {
9:          System.out.println("Caught: " + e.getMessage());
10:         for (Throwable t : e.getSuppressed())
11:             System.out.println("Suppressed: " + t.getMessage());
12:     }
13: }
```

Step by step:

1. Line 7 throws `IllegalStateException("Turkeys ran off")` -- this is the primary exception.
2. The try block ends. Java calls `close()` automatically.
3. `close()` throws `IllegalStateException("Cage door does not close")` -- this is
   attached to the primary exception as a suppressed exception.
4. The catch block on line 8 matches the primary exception.
5. Line 9 prints the primary exception message.
6. Lines 10-11 iterate over suppressed exceptions and print them.

Output:

```
Caught: Turkeys ran off
Suppressed: Cage door does not close
```

`getSuppressed()` returns an array of `Throwable`. Each suppressed exception is
attached to the primary one and travels with it.

---

#### Catch block matches the primary exception only

The catch block only looks at the primary exception type to decide whether it matches.
If the primary exception does not match, it is thrown to the caller even if a suppressed
exception would have matched:

```java
public static void main(String[] args) {
    try (JammedTurkeyCage t = new JammedTurkeyCage()) {
        throw new RuntimeException("Turkeys ran off");    // primary: RuntimeException
    } catch (IllegalStateException e) {                   // only matches IllegalStateException
        System.out.println("caught: " + e.getMessage());
    }
}
```

The primary exception is `RuntimeException`. The catch block looks for
`IllegalStateException`. No match -- the primary exception is thrown to the caller.
Java still remembers the suppressed `IllegalStateException` from `close()` and
attaches it to the primary exception. The output from the JVM looks like:

```
Exception in thread "main" java.lang.RuntimeException: Turkeys ran off
    at JammedTurkeyCage.main(JammedTurkeyCage.java:7)
    Suppressed: java.lang.IllegalStateException: Cage door does not close
        at JammedTurkeyCage.close(JammedTurkeyCage.java:3)
```

Java attaches and displays suppressed exceptions even when they are never explicitly
handled in code.

---

#### Multiple resources -- which exception is primary?

If more than one resource throws during closing, the first exception thrown becomes
the primary. Since resources close in reverse declaration order, the last declared
resource closes first -- meaning its exception (if any) becomes the primary, and
exceptions from earlier-closing resources become suppressed.

Example with two resources that both throw on close:

```java
class BrokenA implements AutoCloseable {
    public void close() {
        throw new RuntimeException("BrokenA closing");   // thrown second
    }
}

class BrokenB implements AutoCloseable {
    public void close() {
        throw new RuntimeException("BrokenB closing");   // thrown first
    }
}

public class MultiResourceDemo {
    public static void main(String[] args) {
        try (BrokenA a = new BrokenA();    // declared first, closes second
             BrokenB b = new BrokenB()) {  // declared second, closes first
            System.out.println("try block runs fine");
        } catch (RuntimeException e) {
            System.out.println("Primary:    " + e.getMessage());
            for (Throwable t : e.getSuppressed())
                System.out.println("Suppressed: " + t.getMessage());
        }
    }
}
```

Output:

```
try block runs fine
Primary:    BrokenB closing
Suppressed: BrokenA closing
```

Step by step:

1. `a` is declared first, `b` is declared second.
2. Resources close in reverse declaration order: `b` closes first, then `a`.
3. `b.close()` throws `RuntimeException("BrokenB closing")` -- this is the first exception thrown during closing, so it becomes the **primary**.
4. `a.close()` then throws `RuntimeException("BrokenA closing")` -- this is thrown second, so it becomes a **suppressed** exception attached to the primary.
5. The catch block receives the primary exception (`BrokenB closing`).

The key insight: "first exception thrown" means the one from the resource that closes first, which is the **last declared** resource. It feels backwards at first -- the resource you wrote last ends up owning the primary exception.

---

#### Suppressed exceptions only apply to the try block

Suppressed exceptions only attach to exceptions thrown inside the try clause. An
exception thrown in a programmer-written `finally` block does not become suppressed
-- it replaces and loses the earlier exception entirely:

```java
public static void main(String[] args) {
    try (JammedTurkeyCage t = new JammedTurkeyCage()) {
        throw new IllegalStateException("Turkeys ran off");  // line 7
    } finally {
        throw new RuntimeException("and we couldn't find them"); // line 9
    }
}
```

Step by step:

1. Line 7 throws `IllegalStateException("Turkeys ran off")`.
2. Java calls `close()`, which throws -- this is suppressed and attached to line 7's exception.
3. The programmer-written `finally` runs. Line 9 throws `RuntimeException`.
4. The `RuntimeException` from `finally` completely replaces the primary exception.
   The exception from line 7 (and its suppressed exception) is lost.

Output:

```
Exception in thread "main" java.lang.RuntimeException: and we couldn't find them
```

The original `IllegalStateException` is gone. This is why throwing exceptions from
`finally` blocks is bad practice -- it silently discards earlier exceptions.

---

## Formatting Values

### Formatting Numbers

#### `NumberFormat` and `DecimalFormat`

`NumberFormat` is an interface with two commonly used methods:

```java
public final String format(double number)
public final String format(long number)
```

Because it is an interface, you need the concrete `DecimalFormat` class to use it. Its constructor takes a pattern string:

```java
public DecimalFormat(String pattern)
```

#### How the pieces fit together

Before looking at examples, here is the full picture of what you are working with:

```
NumberFormat  (interface)
     |
     └── DecimalFormat  (concrete class)
```

- `NumberFormat` is the interface. You cannot instantiate it directly.
- `DecimalFormat` is the concrete class you actually create. It implements `NumberFormat`.
- You build a `DecimalFormat` by passing a pattern string to its constructor.
- Once you have the object, you call `format()` on it to turn a number into a formatted `String`.

The full flow in one picture:

```java
// 1. Create the formatter with a pattern
NumberFormat f = new DecimalFormat("###,###.00");

// 2. Call format() -- takes a number, returns a String
String result = f.format(1234.5); // "1,234.50"
```

`format()` always returns a `String`. It never returns a number. You are going from a number to a human-readable string -- not the other way around. (Parsing, which goes the other direction, uses `parse()` and returns a `Number`.)

The pattern string is the only thing you need to learn. It is just a template that describes what the output should look like. Every character in the pattern is either a `#`, a `0`, or a literal character that gets printed as-is (like `$`, `,`, `.`).

#### Pattern symbols

Only two symbols are tested on the exam:

| Symbol | Meaning | Example output |
|--------|---------|----------------|
| `#` | Omit the position if no digit exists for it | `$2.2` |
| `0` | Put `0` in the position if no digit exists for it | `$002.20` |

#### Examples

```java
double d = 1234.567;

NumberFormat f1 = new DecimalFormat("###,###,###.0");
System.out.println(f1.format(d)); // 1,234.6

NumberFormat f2 = new DecimalFormat("000,000,000.00000");
System.out.println(f2.format(d)); // 000,001,234.56700

NumberFormat f3 = new DecimalFormat("Your Balance $#,###,###.##");
System.out.println(f3.format(d)); // Your Balance $1,234.57
```

Breaking down each format:

- `"###,###,###.0"` -- `#` omits leading positions that have no digits; `.0` forces at least one decimal digit, so the result rounds to the nearest tenth: `1,234.6`.
- `"000,000,000.00000"` -- `0` pads with zeros to fill every position, both leading and trailing: `000,001,234.56700`.
- `"Your Balance $#,###,###.##"` -- characters that are not `#` or `0` (like the text and `$`) are treated as literal output. The value rounds to two decimal places because only two `#` positions are available after the decimal: `Your Balance $1,234.57`.

Note: commas between `#` symbols act as grouping separators in the pattern but are automatically omitted from the output when there are not enough digits to fill the groups.

There is a second concrete class that inherits `NumberFormat` relevant for localization (covered in the next section).

---

### Formatting Dates and Times

#### Extracting fields directly

Date and time objects expose individual-field getter methods:

```java
LocalDate date = LocalDate.of(2022, Month.OCTOBER, 20);
System.out.println(date.getDayOfWeek()); // THURSDAY
System.out.println(date.getMonth());     // OCTOBER
System.out.println(date.getYear());      // 2022
System.out.println(date.getDayOfYear()); // 293
```

#### `DateTimeFormatter` -- standard formats

Java provides `DateTimeFormatter` for displaying standard ISO formats:

```java
LocalDate date = LocalDate.of(2022, Month.OCTOBER, 20);
LocalTime time = LocalTime.of(11, 12, 34);
LocalDateTime dt = LocalDateTime.of(date, time);

System.out.println(date.format(DateTimeFormatter.ISO_LOCAL_DATE));      // 2022-10-20
System.out.println(time.format(DateTimeFormatter.ISO_LOCAL_TIME));      // 11:12:34
System.out.println(dt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));   // 2022-10-20T11:12:34
```

#### Type compatibility -- incompatible formatter throws at runtime

`DateTimeFormatter` throws an exception at runtime if you use a formatter on an incompatible type:

```java
date.format(DateTimeFormatter.ISO_LOCAL_TIME); // RuntimeException -- date has no time
time.format(DateTimeFormatter.ISO_LOCAL_DATE); // RuntimeException -- time has no date
```

This is a runtime error, not a compile-time error. The code compiles fine; it only fails when executed.

---

### Customizing the Date/Time Format

#### `DateTimeFormatter.ofPattern()`

Instead of a predefined constant, you can pass a custom pattern string to `DateTimeFormatter.ofPattern()`:

```java
var f = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm");
System.out.println(dt.format(f)); // October 20, 2022 at 11:12
```

Each letter in the pattern maps to a specific date/time part. **Case matters** -- `M` is month, `m` is minute. The number of repeated letters controls the output width/style.

Example with `M`:

| Pattern | Output |
|---------|--------|
| `M` | `1` (January, minimum digits) |
| `MM` | `01` (always two digits) |
| `MMM` | `Jan` (three-letter abbreviation) |
| `MMMM` | `January` (full name) |

#### Common date/time symbols

| Symbol | Meaning          | Examples                       | Pattern to get each output                                    |
| ------ | ---------------- | ------------------------------ | ------------------------------------------------------------- |
| `y`    | Year             | `22`, `2022`                   | `yy` -> `22`, `yyyy` -> `2022`                                |
| `M`    | Month            | `1`, `01`, `Jan`, `January`    | `M` -> `1`, `MM` -> `01`, `MMM` -> `Jan`, `MMMM` -> `January` |
| `d`    | Day              | `5`, `05`                      | `d` -> `5`, `dd` -> `05`                                      |
| `h`    | Hour             | `9`, `09`                      | `h` -> `9`, `hh` -> `09`                                      |
| `m`    | Minute           | `45`                           | `m` -> `45`, `mm` -> `45` (pads to two digits if needed)      |
| `s`    | Second           | `52`                           | `s` -> `52`, `ss` -> `52` (pads to two digits if needed)      |
| `a`    | a.m./p.m.        | `AM`, `PM`                     | `a` -> `AM` or `PM`                                           |
| `z`    | Time zone name   | `Eastern Standard Time`, `EST` | `z` -> `EST`, `zzzz` -> `Eastern Standard Time`               |
| `Z`    | Time zone offset | `-0400`                        | `Z` -> `-0400`                                                |

```java
var dt = LocalDateTime.of(2022, Month.OCTOBER, 20, 6, 15, 30);

// date-focused: different year/month/day combinations
DateTimeFormatter.ofPattern("yyyy/MM/dd").format(dt)   // 2022/10/20
DateTimeFormatter.ofPattern("yy-M-d").format(dt)       // 22-10-20  (no leading zeros)
DateTimeFormatter.ofPattern("MMMM d, yyyy").format(dt) // October 20, 2022
DateTimeFormatter.ofPattern("MMM dd yy").format(dt)    // Oct 20 22

// time-focused: hour, minute, second, am/pm
DateTimeFormatter.ofPattern("hh:mm:ss").format(dt)     // 06:15:30
DateTimeFormatter.ofPattern("h:mm a").format(dt)       // 6:15 AM
DateTimeFormatter.ofPattern("hh:mm:ss a").format(dt)   // 06:15:30 AM

// mixed date and time
DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss a").format(dt) // 10/20/2022 06:15:30 AM
DateTimeFormatter.ofPattern("MMM d, yy 'at' h:mm a").format(dt) // Oct 20, 22 at 6:15 AM
```

#### Time zone symbols: `z` and `Z`

These only work on `ZonedDateTime`. The output depends on the time zone the object was created with.

```java
var zdt = ZonedDateTime.of(2022, 10, 20, 6, 15, 30, 0, ZoneId.of("US/Eastern"));

DateTimeFormatter.ofPattern("z").format(zdt)    // EDT   (abbreviation, daylight saving time in October)
DateTimeFormatter.ofPattern("zzzz").format(zdt) // Eastern Daylight Time  (full name)
DateTimeFormatter.ofPattern("Z").format(zdt)    // -0400  (raw UTC offset for EDT)
```

What the exam will give you:

- `z` -- expect a short abbreviation like `EST`, `EDT`, `CST`, `PST`
- `zzzz` -- expect a full string like `Eastern Standard Time` or `Eastern Daylight Time`
- `Z` -- expect a numeric UTC offset like `-0400` or `+0530`

The abbreviation changes depending on whether daylight saving time is in effect for that date. October is still on daylight saving time in the US, so `US/Eastern` in October gives `EDT` and offset `-0400`, not `EST` and `-0500`. The exam will not usually test you on the specific offset value -- it just needs you to know that `z` prints a zone abbreviation and `Z` prints a numeric offset.

#### Examples

```java
var dt = LocalDateTime.of(2022, Month.OCTOBER, 20, 6, 15, 30);

var formatter1 = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss");
System.out.println(dt.format(formatter1)); // 10/20/2022 06:15:30

var formatter2 = DateTimeFormatter.ofPattern("MM_yyyy_-_dd");
System.out.println(dt.format(formatter2)); // 10_2022_-_20

var formatter3 = DateTimeFormatter.ofPattern("h:mm z");
System.out.println(dt.format(formatter3)); // DateTimeException at runtime
```

`formatter2` shows that non-symbol characters (underscores, hyphens) are output as-is -- as long as they are not letters that map to a symbol.

`formatter3` throws because `LocalDateTime` has no time zone; `z` requires `ZonedDateTime`.

#### Which symbols work with which types

Not every symbol is valid for every date/time type. Using an incompatible symbol throws a runtime exception.

| Symbol | `LocalDate` | `LocalTime` | `LocalDateTime` | `ZonedDateTime` |
|--------|:-----------:|:-----------:|:---------------:|:---------------:|
| `y` | yes | | yes | yes |
| `M` | yes | | yes | yes |
| `d` | yes | | yes | yes |
| `h` | | yes | yes | yes |
| `m` | | yes | yes | yes |
| `s` | | yes | yes | yes |
| `a` | | yes | yes | yes |
| `z` | | | | yes |
| `Z` | | | | yes |

Key rules from the table:

- `z` and `Z` (time zone symbols) are only valid on `ZonedDateTime`. Using them on `LocalDateTime` throws a runtime exception.
- Date symbols (`y`, `M`, `d`) cannot be used on `LocalTime`.
- Time symbols (`h`, `m`, `s`, `a`) cannot be used on `LocalDate`.

#### Two equivalent ways to call `format()`

Both the date/time object and the formatter have a `format()` method. Either syntax works and produces identical output:
	
```java
var dateTime = LocalDateTime.of(2022, Month.OCTOBER, 20, 6, 15, 30);
var formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss");

System.out.println(dateTime.format(formatter)); // 10/20/2022 06:15:30
System.out.println(formatter.format(dateTime)); // 10/20/2022 06:15:30
```

---

### Adding Custom Text to Format Patterns

#### The problem

If you write arbitrary text directly in a pattern string, each letter is interpreted as a date/time symbol. This either produces garbage output or throws a runtime exception:

```java
DateTimeFormatter.ofPattern("The time is hh:mm"); // RuntimeException -- 'T' is unknown
```

#### Solution 1: split into multiple formatters and concatenate

```java
var dt = LocalDateTime.of(2022, Month.OCTOBER, 20, 6, 15, 30);
var f1 = DateTimeFormatter.ofPattern("MMMM dd, yyyy ");
var f2 = DateTimeFormatter.ofPattern(" hh:mm");
System.out.println(dt.format(f1) + "at" + dt.format(f2)); // October 20, 2022 at 06:15
```

This works but becomes unwieldy when text and symbols are heavily mixed.

#### Solution 2: escape text with single quotes (preferred)

Wrap literal text in single quotes. The formatter ignores everything inside the quotes and outputs it verbatim:

```java
var f = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm");
System.out.println(dt.format(f)); // October 20, 2022 at 06:15
```

#### Outputting a literal single quote

Use two consecutive single quotes to produce one single quote in the output:

```java
var g1 = DateTimeFormatter.ofPattern("MMMM dd', Party''s at' hh:mm");
System.out.println(dt.format(g1)); // October 20, Party's at 06:15

var g2 = DateTimeFormatter.ofPattern("'System format, hh:mm: 'hh:mm");
System.out.println(dt.format(g2)); // System format, hh:mm: 06:15

var g3 = DateTimeFormatter.ofPattern("'NEW! 'yyyy', yay!'");
System.out.println(dt.format(g3)); // NEW! 2022, yay!
```

`g2` is a good example of how single-quoted text can contain what look like pattern symbols (`hh:mm` inside the quotes) -- they are treated as plain text and not interpreted.

#### Runtime exceptions from bad patterns

Two pattern mistakes both throw at runtime, not compile time:

```java
DateTimeFormatter.ofPattern("The time is hh:mm"); // unknown symbol 'T'
DateTimeFormatter.ofPattern("'Time is: hh:mm: ");  // unterminated escape sequence
```

The pattern string is just a `String` at compile time, so the compiler cannot validate it.

> **`SimpleDateFormat` exam note:** Java has two different date formatting classes. `DateTimeFormatter` is the modern one, used with `LocalDate`, `LocalTime`, `LocalDateTime`, and `ZonedDateTime`. `SimpleDateFormat` is the old one from before Java 8, used with the legacy `java.util.Date` class. The exam may show you `SimpleDateFormat` code even though the book focuses on `DateTimeFormatter`. The good news is that the pattern symbols (`yyyy`, `MM`, `dd`, `hh`, `mm`, etc.) mean the same thing in both -- so if you know how to read a `DateTimeFormatter` pattern, you can read a `SimpleDateFormat` pattern too.
>
> ```java
> // Modern style -- what this chapter teaches
> var ldt = LocalDateTime.of(2022, 10, 20, 6, 15, 30);
> var f = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm");
> System.out.println(ldt.format(f)); // 10/20/2022 06:15
>
> // Old style -- may appear on the exam
> java.util.Date d = new java.util.Date(122, 9, 20, 6, 15, 30); // Oct 20 2022
> var sdf = new java.text.SimpleDateFormat("MM/dd/yyyy hh:mm");
> System.out.println(sdf.format(d)); // 10/20/2022 06:15
> ```
>
> Same pattern string, same output. If the exam shows you `SimpleDateFormat`, just read the pattern the same way you would for `DateTimeFormatter`.

---

## Internationalization and Localization

**Internationalization** (i18n) -- designing a program so it can be adapted for different languages and regions. This means placing user-facing strings in properties files and using the correct data formatters.

**Localization** (l10n) -- actually supporting multiple locales: translating strings, and formatting dates and numbers correctly for each region.

The difference between the two:

- **i18n is the preparation work** -- you restructure your code so that it is *capable* of supporting multiple languages. You are not translating anything yet. You are just making sure text strings are not hardcoded inside your classes, and that you are using locale-aware formatters instead of hardcoded formats. Think of it as building the infrastructure.
- **l10n is the actual translation work** -- once the infrastructure is in place, you go in and provide the actual translated content for each language/region. You write the French properties file, the German properties file, etc. You configure what currency symbol Spain uses, what date format Japan uses, and so on.

A simple analogy: i18n is buying and setting up a sign frame outside your shop that can hold interchangeable panels. l10n is making the actual panels -- one in English, one in French, one in Spanish. You only build the frame once (i18n). You add new panels whenever you need a new language (l10n).

The abbreviations come from the number of letters between the first and last letter: **i**nternationalizatio**n** has 18 letters between i and n, and **l**ocalizatio**n** has 10 letters between l and n.

A **locale** is a language and country pairing. The goal is to future-proof an application so that adding support for a new language does not require rewriting everything.

---

### Picking a Locale

#### `Locale` is in `java.util`

Get the user's current locale:

```java
Locale locale = Locale.getDefault();
System.out.println(locale); // en_US  (on a US English machine)
```

#### Locale format

```
language_COUNTRY
```

- Language code: always **lowercase**, always required
- Country code: always **UPPERCASE**, optional
- Separated by an underscore

```
fr          // French (language only)
en_US       // English, United States
hi_IN       // Hindi, India
es_CO       // Spanish, Colombia
```

Invalid examples and why:

| Invalid | Problem |
|---------|---------|
| `US` | Country without a language -- language is required |
| `enUS` | Missing underscore |
| `US_en` | Country and language reversed |
| `EN` | Language must be lowercase |

You do not need to memorize language or country codes. The exam will tell you which ones are being used. You only need to recognize valid and invalid formats.

#### Three ways to create a `Locale`

**1. Built-in constants**

```java
System.out.println(Locale.GERMAN);  // de       (language only)
System.out.println(Locale.GERMANY); // de_DE    (language + country)
```

`Locale.GERMAN` and `Locale.GERMANY` are not the same. One is just a language; the other is a language paired with a specific country.

**2. Constructor**

```java
System.out.println(new Locale("fr"));       // fr
System.out.println(new Locale("hi", "IN")); // hi_IN
```

Pass just a language, or a language and a country. Java will not stop you from passing an invalid code like `xx_XX` -- it just won't match any real locale and the program will not behave as expected.

**3. Builder pattern**

```java
Locale l1 = new Locale.Builder()
    .setLanguage("en")
    .setRegion("US")
    .build();

Locale l2 = new Locale.Builder()
    .setRegion("US")
    .setLanguage("en")
    .build();
```

Both produce `en_US`. The builder lets you set properties in any order, unlike the constructor which requires language first.

#### Changing the default locale

`Locale.getDefault()` returns whatever locale your machine is currently set to. `Locale.setDefault(locale)` lets you override it for the duration of the program:

```java
System.out.println(Locale.getDefault()); // en_US  <-- your machine's locale

Locale.setDefault(new Locale("fr"));

System.out.println(Locale.getDefault()); // fr  <-- now overridden to French
```

The key points:

- This change lasts only for the current execution of the program. The moment the program ends, it is gone.
- It does not touch any OS or JVM settings. Nothing on your machine actually changes.
- The exam uses `setDefault()` in questions because the exam cannot know what locale your machine uses. By calling `setDefault()` at the top of a code snippet, the question forces a known locale so the output is predictable and testable.

So when you see `Locale.setDefault(...)` on the exam, treat it the same as the author saying: "for this question, assume the locale is X."

---

#### Quick reference: what does each `Locale` creation method print?

The output always depends purely on what information the `Locale` object holds -- language only, or language + country.

```java
// Built-in constants
Locale.GERMAN           // de        (language only -- German the language)
Locale.GERMANY          // de_DE     (language + country -- German in Germany)
Locale.FRENCH           // fr        (language only)
Locale.FRANCE           // fr_FR     (language + country)
Locale.ENGLISH          // en        (language only)
Locale.US               // en_US     (language + country)
Locale.UK               // en_GB     (language + country)

// Constructor: one argument = language only
new Locale("fr")        // fr
new Locale("es")        // es

// Constructor: two arguments = language + country
new Locale("hi", "IN")  // hi_IN
new Locale("es", "CO")  // es_CO

// Builder: depends on what you set
new Locale.Builder().setLanguage("en").setRegion("US").build() // en_US
new Locale.Builder().setLanguage("en").build()                 // en
```

The pattern is simple: if the `Locale` was created with only a language, it prints just the language code. If it was created with both a language and a country, it prints `language_COUNTRY`. There is no case where a country code appears without a language.

#### Locale edge cases

**Wrong case in constructor -- Java normalizes it silently**

```java
new Locale("EN")        // en        (Java silently lowercases the language)
new Locale("en", "us")  // en_US     (Java silently uppercases the country)
```

The code compiles and runs fine. Java normalizes the case for you. The exam trap is that the output is `en` and `en_US`, not `EN` and `en_us` -- you might expect the output to mirror exactly what you passed in, but it does not.

**Passing a country code where a language code is expected**

```java
new Locale("US")        // US  (compiles and runs, but "US" is not a language code)
```

Java does not validate that the string you pass is a real language. `"US"` is a country code, not a language, but Java happily creates the `Locale` and prints `US`. The program will not behave as expected because no real locale has `US` as its language. The exam may show this to test whether you notice the mistake.

**`Locale.GERMAN` vs `Locale.GERMANY` -- easy to mix up**

```java
Locale.GERMAN    // de      (the German language -- spoken in Germany, Austria, Switzerland...)
Locale.GERMANY   // de_DE   (German in Germany specifically)
```

`GERMAN` is the language. `GERMANY` is the country. The named constants follow the same rule as everything else: language-only constant = language code only, language+country constant = both.

**Builder with only `setRegion()` -- language defaults to empty**

```java
new Locale.Builder().setRegion("US").build() // _US  (empty language, country only)
```

This compiles and runs but produces a malformed locale with an empty language part. Language is required for a valid locale. On the exam, if you see a builder with no `setLanguage()` call, the output will be missing the language portion.

**`setDefault()` with a language-only locale**

```java
Locale.setDefault(new Locale("fr"));
System.out.println(Locale.getDefault()); // fr
```

You can set the default to a language-only locale. Nothing stops you. But locale-sensitive operations like number formatting may behave unexpectedly if they need a country to resolve regional differences (e.g., French in France vs. French in Canada).

#### Locale edge case -- practice questions

Try to answer each one before reading the answer.

---

**Q1. What does this print?**
```java
System.out.println(new Locale("EN"));
```
<details>
<summary>Answer</summary>

`en` -- Java silently lowercases the language code. The code compiles and runs without any issue. The exam trap is that you might expect `EN` in the output, but Java normalizes it to lowercase, so the output is `en`.
</details>

---

**Q2. What does this print?**
```java
System.out.println(new Locale("en", "us"));
```
<details>
<summary>Answer</summary>

`en_US` -- Java silently uppercases the country code. The code runs fine. The exam trap is expecting `en_us` in the output, but Java normalizes the country to uppercase.
</details>

---

**Q3. What does this print?**
```java
System.out.println(new Locale("US"));
```
<details>
<summary>Answer</summary>

`US` -- Java treats `"US"` as a language code because it was passed as the first argument. It does not validate that it is a real language. The output is literally `US`, which is not a valid locale. The program will not behave as expected for any locale-sensitive operations.
</details>

---

**Q4. What is the difference between these two, and what does each print?**
```java
System.out.println(Locale.GERMAN);
System.out.println(Locale.GERMANY);
```
<details>
<summary>Answer</summary>

`de` -- `Locale.GERMAN` is language only (German the language).

`de_DE` -- `Locale.GERMANY` is language + country (German in Germany specifically).

They are not the same. `GERMAN` is spoken in multiple countries. `GERMANY` is one specific country.
</details>

---

**Q5. What does this print?**
```java
System.out.println(new Locale.Builder().setRegion("US").build());
```
<details>
<summary>Answer</summary>

`_US` -- no language was set, so the language portion is empty. This produces a malformed locale. On the exam, any builder missing a `setLanguage()` call will produce output with no language before the underscore.
</details>

---

**Q6. Is this locale valid or invalid? What will it print?**
```java
System.out.println(new Locale("fr", "FR"));
```
<details>
<summary>Answer</summary>

Valid. Prints `fr_FR`. Language `fr` is lowercase, country `FR` is uppercase, separated by underscore. This is correct format.
</details>

---

**Q7. Which of these locale strings are valid format? (No need to know what language/country they represent -- just the format.)**

```
a) en_US
b) EN_us
c) fr
d) FR
e) es_co
f) en_GB
```
<details>
<summary>Answer</summary>

- `a) en_US` -- valid. Lowercase language, uppercase country.
- `b) EN_us` -- invalid. Language must be lowercase, country must be uppercase.
- `c) fr` -- valid. Language only is allowed.
- `d) FR` -- invalid. A country code alone without a language is not valid. Language is required.
- `e) es_co` -- invalid. Country must be uppercase.
- `f) en_GB` -- valid. Lowercase language, uppercase country.
</details>

---

### Localizing Numbers

Number formatting is locale-sensitive. The same number looks different depending on the locale -- grouping separators, decimal separators, and currency symbols all vary.

#### Getting a `NumberFormat` instance

`NumberFormat` (in `java.text`) provides factory methods. Each method comes in two flavors: one that uses the default locale, and one that accepts an explicit `Locale`.

| Description | Default locale | Specific locale |
|-------------|---------------|-----------------|
| General-purpose | `NumberFormat.getInstance()` | `NumberFormat.getInstance(locale)` |
| Same as above | `NumberFormat.getNumberInstance()` | `NumberFormat.getNumberInstance(locale)` |
| Currency amounts | `NumberFormat.getCurrencyInstance()` | `NumberFormat.getCurrencyInstance(locale)` |
| Percentages | `NumberFormat.getPercentInstance()` | `NumberFormat.getPercentInstance(locale)` |
| Rounds to integer before display | `NumberFormat.getIntegerInstance()` | `NumberFormat.getIntegerInstance(locale)` |
| Compact (K, M, B...) | `NumberFormat.getCompactNumberInstance()` | `NumberFormat.getCompactNumberInstance(locale, Style)` |

> `NumberFormat` instances are not thread-safe. Do not store them in instance or static variables.

#### How the pieces fit together

This is different from `DecimalFormat`. With `DecimalFormat` you wrote a pattern yourself and had full control over the output. With these factory methods, **you do not write a pattern**. You pick a method that matches your intent (currency, percentage, general number, etc.) and optionally pass a locale, and Java figures out the right format for that locale automatically.

```
NumberFormat  (interface)
     |
     ├── DecimalFormat        -- you provide a pattern string yourself
     └── (factory instances)  -- Java picks the format based on locale
```

The full flow:

```java
// 1. Get a formatter -- no pattern, just tell Java what kind and what locale
NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);

// 2. Call format() -- takes a number, returns a formatted String
String result = nf.format(48.0); // "$48.00"

// 3. Or go the other way: parse() -- takes a String, returns a Number
Number n = nf.parse("$48.00"); // 48.0
```

- You never write `"$#,###.00"` yourself. You just say `getCurrencyInstance(Locale.US)` and Java knows what US currency looks like.
- `format()` always returns a `String`. Number in, String out.
- `parse()` always returns a `Number` (the abstract parent class). String in, Number out. Cast it to `Double`, `Long`, etc. as needed.
- Changing the locale changes everything about the output: the currency symbol, where the decimal goes, what character is used as a thousands separator.

Once you have an instance:
- `format(number)` converts a number to a `String`
- `parse(string)` converts a `String` back to a number

---

#### Formatting numbers

The same integer formatted across three locales:

```java
int attendeesPerYear = 3_200_000;
int attendeesPerMonth = attendeesPerYear / 12;

var us = NumberFormat.getInstance(Locale.US);
System.out.println(us.format(attendeesPerMonth)); // 266,666

var gr = NumberFormat.getInstance(Locale.GERMANY);
System.out.println(gr.format(attendeesPerMonth)); // 266.666

var ca = NumberFormat.getInstance(Locale.CANADA_FRENCH);
System.out.println(ca.format(attendeesPerMonth)); // 266 666
```

The number is the same -- the grouping separator is different: comma (US), period (Germany), space (French Canada).

#### Formatting currency

```java
double price = 48;
var myLocale = NumberFormat.getCurrencyInstance();
System.out.println(myLocale.format(price));
// en_US default -> $48.00
// en_GB default -> £48.00
```

> In real code, use `int` or `BigDecimal` for money, not `double`. Floating-point arithmetic can silently lose fractions of a cent.

#### Formatting percentages

```java
double successRate = 0.802;

var us = NumberFormat.getPercentInstance(Locale.US);
System.out.println(us.format(successRate)); // 80%

var gr = NumberFormat.getPercentInstance(Locale.GERMANY);
System.out.println(gr.format(successRate)); // 80 %
```

Minor difference here (a space before `%` in German), but the exam wants you to know that percentage formatting is locale-specific.

---

#### Parsing numbers

`parse()` converts a `String` back into a number. It throws the checked exception `ParseException`, which must be handled or declared.

The locale determines what characters are treated as decimal separators vs. grouping separators:

```java
String s = "40.45";

var en = NumberFormat.getInstance(Locale.US);
System.out.println(en.parse(s)); // 40.45

var fr = NumberFormat.getInstance(Locale.FRANCE);
System.out.println(fr.parse(s)); // 40
```

France uses a comma as the decimal separator, not a dot. When the French formatter sees `"40.45"`, it treats the `.` as a grouping separator (or an unknown character) and stops parsing there, returning just `40`.

The lesson: always parse with the same locale that was used to format.

#### Parsing currency

The goal here is the opposite of formatting: you have a currency string that a user typed or that came from a file, and you want to extract the raw number from it.

```java
String income = "$92,807.99";
var cf = NumberFormat.getCurrencyInstance();
double value = (Double) cf.parse(income);
System.out.println(value); // 92807.99
```

Step by step:

1. `income` is a `String` that looks like money -- it has a `$`, commas, and a decimal point.
2. `getCurrencyInstance()` gives you a formatter that knows the currency rules for the current locale (`en_US` here -- dollar sign, comma as grouping separator, dot as decimal).
3. `cf.parse(income)` reads the string and strips out everything that is formatting (`$`, `,`), leaving just the numeric value `92807.99`. It returns a `Number` object -- not a `double`, not an `int`, but the abstract parent type `Number`.
4. `(Double) cf.parse(income)` casts that `Number` to a `Double` (the wrapper class).
5. Assigning a `Double` to a `double` variable triggers auto-unboxing, giving you the primitive `92807.99`.

The output is `92807.99` and not `$92,807.99` because `parse()` extracts the numeric value -- the currency symbol and comma are formatting decoration, not part of the number.

A second example -- parsing a formatted number that uses commas as grouping separators:

```java
String formatted = "1,250,000";
var nf = NumberFormat.getNumberInstance(Locale.US);
Number parsed = nf.parse(formatted);
int count = parsed.intValue();
System.out.println(count); // 1250000
```

Step by step:

1. `"1,250,000"` is a string with commas used as thousands separators.
2. `getNumberInstance(Locale.US)` knows that in `en_US`, commas are grouping separators, not decimal points.
3. `nf.parse(formatted)` strips the commas and returns `Number` representing `1250000`.
4. `.intValue()` is called on `Number` to get the primitive `int`. This is an alternative to casting -- `Number` has convenience methods `intValue()`, `longValue()`, `doubleValue()`, etc.

The key takeaway: `parse()` always returns `Number`, never a primitive directly. You either cast it (`(Double) result`) or call a conversion method (`result.intValue()`).

---

#### `CompactNumberFormat`

`CompactNumberFormat` is the second `NumberFormat` subclass tested on the exam. It is designed for space-limited output (dashboards, labels, etc.) and automatically abbreviates large numbers.

Created via `getCompactNumberInstance()`. Takes an optional `Style` enum: `Style.SHORT` (default) or `Style.LONG`.

```java
// static import: import static java.text.NumberFormat.Style.*;

var formatters = Stream.of(
    NumberFormat.getCompactNumberInstance(),                              // SHORT by default
    NumberFormat.getCompactNumberInstance(Locale.getDefault(), Style.SHORT),
    NumberFormat.getCompactNumberInstance(Locale.getDefault(), Style.LONG),
    NumberFormat.getCompactNumberInstance(Locale.GERMAN, Style.SHORT),
    NumberFormat.getCompactNumberInstance(Locale.GERMAN, Style.LONG),
    NumberFormat.getNumberInstance()
);

formatters.map(s -> s.format(7_123_456)).forEach(System.out::println);
```

Output (when run with `en_US` default locale):

```
7M
7M
7 million
7 Mio.
7 Millionen
7,123,456
```

The same formatters on `314_900_000`:

```
315M
315M
315 million
315 Mio.
315 Millionen
314,900,000
```

Rules for `CompactNumberFormat`:

1. Determines the highest range for the number: thousand (K), million (M), billion (B), trillion (T).
2. Returns up to the first three digits of that range, rounding the last digit as needed (`314_900_000` rounds up to `315M`).
3. Appends an identifier: `SHORT` uses a symbol (`M`), `LONG` uses a word (`million`) preceded by a space.

Key distinctions:
- No style argument = `SHORT` by default (first two lines are identical above).
- `Style.SHORT` vs `Style.LONG` controls symbol vs. word, not the number of digits.
- Output is locale-specific: `7M` in `en_US` becomes `7 Mio.` in German `SHORT` and `7 Millionen` in German `LONG`.
- The plain `getNumberInstance()` at the end shows the full unabbreviated number for comparison.

---

### Localizing Dates

Date and time formatting is also locale-sensitive. `DateTimeFormatter` provides factory methods that produce locale-aware formatters:

| Description | Method |
|-------------|--------|
| Date only | `DateTimeFormatter.ofLocalizedDate(FormatStyle dateStyle)` |
| Time only | `DateTimeFormatter.ofLocalizedTime(FormatStyle timeStyle)` |
| Date and time (separate styles) | `DateTimeFormatter.ofLocalizedDateTime(FormatStyle dateStyle, FormatStyle timeStyle)` |
| Date and time (same style) | `DateTimeFormatter.ofLocalizedDateTime(FormatStyle dateTimeStyle)` |

`FormatStyle` values: `SHORT`, `MEDIUM`, `LONG`, `FULL`. The exam does not require you to memorize the exact output format for each style.

To target a specific locale instead of the default, chain `.withLocale(locale)` onto the formatter.

#### Example

```java
// static import: import static java.time.format.FormatStyle.SHORT;

public static void print(DateTimeFormatter dtf, LocalDateTime dateTime, Locale locale) {
    System.out.println(dtf.format(dateTime) + " --- " + dtf.withLocale(locale).format(dateTime));
}

public static void main(String[] args) {
    Locale.setDefault(new Locale("en", "US"));
    var italy = new Locale("it", "IT");
    var dt = LocalDateTime.of(2022, Month.OCTOBER, 20, 15, 12, 34);

    print(DateTimeFormatter.ofLocalizedDate(SHORT), dt, italy);
    // 10/20/22 --- 20/10/22

    print(DateTimeFormatter.ofLocalizedTime(SHORT), dt, italy);
    // 3:12 PM --- 15:12

    print(DateTimeFormatter.ofLocalizedDateTime(SHORT, SHORT), dt, italy);
    // 10/20/22, 3:12 PM --- 20/10/22, 15:12
}
```

The left side of `---` uses the default locale (`en_US`); the right side uses Italian (`it_IT`). Notice:
- Date order flips: US is month/day/year, Italy is day/month/year.
- Time format changes: US uses 12-hour with AM/PM, Italy uses 24-hour.
- `.withLocale(locale)` does not modify the original formatter -- it returns a new one with the locale applied.

---

### Specifying a Locale Category

#### What `DISPLAY` and `FORMAT` actually mean

A locale controls two completely separate things, and Java lets you set them independently:

- **`FORMAT`** -- how numbers, currencies, and dates are formatted. This is what makes `1.23` print as `$1.23` in the US or `1,23 €` in Spain.
- **`DISPLAY`** -- how the name of a language is spelled out in text. This is what makes the Spanish language print as `"Spanish"` (in English) or `"español"` (in Spanish).

These two things have nothing to do with each other. You could format numbers like an American but display language names in Spanish, or the other way around.

#### The helper method in the example

The example calls this method:

```java
public static void printCurrency(Locale locale, double money) {
    System.out.println(
        NumberFormat.getCurrencyInstance().format(money)   // <-- controlled by FORMAT
        + ", " + locale.getDisplayLanguage());             // <-- controlled by DISPLAY
}
```

Two things are printed, separated by a comma:
1. `getCurrencyInstance().format(money)` -- formats `1.23` as a currency string. This uses the `FORMAT` locale.
2. `locale.getDisplayLanguage()` -- returns the name of the language of the `spain` locale (`es_ES`). It returns the name *in whatever language the `DISPLAY` locale is set to*.

**Important:** `getCurrencyInstance()` takes no arguments. It does not use the `locale` parameter you passed in. It uses `Locale.getDefault()` (specifically the `FORMAT` category). The `locale` parameter is only ever used by `getDisplayLanguage()` -- and even then, `locale` is just the thing being *described*, not the language it is described *in*. That is controlled by `DISPLAY`.

Think of it this way: `locale.getDisplayLanguage()` asks "what is the name of the language of `locale`?" -- but the answer is given in whatever language `DISPLAY` is currently set to. If `DISPLAY` is English, you get `"Spanish"`. If `DISPLAY` is Spanish, you get `"español"`. The `spain` locale you passed in never changes -- only the language the answer comes back in changes.

So if `DISPLAY` is English, it says `"Spanish"`. If `DISPLAY` is Spanish, it says `"español"`. The actual locale being described (`spain`) never changes -- only the language it is described *in* changes.

#### Walking through the three outputs

```java
var spain = new Locale("es", "ES");
var money = 1.23;
```

**Step 1: default is `en_US` -- both FORMAT and DISPLAY are English/US**

```java
Locale.setDefault(new Locale("en", "US"));
printCurrency(spain, money); // $1.23, Spanish
```

- `FORMAT` = `en_US` -- formats `1.23` as US dollars: `$1.23`
- `DISPLAY` = `en_US` -- the name of the Spanish language, written in English: `Spanish`

**Step 2: change only DISPLAY to Spanish**

```java
Locale.setDefault(Category.DISPLAY, spain);
printCurrency(spain, money); // $1.23, español
```

- `FORMAT` = still `en_US` -- number formatting did not change: still `$1.23`
- `DISPLAY` = now `es_ES` -- the name of the Spanish language, now written in Spanish: `español`

**Step 3: also change FORMAT to Spanish**

```java
Locale.setDefault(Category.FORMAT, spain);
printCurrency(spain, money); // 1,23 €, español
```

- `FORMAT` = now `es_ES` -- Spain uses euros, comma as decimal separator, symbol after the number: `1,23 €`
- `DISPLAY` = still `es_ES` from step 2: `español`

#### Rules to remember for the exam

- `Locale.setDefault(locale)` -- sets both `DISPLAY` and `FORMAT` at once.
- `Locale.setDefault(Category.DISPLAY, locale)` -- changes only how language names are printed; does not touch number/currency formatting.
- `Locale.setDefault(Category.FORMAT, locale)` -- changes only how numbers, currencies, and dates are formatted; does not touch language name display.
- After setting categories individually, calling `Locale.setDefault(us)` resets both back to `en_US` at once.
- You do not need to memorize all the details of each category. Just know they exist and can be set independently.

---

## Loading Properties with Resource Bundles

### What a resource bundle is

A resource bundle is a set of key/value pairs that hold locale-specific text and data for a program. Instead of hardcoding strings like `"Hello"` directly in your Java classes, you put them in a properties file. The program then loads the right file based on the current locale.

A **properties file** is a plain text file of key/value pairs:

```
hello=Hello
open=The zoo is open
```

Keys and values are separated by `=` or `:`. The exam uses `=`.

---

### Creating a resource bundle

Properties files are named using the pattern:

```
BundleName_language_COUNTRY.properties
BundleName_language.properties
BundleName.properties          (default, no locale)
```

For a resource bundle called `Zoo` supporting English and French:

**`Zoo_en.properties`**
```
hello=Hello
open=The zoo is open
```

**`Zoo_fr.properties`**
```
hello=Bonjour
open=Le zoo est ouvert
```

Load the correct bundle using `ResourceBundle.getBundle()` and retrieve values with `getString()`:

```java
public static void printWelcomeMessage(Locale locale) {
    var rb = ResourceBundle.getBundle("Zoo", locale);
    System.out.println(rb.getString("hello") + ", " + rb.getString("open"));
}

public static void main(String[] args) {
    var us = new Locale("en", "US");
    var france = new Locale("fr", "FR");
    printWelcomeMessage(us);     // Hello, The zoo is open
    printWelcomeMessage(france); // Bonjour, Le zoo est ouvert
}
```

`getBundle("Zoo", locale)` finds the most appropriate properties file for that locale. `getString("hello")` looks up the value for the key `"hello"` in that bundle.

You can iterate over all keys using `keySet()`:

```java
var us = new Locale("en", "US");
ResourceBundle rb = ResourceBundle.getBundle("Zoo", us);
rb.keySet().stream()
    .map(k -> k + ": " + rb.getString(k))
    .forEach(System.out::println);
// hello: Hello
// open: The zoo is open
```

---

### Picking a resource bundle

Two ways to get a bundle:

```java
ResourceBundle.getBundle("name");           // uses default locale
ResourceBundle.getBundle("name", locale);   // uses specified locale
```

#### How Java searches for the right file

Java looks for the most specific matching file and works its way down. Given a requested locale of `fr_FR` and a default locale of `en_US`, Java checks in this order:

| Step | File checked | Why |
|------|-------------|-----|
| 1 | `Zoo_fr_FR.properties` | Requested locale (language + country) |
| 2 | `Zoo_fr.properties` | Requested locale (language only) |
| 3 | `Zoo_en_US.properties` | Default locale (language + country) |
| 4 | `Zoo_en.properties` | Default locale (language only) |
| 5 | `Zoo.properties` | No locale -- default bundle |
| 6 | Throw `MissingResourceException` | Nothing found at all |

The rule in plain words:
1. Try the requested locale -- first with country, then language only.
2. Try the default locale -- first with country, then language only.
3. Try the no-locale default bundle.
4. If nothing matches, throw `MissingResourceException`.

#### Example: maximum files considered

```java
Locale.setDefault(new Locale("hi"));
ResourceBundle rb = ResourceBundle.getBundle("Zoo", new Locale("en"));
```

Files considered (in order):
1. `Zoo_en.properties` -- requested locale (`en` has no country, so no `en_XX` step)
2. `Zoo_hi.properties` -- default locale (`hi` has no country)
3. `Zoo.properties` -- default bundle

Maximum: **3 files**.

---

Now with full country codes on both locales:

```java
Locale.setDefault(new Locale("en", "US"));
ResourceBundle rb = ResourceBundle.getBundle("Zoo", new Locale("fr", "FR"));
```

Files considered (in order):
1. `Zoo_fr_FR.properties` -- requested locale (language + country)
2. `Zoo_fr.properties` -- requested locale (language only)
3. `Zoo_en_US.properties` -- default locale (language + country)
4. `Zoo_en.properties` -- default locale (language only)
5. `Zoo.properties` -- default bundle

Maximum: **5 files**.

Both locales have a country code this time, so each locale contributes two steps instead of one -- one for language+country, one for language alone. The default bundle at the end is always step 5 in this scenario (or step 6 if you count the exception as a step).

The pattern to remember: each locale with a country contributes 2 steps, each locale without a country contributes 1 step, plus 1 for the bare default bundle. So the maximum possible is `2 + 2 + 1 = 5` files.

---

### Selecting resource bundle values -- the hierarchy rule

Once Java finds a matching bundle, it does not restrict all key lookups to that single file. It can pull values from any file in that bundle's **hierarchy** -- the matching bundle and its parents formed by progressively removing parts of the name.

For a match of `Zoo_fr_FR`, the hierarchy is:

| File | Can keys come from here? |
|------|--------------------------|
| `Zoo_fr_FR.properties` | yes |
| `Zoo_fr.properties` | yes |
| `Zoo.properties` | yes |

Java looks up each key starting at the bottom of the hierarchy (most specific) and walks up until it finds it. Keys from the default-locale files (`Zoo_en_US.properties`, `Zoo_en.properties`) are **not** used once a matching bundle is found.

#### Worked example

Properties files:

```
Zoo.properties          name=Vancouver Zoo
Zoo_en.properties       hello=Hello   /   open=is open
Zoo_en_US.properties    name=The Zoo
Zoo_en_CA.properties    visitors=Canada visitors
```

Code:

```java
Locale.setDefault(new Locale("en", "US"));
Locale locale = new Locale("en", "CA");
ResourceBundle rb = ResourceBundle.getBundle("Zoo", locale);
System.out.print(rb.getString("hello"));    // line 14
System.out.print(". ");
System.out.print(rb.getString("name"));     // line 16
System.out.print(" ");
System.out.print(rb.getString("open"));     // line 18
System.out.print(" ");
System.out.print(rb.getString("visitors")); // line 20
```

Output: `Hello. Vancouver Zoo is open Canada visitors`

How each key is resolved:

| Key | Found in | Why |
|-----|---------|-----|
| `hello` | `Zoo_en.properties` | Not in `Zoo_en_CA`, walked up one level |
| `name` | `Zoo.properties` | Not in `Zoo_en_CA` or `Zoo_en`, walked to top |
| `open` | `Zoo_en.properties` | Not in `Zoo_en_CA`, walked up one level |
| `visitors` | `Zoo_en_CA.properties` | Found immediately in matched bundle |

Notice that `Zoo_en_US.properties` is never touched even though it is the default locale. Once `Zoo_en_CA` was found as the matching bundle, only the `en_CA -> en -> (default)` hierarchy is used. `en_US` is on a different branch entirely.

If a key is not found anywhere in the hierarchy, `MissingResourceException` is thrown at runtime.

---

### Formatting messages with `MessageFormat`

Properties files can contain placeholders using `{0}`, `{1}`, etc. The `MessageFormat` class substitutes values into those placeholders:

```
helloByName=Hello, {0} and {1}
```

```java
String format = rb.getString("helloByName");
System.out.print(MessageFormat.format(format, "Tammy", "Henry"));
// Hello, Tammy and Henry
```

The second argument to `MessageFormat.format()` is a vararg, so you can pass as many values as there are placeholders.

---

### The `Properties` class

`Properties` (in `java.util`) works like a `HashMap<String, String>`. It is often used for configuration values that may or may not exist.

```java
var props = new Properties();
props.setProperty("name", "Our zoo");
props.setProperty("open", "10am");
```

Retrieving values:

```java
props.getProperty("camel");          // null  (key doesn't exist)
props.getProperty("camel", "Bob");   // Bob   (default value returned)
props.getProperty("open");           // 10am
props.getProperty("open", "soon");   // 10am  (default ignored, key exists)
```

The two-argument `getProperty(key, default)` returns the default only when the key is missing.

`Properties` also has `get()` inherited from `HashMap`, but `get()` does not support a default value:

```java
props.get("open");                          // 10am  (works, one argument)
props.get("open", "The zoo opens soon");    // DOES NOT COMPILE
```

Use `getProperty()` when you need the default-value fallback. `get()` never takes two arguments.

---