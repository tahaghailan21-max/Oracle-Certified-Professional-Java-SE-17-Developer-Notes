### Statements and Blocks

A **statement** is a single complete unit of execution ending in `;`. A **block** is zero or
more statements wrapped in `{}`. A decision-making statement like `if` can target either one
- they are interchangeable.

To **prepend** means to attach something to the front. When the book says "prepend the `if`
statement to these examples", it means place the `if` before the existing statement or block.
The statement/block becomes the body that the `if` controls.

```java
// original single statement
patrons++;

// with if prepended (attached to the front)
if (ticketsTaken > 1)
    patrons++;

// original block
{
    patrons++;
}

// with if prepended (attached to the front)
if (ticketsTaken > 1) {
    patrons++;
}
```

Both forms are equivalent. Prefer the block form even for a single line - easier to add
statements later without breaking the structure.

### The if Statement

Executes a block only if a `boolean` expression is `true` at runtime.

```java
if (booleanExpression) {
    // runs only if true
}
```

Parentheses around the condition are required. Braces are required for multiple statements,
optional for a single one.

##### if requires a boolean - not 0 or 1
Unlike C or Python, Java will not accept a numeric value as an if condition. It must be a
`boolean` expression.
```java
int hourOfDay = 1;
if (hourOfDay) { }  // DOES NOT COMPILE - int is not boolean
```

##### The indentation trap - exam classic
Without braces, only the single next statement belongs to the `if`. Indentation is
whitespace and means nothing to the compiler.
```java
if (hourOfDay < 11)
    System.out.println("Good Morning");
    morningGreetingCount++;   // ALWAYS runs, regardless of the condition
```
To include both statements in the `if`, braces are required:
```java
if (hourOfDay < 11) {
    System.out.println("Good Morning");
    morningGreetingCount++;   // now only runs if condition is true
}
```
On the exam: always trace the braces, ignore the indentation.

### The else Statement

`else` provides an alternative branch when the `if` condition is `false`. The boolean is
only evaluated once.
```java
if (hourOfDay < 11) {
    System.out.println("Good Morning");
} else {
    System.out.println("Good Afternoon");
}
```

Chaining with `else if` lets you test multiple conditions in sequence. Java evaluates them
top to bottom and executes the first branch that matches. If none match, the final `else`
runs (if present).
```java
if (hourOfDay < 11) {
    System.out.println("Good Morning");
} else if (hourOfDay < 15) {
    System.out.println("Good Afternoon");
} else {
    System.out.println("Good Evening");
}
```

### Pattern Matching with instanceof (Java 16+)

Pattern matching is a technique of controlling program flow that only executes a section
of code that meets certain criteria. It is used in conjunction with `if` statements for
greater program control. It is a tool to reduce **boilerplate code** - code that tends to be
duplicated throughout a section of code over and over in a similar manner.

To understand why it was added, consider this code that takes a `Number` and compares it
to 5. `Integer` inherits from `Number`.

Without pattern matching, you check the type and then cast manually - two steps:
```java
void compareIntegers(Number number) {
    if (number instanceof Integer) {
        Integer data = (Integer) number;   // manual cast - boilerplate
        System.out.print(data.compareTo(5));
    }
}
```

With pattern matching, the check and the cast are combined into one:
```java
void compareIntegers(Number number) {
    if (number instanceof Integer data) {   // data is the pattern variable
        System.out.print(data.compareTo(5));
    }
}
```

`data` is called the **pattern variable**. It is only in scope inside the `if` block. Notice
this also avoids any potential `ClassCastException` because the cast is only executed if
the `instanceof` check returns `true`.

##### Pattern variable must be a strict subtype
The type of the pattern variable must be a **strict subtype** of the variable on the left
side - it cannot be the same type. This rule only applies to pattern matching, not to
traditional `instanceof`.

```java
Integer value = 123;
if (value instanceof Integer) { }        // fine - traditional instanceof, no pattern variable
if (value instanceof Integer data) { }   // DOES NOT COMPILE - same type, nothing to extract
```

The reason: if `value` is already declared as `Integer`, the compiler knows for a fact it's
an `Integer`. The check would always be true and the cast would be pointless - Java
disallows it because it serves no purpose.

For pattern matching to be meaningful, the left side must be a broader type so the check
is actually doing something at runtime:
```java
Number value = 123;
if (value instanceof Integer data) { }   // fine - Integer is a strict subtype of Number
```
Here `Number` is broad - `value` could be a `Double`, `Long`, etc. at runtime - so
checking and extracting `Integer` is meaningful.

