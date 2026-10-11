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

---

### Understanding the Pipeline Flow

A stream pipeline has three parts:

- **Source** -- where the stream comes from.
- **Intermediate operations** -- transform the stream into another stream. There can be as
  few or as many as you like, including none at all. Because streams use lazy evaluation,
  intermediate operations do not run until the terminal operation runs.
- **Terminal operation** -- produces a result. A stream can only be used once -- it is no
  longer valid after a terminal operation completes.

```
Source --> [intermediate op] --> [intermediate op] --> terminal op
```

When viewing a pipeline from the outside, you only care about what goes in and what comes
out. What happens in between is an implementation detail.

#### Intermediate vs. terminal operations

| Scenario | Intermediate operation | Terminal operation |
|---|---|---|
| Required part of a useful pipeline? | No | Yes |
| Can exist multiple times in pipeline? | Yes | No |
| Return type is a stream type? | Yes | No |
| Executed upon method call? | No | Yes |
| Stream valid after call? | Yes | No |

#### Lazy evaluation

Streams use **lazy evaluation**: the intermediate operations do not execute when they are
declared. Java waits until it sees the terminal operation before starting any work at all.

Think of it as a factory assembly line managed by a foreperson. When you declare the
source and intermediate operations, you are giving the foreperson a set of instructions. The
foreperson sets up each worker at their station and tells them to wait for the signal. The
workers do not start until the foreperson sees the terminal operation and gives the go-ahead.

#### How elements flow through the pipeline

Each element travels all the way through the pipeline before the next element starts. With
a source of 2 signs, one intermediate operation (paint), and one terminal operation (place
in pile):

```
Step 1: sign 1 is taken out of the box
Step 2: sign 1 is painted
Step 3: sign 1 is placed in the pile
Step 4: sign 2 is taken out of the box
Step 5: sign 2 is painted
Step 6: sign 2 is placed in the pile
Foreperson sees the box is empty and shuts down the line.
```

This is not batch processing. Java does not take all elements through step 1, then all
through step 2. Each element makes the full journey before the next one begins.

#### The pipeline stops as soon as the work is done

The foreperson watches the pipeline and stops it the moment the terminal operation is
satisfied. Suppose there are 10 signs in the box but the terminal operation only needs 2:

```
Step 1: sign 1 travels through the full pipeline
Step 2: sign 2 travels through the full pipeline
Worker counting signs reports "2 done" to the foreperson.
Foreperson stops the line -- the remaining 8 signs are never touched.
```

If the terminal operation was to find only the first match, the line would stop after the
very first sign. Java avoids all unnecessary work.

#### Finite and infinite streams

A finite stream has a limited source -- it ends when the source runs out of elements.
An infinite stream has no natural end, like a stream representing all positive integers. This
is only practical because of lazy evaluation: the elements are not generated up front, they
are created one at a time as the pipeline asks for them. A terminal operation that stops
early (like "find the first match" or "take only 5") makes an infinite stream useful.

#### Streams vs. lists and queues

With a `List`, all elements are stored in memory and any element can be accessed at any
time. With a `Queue`, all elements are also stored but access is restricted to specific ends.
With a stream, the data is not generated up front -- it is created when needed. This is
**lazy evaluation** in practice. The stream does not hold its elements; it just knows how
to produce the next one when asked.


---

### Creating Stream Sources

Streams are represented by the `Stream<T>` interface, defined in `java.util.stream`.

---

#### Creating finite streams

```java
Stream<String>  empty         = Stream.empty();       // count = 0
Stream<Integer> singleElement = Stream.of(1);          // count = 1
Stream<Integer> fromArray     = Stream.of(1, 2, 3);    // count = 3
```

- `Stream.empty()` -- creates a stream with zero elements.
- `Stream.of(T... values)` -- accepts a single value or a varargs list.

Converting a `Collection` to a stream is a single method call:

```java
var list = List.of("a", "b", "c");
Stream<String> fromList = list.stream();
```

---

#### Creating a parallel stream

```java
var list = List.of("a", "b", "c");
Stream<String> fromListParallel = list.parallelStream();
```

Parallel streams split the work across multiple threads automatically. Not all tasks can be
parallelised -- for example, producing output in the original insertion order requires
coordination. There is also an overhead cost to coordinating threads, so for small streams
a sequential stream can actually be faster. Concurrency is covered in depth in Chapter 13.

---

#### Creating infinite streams

Two factory methods produce streams that never run out of elements on their own:

```java
Stream<Double>  randoms    = Stream.generate(Math::random);
Stream<Integer> oddNumbers = Stream.iterate(1, n -> n + 2);
```

**`Stream.generate(Supplier)`** -- calls the `Supplier` to produce each element on
demand. `randoms.forEach(System.out::println)` prints forever until the program is
killed.

**`Stream.iterate(seed, UnaryOperator)`** -- uses the seed as the first element, then
passes each element into the `UnaryOperator` to produce the next. `oddNumbers` starts
at `1` and keeps adding `2`, producing `1, 3, 5, 7, ...` indefinitely.

Both streams are infinite because neither has a built-in stopping condition. They rely on
terminal operations like `limit()` to become finite in practice.

---

#### Printing a stream reference

Printing a stream object does not print its elements:

```java
System.out.print(Stream.of(1, 2, 3));
// java.util.stream.ReferencePipeline$3@4517d9a3
```

Unlike a `Collection`, a stream does not store its elements, so there is nothing to display.
This will not appear on the exam, but it is worth knowing so it does not surprise you
during practice.

---

#### Finite iterate() with a Predicate

`Stream.iterate()` has an overloaded three-argument form that accepts a stopping
condition:

```java
Stream<Integer> oddNumbersUnder100 = Stream.iterate(
    1,           // seed
    n -> n < 100, // Predicate -- stop when this returns false
    n -> n + 2); // UnaryOperator -- next value
```

The three parameters in order: seed, `Predicate`, `UnaryOperator`. This mirrors a
`for` loop conceptually:

```java
for (int n = 1; n < 100; n = n + 2) { ... }
//             seed  predicate  unaryOperator
```

The exam may try to use semicolons instead of commas to separate the arguments, since
it looks like a `for` loop. The method uses commas -- semicolons are a compile error.
Also be careful: if the `Predicate` is never false (e.g. `n -> true`), the stream is
effectively infinite again.

#### What n represents in the lambdas

`n` is the current element of the stream. `Stream.iterate` holds the current value
internally, starting with the seed. It passes that value into the `Predicate` and the
`UnaryOperator` as their argument. You do not call them -- Java calls them on your behalf.

The Predicate is checked before the element is accepted. The UnaryOperator runs after,
	to compute the next candidate:

```
seed = 1

Iteration 1:
  Predicate:     n -> n < 100   receives n = 1   -->  true,  1 is added to the stream
  UnaryOperator: n -> n + 2     receives n = 1   -->  next = 3

Iteration 2:
  Predicate:     n -> n < 100   receives n = 3   -->  true,  3 is added to the stream
  UnaryOperator: n -> n + 2     receives n = 3   -->  next = 5

...

Iteration 50:
  Predicate:     n -> n < 100   receives n = 99  -->  true,  99 is added to the stream
  UnaryOperator: n -> n + 2     receives n = 99  -->  next = 101

Iteration 51:
  Predicate:     n -> n < 100   receives n = 101 -->  false, STOP (101 never added)
```

The parameter name `n` is arbitrary -- it is just a label for the argument the lambda
receives. `value`, `x`, or any other name works identically:

```java
Stream.iterate(1, value -> value < 100, value -> value + 2) // same stream
```

The type of `n` is inferred from the stream's declared type. Because the variable is
`Stream<Integer>`, both lambdas receive an `Integer`. You can write it explicitly, but
it is never required:

```java
Stream<Integer> oddNumbersUnder100 = Stream.iterate(
    1,
    (Integer n) -> n < 100,  // explicit type -- same behaviour
    (Integer n) -> n + 2);
```

---

#### Stream creation methods -- summary

| Method | Finite or infinite? | Notes |
|---|---|---|
| `Stream.empty()` | Finite | Zero elements. |
| `Stream.of(varargs)` | Finite | One or more elements listed directly. |
| `coll.stream()` | Finite | Stream from any `Collection`. |
| `coll.parallelStream()` | Finite | Same as above but eligible for parallel execution. |
| `Stream.generate(Supplier)` | Infinite | Calls `Supplier` for each element on demand. |
| `Stream.iterate(seed, UnaryOperator)` | Infinite | Seed is first element; `UnaryOperator` produces each subsequent element. |
| `Stream.iterate(seed, Predicate, UnaryOperator)` | Finite or infinite | Same as above but stops when `Predicate` returns `false`. |


---

### Using Common Terminal Operations

A terminal operation can exist without any intermediate operations, but intermediate
operations cannot exist without a terminal operation. Reductions are a special category
of terminal operation where all elements of the stream are combined into a single
primitive or object.

#### Terminal operations -- overview

| Method                                    | Infinite stream      | Return type   | Reduction? |
| ----------------------------------------- | -------------------- | ------------- | ---------- |
| `count()`                                 | Does not terminate   | `long`        | Yes        |
| `min()`, `max()`                          | Does not terminate   | `Optional<T>` | Yes        |
| `findAny()`, `findFirst()`                | Terminates           | `Optional<T>` | No         |
| `allMatch()`, `anyMatch()`, `noneMatch()` | Sometimes terminates | `boolean`     | No         |
| `forEach()`                               | Does not terminate   | `void`        | No         |
| `reduce()`                                | Does not terminate   | Varies        | Yes        |
| `collect()`                               | Does not terminate   | Varies        | Yes        |

---

#### count()

```java
public long count()
```

**Why it is terminal:** it triggers the actual execution of the pipeline and produces a
result. Nothing before it runs until `count()` is called, and after it returns the stream is
finished and cannot be used again.

**Why it is a reduction:** it must visit every element in the stream and combine them all
into a single value -- the count. There is no shortcut; skipping even one element would
give the wrong answer. That process of collapsing a whole stream down to one result is
exactly what a reduction is.

**Why it does not terminate on infinite streams:** to count every element you have to
reach the end. An infinite stream has no end, so `count()` runs forever.

```java
Stream<String> s = Stream.of("monkey", "gorilla", "bonobo");
System.out.println(s.count()); // 3
```

---

#### min() and max()

```java
public Optional<T> min(Comparator<? super T> comparator)
public Optional<T> max(Comparator<? super T> comparator)
```

**Why they are terminal:** same reason as `count()` -- they trigger execution and leave
the stream consumed.

**Why they are reductions:** to find the minimum (or maximum), Java must look at every
element and keep track of the current winner. Every element participates in producing
the single final result. That is a reduction.

**Why they do not terminate on infinite streams:** Java cannot declare a winner until it
has seen every element, because a smaller (or larger) value might still be coming. With
no end in sight, the search never concludes.

The return type is `Optional<T>`, not `T` directly, because the stream might be empty --
in that case there is no minimum or maximum to return.

Finding the shortest string:

```java
Stream<String> s = Stream.of("monkey", "ape", "bonobo");
Optional<String> min = s.min((s1, s2) -> s1.length() - s2.length());
min.ifPresent(System.out::println); // ape
```

Empty stream case -- the comparator is never called, and the `Optional` is empty:

```java
Optional<?> minEmpty = Stream.empty().min((s1, s2) -> 0);
System.out.println(minEmpty.isPresent()); // false
```

**You cannot get both min and max from the same stream.** A stream can only have one
terminal operation. Once it runs, the stream is consumed and cannot be reused. Numeric
streams (covered later in this chapter) provide summary methods that compute multiple
statistics in a single pass.


---

#### findAny() and findFirst()

