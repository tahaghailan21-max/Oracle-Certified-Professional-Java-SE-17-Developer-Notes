# Chapter 9 - Collections and Generics: Review Questions
Date: 2026-09-22
Score: 6 / 20 (30%)

---

## Results

| Q  | Your Answer    | Correct Answer | Result  |
|----|----------------|----------------|---------|
| 1  | C, E           | A, E           | wrong   |
| 2  | E              | C, G           | wrong   |
| 3  | B              | B              | correct |
| 4  | C, D           | B, F           | wrong   |
| 5  | B              | B              | correct |
| 6  | B, D, F        | B, F           | wrong   |
| 7  | B, F           | B, F           | correct |
| 8  | B              | A              | wrong   |
| 9  | A, B           | A, B, D        | wrong   |
| 10 | A, B, E, F     | A, B, E, F     | correct |
| 11 | A, B, E        | B, E           | wrong   |
| 12 | A              | C              | wrong   |
| 13 | F              | A              | wrong   |
| 14 | A, B, D, E     | A, B           | wrong   |
| 15 | (no answer)    | A, C           | wrong   |
| 16 | A              | E              | wrong   |
| 17 | B, F           | A, E           | wrong   |
| 18 | B, E           | B              | wrong   |
| 19 | F              | F              | correct |
| 20 | B, D, F        | B, D, F        | correct |

---

## All Questions and Reasoning

### Q1 | Which two best suit the described scenarios?

Scenario 1: display a collection of products that may contain duplicates.
Scenario 2: track sales sorted by natural order of the sale ID, retrieving the text of each.

Your reasoning: TreeMap for the sorted key/value relationship. TreeSet to sort sales, but it does not allow duplicates.
Your answer: C, E
Correct answer: **A, E**

---

### !! Q1 - WRONG !!

For scenario 1, duplicates are needed, which rules out any `Set` (no duplicates). `HashSet` is wrong. The answer must be a `List`. Between `ArrayList` and `LinkedList`, `ArrayList` is the better general-purpose choice -- `LinkedList` is only preferable when used as a `Deque`. The answer is `ArrayList` (A), not `HashSet` (C).

For scenario 2, your `TreeMap` reasoning is correct -- sorted by ID (key) with text (value) is exactly what a `Map` is for, and `TreeMap` keeps keys in natural sorted order.

The core mistake: you confused "allow duplicates" with needing a `Set`. Sets are specifically for no-duplicates. When duplicates are required, you need a `List`.

---

### !! Q2 - WRONG !!

### Q2 | Which of the following are true?

```java
List<?> q = List.of("mouse", "parrot");
var v = List.of("mouse", "parrot");

q.removeIf(String::isEmpty);
q.removeIf(s -> s.length() == 4);
v.removeIf(String::isEmpty);
v.removeIf(s -> s.length() == 4);
```

Your reasoning: `List.of()` creates an immutable list so all four `removeIf` calls are compile errors.
Your answer: E (exactly four compile errors)
Correct answer: **C, G**

The immutability of `List.of()` is a runtime concern, not a compile-time one. `removeIf` does not fail to compile just because the list is immutable -- it throws `UnsupportedOperationException` at runtime.

The compile errors come from the wildcard type on `q`. `List<?>` treats its elements as `Object`, not `String`. The method references `String::isEmpty` and `s -> s.length() == 4` both require the element to be a `String`. Since `?` means "unknown type treated as Object", the compiler rejects those calls -- `Object` has no `isEmpty()` or `length()` method.

`var` on the other hand infers the exact type `List<String>` from `List.of("mouse", "parrot")`. So lines using `v` compile fine and would throw `UnsupportedOperationException` at runtime since `List.of()` is immutable.

Two compile errors (the two lines using `q`): option C.
If those two lines are removed, the remaining code throws an exception at runtime: option G.

Key distinction: `List<?>` vs `var` when assigned from `List.of(...)`:
- `List<?>` -- elements treated as `Object`, String-specific methods not available
- `var` -- infers `List<String>`, all String methods available

---

### Q3 | What is the result of the following?

```java
var greetings = new ArrayDeque<String>();
greetings.offerLast("hello");
greetings.offerLast("hi");
greetings.offerFirst("ola");
greetings.pop();
greetings.peek();
while (greetings.peek() != null)
    System.out.print(greetings.pop());
```

