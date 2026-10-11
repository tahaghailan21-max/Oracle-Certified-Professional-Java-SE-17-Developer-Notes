# Chapter 10 - Streams: Review Questions
Date: 2026-10-08
Score: 11 / 21 (52%)

---

## Results

| Q  | Your Answer    | Correct Answer | Result  |
|----|----------------|----------------|---------|
| 1  | D              | D              | correct |
| 2  | F              | F              | correct |
| 3  | B              | E              | wrong   |
| 4  | A, B           | A, B           | correct |
| 5  | C              | C, F           | wrong   |
| 6  | A              | A              | correct |
| 7  | F              | F              | correct |
| 8  | D, F           | D, E           | wrong   |
| 9  | B              | B, D           | wrong   |
| 10 | F, G           | F              | wrong   |
| 11 | E              | B, C, E        | wrong   |
| 12 | F              | F              | correct |
| 13 | F              | F              | correct |
| 14 | B, D           | B, D           | correct |
| 15 | B, D           | B, D           | correct |
| 16 | (no answer)    | B, C           | wrong   |
| 17 | D              | D              | correct |
| 18 | (no answer)    | D              | wrong   |
| 19 | B              | B              | correct |
| 20 | C, D, F        | C, E, F        | wrong   |
| 21 | A              | B              | wrong   |

---

## All Questions and Reasoning

### Q1 | What could be the output of the following?

```java
var stream = Stream.iterate("", (s) -> s + "1");
System.out.println(stream.limit(2).map(x -> x + "2"));
```

A. 12112
B. 212
C. 212112
D. java.util.stream.ReferencePipeline$3@4517d9a3
E. The code does not compile.
F. An exception is thrown.
G. The code hangs.

Your reasoning: `limit` and `map` are intermediate operations, so the stream never runs. It needs a terminal operation. Printing the stream prints a reference, not elements.
Your answer: D
Correct answer: **D**

Correct. `limit()` and `map()` are both intermediate operations. Without a terminal operation, the pipeline never executes. `System.out.println()` calls `toString()` on the stream object, which prints the class name and memory address. The exact address will vary but will look like `java.util.stream.ReferencePipeline$3@4517d9a3`.

---

### Q2 | What could be the output of the following?

```java
Predicate<String> predicate = s -> s.startsWith("g");
var stream1 = Stream.generate(() -> "growl!");
var stream2 = Stream.generate(() -> "growl!");
var b1 = stream1.anyMatch(predicate);
var b2 = stream2.allMatch(predicate);
System.out.println(b1 + " " + b2);
```

A. true false
B. true true
C. java.util.stream.ReferencePipeline$3@4517d9a3
D. The code does not compile.
E. An exception is thrown.
F. The code hangs.

Your reasoning: `b1` returns `true` immediately because `anyMatch` finds a match on the first element and stops. `b2` uses `allMatch` on an infinite stream where every element matches, so it can never terminate.
Your answer: F
Correct answer: **F**

Correct. `anyMatch()` can short-circuit on the first match, so `b1` resolves to `true` quickly. `allMatch()` on an infinite stream of always-matching elements has no reason to stop -- it keeps finding matches and never reaches the end. The program hangs. This is a critical distinction: `anyMatch` can stop early on success, `allMatch` can stop early on failure. When every element matches and the stream is infinite, `allMatch` runs forever.

---

### !! Q3 - WRONG !!

### Q3 | What could be the output of the following?

```java
Predicate<String> predicate = s -> s.length() > 3;
var stream = Stream.iterate("-",
    s -> !s.isEmpty(), (s) -> s + s);
var b1 = stream.noneMatch(predicate);
var b2 = stream.anyMatch(predicate);
System.out.println(b1 + " " + b2);
```

A. false false
B. false true
C. java.util.stream.ReferencePipeline$3@4517d9a3
D. The code does not compile.
E. An exception is thrown.
F. The code hangs.