One-liner: same type = compiler already knows, no point checking. Must be a strict subtype.

##### Limitations of subtype enforcement - non-final classes and interfaces
The compiler can only enforce the subtype rule strictly when it can prove at compile time
that the check is impossible. This depends on whether the class is **final** or not.

When a class is **non-final**, the compiler cannot rule out that some subclass of it also
implements an unrelated interface. For example, someone could write a class that extends
`Number` and also implements `List` - the compiler has to allow for that possibility.

```java
Number value = 123;
if (value instanceof List) { }        // compiles - Number is non-final, a subclass could implement List
if (value instanceof List data) { }   // compiles - same reason
```

When a class is **final**, no subclasses can exist, so the compiler knows for certain the
check can never be true and rejects it:
```java
Integer value = 123;
if (value instanceof List) { }        // DOES NOT COMPILE - Integer is final, can never be a List
```

One-liner: non-final = compiler gives the benefit of the doubt (a subclass might satisfy the
check). Final = compiler knows it's impossible and rejects it.

##### What final/non-final actually means on a class
`final` on a class means no one can extend it - it is the last in its inheritance line, no
subclasses allowed. `non-final` means the class can be extended freely.

```java
final class MyInteger { }
class Nope extends MyInteger { }   // DOES NOT COMPILE - can't extend a final class
```

This is why it matters for pattern matching: if a class is `final`, the compiler knows
exactly what it can and cannot be - there are no unknown subclasses to account for. If it
is non-final, subclasses could exist that implement anything, so the compiler has to allow
checks it might otherwise reject.

Note: this will make more sense after Chapter 7 when interfaces are covered in depth.

##### Don't reassign pattern variables
Reassigning a pattern variable is allowed but bad practice - it creates ambiguity about what
the variable actually holds. Use `final` to prevent it:
```java
if (number instanceof Integer data) {
    data = 10;   // allowed but bad practice
}

if (number instanceof final Integer data) {
    data = 10;   // DOES NOT COMPILE - final prevents reassignment
}
```

##### Pattern variables in expressions
The pattern variable can be used in the same line it is declared, for example as part of a
`&&` condition:
```java
void printIntegersGreaterThan5(Number number) {
    if (number instanceof Integer data && data.compareTo(5) > 0)
        System.out.print(data);
}
```
This works because `&&` short-circuits: if `instanceof` returns `false`, the right side never
runs, so `data` is never accessed when it isn't valid.

##### Flow scoping
The compiler applies **flow scoping** to pattern variables - the variable is only in scope
where the compiler can definitively guarantee the `instanceof` check was true. This is
determined by the branching logic of the program, not by curly braces.

**Case 1 - `||` kills the scope**
```java
if (number instanceof Integer data || data.compareTo(5) > 0)  // DOES NOT COMPILE
```
With `||`, if the left side is false the right side still runs - but if `instanceof` was false,
`data` was never created. The compiler can't guarantee `data` exists on the right side of
`||`, so it's out of scope. This is why `&&` works but `||` does not.

**Case 2 - outside the if block**
```java
if (number instanceof Integer data)
    System.out.print(data.intValue());  // fine - compiler knows instanceof was true here
System.out.print(data.intValue());      // DOES NOT COMPILE - outside the if, no guarantee
```
After the `if` ends, the compiler can no longer guarantee the check was true.

**Case 3 - the early return trick (the surprising one)**
```java
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    System.out.print(data.intValue());  // compiles fine
}
```
If execution reaches the last line, the `return` did not happen, which means the negated
`instanceof` was false, which means the original `instanceof` was true. The compiler
figures this out and keeps `data` in scope past the `if` block.

One-liner: flow scoping follows the logic of the program, not the curly braces. The variable
is in scope wherever the compiler can prove the instanceof check was true.

##### Flow scoping and else branches
If the early return trick is confusing, rewrite it mentally as an equivalent `else`:
```java
// original - early return
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    System.out.print(data.intValue());  // data in scope here
}

// equivalent with else - makes the scope clearer
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    else
        System.out.print(data.intValue());  // data clearly in scope in the else branch
}

// equivalent again, with the branches flipped
void printOnlyIntegers(Number number) {
    if (number instanceof Integer data)
        System.out.print(data.intValue());  // data in scope in the true branch
    else
        return;
}
```
All three are identical. The third form makes it most obvious: `data` is only used in the
branch where `instanceof` was true.

