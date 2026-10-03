# Lambdas and Functional Interfaces


This chapter covers lambdas, functional interfaces, and method references. These three
features work together and are used heavily in Chapter 9 (Collections and Generics) and
Chapter 10 (Streams).

---

### Writing Simple Lambdas

Java is object-oriented at its core. **Functional programming** is a different style: you
specify what you want to do rather than managing the state of objects. You focus on
expressions rather than loops.

A **lambda expression** is a block of code that gets passed around like a value. Think of
it as an unnamed method inside an anonymous class -- it has parameters and a body but
no name. Lambdas are also called closures in other languages.

#### Why lambdas exist -- the motivation

Consider the goal: print all animals from a list that match some criteria. The criteria can
vary -- today it is "can hop", tomorrow it is "can swim." Without lambdas, the Java way
to make a method accept variable logic is to wrap that logic in an interface.

```java
public record Animal(String species, boolean canHop, boolean canSwim) {}
```

Define an interface that represents the concept of "a test on an Animal":

```java
public interface CheckTrait {
    boolean test(Animal a);
}
```

Then write a class that implements that interface for one specific check:

```java
public class CheckIfHopper implements CheckTrait {
    public boolean test(Animal a) {
        return a.canHop();
    }
}
```

Now `printAnimals()` can accept any `CheckTrait` and apply it:

```java
void printAnimals(List<Animal> animals, CheckTrait checker) {
    for (Animal a : animals) {
        if (checker.test(a)) System.out.println(a);
    }
}

printAnimals(animals, new CheckIfHopper()); // pass the filter as an object
```

##### Why this is a problem

Every new filter requires a brand new class file. Want to filter by "can swim"? Write
`CheckIfSwimmer`. Want to filter by species? Write `CheckBySpecies`. The logic for each
filter is a single line, but you need an entire class to hold it.

This is exactly the problem lambdas solve.

##### The role of each piece

| Piece | Role |
|---|---|
| `Animal` | The data being filtered |
| `CheckTrait` | The contract: anything that tests an Animal and returns true/false is a valid filter |
| `CheckIfHopper` | One concrete filter -- the old verbose way of fulfilling the contract |
| Lambda (coming next) | The modern concise way of fulfilling the same contract, inline |

The interface `CheckTrait` is essential and stays. The class `CheckIfHopper` is the
boilerplate that lambdas eliminate. A lambda replaces the entire class with a single
expression written directly at the call site:

```java
printAnimals(animals, a -> a.canHop()); // no CheckIfHopper class needed
```

The lambda `a -> a.canHop()` is the body of the `test()` method, written inline. Java
knows it implements `CheckTrait` from the context -- the method expects a `CheckTrait`,
and the lambda satisfies that contract.

---

### The Traditional Approach vs. Lambdas

Here is the full traditional implementation without lambdas:

```java
import java.util.*;
public class TraditionalSearch {
    public static void main(String[] args) {
        var animals = new ArrayList<Animal>();
        animals.add(new Animal("fish",     false, true));
        animals.add(new Animal("kangaroo", true,  false));
        animals.add(new Animal("rabbit",   true,  false));
        animals.add(new Animal("turtle",   false, true));

        print(animals, new CheckIfHopper()); // pass a whole class just to check one condition
    }

    private static void print(List<Animal> animals, CheckTrait checker) {
        for (Animal animal : animals) {
            if (checker.test(animal))
                System.out.print(animal + " ");
        }
        System.out.println();
    }
}
```

The `print()` method is deliberately general -- it does not know or care what the check
is. That is good design. But adding a new check means writing a whole new class file every
time. Want animals that swim? Write `CheckIfSwims`. Want animals with a specific species?
Write another class.

##### The lambda replacement

Replace the class instantiation with a lambda. The `print()` method declaration does not
change at all:

```java
print(animals, a -> a.canHop());  // animals that can hop
print(animals, a -> a.canSwim()); // animals that can swim
print(animals, a -> !a.canSwim()); // animals that cannot swim
```

Three different filters, three lines. No new class files. The logic lives right where it is used.

##### Deferred execution

The lambda body is not executed when it is written -- it is executed later, inside
`print()`, when `checker.test(animal)` is called. This is called **deferred execution**:
code is specified now but runs later.

The lambda `a -> a.canHop()` has two parts:

```java
a  ->  a.canHop()
^      ^^^^^^^^^^
|      body -- the code that actually runs when test() is called
parameter (the Animal being tested)
```

When you write:

```java
print(animals, a -> a.canHop());
```

The lambda is created and handed to `print()` as a value. `a.canHop()` does NOT run on
this line. It runs inside `print()`, each time the loop calls `checker.test(animal)`:

```java
private static void print(List<Animal> animals, CheckTrait checker) {
    for (Animal animal : animals) {
        if (checker.test(animal))  // <-- lambda body runs HERE, for each animal
            System.out.print(animal + " ");
    }
}
```

The execution timeline:

```
print(animals, a -> a.canHop())
  -> lambda is created, handed to print() as checker
  -> a.canHop() does NOT run yet

Inside print(), iteration 1 (fish):
  -> checker.test(fish) called
  -> a.canHop() runs NOW with a = fish, returns false, not printed

Inside print(), iteration 2 (kangaroo):
  -> checker.test(kangaroo) called
  -> a.canHop() runs NOW with a = kangaroo, returns true, printed
```

"Deferred" means: the body is written at one point in the code but runs somewhere else,
later, when something invokes it. The execution is deferred to that call site.

---

### Lambda Syntax

A lambda has three parts: parameters, an arrow, and a body.

```
a  ->  a.canHop()
^      ^^^^^^^^^^
|      body
parameter      arrow ->
```

##### How Java knows the types

Lambdas work with interfaces that have exactly one abstract method. Java uses the
context -- where the lambda is passed -- to determine the parameter type and return type.

```java
print(animals, a -> a.canHop());
// print() expects CheckTrait as second argument
// CheckTrait.test() takes an Animal and returns boolean
// therefore: a is an Animal, and a.canHop() must return boolean
```

Java maps the lambda to the abstract method of the expected interface. The parameter
type and return type are inferred automatically from that method's signature.

##### Short form vs. verbose form

These two lambdas do exactly the same thing:

```java
a -> a.canHop()                          // short form
(Animal a) -> { return a.canHop(); }     // verbose form
```

| Part | Short form | Verbose form |
|---|---|---|
| Parameter type | Omitted -- inferred | Written explicitly |
| Parentheses around parameter | Omitted -- single untyped param | Required |
| Braces around body | Omitted | Required |
| `return` keyword | Omitted | Required |
| Semicolon after body expression | Omitted | Required inside braces |

The short form can only omit parentheses when there is exactly one parameter and its
type is not written explicitly. The moment you add the type, parentheses become required.

##### Mix and match

All four combinations are valid:

```java
a -> a.canHop()                          // no parens, no braces
(Animal a) -> a.canHop()                 // parens, no braces
a -> { return a.canHop(); }              // no parens, braces
(Animal a) -> { return a.canHop(); }     // parens and braces
```

##### Valid lambda examples -- returning a boolean

| Lambda | Parameters |
|---|---|
| `() -> true` | 0 |
| `x -> x.startsWith("test")` | 1 |
| `(String x) -> x.startsWith("test")` | 1 |
| `(x, y) -> { return x.startsWith("test"); }` | 2 |
| `(String x, String y) -> x.startsWith("test")` | 2 |

##### Empty body lambda

A lambda with an empty body is valid, but only when the functional interface's abstract
method returns `void`. An empty body returns nothing -- if a value is expected, it does
not compile.

```java
interface Printer { void print(String s); }
Printer p = s -> {};   // fine - void return, empty body is valid

// CheckTrait.test() returns boolean
CheckTrait c = a -> {}; // DOES NOT COMPILE - must return a boolean, empty body returns void
```
```

##### Common syntax errors

##### Common syntax errors -- full reference

```java
// VALID forms
a -> a.canHop()                           // single untyped param, no parens needed
(a) -> a.canHop()                         // single untyped param, parens optional
(Animal a) -> a.canHop()                  // single typed param, parens required
(Animal a) -> { return a.canHop(); }      // verbose form, all parts explicit
a -> { return a.canHop(); }               // no parens (untyped), with braces
() -> true                                // zero params, parens required
(a, b) -> a.startsWith("test")            // two untyped params, parens required
(String a, String b) -> a.startsWith("test")  // two typed params
s -> {}                                   // empty body, valid

