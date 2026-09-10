# Methods

---

### Designing Methods

##### Method declaration
A **method declaration** specifies everything needed to call the method. Every part of the
declaration has a role:

```java
public final void nap(int minutes) throws InterruptedException {
    // take a nap
}
```

| Element | Example | Required? |
|---|---|---|
| Access modifier | `public` | No |
| Optional specifier | `final` | No |
| Return type | `void` | **Yes** |
| Method name | `nap` | **Yes** |
| Parentheses | `()` | **Yes** |
| Parameter list | `int minutes` | No (but parentheses stay) |
| Exception clause | `throws InterruptedException` | No |
| Method body | `{ // take a nap }` | **Yes** (except for abstract methods) |

##### Method signature
The **method signature** is just two of those parts: the **method name** + the **parameter
list**.

```
nap(int minutes)
```

The signature is what callers use to reference the method. It deliberately excludes the
return type and access modifier, which control what it returns and where it can be called
from, not how you identify it.

The book's phrasing "which control where the method can be referenced" is slightly imprecise
and applies to both, but they actually serve different purposes:
- The **access modifier** controls where (from which code) the method can be called.
- The **return type** controls what the caller gets back.
- Neither is part of the signature because neither helps the compiler distinguish one method
  from another. That distinction is what the signature is for (relevant when overloading,
  covered later in this chapter).

---

### Access Modifiers

An access modifier determines which classes can call a method (or access a field). Java has
four options:

| Modifier | Keyword | Accessible from |
|---|---|---|
| Private | `private` | Same class only |
| Package | *(none)* | Same package only |
| Protected | `protected` | Same package, or a subclass (in any package) |
| Public | `public` | Anywhere |

The order above goes from most restrictive to least restrictive.

##### Package access vs. protected access
These two are the ones most likely to be confused.

**Package access** (no keyword) means only classes in the **same package** can call the
method. A subclass in a *different* package cannot.

**Protected** means same-package access, **plus** any subclass regardless of package. The
extra thing protected adds over package access is: subclasses that live outside the package
can still access it.

```java
// Package A
class Animal {
    void packageMethod() {}       // package access
    protected void protectedMethod() {}
}

// Package B - a subclass in a different package
class Dog extends Animal {
    void test() {
        packageMethod();    // DOES NOT COMPILE - different package, not a subclass privilege
        protectedMethod();  // compiles - subclass access granted by protected
    }
}
```

##### No such modifier called `default`
`default` is a keyword in Java (used in `switch` statements and interface method
declarations), but it is **never** used as an access modifier. Writing `default void
method()` does not compile.

Package access is sometimes informally called "package-private" or "default access" in
documentation and even in the book, but the actual source code has no keyword at all -- you
simply omit the modifier.

##### Order matters: access modifier must come before the return type
The access modifier must appear before the return type. Getting this order wrong is a
compile error.

```java
public class ParkTrip {
    public void skip1() {}       // valid - public access
    default void skip2() {}      // DOES NOT COMPILE - 'default' is not an access modifier
    void public skip3() {}       // DOES NOT COMPILE - access modifier must come before return type
    void skip4() {}              // valid - package access
}
```

---

### Optional Specifiers

A method can have zero or more optional specifiers. Unlike access modifiers (of which you
pick at most one), you can stack multiple optional specifiers together -- in any order --
as long as the combination is legal.

| Modifier | Description | Covered in |
|---|---|---|
| `static` | Method belongs to the class itself, not an instance | Chapter 5 |
| `abstract` | Method has no body; must be implemented by a subclass | Chapter 6 |
| `final` | Method cannot be overridden in a subclass | Chapter 6 |
| `default` | Used in an interface to provide a default method body | Chapter 7 |
| `synchronized` | Used with multithreaded code | Chapter 13 |
| `native` | Interacts with code written in another language (e.g. C++) | Out of scope |
| `strictfp` | Makes floating-point calculations portable | Out of scope |

##### Ordering rules (the full picture)

- Access modifiers and optional specifiers can appear in **any order relative to each other**,
  but they must **all come before the return type**.
- Once the return type is written, the remaining parts follow a fixed order:
  **name -> parameter list -> exception list -> body**.

```java
public class Exercise {
    public void bike1() {}              // valid - no optional specifier
    public final void bike2() {}        // valid - final specifier
    public static final void bike3() {} // valid - static and final (this order)
    public final static void bike4() {} // valid - static and final (reversed order, still fine)
    public modifier void bike5() {}     // DOES NOT COMPILE - 'modifier' is not a valid keyword
    public void final bike6() {}        // DOES NOT COMPILE - optional specifier after return type
    final public void bike7() {}        // valid - specifier before access modifier (unusual but legal)
}
```

- `bike5` fails because `modifier` is not a recognized keyword at all.
- `bike6` fails because `final` appears after `void` (the return type) -- everything before
  the return type is fine, nothing optional goes after it.
- `bike7` is a curiosity: Java does allow the optional specifier to appear before the access
  modifier. It compiles, but it is unconventional and not something the exam will test. The
  book flags it only so you are not surprised if you see it while practising.

##### You cannot combine `final` and `abstract`
`final` means "cannot be overridden". `abstract` means "must be overridden". These are
contradictory -- a method (or class) cannot be both at the same time.

```java
public abstract final void run(); // DOES NOT COMPILE
```

---

### Return Type

The return type must appear **after** any access modifiers or optional specifiers and
**before** the method name. It is required -- you cannot omit it. If the method returns
nothing, you must explicitly write `void`.

##### Rules for return statements

- A method with a non-`void` return type **must** have a `return` statement that returns a
  compatible value. If any code path through the method reaches the end without hitting a
  `return`, it does not compile.
- A `void` method may optionally have a bare `return;` statement (no value). This acts as
  an early exit -- "I'm done, stop here." It is not required.

```java
public void swim(int distance) {
    if (distance <= 0) {
        return;  // early exit, perfectly valid in a void method
    }
    System.out.print("Fish is swimming " + distance + " meters");
}
```

##### Examples

```java
public class Hike {
    public void hike1() {}                        // valid - void, no return needed
    public void hike2() { return; }               // valid - bare return in void method
    public String hike3() { return ""; }          // valid - returns a String
    public String hike4() {}                      // DOES NOT COMPILE - missing return statement
    public hike5() {}                             // DOES NOT COMPILE - missing return type
    public String int hike6() { }                 // DOES NOT COMPILE - two return types listed
    String hike7(int a) {                         // DOES NOT COMPILE - not all paths return
        if (1 < 2) return "orange";
    }
}
```

- `hike4`: the compiler requires a return statement for any non-`void` method. Missing it
  is a compile error.
- `hike5`: no return type at all. The compiler cannot parse the declaration.
- `hike6`: you get exactly one return type. Writing two is a syntax error.
- `hike7`: there is a `return` inside the `if`, but the compiler does not evaluate whether
  `1 < 2` is always true. It sees a code path (the `else` branch) that reaches the end
  with nothing returned, so it refuses to compile.

##### The dead-code case

```java
String hike8(int a) {
    if (1 < 2) return "orange";
    return "apple";  // compiler warning: unreachable / dead code
}
```

This compiles, but the compiler produces a warning because it can tell the second `return`
can never actually execute. The warning is about code quality, not a hard error.

##### Return type compatibility

The value you return must be **assignable** to the declared return type. The same narrowing
rules that apply to variable assignment apply here.

```java
public class Measurement {
    int getHeight1() {
        int temp = 9;
        return temp;       // valid - int returned as int
    }
    int getHeight2() {
        int temp = 9L;     // DOES NOT COMPILE - can't assign long to int
        return temp;
    }
    int getHeight3() {
        long temp = 9L;
        return temp;       // DOES NOT COMPILE - can't return long as int
    }
}
```

`getHeight2` fails at the assignment `int temp = 9L` -- a `long` literal doesn't fit into
an `int` without an explicit cast. `getHeight3` fails at the `return` -- same narrowing
problem, you cannot implicitly shrink a `long` down to `int`.

---

### Method Name

Method names follow the same identifier rules as variable names.

##### Identifier rules (applies to variables, methods, and classes)

- May only contain: **letters**, **digits (0-9)**, **currency symbols** (`$`, etc.), and
  **underscore** (`_`).
- The **first character** must not be a digit.
- **Reserved words** (`class`, `void`, `int`, `return`, etc.) are not allowed as names.
- A **single underscore `_` alone** is not a valid identifier (reserved by Java since
  Java 9).
- By convention, method names start with a lowercase letter, but this is not enforced by
  the compiler.

##### Examples

```java
public class BeachTrip {
    public void jog1() {}         // valid
    public void 2jog() {}         // DOES NOT COMPILE - starts with a digit
    public jog3 void() {}         // DOES NOT COMPILE - method name before return type
    public void Jog_$() {}        // valid - unconventional but legal
    public _() {}                 // DOES NOT COMPILE - single underscore is not a valid identifier
    public void() {}              // DOES NOT COMPILE - method name is missing entirely
}
```

- `2jog`: identifiers cannot begin with a digit.
- `jog3 void()`: the name and return type are swapped. The compiler sees `jog3` where it
  expects a return type and `void` where it expects a name followed by `(`.
- `Jog_$`: starts with an uppercase letter and ends with `$` -- both are legal characters.
  It's bad practice but not a compile error.
- `_`: the single underscore is reserved and rejected since Java 9.
- `void()`: no name at all before the parentheses, so the declaration is incomplete.

##### Additional identifier edge cases

