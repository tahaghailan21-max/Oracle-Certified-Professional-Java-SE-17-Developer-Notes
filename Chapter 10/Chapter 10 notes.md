# Streams

This chapter covers the Streams API, which is the functional programming side of Java.
Lambdas and method references (Chapters 8 and 9) are the building blocks -- make sure
those are solid before continuing.

One naming note: `java.io` also has something called streams (covered in Chapter 14).
The two have nothing in common beyond the word. This chapter is exclusively about the
Streams API used for functional programming.

---

### Returning an Optional

#### The problem Optional solves

Suppose you have a list of exam scores and need to return the average. If the list has
scores, you calculate and return a number. But if the list is empty, there is no average --
returning `0` would be misleading and incorrect. The answer is simply "there is no data."

Java expresses this with `Optional`. An `Optional` is a container that either holds a value
or is empty. Think of it as a box that may or may not contain something:

```
Optional.empty()     Optional.of(95)
[        ]           [   95   ]
```

---

#### Creating an Optional

```java
public static Optional<Double> average(int... scores) {
    if (scores.length == 0) return Optional.empty();
    int sum = 0;
    for (int score : scores) sum += score;
    return Optional.of((double) sum / scores.length);
}
```

Returns an empty `Optional` when there are no scores. Otherwise wraps the calculated
average in `Optional.of()`.

To understand why `Optional` exists, consider what the alternatives look like:

**Return null** -- the caller must remember to check, with no compiler enforcement:

```java
public static Double average(int... scores) {
    if (scores.length == 0) return null;
    int sum = 0;
    for (int score : scores) sum += score;
    return (double) sum / scores.length;
}

Double result = average();
System.out.println(result.toString()); // NullPointerException -- easy to forget the null check
```

**Return a magic value** -- nothing tells the caller that -1 means "no data":

```java
public static double average(int... scores) {
    if (scores.length == 0) return -1;
    int sum = 0;
    for (int score : scores) sum += score;
    return (double) sum / scores.length;
}

double result = average();
System.out.println(result); // prints -1 -- looks like a real score, silently wrong
```

With `Optional<Double>`, the return type itself signals "this might not have a value."
The caller is forced to interact with the container and decide what to do when it is empty.
The contract is in the signature, not in a comment or a convention.

```java
System.out.println(average(90, 100)); // Optional[95.0]
System.out.println(average());        // Optional.empty
```

Printing an `Optional` directly shows either `Optional[value]` or `Optional.empty` -- not
the raw value.

---

#### Getting the value out

Check before you get:

```java
Optional<Double> opt = average(90, 100);
if (opt.isPresent())
    System.out.println(opt.get()); // 95.0
```

Calling `get()` on an empty `Optional` throws:

```java
Optional<Double> opt = average();
System.out.println(opt.get()); // NoSuchElementException: No value present
```

---

#### Creating an Optional from a value that might be null

The manual way using a ternary:

```java
Optional o = (value == null) ? Optional.empty() : Optional.of(value);
```

The factory shorthand that does the same thing:

```java
Optional o = Optional.ofNullable(value);
```

`Optional.of(value)` throws a `NullPointerException` if `value` is null. Use
`ofNullable()` when the value may or may not be null and you want an `Optional` either
way.

---

#### Common Optional instance methods

| Method | When empty | When value present |
|---|---|---|
| `get()` | Throws `NoSuchElementException` | Returns value |
| `ifPresent(Consumer c)` | Does nothing | Calls consumer with value |
| `isPresent()` | Returns `false` | Returns `true` |
| `orElse(T other)` | Returns `other` | Returns value |
| `orElseGet(Supplier s)` | Returns result of calling supplier | Returns value |
| `orElseThrow()` | Throws `NoSuchElementException` | Returns value |
| `orElseThrow(Supplier s)` | Throws exception created by supplier | Returns value |

---

#### ifPresent()

Instead of an `if` block, pass a `Consumer` directly:

```java
Optional<Double> opt = average(90, 100);
opt.ifPresent(System.out::println); // 95.0
```

If the `Optional` is empty, nothing happens. Think of it as an `if` with no `else`.

---

#### Dealing with an empty Optional

**`orElse()` and `orElseGet()`** -- return a fallback value instead of throwing:

```java
Optional<Double> opt = average();
System.out.println(opt.orElse(Double.NaN));             // NaN
System.out.println(opt.orElseGet(() -> Math.random())); // e.g. 0.4977...
```

`orElse()` takes a direct value. `orElseGet()` takes a `Supplier` so the fallback is only
computed if it is actually needed.

**`orElseThrow()`** -- throw if empty:

```java
Optional<Double> opt = average();
System.out.println(opt.orElseThrow()); // NoSuchElementException: No value present
```

**`orElseThrow(Supplier)`** -- throw a custom exception if empty:

```java
Optional<Double> opt = average();
System.out.println(opt.orElseThrow(() -> new IllegalStateException()));
// java.lang.IllegalStateException
```

You do not write `throw new ...` yourself -- `orElseThrow()` handles throwing. You only
supply the exception object via the `Supplier`.

---

#### The orElseGet / orElseThrow supplier type must match

`orElseGet()` takes a `Supplier<T>` where `T` must match the `Optional`'s type.
`orElseThrow()` takes a `Supplier<? extends Throwable>`. They are different methods
with different supplier types -- mixing them up is a compile error:

```java
Optional<Double> opt = average();
opt.orElseGet(() -> new IllegalStateException()); // DOES NOT COMPILE
// opt is Optional<Double>, so the Supplier must return Double, not an exception
```

---

#### orElse methods are ignored when a value is present

```java
Optional<Double> opt = average(90, 100);
System.out.println(opt.orElse(Double.NaN));             // 95.0
System.out.println(opt.orElseGet(() -> Math.random())); // 95.0
System.out.println(opt.orElseThrow());                  // 95.0
```

All three print `95.0`. When the `Optional` has a value, the fallback logic is never
executed.

---

#### Optional vs null

Returning `null` from a method is an alternative but has drawbacks:
- It is not obvious from the method signature that null is a possible return.
- The caller has to remember to check, with no enforcement.
- You cannot chain functional-style calls on a null.

`Optional` makes the "might not have a value" contract explicit in the API, and lets you
use `ifPresent()`, `orElse()`, and other chaining methods instead of `if` statements.