// DOES NOT COMPILE
Animal a -> a.canHop()                    // typed param without parentheses - parens required when type is written
a, b -> a.startsWith("test")             // multiple params without parentheses
(Animal a) -> { a.canHop() }             // body in braces but missing return and semicolon
(Animal a) -> { return a.canHop() }      // missing semicolon after expression inside braces
(Animal a) -> return a.canHop();         // return keyword outside braces - braces required with return
(Animal a) -> { return a.canHop(); return true; } // two return statements - only last return counts, but still a compile error for unreachable code
(String a, b) -> a.startsWith("test")    // DOES NOT COMPILE - cannot mix typed and untyped params
                                          // either all params have types, or none do
```

The rules in plain terms:
- Parentheses are optional only when there is exactly one parameter AND its type is not written.
- Braces require `return` (if the method has a return type) and a semicolon after each statement.
- No braces means a single expression that is implicitly returned -- no `return` keyword, no semicolon.
- All parameters must either all have explicit types or none have them. Mixing is not allowed.

##### You do not have to use all parameters

A lambda does not have to use every parameter it declares. The parameter must be listed
in the signature but can be ignored in the body:

```java
(String x, String y) -> x.startsWith("test") // y is declared but never used - fine
```

##### Invalid lambdas -- exam reference (Table 8.2)

| Invalid lambda | Reason |
|---|---|
| `x, y -> x.startsWith("fish")` | Missing parentheses -- multiple params require `()` |
| `x -> { x.startsWith("camel"); }` | Missing `return` inside braces |
| `x -> { return x.startsWith("giraffe") }` | Missing semicolon inside braces |
| `String x -> x.endsWith("eagle")` | Missing parentheses -- typed param requires `()` |

---

### Assigning Lambdas to `var`

`var` cannot be used to hold a lambda directly. Both `var` and the lambda rely on context
to determine their type -- neither provides enough information on its own for the compiler
to figure out what functional interface is intended.

```java
var invalid = (Animal a) -> a.canHop(); // DOES NOT COMPILE
```

The compiler needs to know what interface to assign the lambda to. With `var`, there is
no declared type to infer from. With a lambda, there is no explicit type either. Two unknowns, no solution.

The fix is to give it an explicit type:

```java
CheckTrait valid = (Animal a) -> a.canHop(); // fine - compiler knows the target interface
```

---

### Functional Interfaces

A **functional interface** is an interface that contains exactly one abstract method. This
is officially called the **SAM rule** -- Single Abstract Method. Lambdas can only be used
where a functional interface is expected.

```java
@FunctionalInterface
public interface Sprint {
    public void sprint(int speed); // the single abstract method
}

public class Tiger implements Sprint {
    public void sprint(int speed) {
        System.out.println("Animal is sprinting fast! " + speed);
    }
}
```

##### The `@FunctionalInterface` annotation

`@FunctionalInterface` is optional. It tells the compiler you intend the interface to be
functional. If you add it to an interface that has more than one abstract method, the
compiler gives an error:

```java
@FunctionalInterface
public interface Dance { // DOES NOT COMPILE
    void move();
    void rest(); // second abstract method - violates SAM rule
}
```

Not all functional interfaces in the Java library use this annotation. The annotation is a
promise from the interface author that it is safe to use in a lambda. But the presence or
absence of the annotation does not change whether the interface is functional -- having
exactly one abstract method is what matters.

##### Which of these are functional interfaces?

```java
public interface Dash extends Sprint {}
// functional - inherits sprint() from Sprint, no new abstract methods added

public interface Skip extends Sprint {
    void skip();
}
// NOT functional - two abstract methods: inherited sprint() and declared skip()

public interface Sleep {
    private void snore() {}
    default int getZzz() { return 1; }
}
// NOT functional - no abstract methods at all
// private and default methods do not count toward the SAM requirement

public interface Climb {
    void reach();
    default void fall() {}
    static int getBackUp() { return 100; }
    private static boolean checkHeight() { return true; }
}
// functional - only one abstract method: reach()
// default, static, and private methods do not count
```

##### Methods inherited from `Object` do not count

All classes ultimately extend `Object`. The following `Object` methods are always
available on any implementing class, so they do not count toward the SAM rule:

- `public String toString()`
- `public boolean equals(Object)`
- `public int hashCode()`

Why they are excluded: the SAM rule is a count. Java counts how many abstract methods
an interface has to decide whether a lambda can target it. These three methods are
excluded from that count because every class in Java already inherits them from `Object`
-- no implementing class will ever fail to provide them. They are not truly unimplemented.

If they counted, an interface like this:

```java
public interface Printable {
    String toString();  // already guaranteed by Object
    void print();       // the real contract
}
```

would have a SAM count of 2 and be considered non-functional, even though `toString()`
requires zero extra work from any implementing class. A lambda targeting `print()` would
be blocked by a method that is already satisfied for free. The exclusion keeps the count
honest: only count methods that an implementing class actually has to provide something
new for.

Note: this is not about whether the interface is useful or useless. An interface that only
declares `String toString()` is perfectly legal to define and implement. It simply cannot
be used as a lambda target because after the exclusion there are no abstract methods left
for a lambda to represent.

If an interface declares abstract methods with those exact signatures, they are excluded
from the SAM count:

```java
public interface Soar {
    abstract String toString(); // matches Object.toString() - does not count
}
// NOT functional - no abstract methods that count (toString() is excluded)
```

```java
public interface Dive {
    String toString();              // excluded - matches Object.toString()
    public boolean equals(Object o); // excluded - matches Object.equals(Object)
    public abstract int hashCode(); // excluded - matches Object.hashCode()
    public void dive();             // counts - this is the single abstract method
}
// functional - dive() is the one SAM
```

##### The signature must match exactly

The exclusion only applies when the method signature exactly matches the `Object`
version. A slight difference means it counts as a new abstract method:

```java
public interface Hibernate {
    String toString();
    public boolean equals(Hibernate o); // parameter is Hibernate, not Object
                                        // does NOT match Object.equals(Object)
                                        // counts as an abstract method
    public abstract int hashCode();
    public void rest();
}
// NOT functional - two abstract methods: equals(Hibernate) and rest()
```

`equals(Hibernate o)` looks like `equals(Object o)` but has a different parameter type.
It is a completely separate method that counts toward the SAM total.

##### You cannot declare Object methods with incompatible signatures

An interface cannot declare an abstract method that conflicts with an `Object` method's
return type, and this is a compile error in the interface itself -- no class needs to
implement it for the error to appear.

```java
public interface Bad {
    int toString(); // DOES NOT COMPILE - Object.toString() returns String, not int
}
```

The reason: every class in Java already has `String toString()` from `Object`. If this
interface were legal, any class implementing it would need to provide both `String toString()`
(from `Object`) and `int toString()` (from the interface) with the same parameter list but
different return types. Java does not allow overloading on return type alone, so no class
could ever satisfy both. The compiler catches the contradiction at the interface declaration
and rejects it immediately.

---

### Method References

A **method reference** is a shorthand for a lambda that does nothing but call a single
existing method. Instead of writing a lambda body that simply forwards its argument to
another method, you can name that method directly using the `::` operator.

Like a lambda, a method reference is not executed when it is written. It represents
deferred execution -- the compiler pretends it turns your method reference into a lambda.
At runtime they behave identically.

#### Assigning a lambda to a variable -- the foundation

A lambda carries no type information by itself. The declared variable type is the only
thing the compiler uses to resolve it. That type must be a functional interface, and the
lambda body must match that interface's SAM signature.

```java
public interface LearnToSpeak {
    void speak(String sound); // SAM: takes String, returns void
}

