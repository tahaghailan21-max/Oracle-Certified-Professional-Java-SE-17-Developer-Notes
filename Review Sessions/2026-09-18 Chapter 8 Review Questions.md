# Chapter 8 - Lambdas and Functional Interfaces: Review Questions
Date: 2026-09-18
Score: 14 / 21 (66%)

---

## Results

| Q   | Your Answer | Correct Answer | Result  |
| --- | ----------- | -------------- | ------- |
| 1   | A           | A              | correct |
| 2   | C           | C              | correct |
| 3   | A, C        | A, C           | correct |
| 4   | A, F        | A, F           | correct |
| 5   | A, C, E     | A, C, E        | correct |
| 6   | A, C, E     | A, C           | wrong   |
| 7   | E           | E              | correct |
| 8   | E           | E              | correct |
| 9   | A, F        | A, F           | correct |
| 10  | A, B        | A, B, C        | wrong   |
| 11  | D           | D              | correct |
| 12  | A           | A              | correct |
| 13  | E           | E              | correct |
| 14  | B, D, E     | B, D           | wrong   |
| 15  | C           | A, F           | wrong   |
| 16  | C           | C              | correct |
| 17  | A           | C              | wrong   |
| 18  | B, F, G     | B, F, G        | correct |
| 19  | B, C, F     | F              | wrong   |
| 20  | E           | E              | correct |
| 21  | A, D, E, F  | A, E, F        | wrong   |

---

## All Questions and Reasoning

### Q1 | What is the result of the following class?

```java
1: import java.util.function.*;
2:
3: public class Panda {
4:     int age;
5:     public static void main(String[] args) {
6:         Panda p1 = new Panda();
7:         p1.age = 1;
8:         check(p1, p -> p.age < 5);
9:     }
10:    private static void check(Panda panda,
11:        Predicate<Panda> pred) {
12:        String result =
13:            pred.test(panda) ? "match" : "not match";
14:        System.out.print(result);
15:    }
16: }
```

Your reasoning: `Predicate` returns true or false. `1 < 5` is true, so result is "match". No compile errors.
Your answer: A
Correct answer: **A**

Correct. The lambda `p -> p.age < 5` takes a `Panda` and returns a boolean, which matches `Predicate<Panda>`. `p1.age` is 1, which is less than 5, so `pred.test(panda)` returns true and "match" is printed.

---

### Q2 | What is the result of the following code?

```java
1: interface Climb {
2:     boolean isTooHigh(int height, int limit);
3: }
4:
5: public class Climber {
6:     public static void main(String[] args) {
7:         check((h, m) -> h.append(m).isEmpty(), 5);
8:     }
9:     private static void check(Climb climb, int height) {
10:        if (climb.isTooHigh(height, 10))
11:            System.out.println("too high");
12:        else
13:            System.out.println("ok");
14:    }
15: }
```

Your reasoning: `h` and `m` are both `int` (from the interface). Calling `h.append(m)` is a `String` method -- you can't call instance methods on a primitive. Compile error on line 7.
Your answer: C
Correct answer: **C**

Correct. The `Climb` interface declares `isTooHigh(int height, int limit)` -- both parameters are `int`. The lambda `(h, m) -> h.append(m).isEmpty()` tries to call `.append()` on `h`, which is an `int` primitive. Primitives have no methods. Compile error on line 7.

---

### Q3 | Which statements about functional interfaces are true?

Your reasoning: A is clearly true. For C, the phrasing is weird -- "abstract methods with signatures that are contained in public methods of `java.lang.Object`" -- but this is the rule that `equals(Object)`, `hashCode()`, `toString()` etc. don't count toward the single abstract method requirement.
Your answer: A, C
Correct answer: **A, C**

Correct. A functional interface can contain any number of non-abstract methods -- default, private, static, private static -- so A is true and D is false. The single abstract method rule excludes methods whose signatures match public methods in `Object` (equals, hashCode, toString), making C true. B is false: only interfaces can be functional interfaces, never classes. E is false: `@FunctionalInterface` is optional.