Your reasoning: none provided.
Your answer: B
Correct answer: **B**

`offerLast` twice gives `[hello, hi]`. `offerFirst` gives `[ola, hello, hi]`. `pop()` removes the front -- "ola" is gone, leaving `[hello, hi]`. `peek()` reads "hello" without removing. The while loop pops each element and prints it: "hello" then "hi". Output: `hellohi`.

---

### !! Q4 - WRONG !!

### Q4 | Which of these statements compile?

```java
A. HashSet<Number> hs = new HashSet<Integer>();
B. HashSet<? super ClassCastException> set = new HashSet<Exception>();
C. List<> list = new ArrayList<String>();
D. List<Object> values = new HashSet<Object>();
E. List<Object> objects = new ArrayList<? extends Object>();
F. Map<String, ? extends Number> hm = new HashMap<String, Integer>();
```

Your reasoning: A fails (Integer is a subtype of Number, could add wrong types). B fails for the same reason. E and F fail because wildcards are not allowed in `<>`.
Your answer: C, D
Correct answer: **B, F**

C does not compile -- the diamond operator `<>` is only allowed on the right side of an assignment. You had this right.

D does not compile -- `HashSet` is not a `List`. A `Set` cannot be assigned to a `List` variable regardless of the type parameter. You had this wrong.

A does not compile -- your reasoning about type safety is correct in principle, but the precise rule is: generic types are invariant. `HashSet<Integer>` is not a subtype of `HashSet<Number>` even though `Integer` extends `Number`. The fix would be `HashSet<? extends Number>` on the left side.

B compiles -- a lower-bounded wildcard on the left side (`? super ClassCastException`) allows any supertype of `ClassCastException`. `Exception` is a supertype of `ClassCastException`, so `new HashSet<Exception>()` is a valid assignment. You incorrectly rejected this.

E does not compile -- wildcards are not allowed when instantiating a generic type (`new ArrayList<? extends Object>()`). Wildcards can appear on the left (declaration) side but never in `new`. You had this right for the wrong reason -- you said wildcards are not allowed in `<>` generally, but they are allowed on the declaration side.

F compiles -- the wildcard `? extends Number` is on the left (declaration) side. `HashMap<String, Integer>` is a valid assignment because `Integer` satisfies `? extends Number`. This is the correct and allowed use of an upper-bounded wildcard.

Summary of wildcard placement rules:
- Left side (declaration): wildcards allowed
- Right side (`new ...`): wildcards NOT allowed

---

### Q5 | What is the result of the following?

```java
public record Hello<T>(T t) {
    public Hello(T t) { this.t = t; }
    private <T> void println(T message) {
        System.out.print(t + "-" + message);
    }
    public static void main(String[] args) {
        new Hello<String>("hi").println(1);
        new Hello("hola").println(true);
    }
}
```

Your reasoning: not provided (mentioned not remembering records well).
Your answer: B
Correct answer: **B**

The `<T>` declared on `println()` is a separate, independent type parameter from the `<T>` declared on the record. The method-level `T` shadows the class-level `T` inside that method. So `println()` can accept any type regardless of what the record's `T` is.

`new Hello<String>("hi")` -- record's `T` is `String`, `t` is `"hi"`. `println(1)` -- `1` is autoboxed to `Integer`. Method prints `hi-1`.

`new Hello("hola")` -- no type specified, raw type, `t` is `"hola"`. `println(true)` -- `true` is autoboxed to `Boolean`. Method prints `hola-true`.

Full output: `hi-1hola-true`.

Line with the raw `Hello` use gets a compiler warning (unchecked/raw use) but not a compile error.

---

### !! Q6 - WRONG !!

### Q6 | Which of the following can fill in the blank to print [7, 5, 3]?

```java
Collections.sort(list, Comparator.comparing______);
```

Target output `[7, 5, 3]` means descending order by `beakLength`.

Your reasoning: not detailed.
Your answer: B, D, F
Correct answer: **B, F**

B is correct -- `(Platypus::beakLength).reversed()` sorts by `beakLength` ascending then reverses, giving descending order.