LearnToSpeak learner = s -> System.out.println(s);
//  ^^^^^^^^^^^^                    ^^^^^^^^^^^^^^^^^^^
//  the interface type          the body of speak(String)
//  tells the compiler which
//  SAM to match against
```

The same lambda works with any functional interface whose SAM has a matching signature:

```java
public interface Printer {
    void print(String text); // same signature: String -> void
}

Printer p = s -> System.out.println(s); // fine - signatures match
```

If the signature does not match, it does not compile:

```java
public interface Greeter {
    String greet(String name); // SAM must return String
}

Greeter g = s -> System.out.println(s); // DOES NOT COMPILE
// println() returns void, but greet() must return String
```

The problem: `greet(String)` is declared to return a `String`. The compiler looks at the
lambda body `System.out.println(s)` and sees that `println` returns `void` -- nothing.
The contract says "give me back a String" and the lambda hands back nothing. That is the
mismatch. Think of the lambda body as the method body slotted into `greet()`. If you
wrote it as a real method it would look like this:

```java
// what the compiler effectively sees:
public String greet(String s) {
    System.out.println(s); // returns void - missing return statement
}
// DOES NOT COMPILE - must return String
```

The same mismatch happens in reverse -- if the SAM returns void but the lambda returns
a value, it also does not compile:

```java
public interface Processor {
    void process(String s); // returns void
}

Processor p = s -> s.toUpperCase(); // DOES NOT COMPILE
// toUpperCase() returns String, but process() must return void
```

This is also why `var` cannot hold a lambda: `var` has no declared type, so the compiler
has nothing to resolve the lambda against.

#### The motivation

Start with a functional interface for learning to speak:

```java
public interface LearnToSpeak {
    void speak(String sound);
}
```

A helper class that exercises the interface:

```java
public class DuckHelper {
    public static void teacher(String name, LearnToSpeak trainer) {
        // exercise patience (omitted)
        trainer.speak(name);
    }
}
```

Implementing with a lambda:

```java
public class Duckling {
    public static void makeSound(String sound) {
        LearnToSpeak learner = s -> System.out.println(s);
        DuckHelper.teacher(sound, learner);
    }
}
```

The lambda `s -> System.out.println(s)` declares one parameter `s` and immediately
passes it to `println`. The parameter exists only to be forwarded. A method reference
removes that redundancy:

```java
LearnToSpeak learner = System.out::println;
// equivalent lambda: s -> System.out.println(s)
```

`System.out::println` means "call `println` on `System.out` later, passing whatever
argument `speak()` receives."

#### The four types of method references

| Type | Syntax | Lambda equivalent |
|---|---|---|
| Static method | `ClassName::staticMethod` | `(args) -> ClassName.staticMethod(args)` |
| Instance method on a particular instance | `instance::instanceMethod` | `(args) -> instance.instanceMethod(args)` |
| Instance method on a parameter | `ClassName::instanceMethod` | `(param, args) -> param.instanceMethod(args)` |
| Constructor | `ClassName::new` | `(args) -> new ClassName(args)` |

Types 2 and 3 can look identical at first glance. The difference: type 2 calls a method on
a specific object you already have; type 3 calls a method on whichever object is passed
in as the first parameter at runtime.

---

#### Type 1 -- Calling static methods

A static method reference calls a method directly on a class. The interface declares the
contract, and the method reference names the method whose body fulfills it.

The interface declares this contract:

```java
interface Converter {
    long round(double num); // "give me a double, I'll give back a long"
}
```

Without lambdas or method references, you would fulfill that contract by writing a class:

```java
// the old verbose way
class MyConverter implements Converter {
    public long round(double num) {
        return Math.round(num); // this IS the method body
    }
}

Converter c = new MyConverter();
```

A lambda collapses that entire class down to just the method body, written inline:

```java
//                   parameter    body (return is implicit)
//                       |            |
Converter lambda = x -> Math.round(x);
//                   ^
//                   arrow separates parameter from body
```

`x` is `num` renamed. `Math.round(x)` is the single line that was inside `round()`. All
three forms below are equivalent:

```java
Converter a = x -> Math.round(x);                       // short form
Converter b = (double x) -> Math.round(x);              // explicit type
Converter c = (double x) -> { return Math.round(x); };  // verbose, explicit return
```

The method reference goes one step further. The lambda body `x -> Math.round(x)` does
exactly one thing: takes `x` and passes it straight to `Math.round`. Nothing else. A
method reference is the shorthand for exactly that pattern:

```java
Converter methodRef = Math::round;
// means: "call Math.round, and pass whatever parameter round(double num) receives"
```

All three do the same thing:

```java
Converter verbose   = new MyConverter();
Converter lambda    = x -> Math.round(x);
Converter methodRef = Math::round;

System.out.println(verbose.round(100.1));   // 100
System.out.println(lambda.round(100.1));    // 100
System.out.println(methodRef.round(100.1)); // 100
```

`Math.round()` is overloaded -- it accepts `double` or `float`. Java resolves which
overload to use by looking at the SAM signature: `round(double num)` tells Java to look
for a static method that takes a `double` and returns a `long`, which matches
`Math.round(double)`. If Java could not determine which overload to pick, the compiler
would report an ambiguous type error.

Extra: the same overload resolution applies to any overloaded static method:

```java
interface StringConverter {
    int parse(String s);
}

StringConverter methodRef = Integer::parseInt;
// Integer.parseInt is overloaded: (String) and (String, int radix)
// SAM takes only one String, so Java picks parseInt(String)

System.out.println(methodRef.parse("42")); // 42
```

Extra: ambiguous type error -- when Java cannot resolve the overload. Imagine you wrote
your own class with two overloads that both match the SAM equally well:

```java
class Formatter {
    public static String format(Object o)  { return o.toString(); }
    public static String format(String s)  { return s.toUpperCase(); }
}

interface StringToString {
    String convert(String s); // SAM: String -> String
}

StringToString methodRef = Formatter::format; // DOES NOT COMPILE
// both format(Object) and format(String) can accept a String
// Java cannot decide which one to call - ambiguous type error
```

`format(String s)` is an exact match. But `format(Object o)` also accepts a `String`
because `String` is a subtype of `Object`. Java finds two valid candidates and cannot
choose, so it refuses to compile. The fix is to remove the ambiguity -- either rename one
overload or write an explicit lambda that names the exact one you want:

```java
StringToString lambda = s -> Formatter.format(s);        // still ambiguous - same problem
StringToString lambda = s -> Formatter.format((Object)s); // explicit cast picks format(Object)
StringToString lambda = (String s) -> Formatter.format(s); // still ambiguous
```

The cleanest fix is to rename or refactor the overloaded methods so the SAM signature
matches exactly one.

---

#### Type 2 -- Calling instance methods on a particular object

You already have a specific object, and you want to call a method on that exact object
every time.

```java
interface StringStart {
    boolean beginningCheck(String prefix);
}

var str = "Zoo";
StringStart methodRef = str::startsWith;
StringStart lambda    = s -> str.startsWith(s);

System.out.println(methodRef.beginningCheck("A")); // false
```

The object `str` is captured when the method reference is created. Every invocation of
`beginningCheck()` calls `startsWith` on that same captured `str`.

A method reference does not have to take any parameters. Here the SAM takes no
parameters and returns a value:

```java
interface StringChecker {
    boolean check();
}

var str = "";
StringChecker methodRef = str::isEmpty;
StringChecker lambda    = () -> str.isEmpty();

System.out.print(methodRef.check()); // true
```

##### When you cannot use a method reference

Not every lambda can be replaced with a method reference. If the lambda body passes a
hardcoded argument, there is no way to encode that argument in the method reference:

```java
var str = "";
StringChecker lambda = () -> str.startsWith("Zoo");

StringChecker methodRef = str::startsWith;      // DOES NOT COMPILE
StringChecker methodRef = str::startsWith("Zoo"); // DOES NOT COMPILE
```

There is no syntax to pass `"Zoo"` through a method reference. The method reference
can only name the method -- it cannot supply arguments. This lambda cannot be converted.

Extra: the same applies to any lambda that does more than forward its parameters:

```java
StringChecker cannotConvert = () -> str.trim().isEmpty(); // two calls chained - no method ref
```

---

#### Type 3 -- Calling instance methods on a parameter

Here you do not have a specific object upfront. The first parameter of the SAM becomes
the object the method is called on at runtime.

```java
interface StringParameterChecker {
    boolean check(String text);
}