```java
int $money = 10;      // valid - $ is a legal character
int _score = 5;       // valid - underscore is legal when combined with other characters
int __ = 3;           // valid - two underscores is fine (only a lone single _ is banned)
int _ = 1;            // DOES NOT COMPILE - single underscore alone
int class = 0;        // DOES NOT COMPILE - 'class' is a reserved word
int 9lives = 0;       // DOES NOT COMPILE - starts with a digit
```

---

### Parameter List

The parentheses after the method name are always required, even when there are no
parameters. Multiple parameters are separated by commas -- not semicolons.

```java
public class PhysicalEducation {
    public void run1() {}              // valid - empty parameter list
    public void run2 {}                // DOES NOT COMPILE - parentheses are missing
    public void run3(int a) {}         // valid - one parameter
    public void run4(int a; int b) {}  // DOES NOT COMPILE - semicolon instead of comma
    public void run5(int a, int b) {}  // valid - two parameters
}
```

- `run2`: the parentheses are not optional. Without them the compiler cannot tell this is a
  method declaration at all.
- `run4`: semicolons separate statements, not parameters. Comma is the only valid separator
  inside a parameter list.

---

### Method Signature

The **method signature** is the method name combined with the parameter type list (types
and their order). It does **not** include the parameter names, the return type, access
modifier, or any specifiers.

This matters because the signature is what the compiler uses to distinguish one method from
another. Two methods with the same name but different signatures can coexist in the same
class (overloading). Two methods with the same signature cannot, regardless of how
different everything else is.

```java
public class Trip {
    public void visitZoo(String name, int waitTime) {}
    public void visitZoo(String attraction, int rainFall) {} // DOES NOT COMPILE
}
```

Even though the parameter names are different, both methods have the signature
`visitZoo(String, int)` -- identical. The compiler rejects the second one.

Changing the **order** of the types produces a different signature and is allowed:

```java
public class Trip {
    public void visitZoo(String name, int waitTime) {}       // visitZoo(String, int)
    public void visitZoo(int rainFall, String attraction) {} // visitZoo(int, String)
}
```

These are two distinct signatures, so both compile. More on overloading later in this chapter.

---

### Exception List

A method declaration may optionally include a `throws` clause listing the exception types
it can throw. Multiple exceptions are separated by commas.

```java
public class ZooMonorail {
    public void zeroExceptions() {}
    public void oneException() throws IllegalArgumentException {}
    public void twoExceptions() throws IllegalArgumentException, InterruptedException {}
}
```

##### Why declare `throws` if it is optional?

Java splits exceptions into two categories:

- **Checked exceptions** -- the compiler enforces that these are either caught or declared.
  If your method body contains code that can throw a checked exception (like
  `InterruptedException`) and you do not catch it inside the method, you **must** declare
  it in the `throws` clause. In that situation it is not really optional -- the compiler
  will reject the method if it is missing.

- **Unchecked exceptions** (subclasses of `RuntimeException`) -- the compiler does not
  enforce anything. You can throw them, catch them, or ignore them without declaring them.
  Adding them to a `throws` clause is optional and serves as documentation only.

So the rule of thumb: `throws` is optional for unchecked exceptions, but **required by the
compiler** for checked exceptions that are not caught inside the method.

Declaring `throws` also creates a contract with callers: whoever calls your method is now
informed (and may be required) to handle or re-declare that exception. This is covered in
detail in Chapter 11.

---

### Method Body

The method body is a code block -- opening brace, zero or more statements, closing brace.
It is required for every method that is not declared `abstract`.

```java
public class Bird {
    public void fly1() {}                         // valid - empty body
    public void fly2()                            // DOES NOT COMPILE - missing braces
    public void fly3(int a) { int name = 5; }     // valid - one statement in the body
}
```

- `fly2`: a method body is not optional (unless the method is `abstract`). Omitting the
  braces entirely means there is no body at all, which is a compile error.

---

### Method Declaration -- Putting It All Together

A collection of examples that mix everything covered so far. Work through each one and
identify why it compiles or does not before reading the explanation.

```java
public class MethodReview {
    // 1
    int count(String s) { return s.length(); }

    // 2
    static final void reset() {}

    // 3
    private String describe(int x, int y) { return x + ", " + y; }

    // 4
    public void void duplicate() {}                    // DOES NOT COMPILE

    // 5
    public int add(int a, int b) { return a + b; }

    // 6
    public int subtract(int a, int b) {}               // DOES NOT COMPILE

    // 7
    public boolean isEven(int n) { return n % 2 == 0; }

    // 8
    public String greet(String name;) {}               // DOES NOT COMPILE

    // 9
    public void log(String msg) throws Exception {}
}
```

- **1**: package access, returns `int`. Valid.
- **2**: `static` and `final` before `void`. Valid -- specifiers can be in any order before
  the return type.
- **3**: `private` with a two-parameter list and a return statement. Valid.
- **4**: two return types (`void void`). One return type only.
- **5**: returns the sum of two ints. Valid.
- **6**: declared as `int` but the body is empty -- no `return` statement. Any non-`void`
  method must return a value.
- **7**: returns a `boolean` expression. Valid.
- **8**: semicolon inside the parameter list. Only commas separate parameters.
- **9**: `throws Exception` declared. Valid -- the `throws` clause is the last item before
  the body.

---

### Declaring Local and Instance Variables

A quick refresher on the two kinds of variables you will encounter inside and around
methods.

- **Local variable**: declared inside a method or block. Only accessible within that block.
  The variable reference is destroyed when the block finishes executing.
- **Instance variable**: declared as a member of a class (a field). One copy exists per
  object. Accessible from any non-static method in the class.

```java
public class Lion {
    int hunger = 4;  // instance variable - exists on every Lion object

    public int feedZooAnimals() {
        int snack = 10;  // local variable - scoped to this method
        if (snack > 4) {
            long dinnerTime = snack++;  // local variable - scoped to this if block only
            hunger--;
        }
        return snack;
    }
}
```

- `hunger`: instance variable. Shared across the method and any other method on the same
  `Lion` object.
- `snack`: local to `feedZooAnimals`. It disappears when the method returns.
- `dinnerTime`: local to the `if` block. It disappears as soon as the closing `}` of the
  `if` is reached. Trying to reference it outside that block would be a compile error.

##### The key distinction: variable reference vs. the object it points to

There are two separate layers to keep in mind:

- **The variable** is a named slot that holds either a primitive value directly, or an
  address that points to an object on the heap. It lives inside the method (or block).
  When the method ends, that slot is thrown away -- always, no exceptions.

- **The object** lives on the heap, independently of any variable. It does not get garbage
  collected just because a variable that pointed to it was destroyed. It only gets collected
  when nothing anywhere is pointing to it anymore.

So "the variable is gone" does not automatically mean "the thing it held is also gone."

**With a primitive** (`snack` in the `Lion` example):

There is no object involved at all. `return snack` copies the integer value out of the
method before `snack` is destroyed. The caller receives that copy. The variable is gone,
but the value was already handed out.

**With a reference type:**

```java
public class Demo {
    public StringBuilder buildMessage() {
        StringBuilder sb = new StringBuilder("hello");
        return sb;
    }

    public static void main(String[] args) {
        Demo d = new Demo();
        StringBuilder result = d.buildMessage();
        System.out.println(result); // prints: hello
    }
}
```

Step by step:
1. Inside `buildMessage`, `sb` is created. It holds the address of a `StringBuilder`
   object sitting on the heap.
2. `return sb` hands that address back to the caller before the method ends.
3. The method finishes. The local variable `sb` is destroyed.
4. The caller stored the returned address in `result`.
5. The `StringBuilder` object is still on the heap. Nothing was lost -- `sb` is gone but
   `result` now points to the same object.

The object survives because something still holds its address. The variable was just one
holder. When you return a reference, you are passing the address along, not moving or
copying the object itself.

**Summary:**
- **Primitive** (`int`, `char`, etc.) -- the variable IS the value. When the variable is
  gone, the value is gone with it (unless you returned or copied it out first).
- **Reference type** (`StringBuilder`, `String`, any object) -- the variable is just a
  pointer to an object that lives separately on the heap. Destroying the variable only
  removes that one pointer. The object stays alive as long as at least one other pointer
  to it exists somewhere.

---

### Local Variable Modifiers

The only modifier that can be applied to a local variable is `final`. Once assigned, a
`final` local variable cannot be reassigned. You can declare it without a value, but you
must assign it exactly once before you use it.

```java
public void zooAnimalCheckup(boolean isWeekend) {
    final int rest;
    if (isWeekend) rest = 5; else rest = 20;  // assigned exactly once on each branch
    System.out.print(rest);                   // valid - definitely assigned by here

    final var giraffe = new Animal();
    final int[] friends = new int[5];

    rest = 10;          // DOES NOT COMPILE - reassigning a final variable
    giraffe = new Animal(); // DOES NOT COMPILE - reassigning a final reference
    friends = null;     // DOES NOT COMPILE - reassigning a final reference
}
```

Note that `final` and `var` can be used together (`final var giraffe`).

##### Missing assignment before use

```java
public void zooAnimalCheckup(boolean isWeekend) {
    final int rest;
    if (isWeekend) rest = 5;   // only assigned on one branch
    System.out.print(rest);    // DOES NOT COMPILE - might not be assigned if isWeekend is false
}
```

The compiler does not evaluate whether the condition will be true at runtime. It sees a
path (the `else` branch) where `rest` was never assigned and rejects the code.

##### `final` only locks the reference, not the contents

`final` prevents reassigning the variable itself. It says nothing about the object the
variable points to. The contents of the object can still be mutated freely.