##### Pattern variable scope can extend beyond the if block
The variable is not strictly locked inside the `if` braces. It can be used after the `if`
ends, but only when the compiler can trace the logic and prove the `instanceof` must have
been true to reach that line.
```java
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    // outside the if block, but data is still in scope
    // the only way to reach this line is if instanceof was true - the return handles the false case
    System.out.print(data.intValue());  // compiles fine
}
```
If `instanceof` was false, we returned. So if we reach the last line, it must have been true.
The compiler follows that logic and keeps `data` in scope.

### The switch Statement

A switch statement evaluates a single value and redirects flow to the first matching `case`.
If no case matches, the optional `default` branch runs. If there is no `default`, the entire
switch is skipped.

```java
public void printDayOfWeek(int day) {
    switch (day) {
        case 0:
            System.out.print("Sunday");
            break;
        case 1:
            System.out.print("Monday");
            break;
        case 2, 3:                           // multiple values combined into one case
            System.out.print("Tue or Wed");
            break;
        default:
            System.out.print("Other");
    }
}
```

##### Fall-through in detail - the waterfall rule
Think of a switch as a waterfall. Once execution drops into a matching case, it flows
downward through every branch below it until it hits a `break` or the end of the switch.
Java does NOT re-check whether subsequent cases match - it just keeps executing.

```java
public void printSeason(int month) {
    switch (month) {
        case 1, 2, 3: System.out.print("Winter");
        case 4, 5, 6: System.out.print("Spring");
        default:       System.out.print("Unknown");
        case 7, 8, 9:  System.out.print("Summer");
        case 10,11,12: System.out.print("Fall");
    }
}
```
Calling `printSeason(2)` prints: `WinterSpringUnknownSummerFall`

Why? `month = 2` matches `case 1, 2, 3`. Execution starts there and prints "Winter".
There is no `break`, so it falls through into `case 4, 5, 6` (doesn't matter that 2 doesn't
match it - matching is already done). Prints "Spring". Falls through into `default`. Prints
"Unknown". Falls through into `case 7, 8, 9`. Prints "Summer". Falls through into
`case 10, 11, 12`. Prints "Fall". Hits the end of the switch, stops.

##### default - when it runs and when it doesn't
`default` is just another branch in the flow. It has no special immunity to fall-through.
Three scenarios:

**1. No case matches - default runs**
```java
int day = 9;
switch (day) {
    case 1: System.out.print("One"); break;
    case 2: System.out.print("Two"); break;
    default: System.out.print("Other");  // runs - nothing matched
}
// prints: Other
```

**2. A case matches and has a break - default is skipped**
```java
int day = 1;
switch (day) {
    case 1: System.out.print("One"); break;  // matches, break stops execution
    default: System.out.print("Other");      // never reached
}
// prints: One
```

**3. A case matches but has no break - falls through into default**
```java
int day = 1;
switch (day) {
    case 1: System.out.print("One");    // matches, no break
    default: System.out.print("Other"); // falls through into here
}
// prints: OneOther
```

**4. default is in the middle - only runs if no earlier case matched, then falls through**
```java
int day = 9;
switch (day) {
    case 1: System.out.print("One"); break;
    default: System.out.print("Other");  // runs because nothing matched
    case 2: System.out.print("Two");     // falls through into here from default (no break above)
}
// prints: OtherTwo
```
Notice default can appear anywhere. If it runs and has no break, it falls through into
whatever is below it just like any other case.

##### Supported types
Switch works with: `int`, `Integer`, `byte`, `Byte`, `short`, `Short`, `char`, `Character`,
`String`, `enum`, and (from Java 14+) `var` if the inferred type is one of the above.

It does NOT work with: `long`, `float`, `double`, `boolean`, or their wrappers.
```java
long x = 1;
switch (x) { }   // DOES NOT COMPILE - long not supported
```

The switch target variable is **not evaluated until runtime** - the compiler only knows its
type, not its actual value. For example:
```java
int day = getUserInput(); // value unknown at compile time
switch (day) { ... }      // day is only evaluated when this line actually runs
```
This is why case values must be compile-time constants - since the target value is resolved
at runtime, the compiler needs to verify all case values are valid and unambiguous at
compile time instead.

##### Case values must be compile-time constants
Case values cannot be variables - they must be literals, enum values, or `final` constants
whose value is known at compile time.

```java
final int getCookies() { return 4; }

void feedAnimals() {
    final int bananas = 1;    // final + literal = compile-time constant
    int apples = 2;           // not final
    int numberOfAnimals = 3;
    final int cookies = getCookies();  // final but assigned from a method call

    switch (numberOfAnimals) {
        case bananas:          // fine - final variable with literal value
        case apples:           // DOES NOT COMPILE - not final
        case getCookies():     // DOES NOT COMPILE - method call, resolved at runtime
        case cookies:          // DOES NOT COMPILE - final but value comes from a method
        case 3 * 5:            // fine - expression resolved at compile time (= 15)
    }
}
```