```java
public Optional<T> findAny()
public Optional<T> findFirst()
```

Both return an element of the stream wrapped in an `Optional`, or an empty `Optional`
if the stream is empty.

**Why they are terminal:** they trigger execution and the stream cannot be used again
after they return.

**Why they are NOT reductions:** a reduction must process every element to produce its
result. These methods can return after seeing just one element -- they stop as soon as
they find something. Since they do not necessarily look at all the elements, they are not
reductions.

**Why they can terminate on infinite streams:** Java generates stream elements one at a
time on demand (lazy evaluation). As soon as one element is produced, the method
returns it. The rest of the infinite stream is never generated.

`findFirst()` always returns the first element of the stream. `findAny()` may return any
element -- on sequential streams it commonly returns the first element, but this is not
guaranteed. On parallel streams it is more likely to return a non-first element, since
multiple threads are pulling elements simultaneously.

```java
Stream<String> s        = Stream.of("monkey", "gorilla", "bonobo");
Stream<String> infinite = Stream.generate(() -> "chimp");

s.findAny().ifPresent(System.out::println);       // monkey (commonly, not guaranteed)
infinite.findAny().ifPresent(System.out::println); // chimp
```

---

#### allMatch(), anyMatch(), noneMatch()

```java
public boolean anyMatch(Predicate<? super T> predicate)
public boolean allMatch(Predicate<? super T> predicate)
public boolean noneMatch(Predicate<? super T> predicate)
```

Each method takes a `Predicate` -- a test that returns `true` or `false` for a given
element -- and applies it to the stream elements. Each method then returns a single
`boolean` answer about the stream as a whole.

**What a Predicate is:** a lambda (or method reference) that takes one element and
answers yes or no. `x -> Character.isLetter(x.charAt(0))` takes a `String` `x`,
looks at its first character (`charAt(0)`), and asks: is that character a letter? It returns
`true` for `"monkey"` (first char `m`, a letter) and `false` for `"2"` (first char `2`,
not a letter).

**What each method means:**

- `anyMatch(pred)` -- "does at least one element pass the test?" Returns `true` the
  moment it finds one match. If it finds a match early, it stops immediately.
- `allMatch(pred)` -- "do all elements pass the test?" Returns `false` the moment it
  finds one failure. If every element passes, it has to check all of them.
- `noneMatch(pred)` -- "do zero elements pass the test?" Returns `false` the moment
  it finds one match. If no elements match, it has to check all of them.

Think of them as asking a question about the whole list:

```
list = ["monkey", "2", "chimp"]
pred = does the first character start with a letter?

anyMatch:   "monkey" -> true.  Found one. STOP. Answer: true
allMatch:   "monkey" -> true. "2" -> false. Found a failure. STOP. Answer: false
noneMatch:  "monkey" -> true.  Found one match. STOP. Answer: false
```

**Why they are terminal:** they trigger execution and consume the stream.

**Why they are NOT reductions:** a reduction must process every element. These methods
can stop early -- `anyMatch` and `noneMatch` stop at the first match, `allMatch` stops
at the first failure. Because none of them are guaranteed to process the entire stream,
they are not reductions.

**Infinite stream behaviour:**
- `anyMatch` -- terminates if a matching element is found. Runs forever if no match
  ever appears.
- `noneMatch` -- terminates if a non-matching element is found. Runs forever if every
  element matches.
- `allMatch` -- terminates immediately when one element fails. Runs forever if every
  element keeps passing.

```java
var list = List.of("monkey", "2", "chimp");
Stream<String> infinite = Stream.generate(() -> "chimp");
Predicate<String> pred = x -> Character.isLetter(x.charAt(0));

System.out.println(list.stream().anyMatch(pred));  // true  -- "monkey" matches, stops there
System.out.println(list.stream().allMatch(pred));  // false -- "2" fails, stops there
System.out.println(list.stream().noneMatch(pred)); // false -- "monkey" matches, stops there
System.out.println(infinite.anyMatch(pred));        // true  -- "chimp" matches immediately
```

The `infinite` stream generates `"chimp"` forever. `anyMatch` checks the first element,
`"chimp"` starts with a letter, the predicate returns `true`, and the stream stops. It
never generates a second element.

The same `Predicate` can be reused across streams, but each terminal operation needs
its own stream -- once a stream is consumed it cannot be used again. That is why
`list.stream()` is called fresh each time.

**`allMatch`, `anyMatch`, `noneMatch` return `boolean`.** The find methods return
`Optional<T>` because they return an element. These methods return `boolean` because
they return a yes/no answer about the stream.

---

#### forEach()

```java
public void forEach(Consumer<? super T> action)
```

Iterates over every element and applies the `Consumer` to each one.

**Why it is terminal:** it triggers execution and consumes the stream.

**Why it is NOT a reduction:** a reduction combines all elements into a single return
value. `forEach` has a `void` return type -- it produces no value at all. It is the only
terminal operation with a `void` return type. Whatever needs to happen must happen
inside the `Consumer`.

**Why it does not terminate on infinite streams:** it processes every element one by one
with no stopping condition.

```java
Stream<String> s = Stream.of("Monkey", "Gorilla", "Bonobo");
s.forEach(System.out::print); // MonkeyGorillaBonobo
```

`forEach()` can be called directly on a `Collection` or on a `Stream` -- the exam may
show both. Do not confuse them.

Streams do not implement `Iterable`, so a traditional `for-each` loop does not work on
a stream:

```java
Stream<Integer> s = Stream.of(1);
for (Integer i : s) {} // DOES NOT COMPILE
```

Use `forEach()` instead, or consider whether an intermediate operation such as
`filter()` would express the intent more cleanly.

---

#### reduce()

Combines all elements of a stream into a single object. It is a reduction -- it must
process every element to produce its result.

**Why it is terminal:** it triggers execution and consumes the stream.

**Why it is a reduction:** every element participates. The accumulator merges each new
element into the running result, one at a time, until the stream is exhausted.

**Why it does not terminate on infinite streams:** it has to reach the end of the stream
to produce the final combined result. An infinite stream has no end.

Three signatures:

```java
public T reduce(T identity, BinaryOperator<T> accumulator)

public Optional<T> reduce(BinaryOperator<T> accumulator)

public <U> U reduce(U identity,
                    BiFunction<U, ? super T, U> accumulator,
                    BinaryOperator<U> combiner)
```

**Two-argument form -- with identity:**

The identity is the starting value. The accumulator merges the running result with the
next element. Think of the manual loop equivalent:

```java
var array = new String[] { "w", "o", "l", "f" };
var result = "";
for (var s : array) result = result + s;
System.out.println(result); // wolf
```

The same logic as a stream reduction:

```java
Stream<String> stream = Stream.of("w", "o", "l", "f");
String word = stream.reduce("", (s, c) -> s + c);
System.out.println(word); // wolf
```

Or with a method reference:

```java
Stream<String> stream = Stream.of("w", "o", "l", "f");
String word = stream.reduce("", String::concat);
System.out.println(word); // wolf
```

Multiplying integers -- the identity for multiplication is `1` (multiplying by 1 changes
nothing):

```java
Stream<Integer> stream = Stream.of(3, 5, 6);
System.out.println(stream.reduce(1, (a, b) -> a * b)); // 90
```

**One-argument form -- without identity:**

When no identity is provided, an `Optional` is returned because the stream might be
empty. Three cases:

- Empty stream -- returns `Optional.empty()`.
- One element -- returns that element wrapped in `Optional`.
- Multiple elements -- applies the accumulator to combine them all.

```java
BinaryOperator<Integer> op = (a, b) -> a * b;
Stream<Integer> empty         = Stream.empty();
Stream<Integer> oneElement    = Stream.of(3);
Stream<Integer> threeElements = Stream.of(3, 5, 6);

empty.reduce(op).ifPresent(System.out::println);         // (no output)
oneElement.reduce(op).ifPresent(System.out::println);    // 3
threeElements.reduce(op).ifPresent(System.out::println); // 90
```

The `Optional` return type is useful when you need to distinguish between "the stream
was empty" and "the stream produced a value that happens to equal the identity."

Consider multiplication with an identity of `1`. If you use the two-argument form and
pass `1` as the identity, an empty stream returns `1` -- because `1` is the starting
value, not because there was any actual data:

```java
Stream<Integer> empty = Stream.empty();
System.out.println(empty.reduce(1, (a, b) -> a * b)); // 1
```

Is that `1` meaningful? You cannot tell. It could mean the stream was empty, or it could
mean the stream had one element whose value happened to be `1`:

```java
Stream<Integer> empty      = Stream.empty();
Stream<Integer> oneElement = Stream.of(1);

System.out.println(empty.reduce(1, (a, b) -> a * b));      // 1
System.out.println(oneElement.reduce(1, (a, b) -> a * b)); // 1
```

Both print `1`. The two-argument form cannot tell you which situation you are in.
The identity and the real answer are indistinguishable.

The one-argument form removes that ambiguity. There is no identity to muddy the result.
An empty stream returns `Optional.empty()`, which unambiguously means "there was no
data." A stream containing just `1` returns `Optional.of(1)`, which unambiguously means
"there was data and it produced this value":

```java
BinaryOperator<Integer> op = (a, b) -> a * b;

Stream.empty()     .reduce(op).ifPresent(System.out::println); // (no output -- genuinely empty)
Stream.of(1)       .reduce(op).ifPresent(System.out::println); // 1 -- genuinely a result
Stream.of(3, 5, 6) .reduce(op).ifPresent(System.out::println); // 90
```

The rule: use the two-argument form when an empty stream has a sensible default (the
identity). Use the one-argument form when you want to know whether the stream
actually contained anything.

**Three-argument form -- with identity, accumulator, and combiner:**

Used when the stream elements and the result are different types, or when working with
parallel streams.

```java
Stream<String> stream = Stream.of("w", "o", "l", "f!");
int length = stream.reduce(0, (i, s) -> i + s.length(), (a, b) -> a + b);
System.out.println(length); // 5
```

The three parameters:

x- **Identity (`0`)** -- the starting value for the result. The result type here is `int`,
  not `String`, so the identity is `0`. If the stream were empty, this would be the answer.
- **Accumulator (`(i, s) -> i + s.length()`)** -- takes two arguments of *different* types:
  `i` is the running `int` total, `s` is the next `String` from the stream. It adds the
  length of `s` to `i` and returns the new running total. This is the step that handles
  the type mismatch between stream elements (`String`) and the result (`int`).
- **Combiner (`(a, b) -> a + b`)** -- takes two `int` partial totals and merges them into
  one. Both arguments are the same type as the result.

Why is the combiner needed at all? On a sequential stream it is not actually called --
Java processes every element through the accumulator one at a time and there is nothing
to merge. But the method signature requires it so that the same code can run in parallel
without any changes.

**How the combiner is used in parallel:**

Imagine the stream is split across two threads:

```
Thread 1 processes: "w", "o"       --> accumulator produces 1 + 1 = 2
Thread 2 processes: "l", "f!"      --> accumulator produces 1 + 2 = 3

Combiner merges:    2 + 3 = 5      --> final result
```

Each thread runs the accumulator independently on its slice of the stream. The combiner
then takes those two partial `int` results and combines them into the final answer. The
accumulator handles `String -> int`. The combiner handles `int + int -> int`.

**Why not just use the two-argument form?** Because the two-argument form requires the
identity and the stream elements to be the same type. `reduce("", String::concat)` works
because both the identity and the elements are `String`. The three-argument form is for
situations where the result type is different from the element type.

**Another example -- counting elements that pass a condition:**

Count how many strings in the stream have more than three characters:

```java
Stream<String> stream = Stream.of("monkey", "ape", "bonobo", "ox");
int count = stream.reduce(
    0,                                    // identity: start count at 0
    (total, s) -> s.length() > 3         // accumulator: if length > 3, add 1; otherwise add 0
        ? total + 1
        : total,
    (a, b) -> a + b);                    // combiner: add partial counts together
System.out.println(count); // 2  ("monkey" and "bonobo" qualify)
```

Step by step through the accumulator:

```
total = 0,  s = "monkey"  (length 6 > 3)  --> total = 1
total = 1,  s = "ape"     (length 3, not > 3) --> total = 1
total = 1,  s = "bonobo"  (length 6 > 3)  --> total = 2
total = 2,  s = "ox"      (length 2, not > 3) --> total = 2

Result: 2
```

The combiner is `(a, b) -> a + b` -- if this ran in parallel and two threads each produced
a partial count, adding them gives the total. On a sequential stream it is never called.

---

#### collect()

A special type of reduction called a **mutable reduction**. Instead of producing a new
immutable value at each step, it accumulates results into the same mutable object (such
as a `StringBuilder` or an `ArrayList`). This makes it more efficient than `reduce()` for
building collections.

**Why it is terminal:** it triggers execution and consumes the stream.

**Why it is a reduction:** every element is processed and folded into the accumulated
result.

**Why it does not terminate on infinite streams:** it must process every element to build
the complete result.

Two signatures:

```java
public <R> R collect(Supplier<R> supplier,
                     BiConsumer<R, ? super T> accumulator,
                     BiConsumer<R, R> combiner)

public <R, A> R collect(Collector<? super T, A, R> collector)
```

**Three-argument form:**

The three arguments map to the same roles as in the three-argument `reduce()`, but
all working on a single mutable container instead of building a new value each step:

- **Supplier** -- creates the mutable container that will hold the results.
- **Accumulator** -- adds one stream element into the container.
- **Combiner** -- merges two containers (used when running in parallel).

```java
Stream<String> stream = Stream.of("w", "o", "l", "f");
StringBuilder word = stream.collect(
    StringBuilder::new,      // supplier:     creates new StringBuilder
    StringBuilder::append,   // accumulator:  appends next String to it
    StringBuilder::append);  // combiner:     appends one StringBuilder into another
System.out.println(word); // wolf
```

With a `TreeSet`, the accumulator and combiner use different methods because adding
one element and merging two sets are different operations:

```java
Stream<String> stream = Stream.of("w", "o", "l", "f");
TreeSet<String> set = stream.collect(
    TreeSet::new,     // supplier:     creates empty TreeSet
    TreeSet::add,     // accumulator:  adds one String
    TreeSet::addAll); // combiner:     merges two TreeSets
System.out.println(set); // [f, l, o, w]
```

**Using a predefined `Collector`:**

Writing the three arguments manually is important to understand for the exam, but in
practice Java provides the `Collectors` utility class with common collectors already
implemented. The previous example can be rewritten as:

```java
Stream<String> stream = Stream.of("w", "o", "l", "f");
TreeSet<String> set = stream.collect(Collectors.toCollection(TreeSet::new));
System.out.println(set); // [f, l, o, w]
```

When the specific `Set` implementation does not matter:

```java
Stream<String> stream = Stream.of("w", "o", "L", "f");
Set<String> set = stream.collect(Collectors.toSet());
System.out.println(set); // [f, w, L, o] -- order not guaranteed
```

`Collectors.toSet()` makes no guarantee about which `Set` implementation is used
(likely `HashSet`) or what order the elements appear in. Do not rely on either.

The exam tests both approaches: writing your own collector with the three-argument form,
and using predefined collectors from the `Collectors` class.


---

### Using Common Intermediate Operations

An intermediate operation produces a stream as its result, so it can be chained with
other operations. Unlike terminal operations, intermediate operations are lazy -- they do
not execute until a terminal operation is reached.

An intermediate operation can work with an infinite stream by simply returning another
infinite stream. Because elements are produced one at a time on demand, the operation
only ever needs to handle the current element.

---

#### filter()

Returns a stream containing only the elements that match the given `Predicate`.

```java
public Stream<T> filter(Predicate<? super T> predicate)
```

```java
Stream<String> s = Stream.of("monkey", "gorilla", "bonobo");
s.filter(x -> x.startsWith("m"))
 .forEach(System.out::print); // monkey
```

Any `Predicate` can be passed -- the operation is as flexible as the test you write.

---

#### distinct()

Returns a stream with duplicate values removed. Duplicates do not need to be adjacent.
Java uses `equals()` to determine whether two elements are equivalent.

```java
public Stream<T> distinct()
```

```java
Stream<String> s = Stream.of("duck", "duck", "duck", "goose");
s.distinct()
 .forEach(System.out::print); // duckgoose
```

---

#### limit() and skip()

`limit()` truncates the stream to at most `maxSize` elements. `skip()` discards the first
`n` elements and returns the rest.

```java
public Stream<T> limit(long maxSize)
public Stream<T> skip(long n)
```

Both can be applied to infinite streams. `limit()` is the standard way to turn an infinite
stream into a finite one.

```java
Stream<Integer> s = Stream.iterate(1, n -> n + 1);
s.skip(5)
 .limit(2)
 .forEach(System.out::print); // 67
```

`iterate` produces `1, 2, 3, 4, 5, 6, 7, ...` indefinitely. `skip(5)` discards `1` through
`5`. `limit(2)` takes the next two elements, `6` and `7`. The resulting finite stream of
two elements is then consumed by `forEach`.

---

#### map()

Transforms each element using a `Function`, producing a new stream of the mapped
values. One input element produces exactly one output element.

```java
public <R> Stream<R> map(Function<? super T, ? extends R> mapper)
```

```java
Stream<String> s = Stream.of("monkey", "gorilla", "bonobo");
s.map(String::length)
 .forEach(System.out::print); // 676
```

`String::length` is shorthand for `x -> x.length()`. Each `String` goes in, its `int`
length comes out. The stream type changes from `Stream<String>` to `Stream<Integer>`.

Do not confuse `map()` on streams with the `Map` interface. They share a name but
have nothing to do with each other.

---

#### flatMap()

To understand `flatMap()`, you first need to understand the problem it solves.

**The problem: a stream of containers**

Suppose you have three lists of animal names and you want to process every name as if
they were all in one flat collection. The natural starting point is a stream of those lists:

```java
List<String> zero = List.of();
var one            = List.of("Bonobo");
var two            = List.of("Mama Gorilla", "Baby Gorilla");
Stream<List<String>> animals = Stream.of(zero, one, two);
```

The stream contains three elements: `zero`, `one`, and `two`. Each element is itself a
`List<String>`. The stream type is `Stream<List<String>>` -- a stream of lists, not a
stream of strings.

**What map() gives you -- the wrong thing**

`map()` transforms each element one-to-one. If you call `map(m -> m.stream())`, each
`List` becomes a `Stream<String>`:

```java
Stream<List<String>> animals = Stream.of(zero, one, two);
Stream<Stream<String>> nested = animals.map(m -> m.stream());
```

Now you have a `Stream<Stream<String>>` -- a stream containing three inner streams.
The structure looks like this:

```
outer stream
  |-- Stream<String>  (empty, from zero)
  |-- Stream<String>  ("Bonobo", from one)
  |-- Stream<String>  ("Mama Gorilla", "Baby Gorilla", from two)
```

You have not gotten closer to your goal. You wanted the individual names. Instead you
have wrapped them in yet another layer. To get at any name, you would have to iterate
the outer stream, then iterate each inner stream. That is painful and defeats the purpose.

**What flatMap() gives you -- the right thing**

`flatMap()` does the same conversion as `map()` (each `List` becomes a
`Stream<String>`), but then immediately unpacks each of those inner streams and pours
all their elements into one single flat stream:

```java
Stream<List<String>> animals = Stream.of(zero, one, two);
animals.flatMap(m -> m.stream())
       .forEach(System.out::println);
```

Output:
```
Bonobo
Mama Gorilla
Baby Gorilla
```

The structure after `flatMap`:

```
Before flatMap:                         After flatMap:
outer stream                            flat stream
  |-- []                    -->         (nothing -- empty list contributes zero elements)
  |-- ["Bonobo"]            -->         "Bonobo"
  |-- ["Mama Gorilla",      -->         "Mama Gorilla"
        "Baby Gorilla"]     -->         "Baby Gorilla"
```

The three lists are gone. Their contents are now direct elements of the stream. The empty
list disappears entirely because it had nothing to contribute.

**The rule in one sentence:** use `map()` when each element transforms into one other
element. Use `flatMap()` when each element transforms into zero or more elements that
should all join the same stream.

```java
public <R> Stream<R> flatMap(
    Function<? super T, ? extends Stream<? extends R>> mapper)
```

The signature says: give me a function that turns each element into a `Stream`, and I will
unpack all those streams into one. The "flat" in `flatMap` refers to the flattening of that
nested structure.

---

#### Stream.concat()

For the specific case of combining exactly two streams, `Stream.concat()` is simpler
than `flatMap()`:

```java
var one = Stream.of("Bonobo");
var two = Stream.of("Mama Gorilla", "Baby Gorilla");
Stream.concat(one, two)
      .forEach(System.out::println);
```

Output:
```
Bonobo
Mama Gorilla
Baby Gorilla
```

The elements of the first stream appear first, followed by the elements of the second.

---

#### sorted()

Returns a stream with elements sorted. Without a comparator, natural ordering is used.
With a comparator, the provided sort order is used.

```java
public Stream<T> sorted()
public Stream<T> sorted(Comparator<? super T> comparator)
```

Natural order:

```java
Stream<String> s = Stream.of("brown-", "bear-");
s.sorted()
 .forEach(System.out::print); // bear-brown-
```

Reverse order using a comparator:

```java
Stream<String> s = Stream.of("brown bear-", "grizzly-");
s.sorted(Comparator.reverseOrder())
 .forEach(System.out::print); // grizzly-brown bear-
```

**Common compile error -- method reference vs. method call:**

```java
Stream<String> s = Stream.of("brown bear-", "grizzly-");
s.sorted(Comparator::reverseOrder); // DOES NOT COMPILE
```

`sorted()` expects a `Comparator`, which is a functional interface taking two parameters
and returning an `int`. `Comparator::reverseOrder` is a method reference to a method
that takes no arguments and returns a `Comparator`. That makes it equivalent to
`() -> Comparator.reverseOrder()`, which is a `Supplier<Comparator>` -- not a
`Comparator` itself. The types are incompatible. The correct form is
`Comparator.reverseOrder()` (a method call that returns the comparator object) rather
than `Comparator::reverseOrder` (a method reference to the method itself).

---

#### peek()

An intermediate operation that applies a `Consumer` to each element as it passes
through, without changing the stream. The stream continues unchanged after `peek()`.

```java
public Stream<T> peek(Consumer<? super T> action)
```

The primary use is debugging -- inserting `peek()` into a pipeline to observe what
elements look like at a particular stage:

```java
var stream = Stream.of("black bear", "brown bear", "grizzly");
long count = stream.filter(s -> s.startsWith("g"))
                   .peek(System.out::println)
                   .count(); // grizzly
System.out.println(count); // 1
```

`peek()` here prints every element that survived the `filter`, revealing that only
`"grizzly"` made it through. The `count()` result is unaffected.

Think of `peek()` as an intermediate `forEach()`: same `Consumer` argument, same
action on each element, but it passes the element along rather than consuming the stream.

Unlike `peek()` on a `Queue` (which only looks at the first element), `peek()` on a
stream sees every element that passes through that stage of the pipeline.

**Do not use peek() to modify elements:**

`peek()` is intended for observation only. Java does not prevent you from writing code
that mutates state inside `peek()`, but doing so produces incorrect results:

```java
var numbers = new ArrayList<>();
var letters = new ArrayList<>();
numbers.add(1);
letters.add('a');

// Correct -- peek() only observes
Stream<List<?>> stream = Stream.of(numbers, letters);
stream.map(List::size).forEach(System.out::print); // 11

// Wrong -- peek() mutates the lists before map() sees them
Stream<List<?>> bad = Stream.of(numbers, letters);
bad.peek(x -> x.remove(0))
   .map(List::size)
   .forEach(System.out::print); // 00
```

In the bad example, `peek()` removes the one element from each list before `map()`
calls `List::size`. Both lists are now empty, so both sizes are `0`. The pipeline produces
the wrong answer because the data it is supposed to process was destroyed mid-stream.
Use `peek()` only to observe. Use `map()` if you need to transform.

---

### Putting Together the Pipeline

Streams let you express *what* you want rather than *how* to do it. Compare the two
approaches for finding the first two names of length 4, sorted alphabetically.

**Without streams:**

```java
var list = List.of("Toby", "Anna", "Leroy", "Alex");
List<String> filtered = new ArrayList<>();
for (String name : list)
    if (name.length() == 4) filtered.add(name);
Collections.sort(filtered);
var iter = filtered.iterator();
if (iter.hasNext()) System.out.println(iter.next());
if (iter.hasNext()) System.out.println(iter.next());
```

**With streams:**

```java
var list = List.of("Toby", "Anna", "Leroy", "Alex");
list.stream()
    .filter(n -> n.length() == 4)
    .sorted()
    .limit(2)
    .forEach(System.out::println);
```

The stream version reads like a description of the problem: keep names of length 4, sort
them, take the first two, print them. The pipeline has all three parts:

```
source        --> intermediate ops                    --> terminal op
list.stream()    filter() --> sorted() --> limit()       forEach()
```

---

#### How the pipeline executes step by step

`sorted()` is special among intermediate operations: it cannot pass any element forward
until it has seen all of them, because sorting requires the complete set. Every other
operation in this pipeline processes one element at a time.

Walk through each element:

```
1. "Toby"  --> filter (length 4, pass) --> sorted holds it
2. "Anna"  --> filter (length 4, pass) --> sorted holds it
3. "Leroy" --> filter (length 5, REMOVED) -- never reaches sorted
4. "Alex"  --> filter (length 4, pass) --> sorted holds it

   sorted now has all elements (Toby, Anna, Alex) and sorts them: Alex, Anna, Toby

5. sorted sends "Alex" --> limit (seen 1) --> forEach prints Alex
6. sorted sends "Anna" --> limit (seen 2) --> forEach prints Anna
7. limit has seen 2 elements -- signals stop. "Toby" is never sent.
```

Output:
```
Alex
Anna
```

---

#### sorted() on infinite streams -- hangs or works depending on position

`sorted()` must collect every element before it can sort. On an infinite stream, that
moment never arrives.

**Hangs -- sorted() before limit():**

```java
Stream.generate(() -> "Elsa")
      .filter(n -> n.length() == 4)
      .sorted()
      .limit(2)
      .forEach(System.out::println);
```

`sorted()` waits to collect all elements so it can sort them. The stream is infinite, so
sorted() waits forever. The program either hangs or runs out of memory.

**Works -- limit() before sorted():**

```java
Stream.generate(() -> "Elsa")
      .filter(n -> n.length() == 4)
      .limit(2)
      .sorted()
      .forEach(System.out::println);
```

`limit(2)` stops the earlier operations after two elements pass through. By the time
`sorted()` is reached, it has a finite list of two elements and can sort immediately.
Prints `Elsa` twice.

**Hangs -- filter() blocks everything:**

```java
Stream.generate(() -> "Olaf Lazisson")
      .filter(n -> n.length() == 4)
      .limit(2)
      .sorted()
      .forEach(System.out::println);
```

`"Olaf Lazisson"` has length 13, so `filter()` never lets anything through.
`limit(2)` never sees two elements. The stream generates names forever and the
program hangs.

The rule: placing `sorted()` before `limit()` on an infinite stream will always hang.
`limit()` must come first to make the stream finite before `sorted()` sees it.

---

#### Chained pipelines

A stream pipeline ends at a terminal operation. The result of that terminal operation can
itself become the source of a new pipeline. These two pipelines are chained together:

```java
long count = Stream.of("goldfish", "finch")  // pipeline 1 source
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList())            // pipeline 1 terminal op -- produces a List
    .stream()                                // pipeline 2 source
    .count();                                // pipeline 2 terminal op
System.out.println(count); // 1
```

The same code written with an intermediate variable is easier to read:

```java
List<String> helper = Stream.of("goldfish", "finch")
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());

long count = helper.stream()
    .count();
System.out.println(count); // 1
```

Both are equivalent. You need to be able to read both styles on the exam.

**Exam tip:** when a question shows a long or complex pipeline, focus on the differences
between the answer choices rather than reading every pipeline in full. Also identify where
each source and terminal operation are -- this tells you how many pipelines are involved
and what each one produces.


---

### Working with Primitive Streams

So far every stream has used `Stream<T>` with a wrapper type like `Stream<Integer>`.
For numeric work this means boxing and unboxing on every element, which is wasteful.
Java provides three specialised stream types that work directly with primitives:

- `IntStream` -- for `int`, `short`, `byte`, and `char`
- `LongStream` -- for `long`
- `DoubleStream` -- for `double` and `float`

Only these three primitive stream types exist. The API designers chose the most common
primitive types and stopped there.

**Why bother?** Two reasons. First, performance -- no boxing overhead. Second,
convenience -- primitive streams have built-in numeric methods (`sum()`, `average()`,
`min()`, `max()`) that `Stream<T>` does not have.

Compare computing a sum with `Stream<Integer>` vs `IntStream`:

```java
// With Stream<Integer> -- requires a manual reduction
Stream<Integer> stream = Stream.of(1, 2, 3);
System.out.println(stream.reduce(0, (s, n) -> s + n)); // 6

// With IntStream -- sum() is built in
Stream<Integer> stream = Stream.of(1, 2, 3);
System.out.println(stream.mapToInt(x -> x).sum()); // 6
```

Computing an average is even more illustrative. With `Stream<Integer>` you would have
to write a three-argument `reduce()` to track both the running total and the count
simultaneously. With `IntStream` it is one method call:

```java
IntStream intStream = IntStream.of(1, 2, 3);
OptionalDouble avg = intStream.average();
System.out.println(avg.getAsDouble()); // 2.0
```

**Naming note:** on the exam, capitalisation matters. `Stream` (capital S, or in code)
refers to the `Stream<T>` class. `stream` (lowercase s) is the general concept and could
refer to any of `Stream`, `IntStream`, `LongStream`, or `DoubleStream`.

---

#### Methods unique to primitive streams

These methods exist on primitive streams but not on `Stream<T>`:

| Method | Primitive stream | Description |
|---|---|---|
| `average()` | `IntStream`, `LongStream`, `DoubleStream` | Returns `OptionalDouble` with the arithmetic mean. |
| `sum()` | `IntStream`, `LongStream`, `DoubleStream` | Returns the sum as `int`, `long`, or `double`. |
| `min()` | `IntStream` -> `OptionalInt`, `LongStream` -> `OptionalLong`, `DoubleStream` -> `OptionalDouble` | Minimum element. |
| `max()` | `IntStream` -> `OptionalInt`, `LongStream` -> `OptionalLong`, `DoubleStream` -> `OptionalDouble` | Maximum element. |
| `boxed()` | `IntStream`, `LongStream`, `DoubleStream` | Converts to `Stream<T>` using the wrapper type (`Stream<Integer>`, `Stream<Long>`, `Stream<Double>`). |
| `range(a, b)` | `IntStream`, `LongStream` | Elements from `a` (inclusive) to `b` (exclusive). |
| `rangeClosed(a, b)` | `IntStream`, `LongStream` | Elements from `a` (inclusive) to `b` (inclusive). |
| `sum()` | `IntStream` -> `int`, `LongStream` -> `long`, `DoubleStream` -> `double` | Returns the sum of all elements. |
| `summaryStatistics()` | `IntStream` -> `IntSummaryStatistics`, `LongStream` -> `LongSummaryStatistics`, `DoubleStream` -> `DoubleSummaryStatistics` | Returns a statistics object containing count, sum, min, max, and average in a single pass. |

`range()` and `rangeClosed()` are only available on `IntStream` and `LongStream` --
there is no `DoubleStream.range()` because a range of floating-point numbers is not
well-defined.

`boxed()` converts a primitive stream back into a `Stream<T>` of the corresponding
wrapper type. You need this when you have a primitive stream but the next step requires
a `Stream<T>` -- for example, to collect into a `List`, use a `Collector`, or call a method
that only accepts `Stream<T>`.

A primitive stream like `IntStream` works directly with `int` values. It does not have
`collect(Collectors.toList())` and similar methods, because those are defined on
`Stream<T>`. `boxed()` bridges the gap by wrapping each `int` into an `Integer`,
producing a `Stream<Integer>` that has all the usual `Stream<T>` methods:

```java
// IntStream does not have collect(Collectors.toList()) -- does not compile
IntStream.of(1, 2, 3).collect(Collectors.toList()); // DOES NOT COMPILE

// boxed() converts to Stream<Integer> first, then collect works
List<Integer> list = IntStream.of(1, 2, 3)
                              .boxed()
                              .collect(Collectors.toList());
System.out.println(list); // [1, 2, 3]
```

The conversions:
- `IntStream.boxed()` --> `Stream<Integer>`
- `LongStream.boxed()` --> `Stream<Long>`
- `DoubleStream.boxed()` --> `Stream<Double>`

Think of `boxed()` as the reverse of `mapToInt()` / `mapToLong()` / `mapToDouble()`.
Those convert from `Stream<T>` to a primitive stream. `boxed()` converts back.

The `min()` and `max()` return types differ from `Stream<T>`. On a `Stream<T>` they
return `Optional<T>`. On primitive streams they return the primitive-specific optional
type: `OptionalInt`, `OptionalLong`, or `OptionalDouble`. These have corresponding
getter methods (`getAsInt()`, `getAsLong()`, `getAsDouble()`) instead of `get()`.

`summaryStatistics()` solves the problem of needing multiple statistics from the same
stream. Earlier it was noted that you cannot call both `min()` and `max()` on the same
stream because a stream can only have one terminal operation. `summaryStatistics()`
is that one terminal operation -- it computes count, sum, min, max, and average all in
a single pass:

```java
IntStream intStream = IntStream.of(1, 2, 3, 4, 5);
IntSummaryStatistics stats = intStream.summaryStatistics();
System.out.println(stats.getMin());     // 1
System.out.println(stats.getMax());     // 5
System.out.println(stats.getSum());     // 15
System.out.println(stats.getCount());   // 5
System.out.println(stats.getAverage()); // 3.0
```


---

#### Creating primitive streams

The same creation methods from `Stream` exist on primitive streams.

**Empty and of():**

```java
DoubleStream empty    = DoubleStream.empty();
DoubleStream oneValue = DoubleStream.of(3.14);
DoubleStream varargs  = DoubleStream.of(1.0, 1.1, 1.2);
```

**Infinite streams:**

```java
var random    = DoubleStream.generate(Math::random);
var fractions = DoubleStream.iterate(.5, d -> d / 2);
random.limit(3).forEach(System.out::println);    // three random doubles
fractions.limit(3).forEach(System.out::println); // 0.5, 0.25, 0.125
```

**Ranges -- for int and long only:**

When you need a sequential run of integers, `range()` and `rangeClosed()` are cleaner
than `iterate().limit()`.