Your reasoning: the stream produces `"-"`, `"--"`, `"----"`, `"--------"`, ... You said `b1` is `false` (because an element of length > 3 exists) and `b2` is `true`. Answer: B.
Your answer: B
Correct answer: **E**

Your analysis of the stream elements and the logic of `b1` and `b2` was correct. The stream does produce strings of increasing length: `-`, `--`, `----`, `--------`, ... and eventually produces one with length > 3. `noneMatch` would find that and return `false`, so `b1 = false`. If it were on a fresh stream, `b2` would return `true`.

The problem is that both `b1` and `b2` operate on the same stream object. `noneMatch()` is a terminal operation. Once it runs, the stream is consumed and closed. Calling `anyMatch()` on an already-closed stream throws an `IllegalStateException`: "stream has already been operated upon or closed."

This is a one-stream, two-terminal-operations trap. The book notes this explicitly: if two different streams were used, the answer would be B. With the same stream, it is E.

The takeaway: every terminal operation consumes the stream permanently. You cannot call a second terminal operation on the same stream reference.

---

### Q4 | Which are true statements about terminal operations in a stream that runs successfully? (Choose all that apply.)

A. At most one terminal operation can exist in a stream pipeline.
B. Terminal operations are a required part of the stream pipeline in order to get a result.
C. Terminal operations have Stream as the return type.
D. The `peek()` method is an example of a terminal operation.
E. The referenced Stream may be used after calling a terminal operation.

Your reasoning: A is true -- only one terminal operation is allowed. B is true -- without it the pipeline never runs. C is false -- `count()` returns a `long`, for example. D is false -- `peek()` is intermediate. E is false -- once consumed, the stream is invalid.
Your answer: A, B
Correct answer: **A, B**

Correct on all counts. The return type of terminal operations varies widely: `count()` returns `long`, `collect()` returns a collection, `findFirst()` returns `Optional`, etc. None of them return `Stream`. Returning `Stream` is the signature of intermediate operations, which is how method chaining is possible.

---

### !! Q5 - WRONG !!

### Q5 | Which of the following sets result to 8.0? (Choose all that apply.)

```java
// A
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> (int) x)
    .collect(Collectors.groupingBy(x -> x))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));

// B
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> x)           // no cast
    .boxed()
    .collect(Collectors.groupingBy(x -> x))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));

// C
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> (int) x)
    .boxed()
    .collect(Collectors.groupingBy(x -> x))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));

// D
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> (int) x)
    .collect(Collectors.groupingBy(x -> x, Collectors.toSet()))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));

// E
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> x)           // no cast
    .boxed()
    .collect(Collectors.groupingBy(x -> x, Collectors.toSet()))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));

// F
double result = LongStream.of(6L, 8L, 10L)
    .mapToInt(x -> (int) x)
    .boxed()
    .collect(Collectors.groupingBy(x -> x, Collectors.toSet()))
    .keySet().stream()
    .collect(Collectors.averagingInt(x -> x));
```

Your reasoning: `mapToInt` without a cast (`x -> x`) does not compile because `long` cannot be implicitly narrowed to `int`. B and E are wrong. A and D are wrong because `collect()` requires a non-primitive `Stream`, so `boxed()` is needed before calling it. A `Set` has no `keySet()` method so D is wrong. Only C is correct.
Your answer: C
Correct answer: **C, F**

Your reasoning for eliminating B and E (no explicit cast) is correct. `mapToInt(x -> x)` does not compile because narrowing from `long` to `int` requires an explicit cast.

Your reasoning for eliminating A is correct. `IntStream.collect()` does not accept a `Collector` -- it has a different three-argument `collect()` signature. You need `boxed()` first to get a `Stream<Integer>` before calling `Collectors.groupingBy()`.