```java
public void zooAnimalCheckup() {
    final int rest = 5;
    final Animal giraffe = new Animal();
    final int[] friends = new int[5];

    giraffe.setName("George");  // valid - mutating the object, not reassigning the variable
    friends[2] = 2;             // valid - mutating the array contents, not reassigning the variable

    rest = 6;           // DOES NOT COMPILE - primitive, the value itself can't change
    giraffe = null;     // DOES NOT COMPILE - would reassign the reference
    friends = new int[3]; // DOES NOT COMPILE - would reassign the reference
}
```

For a primitive like `rest`, the value and the variable are the same thing, so `final`
effectively freezes it completely. For reference types like `giraffe` and `friends`, `final`
only freezes the pointer -- what the pointer aims at can still change.

---

### Effectively Final Variables

A local variable is **effectively final** if it is never reassigned after its first
assignment -- even if you never wrote the `final` keyword. The compiler treats it as if it
were `final`.

The simplest way to test this: add `final` to the declaration. If the code still compiles,
the variable was effectively final. If it breaks, it was not.

##### Why it matters

Lambda expressions and local classes (covered in Chapter 7 and 8) can only capture local
variables that are `final` or effectively final. If a variable is modified after assignment,
it cannot be used inside a lambda, even if the modification happens after the lambda is
defined.

##### Examples

```java
public String zooFriends() {
    String name = "Harry the Hippo";  // line 12
    var size = 10;                    // line 13
    boolean wet;                      // line 14 - declared, not yet assigned
    if (size > 100) size++;           // line 15
    name.substring(0);                // line 16 - does NOT modify name, strings are immutable
    wet = true;                       // line 17 - assigned exactly once
    return name;                      // line 18
}
```

- `name`: effectively final. Assigned once on line 12. Line 16 calls a method on the
  `String` object, but strings are immutable -- `substring` returns a new `String` and
  discards it. The variable `name` itself never changes.
- `size`: NOT effectively final. It is incremented on line 15 (`size++` is an assignment).
- `wet`: effectively final. Declared on line 14 with no value, then assigned once on line
  17, and never touched again. A blank declaration followed by a single assignment still
  counts as effectively final.

##### Common traps

```java
// trap 1: any reassignment kills effectively final, even if the value ends up the same
int x = 5;
x = 5;   // still a reassignment - x is no longer effectively final

// trap 2: compound assignment operators count as reassignment
int y = 10;
y += 0;  // y is no longer effectively final - += is an assignment

// trap 3: calling a method on the object does NOT affect effectively final
String s = "hello";
s.toUpperCase();  // s is still effectively final - the variable was never reassigned

// trap 4: post/pre-increment always disqualifies
int z = 1;
z++;  // z is no longer effectively final
```

##### Effectively final parameters

Method and constructor parameters are pre-initialized local variables. The same rules
apply: a parameter that is never reassigned inside the method is effectively final.

```java
public void greet(String message) {
    // message is never reassigned, so it is effectively final
    // it can be captured by a lambda inside this method
}

public void greetLoud(String message) {
    message = message.toUpperCase();
    // message is no longer effectively final - it was reassigned on the line above
    // it cannot be captured by a lambda inside this method
}
```

---

### Instance Variable Modifiers

Like methods, instance variables can have access modifiers (`private`, package, `protected`,
`public`) and optional specifiers. The only optional specifier relevant to this chapter is
`final`.

| Modifier    | Description                                                                                                                                                                                                                                                                                                                                                           | Covered in |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `final`     | Must be assigned a value exactly once during each object's construction -- not zero times, not twice. Every new instance goes through initialization fresh, and each instance's `final` field must receive its value at that point. This is distinct from `static final`, which belongs to the class and is assigned once for the whole program, not once per object. | Chapter 5  |
| `volatile`  | Value may be modified by other threads                                                                                                                                                                                                                                                                                                                                | Chapter 13 |
| `transient` | Variable should not be serialized                                                                                                                                                                                                                                                                                                                                     | Chapter 14 |

##### `final` instance variables

A `final` instance variable must be assigned a value exactly once. There are three places
where this assignment is allowed:

1. At the point of declaration.
2. In an instance initializer block.
3. In a constructor.

```java
public class PolarBear {
    final int age = 10;       // assigned at declaration
    final int fishEaten;
    final String name;

    { fishEaten = 10; }       // assigned in instance initializer

    public PolarBear() {
        name = "Robert";      // assigned in constructor
    }
}
```

If any `final` instance variable is left without a value after the constructor finishes, the
compiler rejects the class. Assigning it more than once is equally illegal.

```java
public class Broken {
    final int x;              // DOES NOT COMPILE - never assigned
}

public class AlsoBroken {
    final int x = 5;
    { x = 10; }               // DOES NOT COMPILE - second assignment
}
```

##### No default values for `final` variables

Normally, instance variables get a default value based on their type (`0` for `int`, `null`
for objects, etc.). `final` variables are an exception -- the compiler does not apply a
default. You must explicitly provide a value yourself.

```java
public class Zoo {
    int population;         // defaults to 0, fine
    final int capacity;     // DOES NOT COMPILE - no default, must be explicitly assigned
}
```

---

### Working with Varargs

A **varargs** parameter lets a method accept zero or more arguments of a given type without
the caller having to build an array manually. Inside the method, the varargs parameter
behaves exactly like an array.

##### Rules for declaring varargs

1. A method can have **at most one** varargs parameter.
2. The varargs parameter must be the **last** parameter in the list.

The syntax uses three dots after the type: `String... args`.

```java
// valid
public void feed(int... amounts) {}
public void log(String label, int... values) {}

// invalid
public void broken1(int... a, int... b) {}   // DOES NOT COMPILE - two varargs
public void broken2(int... a, int b) {}       // DOES NOT COMPILE - varargs not last
```

##### Additional examples

```java
// varargs can appear alongside other parameters, as long as it is last
public void register(String name, int age, String... hobbies) {}

// calling it - the varargs part can receive zero or more values
register("Alice", 30);                        // hobbies = empty array
register("Bob", 25, "hiking");                // hobbies = {"hiking"}
register("Carol", 22, "reading", "cycling");  // hobbies = {"reading", "cycling"}

// you can also pass an explicit array
String[] activities = {"swimming", "yoga"};
register("Dana", 28, activities);             // valid
```

##### Declaration rules -- examples

```java
public class VisitAttractions {
    public void walk1(int... steps) {}                   // valid - one varargs
    public void walk2(int start, int... steps) {}        // valid - regular param first, varargs last
    public void walk3(int... steps, int start) {}        // DOES NOT COMPILE - varargs not last
    public void walk4(int... start, int... steps) {}     // DOES NOT COMPILE - two varargs
}
```

---

### Calling Methods with Varargs

When calling a varargs method you have two options: pass an explicit array, or pass a
comma-separated list of values and let Java build the array for you. Both produce the same
result inside the method.

```java
// pass an explicit array
int[] data = new int[] {1, 2, 3};
walk1(data);

// pass individual values - Java creates the array
walk1(1, 2, 3);
```

Inside the method, the varargs parameter is always an array:

```java
public void walk1(int... steps) {
    int[] step2 = steps;               // steps is already int[], this is just to prove it
    System.out.print(step2.length);    // prints the number of elements passed
}
```

You can also pass nothing at all. Java creates a zero-length array for you:

```java
walk1();   // steps.length == 0, no error
```

##### Accessing varargs elements

Varargs parameters are accessed with standard array indexing:

```java
public static void run(int... steps) {
    System.out.print(steps[1]);
}

public static void main(String[] args) {
    run(11, 77);  // prints 77 - steps[0] is 11, steps[1] is 77
}
```

##### Varargs alongside regular parameters

When a varargs method has other parameters before it, the regular parameters are filled
first and the remaining arguments go into the varargs array:

```java
public class DogWalker {
    public static void walkDog(int start, int... steps) {
        System.out.println(steps.length);
    }

    public static void main(String[] args) {
        walkDog(1);                   // 0 - start=1, steps=[]
        walkDog(1, 2);                // 1 - start=1, steps=[2]
        walkDog(1, 2, 3);             // 2 - start=1, steps=[2,3]
        walkDog(1, new int[] {4, 5}); // 2 - start=1, steps=[4,5] (explicit array)
    }
}
```

##### Passing null to a varargs parameter

Java allows passing `null` explicitly. Since `null` is not an `int`, Java treats it as a
null array reference and passes it directly into the method. The method then throws a
`NullPointerException` when it tries to use the array (such as reading `.length`).

```java
walkDog(1, null); // compiles, but throws NullPointerException inside walkDog
```

##### Edge cases

**Ambiguity when passing a single array vs. multiple values:**

```java
public static void print(String... words) {
    System.out.println(words.length);
}

String[] arr = {"a", "b", "c"};
print(arr);          // 3 - the array itself is passed as the varargs
print("a", "b", "c"); // 3 - Java builds a new array from the three values
```

Both calls result in a three-element array inside the method, but note that when you pass
an existing array directly, Java does not wrap it in another array. The array IS the varargs
parameter.

**You cannot pass two arrays as separate varargs arguments:**

```java
String[] first = {"a", "b"};
String[] second = {"c", "d"};
print(first, second); // DOES NOT COMPILE - two arrays where one varargs array is expected
```

**Casting null to avoid ambiguity (advanced, but exam-relevant):**

```java
print(null);                     // compiles but NullPointerException at runtime
print((String) null);            // passes a single null String element - steps.length is 1
print((String[]) null);          // passes a null array - NullPointerException at runtime
```

Casting `null` to the element type (`String`) makes Java wrap it in a one-element array
containing a null `String`. Casting to the array type (`String[]`) passes the null array
directly, which causes a `NullPointerException` when accessed.