D is incorrect. `Comparator.comparing(Platypus::name).thenComparing(Comparator.comparing(Platypus::beakLength).reversed())` -- the `reversed()` here only applies to the inner `thenComparing` comparator. The outer `comparing(name)` sorts by name ascending first. Since p2 and p3 both have name "Peter", thenComparing kicks in only for those two and reverses their beak order. p1 ("Paula") sorts before "Peter" alphabetically, giving roughly `[3, 7, 5]` -- not the target output.

F is correct. `(Platypus::name).thenComparingInt(Platypus::beakLength).reversed()` -- builds a comparator that first sorts by name ascending, then by beakLength ascending, then `reversed()` flips the entire combined comparator. The final result is descending by name first, then descending by beakLength for ties. Since p2/p3 share the name "Peter" and p1 is "Paula", descending name puts "Peter" names first, then "Paula". Among Peters, descending beakLength gives 7 then 5. Final: `[7, 5, 3]`.

The distinction: `reversed()` at the end of a chain reverses the entire comparator. `reversed()` applied to an inner comparator only reverses that portion.

---

### Q7 | Which method signatures are valid overrides of hairy()?

```java
public class Alpaca {
    public List<String> hairy(List<String> list) { return null; }
}
```

Your reasoning: the type inside `<>` must match exactly for parameters. Return type covariance applies to the raw type but not the generic parameter.
Your answer: B, F
Correct answer: **B, F**

Correct. For a valid override:
- The parameter list must have the same erased signature. `List<CharSequence>` and `List<Integer>` both erase to `List` -- same as the parent -- but the generic type parameter must match exactly for it to be a true override. Since they differ, they are not overrides.
- The return type must be covariant: the raw type can be a subtype (`ArrayList` is a subtype of `List`) but the generic parameter must match exactly.

B: `ArrayList<String>` return, `List<String>` parameter -- valid. `ArrayList` is a subtype of `List`, generic parameter matches.
F: `ArrayList<String>` return, `List<String>` parameter -- same as B, valid.
D: `List<CharSequence>` return -- generic return type parameter does not match `String`. Not valid.
E: `Object` return -- too broad. Not covariant with `List<String>`.
A: `List<CharSequence>` parameter -- different generic type, not an override.
C: `List<Integer>` parameter -- different generic type, not an override.

---

### !! Q8 - WRONG !!

### Q8 | What is the result?
	
```java
public class MyComparator implements Comparator<String> {
    public int compare(String a, String b) {
        return b.toLowerCase().compareTo(a.toLowerCase());
    }
    public static void main(String[] args) {
        String[] values = { "123", "Abb", "aab" };
        Arrays.sort(values, new MyComparator());
        for (var s : values)
            System.out.print(s + " ");
    }
}
```

Your reasoning: comparing `b` to `a` flips the order, so instead of `123 Abb aab` you get `aab Abb 123`.
Your answer: B (aab Abb 123)
Correct answer: **A (Abb aab 123)**

Your instinct about flipping was right, but you got the direction wrong.

Natural alphabetical order of the lowercased values: `123` < `aab` < `abb` (numbers before letters, case-insensitive). So ascending order gives `123 aab Abb`.

The comparator calls `b.compareTo(a)` instead of `a.compareTo(b)`. This reverses the sort, giving descending alphabetical (case-insensitive) order: `aab/Abb` first, then `123` last.

But within the letter group, `aab` and `abb` (from "Abb") are compared case-insensitively. `aab` vs `abb`: `a` == `a`, `a` < `b` so `aab` comes before `abb`. In descending order, `abb` (from "Abb") comes before `aab`.

Descending case-insensitive order: `Abb`, `aab`, `123`. Answer is A.

The lesson: when the comparator calls `b.compareTo(a)`, you get descending order of natural sort. Write out the natural order first, then reverse it.

---

### !! Q9 - WRONG !!

### Q9 | Which statements can fill in the blank so that Helper compiles?

```java
public class Helper {
    public static <U extends Exception> void printException(U u) {
        System.out.println(u.getMessage());
    }
    public static void main(String[] args) {
        Helper.______;
    }
}
```

Your reasoning: `U extends Exception` means U must be Exception or a subclass. A and B fit. Did not understand C and D syntax.
Your answer: A, B
Correct answer: **A, B, D**

