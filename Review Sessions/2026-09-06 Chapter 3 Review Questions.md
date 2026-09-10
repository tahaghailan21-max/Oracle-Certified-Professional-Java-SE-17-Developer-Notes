# Chapter 3 - Making Decisions: Review Questions
Date: 2026-09-06
Score: 14 / 29 (48%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | A,B,C,E,F,G | A,B,C,E,F,G    | correct |
| 2  | B           | B              | correct |
| 3  | A,D,F,H     | A,D,F,H        | correct |
| 4  | C           | F              | wrong   |
| 5  | G           | E              | wrong   |
| 6  | A,C,D,E     | C,D,E          | wrong   |
| 7  | D           | B,D            | wrong   |
| 8  | G           | G              | correct |
| 9  | G           | B,C,E          | wrong   |
| 10 | D           | E              | wrong   |
| 11 | D           | A              | wrong   |
| 12 | C           | C              | correct |
| 13 | G           | G              | correct |
| 14 | G           | B,D,F          | wrong   |
| 15 | F           | F              | correct |
| 16 | A,D,F       | A,B,D          | wrong   |
| 17 | G           | B,E            | wrong   |
| 18 | C,D,E,F     | C,E            | wrong   |
| 19 | F           | E              | wrong   |
| 20 | ?           | A,E            | wrong   |
| 21 | C           | E              | wrong   |
| 22 | G           | E              | wrong   |
| 23 | F           | F              | correct |
| 24 | G           | G              | correct |
| 25 | D           | D              | correct |
| 26 | F           | F              | correct |
| 27 | F           | F              | correct |
| 28 | ?           | F              | wrong   |
| 29 | ?           | C              | wrong   |

---

## Wrong Answers - Analysis

### Q4 | You answered C (Turtle) | Correct answer: F (None of the above - does not compile)
The switch expression has no `default` branch and does not cover all possible int values.
A switch expression that returns a value and is assigned to a variable must handle all
possible inputs. Since `category` is an `int` with billions of possible values, a `default`
is required. The code doesn't compile at all - so Turtle never gets printed.
Rule: switch expression + assigned to variable + non-enum type = `default` is mandatory.

### Q5 | You answered G (three or more don't compile) | Correct answer: E (exactly one line)
You spotted the unreachable `System.out.print(b + ", ")` after `continue` - correct.
But the third loop `for (Object c : myFavoriteNumbers)` actually compiles fine.
`myFavoriteNumbers` is a `List<Integer>`, and `Integer` is a subtype of `Object`, so
`Object c` is a compatible type for the loop variable. The rule: the loop variable must be
the same type or a **supertype** of the element type - not a subtype.

```java
List<Integer> list = new ArrayList<>();

for (Object c : list) { }    // fine - Object is a supertype of Integer
for (Integer c : list) { }   // fine - same type
for (Number c : list) { }    // fine - Number is a supertype of Integer
for (String c : list) { }    // DOES NOT COMPILE - String is unrelated to Integer
```

The opposite case - narrower type on the left:
```java
Object[] arr = {"hello", 42, 3.14};
for (Integer c : arr) { }   // DOES NOT COMPILE - can't narrow Object to Integer automatically
for (Object c : arr) { }    // fine - same type
for (var c : arr) { }       // fine - inferred as Object
```

No syntax error either - a for-each loop without braces is valid for a single statement.
Only one line doesn't compile: the print after `continue`. Answer is E.

### Q6 | You answered A,C,D,E | Correct answer: C,D,E
You included A: "A for-each loop can be executed on any Collections Framework object."
This is false. The **Collections Framework** is the set of Java classes and interfaces in
`java.util` designed for storing groups of objects. The main ones are:
- `List`, `Set`, `Queue`, `Deque` - these implement `Iterable`, so for-each works
- `Map` - does NOT implement `Iterable`, so for-each does NOT work directly

"Any Collections Framework object" is too broad - `Map` is a Collections Framework
class but cannot be used in a for-each loop. Option A is wrong.

### Q7 | You answered D only | Correct answer: B,D
You missed B: `int i=0; i<=weather.length-1; ++i`
This is equivalent to `i < weather.length` and correctly iterates from index 0 to the last
index. `weather.length-1` is the last valid index, and `<=` includes it. Both B and D
correctly iterate all elements - D in reverse, B in forward order. The question only asks
which ones print all elements, not in a specific order.

Note on `++i` in the update section: there is no difference between `++i` and `i++` in
the update section of a for loop. The update expression's return value is thrown away -
nothing uses it - so pre vs post increment makes zero difference there. Both just increment
i by 1 after each iteration.

```java
for (int i = 0; i < 5; i++)   // identical behaviour
for (int i = 0; i < 5; ++i)   // identical behaviour
```

The pre/post distinction only matters when the returned value is actually used, like in an
assignment or a condition:
```java
int i = 0;
int x = i++;  // x = 0, i = 1  (post: returns original value)
int y = ++i;  // y = 2, i = 2  (pre: returns new value)

// option F from Q7 - ++i IS in the condition, so its return value matters
for (int i = 0; ++i < 10 && i < weather.length; )
// first check: i incremented to 1 before comparison - weather[0] is never printed
```

### Q9 | You answered G (compiler error - no curly bracket) | Correct answer: B,C,E
The missing curly brace after the outer for loop is NOT a compiler error. A for loop
without braces is valid - it simply takes the next single statement as its body. In this case
the entire `RABBIT` loop is the single statement body of `BUNNY`.

The blank is inside the `if`. `count++` is NOT inside the `if` - it is always in the loop
body regardless. The blank only runs when `(col + row) % 2 == 0`.

**Step 1 - when is the condition true?**
`(col + row) % 2 == 0` means col + row is even (even+even or odd+odd).
```
row=1: col=0 -> 1 odd  | col=1 -> 2 EVEN | col=2 -> 3 odd
row=2: col=0 -> 2 EVEN | col=1 -> 3 odd  | col=2 -> 4 EVEN
row=3: col=0 -> 3 odd  | col=1 -> 4 EVEN | col=2 -> 5 odd
```
Condition is true at: (1,1), (2,0), (2,2), (3,1)

**Step 2 - without any blank, count = 9** (every col/row combination runs count++)

**Step 3 - to get count = 2, you need to skip 7 of those 9 increments**

The right approach: exit or skip the inner loop the moment the condition is true, and let
the outer loop keep going. That way only the first col=0 of rows 1 and 3 increment count.

**Tracing option B (`break RABBIT` - exits inner loop):**
- row=1, col=0: condition false, count++ -> count=1
- row=1, col=1: condition true -> break RABBIT. Inner ends. row=2.
- row=2, col=0: condition true -> break RABBIT. Inner ends. row=3.
- row=3, col=0: condition false, count++ -> count=2
- row=3, col=1: condition true -> break RABBIT. Inner ends. row=4 fails, done.
Final count = 2. Correct.

Option C (`continue BUNNY`) and E (`break` - targets nearest = RABBIT) produce the
same result for the same reason.

**Why A is wrong** (`break BUNNY` - exits everything):
- row=1, col=0: count++ -> count=1
- row=1, col=1: condition true -> break BUNNY. Everything stops. count = 1. Wrong.

**Why D and F are wrong** (`continue RABBIT`/`continue` - skip to next col):
These skip count++ for that one iteration but keep the inner loop running, so many more
increments happen. count ends up at 5, not 2.

### Q10 | You answered D (3 errors) | Correct answer: E (4 errors)
You correctly identified lines 16 (thursday is a parameter, not a compile-time constant)
and 18 (Sunday is not final). You missed two others:
- Line 15: `continue` cannot be used inside a switch statement - only `break` is valid
- Line 19: `DayOfWeek.MONDAY` is an enum value but `otherDay` is an `int` - type mismatch, case values must match the switch variable's type
That's 4 errors total: lines 15, 16, 18, 19. Answer is E.

### Q11 | You answered D (does not compile - assigning Animal to long) | Correct answer: A (prints 3)
The switch expression returns `1`, `2`, `3`, or `4` - all int literals. These are implicitly
widened to `long` when assigned to `long type`. There is no Animal being assigned to
long - the switch expression evaluates to a numeric value first, then that value is stored.
The `default` on line 17 is optional here since all enum values are covered, but it's
allowed. The code compiles and prints 3. Answer is A.

### Q14 | You answered G (does not compile - no parentheses after for-each) | Correct answer: B,D,F
For-each loops do not require parentheses around the body when it's a single statement -
same rule as `if` and `while`. All three loops compile fine.
- `new int[2]` is an int array, so `penguin` is `int` (not Integer) - answer B
- `Character[]` means each element is `Character` - answer D
- `List<Integer>` means each element is `Integer` - answer F

### Q16 | You answered A,D,F | Correct answer: A,B,D
You included F and missed B.
- F is wrong: `for(int i=wolf.length; i>0; --i)` starts at `wolf[wolf.length]` which
  is index 5 on a 5-element array (valid indices are 0-4). This throws
  `ArrayIndexOutOfBoundsException` at runtime.
- B is correct: `for(int m=wolf.length-1; m>=0; --m)` starts at index 4 (last element)
  and goes down to 0. Classic correct reverse loop.

### Q17 | You answered G (does not compile - no semicolons) | Correct answer: B,E
Empty loop bodies `{}` are valid Java - no semicolons needed inside them. All three loops
compile fine.

Semicolon rules per loop type:
- `for` - no semicolon after the closing `}`
- `while` - no semicolon after the closing `}`
- `do/while` - semicolon IS required after the closing `)` of the condition

```java
for (int i = 0; i < 5; i++) { }    // fine
while (x > 0) { }                  // fine
do { } while (x > 0);              // fine - semicolon required here
do { } while (x > 0)               // DOES NOT COMPILE - missing semicolon
```

The do/while needs it because `while(condition)` at the end looks like it could be a new
standalone while loop. The semicolon tells the compiler it's the end of the do/while.

Trace the values:
- `while`: participants starts at 4, incremented inside the condition each iteration.
  Loop ends when participants reaches 10. Final value: 10 -> E correct.
- `do/while`: animals starts at 2. Body runs once (do/while always runs at least once),
  `animals++` makes it 3, condition `2 <= 1` is false (original value used in check),
  loop ends. Final value: 3 -> B correct.
- `for`: performers starts at -1, goes to 1 after first iteration, then 3 after second.
  3 < 2 is false, loop ends. Final value: 3 -> B correct again (not a new distinct number).
Distinct values printed: 10 and 3. Answers B and E.

### Q18 | You answered C,D,E,F | Correct answer: C,E
You included D and F which are both wrong.

**D: "The pattern variable cannot be accessed after the if statement." - FALSE**
Flow scoping allows access outside the if block when the compiler can prove instanceof
was true to reach that line. From the Chapter 3 notes:

```java
// pattern variable used OUTSIDE the if block - compiles fine
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    // outside the if block, but data is still in scope
    // the only way to reach this line is if instanceof was true
    System.out.print(data.intValue());  // compiles fine
}
```
If instanceof was false, we returned. So if we reach the last line, it must have been true.
The compiler follows that logic and keeps data in scope.

**F: "Pattern matching can declare a variable with an else statement." - FALSE**
`else` has no boolean expression - there is nothing to check and nothing to bind a pattern
variable to. The pattern variable only makes sense paired with `instanceof` in a condition.

```java
// you cannot declare a pattern variable in an else
void example(Object obj) {
    if (obj instanceof String s) {
        System.out.print(s);       // fine - s declared in the instanceof condition
    } else (obj instanceof Integer i) {  // DOES NOT COMPILE - else has no condition
        System.out.print(i);
    }
}

// the correct way to check multiple types is else if, not else
void example(Object obj) {
    if (obj instanceof String s) {
        System.out.print(s);
    } else if (obj instanceof Integer i) {  // fine - else IF has a condition
        System.out.print(i);
    }
}
```
Pattern variables can only be declared in `if` and `else if` conditions, not in a bare `else`.

### Q19 | You answered F (infinite loop) | Correct answer: E (does not compile)
`snake` is declared inside the do/while body on line 4. It is a local variable scoped to
each iteration of the loop. Line 7 (`while (snake <= 5)`) is outside the loop body - at
that point `snake` is out of scope. The code does not compile. Not an infinite loop.

### Q20 | You skipped this | Correct answer: A,E
The key to this type of question: identify the problem first, then test each option.

**Step 1 - identify the problem**
L3 is `for(;;)` - an infinite loop with no exit condition. The question is about finding
a combination that prevents it from running forever.

**Step 2 - understand what each blank can do**
- Blank 1 (line 8): runs when `humidity-- % 12 == 0`. humidity starts at 12, so first
  check: `12 % 12 == 0` = true. After the check humidity becomes 11 (post-decrement).
- Blank 2 (line 12): runs when `temperature > 50`. temperature starts at 30 and
  increments each L3 iteration, so this triggers after 21 iterations.

**Step 3 - the goal**
Either never enter L3 at all, OR exit L3 once inside it.

**Option A: `break L2` on line 8, `continue L2` on line 12** - CORRECT
- Line 8: humidity=12, condition true -> `break L2` exits the do/while entirely,
  skipping L3 completely. L1 continues to next height iteration.
- L3 is never reached. No infinite loop.

**Option B: `continue` on line 8, `continue` on line 12** - WRONG
- Line 8: condition true -> `continue` targets L2 (nearest loop). Skips to L2's
  condition. humidity=11, still > 4, loops again.
- Second time: humidity=11, `11 % 12 != 0`, falls through to L3.
- Line 12: `continue` targets L3 (nearest loop). Just loops back to top of L3.
  temperature keeps incrementing but L3 never exits. Infinite loop.

**Option C: `break L3` on line 8, `break L1` on line 12** - WRONG
- `break L3` on line 8 - L3's label is not visible outside its own loop. Compiler error.

**Option D: `continue L2` on line 8, `continue L3` on line 12** - WRONG
- Line 8: condition true -> `continue L2`. Skips L3 first time. humidity=11.
- Second L2 iteration: humidity=11, condition false, falls through to L3.
- Line 12: `continue L3` loops back to top of L3. Infinite loop.

**Option E: `continue L2` on line 8, `continue L2` on line 12** - CORRECT
- Line 8: humidity=12, condition true -> `continue L2`. Skips L3. humidity=11.
  L2 condition `11 > 4` = true, loops again.
- Second L2 iteration: humidity=11, `11 % 12 != 0`, condition false. Falls through to L3.
- L3 runs. temperature increments each iteration. When temperature > 50 ->
  `continue L2` exits L3 and returns to L2's condition check. humidity has been
  decrementing each L2 iteration. Eventually humidity drops to 4 or below, L2 ends.
  L1 continues normally. No infinite loop.

**How to approach this type of question:**
1. Find the infinite loop first - that is always the problem
2. Eliminate options with compiler errors first (Option C)
3. For each remaining option, trace what happens to the infinite loop specifically
4. Eliminate anything that still reaches the infinite loop without a way out

### Q21 | You answered C (2 lines) | Correct answer: E (4 lines)
You spotted lines 23 (missing yield + semicolon) and 24 (extra semicolon). You missed:
- Line 22: `Long` is not a supported switch type. Only `int`, `byte`, `short`, `char` and
  their wrappers, plus `String` and `enum`. `Long` (wrapper of long) is not supported.
- Lines 25 and 26: duplicate case value `30`. Two cases with the same value don't compile.
Total: 4 lines. Answer is E.

**When yield is required vs not:**

yield is only relevant in switch expressions (the new `->` or block form), not switch statements.

| Situation | yield required? |
|---|---|
| Switch expression assigned to a variable, case is a single expression (`->`) | No - value returned implicitly |
| Switch expression assigned to a variable, case is a block (`-> {}`) | Yes - every path in the block must yield |
| Switch expression NOT assigned to a variable (void) | No - yield optional |
| Traditional switch statement (uses `:` and `break`) | Never - yield does not apply |

```java
// case expression - no yield needed, value returned directly
var result = switch (x) {
    case 1 -> "one";        // fine - implicit return
    default -> "other";
};

// case block - yield required
var result = switch (x) {
    case 1 -> { yield "one"; }    // fine
    case 2 -> { }                 // DOES NOT COMPILE - no yield
    case 3 -> {
        if (x > 0) yield "pos";   // DOES NOT COMPILE - no yield for the else path
    }
    default -> "other";
};

// not assigned - yield not required
switch (x) {
    case 1 -> System.out.print("one");  // fine, nothing to return
}
```

### Q22 | You answered G (does not compile - line 6) | Correct answer: E (5 2 1)
The code compiles without issue. `var one = 1` with `final` makes `one` a compile-time
constant, so `case one:` is valid. Line 6 has `default: case 3:` on one line - this is valid
syntax. In a switch statement, case labels are just markers and you can stack as many as
you want on the same line or on separate lines - the compiler treats them identically.

```java
// stacked on one line - valid
default: case 3: System.out.print(5 + " ");

// written separately - identical behaviour
default:
case 3:
    System.out.print(5 + " ");
```

This is how you target multiple values with the old `:` switch syntax. It is equivalent
to the new `,` syntax in switch expressions:
```java
// old syntax - stack labels
case 2:
case 3:
    System.out.print("two or three");  // runs if value is 2 OR 3

// new syntax - combine with comma
case 2, 3 -> System.out.print("two or three");
```

The exam uses the stacked form specifically to make it look like a syntax error when it isn't.

Note: the comma syntax `case 1, 2:` is only valid in switch expressions, NOT in switch
statements. In a traditional switch statement you must stack labels separately:
```java
// switch statement - comma NOT allowed
switch (x) {
    case 1, 2:                   // DOES NOT COMPILE in a switch statement
        System.out.print("one or two");
}

// switch statement - correct way
switch (x) {
    case 1:
    case 2:
        System.out.print("one or two");  // fine
}

// switch expression - comma IS allowed
var result = switch (x) {
    case 1, 2 -> "one or two";   // fine
    default -> "other";
};
```

Trace: `tailFeathers = 3`. Matches `case 3` directly (via the stacked label). Prints `5`.
While loop: `3 > 1` true, `--tailFeathers` = 2, prints 2. `2 > 1` true, `--tailFeathers`
= 1, prints 1. `1 > 1` false, loop ends. Output: `5 2 1`. Answer is E.

### Q28 | You skipped | Correct answer: F (does not compile)
Flow scoping is the key. After lines 41-42, if `fish` is NOT a String, `guppy` goes out
of scope. But if `fish` IS a String, `guppy` IS in scope after the if block. Line 43 then
tries to declare a NEW `guppy` in the else-if - but `guppy` is still in scope from line 41,
making it a duplicate variable declaration. The code does not compile.

**instanceof rule - how to read it:**
```
leftSide instanceof RightType
```
Returns `true` if the actual object pointed to by the left side IS an instance of the right
type or any subtype of it. Think of the right side as what you're hoping it is.

```java
Object obj = "hello";            // actual object is a String
obj instanceof Object   // true  - String IS an Object (going up the chain)
obj instanceof String   // true  - String IS a String (same type)
obj instanceof Integer  // false - String is NOT an Integer

Number num = Integer.valueOf(5); // actual object is an Integer
num instanceof Number   // true  - Integer IS a Number (going up)
num instanceof Integer  // true  - Integer IS an Integer (same type)
num instanceof Double   // false - Integer is NOT a Double
```

The declared type of the reference on the left does not matter - instanceof checks the
actual object in memory. Going UP the inheritance chain = true. Unrelated type = false.

### Q29 | You skipped | Correct answer: C (-1 0 1 2 3 4 5 6)
do/while with no braces: the single statement `System.out.print(++y + " ")` is the body.
`++y` is pre-increment - increments first, then uses the value.
- y starts at -2. First iteration: `++y` makes y = -1, prints -1.
- Continues while `y <= 5`. When y = 5: prints 5, then checks `5 <= 5` = true, loops again.
- y becomes 6, prints 6, checks `6 <= 5` = false, loop ends.
Output: -1 0 1 2 3 4 5 6. Answer is C.
Syntax note: do/while requires parentheses around the condition `while(y <= 5)` but does
NOT require braces around a single-statement body - same rule as for and while loops.

---

## Patterns to Watch

- Switch expression + assigned to variable + non-enum = `default` is mandatory
- For-each loop: only types implementing `java.lang.Iterable` work, not all Collections
  (Map does not implement Iterable)
- Empty loop bodies `{}` are valid - no semicolons required inside them
- `continue` cannot be used in a switch statement - only `break`
- Case values must match the switch variable's type exactly (enum value != int)
- A variable widened by assignment (int -> long) is fine; the switch returns a number, not an enum
- Pattern variable declared in if is still in scope in a later else-if - duplicate variable error
- Flow scoping: pattern variable accessible after if when compiler can prove instanceof was true
- do/while: body is a single statement or block, condition requires parentheses, braces optional for single statement
- Pre-increment (++y): increments before use. Check first printed value carefully.
- Duplicate case values in switch expression = compile error
- `Long` (wrapper of long) is NOT a supported switch type