```java
// Verbose way
IntStream.iterate(1, n -> n + 1).limit(5).forEach(System.out::print); // 12345

// range() -- first param inclusive, second param exclusive
IntStream.range(1, 6).forEach(System.out::print); // 12345

// rangeClosed() -- both params inclusive
IntStream.rangeClosed(1, 5).forEach(System.out::print); // 12345
```

`range(1, 6)` and `rangeClosed(1, 5)` produce the same result. `rangeClosed` matches
how we naturally describe a range in English: "1 through 5 inclusive."

---

#### Mapping between stream types

Every combination of stream-to-stream mapping is supported. The method name tells
you the target type:

| Source | To `Stream<T>` | To `DoubleStream` | To `IntStream` | To `LongStream` |
|---|---|---|---|---|
| `Stream<T>` | `map()` | `mapToDouble()` | `mapToInt()` | `mapToLong()` |
| `DoubleStream` | `mapToObj()` | `map()` | `mapToInt()` | `mapToLong()` |
| `IntStream` | `mapToObj()` | `mapToDouble()` | `map()` | `mapToLong()` |
| `LongStream` | `mapToObj()` | `mapToDouble()` | `mapToInt()` | `map()` |

Rules for remembering the names:
- Mapping to the same type you started with is always just `map()`.
- Mapping to an object stream is always `mapToObj()`.
- Everything else is `mapTo` + the target primitive type name.

Examples -- one for each direction of mapping:

`Stream<T>` to `IntStream` using `mapToInt()` -- maps each `String` to its length,
going from an object stream to a primitive int stream:

```java
Stream<String> objStream = Stream.of("penguin", "fish");
IntStream intStream = objStream.mapToInt(s -> s.length()); // String -> int
intStream.forEach(System.out::print); // 76
```

`IntStream` to `Stream<T>` using `mapToObj()` -- maps each `int` to a `String`,
going from a primitive int stream back to an object stream:

```java
IntStream intStream = IntStream.of(1, 2, 3);
Stream<String> objStream = intStream.mapToObj(n -> "item" + n); // int -> String
objStream.forEach(System.out::println); // item1, item2, item3
```

`IntStream` to `DoubleStream` using `mapToDouble()` -- maps each `int` to a
`double`, going from one primitive stream type to another:

```java
IntStream intStream = IntStream.of(1, 2, 3);
DoubleStream doubleStream = intStream.mapToDouble(n -> n * 1.5); // int -> double
doubleStream.forEach(System.out::println); // 1.5, 3.0, 4.5
```

`DoubleStream` to `LongStream` using `mapToLong()` -- maps each `double` to a
`long` by truncating the decimal, going from one primitive stream type to another:

```java
DoubleStream doubleStream = DoubleStream.of(1.9, 2.7, 3.3);
LongStream longStream = doubleStream.mapToLong(d -> (long) d); // double -> long
longStream.forEach(System.out::print); // 123
```

`IntStream` staying as `IntStream` using `map()` -- when the source and target are the
same type, the method is just `map()`:

```java
IntStream intStream = IntStream.of(1, 2, 3);
IntStream doubled = intStream.map(n -> n * 2); // int -> int
doubled.forEach(System.out::print); // 246
```

The pattern: the method name always describes the destination. If you are on an
`IntStream` and want a `DoubleStream`, you call `mapToDouble()`. If you want to stay
on `IntStream`, you call `map()`. If you want a `Stream<T>`, you call `mapToObj()`.

The function type you pass to the mapping method depends on the source and target stream
types. The table below shows what function type is expected in each case:

| Source | To `Stream<T>` | To `DoubleStream` | To `IntStream` | To `LongStream` |
|---|---|---|---|---|
| `Stream<T>` | `Function<T,R>` | `ToDoubleFunction<T>` | `ToIntFunction<T>` | `ToLongFunction<T>` |
| `DoubleStream` | `DoubleFunction<R>` | `DoubleUnaryOperator` | `DoubleToIntFunction` | `DoubleToLongFunction` |
| `IntStream` | `IntFunction<R>` | `IntToDoubleFunction` | `IntUnaryOperator` | `IntToLongFunction` |
| `LongStream` | `LongFunction<R>` | `LongToDoubleFunction` | `LongToIntFunction` | `LongUnaryOperator` |

Rules for remembering the function names:
- When the target is an object stream, drop the `To` -- e.g. `DoubleFunction`, not `DoubleToFunction`.
- When mapping to the same type, it is a `UnaryOperator` -- e.g. `IntUnaryOperator`.
- Everything else follows the pattern `SourceType` + `To` + `TargetType` + `Function`.

The function type is the lambda you pass as the argument to the mapping method. The
table tells you what type that lambda must be. In practice you just write the lambda and
Java infers the type -- but knowing the type name is what the exam tests.

To make this concrete: `mapToInt()` takes one argument. That argument is a lambda.
The type of that lambda is whatever the table says for your source stream going to
`IntStream`. The lambda itself is what you have already been writing -- the table just
gives it a name.

Examples showing both the lambda and its function type explicitly:

`Stream<String>` to `IntStream` -- the lambda takes a `String` and returns an `int`.
That matches the `ToIntFunction<String>` type from the table:

```java
ToIntFunction<String> fn = s -> s.length(); // String in, int out

Stream<String> stream = Stream.of("penguin", "fish");
IntStream lengths = stream.mapToInt(fn);    // passing the function explicitly
lengths.forEach(System.out::print); // 76

// In practice you write the lambda inline -- same thing:
stream = Stream.of("penguin", "fish");
stream.mapToInt(s -> s.length()).forEach(System.out::print); // 76
```

`IntStream` to `Stream<String>` -- the lambda takes an `int` and returns a `String`.
That matches `IntFunction<String>`. No `To` in the name because the target is an
object stream:

```java
IntFunction<String> fn = n -> "item" + n; // int in, String out

IntStream intStream = IntStream.of(1, 2, 3);
Stream<String> labels = intStream.mapToObj(fn);
labels.forEach(System.out::println); // item1, item2, item3
```

`IntStream` to `IntStream` -- the lambda takes an `int` and returns an `int`. Same type
in and out, so the type is `IntUnaryOperator`, not a `Function`:

```java
IntUnaryOperator fn = n -> n * 2; // int in, int out

IntStream intStream = IntStream.of(1, 2, 3);
IntStream doubled = intStream.map(fn);
doubled.forEach(System.out::print); // 246
```

`DoubleStream` to `IntStream` -- the lambda takes a `double` and returns an `int`.
That matches `DoubleToIntFunction`:

```java
DoubleToIntFunction fn = d -> (int) d; // double in, int out

DoubleStream doubleStream = DoubleStream.of(1.9, 2.7, 3.3);
IntStream truncated = doubleStream.mapToInt(fn);
truncated.forEach(System.out::print); // 123
```

The key insight: the lambda you write is the function. The type name in the table is just
what Java calls that particular shape of lambda (takes X, returns Y). You rarely need to
declare the type explicitly -- you just write the lambda inline and Java infers it. But the
exam will show you the type name and expect you to know which mapping method it
belongs to.

---

#### flatMap on primitive streams

Same concept as `flatMap` on `Stream<T>`: you have a stream of containers, each
container gets unpacked, and all the elements end up in one flat stream. The difference
is the target type -- instead of producing a `Stream<T>` of boxed objects, you produce
a primitive stream with no boxing overhead.

```
flatMap       --> Stream<Integer>  (boxed)
flatMapToInt  --> IntStream        (primitive, no boxing)
```

The method names per target type:
- `flatMapToInt()` -- produces an `IntStream`
- `flatMapToDouble()` -- produces a `DoubleStream`
- `flatMapToLong()` -- produces a `LongStream`

Example -- two lists of integers, unpacked into a single flat `IntStream`:

```java
List<Integer> listA = List.of(1, 2, 3);
List<Integer> listB = List.of(4, 5, 6);

Stream<List<Integer>> streamOfLists = Stream.of(listA, listB);

IntStream ints = streamOfLists.flatMapToInt(list -> list.stream().mapToInt(x -> x));
ints.forEach(System.out::print); // 123456
```

The lambda `list -> list.stream().mapToInt(x -> x)` takes each `List<Integer>`,
converts it to an `IntStream`, and `flatMapToInt` pours all those `IntStream`s into
one flat `IntStream`. The same pattern as regular `flatMap`, just ending at a primitive
stream instead of an object stream.

---

#### Converting a primitive stream to Stream<T>

Two equivalent ways to go from `IntStream` back to `Stream<Integer>`:

```java
// mapToObj() with an explicit identity function
private static Stream<Integer> mapping(IntStream stream) {
    return stream.mapToObj(x -> x);
}

// boxed() -- shorter, no mapping function needed
private static Stream<Integer> boxing(IntStream stream) {
    return stream.boxed();
}
```

`boxed()` is the cleaner option when you only need the wrapper type and do not need
to transform the value.

---

#### Using Optional with primitive streams

Primitive streams return primitive-specific `Optional` types, not `Optional<T>`. This
avoids boxing the result back into a wrapper.

```java
var stream = IntStream.rangeClosed(1, 10);
OptionalDouble optional = stream.average();

optional.ifPresent(System.out::println);               // 5.5
System.out.println(optional.getAsDouble());            // 5.5
System.out.println(optional.orElseGet(() -> Double.NaN)); // 5.5
```

`getAsDouble()` is used instead of `get()` to make it clear you are working with a
primitive. `orElseGet()` takes a `DoubleSupplier` instead of a `Supplier`.

The three optional types for primitives:

| | `OptionalDouble` | `OptionalInt` | `OptionalLong` |
|---|---|---|---|
| Getting the value | `getAsDouble()` | `getAsInt()` | `getAsLong()` |
| `orElseGet()` parameter | `DoubleSupplier` | `IntSupplier` | `LongSupplier` |
| Return type of `max()` / `min()` | `OptionalDouble` | `OptionalInt` | `OptionalLong` |
| Return type of `sum()` | `double` | `int` | `long` |
| Return type of `average()` | `OptionalDouble` | `OptionalDouble` | `OptionalDouble` |

Two things worth noting:
- `sum()` never returns an `Optional`. An empty stream sums to zero -- there is always
  a sensible answer.
- `average()` always returns `OptionalDouble` regardless of stream type, because an
  average can have a fractional part even for integer streams.

```java
LongStream longs = LongStream.of(5, 10);
long sum = longs.sum();
System.out.println(sum); // 15

DoubleStream doubles = DoubleStream.generate(() -> Math.PI);
OptionalDouble min = doubles.min(); // hangs -- infinite stream, min() never terminates
```

---

#### Summarizing statistics

`summaryStatistics()` is the solution when you need multiple statistics from the same
stream. Since `min()` and `max()` are both terminal operations, you cannot call them
separately on the same stream. `summaryStatistics()` computes everything in one pass:

```java
private static int range(IntStream ints) {
    IntSummaryStatistics stats = ints.summaryStatistics();
    if (stats.getCount() == 0) throw new RuntimeException();
    return stats.getMax() - stats.getMin();
}
```

Methods available on the summary statistics object:

- `getCount()` -- returns a `long` with the number of elements.
- `getAverage()` -- returns a `double`. Returns `0` if the stream was empty.
- `getSum()` -- returns `double` for `DoubleSummaryStatistics`, `long` for `IntSummaryStatistics` and `LongSummaryStatistics`.
- `getMin()` -- returns the minimum as `double`, `int`, or `long`. If the stream was
  empty, returns the largest possible value for that type (because no element was ever
  smaller than it).
- `getMax()` -- returns the maximum as `double`, `int`, or `long`. If the stream was
  empty, returns the smallest possible value for that type.


---