**Varargs and overloading -- the compiler prefers the non-varargs version:**

```java
public static void greet(String name) {
    System.out.println("exact match");
}
public static void greet(String... names) {
    System.out.println("varargs");
}

greet("Alice");  // prints "exact match" - compiler prefers the specific overload
```

When both an exact-match overload and a varargs overload could apply, Java always picks
the non-varargs one. Varargs is the last resort.




---

### Applying Access Modifiers

The four access modifiers, from most to least restrictive:

| Modifier | Accessible from |
|---|---|
| `private` | Same class only |
| *(none)* -- package access | Same class + any class in the same package |
| `protected` | Same class + same package + subclasses in any package |
| `public` | Everywhere |

---

### Private Access

Only code inside the same class can access `private` members. Not even another class in
the same package can touch them.

```java
// pond.duck package
public class FatherDuck {
    private String noise = "quack";
    private void quack() {
        System.out.print(noise);  // fine - same class
    }
}
```

```java
// pond.duck package - same package as FatherDuck, but a different class
public class BadDuckling {
    public void makeNoise() {
        var duck = new FatherDuck();
        duck.quack();             // DOES NOT COMPILE - private method
        System.out.print(duck.noise); // DOES NOT COMPILE - private field
    }
}
```

Even being in the same package is not enough. `private` means same class, period. This
is true even if both classes are declared in the same file.

---

### Package Access

When there is no access modifier, only classes in the same package can access the member.

```java
// pond.duck package
public class MotherDuck {
    String noise = "quack";      // package access
    void quack() {
        System.out.print(noise); // fine - same class
    }
}
```

```java
// pond.duck package - same package, so package access works
public class GoodDuckling {
    public void makeNoise() {
        var duck = new MotherDuck();
        duck.quack();                  // fine - same package
        System.out.print(duck.noise);  // fine - same package
    }
}
```

```java
// pond.swan package - different package, so package access fails
import pond.duck.MotherDuck;
public class BadCygnet {
    public void makeNoise() {
        var duck = new MotherDuck();
        duck.quack();                  // DOES NOT COMPILE - different package
        System.out.print(duck.noise);  // DOES NOT COMPILE - different package
    }
}
```

---

### Protected Access

Protected grants everything package access gives, plus access from subclasses regardless
of package. A subclass gains access to all `protected` and `public` members of its parent
as if they were declared in the subclass itself.

```java
// pond.shore package
public class Bird {
    protected String text = "floating";
    protected void floatInWater() {
        System.out.print(text);  // fine - same class
    }
}
```

**Subclass in a different package -- inheriting directly:**

```java
// pond.goose package - different package, but extends Bird
import pond.shore.Bird;
public class Gosling extends Bird {
    public void swim() {
        floatInWater();          // fine - inherited protected method
        System.out.print(text);  // fine - inherited protected field
    }
}
```

**Same package -- package access portion of protected:**

```java
// pond.shore package - same package as Bird, no inheritance needed
public class BirdWatcher {
    public void watchBird() {
        Bird bird = new Bird();
        bird.floatInWater();           // fine - same package
        System.out.print(bird.text);   // fine - same package
    }
}
```

**Different package, not a subclass -- no access:**

```java
// pond.inland package - different package, does not extend Bird
import pond.shore.Bird;
public class BirdWatcherFromAfar {
    public void watchBird() {
        Bird bird = new Bird();
        bird.floatInWater();           // DOES NOT COMPILE
        System.out.print(bird.text);   // DOES NOT COMPILE
    }
}
```

---

### Protected Access -- The Reference Type Gotcha

This is one of the most confusing points on the exam. Protected access through a variable
depends on the **declared type of the reference**, not the actual runtime object.

The rule splits into two scenarios:

- **Access without a variable (inherited directly):** protected access is always allowed
  inside a subclass when you call a method or read a field directly by name (inherited
  from the parent). No variable is involved -- you are just using something you own
  through inheritance.
- **Access through a variable:** the declared type of the variable must be the subclass
  itself or a further subclass. Using a parent-type reference loses the protected access,
  even if the code is inside a subclass.

##### Why these two scenarios exist and what they really mean

**Scenario 1 -- no variable, just inheritance:**

When you write `floatInWater()` or `text` directly inside `Swan` without any object
reference in front of it, what you are really doing is calling `this.floatInWater()` or
accessing `this.text`. The implicit `this` is a `Swan`. You are not reaching into some
external object -- you are using something your own class inherited. Java says: you are a
subclass, these members are now yours, use them freely. Protected access is the whole
point of inheritance.

**Scenario 2 -- through a variable:**

When you write `other.floatInWater()`, there is now an explicit object reference involved.
Java has to decide: does the code that holds this reference have the right to call a
protected member on it?

The rule is: the code is allowed to access protected members through a variable only if
the declared type of that variable is the same class as the code you are in, or a subclass
of it. In other words, the variable must be "at least as specific" as the current class.

The reason is subtle but important. Protected access exists so that a subclass can work
with the inherited parts of its own objects. If you have a `Bird`-typed variable, you are
working with something that could be any `Bird` -- not necessarily a `Swan`. Java does not
want `Swan` to be able to reach into arbitrary `Bird` objects and access protected members
that `Bird` deliberately restricted to its own package. Only the package and its subclasses
should have that power, and you only get it for your own subclass type.

Think of it this way: protected access gives you a privilege for your own subclass lineage,
not a general pass to manipulate any instance of the parent class from anywhere.

```
Swan code is asking:
  "Can I call floatInWater() on this variable?"

If the variable is declared as Swan (or a subclass of Swan):
  YES - you are working within your own subclass lineage.

If the variable is declared as Bird (the parent):
  NO - Bird is in a different package.
       You are not in Bird's package, and you are not using inheritance here.
       You are just holding a Bird reference and trying to poke at its internals.
```

**The runtime object is irrelevant -- the compiler only sees the declared type:**

```java
Bird other = new Swan();      // runtime object IS a Swan
other.floatInWater();         // DOES NOT COMPILE
```

Even though `new Swan()` creates a `Swan` at runtime, the compiler only knows that
`other` is declared as `Bird`. It applies the rules for `Bird`. `Bird` is in a different
package. Access denied.

This is a fundamental Java principle: **access control is checked at compile time using
declared types, not at runtime using actual objects.**

```java
// pond.swan package - extends Bird
import pond.shore.Bird;
public class Swan extends Bird {

    public void swim() {
        floatInWater();              // fine - direct inheritance, no variable involved
        System.out.print(text);      // fine - direct inheritance
    }

    public void helpOtherSwanSwim() {
        Swan other = new Swan();
        other.floatInWater();        // fine - variable type is Swan (a subclass of Bird)
        System.out.print(other.text); // fine - same reason
    }

    public void helpOtherBirdSwim() {
        Bird other = new Bird();
        other.floatInWater();        // DOES NOT COMPILE - variable type is Bird
        System.out.print(other.text); // DOES NOT COMPILE - Bird ref, different package, not inheriting here
    }
}
```

`helpOtherBirdSwim` fails even though Swan extends Bird. The issue is that `other` is
declared as type `Bird`, and `Bird` is in a different package. The code using a `Bird`
reference is not in the same package as `Bird` and is not going through inheritance --
it is going through a `Bird`-typed variable. That reference type does not qualify for
protected access outside its package.

The two-phase mental check:
1. Is the class a subclass of the class that declared the protected member? (Swan extends Bird -- yes.)
2. Is the variable reference the subclass type (or a further subclass)? (Bird reference -- no.)

Both must be true when accessing through a variable. If the reference type is the parent
class and you are in a different package, it does not compile.

**Same rule applied to Goose:**

```java
// pond.goose package - extends Bird
import pond.shore.Bird;
public class Goose extends Bird {

    public void helpGooseSwim() {
        Goose other = new Goose();
        other.floatInWater();         // fine - Goose reference, Goose is the subclass
        System.out.print(other.text); // fine
    }

    public void helpOtherGooseSwim() {
        Bird other = new Goose();     // runtime object is Goose, but declared type is Bird
        other.floatInWater();         // DOES NOT COMPILE - Bird reference, different package
        System.out.print(other.text); // DOES NOT COMPILE
    }
}
```

The runtime object on line `Bird other = new Goose()` is actually a `Goose`, but the
declared (compile-time) type is `Bird`. The compiler works with declared types, not runtime
types. `Bird` is in a different package and this code is not in an inheritance relationship
with `Bird` at the point of access -- it is just holding a `Bird` reference. Compile error.

**Protected access does not extend to unrelated callers:**

```java
// pond.duck package - not a subclass of Bird or Goose
import pond.goose.Goose;
public class GooseWatcher {
    public void watch() {
        Goose goose = new Goose();
        goose.floatInWater(); // DOES NOT COMPILE
    }
}
```

`floatInWater()` is declared in `Bird`. `GooseWatcher` is not in the same package as
`Bird`, and it does not extend `Bird`. The fact that `Goose` extends `Bird` and was granted
protected access does not transfer to `GooseWatcher`. Protected access is earned by each
class for itself through inheritance -- it cannot be borrowed by an unrelated third class
just because it holds a reference to a subclass.

Protected access is personal to the class that inherits it. `Goose` earned the right to
call `floatInWater()` because `Goose` extends `Bird` -- and that right exists only inside
`Goose`'s own methods. The moment you are writing code inside `GooseWatcher`, you are a
third party. `GooseWatcher` never extended `Bird`, so it never earned that right. It does
not matter that the object it holds happens to be a `Goose` that did earn it.

The rule of thumb: protected access is determined by **which class the code is written in**,
not by what object you happen to be holding at the time.