A: `FileNotFoundException` extends `Exception` -- valid.
B: `Exception` itself satisfies `U extends Exception` -- valid.
C: `<Throwable>printException(...)` -- `Throwable` is a superclass of `Exception`, not a subclass. This violates the upper bound `U extends Exception`. Does not compile.
D: `<NullPointerException>printException(new NullPointerException("D"))` -- valid. `NullPointerException` extends `RuntimeException` extends `Exception`. The unusual syntax is an explicit type witness -- you are telling the compiler what type to use for `U` at the call site. The format is `ClassName.<Type>methodName(args)`. It is valid syntax and `NullPointerException` satisfies the bound.
E: `Throwable` is a superclass of `Exception`, not a subclass. Does not satisfy `U extends Exception`.

The type witness syntax `Helper.<Type>method(args)` is uncommon but valid. You can explicitly specify the type parameter when calling a generic method instead of letting the compiler infer it.

---

### Q10 | Which of the following will compile when filling in the blank?

```java
var list = List.of(1, 2, 3);
var set = Set.of(1, 2, 3);
var map = Map.of(1, 2, 3, 4);
______.forEach(System.out::println);
```

Your reasoning: `map.keys()` and `map.valueSet()` do not exist. `keySet()` and `values()` do.
Your answer: A, B, E, F
Correct answer: **A, B, E, F**

Correct. `forEach` on `List` and `Set` takes a `Consumer<T>` -- one parameter, matches `System.out::println`. `keySet()` returns a `Set<Integer>` and `values()` returns a `Collection<Integer>`, both iterable with a single-parameter consumer.

`Map.forEach()` exists but takes a `BiConsumer<K, V>` -- two parameters. `System.out::println` only takes one, so `map.forEach(System.out::println)` does not compile.

---

### !! Q11 - WRONG !!

### Q11 | Which statements can fill in the blank so that Wildcard compiles?

```java
public class Wildcard {
    public void showSize(List<?> list) {
        System.out.println(list.size());
    }
    public static void main(String[] args) {
        Wildcard card = new Wildcard();
        ______;
        card.showSize(list);
    }
}
```

Your reasoning: not detailed.
Your answer: A, B, E
Correct answer: **B, E**

A does not compile -- it declares a `HashSet`, not a `List`. `showSize()` takes a `List<?>`. A `HashSet` does not implement `List`, so passing it would fail. Even before that, the variable type `List<?>` on the left cannot hold a `HashSet`. Does not compile.

B compiles -- `ArrayList<? super Date>` is a valid declaration. `new ArrayList<Date>()` satisfies the lower bound. The variable type is `ArrayList<? super Date>`, which is a `List`, so it can be passed to `showSize(List<?>)`.

C does not compile -- wildcards cannot appear on the right side of an assignment (`new ArrayList<?>()`).

D does not compile -- `LinkedList<IOException>` is not assignable to `List<Exception>`. Generic types are invariant; even though `IOException` extends `Exception`, `List<IOException>` is not a subtype of `List<Exception>`.

E compiles -- `ArrayList<? extends Number>` declared with `new ArrayList<Integer>()`. `Integer` satisfies `? extends Number`. Valid assignment, and it is a `List` so it can be passed to `showSize`.

---

### !! Q12 - WRONG !!

### Q12 | What is the result?

```java
public record Sorted(int num, String text)
    implements Comparable<Sorted>, Comparator<Sorted> {

    public String toString() { return "" + num; }
    public int compareTo(Sorted s) { return text.compareTo(s.text); }
    public int compare(Sorted s1, Sorted s2) { return s1.num - s2.num; }

    public static void main(String[] args) {
        var s1 = new Sorted(88, "a");
        var s2 = new Sorted(55, "b");
        var t1 = new TreeSet<Sorted>();
        t1.add(s1); t1.add(s2);
        var t2 = new TreeSet<Sorted>(s1);
        t2.add(s1); t2.add(s2);
        System.out.println(t1 + " " + t2);
    }
}
```

Your reasoning: not provided.
Your answer: A
Correct answer: **C**

`t1` is a plain `TreeSet` with no comparator -- it uses the natural order from `Comparable`, which is `compareTo()`. That method sorts by `text`. "a" < "b" alphabetically, so `s1` (text="a") comes first: `[88, 55]`.

`t2` is constructed with `new TreeSet<Sorted>(s1)`. The `TreeSet(Comparator)` constructor takes a `Comparator`. `s1` is a `Sorted` object which implements `Comparator<Sorted>` via the `compare()` method. So `t2` uses `compare()`, which sorts by `num`. 55 < 88, so `s2` (num=55) comes first: `[55, 88]`.