### Advanced Stream Pipeline Concepts

---

#### Streams and the underlying data

A stream does not copy its source data when it is created. It only stores a reference to
where the data lives. Because of lazy evaluation, the actual elements are not read until
a terminal operation runs. This means changes made to the source after the stream is
created are visible to the stream:

```java
var cats = new ArrayList<String>();
cats.add("Annie");
cats.add("Ripley");
var stream = cats.stream(); // no data is read yet -- just a reference to cats
cats.add("KC");             // modifying the source after stream creation
System.out.println(stream.count()); // 3 -- KC is included
```

The stream was created when `cats` had two elements, but it did not snapshot those
elements. When `count()` runs, it iterates the list at that moment and finds three
elements. No snapshot is taken then either -- the stream simply walks through the list,
counts what it finds, and is done.

After the terminal operation completes, the stream is consumed and cannot be used
again. Adding another element and trying to reuse the same stream throws an exception:

```java
cats.add("Luna");
System.out.println(stream.count()); // IllegalStateException: stream has already been operated upon or closed
```

To run another terminal operation after modifying the list, create a new stream:

```java
cats.add("Luna");
System.out.println(cats.stream().count()); // 4 -- fresh stream, works fine
```

The stream object is single-use. The list it points to is not. You can create as many
streams from the same list as you want, but each stream can only be used once.

---

#### Chaining Optionals

`Optional` supports a small set of functional-style methods similar to stream
intermediate operations. This lets you chain transformations instead of nesting `if`
statements.

Without functional programming:

```java
private static void threeDigit(Optional<Integer> optional) {
    if (optional.isPresent()) {
        var num = optional.get();
        var string = "" + num;
        if (string.length() == 3)
            System.out.println(string);
    }
}
```

With functional programming:

```java
private static void threeDigit(Optional<Integer> optional) {
    optional.map(n -> "" + n)            // part 1: Integer -> String
            .filter(s -> s.length() == 3) // part 2: keep only 3-digit strings
            .ifPresent(System.out::println); // part 3: print if still present
}
```

Both versions are equivalent. The functional version is shorter and reads as a
description of the logic rather than a set of instructions.

How each case flows through:

- **Empty Optional** -- `map()` passes the empty `Optional` through unchanged.
  `filter()` also passes it through. `ifPresent()` does nothing.
- **`Optional.of(4)`** -- `map()` converts `4` to `"4"`. `filter()` sees length 1, returns
  empty. `ifPresent()` does nothing.
- **`Optional.of(123)`** -- `map()` converts `123` to `"123"`. `filter()` sees length 3,
  passes it through. `ifPresent()` prints `"123"`.

**`flatMap()` on Optional:**

`map()` on an `Optional` wraps the result in a new `Optional`. If the mapping function
itself returns an `Optional`, you end up with `Optional<Optional<T>>` -- an unwanted
extra layer:

```java
// map() with a function that returns Optional -> nested Optional
Optional<Integer> result = optional.map(ChainingOptionals::calculator);
// result type is Optional<Optional<Integer>> -- DOES NOT COMPILE as Optional<Integer>
```

`flatMap()` unwraps that extra layer, just like it does on streams:

```java
// flatMap() flattens the result back to Optional<Integer>
Optional<Integer> result = optional.flatMap(ChainingOptionals::calculator);
```

Use `map()` when the mapping function returns a plain value. Use `flatMap()` when the
mapping function returns an `Optional`.

---

#### Checked exceptions and functional interfaces

Most functional interfaces (`Supplier`, `Function`, `Consumer`, etc.) do not declare
checked exceptions. This causes a compile error when you try to use a method that
throws a checked exception as a method reference or lambda.

**What a checked exception is:**

Some methods declare that they might fail in a way the compiler forces you to handle.
They signal this with a `throws` clause in their signature:

```java
private static List<String> create() throws IOException {
    throw new IOException();
}
```

`IOException` is a checked exception. The `throws IOException` is a contract: "if you
call this method, you must deal with the possibility that it throws." The compiler enforces
this. You have two options:

1. Wrap the call in a `try/catch` and handle it there.
2. Add `throws IOException` to your own method signature and pass the responsibility
   up to the caller.

If you do neither, the code does not compile. That is what "checked" means.

**Why a method reference to a checked-exception method does not compile:**

`ExceptionCaseStudy` is a regular class (not an interface) that contains the static
`create()` method above.

```java
// Works fine -- the calling method declares the exception
public void good() throws IOException {
    ExceptionCaseStudy.create().stream().count();
}

// Does not compile -- Supplier does not declare IOException
public void bad() throws IOException {
    Supplier<List<String>> s = ExceptionCaseStudy::create; // DOES NOT COMPILE
    // error: unhandled exception type IOException
}
```

Why `good()` compiles: `create()` is called directly. The compiler sees the call,
sees it throws `IOException`, and checks whether the surrounding method handles or
declares it. `good()` has `throws IOException` in its signature, so the responsibility
is passed up to whoever calls `good()`. The compiler is satisfied.

Why `bad()` does not compile even though it also has `throws IOException`: the
`throws IOException` on `bad()` only covers exceptions that escape directly from
`bad()` itself. In `bad()`, `create()` is not being called -- it is being wrapped inside
a `Supplier`. The `Supplier` will call `create()` later, when `get()` is invoked somewhere
else. The compiler looks at `Supplier.get()` and sees no `throws` clause. That means
whoever calls `get()` will not expect an `IOException` to come out of it. The compiler
refuses to let you hide a checked exception inside an interface that does not declare it.

```
good():  create() called directly --> IOException escapes good() --> good() declares it --> OK

bad():   create() is stored in Supplier --> get() will call create() later, elsewhere
         --> IOException would escape get() --> get() has no throws clause --> DOES NOT COMPILE
```

The `throws IOException` on `bad()` is irrelevant to the problem. The issue is that
`Supplier.get()` does not declare `IOException`, so there is nowhere for the exception
to go when `get()` is eventually called.

The method reference `ExceptionCaseStudy::create` expands to a lambda equivalent to:

```java
() -> ExceptionCaseStudy.create()
```

`Supplier<T>` is defined as:

```java
@FunctionalInterface
public interface Supplier<T> {
    T get(); // no throws clause
}
```

`get()` has no `throws` clause. That means a lambda assigned to a `Supplier` is not
allowed to throw a checked exception. But `create()` throws `IOException`. The lambda
tries to throw a checked exception through an interface that does not permit it, so the
compiler rejects it.

**Option 1 -- catch and rethrow inline (ugly but works):**

```java
public void ugly() {
    Supplier<List<String>> s = () -> {
        try {
            return ExceptionCaseStudy.create();
        } catch (IOException e) {
            throw new RuntimeException(e); // RuntimeException is unchecked -- no throws clause needed
        }
    };
}
```

**Option 2 -- extract a safe wrapper method (cleaner):**

```java
private static List<String> createSafe() {
    try {
        return ExceptionCaseStudy.create();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

public void wrapped() {
    Supplier<List<String>> s = ExceptionCaseStudy::createSafe; // compiles fine
}
```

The wrapper absorbs the checked exception and rethrows it as an unchecked
`RuntimeException`. The compiler does not require `RuntimeException` to be declared
or caught, so `Supplier.get()` is satisfied.

The one rule to take away for this chapter: if a method throws a checked exception,
you cannot use it directly as a lambda or method reference for a functional interface
that does not declare that exception. Wrap it first.


---

### Using a Spliterator

A `Spliterator` is like a bag of food you split between two children at a petting zoo. You
start with a full bag (a `Collection` or a `Stream`). Calling `trySplit()` takes roughly
half the elements out and puts them into a new `Spliterator`. The other half stays in the
original.

| Method | Description |
|---|---|
| `Spliterator<T> trySplit()` | Returns a new `Spliterator` containing roughly half the remaining data, removing those elements from the current one. Returns `null` when no more splitting is possible. Can be called multiple times. |
| `void forEachRemaining(Consumer<T> c)` | Processes all remaining elements in the `Spliterator`. |
| `boolean tryAdvance(Consumer<T> c)` | Processes a single element if one remains. Returns `true` if an element was processed, `false` if there was nothing left. |

You do not need to implement `Spliterator` for the exam. You only need to know these
three methods.

**Example -- splitting a list three ways:**

```java
var stream = List.of("bird-", "bunny-", "cat-", "dog-", "fish-", "lamb-", "mouse-");
Spliterator<String> originalBagOfFood = stream.spliterator(); // all 7 elements
Spliterator<String> emmasBag = originalBagOfFood.trySplit();  // roughly half removed

emmasBag.forEachRemaining(System.out::print);        // bird-bunny-cat-

Spliterator<String> jillsBag = originalBagOfFood.trySplit();  // roughly half of remaining 4

jillsBag.tryAdvance(System.out::print);              // dog-
jillsBag.forEachRemaining(System.out::print);        // fish-

originalBagOfFood.forEachRemaining(System.out::print); // lamb-mouse-
```

Started with 7. Emma's bag took 3. Jill's bag took 2. Original bag left with 2.

**Example -- Spliterator on an infinite stream:**

```java
var originalBag = Stream.iterate(1, n -> ++n).spliterator();
Spliterator<Integer> newBag = originalBag.trySplit();

newBag.tryAdvance(System.out::print); // 1
newBag.tryAdvance(System.out::print); // 2
newBag.tryAdvance(System.out::print); // 3
```

The stream is infinite. `trySplit()` recognises this and instead of trying to give half of
infinity, it gives `newBag` a large finite chunk. We call `tryAdvance()` three times to get
the first three elements. Do not call `forEachRemaining()` on an infinite stream.

---

### Collecting Results

The `collect()` terminal operation accepts a `Collector` from the `Collectors` utility
class. The table below shows the most important predefined collectors:

| Collector | Description | Return type |
|---|---|---|
| `averagingInt(f)`, `averagingLong(f)`, `averagingDouble(f)` | Average of elements using the given function | `Double` |
| `counting()` | Count of elements | `Long` |
| `filtering(Predicate, Collector)` | Applies filter before passing to downstream collector | `R` |
| `groupingBy(f)`, `groupingBy(f, Collector)`, `groupingBy(f, Supplier, Collector)` | Groups elements into a `Map` by key function | `Map<K, List<T>>` |
| `joining(delimiter)` | Concatenates elements into a `String` with delimiter | `String` |
| `maxBy(Comparator)`, `minBy(Comparator)` | Finds largest / smallest element | `Optional<T>` |
| `mapping(f, Collector)` | Transforms elements then applies downstream collector | `Collector` |
| `partitioningBy(Predicate)`, `partitioningBy(Predicate, Collector)` | Splits into `true`/`false` groups | `Map<Boolean, List<T>>` |
| `summarizingInt(f)`, `summarizingLong(f)`, `summarizingDouble(f)` | Computes count, sum, min, max, average | `IntSummaryStatistics` etc. |
| `summingInt(f)`, `summingLong(f)`, `summingDouble(f)` | Sum of elements | `Integer`, `Long`, `Double` |
| `teeing(Collector, Collector, BiFunction)` | Passes elements to two collectors and merges results | `R` |
| `toList()`, `toSet()` | Collects into a `List` or `Set` | `List`, `Set` |
| `toCollection(Supplier)` | Collects into a specific `Collection` type | `Collection` |
| `toMap(k, v)`, `toMap(k, v, mergeF)`, `toMap(k, v, mergeF, Supplier)` | Collects into a `Map` | `Map` |

---

#### Basic collectors

`joining()` -- concatenates all elements into a single `String` with a delimiter:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
String result = ohMy.collect(Collectors.joining(", "));
System.out.println(result); // lions, tigers, bears
```

`averagingInt()` -- calculates the average using the provided function. Always returns
`Double` (not a primitive `double`) because collectors work with objects:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Double result = ohMy.collect(Collectors.averagingInt(String::length));
System.out.println(result); // 5.333333333333333
```

