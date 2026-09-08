# Chapter 4 - Core APIs: Review Questions
Date: 2026-09-08
Score: 12 / 22 (55%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | A, C        | F              | wrong   |
| 2  | C, E        | C, E, F        | wrong   |
| 3  | A, C, D     | A, C, D        | correct |
| 4  | A, C, D     | A, C, D        | correct |
| 5  | B           | B              | correct |
| 6  | D (3)       | C (2)          | wrong   |
| 7  | A, E        | A, E           | correct |
| 8  | A, E, F     | A, B, F        | wrong   |
| 9  | A, F        | A, C, F        | wrong   |
| 10 | A           | A              | correct |
| 11 | E           | E              | correct |
| 12 | A, D, E     | A, D, E        | correct |
| 13 | A           | B              | wrong   |
| 14 | A, F        | A, F           | correct |
| 15 | C, F        | C, E           | wrong   |
| 16 | B, E        | A, B, G        | wrong   |
| 17 | A, G        | A, G           | correct |
| 18 | C, E, F     | C, F           | wrong   |
| 19 | B, D        | A, B, D        | wrong   |
| 20 | A, D        | A, D           | correct |
| 21 | A, C        | A, C           | correct |
| 22 | A           | A              | correct |

---

## Wrong Answers - Analysis

### Q1 | You answered A, C | Correct answer: F (does not compile)

Your reasoning: "numFish + 1 does int addition, result is 5, stored in anotherFish, then we
print 5 tuna and 4 1."

Your logic for the arithmetic was correct - `numFish + 1` evaluates to the int `5`.
The problem is on line 5:

```java
String anotherFish = numFish + 1; // int 5 cannot be assigned to String
```

You cannot assign an `int` directly to a `String` variable. There is no implicit conversion
from `int` to `String`. The code does not compile at line 5 at all.

To make it work, you would need to either:
```java
String anotherFish = (numFish + 1) + ""; // force concatenation to get "5"
String anotherFish = String.valueOf(numFish + 1); // explicit conversion
```

Rule: `int + int` = `int`. An `int` cannot be stored in a `String`. No implicit conversion exists.

---

### Q2 | You answered C, E | Correct answer: C, E, F

Your reasoning: "A fine, B fine, C wrong (uses variable name as type), D fine, E wrong
(2D array assigned a 1D array), F fine."

You correctly identified C and E. You missed F:

```java
int[][] java = new int[][]; // DOES NOT COMPILE
```

This is invalid because the first dimension of an array must have a size specified.
`new int[][]` gives Java no information about how many slots to allocate for the outer array.
Compare:

```java
int[][] a = new int[3][];  // legal - outer size given, inner arrays created later
int[][] b = new int[][3];  // DOES NOT COMPILE - must specify outer dimension first
int[][] c = new int[][];   // DOES NOT COMPILE - no dimensions specified at all
```

The rule: when using `new`, you must always specify the size of the **first** (outermost)
dimension. Later dimensions can be left unspecified.

---

### Q6 | You answered D (3 errors) | Correct answer: C (2 errors)

Your reasoning: "line 24 fails (round with double returns long, not int), line 25 fails
(random returns double, won't fit in float), line 26 fine."

You were right about lines 24 and 25. Where you went wrong: you said line 26 is fine
"because we just declare a 2D double array." But it is a 1D array, not 2D. That part
does not matter though - the real issue is whether `two` (a `long`) can go into a
`double[]`.

The answer is yes - `long` widens to `double` automatically. So line 26 compiles fine,
even though `two` is a `long`. That's only 2 compile errors (lines 24 and 25), not 3.

```java
double one   = Math.pow(1, 2);         // fine - pow returns double
int two      = Math.round(1.0);        // DOES NOT COMPILE - round(double) returns long
float three  = Math.random();          // DOES NOT COMPILE - random() returns double, needs cast
var doubles  = new double[] {one, two, three}; // 'two' is long but long widens to double - fine
```

Widening conversions that work silently (no cast needed): `byte -> short -> int -> long -> float -> double`

---

### Q8 | You answered A, E, F | Correct answer: A, B, F

Your reasoning: "A returns char '5' at index 4 - correct. B: replace(2,4) replaces indexes
2 and 3 with '6' making '1265', charAt(3) returns '6' - not 5. C: intermediate is '126',
charAt(2) = '6'. D: throws exception. E: returns 5. F: replace gives '145', charAt(2) = '5'."

Two mistakes:

**E is wrong - it does not compile:**
```java
string.length  // DOES NOT COMPILE - length is a METHOD on String, requires ()
string.length() // correct
```
`length` without parentheses only works on arrays (`array.length` is a field).
On `String`, `length()` is a method and must be called with `()`.

**B is actually correct:**
```java
builder.replace(2, 4, "6").charAt(3)
```
`"12345"` with `replace(2, 4, "6")`: removes indexes 2 and 3 (`'3'` and `'4'`), inserts `"6"`.
Result: `"1" + "2" + "6" + "5"` = `"1265"`.
`charAt(3)` on `"1265"` = `'5'`. That IS 5. So B is correct.

Your trace said charAt(3) returns '6', but:
```
"1265"  ->  index 0='1', index 1='2', index 2='6', index 3='5'
```
Index 3 is `'5'`, not `'6'`. Recount carefully - you were off by one.

---

### Q9 | You answered A, F | Correct answer: A, C, F

Your reasoning: "A correct (0-indexed). C - we can declare arrays without a size so false.
D wrong (arrays are mutable). F correct (equals() not overridden, always reference equality)."

You missed C. The confusion is between **declaring** and **resizing**:

```java
int[] arr;           // declaration - no size yet, just a reference variable
int[] arr = new int[3]; // instantiation - size is 3, FIXED forever
arr = new int[5];    // you can point arr to a NEW array of size 5
                     // but the original size-3 array did not change
```

Once an array is instantiated with `new int[3]`, it has exactly 3 slots. That cannot change.
You cannot add or remove elements. That's what "fixed size" means.

When you do `arr = new int[5]`, you are not resizing - you are creating a brand new array
and pointing the variable to it. The old array is unchanged (and gets garbage collected).

This is unlike `ArrayList`, which CAN grow dynamically. Arrays cannot.

Your note about what's immutable is good - to complete it:
- Immutable (value cannot change): `String`, `LocalDate`, `LocalTime`, `LocalDateTime`,
  `ZonedDateTime`, `Period`, `Duration`, `Instant`, wrapper classes (`Integer`, `Double`, etc.)
- Mutable (value can change): `StringBuilder`, arrays, `ArrayList`, most objects

---

### Q13 | You answered A | Correct answer: B

Your reasoning: "when passing arguments to a method, modifications inside the method
don't apply to the originals - it's a copy that goes out of scope."

This is the most important misconception to fix. Java passes **references by value** - not
copies of the objects.

For primitives and Strings, your mental model is mostly right:
```java
void change(String s) {
    s = s.concat("!!!");  // s now points to a new String object
                          // the original variable outside is unchanged
}
```
`String` is immutable - any operation returns a NEW object. The original reference outside
the method still points to the original string.

For `StringBuilder` (and any mutable object), it is different:
```java
void change(StringBuilder sb) {
    sb.append("!!!");  // modifies the SAME object that sb points to
                       // the caller's variable points to that same object
                       // so the caller sees the change
}
```

Both the caller's `roar2` variable and the method's `roar2` parameter point to the
**same `StringBuilder` object in memory**. When you call `append()`, you are mutating
that one object. Both variables still point to it after the method returns, so the change
is visible outside.

```
Memory:
  StringBuilder object: "roar"
       ^          ^
       |          |
  main's roar2   method's roar2   <- two variables, one object
  
After append("!!!"):
  StringBuilder object: "roar!!!"
       ^          ^
       |          |
  main's roar2   method's roar2   <- both still point to it, both see "roar!!!"
```

Rule: mutable objects passed to methods CAN be changed visibly to the caller.
Immutable objects (String) cannot - operations return new objects and the original is untouched.

---

### Q15 | You answered C, F | Correct answer: C, E

Your reasoning: "sorted array is [123, PIG, pig] = C correct. Pippa goes at index 1,
so result = -(1)-1 = -2 = F."

C is correct. The binary search calculation is where you went wrong.

The sorted array is: `[123, PIG, pig]` (indexes 0, 1, 2).

Where would `"Pippa"` be inserted to keep the array sorted?
- `"123"` < `"Pippa"` (numbers sort before letters)
- `"PIG"` vs `"Pippa"`: compare character by character: `P==P`, `I vs i` - uppercase I (73)
  comes before lowercase i (105), so `"PIG"` < `"Pippa"`
- `"pig"` vs `"Pippa"`: `p==p`, `i vs i` - same, `g vs p` - 'g'(103) < 'p'(112),
  so `"pig"` < `"Pippa"`

`"Pippa"` would be inserted **after** `"pig"` at index 3.

Insertion point = 3, so result = `-(3) - 1 = -4`.

Wait - let me recheck. `"PIG"` vs `"Pippa"`: `P==P`, then `I`(73) vs `i`(105).
Uppercase I comes first alphabetically, so `"PIG"` < `"Pippa"`. And `"pig"` vs `"Pippa"`:
`p==p`, `i==i`, `g`(103) vs `p`(112) - 'g' < 'p', so `"pig"` < `"Pippa"`.

So `"Pippa"` goes after all three, insertion point = 3, result = `-(3)-1 = -4`? But the
book says E (-3). Let me retrace: `"PIG"` vs `"Pippa"` - `P==P`, `I`(73) vs `i`(105).
Yes, uppercase I < lowercase i, so `"PIG" < "Pippa"`. Then `"pig"` vs `"Pippa"`:
compare `p==p`, `i==i`, then `g` vs `p` - 'g' < 'p', so `"pig" < "Pippa"`.
Insertion point = 3... but book says -3, meaning insertion point = 2.

The book is comparing `"PIG"` vs `"Pippa"` differently. After `PI` match as `P==P`, `I==i`?
No - 'I' != 'i'. So `"PIG"` has 'I'(73) and `"Pippa"` has 'i'(105). 'I' < 'i', meaning
`"PIG" < "Pippa"`. And `"pig"` has 'p'(112) at index 1 vs `"Pippa"`'s 'i'(105).
'i'(105) < 'p'(112), so `"Pippa" < "pig"`. Insertion point = 2, result = -(2)-1 = **-3 = E**.

The key: `"pig"` starts with lowercase 'p', and `"Pippa"` has 'i' at index 1.
Comparing `"pig"[1]` = 'i'(105) vs `"Pippa"[1]` = 'i'(105) - equal. Then `"pig"[2]` = 'g'(103)
vs `"Pippa"[2]` = 'p'(112). 'g' < 'p', so `"pig" < "Pippa"` - wait that puts Pippa after pig
again. The book answer is E (-3) meaning insertion point 2 (before "pig").

The correct comparison: `"pig"` vs `"Pippa"`. First chars: 'p'(112) vs 'P'(80).
Uppercase 'P'(80) < lowercase 'p'(112). So `"Pippa" < "pig"`. Insertion point = 2. Result = -3 = E.

You chose F (-2, insertion point 1) - you placed Pippa between index 0 and 1, but it
belongs between index 1 (PIG) and index 2 (pig). Always compare the actual ASCII values:
uppercase letters (65-90) all sort before lowercase letters (97-122).

---

### Q16 | You answered B, E | Correct answer: A, B, G

Your reasoning: "length = 11 (confirmed). indent adds 2 spaces and \n making it 14 =E.
translate removes one char leaving 10 = A."

length = 11 is correct (B).

**Translate:** `base = "ewe\nsheep\\t"`. The `\\t` is a literal backslash + 't' (2 chars).
`translateEscapes()` converts `\\t` into a real tab - replacing 2 chars with 1. So 11 - 1 = 10 = A. You got this right.

**Indent:** `indent(2)` adds 2 spaces to the start of each line, plus adds a `\n` at the
end if missing. `base` has 2 lines (`ewe` and `sheep\t`). Adding 2 spaces to each line =
+4 chars. Plus 1 trailing newline = +5 total. 11 + 5 = 16 = G. Not 14.

You calculated +3 (2 spaces + 1 newline) instead of +5 (2 spaces per line x 2 lines + 1 newline).
`indent()` adds spaces to **every line**, not just once.

---

### Q18 | You answered C, E, F | Correct answer: C, F

Your reasoning: "strings are immutable, += changes the reference. s1 becomes 'purrtwo'
length 7 = C. s2 becomes '2cfalse'. Both == and equals print."

C and F are correct. E (`==`) is wrong.

`s2` is built entirely through `+=` operations:
```java
String s2 = "";
s2 += 2;       // s2 = "2"       (runtime string, not pool)
s2 += 'c';     // s2 = "2c"      (runtime string)
s2 += false;   // s2 = "2cfalse" (runtime string)
```

Every `+=` on a String creates a new object at **runtime** - outside the string pool.
The literal `"2cfalse"` on line 26 IS in the pool.

```java
if (s2 == "2cfalse")       // false - s2 is a runtime object, "2cfalse" is a pool literal
if (s2.equals("2cfalse"))  // true  - same characters
```

`==` compares references. `s2` is outside the pool. `"2cfalse"` is in the pool. Different
objects = `false`. Only `equals` prints.

---

### Q19 | You answered B, D | Correct answer: A, B, D

Your reasoning: "A: s1 vs s2, same element count, L comes before P alphabetically so s2
is smaller, compare returns negative. B: mismatch at index 1, returns positive. C: s4 has
null making s3 smaller, negative. D: differ at index 1, positive. E: same arrays = 0. F: -1."

You missed A. Your reasoning was: "L comes before P, so s1 > s2, compare returns
negative." But check the arrays again:

```java
String[] s1 = {"Camel", "Peacock", "Llama"};
String[] s2 = {"Camel", "Llama", "Peacock"};
```

Index 0 is the same ("Camel"). Index 1: `"Peacock"` vs `"Llama"`. First char: 'P'(80) vs
'L'(76). 'L' < 'P', so `"Llama" < "Peacock"`, meaning `s2[1] < s1[1]`, meaning s1 is
**larger** than s2. `compare(s1, s2)` returns **positive**. A is correct.

You said "L comes before P so s2 is smaller" - that part is right. But "s2 is smaller"
means `compare(s1, s2)` is positive (s1 > s2), which is what the question asks for
(print a positive integer). You got confused mapping "s2 is smaller" to the sign of the
return value.

Rule: `compare(a, b)` returns positive when `a > b`. If s1 > s2, then `compare(s1, s2)` is positive.