---

### Public Access

`public` is the simplest modifier: any class from anywhere can access the member. No
package relationship or inheritance required.

```java
// pond.duck package
public class DuckTeacher {
    public String name = "helpful";
    public void swim() {
        System.out.print(name);  // public access is fine within same class
    }
}
```

```java
// pond.goose package - different package, no inheritance
import pond.duck.DuckTeacher;
public class LostDuckling {
    public void swim() {
        var teacher = new DuckTeacher();
        teacher.swim();                        // allowed - public
        System.out.print("Thanks" + teacher.name); // allowed - public
    }
}
```

`LostDuckling` is in a completely different package and does not extend `DuckTeacher`.
None of that matters because `public` imposes no restrictions at all.

One caveat: the Java module system (Chapter 12) can restrict access to `public` members
across module boundaries. For the purposes of this chapter, assume all code is in the same
module unless told otherwise.

---

### Access Modifier Summary

| Accessible from | `private` | package | `protected` | `public` |
|---|---|---|---|---|
| Same class | Yes | Yes | Yes | Yes |
| Same package, different class | No | Yes | Yes | Yes |
| Different package, subclass | No | No | Yes | Yes |
| Different package, not a subclass | No | No | No | Yes |

---

### Accessing static Data

When `static` is applied to a variable, method, or class, it belongs to the **class itself**
rather than to any particular instance. There is only one copy, shared across all instances.

---

### Designing static Methods and Variables

Instance variables and methods require an object to exist. Static ones do not. They live on
the class and are accessible whether or not any instance has ever been created.

```java
public class Penguin {
    String name;                        // instance variable - one per object
    static String nameOfTallestPenguin; // static variable - one for the whole class
}
```

```java
var p1 = new Penguin();
p1.name = "Lilly";
p1.nameOfTallestPenguin = "Lilly";

var p2 = new Penguin();
p2.name = "Willy";
p2.nameOfTallestPenguin = "Willy";

System.out.println(p1.name);                 // Lilly
System.out.println(p1.nameOfTallestPenguin); // Willy
System.out.println(p2.name);                 // Willy
System.out.println(p2.nameOfTallestPenguin); // Willy
```

`name` belongs to each `Penguin` object separately, so `p1.name` and `p2.name` are
independent. `nameOfTallestPenguin` is static -- there is only one copy. When `p2` sets it
to `"Willy"`, reading it back through `p1` also returns `"Willy"`.

##### Two main uses for static methods

- **Utility / helper methods** that do not need any object state. The caller does not have
  to instantiate anything just to call the method.
- **Shared state** across all instances (e.g. a counter). Methods that only work with that
  shared state should also be static.

`main()` is itself a static method. The JVM calls `Koala.main()` to start the program, and
you can call it the same way from other classes:

```java
public class Koala {
    public static int count = 0;
    public static void main(String[] args) {
        System.out.print(count);
    }
}

public class KoalaTester {
    public static void main(String[] args) {
        Koala.main(new String[0]); // prints 0
    }
}
```

---

### Accessing a static Variable or Method

The standard way to access a static member is through the class name:

```java
public class Snake {
    public static long hiss = 2;
}

System.out.println(Snake.hiss); // 2
```

##### Accessing static through an instance reference (the null trap)

Java also allows accessing a static member through an instance variable. The compiler
looks at the **declared type** of the reference and routes the call to the static member on
that class. The actual object (or lack of one) is irrelevant.

```java
Snake s = new Snake();
System.out.println(s.hiss); // 2 - s is of type Snake, hiss is static

s = null;
System.out.println(s.hiss); // 2 - still works! s is null but its type is still Snake
```

The exam will try to trick you into thinking a `NullPointerException` is thrown here.
It is not. For static access, Java only cares about the declared type of the reference, not
the object it points to.

##### Only one copy -- all instance references point to the same value

```java
Snake.hiss = 4;
Snake snake1 = new Snake();
Snake snake2 = new Snake();
snake1.hiss = 6;
snake2.hiss = 5;
System.out.println(Snake.hiss); // 5
```

There is only one `hiss` variable. Every assignment -- whether through `Snake.hiss`,
`snake1.hiss`, or `snake2.hiss` -- writes to the same memory location. The final value is 5.
The individual instance references are just distractions.

---

### Class vs. Instance Membership

A static method or variable belongs to the class. An instance method or variable belongs
to an object. The rule that flows from this:

- **Static code cannot directly call instance methods or access instance variables** without
  an explicit reference to an object. Static context has no `this`.
- **Instance code can freely call static methods and access static variables** because static
  members exist independently of any instance.

```java
public class MantaRay {
    private String name = "Sammy";  // instance variable

    public static void first() {}
    public static void second() {}
    public void third() { System.out.print(name); }

    public static void main(String[] args) {
        first();     // fine - static calling static
        second();    // fine - static calling static
        third();     // DOES NOT COMPILE - static calling instance method without a reference
    }
}
```

Making `third()` static does not fix it -- it just moves the problem:

```java
public static void third() { System.out.print(name); } // DOES NOT COMPILE - name is an instance variable
```

**Fix 1 -- make the variable static as well:**

```java
private static String name = "Sammy";
public static void third() { System.out.print(name); } // fine now
```

**Fix 2 -- keep everything as instance and create an object:**

```java
public static void main(String[] args) {
    var ray = new MantaRay();
    ray.third(); // fine - calling instance method on an instance
}
```

##### The full call matrix

Given:

```java
public class Giraffe {
    public void eat(Giraffe g) {}
    public void drink() {}
    public static void allGiraffeGoHome(Giraffe g) {}
    public static void allGiraffeComeOut() {}
}
```

| Caller | Calling | Legal? | Reason |
|---|---|---|---|
| `allGiraffeGoHome()` | `allGiraffeComeOut()` | Yes | static calling static |
| `allGiraffeGoHome()` | `drink()` | No | static calling instance without a reference |
| `allGiraffeGoHome()` | `g.eat()` | Yes | static calling instance through an explicit reference |
| `eat()` | `allGiraffeComeOut()` | Yes | instance calling static |
| `eat()` | `drink()` | Yes | instance calling instance (same class, implicit this) |
| `eat()` | `g.eat()` | Yes | instance calling instance through an explicit reference |

##### A fuller example

```java
public class Gorilla {
    public static int count;                            // static variable
    public static void addGorilla() { count++; }        // static method using static variable - fine
    public void babyGorilla() { count++; }              // instance method using static variable - fine

    public void announceBabies() {
        addGorilla();   // instance calling static - fine
        babyGorilla();  // instance calling instance - fine
    }

    public static void announceBabiesToEveryone() {
        addGorilla();   // static calling static - fine
        babyGorilla();  // DOES NOT COMPILE - static calling instance without a reference
    }

    public int total;
    public static double average = total / count; // DOES NOT COMPILE - static initializer using instance variable
}
```

`total` is an instance variable. A static variable's initializer runs when the class is loaded,
before any instance exists. There is no object to get `total` from, so the compiler rejects it.

##### Common pattern: static counter

```java
public class Counter {
    private static int count;

    public Counter() { count++; }  // every new object increments the shared count

    public static void main(String[] args) {
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        Counter c3 = new Counter();
        System.out.println(count); // 3
    }
}
```

`count` is automatically initialized to `0` (the default for `int` fields). Each constructor
call increments the single shared copy. Note that inside the class you can write `count`
directly without `Counter.count` -- the compiler infers the class from context.


---

### static Variable Modifiers

Static variables can use the same modifiers as instance variables: `final`, `transient`,
and `volatile`. The most important combination for the exam is `static final`, which
is used to create **constants**.

##### Constants

A constant is a static variable that never changes after it is set. Convention: all uppercase
letters with underscores between words.

```java
public class ZooPen {
    private static final int NUM_BUCKETS = 45;

    public static void main(String[] args) {
        NUM_BUCKETS = 5; // DOES NOT COMPILE - final variable cannot be reassigned
    }
}
```

`final` on a reference type (array or object) only locks the reference -- the contents can
still be mutated:

```java
import java.util.*;
public class ZooInventoryManager {
    private static final String[] treats = new String[10];

    public static void main(String[] args) {
        treats[0] = "popcorn"; // fine - mutating the array contents, not reassigning treats
    }
}
```

##### Where static final variables must be assigned

A `static final` variable must be assigned exactly once. There are only two places this
is allowed:

1. At the point of declaration.
2. In a **static initializer block** (covered below).

There is no static constructor in Java, so the static initializer is the only alternative
to inline declaration.

```java
public class Panda {
    final static String name = "Ronda";   // assigned at declaration
    static final int bamboo;              // assigned in static initializer below
    static final double height;           // DOES NOT COMPILE - never assigned anywhere

    static { bamboo = 5; }
}
```

---

### static Initializers

A **static initializer** is a block of code marked with `static` that runs **once, when the
class is first loaded** -- before any instance is created and before any static method is called.

```java
static {
    // code here
}
```

##### Refresher: when do instance initializers run? (from Chapter 1)

Instance initializer blocks (braces in the class body, no `static` keyword) run **each
time a new object is created**, as part of the construction sequence:
1. Fields and instance initializer blocks run in file order.
2. The constructor runs last, after all of them.

So instance initializers are tied to object creation. Every `new MyClass()` triggers them.

##### Why use a static initializer instead?

Static variables belong to the class, not to any object. They need to be set up **once**
when the class loads, not once per object. An instance initializer would run every time a
new object is created -- that is the wrong timing for something that only exists once.

A static initializer runs at class load time. There is no object yet. There is no `this`. It
is the right place to set up anything that belongs to the class itself.