`toCollection()` -- collects into a specific `Collection` type:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
TreeSet<String> result = ohMy
    .filter(s -> s.startsWith("t"))
    .collect(Collectors.toCollection(TreeSet::new));
System.out.println(result); // [tigers]
```

---

#### Collecting into maps

`toMap()` requires two functions: one to produce the key, one to produce the value.

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<String, Integer> map = ohMy.collect(
    Collectors.toMap(s -> s, String::length));
System.out.println(map); // {lions=5, bears=5, tigers=6}
```

`s -> s` (or `Function.identity()`) uses the element itself as the key. `String::length`
produces the value.

```java
// s -> s and Function.identity() are identical -- both use the element as the key
var ohMy = Stream.of("lions", "tigers", "bears");
Map<String, Integer> map1 = ohMy.collect(
    Collectors.toMap(s -> s, String::length));

ohMy = Stream.of("lions", "tigers", "bears");
Map<String, Integer> map2 = ohMy.collect(
    Collectors.toMap(Function.identity(), String::length));

// map1 and map2 are identical: {lions=5, bears=5, tigers=6}
```

**Duplicate key problem:** if two elements produce the same key, an
`IllegalStateException` is thrown:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<Integer, String> map = ohMy.collect(
    Collectors.toMap(String::length, k -> k)); // THROWS IllegalStateException
// "lions" and "bears" both have length 5 -- duplicate key
```

Fix it by providing a merge function as a third argument, which decides what to do when
two values share the same key:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<Integer, String> map = ohMy.collect(Collectors.toMap(
    String::length,
    k -> k,
    (s1, s2) -> s1 + "," + s2)); // merge: concatenate with comma
System.out.println(map); // {5=lions,bears, 6=tigers}
```

By default, `toMap()` gives you a `HashMap`. You have no control over which `Map`
implementation you get. If you need a specific type -- for example a `TreeMap` so the
keys are always sorted -- you add a fourth argument: a `Supplier` that constructs the
`Map`. `TreeMap::new` is a constructor reference that creates a new empty `TreeMap`.

```java
var ohMy = Stream.of("lions", "tigers", "bears");
TreeMap<Integer, String> map = ohMy.collect(Collectors.toMap(
    String::length,               // key:   length of the string
    k -> k,                       // value: the string itself
    (s1, s2) -> s1 + "," + s2,   // merge: join duplicates with a comma
    TreeMap::new));               // map type: give me a TreeMap, not a HashMap
System.out.println(map);           // {5=lions,bears, 6=tigers}  -- keys sorted
System.out.println(map.getClass()); // class java.util.TreeMap
```

The four arguments in order:
1. Key function -- `String::length` maps each string to its length as the key.
2. Value function -- `k -> k` uses the string itself as the value.
3. Merge function -- `(s1, s2) -> s1 + "," + s2` handles duplicate keys by joining
   the two values with a comma.
4. Map supplier -- `TreeMap::new` tells the collector to put results into a `TreeMap`
   instead of the default `HashMap`.

Without argument 4 you would get a `HashMap` and have no guarantee of key ordering.
With `TreeMap::new` the keys are always in natural sort order.

---

#### groupingBy()

Groups elements into a `Map` where the key is determined by a function and the value is
a `List` of all elements that produced that key:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<Integer, List<String>> map = ohMy.collect(
    Collectors.groupingBy(String::length));
System.out.println(map); // {5=[lions, bears], 6=[tigers]}
```

The grouping function cannot return `null` -- null keys are not allowed.

Pass a downstream collector to change the value type from `List` to something else:

```java
// Values as Set instead of List
Map<Integer, Set<String>> map = ohMy.collect(
    Collectors.groupingBy(String::length, Collectors.toSet()));

// Force a specific Map implementation AND change value type
TreeMap<Integer, Set<String>> map = ohMy.collect(
    Collectors.groupingBy(String::length, TreeMap::new, Collectors.toSet()));

// Force TreeMap but keep values as List
TreeMap<Integer, List<String>> map = ohMy.collect(
    Collectors.groupingBy(String::length, TreeMap::new, Collectors.toList()));

// Count how many elements are in each group
Map<Integer, Long> map = ohMy.collect(
    Collectors.groupingBy(String::length, Collectors.counting()));
System.out.println(map); // {5=2, 6=1}
```

---

#### partitioningBy()

A special case of grouping where the key is always a `boolean`. The `Predicate`
determines which group (`true` or `false`) each element belongs to. The result always
has exactly two keys, even if one group is empty:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<Boolean, List<String>> map = ohMy.collect(
    Collectors.partitioningBy(s -> s.length() <= 5));
System.out.println(map); // {false=[tigers], true=[lions, bears]}
```

```java
// With a looser predicate -- one group ends up empty but the key is still there
Map<Boolean, List<String>> map = ohMy.collect(
    Collectors.partitioningBy(s -> s.length() <= 7));
System.out.println(map); // {false=[], true=[lions, tigers, bears]}
```

A downstream collector can change the value type, but unlike `groupingBy()` you
cannot change the `Map` type -- it is always `Map<Boolean, ...>`:

```java
Map<Boolean, Set<String>> map = ohMy.collect(
    Collectors.partitioningBy(s -> s.length() <= 7, Collectors.toSet()));
```

---

#### mapping()

Adds a transformation step before passing elements to a downstream collector. Useful
when nested inside `groupingBy()` or `partitioningBy()` to further process the values
in each group.

Get the first character of the alphabetically smallest name in each length group:

```java
var ohMy = Stream.of("lions", "tigers", "bears");
Map<Integer, Optional<Character>> map = ohMy.collect(
    Collectors.groupingBy(
        String::length,
        Collectors.mapping(
            s -> s.charAt(0),              // transform String to Character
            Collectors.minBy((a, b) -> a - b)))); // find the smallest Character
System.out.println(map); // {5=Optional[b], 6=Optional[t]}
```

**How to read this example layer by layer:**

`groupingBy(String::length, ...)` splits elements into buckets by string length. The
second argument is the downstream collector -- it describes what to do with the
elements inside each bucket.

`mapping(s -> s.charAt(0), ...)` sits inside that downstream slot. It transforms each
`String` into a `Character` (its first letter) before handing it to the next collector.
Think of it as an embedded `.map()` step that only runs inside `collect()`.

`minBy((a, b) -> a - b)` receives those `Character` values and finds the smallest one
using the comparator. `(a, b) -> a - b` compares characters by their numeric value, so
it finds the one that comes first alphabetically. Because a group could theoretically be
empty, `minBy()` always wraps its result in `Optional<T>`. That is why the map value
type is `Optional<Character>`, not just `Character`.

What happens per group with `["lions", "tigers", "bears"]`:
- Key `5` -- elements are `"lions"` and `"bears"`. `mapping()` produces `'l'` and `'b'`.
  `minBy()` compares them: `'b' - 'l'` is negative so `'b'` is smaller. Result: `Optional[b]`.
- Key `6` -- only element is `"tigers"`. `mapping()` produces `'t'`. Only one candidate.
  Result: `Optional[t]`.

Read the three layers inside-out to understand intent:
1. `minBy(...)` -- I want the smallest `Character`.
2. `mapping(s -> s.charAt(0), ...)` -- feed each element's first character into that `minBy`.
3. `groupingBy(String::length, ...)` -- do this independently per length group.

**Extended walkthrough -- multiple elements in the same bucket:**

This example uses a stream where several strings share the same length so you can
see what each layer does when a bucket has more than two elements:

```java
var ohMy = Stream.of("ant", "ape", "bat", "cat", "eagle", "finch");
Map<Integer, Optional<Character>> map = ohMy.collect(
    Collectors.groupingBy(
        String::length,
        Collectors.mapping(
            s -> s.charAt(0),
            Collectors.minBy((a, b) -> a - b))));
System.out.println(map); // {3=Optional[a], 5=Optional[e]}
```

Step 1 -- `groupingBy(String::length, ...)` runs first.

It calls `String::length` on every element and uses the result as a bucket key.
After this step the stream no longer exists as a flat list. It is now split into buckets:

```
bucket 3 -> ["ant", "ape", "bat", "cat"]
bucket 5 -> ["eagle", "finch"]
```

Everything after this point happens independently inside each bucket.

Step 2 -- `mapping(s -> s.charAt(0), ...)` runs on each bucket.

`mapping()` takes two arguments:
- A `Function<T, R>` -- transforms each element before it goes to the next collector.
  Here: `s -> s.charAt(0)`, which is `Function<String, Character>`.
- A downstream `Collector` -- receives the transformed elements.
  Here: `Collectors.minBy(...)`.

`mapping()` does not produce a final result by itself. It is a pass-through layer. It
transforms each `String` into a `Character` and feeds that `Character` into `minBy()`.
After this step, each bucket now holds `Character` values instead of `String` values:

```
bucket 3 -> ['a', 'a', 'b', 'c']   (first letters of "ant", "ape", "bat", "cat")
bucket 5 -> ['e', 'f']              (first letters of "eagle", "finch")
```

Step 3 -- `minBy((a, b) -> a - b)` runs on each bucket's transformed elements.

`minBy()` takes one argument:
- A `Comparator<T>` -- used to compare elements.
  Here: `(a, b) -> a - b`, which compares `Character` values by their numeric value.
  A negative result means `a` comes first (is smaller).

`minBy()` returns `Optional<T>` -- always. Even if the bucket has four elements, it
still returns `Optional<Character>` because the collector signature requires it. The
`Optional` is only empty if the bucket itself was empty, which cannot happen with
`groupingBy()` (it only creates a bucket when at least one element maps to that key).

What `minBy()` does to each bucket:

```
bucket 3 -> ['a', 'a', 'b', 'c']
  compare 'a' vs 'a': 0  -> either works, keep 'a'
  compare 'a' vs 'b': negative -> 'a' is smaller, keep 'a'
  compare 'a' vs 'c': negative -> 'a' is smaller, keep 'a'
  result: Optional['a']

bucket 5 -> ['e', 'f']
  compare 'e' vs 'f': negative -> 'e' is smaller
  result: Optional['e']
```

Step 4 -- `groupingBy()` assembles the final map.

Each bucket key is paired with the result its downstream collector produced:

```
3 -> Optional['a']
5 -> Optional['e']
```

Final output: `{3=Optional[a], 5=Optional[e]}`

**Summary of what each method expects and returns:**

| Layer | Method | Expects | Returns |
|---|---|---|---|
| Outer | `groupingBy(f, downstream)` | `Function<T, K>` + a downstream `Collector` | `Map<K, R>` where `R` is whatever the downstream produces |
| Middle | `mapping(f, downstream)` | `Function<T, R>` + a downstream `Collector` | A `Collector` -- it is a pass-through, not a final result |
| Inner | `minBy(comparator)` | `Comparator<T>` | `Collector` that produces `Optional<T>` |

`mapping()` never produces a final result on its own. It only makes sense as an
argument to another collector. Its job is to change the type that flows into the next
collector down the chain.

The exam may use a static import for `Collectors`, making it harder to recognise:

```java
var map = ohMy.collect(groupingBy(String::length,
    mapping(s -> s.charAt(0), minBy((a, b) -> a - b))));
```

Same code. Know the collector names without the `Collectors.` prefix.

**Why `groupingBy()` buckets are never empty:**

`minBy()` returns `Optional<T>` to cover the case where the collector receives zero
elements. But when `minBy()` is used as a downstream collector inside `groupingBy()`,
can a bucket ever actually be empty?

