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

### Q9 | You answered G (compiler error - no curly bracket) | Correct answer: B,C,E
The missing curly brace after the outer for loop is NOT a compiler error. A for loop
without braces is valid - it simply takes the next single statement as its body. In this case
the entire `RABBIT` loop is the single statement body of `BUNNY`.
The blank is inside the `if` statement. The correct answers (B, C, E) all result in count
reaching exactly 2. Note: unlabeled `break` and `continue` are equivalent to `break RABBIT`
and `continue RABBIT` since they target the nearest loop.

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
compile fine. Trace the values:
- `while`: participants starts at 4, incremented inside the condition each iteration
  (post-assignment). Loop ends when participants reaches 10. Final value: 10 -> E correct.
- `do/while`: animals starts at 2. Body runs once (do/while), `animals++` makes it 3,
  condition `2 <= 1` is false (original value used in check), loop ends. Final value: 3 -> B correct.
- `for`: performers starts at -1, goes to 1 after first iteration, then 3 after second.
  3 < 2 is false, loop ends. Final value: 3 -> B correct again (not a new distinct number).

### Q18 | You answered C,D,E,F | Correct answer: C,E
You included D and F which are both wrong.
- D: "The pattern variable cannot be accessed after the if statement." FALSE - flow scoping
  allows access after the if when the compiler can prove instanceof was true (early return
  trick). We covered this in the notes.
- F: "Pattern matching can declare a variable with an else statement." FALSE - else has no
  boolean expression, so there is nothing to bind the pattern variable to.

### Q19 | You answered F (infinite loop) | Correct answer: E (does not compile)
`snake` is declared inside the do/while body on line 4. It is a local variable scoped to
each iteration of the loop. Line 7 (`while (snake <= 5)`) is outside the loop body - at
that point `snake` is out of scope. The code does not compile. Not an infinite loop.

### Q20 | You skipped this | Correct answer: A,E
The innermost loop (L3) is infinite - `for(;;)`. You need to either skip it or exit it.
- A: `break L2` on line 8 exits the do/while entirely every time, never reaching L3. Works.
- E: `continue L2` on line 8 skips L3 on the first inner iteration but not the second.
  However `continue L2` on line 12 exits the infinite loop and returns to the do/while,
  which then terminates normally.
- B: `continue` on line 12 only targets L3 - causes infinite loop.
- C: `break L3` on line 8 - L3 label is not visible outside its own loop, does not compile.
- D: equivalent to B, also causes infinite loop.

### Q21 | You answered C (2 lines) | Correct answer: E (4 lines)
You spotted lines 23 (missing yield + semicolon) and 24 (extra semicolon). You missed:
- Line 22: `Long` is not a supported switch type. Only `int`, `byte`, `short`, `char` and
  their wrappers, plus `String` and `enum`. `Long` (wrapper of long) is not supported.
- Lines 25 and 26: duplicate case value `30`. Two cases with the same value don't compile.
Total: 4 lines. Answer is E.

### Q22 | You answered G (does not compile - line 6) | Correct answer: E (5 2 1)
The code compiles without issue. `var one = 1` with `final` makes `one` a compile-time
constant, so `case one:` is valid. Line 6 has `default: case 3:` on one line - this is valid
syntax, `default` can appear anywhere.
Trace: `tailFeathers = 3`. Matches `case 3` (via fall-through from default). Prints 5.
While loop: `3 > 1` true, `--tailFeathers` = 2, prints 2. `2 > 1` true, `--tailFeathers`
= 1, prints 1. `1 > 1` false, loop ends. Output: `5 2 1`. Answer is E.

### Q28 | You skipped | Correct answer: F (does not compile)
Flow scoping is the key. After lines 41-42, if `fish` is NOT a String, `guppy` goes out
of scope. But if `fish` IS a String, `guppy` IS in scope after the if block. Line 43 then
tries to declare a NEW `guppy` in the else-if - but `guppy` is still in scope from line 41,
making it a duplicate variable declaration. The code does not compile.

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