Rules:
- `final` + assigned from a **literal** = valid
- `final` + assigned from a **method call** = NOT valid, even if the method always returns the same value
- Non-final variable = NOT valid, even if its value is known
- Arithmetic expressions are valid if they resolve to a constant at compile time

Case values must also match the data type of the switch variable. You cannot use a
`String` case in an `int` switch.

##### Invalid syntax the exam uses to trick you
```java
// missing opening brace
switch (day)
    case 0: break;       // DOES NOT COMPILE

// case missing its colon
switch (day) {
    case 0
        break;           // DOES NOT COMPILE
}

// switching on an unsupported type
long x = 1;
switch (x) { }           // DOES NOT COMPILE - long not allowed

// case value is a variable, not a constant
int val = 1;
switch (day) {
    case val: break;     // DOES NOT COMPILE - must be compile-time constant
}
```

### The switch Expression (Java 14+)

A switch expression is a compact form of a switch statement that can return a value and
be assigned to a variable. Uses the arrow operator `->` instead of `:` and `break`.

```
int result = switch(variableToTest) {
    case constantExpression1 -> 5;                          // case expression - one line
    case constantExpression2, constantExpression3 -> {      // case block - uses yield
        yield 10;
    }
    default -> 20;
};
```

Key structural rules:
- Assignment is optional - the result can be used directly or ignored
- Parentheses around the variable are required
- Opening curly brace is required
- Arrow operator `->` is required for each branch
- Case expressions (one-liners) require a semicolon after the value
- Case blocks use `{}` and require `yield` to return a value
- `default` is required if not all possible values are covered
- A semicolon is required after the closing `}` of the entire switch expression

##### switch expression vs switch statement - side by side
```java
// old switch statement - verbose, needs break everywhere
public void printDayOfWeek(int day) {
    String result;
    switch (day) {
        case 0: result = "Sunday";    break;
        case 1: result = "Monday";    break;
        case 2: result = "Tuesday";   break;
        case 3: result = "Wednesday"; break;
        case 4: result = "Thursday";  break;
        case 5: result = "Friday";    break;
        case 6: result = "Saturday";  break;
        default: result = "Invalid";
    }
    System.out.print(result);
}

// new switch expression - compact, no break needed, no fall-through possible
public void printDayOfWeek(int day) {
    var result = switch (day) {
        case 0 -> "Sunday";
        case 1 -> "Monday";
        case 2 -> "Tuesday";
        case 3 -> "Wednesday";
        case 4 -> "Thursday";
        case 5 -> "Friday";
        case 6 -> "Saturday";
        default -> "Invalid value";
    };
    System.out.print(result);
}
```
Only one branch executes - no fall-through, no `break` needed.

##### Semicolons are required - easy to miss
Each case expression line needs its own semicolon, and the entire switch expression needs
one at the end. Missing any of them causes a compile error.
```java
var result = switch (bear) {
    case 30 -> "Grizzly"   // DOES NOT COMPILE - missing semicolon
    default -> "Panda"     // DOES NOT COMPILE - missing semicolon
};                         // semicolon after closing } is required

// fixed:
var result = switch (bear) {
    case 30 -> "Grizzly";
    default -> "Panda";
};
```

##### Combined cases and void return
Cases can be combined with commas. A switch expression can also have a `void` return
type (when no value is assigned), in which case it can't be assigned to a variable.
```java
public void printSeason(int month) {
    switch (month) {
        case 1, 2, 3  -> System.out.print("Winter");
        case 4, 5, 6  -> System.out.print("Spring");
        case 7, 8, 9  -> System.out.print("Summer");
        case 10,11,12 -> System.out.print("Fall");
    }
}
```
Calling `printSeason(2)` prints `Winter` only - one branch, no fall-through.

### Switch Expression Rules

Three additional rules apply specifically to switch expressions (on top of all existing
switch statement rules):

1. All branches that don't throw an exception must return a **consistent data type** if the
   switch expression returns a value.
2. If the switch expression returns a value, every case block (`{}`) must use `yield`.
3. A `default` branch is required unless all possible values are covered (enum) or the
   switch expression doesn't return a value.