Your reasoning for eliminating D is where the mistake is. You said "a `Set` has no `keySet()` method." That is correct, but D uses `groupingBy(x -> x, Collectors.toSet())` as the downstream collector -- this changes the value type in the map from `List<Integer>` to `Set<Integer>`. The result is still a `Map<Integer, Set<Integer>>`, and a `Map` absolutely has `keySet()`. The downstream collector only changes the value type, not the key type. `keySet()` is called on the `Map`, not on the `Set`. F is the same as D but with `boxed()` added, which makes it compile. F produces a valid average of 8.0.

The difference between C and F: the downstream collector argument. Both compile, both produce the correct average. C uses the default `toList()` downstream, F uses `toSet()`. Both result in `Map<Integer, ...>` with the same keys `{6, 8, 10}`, so the average is still 8.0 for both.

---

### Q6 | Which of the following can fill in the blank so that the code prints out `false`? (Choose all that apply.)

```java
var s = Stream.generate(() -> "meow");
var match = s.__________(String::isEmpty);
System.out.println(match);
```

A. allMatch
B. anyMatch
C. findAny
D. findFirst
E. noneMatch
F. None of the above

Your reasoning: `allMatch` returns `false` immediately because "meow" is not empty -- it can short-circuit on the first non-matching element. `anyMatch` will never find an empty string in an infinite stream of "meow" -- it hangs. `findAny` and `findFirst` do not take a `Predicate`. `noneMatch` hangs for the same reason as `anyMatch`. Only A works.
Your answer: A
Correct answer: **A**

Correct. `allMatch` is the only safe option here. It evaluates the first element ("meow"), sees it does not satisfy `isEmpty()`, and immediately short-circuits to `false`. This is the counterpart to `anyMatch` short-circuiting on the first match. `allMatch` short-circuits on the first non-match. The stream being infinite is irrelevant because the answer is found on element one.

---

### Q7 | Which stream method replaces this sort implementation?

```java
private static List<String> sort(List<String> list) {
    var copy = new ArrayList<String>(list);
    Collections.sort(copy, (a, b) -> b.compareTo(a));
    return copy;
}
```

A. `.compare((a, b) -> b.compareTo(a)).collect(Collectors.toList())`
B. `.compare((a, b) -> b.compareTo(a)).sort()`
C. `.compareTo((a, b) -> b.compareTo(a)).collect(Collectors.toList())`
D. `.compareTo((a, b) -> b.compareTo(a)).sort()`
E. `.sorted((a, b) -> b.compareTo(a)).collect()`
F. `.sorted((a, b) -> b.compareTo(a)).collect(Collectors.toList())`

Your reasoning: `Stream` has no `compare()` or `compareTo()` methods, eliminating A-D. `collect()` without arguments does not exist, eliminating E. F uses `sorted()` with a comparator and `collect(Collectors.toList())` which is correct.
Your answer: F
Correct answer: **F**

Correct. The stream method for sorting is `sorted()`, not `compare()` or `compareTo()`. `collect()` always requires a `Collector` argument.

---

### !! Q8 - WRONG !!

### Q8 | Which of the following are true given this declaration? (Choose all that apply.)

```java
var is = IntStream.empty();
```

A. `is.average()` returns the type `int`.
B. `is.average()` returns the type `OptionalInt`.
C. `is.findAny()` returns the type `int`.
D. `is.findAny()` returns the type `OptionalInt`.
E. `is.sum()` returns the type `int`.
F. `is.sum()` returns the type `OptionalInt`.

Your reasoning: `average()` returns `OptionalDouble` so A and B are both wrong. `findAny()` returns `OptionalInt` so D is correct. `sum()` never returns Optional so it returns `int` -- E is correct. You said F.
Your answer: D, F
Correct answer: **D, E**

You correctly identified D. You correctly reasoned that `sum()` returns `int` not `OptionalInt`, but then wrote F instead of E. This is a transcription error -- your reasoning was right, your answer letter was wrong.