---

### Q4 | Which lambda can replace the `MySecret` class to return the same value?

```java
interface Secret {
    String magic(double d);
}
class MySecret implements Secret {
    public String magic(double d) {
        return "Poof";
    }
}
```

Your reasoning: A is fine. B is missing `return`. C and D both redeclare `e` which is already the lambda parameter -- illegal. E is also missing semicolon. F uses a fresh variable name `f` -- valid.
Your answer: A, F
Correct answer: **A, F**

Correct. A works -- single expression lambda implicitly returns the value. B uses braces without `return`. C, D, E all try to declare `String e`, but `e` is already in scope as the lambda parameter -- cannot be redeclared. E also lacks a semicolon. F uses `f` instead, which is a fresh name -- valid.

---

### Q5 | Which functional interfaces contain an abstract method that returns a primitive value?

Your reasoning: Only `boolean`, `int`, `double`, and `long` have primitive supplier variants in Java. `char` and `float` don't. `String` is not a primitive.
Your answer: A, C, E
Correct answer: **A, C, E**

Correct. Java defines `BooleanSupplier`, `IntSupplier`, `DoubleSupplier`, and `LongSupplier`. There is no `CharSupplier` or `FloatSupplier` -- Java only provides primitive specializations for `int`, `long`, and `double` (plus `boolean` for `BooleanSupplier`). `StringSupplier` doesn't exist and `String` is not a primitive anyway.

---

### !! Q6 - WRONG !!

### Q6 | Which of the following lambda expressions can be passed to a `Predicate<String>`?

Your answer: A, C, E
Correct answer: **A, C**

You included E by mistake. `Predicate<String>` requires a lambda whose parameter is a `String` -- the type is fixed by the generic. E uses `(StringBuilder s)`, which is the wrong type. A `StringBuilder` is not a `String`. The compiler will reject it because the types don't match.