##### Rule 1 - consistent return types
All case branches must return a type compatible with the variable being assigned. They
don't all have to be the exact same type, but they must all be assignable to the target.
```java
int size = switch (measurement) {
    case 5  -> 1;           // int - fine
    case 10 -> (short)2;    // short - fine, implicitly cast to int
    default -> 5;           // int - fine
    case 20 -> "3";         // DOES NOT COMPILE - String can't be assigned to int
    case 40 -> 4L;          // DOES NOT COMPILE - long can't be assigned to int
    case 50 -> null;        // DOES NOT COMPILE - null can't be assigned to int
};
```

##### Rule 2 - yield in case blocks
When does a switch expression return a value? Simple rule: **if it is assigned to a
variable, it returns a value. If it is not assigned, it does not.**
```java
var name = switch(fish) { ... };  // assigned - returns a value, yield required in blocks
switch(fish) { ... }              // not assigned - doesn't return, yield optional
```

`yield` is the keyword used to return a value from a case block. It is the switch
expression equivalent of `return` - it exists so Java knows you're returning from the
switch block, not from the surrounding method.

When to use `yield` vs writing the value directly:
- Arrow case with a **single expression** -> write the value directly, Java returns it implicitly
- Arrow case with a **block** `{}` -> must use `yield` explicitly
```java
var name = switch (fish) {
    case 1 -> "Goldfish";           // single expression - value returned directly
    case 2 -> { yield "Trout"; }    // block - yield required
    case 3 -> {
        if (length > 10) yield "Blobfish";
        else yield "Green";         // every path in the block must yield
    }
    default -> "Swordfish";
};
```

Every possible path through a case block must yield a value - the compiler checks all
branches, not just the ones it thinks will run at runtime:
```java
var name = switch (fish) {
    case 1 -> "Goldfish";
    case 2 -> { }                           // DOES NOT COMPILE - no yield
    case 3 -> {
        if (length > 10) yield "Blobfish";
    }                                       // DOES NOT COMPILE - no yield when length <= 10
    default -> "Swordfish";
};
```
Line 3's block doesn't compile even though `length` is 12 at runtime. The compiler
doesn't care about the runtime value - it sees a path (the `else`) with no `yield`.

##### Semicolon rules - where they go and where they don't
```java
var name = switch (fish) {
    case 1 -> "Goldfish"         // DOES NOT COMPILE - missing semicolon after expression
    case 2 -> { yield "Trout"; };  // DOES NOT COMPILE - extra semicolon after case block
    default -> "Swordfish";
}                                // DOES NOT COMPILE - missing semicolon after switch expression
```

Fixed:
```java
var name = switch (fish) {
    case 1 -> "Goldfish";          // semicolon after expression
    case 2 -> { yield "Trout"; }   // no semicolon after case block's brace
    default -> "Swordfish";
};                                 // semicolon after the whole switch expression
```

##### Rule 3 - covering all possible values
A switch expression that returns a value must handle every possible input value.

```java
// DOES NOT COMPILE - int has billions of possible values, not all covered
String type = switch (canis) {
    case 1 -> "dog";
    case 2 -> "wolf";
    case 3 -> "coyote";
};

// fine - default covers everything else
String type = switch (canis) {
    case 1 -> "dog";
    case 2 -> "wolf";
    case 3 -> "coyote";
    default -> "unknown";
};
```

For enums, you can cover all values explicitly without a `default`:
```java
enum Season { WINTER, SPRING, SUMMER, FALL }

String getWeather(Season value) {
    return switch (value) {
        case WINTER -> "Cold";
        case SPRING -> "Rainy";
        case SUMMER -> "Hot";
        case FALL   -> "Warm";
        // no default needed - all 4 enum values are covered
    };
}
```
Tip: still consider adding `default` to enum switches anyway. If someone adds a fifth
enum value later, the switch will suddenly fail to compile everywhere it's used without one.

### The while Loop

Repeats a block as long as a boolean expression is true. The condition is evaluated
**before** each iteration - if it's false on the first check, the body never runs.

```java
while (booleanExpression) {
    // body
}
```

```java
int roomInBelly = 5;
while (bitesOfCheese > 0 && roomInBelly > 0) {
    bitesOfCheese--;
    roomInBelly--;
}
```

```java
int full = 5;
while (full < 5) {
    System.out.println("Not full!"); // never prints - condition false from the start
    full++;
}
```

Use a while loop when you expect **zero or more** executions.

### The do/while Loop

Like a while loop but guarantees the body executes **at least once** - condition is checked
**after** each iteration, not before.

```java
do {
    // body
} while (booleanExpression);
```

```java
int lizard = 0;
do {
    lizard++;
} while (false);
System.out.println(lizard); // 1 - body ran once before the false condition was checked
```