`average()` returns `OptionalDouble` (not `OptionalInt`) because the average of integers can be a decimal. This means both A and B are wrong -- neither `int` nor `OptionalInt` is the return type.

`sum()` always has a meaningful result even for an empty stream: the sum of nothing is zero. So it returns a plain `int`, never an `Optional`. That is E.

`findAny()` might find nothing (empty stream), so it returns `OptionalInt`. That is D.

---

### !! Q9 - WRONG !!

### Q9 | Which of the following can we add after line 6 for the code to run without error and not produce any output? (Choose all that apply.)

```java
4: var stream = LongStream.of(1, 2, 3);
5: var opt = stream.map(n -> n * 10)
6:     .filter(n -> n < 5).findFirst();
```

A.
```java
if (opt.isPresent())
    System.out.println(opt.get());
```
B.
```java
if (opt.isPresent())
    System.out.println(opt.getAsLong());
```
C.
```java
opt.ifPresent(System.out.println);
```
D.
```java
opt.ifPresent(System.out::println);
```
E. None of these; the code does not compile.
F. None of these; line 6 throws an exception at runtime.

Your reasoning: the code compiles. `map(n -> n * 10)` produces `[10, 20, 30]`. `filter(n -> n < 5)` removes all of them. `findFirst()` returns an empty `OptionalLong`. `opt.get()` does not exist on `OptionalLong` -- only `getAsLong()` does, so A is wrong. B looks fine. C has wrong syntax (missing `::`). D is correct syntax.
Your answer: B
Correct answer: **B, D**

Your reasoning for B was correct. Your reasoning for D was also correct -- you even identified that C is wrong because it is missing `::`. D uses `System.out::println` which is the valid method reference syntax and compiles fine. The question asks which options run without error and produce no output. Since `opt` is empty, `ifPresent()` in D does nothing -- no output, no error.

You correctly identified the right answers but only wrote one of them. Both B and D satisfy the condition.

---

### !! Q10 - WRONG !!

### Q10 | Select and order the statements that would cause the code to output 10 lines. (Choose all that apply.)

```java
Stream.generate(() -> "1")
    L: .filter(x -> x.length() > 1)
    M: .forEach(System.out::println)
    N: .limit(10)
    O: .peek(System.out::println)
;
```

A. L, N
B. L, N, O
C. L, N, M
D. L, N, M, O
E. L, O, M
F. N, M
G. N, O

Your reasoning: L filters out every element (length of "1" is 1, never > 1) so any answer including L is wrong. M is the only terminal operation so it must be last. G (N then O) would output 0 lines because O is `peek()` and not a terminal operation -- it needs something after it to trigger execution and print.
Your answer: F, G
Correct answer: **F**

Your elimination of L is exactly right. Every element is "1" which has length 1, so `filter(x -> x.length() > 1)` lets nothing through. Any chain including L produces zero output or hangs. C, D, E are all eliminated.

Your elimination of G is also right. `peek()` alone is an intermediate operation. N limits to 10, O peeks but does not trigger execution, and there is no terminal operation. The pipeline never runs. G produces no output.

F is `N, M`: limit the infinite stream to 10 elements, then `forEach()` prints each one. Ten lines of output. This is the only correct answer.

The mistake was including G. You correctly reasoned it produces no output, but still wrote it as an answer. Read your own analysis: if G produces zero lines, it cannot be an answer for "10 lines."

---

### !! Q11 - WRONG !!

### Q11 | What changes need to be made together for this code to print the string `12345`? (Choose all that apply.)

```java
Stream.iterate(1, x -> x++)
    .limit(5).map(x -> x)
    .collect(Collectors.joining());
```

A. Change `Collectors.joining()` to `Collectors.joining(",")`.
B. Change `map(x -> x)` to `map(x -> "" + x)`.
C. Change `x -> x++` to `x -> ++x`.
D. Add `.forEach(System.out::print)` after the call to `collect()`.
E. Wrap the entire line in a `System.out.print` statement.
F. None of the above. The code already prints 12345.