The practical use case: when the value of a `static final` variable requires computation
or depends on other static variables, you cannot set it inline in a simple expression. The
static initializer gives you a block where you can write multiple statements.

```java
private static final int NUM_SECONDS_PER_MINUTE;
private static final int NUM_MINUTES_PER_HOUR;
private static final int NUM_SECONDS_PER_HOUR;

static {
    NUM_SECONDS_PER_MINUTE = 60;
    NUM_MINUTES_PER_HOUR = 60;
}

static {
    NUM_SECONDS_PER_HOUR = NUM_SECONDS_PER_MINUTE * NUM_MINUTES_PER_HOUR;
}
```

You can have multiple static initializer blocks. They all run in the order they appear in
the file. The second block above can safely use `NUM_SECONDS_PER_MINUTE` because the
first block already set it.

##### The key distinction in one sentence

| | Instance initializer | Static initializer |
|---|---|---|
| Runs | Every time a new object is created | Once, when the class is first loaded |
| Has access to | Instance variables, `this` | Static variables only -- no `this` |
| Purpose | Set up per-object state | Set up class-level (shared) state |

##### Detailed example

```java
// line 14
private static int one;
// line 15
private static final int two;
// line 16
private static final int three = 3;
// line 17
private static final int four;   // DOES NOT COMPILE - never assigned anywhere

static {
    one = 1;      // fine - not final, can be assigned freely
    two = 2;      // fine - first and only assignment of this final variable
    three = 3;    // DOES NOT COMPILE - three was already assigned on line 16
    two = 4;      // DOES NOT COMPILE - second assignment of a final variable
}
```

- `one`: not `final`, can be assigned as many times as needed. Fine.
- `two`: declared `final` with no inline value. The static block is its first and only
  assignment. Fine on the first line, compile error on the second (`two = 4`).
- `three`: declared `final` and already assigned on line 16. Trying to assign it again in
  the static block is a second assignment -- compile error.
- `four`: declared `final` and never assigned anywhere. The compiler knows the static
  block is the only place it could have been set, sees it was not, and rejects it.


---

### Avoid static and Instance Initializers When Possible

Instance initializers should generally be replaced by constructors -- constructors are easier
to read and serve the same purpose. The one common legitimate use for a static initializer
is when you need to initialize a static field and the setup requires more than one line (for
example, building a collection). When you do use a static initializer, put all static
initialization in a single block so the order is obvious.

---

### static Imports

A regular import lets you use a class by its short name instead of its fully qualified name:

```java
import java.util.Arrays;
Arrays.asList("one", "two");  // without import: java.util.Arrays.asList(...)
```

A **static import** goes one level deeper. Instead of importing the class and then writing
`ClassName.member`, you import the **static member itself** so you can use it with no
class prefix at all.

```java
import java.util.List;
import static java.util.Arrays.asList;  // static import - note: "import static", not "static import"

public class ZooParking {
    public static void main(String[] args) {
        List<String> list = asList("one", "two");  // no "Arrays." prefix needed
    }
}
```

`asList` is a static method on `Arrays`. The static import lets you call it as if it were
defined locally in your own class.

##### Same concept with a static variable

```java
import static java.lang.Math.PI;

System.out.println(PI);        // instead of Math.PI
System.out.println(Math.PI);   // also still valid - both forms work
```

##### Wildcard static import

Just like regular imports, you can use `*` to import all static members of a class at once:

```java
import static java.lang.Math.*;

System.out.println(PI);      // Math.PI
System.out.println(sqrt(9)); // Math.sqrt(9)
System.out.println(abs(-5)); // Math.abs(-5)
```

##### Rules for static imports

- The syntax is `import static`, not `static import`. The keyword order matters.
- You can only static-import `static` members (static methods and static variables).
  Instance methods and instance fields cannot be static-imported.
- If a static import and a local variable or method in your own class have the same name,
  the local one wins (it shadows the import).
- If two different static imports bring in members with the same name, the compiler
  cannot resolve the ambiguity and the code does not compile.

```java
import static java.lang.Integer.parseInt;
import static java.lang.Long.parseLong;

// these are different names, no conflict - fine
parseInt("5");
parseLong("5");
```

```java
import static zoo.A.fly;
import static zoo.B.fly;  // DOES NOT COMPILE - ambiguous: which fly()?
```

##### When to use static imports

Static imports are most useful when you reference a lot of constants or utility methods
from one class repeatedly and the class prefix adds noise without adding clarity. A common
real-world example is test assertions:

```java
import static org.junit.jupiter.api.Assertions.*;

assertTrue(result);     // instead of Assertions.assertTrue(result)
assertEquals(3, size);  // instead of Assertions.assertEquals(3, size)
```

Use them sparingly. Overusing static imports makes it hard to tell where a method comes
from when reading the code.


---

### static Import Mistakes -- Common Exam Traps

```java
1: import static java.util.Arrays;          // DOES NOT COMPILE
2: import static java.util.Arrays.asList;   // fine
3: static import java.util.Arrays.*;        // DOES NOT COMPILE
4: public class BadZooParking {
5:     public static void main(String[] args) {
6:         Arrays.asList("one");            // DOES NOT COMPILE
7:         asList("one");                   // fine
8:     }
9: }
```

- **Line 1**: `import static` is only for static members (methods and variables). `Arrays`
  is a class, not a static member. Use a regular `import java.util.Arrays` to import a
  class.
- **Line 3**: the keywords are in the wrong order. The syntax is `import static`, never
  `static import`.
- **Line 6**: `asList` was static-imported on line 2, but the `Arrays` class itself was
  never imported. You can call `asList("one")` directly, but you cannot write
  `Arrays.asList("one")` because `Arrays` as a class name is unrecognized without a
  regular class import.

##### Local method shadows a static import

If your own class defines a method with the same name as a static import, Java prefers
the local one:

```java
import static java.util.Arrays.asList;

public class ZooParking {
    public static List<String> asList(String... items) {
        return new ArrayList<>();  // this local method is used instead of Arrays.asList
    }

    public static void main(String[] args) {
        asList("one", "two");  // calls ZooParking.asList, not Arrays.asList
    }
}
```


---

### Passing Data among Methods

Java is a **pass-by-value** language. When you call a method, the method receives a
**copy** of the variable. Assignments made to that copy inside the method do not affect
the caller's original variable.

```java
public static void main(String[] args) {
    int num = 4;
    newNumber(num);
    System.out.print(num); // 4 - unchanged
}

public static void newNumber(int num) {
    num = 8;  // only changes the local copy, not the caller's variable
}
```

Even if the parameter has the same name as the caller's variable, they are completely
independent. Same name, different variable. The exam uses matching names deliberately
to try to confuse you.

##### Passing a reference type -- reassignment vs. mutation

With reference types, the copy that gets passed is a copy of the **reference** (the address
pointing to the object). Both the caller and the method end up pointing at the same object.
This creates two distinct cases:

**Case 1 -- reassigning the parameter (caller is NOT affected):**

```java
public class Dog {
    public static void main(String[] args) {
        String name = "Webby";
        speak(name);
        System.out.print(name); // Webby - unchanged
    }

    public static void speak(String name) {
        name = "Georgette";  // reassigns the local copy of the reference to point elsewhere
    }
}
```

`speak` makes its local variable `name` point to a new `String`. The caller's variable
still points to `"Webby"`. The object was never touched.

**Case 2 -- calling a mutating method on the object (caller IS affected):**

```java
public class Dog {
    public static void main(String[] args) {
        var name = new StringBuilder("Webby");
        speak(name);
        System.out.print(name); // WebbyGeorgette
    }

    public static void speak(StringBuilder s) {
        s.append("Georgette");  // mutates the object both caller and method share
    }
}
```

No reassignment happened. `s` still points to the same `StringBuilder` the caller passed
in. `append` modifies the object in place, and since both references point to the same
object, the caller sees the change.

##### Why String specifically seems immutable-related (but isn't fully)

`String` being immutable means there is no method you can call on a `String` that changes
its contents. So with `String`, you are always forced into Case 1 (reassignment), and the
caller never sees a change.

But the root reason the caller's variable is unaffected is the **reassignment**, not the
immutability. Even if `String` were mutable, `name = "Georgette"` would still not affect
the caller -- it would just be pointing the local variable somewhere else.

If a hypothetical mutable `String` had an `append` method, this would affect the caller:

```java
name.append("Georgette");  // hypothetical - would mutate, caller would see it
```

But this would still not:

```java
name = "Georgette";  // always just a local reassignment, caller unaffected regardless of type
```

The rule:
- **Reassigning the parameter** (`param = something`) never affects the caller, for any type.
- **Calling a mutating method through the parameter** (`param.mutate()`) affects the caller,
  because both sides hold a reference to the same object.

##### Pass-by-value vs. pass-by-reference

In a **pass-by-reference** language, the method receives the actual variable, not a copy.
Reassigning the parameter inside the method would change the caller's variable too.

Java does not do this. The classic proof:

```java
public static void main(String[] args) {
    int original1 = 1;
    int original2 = 2;
    swap(original1, original2);
    System.out.println(original1); // 1 - unchanged
    System.out.println(original2); // 2 - unchanged
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;  // only swaps the local copies, caller's variables are untouched
}
```

In a pass-by-reference language, `original1` and `original2` would be swapped. In Java
they are not, because `a` and `b` are copies.

**Summary:**
- Java is always pass-by-value.
- For primitives: the value itself is copied. The method cannot affect the caller's variable.
- For reference types: the reference (address) is copied. The method cannot make the
  caller's variable point somewhere else, but it can mutate the shared object through
  the copied reference.