Use a do/while when you need **one or more** executions.

### Infinite Loops

A loop whose termination condition is never reached. Always check that:
- The loop condition will eventually become false
- The variables the condition depends on are actually changing between iterations

```java
int pen = 2;
int pigs = 5;
while (pen < 10)
    pigs++;   // pen never changes - loop runs forever
```

### for Loops

Two types, both use the `for` keyword:
- **for loop** - basic, used when the number of iterations is known
- **for-each loop** - enhanced, used to iterate over collections or arrays

Both are covered in the following sections.

### The for Loop

```java
for (initialization; condition; update) {
    // body
}
```

Three sections separated by semicolons. Initialization and update can contain multiple
statements separated by commas. Condition is evaluated before each iteration - same as
while.

```java
for (int i = 0; i < 5; i++) {
    System.out.print(i + " ");
}
// prints: 0 1 2 3 4
```

##### Variable scope
Variables declared inside the initialization block are scoped to the loop only.
```java
for (int i = 0; i < 10; i++)
    System.out.println("Value is: " + i);
System.out.println(i);  // DOES NOT COMPILE - i out of scope
```

Declare the variable before the loop if you need it outside:
```java
int i;
for (i = 0; i < 10; i++)
    System.out.println("Value is: " + i);
System.out.println(i);  // prints: 10  (i was incremented to 10 before condition failed)
```

##### Reverse loops - exam trap
When you see `--` in a for loop, trace it carefully.

```java
for (var counter = 5; counter > 0; counter--)
    System.out.print(counter + " ");
// prints: 5 4 3 2 1

for (var counter = 4; counter > 0; counter--)
    System.out.print(counter + " ");
// prints: 4 3 2 1  (exits before printing 0)

for (var counter = 4; counter >= 0; counter--)
    System.out.print(counter + " ");
// prints: 4 3 2 1 0
```

On the exam: when you see a decrement for loop, check whether it's `> 0` or `>= 0`.

### for Loop Edge Cases

**1. Infinite loop - all three sections are optional, semicolons are not**
```java
for ( ; ; )
    System.out.println("Hello World");  // compiles, runs forever
```

**2. Multiple variables and update statements**
```java
int x = 0;
for (long y = 0, z = 4; x < 5 && y < 10; x++, y++)
    System.out.print(y + " ");
System.out.print(x + " ");
// prints: 0 1 2 3 4 5
```

**3. Redeclaring a variable that already exists - does not compile**
```java
int x = 0;
for (int x = 4; x < 5; x++)  // DOES NOT COMPILE - x already declared
    System.out.print(x);

// fix: assign without redeclaring
for (x = 0; x < 5; x++)      // fine
    System.out.print(x);
```

**4. Mixed types in initialization block - does not compile**
```java
for (long y = 0, int z = 4; ...)  // DOES NOT COMPILE - all vars must be the same type
```

**5. Using a loop variable outside the loop - does not compile**
```java
for (long y = 0, x = 4; x < 5 && y < 10; x++, y++)
    System.out.print(y + " ");
System.out.print(x);  // DOES NOT COMPILE - x scoped to the loop only
```

**Modifying loop variables inside the body - avoid**
```java
for (int i = 0; i < 10; i++)
    i = 0;   // resets i every iteration - infinite loop
```

### The for-each Loop

Designed to iterate over arrays and collections. No counter variable needed.

```java
for (SomeType variable : arrayOrCollection) {
    // variable holds the current element on each iteration
}
```

##### What is allowed on the right side
Must be either:
- A Java array
- An object that implements `java.lang.Iterable` (e.g. `List`, `Set`, but NOT `Map`)

##### for loop vs for-each - same result, less code
```java
// traditional for loop
public void printNames(String[] names) {
    for (int counter = 0; counter < names.length; counter++)
        System.out.println(names[counter]);
}

// for-each - cleaner, no counter needed
public void printNames(String[] names) {
    for (var name : names)
        System.out.println(name);
}
```

##### Works on arrays and Lists
```java
String[] colors = {"Red", "Green", "Blue"};
for (String color : colors)
    System.out.print(color + " ");
// prints: Red Green Blue

List<String> names = List.of("Alice", "Bob", "Charlie");
for (var name : names)
    System.out.print(name + " ");
// prints: Alice Bob Charlie
```

##### The variable gets a copy of the element, not a reference to the array slot
For primitives and Strings, modifying the loop variable does NOT change the original array:
```java
int[] numbers = {1, 2, 3};
for (int n : numbers) {
    n = n * 10;  // only changes the local copy, original array unchanged
}
System.out.println(numbers[0]);  // still 1
```