Your reasoning: The value is already `12345` so E is correct to wrap it. A would print `1,2,3,4,5`. B corrects the type but still produces no output alone. D is wrong because `collect()` is already a terminal operation.
Your answer: E
Correct answer: **B, C, E**

There are actually three problems in this code, not one.

**Problem 1 -- `Collectors.joining()` requires `Stream<String>`.**
`map(x -> x)` keeps the stream as `Stream<Integer>`. `Collectors.joining()` concatenates strings, so it requires a `Stream<String>`. Passing `Stream<Integer>` causes a compile error. B fixes this by changing `map(x -> x)` to `map(x -> "" + x)`, which converts each `Integer` to a `String`.

**Problem 2 -- `x -> x++` is post-increment, so it always returns the original value.**
`x++` returns the value of `x` before incrementing. Inside a lambda used as the iterator function for `Stream.iterate()`, this means every call returns the same value -- the stream produces `1, 1, 1, 1, 1` instead of `1, 2, 3, 4, 5`. C fixes this by using `++x` (pre-increment), which increments first and then returns the new value.

**Problem 3 -- no output is produced.**
`collect()` is a terminal operation that returns a `String`. Nothing prints it. E fixes this by wrapping the entire statement in `System.out.print()`.

All three changes (B, C, E) are needed together to produce `12345`. Without C the stream is `11111`. Without B there is a compile error. Without E nothing is printed.

---

### Q12 | Which is true of the following code?

```java
Set<String> birds = Set.of("oriole", "flamingo");
Stream.concat(birds.stream(), birds.stream(), birds.stream())
    .sorted()
    .distinct()
    .findAny()
    .ifPresent(System.out::println);
```

A. It is guaranteed to print flamingo as is and when line X is removed.
B. It is guaranteed to print oriole as is and when line X is removed.
C. It is guaranteed to print flamingo as is, but not when line X is removed.
D. It is guaranteed to print oriole as is, but not when line X is removed.
E. The output may vary as is.
F. The code does not compile.
G. It throws an exception because the same list is used as the source for multiple streams.

Your reasoning: `Stream.concat()` only accepts two arguments, not three.
Your answer: F
Correct answer: **F**

Correct. `Stream.concat()` is defined as `concat(Stream<? extends T> a, Stream<? extends T> b)` -- exactly two parameters. Passing three streams does not compile.

---

### Q13 | Which of the following is true?

```java
List<Integer> x1 = List.of(1, 2, 3);
List<Integer> x2 = List.of(4, 5, 6);
List<Integer> x3 = List.of();
Stream.of(x1, x2, x3).map(x -> x + 1)
    .flatMap(x -> x.stream())
    .forEach(System.out::print);
```

A. The code compiles and prints 123456.
B. The code compiles and prints 234567.
C. The code compiles but does not print anything.
D. The code compiles but prints stream references.
E. The code runs infinitely.
F. The code does not compile.
G. The code throws an exception.

Your reasoning: `Stream.of(x1, x2, x3)` creates a `Stream<List<Integer>>`. `map(x -> x + 1)` tries to add 1 to a `List<Integer>`, which is not a valid operation. Compile error.
Your answer: F
Correct answer: **F**

Correct. The stream is `Stream<List<Integer>>`. The `+` operator is not defined for `List`, so `x + 1` does not compile. If `map` and `flatMap` were swapped, `flatMap` would first flatten to `Stream<Integer>` and then `map` could add 1 correctly, producing `234567`. As written, the order is wrong and it does not compile.

---

### Q14 | Which of the following are true? (Choose all that apply.)

```java
4: Stream<Integer> s = Stream.of(1);
5: IntStream is = s.boxed();
6: DoubleStream ds = s.mapToDouble(x -> x);
7: Stream<Integer> s2 = ds.mapToInt(x -> x);
8: s2.forEach(System.out::print);
```