Output: `[88, 55] [55, 88]`. Answer is C.

The key: when a `TreeSet` is constructed with an object passed as argument, that object is used as the `Comparator` if it implements `Comparator`. It overrides `compareTo()` for that set.

---

### !! Q13 - WRONG !!

### Q13 | What is the result?

```java
Comparator<Integer> c1 = (o1, o2) -> o2 - o1;
Comparator<Integer> c2 = Comparator.naturalOrder();
Comparator<Integer> c3 = Comparator.reverseOrder();
var list = Arrays.asList(5, 4, 7, 2);
Collections.sort(list, ____);
Collections.reverse(list);
Collections.reverse(list);
System.out.println(Collections.binarySearch(list, 2));
```

Your reasoning: never seen `naturalOrder()` or `reverseOrder()`, assumed they were invalid syntax.
Your answer: F (does not compile)
Correct answer: **A**

`Comparator.naturalOrder()` and `Comparator.reverseOrder()` are real static methods on the `Comparator` interface. The code compiles.

The two `Collections.reverse()` calls cancel each other out -- the list ends up in whatever order `sort()` left it.

`binarySearch()` without an explicit comparator uses natural ascending order. For the result to be defined (not undefined), the list must be sorted in natural ascending order at the time of the search.

Only `c2` (naturalOrder) sorts the list in natural ascending order. After sorting with `c2`, `[2, 4, 5, 7]`. Two reverses cancel out, still `[2, 4, 5, 7]`. `binarySearch(list, 2)` finds `2` at index 0. Prints `0`.

`c1` and `c3` both sort in descending order. `binarySearch()` without a comparator then searches a descending list using ascending logic -- the result is undefined.

So only `c2` gives a defined result, printing `0`. Option A is correct.

---

### !! Q14 - WRONG !!

### Q14 | Which lines can be inserted to make the code compile?

```java
class W {}
class X extends W {}
class Y extends X {}
class Z<Y> {
    // INSERT CODE HERE
}
```

Your reasoning: `new Y()` is not usable inside the class.
Your answer: A, B, D, E
Correct answer: **A, B**

The key is `class Z<Y>`. `Y` here is a type parameter on `Z`, not the class `Y` defined above. Inside `Z`, the name `Y` refers to this generic type parameter, not the concrete class. The concrete class `Y` is shadowed and cannot be referred to by name inside `Z`.

A: `W w1 = new W()` -- uses class `W`, which is not shadowed. Fine.
B: `W w2 = new X()` -- `X` extends `W`, valid assignment. Neither name is shadowed. Fine.
C: `W w3 = new Y()` -- `Y` inside `Z` is the type parameter, not the class. You cannot call `new Y()` on a type parameter. Does not compile.
D: `Y y1 = new W()` -- `Y` is the type parameter. `W` is a concrete class. `W` is not guaranteed to be a subtype of whatever `Y` resolves to. Does not compile.
E: `Y y2 = new X()` -- same problem. `X` is a concrete class but not known to be compatible with the type parameter `Y`. Does not compile.
F: `Y y1 = new Y()` -- `Y` is the type parameter and you cannot instantiate a type parameter. Does not compile.

Only A and B are safe because they do not involve the shadowed name `Y` at all.

---

### !! Q15 - WRONG !!

### Q15 | Which options are true?

```java
q = new LinkedList<>();
q.add(10);
q.add(12);
q.remove(1);
System.out.print(q);
```

Your reasoning: LinkedList has no index-based remove, so it would throw an exception.
Your answer: (no answer)
Correct answer: **A, C**

`LinkedList` implements both `List` and `Deque`. When the declared type is `List<Integer>` or `var` (which infers `LinkedList<Object>`), the `List` interface's `remove(int index)` method is visible. So `q.remove(1)` removes the element at index 1, which is `12`. The list becomes `[10]`.

When the declared type is `Queue<Integer>`, only `Queue`'s methods are visible -- `Queue` does not have `remove(int index)`. Java then autoboxes `1` to `Integer` and calls `remove(Object)`. Since the value `1` is not in the list (`10` and `12` are), nothing is removed and the list stays `[10, 12]`. Output would be `[10, 12]`, not `[10]`.