##### Does not compile examples
```java
// String is not an array or Iterable
String birds = "Jay";
for (String bird : birds)  // DOES NOT COMPILE
    System.out.print(bird);

// type mismatch
String[] sloths = new String[3];
for (int sloth : sloths)   // DOES NOT COMPILE - int is not compatible with String
    System.out.print(sloth);

// Map is not supported
Map<String, Integer> map = new HashMap<>();
for (var entry : map)      // DOES NOT COMPILE - use map.entrySet() instead
    System.out.print(entry);
```

##### var in for-each
```java
int[] scores = {90, 85, 78};
for (var score : scores)    // score inferred as int
    System.out.print(score + " ");
// prints: 90 85 78
```

### Nested Loops

A loop inside another loop. The inner loop runs completely on each iteration of the outer.

```java
int[][] myComplexArray = {{5,2,1,3},{3,9,8,9},{5,7,12,7}};

for (int[] mySimpleArray : myComplexArray) {
    for (int i = 0; i < mySimpleArray.length; i++)
        System.out.print(mySimpleArray[i] + "\t");
    System.out.println();
}
// prints:
// 5  2  1  3
// 3  9  8  9
// 5  7  12 7
```

##### Tricky nested loop - trace it
```java
int hungryHippopotamus = 8;
while (hungryHippopotamus > 0) {
    do {
        hungryHippopotamus -= 2;
    } while (hungryHippopotamus > 5);
    hungryHippopotamus--;
    System.out.print(hungryHippopotamus + ", ");
}
// prints: 3, 0,
```
- Outer iteration 1: do/while runs: 8->6->4 (exits, 4 not > 5). Then -- gives 3. Prints 3.
- Outer iteration 2: do/while runs once (do/while always runs at least once): 3->1. Then -- gives 0. Prints 0. Outer condition 0 > 0 is false, ends.

### Optional Labels

A label is an identifier followed by `:` that marks a statement. Used with `break` and
`continue` to target an outer loop from inside a nested loop. Convention: UPPER_SNAKE_CASE.

```java
OUTER_LOOP: for (int[] mySimpleArray : myComplexArray) {
    INNER_LOOP: for (int i = 0; i < mySimpleArray.length; i++) {
        System.out.print(mySimpleArray[i] + "\t");
    }
    System.out.println();
}
```

Labels only add value in nested structures. Technically can be applied to any statement
but that's considered bad practice:
```java
BAD_IDEA: if (frog > 10)
    EVEN_WORSE_IDEA: {
        frog++;
    }
```

### The break Statement

Exits the nearest enclosing loop (or switch) immediately. With an optional label, exits
the labeled outer loop instead.

```java
break;            // exits nearest loop
break LABEL_NAME; // exits the labeled outer loop
```

##### Practical example - searching a 2D array
```java
int[][] list = {{1,13},{5,2},{2,2}};
int positionX = -1, positionY = -1;

PARENT_LOOP: for (int i = 0; i < list.length; i++) {
    for (int j = 0; j < list[i].length; j++) {
        if (list[i][j] == searchValue) {
            positionX = i;
            positionY = j;
            break PARENT_LOOP;
        }
    }
}
// prints: Value 2 found at: (1,1)
```

Array layout:
```
[0][0]=1  [0][1]=13
[1][0]=5  [1][1]=2   <-- first match, stops immediately
[2][0]=2  [2][1]=2
```

##### Three behaviours side by side

**`break PARENT_LOOP`** - stops at first match
- i=0: no matches. i=1: match at [1][1], sets (1,1), breaks everything. Output: (1,1)

**`break` (no label)** - stops inner loop, outer continues
- i=0: no matches. i=1: match at [1][1], sets (1,1), breaks inner only. i=2: match at [2][0], sets (2,0), breaks inner. Outer tries i=3 but 3 < 3 is false, ends. Output: (2,0)

**No break** - visits every cell, last match wins
- Every cell visited. Matches at (1,1), (2,0), (2,1) - each overwrites the last. Output: (2,1)

| Code | Behaviour | Output |
|------|-----------|--------|
| `break PARENT_LOOP` | stops at first match | (1,1) |
| `break` | last row's first match wins | (2,0) |
| no break | last match in entire array wins | (2,1) |

### The continue Statement

Ends the **current iteration** and jumps to the condition check for the next iteration.
Targets the nearest inner loop by default, or a labeled outer loop if specified.