A. Line 4 causes a compiler error.
B. Line 5 causes a compiler error.
C. Line 6 causes a compiler error.
D. Line 7 causes a compiler error.
E. Line 8 causes a compiler error.
F. The code compiles but throws an exception at runtime.
G. The code compiles and prints 1.

Your reasoning: Line 4 is fine. Line 5 fails because `boxed()` is only available on primitive streams like `IntStream`, not on `Stream<Integer>`. Line 6 is fine -- converts `Stream<Integer>` to `DoubleStream`. Line 7 fails because `mapToInt()` returns `IntStream`, not `Stream<Integer>`, and also requires an explicit cast from `double` to `int`. Line 8 is invalidated by line 7's error.
Your answer: B, D
Correct answer: **B, D**

Correct. Two distinct errors:

Line 5: `boxed()` is the method that converts a primitive stream (`IntStream`, `LongStream`, `DoubleStream`) into its wrapper `Stream`. Calling it on `Stream<Integer>` -- which is already a boxed stream -- does not compile. `Stream<Integer>` does not have a `boxed()` method.

Line 7: two problems. First, `mapToInt()` returns `IntStream`, not `Stream<Integer>`. Second, the lambda `x -> x` would require an implicit narrowing conversion from `double` to `int`, which Java does not allow without an explicit cast.

---

### Q15 | When a downstream collector is passed to `partitioningBy()`, which return types can be created? (Choose all that apply.)

A. `Map<boolean, List<String>>`
B. `Map<Boolean, List<String>>`
C. `Map<Boolean, Map<String>>`
D. `Map<Boolean, Set<String>>`
E. `Map<Long, TreeSet<String>>`
F. None of the above

Your reasoning: the key is always `Boolean`, never `boolean` (primitives are not valid generics) and never `Long`. The value type is flexible. A is invalid (primitive key). C is invalid (`Map` requires two type parameters). E is invalid (wrong key type). B and D are valid.
Your answer: B, D
Correct answer: **B, D**

Correct. `partitioningBy()` always produces a `Map<Boolean, ...>` -- the key is fixed to the `Boolean` wrapper type. The downstream collector controls the value type, which can be `List`, `Set`, `Map<K,V>`, or other collection types. `boolean` as a generic is illegal, and the key can never be changed to `Long` or any other type.

---

### !! Q16 - WRONG !!

### Q16 | Which of the following statements are true about this code? (Choose all that apply.)

```java
20: Predicate<String> empty = String::isEmpty;
21: Predicate<String> notEmpty = empty.negate();
22:
23: var result = Stream.generate(() -> "")
24:     .limit(10)
25:     .filter(notEmpty)
26:     .collect(Collectors.groupingBy(k -> k))
27:     .entrySet()
28:     .stream()
29:     .map(Entry::getValue)
30:     .flatMap(Collection::stream)
31:     .collect(Collectors.partitioningBy(notEmpty));
32: System.out.println(result);
```

A. It outputs `{}`.
B. It outputs `{false=[], true=[]}`.
C. If we changed line 31 from `partitioningBy(notEmpty)` to `groupingBy(n -> n)`, it would output `{}`.
D. If we changed line 31 from `partitioningBy(notEmpty)` to `groupingBy(n -> n)`, it would output `{false=[], true=[]}`.
E. The code does not compile.
F. The code compiles but does not terminate at runtime.

Your answer: (no answer)
Correct answer: **B, C**

The stream on line 23 generates infinite empty strings, but `limit(10)` on line 24 makes it finite. `filter(notEmpty)` on line 25 removes all elements because every element is `""` (empty). The pipeline from this point forward is working on an empty collection.

Line 26 collects into an empty `Map`. Lines 27-28 get an empty `Set` of entries and create an empty `Stream`. Lines 29-30 map and flatMap over nothing, still empty. Line 31 collects into a final map.

