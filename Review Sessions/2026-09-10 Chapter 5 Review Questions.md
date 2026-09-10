# Chapter 5 - Methods: Review Questions
Date: 2026-09-10
Score: 16 / 21 (76%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | A, E        | A, E           | correct |
| 2  | B, C        | B, C           | correct |
| 3  | A, D        | A, D           | correct |
| 4  | A, B, C, E  | A, B, C, E     | correct |
| 5  | A, C, D     | A, C, D        | correct |
| 6  | A, B, E, F  | A, B, F        | wrong   |
| 7  | D, E, F     | D, F           | wrong   |
| 8  | D           | D              | correct |
| 9  | B, C, D, F  | B, C, D, F     | correct |
| 10 | B           | B              | correct |
| 11 | B           | B, E           | wrong   |
| 12 | (skipped)   | B (2)          | wrong   |
| 13 | B           | D              | wrong   |
| 14 | E           | E              | correct |
| 15 | B           | B              | correct |
| 16 | E           | E              | correct |
| 17 | C           | B              | wrong   |
| 18 | B, D, E     | B, D, E        | correct |
| 19 | B, C, E, F  | B, C, E        | wrong   |
| 20 | A, E        | A, E           | correct |
| 21 | B, D        | B, D           | correct |

---

## Wrong Answers - Analysis

### Q6 | You answered A, B, E, F | Correct answer: A, B, F

You included E. E does not compile.

```java
public void flute(String[] values, ...int nums) {}  // DOES NOT COMPILE
```

The varargs syntax is `type...` not `...type`. The three dots must come **after** the type,
not before it. `...int` is not valid syntax. The correct form would be `int... nums`.

F is valid because it uses two regular arrays -- no varargs involved at all, so there is no
ordering rule to break and no syntax issue.

---

### Q7 | You answered D, E, F | Correct answer: D, F

You included E. E does not compile.

```java
juggle(true, {true, true}); // DOES NOT COMPILE
```

`{true, true}` is an array initializer shorthand and is only valid in a variable declaration
context (e.g. `boolean[] b = {true, true}`). You cannot use it inline as a method
argument. To pass an array literal directly to a method you must use the full form:

```java
juggle(true, new boolean[] {true, true}); // this would compile and return 2
```

So E does not compile at all, not even reaching the question of what it returns.

---

### Q11 | You answered B | Correct answer: B, E

You got B right -- there is exactly one compiler error (line 10, `climb()` called from a
static method without a reference). You stopped there and did not answer E.

If line 10 is removed, the output is `swing-swing`, not `swing-climb`. Here is why:

```java
public static void play() {
    swing();   // static method - prints "swing"
    // climb() removed
}

public static void main(String[] args) {
    Rope rope = new Rope();
    rope.play();           // calls static play() - prints "swing"
    Rope rope2 = null;
    System.out.print("-"); // prints "-"
    rope2.play();          // calls static play() on a null reference - still prints "swing"
}
```

`play()` only calls `swing()` (after removing `climb()`). So it prints `swing` both times,
with a `-` in between: `swing-swing`. Option E is correct. Option D (`swing-climb`) would
only be correct if `climb()` were still there, but it was removed as the compile error fix.

Also note: `rope2.play()` does NOT throw a NullPointerException. `play()` is static.
Java looks at the declared type of `rope2` (which is `Rope`) and calls `Rope.play()`. The
null value is irrelevant for static calls.

---

### Q12 | You skipped | Correct answer: B (2 variables)

You were unsure whether the compiler would treat `monkey` as effectively final given the
conditional. The answer is no -- the compiler does not evaluate whether the condition will
actually execute. It looks at the code structurally.

Walking through each variable:

- `monkey` (line 11): modified by `monkey++` on line 13. NOT effectively final.
- `giraffe` (line 13): assigned once (`monkey++` assigns the post-increment value to
  `giraffe`), never reassigned. Effectively final.
- `name` (line 14): assigned once on line 15 (`name = "geoffrey"`), never reassigned
  inside that block. Effectively final.
- `name` (line 17): reassigned to `null` on line 22. NOT effectively final.
- `food` (line 18): reassigned to `0` on line 20. NOT effectively final.

Two effectively final variables: `giraffe` and the `name` declared on line 14. Answer: B.

The key lesson: the compiler does not evaluate whether conditional code will run. If an
assignment statement exists in the code at all -- even inside an `if` that can never be
true -- it counts against effectively final.

---

### Q13 | You answered B | Correct answer: D (prints 8)

You said B (08). The correct output is just `8`.

Here is what you missed: `RopeSwing` has an **instance initializer**, not a static
initializer:

```java
{
    System.out.println(rope1.length);  // instance initializer
}
```

There are no braces with a `static` keyword in front. This block only runs when a
`RopeSwing` object is created with `new RopeSwing()`. Since `main()` never does that,
the instance initializer never executes. The `0` is never printed.

What does execute:

```java
rope1.length = 2;   // length (static) is now 2
rope2.length = 8;   // length (static) is now 8 - same variable, one copy
System.out.println(rope1.length); // prints 8
```

`length` is a static variable on `Rope`. There is only one copy shared across all instances.
Setting it through `rope2` overwrites the value set through `rope1`. Only `8` is printed.

---

### Q17 | You answered C | Correct answer: B

You said the output is `81`. It is `9`.

The question asks what `value` prints, not `result`. Look carefully:

```java
var value = 9;
var result = square(value);
System.out.println(value);  // prints value, not result
```

`value` is a primitive `int`. Java is pass-by-value. Inside `square`, the parameter `x`
starts as `9`. The method computes `y = 81`, sets `x = -1`, and returns `y`. None of this
touches `value` in `main`. Pass-by-value means the method received a copy of `9`.
`value` was never reassigned. It is still `9`.

`result` would be `81`, but that is not what is being printed.

This is exactly the pass-by-value exam trap: the method does work and returns something
meaningful, but the question asks about the original variable in the caller, which never
changed.

---

### Q19 | You answered B, C, E, F | Correct answer: B, C, E

You included F. F does not compile.

```java
// Code snippet 2 is inside a static initializer:
static {
    // CODE SNIPPET 2
}
```

`value3` is an instance variable (no `static` keyword on its declaration). A static
initializer runs when the class loads, before any instance exists. There is no object yet,
so there is no `this`, and instance variables are not accessible. Trying to assign `value3`
from inside a static initializer is a compile error.

The rule: **static initializers can only access static members**. Instance variables are
off-limits.

Compare with the instance initializer (Code Snippet 1 at line 6): it runs per object, so it
has access to both instance and static variables, which is why B and C are both valid there.

---

## Thoughts and Advice

76% is a solid step up from Chapter 4. The conceptual understanding is clearly stronger,
and you caught several tricky spots correctly (pass-by-value on Q18, the null static call
on Q11 partly, overloading resolution on Q20 and Q21). Here is what needs sharper focus:

**Syntax precision (Q6, Q7):** Two wrong answers came from missing exact syntax rules.
`...int` vs `int...` is a simple one-character order difference that the exam exploits
deliberately. `{true, true}` as an inline argument is another -- array initializer shorthand
only works in declarations. When you see code on the exam that looks almost right, slow
down and check the syntax character by character.

**Read the question, not the code (Q17):** You traced the method correctly and got `81`
-- which is the right answer to the wrong question. The question asked about `value`, not
`result`. On multi-variable questions, underline or note exactly which variable is being
printed before you trace anything.

**Instance initializer vs. static initializer (Q13, Q19):** You got Q14 right (static final
assignment rules) but missed the instance-vs-static initializer distinction in Q13 and Q19.
The difference is a single word -- `static` -- in front of the braces. If it is not there, it
does not run at class load time. This distinction also controls what variables are accessible
inside the block. Static initializers: static members only. Instance initializers: both.

**Effectively final (Q12):** Good instinct to flag it as uncertain rather than guess wrong.
The rule is structural: the compiler does not evaluate conditions. If any assignment
statement exists in the code path -- reachable or not -- the variable is not effectively final.
Add `final` mentally and see if it would compile: if any line would break, it is not
effectively final.