A (`List<Integer>`): `remove(int index)` is visible, removes element at index 1 (`12`). Output `[10]`. Correct.
B (`Queue<Integer>`): `remove(Object)` is called with `Integer.valueOf(1)`. `1` is not in the list. List stays `[10, 12]`. Output is `[10, 12]`, not `[10]`. Wrong.
C (`var`): `var` infers `LinkedList<Object>`. `LinkedList` implements `List`, so `remove(int index)` is visible. Removes element at index 1. Output `[10]`. Correct.

The variable's declared type determines which `remove` overload the compiler selects -- not the runtime type.

---

### !! Q16 - WRONG !!

### Q16 | What is the result?

```java
Map m = new HashMap();
m.put(123, "456");
m.put("abc", "def");
System.out.println(m.contains("123"));
```

Your reasoning: raw Map defaults to `Map<Object, Object>`, no compile errors.
Your answer: A (false)
Correct answer: **E (compiler error on line 7)**

Your reasoning about raw types is correct -- `Map<Object, Object>` is a valid raw use, so the `put` calls compile. But `Map` does not have a `contains()` method at all. It has `containsKey()` and `containsValue()`. Calling `contains()` on a `Map` is a compile error regardless of whether it is raw or typed.

---

### !! Q17 - WRONG !!

### Q17 | What is the result?

```java
var map = Map.of(1, 2, 3, 6);
var list = List.copyOf(map.entrySet());

List<Integer> one = List.of(8, 16, 2);
var copy = List.copyOf(one);
var copyOfCopy = List.copyOf(copy);
var thirdCopy = new ArrayList<>(copyOfCopy);

list.replaceAll(x -> x * 2);
one.replaceAll(x -> x * 2);
thirdCopy.replaceAll(x -> x * 2);

System.out.println(thirdCopy);
```

Your reasoning: `list` and `one` are immutable. `thirdCopy` is a mutable `ArrayList`. Two compile errors on the `replaceAll` calls for `list` and `one`.
Your answer: B, F
Correct answer: **A, E**

`list` is `List<Map.Entry<Integer, Integer>>` -- a list of Entry objects, not integers. The lambda `x -> x * 2` tries to multiply an `Entry` by 2, which is a type error. This is a compile error. One compile error: option A, not B.

`one.replaceAll(x -> x * 2)` -- `one` is `List<Integer>`. The lambda `x -> x * 2` is valid for integers. This compiles fine. The immutability of `List.of()` is a runtime concern -- it throws `UnsupportedOperationException` at runtime, not a compile error.

So there is one compile error (the `list` line) and one runtime exception (the `one` line). Options A and E are correct.

`thirdCopy` is a mutable `ArrayList<Integer>` -- its `replaceAll` would work fine and produce `[16, 32, 4]`, but it is never reached because the runtime exception on `one.replaceAll` happens first.

---

### !! Q18 - WRONG !!

### Q18 | What code change is needed to make this method compile?

```java
public static T identity(T t) {
    return t;
}
```

Your reasoning: not detailed.
Your answer: B, E
Correct answer: **B**

`T` is used as a return type and a parameter type but is never declared. To use a generic type parameter in a method, it must be declared immediately before the return type. The fix is to add `<T>` between `static` and the return type `T`:

```java
public static <T> T identity(T t) {
    return t;
}
```

Only option B is correct. Option E suggests adding `<?>` after `static`, which is not valid syntax -- `<?>` is a wildcard and cannot be used as a type parameter declaration. A method-level type parameter declaration requires a named type like `<T>`, not a wildcard.

---

### Q19 | What is the result?

```java
var map = new HashMap<Integer, Integer>();
map.put(1, 10);
map.put(2, 20);
map.put(3, null);
map.merge(1, 3, (a, b) -> a + b);
map.merge(3, 3, (a, b) -> a + b);
System.out.println(map);
```

Your reasoning: first merge -- key 1 has value 10, function runs: 10 + 3 = 13. Second merge -- key 3 has null value, function not called, value set to 3.
Your answer: F
Correct answer: **F**

Correct. Final map: `{1=13, 2=20, 3=3}`. Answer F.

---

### Q20 | Which of the following statements are true?

Your reasoning: `Comparator` is in `java.util`. `compare()` is in `Comparator`. `compare()` takes two parameters.
Your answer: B, D, F
Correct answer: **B, D, F**