This is the key rule: `partitioningBy()` always creates exactly two keys (`true` and `false`) even when there are no elements. The result is `{false=[], true=[]}`. That is B.

If line 31 used `groupingBy(n -> n)` instead, `groupingBy()` only creates keys for elements that actually exist. Since there are no elements, the resulting map is empty: `{}`. That is C.

The distinction to remember: `partitioningBy` always gives you both boolean keys. `groupingBy` only gives you keys that have at least one element.

---

### Q17 | What is the result of the following?

```java
var s = DoubleStream.of(1.2, 2.4);
s.peek(System.out::println).filter(x -> x > 2).count();
```

A. 1
B. 2
C. 2.4
D. 1.2 and 2.4
E. There is no output.
F. The code does not compile.
G. An exception is thrown.

Your reasoning: `peek()` runs before `filter()`, so both elements pass through `peek()` and are printed. `count()` is the terminal operation that triggers everything. The count result itself is not stored or printed, so only the `peek()` output appears.
Your answer: D
Correct answer: **D**

Correct. `peek()` is an intermediate operation positioned before `filter()`. Each element passes through `peek()` first (printing it), then goes to `filter()`. Remember that elements flow one at a time through the full pipeline. So `1.2` prints, then `1.2` hits the filter (fails, discarded). Then `2.4` prints, then `2.4` hits the filter (passes). `count()` returns 1 but that result is not printed. The only output is from `peek()`: `1.2` and `2.4`.

---

### !! Q18 - WRONG !!

### Q18 | What is the output of the following?

```java
public class Paging {
    record Sesame(String name, boolean human) {
        @Override public String toString() {
            return name();
        }
    }
    record Page(List<Sesame> list, long count) {}

    public static void main(String[] args) {
        var monsters = Stream.of(new Sesame("Elmo", false));
        var people = Stream.of(new Sesame("Abby", true));
        printPage(monsters, people);
    }

    private static void printPage(Stream<Sesame> monsters,
            Stream<Sesame> people) {
        Page page = Stream.concat(monsters, people)
            .collect(Collectors.teeing(
                Collectors.filtering(s -> s.name().startsWith("E"),
                    Collectors.toList()),
                Collectors.counting(),
                (l, c) -> new Page(l, c)));
        System.out.println(page);
    }
}
```

A. `Page[list=[Abby], count=1]`
B. `Page[list=[Abby], count=2]`
C. `Page[list=[Elmo], count=1]`
D. `Page[list=[Elmo], count=2]`
E. The code does not compile due to `Stream.concat()`.
F. The code does not compile due to `Collectors.teeing()`.
G. The code does not compile for another reason.

Your answer: (no answer)
Correct answer: **D**

The stream is `[Elmo (monster), Abby (person)]` -- two elements total.

`teeing()` runs two collectors simultaneously over all elements:

Collector 1 is `filtering(s -> s.name().startsWith("E"), Collectors.toList())`. This keeps only elements whose name starts with "E". Only "Elmo" qualifies. Result: `[Elmo]`.

Collector 2 is `counting()`. It counts every element regardless of any filter. There are two elements: Elmo and Abby. Result: `2`.

The merge function `(l, c) -> new Page(l, c)` creates `Page([Elmo], 2)`.

`Page` is a record, so its `toString()` uses the default record format: `Page[list=[Elmo], count=2]`. `Sesame`'s `toString()` returns `name()`, so the list prints as `[Elmo]`.

The critical point: `Collectors.filtering()` inside `teeing()` only filters for collector 1. Collector 2 (`counting()`) still sees all elements. The two collectors are independent.

---

### Q19 | What is the simplest way of rewriting this code?

```java
List<Integer> x = IntStream.range(1, 6)
    .mapToObj(i -> i)
    .collect(Collectors.toList());
x.forEach(System.out::println);
```