StringParameterChecker methodRef = String::isEmpty;
StringParameterChecker lambda    = s -> s.isEmpty();

System.out.println(methodRef.check("Zoo")); // false
```

`String::isEmpty` looks like a static method reference but it is not. Java sees that
`isEmpty()` is an instance method on `String` with no parameters, and the SAM provides
one parameter (`text`). So Java uses that parameter as the instance to call `isEmpty()` on.

Compare this directly with the type 2 example:

```java
// Type 2: str is a captured object - same instance every call
StringChecker type2 = str::isEmpty;          // str is fixed

// Type 3: the instance comes from the SAM parameter - different object each call
StringParameterChecker type3 = String::isEmpty; // instance determined at runtime
```

With two parameters, the first becomes the receiver and the second becomes the argument:

```java
interface StringTwoParameterChecker {
    boolean check(String text, String prefix);
}

StringTwoParameterChecker methodRef = String::startsWith;
StringTwoParameterChecker lambda    = (s, p) -> s.startsWith(p);

System.out.println(methodRef.check("Zoo", "A")); // false
```

Line 26 may look like a static method reference, but it is an instance method reference
where the instance will be supplied at runtime as the first parameter. Java figures this out
from context: `startsWith` is an instance method on `String`, and the SAM provides two
parameters, so the first is the receiver and the second is the argument.

Extra: this extends to any number of parameters -- the first is always the receiver, the
rest are forwarded as arguments:

```java
interface Replacer {
    String replace(String original, String target, String replacement);
}

Replacer methodRef = String::replace;
// equivalent lambda: (s, t, r) -> s.replace(t, r)
// first param is the String instance, next two are the arguments

System.out.println(methodRef.replace("hello world", "world", "Java")); // hello Java
```

If the SAM parameter count doesn't match (too many or too few), it's a compile error --
the compiler resolves it like a normal overload: param[0] is the receiver, param[1..n] are
the arguments, and if no matching method exists on the class, it fails:

```java
// Too many -- no String.replace(String, String, String) exists
interface TooMany {
    String replace(String original, String target, String replacement, String extra);
}
TooMany ref = String::replace; // COMPILE ERROR

// Too few -- no String.replace() with zero args exists
interface TooFew {
    String replace(String original);
}
TooFew ref2 = String::replace; // COMPILE ERROR
```

---

#### Type 4 -- Calling constructors

A constructor reference uses `new` in place of a method name. It works exactly like the
other method references -- the `::` operator still means "call this later", except what
gets called is a constructor instead of a regular method. The SAM parameters are
forwarded to the matching constructor, and the return type is always the constructed object.

The key mental model: `String::new` does not call `new String()` right now. It means
"whenever the SAM method is invoked, create a new String using whatever parameters
the SAM provides." Java figures out which constructor to use by looking at the SAM's
parameter list -- the same way it figures out which overload to use for static methods.

```java
interface EmptyStringCreator {
    String create(); // no parameters
}

EmptyStringCreator methodRef = String::new;
EmptyStringCreator lambda    = () -> new String();
//                                   ^^^^^^^^^^^
//                                   this is the constructor call that the method ref represents

var myString = methodRef.create(); // create() is called here -- new String() runs NOW
System.out.println(myString.equals("Snake")); // false
```

The SAM `create()` takes no parameters, so Java looks for a constructor `String()` with
no arguments. It finds it and wires it up. Calling `methodRef.create()` is the same as
writing `new String()`.

Now change the SAM to take one parameter:

```java
interface StringCopier {
    String copy(String value); // one String parameter
}

StringCopier methodRef = String::new;
//            same reference  ^^^^^^^^^
StringCopier lambda    = x -> new String(x);
//                             ^^^^^^^^^^^^
//                             Java calls String(String) because x is a String

var myString = methodRef.copy("Zebra"); // copy("Zebra") calls new String("Zebra")
System.out.println(myString.equals("Zebra")); // true
```

`String::new` is written identically in both examples. What changes is the SAM. In the
first example the SAM has no parameters, so `String()` is called. In the second example
the SAM has one `String` parameter, so `String(String)` is called. The method reference
itself tells you nothing about which constructor runs -- you must look at the SAM to know.

Think of it like this:

```
SAM signature           what Java calls
-----------------------------------------
create()                new String()
copy(String value)      new String(value)
```

Extra: if no constructor exists that matches the SAM's parameter list, it does not compile:

```java
interface IntStringCreator {
    String create(int size, boolean flag); // two params: int and boolean
}

IntStringCreator bad = String::new; // DOES NOT COMPILE
// there is no String(int, boolean) constructor
// Java cannot find a matching constructor to wire up, so it rejects it at compile time
```

Extra: the same mechanics work with any class, not just `String`. Here is a custom `Point`
class with two constructors:

```java
class Point {
    int x, y;

    Point() {
        this.x = 0;
        this.y = 0;
    }

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public String toString() { return "(" + x + ", " + y + ")"; }
}
```

Define two SAMs with different parameter lists:

```java
interface PointFactory {
    Point make(); // no parameters
}

interface PointFactoryXY {
    Point make(int x, int y); // two int parameters
}
```

Wire them up with `Point::new`:

```java
PointFactory   noArg  = Point::new;        // SAM has no params -> calls Point()
PointFactoryXY withXY = Point::new;        // SAM has two ints  -> calls Point(int, int)

// equivalent lambdas:
PointFactory   noArgLambda  = () -> new Point();
PointFactoryXY withXYLambda = (x, y) -> new Point(x, y);

System.out.println(noArg.make());       // (0, 0)
System.out.println(withXY.make(3, 7)); // (3, 7)
```

The reference `Point::new` is written the same way in both lines. The SAM's parameter
list is the only thing that determines which constructor gets called.

---

#### Method references summary (Table 8.3)

| Type | Example | Lambda equivalent |
|---|---|---|
| Static method | `Math::round` | `x -> Math.round(x)` |
| Instance method, particular object | `str::startsWith` | `s -> str.startsWith(s)` |
| Instance method, particular object (no param) | `str::isEmpty` | `() -> str.isEmpty()` |
| Instance method on parameter | `String::isEmpty` | `s -> s.isEmpty()` |
| Instance method on parameter (two params) | `String::startsWith` | `(s, p) -> s.startsWith(p)` |
| Constructor | `String::new` | `() -> new String()` |

#### When a method reference cannot replace a lambda

A method reference can only replace a lambda that does nothing but call one method and
forward the parameters directly. The moment the body adds any logic, a method reference
cannot replace it:

```java
// these CAN be replaced
s -> System.out.println(s)        ->  System.out::println
s -> s.isEmpty()                  ->  String::isEmpty
(s, p) -> s.startsWith(p)         ->  String::startsWith
x -> Math.round(x)                ->  Math::round