A is correct -- `s -> s.isEmpty()` with an inferred `String` parameter. C is correct -- `(String s) -> s.isEmpty()` with an explicit `String` type. Both B and D use `-->` which is not valid Java arrow syntax (it's `->`, two characters only). E and F use the wrong type.

The rule: when the functional interface is `Predicate<String>`, the parameter type is `String`. Any lambda that explicitly declares a different type (`StringBuilder`) is rejected by the compiler.

---

### Q7 | Which is true about the following code?

```java
public void method() {
    x((var x) -> {}, (var x, var y) -> false);
}
public void x(Consumer<String> x, BinaryOperator<Boolean> y) {}
```

Your reasoning: The code compiles fine. `var` is inferred from context. In the first lambda, `x` is inferred as `String` (from `Consumer<String>`). In the second, `x` and `y` are both `Boolean` (from `BinaryOperator<Boolean>`). The lambda parameter names and method parameter names can overlap -- they are in different scopes.
Your answer: E
Correct answer: **E**

Correct. Lambda parameter names are scoped to the lambda body. The outer variable `x` (the method name) and the lambda parameter `x` (in each lambda) are separate -- no conflict. `var` in the first lambda resolves to `String`, in the second it resolves to `Boolean`. Both refer to a variable named `x` but they are different types. Option E is the correct statement.

---

### Q8 | Which of the following is equivalent to `UnaryOperator<Integer> u = x -> x * x`?

Your reasoning: `UnaryOperator<Integer>` takes one input and returns the same type. `Function<Integer, Integer>` does the same -- input type and output type are both `Integer`. The other options have wrong generic arities.
Your answer: E
Correct answer: **E**

Correct. `UnaryOperator<T>` extends `Function<T, T>`. They are functionally equivalent here. `BiFunction<T,U,R>` takes three type parameters, `BinaryOperator<T>` takes one (representing both inputs and the output, but for a binary operation), `Function<T,R>` takes two. E is the only valid equivalent.

---

### Q9 | Which statements are true?

Your reasoning: `Consumer` takes a value and does something with it (like print it) -- A is correct. `Supplier` produces a value, not a good fit for printing -- B is wrong. `IntegerSupplier` doesn't exist as a class name. `Predicate` returns `boolean` not `int`. `Function` has `apply()`. `Predicate` has `test()`.
Your answer: A, F
Correct answer: **A, F**

Correct. `Consumer<T>` has `accept(T t)` which consumes a value -- printing is a classic use case. `Supplier<T>` produces a value with `get()` -- not for printing. `IntegerSupplier` does not exist (it's `IntSupplier`). `Predicate` returns `boolean` not `int`. `Function` has `apply()`, not `test()`. `Predicate` has `test()`.

---

### !! Q10 - WRONG !!

### Q10 | Which of the following can be inserted without causing a compilation error?

```java
public void remove(List<Character> chars) {
    char end = 'z';
    Predicate<Character> predicate = c -> {
        char start = 'a'; return start <= c && c <= end; };
    // INSERT LINE HERE
}
```

Your answer: A, B
Correct answer: **A, B, C**

You missed C. The lambda captures `end` (requiring it to be effectively final) and declares its own `start` and `c` internally. The key here is scope:

- A (`char start = 'a'`): `start` is declared inside the lambda body, so it is scoped to within the lambda. Declaring `start` again in the method body after the lambda is a different scope -- no conflict. Valid.
- B (`char c = 'x'`): same logic. `c` is a lambda parameter scoped to within the lambda. Declaring `char c` in the method body after the lambda is fine. Valid.
- C (`chars = null`): `chars` is a method parameter, not used in the lambda at all. Reassigning it after the lambda declaration has no effect on the lambda. Valid.
- D (`end = '1'`): `end` IS captured by the lambda. Reassigning `end` anywhere in the method makes it no longer effectively final -- even if the reassignment happens after the lambda declaration. The compiler checks the entire method scope. Invalid.

You correctly eliminated D. You were right about A and B. But C doesn't touch anything the lambda uses -- it is fine.

---

### Q11 | How many times is `true` printed?

```java
import java.util.function.Predicate;
public class Fantasy {
    public static void scary(String animal) {
        var dino = s -> "dino".equals(animal);
        var dragon = s -> "dragon".equals(animal);
        var combined = dino.or(dragon);
        System.out.println(combined.test(animal));
    }
    public static void main(String[] args) {
        scary("dino");
        scary("dragon");
        scary("unicorn");
    }
}
```

Your reasoning: The lambdas are assigned to `var`, so the compiler cannot infer they are `Predicate<String>`. Compile error.
Your answer: D
Correct answer: **D**

Correct. This is precisely the rule: when a lambda is assigned to `var`, the compiler cannot infer the functional interface type. `var` requires a concrete type on the right-hand side, and a lambda alone does not provide one. The code does not compile on the `var dino = ...` line.

---

### Q12 | What does the following code output?

```java
Function<Integer, Integer> s = a -> a + 4;
Function<Integer, Integer> t = a -> a * 3;
Function<Integer, Integer> c = s.compose(t);
System.out.print(c.apply(1));
```

Your reasoning: `compose(t)` means `t` runs first, then `s`. So `1 * 3 = 3`, then `3 + 4 = 7`.
Your answer: A
Correct answer: **A**

Correct. `a.compose(b)` means "apply `b` first, then apply `a` to the result". So `s.compose(t)` = `s(t(x))`. With input 1: `t(1) = 1 * 3 = 3`, then `s(3) = 3 + 4 = 7`. Output is 7.

Contrast with `andThen`: `s.andThen(t)` would be `t(s(x))` -- the caller runs first, then the argument.

---

### Q13 | Which is true of the following code?

```java
int length = 3;
for (int i = 0; i < 3; i++) {
    if (i % 2 == 0) {
        Supplier<Integer> supplier = () -> length; // A
        System.out.println(supplier.get());        // B
    } else {
        int j = i;
        Supplier<Integer> supplier = () -> j;      // C
        System.out.println(supplier.get());        // D
    }
}
```

Your answer: E
Correct answer: **E**

Correct. `length` is never reassigned -- it is effectively final. `j` is declared fresh each iteration of the `else` block, and it is never reassigned within its scope -- also effectively final. Both lambdas are valid. The code compiles and runs successfully.

---

### !! Q14 - WRONG !!

### Q14 | Which of the following are valid lambda expressions?

Your answer: B, D, E
Correct answer: **B, D**

You included E and it is wrong.

- B: `(final Camel c) -> {}` -- valid. The `final` modifier is permitted on lambda parameters.
- D: `(x,y) -> new RuntimeException()` -- valid. Returning an exception object (not throwing it) is fine. This is compatible with a `BiFunction` whose return type is `RuntimeException`.
- E: `(var y) -> return 0;` -- **invalid**. A `return` statement is only permitted inside a block `{}`. Without braces, the right side of `->` must be an expression, not a statement. `return 0` is a statement. The correct forms would be `(var y) -> 0` (expression) or `(var y) -> { return 0; }` (block).

The other options:
- A: mixes typed and `var` parameters -- illegal. Either all parameters are explicitly typed, all use `var`, or all are inferred. You cannot mix formats.
- C: declares variable `b` inside the block, but `b` is already a parameter name -- illegal redeclaration.
- F: `{float r}` is a block with a variable declaration but no semicolon and no return -- invalid.
- G: mixes typed parameter (`Cat a`) with inferred parameter (`b`) -- illegal, same rule as A.

---

### !! Q15 - WRONG !!

### Q15 | Which lambda expression causes the program to print `hahaha`?

```java
import java.util.function.Predicate;
public class Hyena {
    private int age = 1;
    public static void main(String[] args) {
        var p = new Hyena();
        double height = 10;
        int age = 1;
        testLaugh(p, /* LAMBDA HERE */);
        age = 2;
    }
    static void testLaugh(Hyena panda, Predicate<Hyena> joke) {
        var r = joke.test(panda) ? "hahaha" : "silence";
        System.out.print(r);
    }
}
```

Your reasoning: `age` is not effectively final (it's assigned `2` after the call). You picked `p -> true` as the only safe option.
Your answer: C
Correct answer: **A, F**

You were right that `age` is not effectively final -- B and E are invalid because of that. But you made two mistakes:

**C is wrong.** `p` is already declared as a local variable in `main()`. A lambda parameter cannot shadow a local variable in the enclosing scope. `p -> true` redeclares `p` as a lambda parameter, but `p` is already a variable in the enclosing method. Compile error.

**A is correct.** `var -> p.age <= 10`. `var` is not a reserved word in Java -- it is a context-sensitive identifier. It is perfectly legal to name a variable `var`. So `var` here is just a parameter name. `p` is the effectively final `Hyena` instance in scope. `p.age` accesses the field (value 1). `1 <= 10` is true -- prints "hahaha".

**F is correct.** `h -> h.age < 5`. The lambda parameter is `h` (a `Hyena` reference, fresh name, no conflict). `h.age` is the instance's `age` field, which is 1. `1 < 5` is true -- prints "hahaha". Note: `age` is private but the lambda runs in the context of the `Hyena` class, so accessing the private field is allowed.

**D is not a lambda at all** -- it is just an expression, missing the `->` operator entirely.

The lesson: lambda parameter names cannot shadow local variables from the enclosing scope. And `var` is only a reserved type name in a declaration context -- as a plain identifier (parameter name), it is legal.

---

### Q16 | Which of the following can be inserted without causing a compilation error?

```java
public void remove(List<Character> chars) {
    char end = 'z';
    // INSERT LINE HERE
    Predicate<Character> predicate = c -> {
        char start = 'a'; return start <= c && c <= end; };
}
```

Your answer: C
Correct answer: **C**

Correct. This is the mirror of Q10, but now the inserted line comes before the lambda.

- A (`char start = 'a'`): `start` is also declared inside the lambda body. Declaring it before the lambda in the same method scope would be a conflict -- the lambda then tries to redeclare a variable that already exists in the enclosing scope. Invalid.
- B (`char c = 'x'`): `c` is a lambda parameter. A lambda parameter cannot shadow a local variable from the enclosing scope. Declaring `char c` before the lambda, then using `c` as a lambda parameter, is illegal. Invalid.
- C (`chars = null`): `chars` is not used in the lambda. Reassigning it before the lambda is fine. Valid.
- D (`end = '1'`): `end` is captured by the lambda. Reassigning it (even before the lambda declaration) removes effective finality. Invalid.

Note the contrast with Q10: when the insertion is before the lambda, A and B become errors because the lambda now tries to redeclare variables that already exist in the enclosing scope. When the insertion is after the lambda (Q10), A and B are fine because the lambda's internal declarations are scoped within the lambda body.

---

### !! Q17 - WRONG !!

### Q17 | What is the result of running the following class?

```java
1: import java.util.function.*;
2:
3: public class Panda {
4:     int age;
5:     public static void main(String[] args) {
6:         Panda p1 = new Panda();
7:         p1.age = 1;
8:         check(p1, p -> {p.age < 5});
9:     }
10:    private static void check(Panda panda,
11:        Predicate<Panda> pred) {
12:        String result = pred.test(panda)
13:            ? "match" : "not match";
14:        System.out.print(result);
15:    }
16: }
```

Your answer: A (match)
Correct answer: **C (Compiler error on line 8)**

You did not notice what changed from Q1. Look at line 8 carefully:

- Q1: `p -> p.age < 5` -- expression lambda, the expression is the return value.
- Q17: `p -> {p.age < 5}` -- block lambda. Inside braces, a `return` statement is required.

`{p.age < 5}` is a block body with an expression statement, but `Predicate<Panda>` expects a `boolean` return. Without `return`, the block returns nothing (void), which doesn't match `boolean`. This is a compile error on line 8.

The fix would be `p -> { return p.age < 5; }`. The semicolon inside the block is also required.

This is a very common exam trap: the block vs. expression lambda distinction, and the requirement for `return` inside block bodies.

---

### Q18 | Which functional interfaces complete the following code?

```java
6: x = String::new;
7: y = m.andThen(n);
8: z = a -> a + a;
```

Your reasoning: Line 6 -- no parameters, returns a String, so `Supplier<String>`. Line 7 -- `andThen()` exists on `Consumer` and `Function`/`BiFunction`. Since `m` and `n` have the same type as `y`, and the result is also that type, `BiConsumer` works. Line 8 -- one input, same type output, so `UnaryOperator<String>`.
Your answer: B, F, G
Correct answer: **B, F, G**

Correct.

Line 6: `String::new` with no parameters passed in matches `Supplier<String>` -- F.
Line 7: `andThen()` is available on `Consumer`, `BiConsumer`, `Function`, and `BiFunction`. Since `m`, `n`, and `y` must all have the same type, `BiConsumer<String, String>` works -- B. `UnaryOperator` also has `andThen()`, but G is already used for line 8.
Line 8: `a -> a + a` -- one `String` input, one `String` output, same type both ways -- `UnaryOperator<String>` -- G.

Eliminated options: A and C don't exist. D is wrong because `BiFunction<T,U,R>` needs three type arguments. E (`Predicate<String>`) returns `boolean`, not a `String`. H (`UnaryOperator<String, String>`) doesn't exist -- `UnaryOperator<T>` takes one type parameter only.

---

### !! Q19 - WRONG !!

### Q19 | Which of the following compiles and prints out the entire set?

```java
Set<?> set = Set.of("lion", "tiger", "bear");
var s = Set.copyOf(set);
Consumer<Object> consumer = _______;
s.forEach(consumer);
```

Your answer: B, C, F
Correct answer: **F**

You were right that F is correct. But B and C are wrong.

`s` is already declared as a local variable (from `var s = Set.copyOf(set)`). A lambda parameter cannot shadow a local variable in the enclosing scope. Both `s -> System.out.println(s)` (B) and `(s) -> System.out.println(s)` (C) use `s` as their lambda parameter -- but `s` is already in scope. Compile error for both.

The other options:
- A: `() -> System.out.println(s)` -- `Consumer<Object>` requires one parameter, but this lambda has zero. Invalid.
- D: `System.out.println(s)` -- not a lambda expression at all.
- E: `System::out::println` -- chained `::` is not valid method reference syntax. It would be `System.out::println`.
- F: `System.out::println` -- valid method reference. `System.out` is the instance, `println` is the method. Matches `Consumer<Object>` since `println` accepts an `Object`. Correct.

Same trap as Q15 -- lambda parameter `s` shadowing the local variable `s`. Watch for this pattern on the exam.

---

### Q20 | Which lambdas can replace `new Sloth()` and produce the same output?

```java
interface Yawn {
    String yawn(double d, List<Integer> time);
}
class Sloth implements Yawn {
    public String yawn(double zzz, List<Integer> time) {
        return "Sleep: " + zzz;
    }
}
// takeNap calls y.yawn(10, null)
// expected output: "Sleep: 10.0"
```

Your answer: E
Correct answer: **E**

Correct. The target is `"Sleep: 10.0"` (the double `10` prints as `10.0` when concatenated).

- A: missing semicolon after the return statement inside the block. Compile error.
- B: `t` is declared twice -- once as the lambda parameter and once as `String t` inside the block. Compile error.
- C: missing `return` keyword and semicolon in a block body.
- D: missing `return` keyword in a block body.
- E: `(a,b) -> "Sleep: " + (double)(b==null ? a : a)` -- the cast to `double` ensures the number prints as `10.0`. The ternary always evaluates to `a` regardless, and with the `double` cast concatenation produces `"Sleep: 10.0"`. Valid.
- F: `return "Sleep:"` is missing the value concatenation -- prints `"Sleep:"` not `"Sleep: 10.0"`. Wrong output.

---

### !! Q21 - WRONG !!

### Q21 | Which of the following are valid functional interfaces?

```java
public interface Transport {
    public int go();
    public boolean equals(Object o);
}
public abstract class Car {
    public abstract Object swim(double speed, int duration);
}
public interface Locomotive extends Train {
    public int getSpeed();
}
public interface Train extends Transport {}
abstract interface Spaceship extends Transport {
    default int blastOff();
}
public interface Boat {
    int hashCode();
    int hashCode(String input);
}
```

Your answer: A, D, E, F
Correct answer: **A, E, F**

You included D (Spaceship) and it is wrong.

**D (Spaceship) does not compile at all.** `default int blastOff()` declares a default method but provides no body. A `default` method must have an implementation -- that is the entire point of `default`. `default int blastOff();` with a semicolon and no body is a compile error. Spaceship is not even a valid interface, let alone a functional interface.

The correct answers:
- A (Boat): `hashCode()` (no args) matches `Object.hashCode()` -- does not count toward the abstract method total. `hashCode(String)` is a new abstract method -- that is the single abstract method. Valid functional interface.
- E (Transport): `equals(Object)` matches `Object.equals(Object)` -- does not count. `go()` is the single abstract method. Valid functional interface.
- F (Train): extends Transport, inherits `go()` and `equals(Object)` from Transport. `equals` doesn't count. `go()` is the single inherited abstract method. No new abstract methods added. Valid functional interface.

Not valid:
- B (Car): abstract class, not an interface. Classes cannot be functional interfaces.
- C (Locomotive): extends Train (which extends Transport). Inherits `go()`. Also declares `getSpeed()`. That is two abstract methods -- not a functional interface.

---

## Concepts to Restudy

---

### Block Lambda vs. Expression Lambda -- The `return` Requirement

This caught you on Q17. The difference is sharp:

```java
// Expression lambda -- the expression IS the return value
Predicate<Panda> p1 = p -> p.age < 5;           // valid

// Block lambda -- return is required and must have a semicolon
Predicate<Panda> p2 = p -> { return p.age < 5; }; // valid
Predicate<Panda> p3 = p -> { p.age < 5 };          // COMPILE ERROR -- no return
```

Any time you see braces `{}` in a lambda, immediately check: is there a `return` statement (if the functional interface's method returns a non-void type)?

---

### Lambda Parameters Cannot Shadow Local Variables in the Enclosing Scope

This caught you on Q15 (option C) and Q19 (options B and C). The rule applies in both directions -- before or after the lambda declaration. If a variable name already exists in the enclosing method scope, you cannot use it as a lambda parameter.

```java
var p = new Hyena();
Predicate<Hyena> pred = p -> p.age < 5;  // COMPILE ERROR -- p is already declared

var s = Set.copyOf(set);
Consumer<Object> c = s -> System.out.println(s);  // COMPILE ERROR -- s is already declared
```

Compare this to the rule for block bodies inside the lambda: variables declared inside the lambda block (like `char start`) can be re-declared in the enclosing method after the lambda (Q10), or conflict if declared before (Q16). The lambda parameter vs. enclosing scope conflict is separate from this.

---

### `var` as a Variable Name Is Legal

`var` is not a reserved keyword. It is a context-sensitive identifier used only in the declaration `var x = ...` position. As a plain parameter name or variable name, it is valid:

```java
var -> p.age <= 10   // legal -- 'var' is just the parameter name here
```

Expect the exam to test this precisely because it looks wrong.

---

### Lambda Parameter Count Must Match Exactly -- Even With a Block Body

For Q10/Q16 contrast: whether the inserted line is before or after the lambda changes whether redeclaring `start` or `c` is a conflict, because lambda body variables are scoped within the lambda, while lambda parameters are visible in the enclosing scope as "taken" names.

Quick mental model:
- Lambda parameters (`c` in `c -> { ... }`) -- cannot be re-declared anywhere in the enclosing method scope (before or after).
- Lambda body variables (`char start` inside `{ ... }`) -- scoped inside the lambda, don't conflict with the same name declared after the lambda in the method, but do conflict with the same name declared before the lambda.

---

### `default` Methods Must Have a Body

A `default` interface method without a body is a compile error -- not a valid abstract method, not a valid default method:

```java
interface Spaceship {
    default int blastOff();    // COMPILE ERROR -- no body
    default int blastOff() { return 1; } // valid
}
```

If you see `default` on a method, it must have `{}`. If you see a method without a body in an interface, it must not have `default` (it becomes an implicit abstract method).

---

## Thoughts and Advice

66% matches the previous chapter score exactly, which is consistent -- you are solid on the fundamentals but dropping marks on precise edge cases.

**The block lambda trap (Q17) should not happen again.** Q1 and Q17 are the same question with one character changed -- the braces. The exam does this deliberately. When you see a lambda, check: braces or no braces? If braces, does it have `return`? This is a one-second mechanical check that should be automatic.

**Lambda parameter shadowing (Q15, Q19) cost you 3 marks.** The rule is consistent: lambda parameters cannot shadow local variables from the enclosing scope. You knew `age` was not effectively final, which was good -- but you then missed that `p` and `s` were already in scope. Before picking a lambda answer, scan the enclosing method for variable names that match the lambda's parameter names.

**Q10 vs. Q16 -- the before/after distinction.** You got one right and the other partially wrong. The key is whether the inserted code comes before or after the lambda. Before the lambda, any name the lambda uses as a parameter or declares internally is "claimed." After the lambda, only lambda parameters are off-limits -- internal lambda variables have no effect on the method scope below them.

**`default` without a body (Q21, Spaceship).** This is an absolute rule: `default` requires a body, always. A `default` method with just a semicolon is not a valid abstract method -- it is simply a compile error.

**What you are doing well:** `compose` vs `andThen` (Q12), `var` in lambdas (Q11), BooleanSupplier knowledge (Q5), effective finality reasoning (Q13). The functional interface building blocks are solid.

The margin between 66% and a passing score on this chapter comes down to mechanical checks: block body + `return`, parameter shadowing, and interface validity rules. These are patterns, not concepts -- they should become reflexes.