A. `IntStream.range(1, 6);`
B. `IntStream.range(1, 6).forEach(System.out::println);`
C. `IntStream.range(1, 6).mapToObj(i -> i).forEach(System.out::println);`
D. None of the above is equivalent.
E. The provided code does not compile.

Your reasoning: the original creates an `IntStream`, converts to `Stream<Integer>`, collects to a list, then calls `forEach`. Option B avoids the conversion and collection entirely by calling `forEach` directly on the `IntStream`.
Your answer: B
Correct answer: **B**

Correct. `IntStream.forEach()` accepts a `Consumer<Integer>` directly -- no boxing, no list, no intermediate steps needed. Both `List` and `Stream` have `forEach()`, so the behavior is identical. B does the same work in one line.

---

### !! Q20 - WRONG !!

### Q20 | Which of the following throw an exception when an `Optional` is empty? (Choose all that apply.)

A. `opt.orElse("");`
B. `opt.orElseGet(() -> "");`
C. `opt.orElseThrow();`
D. `opt.orElseThrow(() -> throw new Exception());`
E. `opt.orElseThrow(RuntimeException::new);`
F. `opt.get();`
G. `opt.get("");`

Your reasoning: `orElseThrow()` throws when empty. `orElseThrow(Supplier)` throws too. You answered C, D, F.
Your answer: C, D, F
Correct answer: **C, E, F**

C is correct -- `orElseThrow()` with no arguments throws `NoSuchElementException` when the `Optional` is empty.

F is correct -- `get()` throws `NoSuchElementException` when the `Optional` is empty.

E is correct -- `orElseThrow(RuntimeException::new)` is a valid supplier that creates a `RuntimeException`. When the `Optional` is empty, it calls the supplier and throws what it returns.

D does not compile. `orElseThrow()` expects a `Supplier<? extends Throwable>` -- a lambda that returns an exception. `() -> throw new Exception()` is not valid because `throw` is a statement, not an expression. You cannot use `throw` inside a lambda that is supposed to return a value. The correct syntax would be `() -> new Exception()`, which returns the exception object for `orElseThrow` to throw. D looks plausible but the `throw` keyword inside the lambda makes it a compile error.

G does not compile either -- `get()` takes no parameters.

The rule: `orElseThrow(supplier)` takes a lambda or method reference that **returns** an exception object, not one that **throws** it.

---

### !! Q21 - WRONG !!

### Q21 | What is the output of the following?

```java
var spliterator = Stream.generate(() -> "x")
    .spliterator();
spliterator.tryAdvance(System.out::print);
var split = spliterator.trySplit();
split.tryAdvance(System.out::print);
```

A. x
B. xx
C. A long list of x's
D. There is no output.
E. The code does not compile.
F. The code compiles but does not terminate at runtime.

Your reasoning: `tryAdvance()` processes one element and prints `x`. `trySplit()` splits off a portion. `tryAdvance()` on the split prints another `x`. But you said the program throws a NullPointerException. Answer: A.
Your answer: A
Correct answer: **B**

Your instinct about a NullPointerException was wrong. `spliterator()` is a terminal operation -- it consumes the stream and returns a `Spliterator`. The stream is no longer involved after that point.

`tryAdvance(System.out::print)` processes the first element ("x") and prints it. One `x` on screen.

`trySplit()` splits off a large chunk from the remaining infinite source into a new `Spliterator` called `split`. This does not return `null` here -- `null` is only returned when there is nothing left to split, which is not the case with an infinite stream.

`split.tryAdvance(System.out::print)` processes the first element of `split` and prints it. Another `x` on screen.

Total output: `xx`. Answer is B.

Your NullPointerException concern would be valid if `trySplit()` returned `null` -- calling `tryAdvance()` on `null` would throw. But for an infinite stream, `trySplit()` always succeeds and returns a non-null `Spliterator`.

---

## Notes to Self

---

## Final Assessment