// these CANNOT be replaced
s -> s.trim().isEmpty()            // two chained calls
s -> System.out.println(s + "!")   // argument modified before passing
() -> str.startsWith("Zoo")        // hardcoded argument - cannot encode in method ref
(a, b) -> a + b                    // operator, not a method
s -> new StringBuilder(s).reverse().toString() // multi-step body
```

---

### Working with Built-in Functional Interfaces

Writing your own functional interface every time you need a lambda would be tedious.
Java provides a set of general-purpose functional interfaces in the `java.util.function`
package that cover the most common patterns. You do not need to write your own for
everyday use.

#### Generic type parameter conventions

The interfaces use generic type parameters to stay flexible:

- `T` -- the input type (or the single type when input and output are the same)
- `U` -- a second input type when two inputs are needed
- `R` -- the return type when it differs from the input type

#### Core functional interfaces (Table 8.4)

| Interface             | Return type | Method         | Parameters |
| --------------------- | ----------- | -------------- | ---------- |
| `Supplier<T>`         | `T`         | `get()`        | 0          |
| `Consumer<T>`         | `void`      | `accept(T)`    | 1 (T)      |
| `BiConsumer<T, U>`    | `void`      | `accept(T, U)` | 2 (T, U)   |
| `Predicate<T>`        | `boolean`   | `test(T)`      | 1 (T)      |
| `BiPredicate<T, U>`   | `boolean`   | `test(T, U)`   | 2 (T, U)   |
| `Function<T, R>`      | `R`         | `apply(T)`     | 1 (T)      |
| `BiFunction<T, U, R>` | `R`         | `apply(T, U)`  | 2 (T, U)   |
| `UnaryOperator<T>`    | `T`         | `apply(T)`     | 1 (T)      |
| `BinaryOperator<T>`   | `T`         | `apply(T, T)`  | 2 (T, T)   |

This table must be memorised for the exam. The key things to anchor each one:

- `Supplier` -- supplies a value, takes nothing
- `Consumer` / `BiConsumer` -- consumes value(s), returns nothing (void)
- `Predicate` / `BiPredicate` -- tests value(s), always returns boolean
- `Function` / `BiFunction` -- transforms input(s) of one type into an output of a (possibly different) type
- `UnaryOperator` -- like `Function` but input and output are the same type
- `BinaryOperator` -- like `BiFunction` but both inputs and output are the same type

Note: most of the time in real code you do not assign the lambda to a named variable first.
The interface type is inferred from the method that receives it, and the lambda is passed
directly. The named variables in the examples below are for learning purposes only.

Other functional interfaces appear later in the book: `Comparator` (Chapter 9),
`Runnable` and `Callable` (Chapter 13). These may also appear on the exam.


---

#### `Supplier<T>`

```java
@FunctionalInterface
public interface Supplier<T> {
    T get();
}
```

A `Supplier` generates or supplies a value without taking any input. The SAM `get()`
takes no parameters and returns `T`. Use it when you need to produce a value on demand
-- factory methods and constructors are the most common targets.

##### Static method reference as a Supplier

`LocalDate.now()` is a static factory method that takes no arguments and returns a
`LocalDate`. Its signature matches `get()` exactly:

```java
Supplier<LocalDate> s1 = LocalDate::now;       // method reference
Supplier<LocalDate> s2 = () -> LocalDate.now(); // equivalent lambda

LocalDate d1 = s1.get();
LocalDate d2 = s2.get();
System.out.println(d1); // 2022-02-20
System.out.println(d2); // 2022-02-20
```

##### Constructor reference as a Supplier

`Supplier` is also natural for constructor references. Every time `get()` is called, a
new object is created:

```java
Supplier<StringBuilder> s1 = StringBuilder::new;
Supplier<StringBuilder> s2 = () -> new StringBuilder();

System.out.println(s1.get()); // (empty string)
System.out.println(s2.get()); // (empty string)
```

##### Nested generics

The type parameter `T` in `Supplier<T>` can itself be a generic type. Read it one step
at a time: `Supplier<ArrayList<String>>` means "a Supplier that produces an
`ArrayList<String>` each time `get()` is called":

```java
Supplier<ArrayList<String>> s3 = ArrayList::new;
ArrayList<String> a1 = s3.get();
System.out.println(a1); // []
```

`ArrayList::new` matches because `ArrayList` has a no-arg constructor, and the SAM
`get()` takes no parameters and returns `T` (which is `ArrayList<String>` here).

##### Printing the Supplier itself vs. calling get()

Calling `get()` invokes the lambda and returns the produced value. Printing the Supplier
variable itself does not call `get()` -- it calls `toString()` on the lambda object:

```java
System.out.println(s3);
// prints something like: functionalinterface.BuiltIns$$Lambda$1/0x0000000800066840@4909b8da
```

`$$` in the class name means the class exists only in memory -- it was created by the
JVM for the lambda and has no corresponding `.class` file on disk. You do not need to
understand the rest of the output.


---

#### `Consumer<T>` and `BiConsumer<T, U>`

```java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
    // omitted default method
}

@FunctionalInterface
public interface BiConsumer<T, U> {
    void accept(T t, U u);
    // omitted default method
}
```

A `Consumer` takes one parameter and returns nothing. Use it when you want to do
something with a value -- print it, store it, log it -- without producing a result.
`BiConsumer` is the same but takes two parameters. The `Bi` prefix always means "add
another parameter" -- the same pattern applies to `BiPredicate` and `BiFunction`.

##### Consumer -- printing example

Printing is the most common use of `Consumer`. `System.out.println` takes one parameter
and returns void, which matches `accept(T)` exactly:

```java
Consumer<String> c1 = System.out::println;
Consumer<String> c2 = x -> System.out.println(x);

c1.accept("Annie"); // Annie
c2.accept("Annie"); // Annie
```

##### BiConsumer -- map insertion example (mixed types)

`BiConsumer` accepts two parameters of potentially different types. `Map.put(K, V)` is a
natural fit -- it takes a key and a value and returns nothing useful:

```java
var map = new HashMap<String, Integer>();
BiConsumer<String, Integer> b1 = map::put;
BiConsumer<String, Integer> b2 = (k, v) -> map.put(k, v);

b1.accept("chicken", 7);
b2.accept("chick", 1);

System.out.println(map); // {chicken=7, chick=1}
```

`b1` uses an instance method reference on the local variable `map` -- this is type 2
(instance method on a particular object). Both parameters of `accept(T, U)` are forwarded
as arguments to `put`. The method reference is noticeably shorter than the lambda, which
is why the exam favours method references heavily.

##### BiConsumer -- same type for both parameters

`T` and `U` do not have to be different types. Here both are `String`:

```java
var map = new HashMap<String, String>();
BiConsumer<String, String> b1 = map::put;
BiConsumer<String, String> b2 = (k, v) -> map.put(k, v);

b1.accept("chicken", "Cluck");
b2.accept("chick", "Tweep");

System.out.println(map); // {chicken=Cluck, chick=Tweep}
```

`T` and `U` are independent type parameters. They can be the same type or different --
`BiConsumer<String, String>` and `BiConsumer<String, Integer>` are both valid.

##### Why use Consumer instead of just calling the method directly?

The same deferred execution reasoning as `Supplier` applies here. You pass a `Consumer`
to a method that will call `accept()` on your behalf -- the receiving code decides when
and how many times to invoke it. A common pattern is iterating over a collection and
applying the consumer to each element, without the consumer needing to know anything
about the iteration:

```java
List<String> names = List.of("Annie", "Bobby", "Clara");
names.forEach(System.out::println); // forEach takes a Consumer<String>
// Annie
// Bobby
// Clara
```

`forEach` is declared to accept a `Consumer<T>`. You provide the "what to do with each
element" part; `forEach` handles the "iterate over all elements" part.


---

#### `Predicate<T>` and `BiPredicate<T, U>`

```java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);
    // omitted default and static methods
}

@FunctionalInterface
public interface BiPredicate<T, U> {
    boolean test(T t, U u);
    // omitted default methods
}
```

A `Predicate` tests a condition and returns a primitive `boolean`. Use it for filtering and
matching. `BiPredicate` does the same with two parameters.

```java
Predicate<String> p1 = String::isEmpty;
Predicate<String> p2 = x -> x.isEmpty();

System.out.println(p1.test(""));  // true
System.out.println(p2.test(""));  // true
```

`String::isEmpty` is a type 3 method reference -- the parameter passed to `test()` becomes
the instance that `isEmpty()` is called on.

```java
BiPredicate<String, String> b1 = String::startsWith;
BiPredicate<String, String> b2 = (string, prefix) -> string.startsWith(prefix);

System.out.println(b1.test("chicken", "chick")); // true
System.out.println(b2.test("chicken", "chick")); // true
```

`String::startsWith` is a type 3 method reference with two parameters -- the first
parameter becomes the instance, the second becomes the argument to `startsWith`.

---

#### `Function<T, R>` and `BiFunction<T, U, R>`

```java
@FunctionalInterface
public interface Function<T, R> {
    R apply(T t);
    // omitted default and static methods
}