##### break vs continue - where each transfers control
```java
OUTER: for (int i = 0; i < 3; i++) {    // <-- break OUTER / continue OUTER jumps here
    for (int j = 0; j < 3; j++) {        // <-- continue jumps here (next j iteration)
        if (j == 1) {
            break;     // exits the inner loop entirely
            continue;  // skips rest of body, goes to j++, re-checks j < 3
        }
    }
}
```

##### Practical example - zookeeper
```java
CLEANING: for (char stables = 'a'; stables <= 'd'; stables++) {
    for (int leopard = 1; leopard < 4; leopard++) {
        if (stables == 'b' || leopard == 2) {
            continue CLEANING;
        }
        System.out.println("Cleaning: " + stables + "," + leopard);
    }
}
// prints:
// Cleaning: a,1
// Cleaning: c,1
// Cleaning: d,1
```

##### Three variations side by side

**`continue CLEANING`** - skip to next stable
```
Cleaning: a,1 / Cleaning: c,1 / Cleaning: d,1
```

**`continue`** - skip to next leopard
```
Cleaning: a,1 / Cleaning: a,3 / Cleaning: c,1 / Cleaning: c,3 / Cleaning: d,1 / Cleaning: d,3
```

**No continue** - everything prints
```
a,1 a,2 a,3 / b,1 b,2 b,3 / c,1 c,2 c,3 / d,1 d,2 d,3
```

### The return Statement as an Alternative to Labels

`return` inside a nested loop exits the method entirely - which exits all loops at once,
same effect as `break LABEL`.

```java
private static int[] searchForValue(int[][] list, int v) {
    for (int i = 0; i < list.length; i++) {
        for (int j = 0; j < list[i].length; j++) {
            if (list[i][j] == v) {
                return new int[]{i, j};  // exits both loops AND the method
            }
        }
    }
    return null;
}

int[] results = searchForValue(list, searchValue);
if (results == null)
    System.out.println("Value not found");
else
    System.out.println("Value found at: (" + results[0] + "," + results[1] + ")");
// prints: Value 2 found at: (1,1)
```

##### break/continue vs return - when to use which

**Use `break`/`continue` with labels** when you need fine-grained control - skipping
specific iterations of an outer loop while continuing to run others, or breaking one level
but not another.

**Use `return`** when the loop logic can be its own method. Two benefits:

Benefit 1 - cleaner calling code. With labels, `main` contains the loops and the logic.
With return, `main` just calls the method and handles the result:
```java
// with labeled break - main IS the search
PARENT_LOOP: for (int i = 0; i < list.length; i++) {
    for (int j = 0; j < list[i].length; j++) {
        if (list[i][j] == 2) { positionX = i; positionY = j; break PARENT_LOOP; }
    }
}

// with return - main has no idea how the search works
int[] result = searchForValue(list, 2);
```

Benefit 2 - reusability. Without a method you copy the loop everywhere:
```java
// copy 1 for listA, copy 2 for listB, copy 3 for listC...
// fix a bug = fix it in every copy
```
With a method, write once, call anywhere:
```java
int[] resultA = searchForValue(listA, target);
int[] resultB = searchForValue(listB, target);
int[] resultC = searchForValue(listC, target);
// fix a bug once, fixed everywhere
```

Tradeoff: `return` exits the whole method. If you need to keep doing work after the
loop in the same method, labels and `break` are the better tool.

### Unreachable Code

Any code placed immediately after a `break`, `continue`, or `return` in the same block
will not compile. The compiler doesn't evaluate whether the condition is logically possible
- it just sees a statement after a transfer keyword and rejects it.

##### Why the compiler catches this even when logic says it's impossible
The compiler does not simulate runtime conditions. It only looks at the structure of the
code. If it sees any statement after a `break`, `continue`, or `return` before the block
ends, it flags it as unreachable regardless of the condition.

```java
int checkDate = 0;
while (checkDate < 10) {
    checkDate++;
    if (checkDate > 100) {   // can NEVER be true, but compiler doesn't care
        break;
        checkDate++;         // DOES NOT COMPILE - unreachable
    }
}
```

##### continue - same rule
```java
if (minute++ > 2) {
    continue WATCH;
    System.out.print(minute);  // DOES NOT COMPILE - execution already left
}
```

##### return - even on the same line
```java
case 1: return; hour++;  // DOES NOT COMPILE - separated by semicolon, still unreachable
```
Java separates statements by semicolons, not line breaks.

##### The key rule
It does not matter:
- Whether the condition is logically possible or not
- Whether the loop runs zero or infinite times
- Whether the unreachable code is on the same line or the next

If there is any statement between a `break`/`continue`/`return` and the closing `}` of
its block, it will not compile.
