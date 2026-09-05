# Chapter 2 — Operators: Review Questions
Date: 2026-09-04
Score: 16 / 21 (76%)

---

## Results

| Q   | Your Answer | Correct Answer | Result  |
| --- | ----------- | -------------- | ------- |
| 1   | A, D, G     | A, D, G        | correct |
| 2   | A, B, D     | A, B, D        | correct |
| 3   | B, C, D, F  | B, C, D, F     | correct |
| 4   | B           | B              | correct |
| 5   | A, C        | A, C           | correct |
| 6   | F           | F              | correct |
| 7   | D           | D              | correct |
| 8   | C           | A              | wrong   |
| 9   | A, B, E     | A, D, E        | wrong   |
| 10  | G           | G              | correct |
| 11  | D           | D              | correct |
| 12  | D           | D              | correct |
| 13  | F           | F              | correct |
| 14  | B, E, G     | B, E, G        | correct |
| 15  | D           | D              | correct |
| 16  | B           | B              | correct |
| 17  | C, F        | C, F           | correct |
| 18  | C           | C              | correct |
| 19  | ?           | B, F           | wrong   |
| 20  | D, E        | A, D, E        | wrong   |
| 21  | A           | E              | wrong   |

---

## Wrong Answers — Analysis

### Q8 — pig = pig++ trap
You answered C (5 - 1). Correct is A (4 - 1).

`pig = pig++` is the trap. Here is exactly what happens step by step:

```
pig = pig++

Step 1: pig++ runs.
        - Returns the current value (4) to hand to the surrounding expression.
        - Increments pig to 5 as a side effect.

Step 2: pig = 4 runs.
        - The assignment uses the value that pig++ returned, which is 4.
        - This overwrites pig with 4, wiping out the 5 that the side effect just wrote.
```

The increment happened, but the assignment immediately stomped on it. The returned value
always wins over the side effect when you assign post-increment back to the same variable.
`x = x++` is always a no-op — x stays unchanged.

`goat -= 1.0` compiles fine because compound operators include an implicit cast — no error.
goat goes from 2 to 1. Output: 4 - 1.

Key rule: `x = x++` is a no-op. The post-increment side effect is cancelled by the assignment.

### Q9 — ternary with post-increment, reading which branch runs
You answered A, B, E. Correct is A, D, E.

Line 1: `a > 2` is false (2 > 2 is false), so the false branch runs: `b++`. Post-increment
returns 4 (original value of b), then b becomes 5. Prints 4 — option D, not B.

Line 2: `a != c` is false (2 != 2 is false), so `b++` runs. b is 5, returns 5, assigns 5 to b.
Prints 5 — option E. Correct.

Line 3: `a > b` is false (2 > 5 is false), skips the nested ternary entirely, prints 1 — option A. Correct.

Key rule: in a ternary, only one branch runs. Always determine which branch executes before
reading any ++ or -- inside it.

### Q19 — pre-increment and byte overflow
You skipped this one. Correct is B, F.

Line 5: `++start` is pre-increment — start becomes 8 first, then that new value is used.
`end += 8` means `4 + 8 = 12`. end is 12 — option F.

Line 6: `Byte.MAX_VALUE` is 127. `127 + 1 = 128` overflows byte and wraps to -128 — option B.

##### Why it wraps to -128 — the clock rule
Every integer type has a fixed bit size and a fixed range. When you go one step past the
maximum, the bits have no room left and wrap around to the minimum. Think of it as a
circular clock:

```
byte range: -128 to 127

... 125 → 126 → 127 → -128 → -127 ...
                    ↑
            overflow wraps here

... -126 → -127 → -128 → 127 → 126 ...
                       ↑
           underflow wraps here
```

So `127 + 1` lands on `-128`. `127 + 2` lands on `-127`. And so on.

Overflow is **silent** — no exception is thrown at runtime, the value just wraps.

##### Two similar examples to recognise the pattern
```java
// overflow: one past int MAX (2,147,483,647)
System.out.print(2147483647 + 1);    // -2147483648  (wraps to Integer.MIN_VALUE)

// underflow: one below byte MIN (-128)
byte b = (byte)(Byte.MIN_VALUE - 1); // (byte)(-129) → 127  (wraps to byte MAX)
```

Key rule: if you see MAX_VALUE + 1 or MIN_VALUE - 1 on the exam, expect the answer to be
a negative number (overflow) or a positive number (underflow) respectively.

### Q20 — missed that unary operators have highest precedence
You answered D, E. Correct is A, D, E.

You missed option A: "Unary operators are always executed before any surrounding numeric
binary or ternary operators." This is the top rows of the precedence table — post/pre-unary
and other unary operators outrank everything else. You knew this but didn't pick it.

Options D and E were correct. Option B is wrong (- flips numbers, ! flips booleans, not
interchangeable). Option C is wrong (pre-increment returns the new value, not the original).

### Q21 — wrong bitwise complement formula
You answered A (-7, -8, 9). Correct is E (-9, -8, 9).

The bitwise complement formula is ~x = -(x + 1).
~8 = -(8 + 1) = -9. You got -7, which would be -(8 - 1). Wrong direction.

-myFavoriteNumber = -8. Correct.
bird (-9) != plane (-8), so superman = 10.
--superman pre-decrements: 10 - 1 = 9, returns 9.
Output: -9, -8, 9.

Key rule: memorise ~x = -(x + 1). It comes up directly.

---

## Patterns to Watch

- post-increment assigned back to itself (`x = x++`) is always a no-op
- In ternary and short-circuit operators, identify which branch/side runs before reading any ++ or --
- Byte.MAX_VALUE is 127 — adding 1 overflows to -128
- Unary operators are highest precedence (easy to forget when it's phrased as a statement rather than shown in code)
- Bitwise complement: ~x = -(x + 1), not -(x - 1)