@FunctionalInterface
public interface BiFunction<T, U, R> {
    R apply(T t, U u);
    // omitted default method
}
```

A `Function` transforms one type into another. `T` is the input type, `R` is the return type.
They can be the same type or different. `BiFunction` takes two inputs and returns one output.

```java
Function<String, Integer> f1 = String::length;
Function<String, Integer> f2 = x -> x.length();

System.out.println(f1.apply("cluck")); // 5
System.out.println(f2.apply("cluck")); // 5
```

`String::length` is a type 3 method reference -- the `String` parameter becomes the
instance. The result is an `int` that gets autoboxed into `Integer` to match the `R` type.

```java
BiFunction<String, String, String> b1 = String::concat;
BiFunction<String, String, String> b2 = (string, toAdd) -> string.concat(toAdd);

System.out.println(b1.apply("baby ", "chick")); // baby chick
System.out.println(b2.apply("baby ", "chick")); // baby chick
```

For `BiFunction`, the first two type parameters are inputs, the third is the return type. In
the method reference, the first parameter is the instance `concat()` is called on, and the
second is the argument passed to it.

---

#### `UnaryOperator<T>` and `BinaryOperator<T>`

```java
@FunctionalInterface
public interface UnaryOperator<T> extends Function<T, T> {
    // omitted static method
}

@FunctionalInterface
public interface BinaryOperator<T> extends BiFunction<T, T, T> {
    // omitted static methods
}
```

`UnaryOperator` and `BinaryOperator` are special cases of `Function` and `BiFunction`
where all type parameters must be the same type. They extend their parent interfaces, so
the method signatures are inherited:

```
T apply(T t)       // UnaryOperator - same as Function<T, T>
T apply(T t1, T t2) // BinaryOperator - same as BiFunction<T, T, T>
```

The generics on the subclass enforce the constraint. You only specify one type instead of
two or three, which makes the declaration shorter.

```java
UnaryOperator<String> u1 = String::toUpperCase;
UnaryOperator<String> u2 = x -> x.toUpperCase();

System.out.println(u1.apply("chirp")); // CHIRP
System.out.println(u2.apply("chirp")); // CHIRP
```

```java
BinaryOperator<String> b1 = String::concat;
BinaryOperator<String> b2 = (string, toAdd) -> string.concat(toAdd);

System.out.println(b1.apply("baby ", "chick")); // baby chick
System.out.println(b2.apply("baby ", "chick")); // baby chick
```

This does the same thing as the `BiFunction<String, String, String>` example above.
`BinaryOperator<String>` is more succinct -- one type parameter instead of three. When
all types are the same, prefer `UnaryOperator` or `BinaryOperator` over `Function` or
`BiFunction`.

---

#### Identifying the right functional interface

The strategy: look at the number of parameters and the return type. That narrows it down
immediately.

| Parameters | Return type | Interface |
|---|---|---|
| 0 | `T` (object) | `Supplier<T>` |
| 1 | `void` | `Consumer<T>` |
| 2 | `void` | `BiConsumer<T, U>` |
| 1 | `boolean` (primitive) | `Predicate<T>` |
| 2 | `boolean` (primitive) | `BiPredicate<T, U>` |
| 1 | `R` (different type) | `Function<T, R>` |
| 2 | `R` (different type) | `BiFunction<T, U, R>` |
| 1 | same type as input | `UnaryOperator<T>` |
| 2 | same type as inputs | `BinaryOperator<T>` |

##### Practice -- identify the interface

- Returns a `String`, takes no parameters -> `Supplier<String>`
- Returns a `Boolean` object, takes a `String` -> `Function<String, Boolean>` -- NOT `Predicate`, which returns a primitive `boolean`
- Returns an `Integer`, takes two `Integer`s -> `BinaryOperator<Integer>` (more specific) or `BiFunction<Integer, Integer, Integer>` (both correct, but `BinaryOperator` is preferred)

##### Practice -- identify the interface from code

```java
<List> ex1 = x -> "".equals(x.get(0));      // one param, returns boolean -> Predicate<List>
<Long> ex2 = (Long l) -> System.out.println(l); // one param, returns void -> Consumer<Long>
<String, String> ex3 = (s1, s2) -> false;   // two params, returns boolean -> BiPredicate<String, String>
```

##### Common compile errors

```java
Function<List<String>> ex1 = x -> x.get(0); // DOES NOT COMPILE
// Function requires two type parameters: input and return type
// only one is specified here

UnaryOperator<Long> ex2 = (Long l) -> 3.14; // DOES NOT COMPILE
// UnaryOperator requires input and return to be the same type
// input is Long, but 3.14 is a double - type mismatch
```

---

#### Convenience methods on functional interfaces

Functional interfaces can have default methods in addition to their SAM. Several built-in
interfaces provide convenience methods for combining or modifying functional interface
instances without writing new lambdas from scratch.

##### Convenience methods (Table 8.5)

| Interface | Method name | Returns | What it does |
|---|---|---|---|
| `Consumer` | `andThen(Consumer)` | `Consumer` | Runs both consumers in sequence |
| `Function` | `andThen(Function)` | `Function` | Chains: passes output of first as input to second |
| `Function` | `compose(Function)` | `Function` | Chains in reverse: runs argument first, then this |
| `Predicate` | `and(Predicate)` | `Predicate` | Both must return true (`&&`) |
| `Predicate` | `negate()` | `Predicate` | Flips the result (`!`) |
| `Predicate` | `or(Predicate)` | `Predicate` | Either must return true (`\|\|`) |

`BiConsumer`, `BiFunction`, and `BiPredicate` have similar methods available.

##### Predicate convenience methods

```java
Predicate<String> egg   = s -> s.contains("egg");
Predicate<String> brown = s -> s.contains("brown");

// building new predicates by combining existing ones
Predicate<String> brownEggs = egg.and(brown);          // contains "egg" AND "brown"
Predicate<String> otherEggs = egg.and(brown.negate()); // contains "egg" AND NOT "brown"
```

Compare this to writing them by hand:

```java
// verbose, duplicated, harder to maintain
Predicate<String> brownEggs = s -> s.contains("egg") && s.contains("brown");
Predicate<String> otherEggs = s -> s.contains("egg") && !s.contains("brown");
```

The combined version reuses `egg` and `brown`. If the logic in `egg` changes, both
`brownEggs` and `otherEggs` automatically reflect the change.

##### Consumer `andThen()`

Runs two consumers in sequence. The same input is passed to both independently -- the
first consumer's output does not feed into the second:

```java
Consumer<String> c1 = x -> System.out.print("1: " + x);
Consumer<String> c2 = x -> System.out.print(",2: " + x);
Consumer<String> combined = c1.andThen(c2);

combined.accept("Annie"); // 1: Annie,2: Annie
```

Both `c1` and `c2` receive `"Annie"`. They run one after the other, independently.

##### Function `andThen()` and `compose()`

`andThen()` and `compose()` both chain two `Function` instances, but in opposite orders.

```java
Function<Integer, Integer> before = x -> x + 1;
Function<Integer, Integer> after  = x -> x * 2;

Function<Integer, Integer> combined = after.compose(before);
System.out.println(combined.apply(3)); // 8
```

`after.compose(before)` means: run `before` first, then `after`. So `3 + 1 = 4`, then
`4 * 2 = 8`.

`after.andThen(before)` would be the reverse: run `after` first, then `before`.

The memory trick: `compose` = "compose using this other function first" (argument runs
first). `andThen` = "run this, and then run the argument."

```java
Function<Integer, Integer> andThenVersion = before.andThen(after);
System.out.println(andThenVersion.apply(3)); // also 8 - same result here, same order
// before runs first (3+1=4), after runs second (4*2=8)
```

For this specific example both give 8. The order difference matters when the operations
are not commutative:

```java
Function<String, String> trim   = String::trim;
Function<String, String> upper  = String::toUpperCase;