No. `groupingBy()` only creates a bucket when at least one element maps to that key.
If no element has length 3, there is no key `3` in the map at all. The key simply does
not exist. A bucket is created at the moment the first element is assigned to it, so by
definition every bucket that exists has at least one element.

This means inside a `groupingBy()` chain, `minBy()` will always find something and the
`Optional` will never be empty. The `Optional` wrapping is there because `minBy()` is a
general-purpose collector that does not know it is being used inside `groupingBy()`. It
has to be safe for the standalone case too:

```java
// Standalone -- empty stream, minBy returns empty Optional
Optional<String> result = Stream.<String>empty()
    .collect(Collectors.minBy((a, b) -> a.compareTo(b)));
System.out.println(result); // Optional.empty
```

So: `Optional` is always the return type of `minBy()`, but when used inside
`groupingBy()` you can safely call `.get()` on it without risk because the bucket is
guaranteed non-empty.

**Debugging tip for complex collector generics:**

Deeply nested collector expressions like `groupingBy` + `mapping` + `minBy` produce
compiler errors that can span multiple lines and point at the wrong place. Three
techniques help narrow down the problem.

**Technique 1 -- Build one step at a time.**

Start with just the outermost collector and verify it compiles. Then add the next inner
layer and compile again. The step that breaks tells you exactly where the mismatch is.

```java
// Step 1: just groupingBy, values default to List<String> -- compiles fine
Map<Integer, List<String>> map = ohMy.collect(
    Collectors.groupingBy(String::length));

// Step 2: add mapping -- now values are List<Character>
Map<Integer, List<Character>> map = ohMy.collect(
    Collectors.groupingBy(
        String::length,
        Collectors.mapping(s -> s.charAt(0), Collectors.toList())));

// Step 3: swap toList() for minBy -- now values are Optional<Character>
Map<Integer, Optional<Character>> map = ohMy.collect(
    Collectors.groupingBy(
        String::length,
        Collectors.mapping(
            s -> s.charAt(0),
            Collectors.minBy((a, b) -> a - b))));
```

If step 2 compiles but step 3 does not, the problem is in the `minBy` part.

**Technique 2 -- Extract inner collectors into named variables.**

Pull each collector out into its own variable. The compiler error will now appear on
the specific variable that has the wrong type, rather than on the whole statement.

```java
// Without extraction -- error points at the entire collect() call
Map<Integer, Optional<Character>> map = ohMy.collect(
    Collectors.groupingBy(
        String::length,
        Collectors.mapping(
            s -> s.charAt(0),
            Collectors.minBy((a, b) -> a - b))));

// With extraction -- error points at the exact variable that is wrong
Comparator<Character> comp = (a, b) -> a - b;
Collector<Character, ?, Optional<Character>> inner = Collectors.minBy(comp);
Collector<String, ?, Optional<Character>> withMapping = Collectors.mapping(s -> s.charAt(0), inner);
Map<Integer, Optional<Character>> map = ohMy.collect(Collectors.groupingBy(String::length, withMapping));
```

If any one of those variable declarations causes the error, you know which layer has
the type problem.

**Technique 3 -- Use `Map<?, ?>` as a temporary return type.**

Replace the declared return type with `Map<?, ?>` and try to compile. `?` means
"I don't care what the type is -- just check the structure."

```java
// Normal declaration -- error is about the full type
Map<Integer, Optional<Character>> map = ohMy.collect(...); // error here

// Temporary wildcard -- if this compiles, your collector chain is structurally correct
// and the only problem is that the declared type on the left does not match
Map<?, ?> map = ohMy.collect(...); // compiles fine -> problem is the declared type

// If this still does not compile, the collector chain itself is broken
Map<?, ?> map = ohMy.collect(...); // still fails -> problem is inside the collectors
```

If `Map<?, ?>` compiles but `Map<Integer, Optional<Character>>` does not, you have a
type mismatch in your declared return type -- your collectors are fine but your variable
declaration is wrong. If `Map<?, ?>` still does not compile, the problem is inside the
collector chain itself, and you need technique 1 or 2 to find it.

---

#### teeing()

When you need two results from a single stream pass, `teeing()` sends every element
to two separate collectors and then merges the two results using a `BiFunction`:

```java
record Separations(String spaceSeparated, String commaSeparated) {}

var list = List.of("x", "y", "z");
Separations result = list.stream()
    .collect(Collectors.teeing(
        Collectors.joining(" "),         // collector 1: space-separated
        Collectors.joining(","),          // collector 2: comma-separated
        (s, c) -> new Separations(s, c))); // merge the two results
System.out.println(result);
// Separations[spaceSeparated=x y z, commaSeparated=x,y,z]
```

Every element flows through both collectors simultaneously. `teeing()` is the answer
when you would otherwise need two terminal operations on the same stream.

The `record` in the book example is just a container to hold two values at once. The
important part is `teeing()` itself. Here is the same idea without a record, using a
`List<String>` as the merge result so the focus stays on what `teeing()` does:

```java
var numbers = Stream.of(10, 20, 30, 40, 50);

List<Object> result = numbers.collect(
    Collectors.teeing(
        Collectors.summingInt(n -> n),      // collector 1: add them all up -> 150
        Collectors.counting(),              // collector 2: count how many -> 5
        (sum, count) -> List.of(sum, count) // merge: put both results in a List
    ));

System.out.println(result); // [150, 5]
```

Every number flows through both collectors at the same time:
- Collector 1 (`summingInt`) receives every number and produces their total: `150`.
- Collector 2 (`counting`) receives every number and produces how many there were: `5`.
- The `BiFunction` `(sum, count) -> List.of(sum, count)` receives both finished results
  and combines them into a single `List`.

Without `teeing()` you could not get both results in one pass -- a stream can only have
one terminal operation. You would need two separate streams, which means iterating the
data twice. `teeing()` avoids that.

The `BiFunction` can return anything: a `List`, a `record`, a `String`, a custom object.
The book uses a `record` because records are a clean way to name two related values.
The `List.of(sum, count)` version above does exactly the same job without needing a
named type.

**`teeing()` signature and types:**

```
Collectors.teeing(
    Collector<T, ?, A>   collector1,   // produces result of type A
    Collector<T, ?, B>   collector2,   // produces result of type B
    BiFunction<A, B, R>  merger        // receives A and B, returns R
) -> Collector<T, ?, R>               // the whole thing is a Collector that produces R
```

`T` is the type of elements in the stream. `A` and `B` are whatever the two collectors
produce. `R` is whatever the `BiFunction` returns. The declared type of your result
variable must match `R`.

**Example 3 -- merge function returns a `String`:**

Collect the minimum and maximum of a stream of integers, then format them as a
single `String`. Both collectors produce an `Optional<Integer>`. The `BiFunction`
receives those two `Optional<Integer>` values and returns a `String`.

```java
var numbers = Stream.of(3, 1, 4, 1, 5, 9, 2, 6);

//                              A = Optional<Integer>       B = Optional<Integer>
String result = numbers.collect(
    Collectors.teeing(
        Collectors.minBy(Integer::compareTo),   // collector 1 -> Optional<Integer>  (A)
        Collectors.maxBy(Integer::compareTo),   // collector 2 -> Optional<Integer>  (B)
        (min, max) -> "min=" + min.get() + ", max=" + max.get() // BiFunction<Optional<Integer>, Optional<Integer>, String>
    ));
//   R = String  ->  declared type must be String

System.out.println(result); // min=1, max=9
```

Type breakdown:
- Collector 1 produces `Optional<Integer>` -- that is `A`.
- Collector 2 produces `Optional<Integer>` -- that is `B`.
- `BiFunction<A, B, R>` is `BiFunction<Optional<Integer>, Optional<Integer>, String>`.
- The lambda `(min, max) -> "min=" + min.get() + ", max=" + max.get()` returns a
  `String`, so `R = String`.
- The declared variable type must be `String`.

**Example 4 -- merge function returns a `long` (the average):**

Count the elements and sum them in two separate collectors, then divide in the
`BiFunction` to compute the average. This avoids `averagingInt()` on purpose to show
that `teeing()` can combine any two collectors into any result type.

```java
var numbers = Stream.of(10, 20, 30, 40);

//                              A = Integer (sum)    B = Long (count)
long average = numbers.collect(
    Collectors.teeing(
        Collectors.summingInt(n -> n),   // collector 1 -> Integer  (A)
        Collectors.counting(),           // collector 2 -> Long      (B)
        (sum, count) -> sum / count      // BiFunction<Integer, Long, Long>
    ));
//   R = Long -> declared type can be long (auto-unboxed) or Long

System.out.println(average); // 25
```

Type breakdown:
- Collector 1 (`summingInt`) produces `Integer` -- that is `A`.
- Collector 2 (`counting`) produces `Long` -- that is `B`.
- `BiFunction<A, B, R>` is `BiFunction<Integer, Long, Long>`.
- The lambda `(sum, count) -> sum / count` divides `Integer` by `Long`. Java promotes
  `Integer` to `long` for the division, so the result is `long`. `R = Long` (boxed).
- The declared variable `long average` receives the `Long` result via auto-unboxing.

The key rule: whatever type your `BiFunction` lambda returns is the type `R`, and that
is what you must declare your result variable as. The compiler will tell you if they
do not match.


---

### What Happens Without a Terminal Operation

Because streams use lazy evaluation, intermediate operations alone do nothing. The
pipeline is built but never executed. No elements are produced, no transformations run,
and nothing is printed.

**Case 1 -- printing the stream object itself:**

```java
var stream = Stream.of("lions", "tigers", "bears")
    .filter(s -> s.startsWith("t"))
    .map(String::toUpperCase);

System.out.println(stream);
// something like: java.util.stream.ReferencePipeline$3@7852e922
```

You get the `toString()` of the stream object -- a class name and a memory address.
You do not get the elements. `filter` and `map` have not run at all.

**Case 2 -- storing a stream in a variable and never calling a terminal operation:**

```java
var stream = Stream.of(1, 2, 3)
    .map(n -> n * 10);

// nothing happens -- no terminal operation, no output, no side effects
// stream sits in memory as an unexecuted pipeline
```

The lambda `n -> n * 10` is never called. No multiplication happens. The stream object
exists but is idle.

**Case 3 -- trying to access individual elements without a terminal operation:**

There is no way to peek inside a stream without a terminal operation. You cannot index
into it, loop over it, or call `.get()` on it the way you would with a `List`:

```java
var stream = Stream.of("lions", "tigers", "bears");

// stream[0]            -> DOES NOT COMPILE -- streams have no index operator
// stream.get(0)        -> DOES NOT COMPILE -- no get() method on Stream
// for (var s : stream) -> DOES NOT COMPILE -- Stream does not implement Iterable
```

The only correct ways to get values out are terminal operations:

```java
stream.forEach(System.out::println);                    // terminal
List<String> list = stream.collect(Collectors.toList()); // terminal
```

**Case 4 -- `peek()` without a terminal operation:**

`peek()` is an intermediate operation commonly used for debugging. It looks like it
should print elements as they pass through, but it does nothing without a terminal
operation:

```java
var stream = Stream.of("lions", "tigers", "bears")
    .peek(System.out::println); // intermediate -- nothing prints, nothing runs
```

Add a terminal operation and the pipeline executes:

```java
Stream.of("lions", "tigers", "bears")
    .peek(System.out::println) // intermediate
    .count();                  // terminal -- now the whole pipeline runs
// lions
// tigers
// bears
```

This is one of the most common exam traps with streams. `peek()` alone looks like it
should produce output. It never does.

**The rule:** a stream pipeline does absolutely nothing until a terminal operation is
called. Intermediate operations only describe what to do. The terminal operation is the
trigger that actually does it.