---

### Returning Objects

When a method returns, a copy of the primitive value or reference is handed back to the
caller. The caller can store it in a variable, pass it somewhere else, or ignore it entirely.
**If the return value is ignored, the result is simply thrown away** -- the original variable
in the caller is unaffected.

```java
public class ZooTickets {
    public static void main(String[] args) {
        int tickets = 2;          // tickets = 2
        String guests = "abc";    // guests = "abc"

        addTickets(tickets);           // return value ignored - tickets stays 2
        guests = addGuests(guests);    // return value stored - guests becomes "abcd"

        System.out.println(tickets + guests); // 2abcd
    }

    public static int addTickets(int tickets) {
        tickets++;       // increments the local copy to 3
        return tickets;  // returns 3, but the caller ignores it
    }

    public static String addGuests(String guests) {
        guests += "d";   // reassigns the local parameter to a new String "abcd"
        return guests;   // returns "abcd", caller stores it back into guests
    }
}
```

Step by step:
- `addTickets(tickets)` receives a copy of `2`, increments it to `3`, and returns `3`.
  The caller on line 5 does nothing with the returned value -- no assignment. The original
  `tickets` variable in `main` is still `2`.
- `addGuests(guests)` receives a copy of the reference to `"abc"`. Inside the method,
  `guests += "d"` creates a new `String "abcd"` and reassigns the local parameter to point
  to it. The method returns that new reference. The caller on line 6 **does** store the
  return value back into `guests`, so `guests` in `main` now points to `"abcd"`.

The change to `guests` happens because of the **returned value being assigned**, not
because of anything that happened to the parameter inside the method. If line 6 had been
written as just `addGuests(guests)` with no assignment, `guests` in `main` would still be
`"abc"`.

##### The ignored return value trap

The exam will show method calls where the return value is silently discarded:

```java
int score = 10;
addPoints(score);              // TRAP - return value ignored, score is still 10
score = addPoints(score);      // correct way to update score
```

When you see a method call that is not assigned to anything, the return value vanishes.
The original variable is unchanged.


---

### Wrapper Class Refresher (from Chapter 1)

Each primitive has a matching wrapper class -- an object that holds one primitive value.

| Primitive | Wrapper class |
|---|---|
| `boolean` | `Boolean` |
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `char` | `Character` |

##### The conversion methods

| Method                     | Called how               | Returns                    |
| -------------------------- | ------------------------ | -------------------------- |
| `Integer.valueOf(int)`     | static, pass a primitive | wrapper object (`Integer`) |
| `Integer.valueOf(String)`  | static, pass a String    | wrapper object (`Integer`) |
| `Integer.parseInt(String)` | static, pass a String    | **primitive** (`int`)      |
| `.intValue()`              | on a wrapper instance    | **primitive** (`int`)      |

##### Mental model

**`valueOf`** -- takes anything in (primitive or String), gives you a **wrapper object** out.
Think: "value **Of** something -> wrap it in an **Object**."
Works for every type: `Integer.valueOf(5)`, `Boolean.valueOf("true")`, `Long.valueOf(100L)`.

**`parseXxx`** -- takes a String in, gives you a **primitive** out. Parses text into a raw value.
Think: "**parse** the text -> plain primitive, no object."
`Integer.parseInt("5")` -> `int 5`. `Double.parseDouble("3.14")` -> `double 3.14`.
Only takes a String -- `Integer.parseInt(5)` does not compile.

**`xxxValue()`** -- called on a wrapper instance, pulls the primitive back out.
Think: "give me the **int value**, the **long value**, etc."
`myInteger.intValue()` -> `int`. `myDouble.longValue()` -> `long` (truncates decimal).
Only an instance method -- never called as a static method.

```
String / primitive  -->  valueOf()   -->  Wrapper object
String              -->  parseXxx()  -->  primitive
Wrapper object      -->  xxxValue()  -->  primitive
```

```java
int prim     = Integer.parseInt("123");  // primitive int
Integer wrap = Integer.valueOf("123");   // Integer object
Integer boxed = Integer.valueOf(42);     // primitive -> wrapper (manual boxing)
int unboxed   = boxed.intValue();        // wrapper -> primitive (manual unboxing)
```

`xxxValue()` can narrow the value and lose data if the target type is smaller:

```java
Double d = Double.valueOf("200.99");
d.intValue();   // 200   - decimal part truncated
d.byteValue();  // -56   - 200 doesn't fit in a byte, wraps around
```

##### The `==` trap with wrapper objects

`Integer.valueOf(int)` reuses cached objects for values between -128 and 127. Outside
that range, a new object is created each time. This means `==` gives inconsistent results
on wrapper objects -- always use `.equals()` to compare their values.

```java
Integer a = Integer.valueOf(100);
Integer b = Integer.valueOf(100);
System.out.println(a == b);      // true  - same cached object

Integer c = Integer.valueOf(1000);
Integer d = Integer.valueOf(1000);
System.out.println(c == d);      // false - different objects
System.out.println(c.equals(d)); // true  - correct way to compare
```



---

### Autoboxing and Unboxing Variables

**Autoboxing** is the compiler automatically converting a primitive to its wrapper class.
**Unboxing** is the compiler automatically converting a wrapper class back to its primitive.
The compiler inserts the `valueOf` and `xxxValue` calls for you so you don't have to.

```java
// manual (verbose)
int quack = 5;
Integer quackquack = Integer.valueOf(quack);  // boxing
int quackquackquack = quackquack.intValue();  // unboxing

// automatic (compiler does the same thing)
int quack = 5;
Integer quackquack = quack;      // autoboxing
int quackquackquack = quackquack; // unboxing
```

Works for every primitive/wrapper pair:

```java
Short tail = 8;                       // autoboxing: int literal 8 narrowed then boxed
Character p = Character.valueOf('p');
char paw = p;                          // unboxing

Boolean nose = true;                   // autoboxing

Integer e = Integer.valueOf(9);
long ears = e;                         // unboxing Integer -> int, then implicit widening to long
```

The last line does two things automatically: unboxes `Integer` to `int`, then widens `int`
to `long`. This is allowed.

---

### Limits of Autoboxing -- One Automatic Conversion at a Time

Java will do one automatic conversion at a time, but it will not chain two automatic
conversions together when going toward a wrapper type.

```java
Long badGorilla = 8; // DOES NOT COMPILE
```

`8` is an `int` literal. To reach `Long`, Java would need to either:
- Widen `int` to `long`, then autobox `long` to `Long` -- two automatic steps, not allowed.
- Autobox `int` to `Integer`, then assign `Integer` to `Long` -- incompatible types.

Neither works. The fix is to do one of the steps yourself:

```java
Long fine     = 8L;        // 8L is already a long literal, one autobox step to Long
Long alsoFine = (long) 8;  // explicit cast int -> long, then one autobox step to Long
```

##### The asymmetry: why unboxing + widening works but autoboxing + widening does not

| Direction | Steps | Allowed? |
|---|---|---|
| Wrapper -> primitive -> wider primitive | unbox, then widen | Yes |
| Narrower primitive -> wider primitive -> wrapper | widen, then autobox | No |

When **unboxing**, you land on a primitive first. Primitives can be widened freely. The
compiler is happy to do both in sequence.

When **autoboxing**, you need to arrive at the exact wrapper type. If the primitive type
does not match the wrapper exactly, the compiler will not widen it first and then box it.
You must do at least one of those steps explicitly.

```java
Integer e = 9;
long ears = e;   // allowed: Integer -> int (unbox) -> long (widen)

Long bad = 9;    // DOES NOT COMPILE: int -> long (widen) -> Long (box) - two auto steps
Long ok  = 9L;   // fine: long literal -> Long (one auto step)
```


---

### Unboxing null -- NullPointerException

A wrapper reference variable can hold `null` because it is a reference type. Trying to
unbox `null` to a primitive throws a `NullPointerException` at runtime, because unboxing
calls `xxxValue()` on the object, and calling any method on `null` blows up.

```java
Character elephant = null;     // fine - null is a valid value for a reference type
char badElephant = elephant;   // NullPointerException at runtime - tries to call charValue() on null
```

This compiles without error. The crash only happens at runtime when the unboxing is
actually attempted. Watch for `null` wrapper variables in any context where unboxing
would occur.

---

### Autoboxing and Unboxing in Method Calls

The same autoboxing and unboxing rules apply when passing arguments to methods.

```java
public class Chimpanzee {
    public void climb(long t) {}
    public void swing(Integer u) {}
    public void jump(int v) {}

    public static void main(String[] args) {
        var c = new Chimpanzee();
        c.climb(123);    // fine - int 123 widened to long (implicit cast)
        c.swing(123);    // fine - int 123 autoboxed to Integer
        c.jump(123L);    // DOES NOT COMPILE - long cannot be narrowed to int automatically
    }
}
```

- `climb(123)`: the method expects `long`. `123` is an `int`. Widening from `int` to `long`
  is automatic. Fine.
- `swing(123)`: the method expects `Integer`. `123` is an `int`. Autoboxing `int` to
  `Integer` is automatic. Fine.
- `jump(123L)`: the method expects `int`. `123L` is a `long`. Narrowing from `long` to
  `int` is never automatic -- it would risk losing data. Must be cast explicitly:
  `c.jump((int) 123L)`.

##### The same one-conversion limit applies to method calls

```java
public class Gorilla {
    public void rest(Long x) {}

    public static void main(String[] args) {
        var g = new Gorilla();
        g.rest(8);    // DOES NOT COMPILE - would need int -> long (widen) + long -> Long (box)
        g.rest(8L);   // fine - long literal, one autobox step to Long
        g.rest((long) 8); // fine - explicit cast to long, then one autobox step to Long
    }
}
```