System.out.println(trim.andThen(upper).apply("  hello  ")); // "HELLO"  - trim first, then upper
System.out.println(upper.andThen(trim).apply("  hello  ")); // "HELLO"  - upper first, then trim
// same result here, but order would matter if operations were destructive
```


---

### Functional Interfaces for Primitives

The interfaces in `java.util.function` have primitive-specific variants for `double`, `int`,
and `long`. These exist to avoid autoboxing -- using `IntSupplier` instead of
`Supplier<Integer>` means no boxing overhead. There is also one interface for `boolean`.

The exam expects you to recognise these by name and know their SAM signatures.

#### `BooleanSupplier`

The only primitive functional interface for `boolean`:

```java
@FunctionalInterface
public interface BooleanSupplier {
    boolean getAsBoolean();
}
```

```java
BooleanSupplier b1 = () -> true;
BooleanSupplier b2 = () -> Math.random() > .5;

System.out.println(b1.getAsBoolean()); // true
System.out.println(b2.getAsBoolean()); // true or false
```

#### Primitive equivalents of the core interfaces

These follow the same pattern as Table 8.4 but with primitive types baked in. The key
differences from the generic versions:

- No generics on the input side -- the type name tells you the primitive (e.g. `DoubleConsumer` takes a `double`)
- The SAM is often renamed to reflect the return type (e.g. `applyAsInt` instead of `apply`)
- `XxxFunction<R>` keeps one generic for the return type since the return is still an object

| Interface              | Return type | SAM name                        | Parameters         |
| ---------------------- | ----------- | ------------------------------- | ------------------ |
| `DoubleSupplier`       | `double`    | `getAsDouble()`                 | 0                  |
| `IntSupplier`          | `int`       | `getAsInt()`                    | 0                  |
| `LongSupplier`         | `long`      | `getAsLong()`                   | 0                  |
| `DoubleConsumer`       | `void`      | `accept(double)`                | 1 (double)         |
| `IntConsumer`          | `void`      | `accept(int)`                   | 1 (int)            |
| `LongConsumer`         | `void`      | `accept(long)`                  | 1 (long)           |
| `DoublePredicate`      | `boolean`   | `test(double)`                  | 1 (double)         |
| `IntPredicate`         | `boolean`   | `test(int)`                     | 1 (int)            |
| `LongPredicate`        | `boolean`   | `test(long)`                    | 1 (long)           |
| `DoubleFunction<R>`    | `R`         | `apply(double)`                 | 1 (double)         |
| `IntFunction<R>`       | `R`         | `apply(int)`                    | 1 (int)            |
| `LongFunction<R>`      | `R`         | `apply(long)`                   | 1 (long)           |
| `DoubleUnaryOperator`  | `double`    | `applyAsDouble(double)`         | 1 (double)         |
| `IntUnaryOperator`     | `int`       | `applyAsInt(int)`               | 1 (int)            |
| `LongUnaryOperator`    | `long`      | `applyAsLong(long)`             | 1 (long)           |
| `DoubleBinaryOperator` | `double`    | `applyAsDouble(double, double)` | 2 (double, double) |
| `IntBinaryOperator`    | `int`       | `applyAsInt(int, int)`          | 2 (int, int)       |
| `LongBinaryOperator`   | `long`      | `applyAsLong(long, long)`       | 2 (long, long)     |

#### Primitive-to-primitive conversion interfaces

These handle converting between primitive types. The naming pattern is
`XxxToYyyFunction` -- `Xxx` is the input primitive, `Yyy` is the output primitive.
The `ToXxx` prefix means the input is an object (generic `T`) and the output is a primitive.
`ObjXxxConsumer` takes one object and one primitive and returns void.

| Interface | Parameter(s) | Return type | SAM name |
|---|---|---|---|
| `DoubleToIntFunction` | `double` | `int` | `applyAsInt(double)` |
| `DoubleToLongFunction` | `double` | `long` | `applyAsLong(double)` |
| `IntToDoubleFunction` | `int` | `double` | `applyAsDouble(int)` |
| `IntToLongFunction` | `int` | `long` | `applyAsLong(int)` |
| `LongToDoubleFunction` | `long` | `double` | `applyAsDouble(long)` |
| `LongToIntFunction` | `long` | `int` | `applyAsInt(long)` |
| `ToDoubleFunction<T>` | `T` (object) | `double` | `applyAsDouble(T)` |
| `ToIntFunction<T>` | `T` (object) | `int` | `applyAsInt(T)` |
| `ToLongFunction<T>` | `T` (object) | `long` | `applyAsLong(T)` |
| `ToDoubleBiFunction<T,U>` | `T`, `U` | `double` | `applyAsDouble(T, U)` |
| `ToIntBiFunction<T,U>` | `T`, `U` | `int` | `applyAsInt(T, U)` |
| `ToLongBiFunction<T,U>` | `T`, `U` | `long` | `applyAsLong(T, U)` |
| `ObjDoubleConsumer<T>` | `T`, `double` | `void` | `accept(T, double)` |
| `ObjIntConsumer<T>` | `T`, `int` | `void` | `accept(T, int)` |
| `ObjLongConsumer<T>` | `T`, `long` | `void` | `accept(T, long)` |

#### Reading primitive interface names -- the naming pattern

Once you know the pattern, you can decode any name without memorising every entry:

- `DoubleConsumer` -- takes a `double`, returns void
- `IntToLongFunction` -- takes an `int`, returns a `long`
- `ToIntFunction<T>` -- takes an object `T`, returns an `int`
- `ObjIntConsumer<T>` -- takes an object `T` and an `int`, returns void
- `DoubleUnaryOperator` -- takes a `double`, returns a `double` (same type, unary)
- `LongBinaryOperator` -- takes two `long`s, returns a `long` (same type, binary)

#### Exam practice -- identify the interface from context

```java
var d = 1.0;
_______ f1 = x -> 1;
f1.applyAsInt(d);
```

Clues: takes a `double`, returns an `int`, SAM is named `applyAsInt`. Two interfaces
match: `DoubleToIntFunction` (input must be `double`) and `ToIntFunction<Double>`
(input is a generic object, which could be `Double`). Both are correct answers.


---

### Working with Variables in Lambdas

Variables interact with lambdas in three places: the parameter list, local variables declared
inside the lambda body, and variables referenced from the surrounding scope. All three are
exam trap territory.

---

#### Parameter list

The type of a lambda parameter is inferred from context -- specifically from the functional
interface the lambda is being assigned to or passed into. You never have to state it, but you
can. All three of these are equivalent:

```java
Predicate<String> p = x -> true;
Predicate<String> p = (var x) -> true;
Predicate<String> p = (String x) -> true;
```

In all three cases the type of `x` is `String`, inferred from `Predicate<String>`.

##### Inferring the type from a method signature

When the lambda is passed to a method rather than assigned to a variable, you look at the
method signature to find the generic type:

```java
public void whatAmI() {
    consume((var x) -> System.out.print(x), 123);
}

public void consume(Consumer<Integer> c, int num) {
    c.accept(num);
}
```

`consume()` expects a `Consumer<Integer>`, so `x` is `Integer`. The `var` here is just
`Integer` by inference.

##### Inferring the type from the collection being sorted

Sometimes you do not even need to see the method signature:

```java
public void counts(List<Integer> list) {
    list.sort((var x, var y) -> x.compareTo(y));
}
```

`list` is a `List<Integer>`, so the elements being compared are `Integer`. Therefore `x`
and `y` are both `Integer`.

##### Modifiers on lambda parameters

Lambda parameters behave like method parameters and can have modifiers. `final` and
annotations are both legal:

```java
public void counts(List<Integer> list) {
    list.sort((final var x, @Deprecated var y) -> x.compareTo(y));
}
```

This is uncommon in real code but has appeared on the exam.

##### All parameters must use the same format

You cannot mix typed, untyped, and `var` parameters in the same lambda. All parameters
must use the same format:

```java
(var x, y)              -> "Hello"  // DOES NOT COMPILE - var on x, nothing on y
(var x, Integer y)      -> true     // DOES NOT COMPILE - var mixed with explicit type
(String x, var y, Integer z) -> true // DOES NOT COMPILE - mixed formats
(Integer x, y)          -> "goodbye" // DOES NOT COMPILE - type on x, nothing on y
```

The fix in each case is to make all parameters consistent: all untyped, all `var`, or all
explicitly typed.

The rule: `var` is perfectly valid as a parameter type in a lambda -- it is just another way
of saying "infer the type for me." The restriction is not about `var` itself, it is about
consistency. Whichever format you choose, every parameter in the same lambda must use
that same format. You cannot mix `var` with explicit types, and you cannot mix `var` or
explicit types with untyped parameters.

```java
// all three formats are valid on their own:
(x, y)            -> true   // all untyped - fine
(var x, var y)    -> true   // all var     - fine
(String x, String y) -> true // all typed  - fine