Correct.
- `Comparable` is in `java.lang` (auto-imported). `Comparator` is in `java.util`.
- `Comparable` defines `compareTo()` (one parameter -- the other object, since `this` is implicit).
- `Comparator` defines `compare()` (two parameters -- both objects passed explicitly).

---

## Notes to Self

---

## Patterns to Watch

- `List<?>` treats all elements as `Object` -- String-specific methods like `isEmpty()` and `length()` will not compile on it
- `var` with `List.of(...)` infers the concrete element type (e.g. `List<String>`), not `Object`
- Immutability from `List.of()` / `Set.of()` / `Map.of()` is a runtime concern (`UnsupportedOperationException`), not a compile error
- When duplicates are needed, use a `List`. `Set` = no duplicates.
- `Map` does not have `contains()` -- use `containsKey()` or `containsValue()`
- Wildcards on the left (declaration side) are allowed. Wildcards on the right (`new ArrayList<?>()`) are not.
- `Comparator.naturalOrder()` and `Comparator.reverseOrder()` are real methods -- do not confuse them with invalid syntax
- `binarySearch()` requires the list to be sorted in the same order the comparator uses -- if no comparator is passed to `binarySearch`, the list must be in natural ascending order
- Two `Collections.reverse()` calls cancel each other out
- `remove(int index)` visibility depends on the declared type: `List` exposes it, `Queue` does not
- A `TreeSet` constructed with `new TreeSet<>(obj)` uses `obj` as the `Comparator` if it implements `Comparator`
- The `<T>` declaration for a generic method goes between `static` and the return type: `public static <T> T method(T t)`
- A type parameter name in a class like `class Z<Y>` shadows any outer class named `Y`
- `reversed()` at the end of a comparator chain reverses the entire chain; `reversed()` applied mid-chain only reverses that portion
- Type witness syntax: `ClassName.<Type>methodName(args)` -- valid way to explicitly set the type parameter at a call site

---

## Final Assessment

This was a difficult chapter with a low score of 30% (6/20), and the mistakes fall into several distinct areas.

**What you understood:**
- The `merge()` semantics for null values and non-null values (Q19 correct)
- `Comparable` vs `Comparator` package, method names, and parameter counts (Q20 correct)
- Basic `Deque` operations and traversal order (Q3 correct)
- Which generic method signatures are valid overrides -- covariance of raw return type, exact match of generic parameter (Q7 correct)
- `Map.forEach()` needing two parameters vs `List`/`Set` needing one (Q10 correct)

**Where things went wrong:**

The widest gap is generics. You got almost every generics question wrong (Q2, Q4, Q11, Q13, Q14, Q18) and the mistakes were not edge-case slips -- they were fundamental:

- You confused compile-time errors with runtime errors. Immutability from `List.of()` is a runtime `UnsupportedOperationException`, not a compile error. This tripped you on Q2 and Q17.
- You do not have a reliable model of where wildcards are and are not allowed. Wildcards on the right side of `new` are illegal; on the left (declaration) side they are fine. Q4 and Q11 both tested this.
- You do not know `Comparator.naturalOrder()` and `Comparator.reverseOrder()` (Q13). These are methods you will see again.
- The type witness syntax `<Type>methodName()` (Q9) was unfamiliar. It is uncommon but exam-valid.
- You missed that a type parameter name in `class Z<Y>` shadows the outer class `Y` entirely (Q14). This is a specific trap the exam uses repeatedly.

There are also collection-specific gaps:
- You chose `HashSet` for "allow duplicates" (Q1) -- the opposite of what `Set` does.
- You did not know `Map.contains()` does not exist (Q16).
- You did not know `remove(int index)` visibility depends on the declared type (Q15).

**On comparators:** your instinct about `b.compareTo(a)` flipping the sort was right, but the execution was wrong (Q8). The correct technique is: write out natural order first, then reverse it manually to see the flipped result.

**Verdict:** the generics section needs to be revisited before moving on. The runtime vs compile-time distinction for immutable collections, wildcard placement rules, and the basics of `Comparator` utility methods are all gaps that will cost you points on every chapter that builds on this one. Collections knowledge is mostly there but has some holes (`Map` methods, `remove` overloads). You should not move on until the generics rules feel automatic.