`8` is an `int`. Getting to `Long` requires widening to `long` and then boxing to `Long`.
Java will not do both automatically. At least one step must be explicit.

##### Summary: what Java will and will not do automatically

| Scenario | Example | Allowed? |
|---|---|---|
| Widen primitive | `int` -> `long` | Yes |
| Autobox primitive | `int` -> `Integer` | Yes |
| Unbox wrapper | `Integer` -> `int` | Yes |
| Unbox then widen | `Integer` -> `int` -> `long` | Yes |
| Widen then autobox | `int` -> `long` -> `Long` | No |
| Narrow primitive | `long` -> `int` | No (must cast) |
| Unbox null | `null` -> `int` | NullPointerException at runtime |


---

### Overloading Methods

**Method overloading** is when two or more methods in the same class share the same name
but have different parameter lists. The compiler picks the right one based on the arguments
you pass.

The **only thing that makes overloads distinct is the parameter list** (types, number of
types, or order of types). Everything else -- return type, access modifier, `static` vs
instance, exception list -- is completely invisible to the overloading check.

```java
public class Falcon {
    public void fly(int numMiles) {}                                     // overload 1
    public void fly(short numFeet) {}                                    // overload 2 - different type
    public boolean fly() { return false; }                               // overload 3 - no parameters
    void fly(int numMiles, short numFeet) {}                             // overload 4 - more parameters
    public void fly(short numFeet, int numMiles) throws Exception {}     // overload 5 - same types, different order
}
```

Valid overloads: different type, different count, or different order of types. Return type,
access modifier, and `throws` clause are all irrelevant -- they can differ freely.

##### What does NOT count as overloading

```java
public class Eagle {
    public void fly(int numMiles) {}
    public int fly(int numMiles) { return 1; }  // DOES NOT COMPILE - same signature
}
```

The return type differs but the parameter list is identical. Same signature -- duplicate
method. The compiler rejects it.

```java
public class Hawk {
    public void fly(int numMiles) {}
    public static void fly(int numMiles) {}   // DOES NOT COMPILE - same signature
    public void fly(int numKilometers) {}     // DOES NOT COMPILE - same signature
}
```

- Static vs. instance makes no difference to the signature.
- Parameter names (`numMiles` vs `numKilometers`) make no difference to the signature.

Both are still `fly(int)` -- duplicate methods.

##### The one rule to remember

> The **only** thing that distinguishes overloads is the **parameter type list**
> (the types themselves, their count, or their order).
> Return type, access modifier, `static`, and `throws` do not count.

##### Calling overloaded methods

Java looks at the argument types you pass and picks the most specific matching overload:

```java
public class Dove {
    public void fly(int numMiles) { System.out.println("int"); }
    public void fly(short numFeet) { System.out.println("short"); }
}

// calling:
fly((short) 1);  // prints "short" - exact type match
fly(1);          // prints "int"   - 1 is an int literal
```

When there is no exact match, Java applies promotion rules (covered next) to find the
best fit.


---

### Overloading with Reference Types

When Java resolves an overloaded method call, it picks the **most specific** matching
overload. "Most specific" means the parameter type that is the closest match to what you
passed -- it prefers a direct type match over a supertype, and a supertype over `Object`.

```java
public class Pelican {
    public void fly(String s) { System.out.print("string"); }
    public void fly(Object o) { System.out.print("object"); }

    public static void main(String[] args) {
        var p = new Pelican();
        p.fly("test");  // prints "string" - String is an exact match
        System.out.print("-");
        p.fly(56);      // prints "object" - int autoboxed to Integer, no Integer overload, falls to Object
    }
}
// output: string-object
```

The resolution order Java follows for each call:
1. Exact type match.
2. Implicit widening (smaller primitive to larger).
3. Autoboxing (primitive to wrapper).
4. Varargs.
5. `Object` (every class ultimately extends `Object`).

```java
import java.time.*;
import java.util.*;

public class Parrot {
    public static void print(List<Integer> i) { System.out.print("I"); }
    public static void print(CharSequence c)  { System.out.print("C"); }
    public static void print(Object o)        { System.out.print("O"); }

    public static void main(String[] args) {
        print("abc");                           // C - String implements CharSequence
        print(Arrays.asList(3));                // I - Arrays.asList returns List<Integer>
        print(LocalDate.of(2019, Month.JULY, 4)); // O - LocalDate is neither CharSequence nor List
    }
}
// output: CIO
```

- `"abc"` is a `String`. `String` implements `CharSequence`, so `print(CharSequence)` is
  more specific than `print(Object)`. Picks `C`.
- `Arrays.asList(3)` returns a `List<Integer>`. Direct match on `print(List<Integer>)`.
  Picks `I`.
- `LocalDate` does not implement `CharSequence` and is not a `List`. Falls all the way to
  `print(Object)`. Picks `O`.

##### Additional examples

**Widening beats autoboxing:**

```java
public class Promo {
    public static void show(long x)    { System.out.print("long"); }
    public static void show(Integer x) { System.out.print("Integer"); }

    public static void main(String[] args) {
        show(5);  // prints "long" - widening int to long is preferred over autoboxing int to Integer
    }
}
```

Java prefers widening a primitive over autoboxing it. `int` -> `long` beats `int` -> `Integer`.

**Autoboxing beats varargs:**

```java
public class Promo2 {
    public static void show(Integer x)   { System.out.print("Integer"); }
    public static void show(int... x)    { System.out.print("varargs"); }

    public static void main(String[] args) {
        show(5);  // prints "Integer" - autoboxing is preferred over varargs
    }
}
```

**Subtype is more specific than supertype:**

```java
public class Promo3 {
    public static void show(Number n)  { System.out.print("Number"); }
    public static void show(Integer i) { System.out.print("Integer"); }

    public static void main(String[] args) {
        Integer val = 10;
        show(val);   // prints "Integer" - Integer is more specific than Number
    }
}
```

`Integer` extends `Number`. When the declared type of the argument is `Integer`, the
`Integer` overload is preferred over the `Number` one.

**No match at all -- compile error:**

```java
public class Promo4 {
    public static void show(String s) {}
    public static void show(int x) {}

    public static void main(String[] args) {
        show(3.14);  // DOES NOT COMPILE - double cannot match String or int
    }
}
```

`3.14` is a `double`. There is no `double` or `Double` overload, no widening path from
`double` to `String` or `int`, and no `Object` overload to fall back to. The compiler
cannot resolve the call.


---

### Overloading with Primitives

Java picks the most specific primitive overload first. If an exact match exists, it is used.
If not, Java widens to the next larger type until it finds a match.

```java
public class Ostrich {
    public void fly(int i)  { System.out.print("int"); }
    public void fly(long l) { System.out.print("long"); }

    public static void main(String[] args) {
        var p = new Ostrich();
        p.fly(123);    // int - exact match
        System.out.print("-");
        p.fly(123L);   // long - exact match
    }
}
// output: int-long
```

If the `int` overload were removed, `fly(123)` would print `long` -- Java would widen the
`int` to `long` to find a match. Java widens only when no better match exists.

---

### Overloading with Autoboxing

When both a primitive and its wrapper overload exist, Java always prefers the primitive
(no unnecessary work):

```java
public class Kiwi {
    public void fly(int numMiles) {}
    public void fly(Integer numMiles) {}
}

fly(3);   // calls fly(int) - primitive is the most specific match, no autoboxing needed
```

Java only autoboxes when there is no matching primitive overload. If `fly(int)` is removed,
then `fly(3)` would autobox `3` to `Integer` and call `fly(Integer)`.

---

### Overloading with Arrays -- Autoboxing Does NOT Apply

Autoboxing works on **individual values**. It does not apply to entire arrays.

```java
public static void walk(int[] ints) {}
public static void walk(Integer[] integers) {}
```

These are two separate overloads. Java will not convert between them automatically:

```java
int[] primitiveArr = {1, 2, 3};
Integer[] wrapperArr = {1, 2, 3};

walk(primitiveArr);  // calls walk(int[])     - exact match
walk(wrapperArr);    // calls walk(Integer[]) - exact match

walk(primitiveArr);  // cannot match walk(Integer[]) - no autoboxing of arrays
walk(wrapperArr);    // cannot match walk(int[])     - no unboxing of arrays
```

The reason autoboxing does not apply to arrays: autoboxing is one operation on one value.
Converting an `int[]` to an `Integer[]` would require boxing every element individually
and building an entirely new array. Java does not do that implicitly. If you need to pass an
`int[]` where `Integer[]` is expected, you must convert it manually.

Contrast with a single value:

```java
int x = 5;
// Java CAN autobox this to Integer - one operation on one value
// Java cannot autobox int[] to Integer[] - N operations, new array required
```


---

### Overloading with Varargs

Varargs and arrays compile to the same parameter list. This means you cannot overload a
method by having one version take an array and another take varargs of the same type --
they are the same signature to the compiler.

```java
public class Toucan {
    public void fly(int[] lengths) {}
    public void fly(int... lengths) {} // DOES NOT COMPILE - same signature as the line above
}
```

Even though the syntax looks different, both become `fly(int[])` at the bytecode level.

##### Calling them -- the difference that remains

If only one version exists (either array or varargs), the calling rules differ:

```java
fly(new int[] {1, 2, 3}); // valid for both the array version and the varargs version
fly(1, 2, 3);              // only valid for the varargs version - cannot pass stand-alone values to int[]
```

For overloading purposes, the parameter list is what matters, and they are identical. That
is the key point for the exam.