// mixing any two formats is not allowed:
(var x, y)          -> true  // DOES NOT COMPILE - var mixed with untyped
(var x, String y)   -> true  // DOES NOT COMPILE - var mixed with explicit type
(String x, y)       -> true  // DOES NOT COMPILE - explicit type mixed with untyped
```

---

#### Local variables inside a lambda body

A lambda body can be a full block, and that block can declare local variables:

```java
(a, b) -> { int c = 0; return 5; } // fine - c is a new local variable
```

You cannot redeclare a variable that already exists in the enclosing scope, including the
lambda's own parameters:

```java
(a, b) -> { int a = 0; return 5; } // DOES NOT COMPILE - a is already a parameter
```

##### Three errors in one block -- a worked example

```java
11: public void variables(int a) {
12:     int b = 1;
13:     Predicate<Integer> p1 = a -> {   // DOES NOT COMPILE - a already declared as method param
14:         int b = 0;                   // DOES NOT COMPILE - b already declared in enclosing scope
15:         int c = 0;
16:         return b == c; }             // DOES NOT COMPILE - missing semicolon after closing }
17: }
```

Three errors:
- Line 13: `a` is already a method parameter in this scope -- the lambda cannot reuse it
- Line 14: `b` is already a local variable in the enclosing method -- cannot redeclare it
- Line 16: the entire statement `Predicate<Integer> p1 = ...` is missing a semicolon after the closing `}`. The semicolon inside the block (after `return b == c`) belongs to the return statement, not to the variable declaration. The `}` ends the lambda block, but the declaration itself still needs `;`

The third error is the subtle one. When a lambda body is a block, the closing `}` does not
end the statement -- the variable declaration is still open and needs its own `;`.

##### Keep your lambdas short

A lambda with multiple lines and a return statement is a sign that the logic should be
extracted into a named method. Long lambda bodies are harder to read, and in Chapter 10
lambdas are chained together in method calls where brevity matters a lot.

Take this verbose lambda:

```java
Predicate<Integer> p1 = a -> {
    int c = 0;
    return a == c; // tests whether a equals 0
};
```

`Predicate<Integer>` has one abstract method `boolean test(Integer t)`. The lambda
body is the implementation of `test()` -- it takes an integer `a` and returns true if `a`
equals 0. The body is two lines just to do a simple comparison.

The logic can be extracted into a named method to clean it up:

```java
// extract the body into its own method in the same class
private boolean returnSame(int a) {
    return a == 0; // same logic as the lambda body above
}
```

Now the lambda body is a single call that forwards `a` straight to `returnSame`:

```java
Predicate<Integer> p1 = a -> returnSame(a);
// test(a) now just calls returnSame(a) and returns its boolean result
```

And since the lambda body is nothing but a direct forward of the parameter to one method,
it can be replaced with a method reference:

```java
Predicate<Integer> p1 = this::returnSame;
```

`this` here is the same `this` you already know from constructors and instance methods --
it refers to the current object. The only thing new is that you can use it on the left side
of `::` just like any other object reference. `this::returnSame` is a type 2 method
reference (instance method on a particular object), where the particular object is the
current instance of the enclosing class.

A full example makes this concrete:

```java
public class Validator {

    private boolean isPositive(int n) {
        return n > 0;
    }

    public void run() {
        Predicate<Integer> p1 = n -> isPositive(n);
        //                      ^    ^^^^^^^^^^^
        //                      |    the method being called -- on THIS object implicitly
        //                      the parameter passed to test()

        Predicate<Integer> p2 = this::isPositive;
        //                      ^^^^  ^^^^^^^^^^
        //                      |     the method to call
        //                      the object to call it on -- the current Validator instance
        //                      NOT the parameter. the parameter (n) is passed automatically
        //                      by Java when test() is invoked

        System.out.println(p1.test(5));  // true  - isPositive(5)  called on this Validator
        System.out.println(p2.test(-1)); // false - isPositive(-1) called on this Validator
    }
}
```

`this` is the receiver -- the object the method is called on. The parameter `n` is still
there, it is just hidden. When `test(5)` is called, Java calls `this.isPositive(5)` behind
the scenes. `this` is not `n`. `this` is the `Validator` object. `n` is the integer being
tested.

To make that separation completely clear, here is a second example with two separate
objects:

```java
public class Greeter {
    private String greeting;

    public Greeter(String greeting) {
        this.greeting = greeting;
    }

    public String greet(String name) {
        return greeting + ", " + name + "!";
    }

    public void run() {
        // this refers to THIS Greeter instance (greeting = "Hello")
        Function<String, String> f1 = this::greet;
        //                            ^^^^
        //                            the Greeter object whose greet() will be called
        //                            name (the parameter) is passed when apply() is invoked

        System.out.println(f1.apply("Alice")); // Hello, Alice!
    }
}

// somewhere else:
Greeter g1 = new Greeter("Hello");
Greeter g2 = new Greeter("Goodbye");

Function<String, String> f1 = g1::greet; // calls greet on g1 (greeting = "Hello")
Function<String, String> f2 = g2::greet; // calls greet on g2 (greeting = "Goodbye")

System.out.println(f1.apply("Alice")); // Hello, Alice!
System.out.println(f2.apply("Alice")); // Goodbye, Alice!
```

`g1`, `g2`, and `this` are all object references. `::` works with any of them. `this` is
just the name Java gives to the current object when you are inside one of its methods and
it has no variable name of its own.

All three versions implement `Predicate<Integer>` and do the same thing when `test()` is
called. The method reference is the most readable because it removes the parameter
variable entirely and just names the operation.

The progression to remember: if a lambda body is getting long, extract it into a method.
If the lambda then becomes a single call that just forwards its parameters, replace it with
a method reference.

---

#### Referencing variables from the surrounding scope

A lambda body can access variables from the enclosing scope under specific rules:

```java
public class Crow {
    private String color;

    public void caw(String name) {
        String volume = "loudly";
        Consumer<String> consumer = s ->
            System.out.println(name + " says "
                + volume + " that she is " + color);
    }
}
```

This compiles because `name`, `volume`, and `color` are all effectively final or instance
variables at the point the lambda uses them.

##### The effectively final requirement

Instance variables and static variables are always accessible from a lambda. Local variables
and method parameters are only accessible if they are `final` or effectively final (never
reassigned after being set).

The critical detail: the compile error appears at the lambda's use of the variable, not at
the reassignment. If a variable is reassigned anywhere in the method -- even after the
lambda -- the variable is not effectively final, and the lambda cannot use it:

```java
public class Crow {
    private String color;

    public void caw(String name) {
        String volume = "loudly";
        name = "Caty";      // line 6 - reassigned here
        color = "black";    // fine - instance variable, always allowed

        Consumer<String> consumer = s ->
            System.out.println(name + " says "   // DOES NOT COMPILE - name not effectively final
                + volume + " that she is " + color); // DOES NOT COMPILE - volume not effectively final
        volume = "softly";  // line 12 - reassigned here, but error is reported at the lambda above
    }
}
```

- `name` is reassigned on line 6, so it is not effectively final. The error is reported on
  line 10 where the lambda uses it, not on line 6 where it is reassigned.
- `volume` is reassigned on line 12 (after the lambda), but that still makes it not
  effectively final. The error is reported on line 11 where the lambda uses it -- before
  the reassignment line in the source code.
- `color` is an instance variable so no restriction applies.

##### Variable access rules (Table 8.8)

| Variable type     | Accessible from lambda?                  |
| ----------------- | ---------------------------------------- |
| Instance variable | Always                                   |
| Static variable   | Always                                   |
| Local variable    | Only if `final` or effectively final     |
| Method parameter  | Only if `final` or effectively final     |
| Lambda parameter  | Always (it belongs to the lambda itself) |
