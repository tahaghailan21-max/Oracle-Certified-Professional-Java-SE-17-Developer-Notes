# Chapter 7 - Beyond Classes: Review Questions
Date: 2026-09-15
Score: 20 / 30 (67%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | B, D        | B, D           | correct |
| 2  | A, B, D, E  | A, B, D, E     | correct |
| 3  | C           | C              | correct |
| 4  | C           | C              | correct |
| 5  | F           | E              | wrong   |
| 6  | D           | D, E           | wrong   |
| 7  | A           | E              | wrong   |
| 8  | A, B, C     | A, B, C        | correct |
| 9  | A, E, F     | A, E, F        | correct |
| 10 | B, C, E     | A, B, C, E     | wrong   |
| 11 | B           | B              | correct |
| 12 | A, B, E     | A, B, E        | correct |
| 13 | F           | F              | correct |
| 14 | A, C, D, E  | A, C, E        | wrong   |
| 15 | G           | G              | correct |
| 16 | E           | E              | correct |
| 17 | E, G        | E, G           | correct |
| 18 | E           | E              | correct |
| 19 | G           | G              | correct |
| 20 | A, D, F     | A, D, F        | correct |
| 21 | F           | F              | correct |
| 22 | C, D, G     | C, D, G        | correct |
| 23 | D           | D              | correct |
| 24 | B, E        | B, E           | correct |
| 25 | B           | B              | correct |
| 26 | G           | G              | correct |
| 27 | B, C, D, G  | B, C, D, G     | correct |
| 28 | B, D        | A, B, D        | wrong   |
| 29 | C           | F              | wrong   |
| 30 | G           | C, E           | wrong   |

---

## All Questions and Reasoning

### Q1 | Which of the following are valid record declarations?

```java
public record Iguana(int age) {
    private static final int age = 10; }
public final record Gecko() {}
public abstract record Chameleon() {
    private static String name; }
public record BeardedDragon(boolean fun) {
    @Override public boolean fun() { return false; } }
public record Newt(long size) {
    @Override public boolean equals(Object obj) { return false; }
    public void setSize(long size) {
        this.size = size;
    } }
```

Your reasoning: Iguana is wrong because we can't redeclare variables. Gecko is fine. Chameleon is wrong, we can't declare variables. BeardedDragon is fine because overriding methods is fine. Newt is wrong because variables are final and we try to reassign size.
Your answer: B, D
Correct answer: **B, D**

Iguana does not compile because it declares a static field with the same name as the record field `age` -- the record already generates a private instance field with that name, and naming conflict causes a compile error.

Chameleon does not compile for two reasons: records are implicitly `final` and cannot be marked `abstract`, and your reasoning about the variable is actually fine -- static fields are allowed in records. The `abstract` modifier alone kills it.

Newt does not compile because `setSize()` tries to assign `this.size = size`. Record fields are `final` and immutable -- setters that mutate fields are not permitted. Overriding `equals()` is fine as your reasoning noted.

BeardedDragon is valid -- overriding accessor methods is explicitly allowed in records.

---

### Q2 | Which of the following statements can be inserted in the blank line so that the code will compile successfully?

```java
interface CanHop {}
public class Frog implements CanHop {
    public static void main(String[] args) {
        _______ frog = new TurtleFrog();
    }
}
class BrazilianHornedFrog extends Frog {}
class TurtleFrog extends Frog {}
```

Your reasoning: Frog is the supertype so it's ok. TurtleFrog is ok too. BrazilianHornedFrog requires a cast. var is ok. CanHop is ok as Frog implements it and TurtleFrog inherits that.
Your answer: A, B, D, E
Correct answer: **A, B, D, E**

All correct. `BrazilianHornedFrog` is a sibling class to `TurtleFrog`, not a supertype, so it cannot hold a `TurtleFrog` reference without an explicit cast. `Long` is completely unrelated. `var` resolves to `TurtleFrog` which is valid.

---

### Q3 | What is the result of the following program?

```java
public class Favorites {
    enum Flavors {
        VANILLA, CHOCOLATE, STRAWBERRY
        static final Flavors DEFAULT = STRAWBERRY;
    }
    public static void main(String[] args) {
        for(final var e : Flavors.values())
            System.out.print(e.ordinal()+" ");
    }
}
```

Your reasoning: You have never seen that syntax and considered it a compile error.
Your answer: C
Correct answer: **C**

Correct. When an enum contains anything other than a plain list of values -- such as a field, constructor, or method -- a semicolon is required after the value list. `VANILLA, CHOCOLATE, STRAWBERRY` is not followed by a semicolon before `static final Flavors DEFAULT`. This is a single compile error, making C correct. If the semicolon were added, the program would print `0 1 2`.

---

### Q4 | What is the output of the following program?

```java
public sealed class ArmoredAnimal permits Armadillo {
    public ArmoredAnimal(int size) {}
    @Override public String toString() { return "Strong"; }
    public static void main(String[] a) {
        var c = new Armadillo(10, null);
        System.out.println(c);
    }
}
class Armadillo extends ArmoredAnimal {
    @Override public String toString() { return "Cute"; }
    public Armadillo(int size, String name) {
        super(size);
    }
}
```

Your reasoning: The subclass is missing `final`, `sealed`, or `non-sealed`.
Your answer: C
Correct answer: **C**

Correct. Every direct subclass of a sealed class must be marked `final`, `sealed`, or `non-sealed`. `Armadillo` has none of those modifiers, so the code does not compile.

---

### !! Q5 - WRONG !!

### Q5 | Which statements about the following program are correct?

```java
1: interface HasExoskeleton {
2:     double size = 2.0f;
3:     abstract int getNumberOfSections();
4: }
5: abstract class Insect implements HasExoskeleton {
6:     abstract int getNumberOfLegs();
7: }
8: public class Beetle extends Insect {
9:     int getNumberOfLegs() { return 6; }
10:    int getNumberOfSections(int count) { return 1; }
11: }
```

Your reasoning: Line 10 overloads `getNumberOfSections()` with a different parameter, which does not satisfy the abstract method requirement. You said line 10 is the error.
Your answer: F
Correct answer: **E**

You identified the right problem but pointed to the wrong line. Line 10 is valid Java -- declaring `getNumberOfSections(int count)` is a perfectly legal overloaded method. The issue is that `Beetle` is a concrete class but never provides an implementation of the zero-argument `getNumberOfSections()` inherited from `HasExoskeleton`. An overloaded version with a different parameter does not satisfy the abstract method requirement.

The compile error is on line 8 -- the `Beetle` class declaration itself. `Beetle` is concrete but leaves an abstract method unimplemented. Line 10 is not the error; it is just not helpful. Line 8 is the line that does not compile because of what is missing.

---

### !! Q6 - WRONG !!

### Q6 | Which statements about the following program are correct?

```java
1: public abstract interface Herbivore {
2:     int amount = 10;
3:     public void eatGrass();
4:     public abstract int chew() { return 13; }
5: }
6:
7: abstract class IsAPlant extends Herbivore {
8:     Object eatGrass(int season) { return null; }
9: }
```

Your reasoning: Line 4 has an abstract method with a body -- error. Line 8 overrides `eatGrass()` with an incompatible return type and reduces visibility from public to default -- error.
Your answer: D, F
Correct answer: **D, E**

You were right about D -- an abstract method cannot have a body.

For line 7, the error is the `extends` keyword. A class cannot `extends` an interface -- it must `implement` it. This is an absolute rule: class to interface always uses `implements`, never `extends`. Line 7 uses `extends Herbivore`, which does not compile. That is option E.

For line 8: you were on the right track about override issues, but the problem was upstream. Because line 7 does not compile, line 8 is irrelevant. The exam answer is D and E -- the keyword error on line 7, not an override issue on line 8.

---

### !! Q7 - WRONG !!

### Q7 | What is the output of the following program?

```java
1: interface Aquatic {
2:     int getNumOfGills(int p);
3: }
4: public class ClownFish implements Aquatic {
5:     String getNumOfGills() { return "14"; }
6:     int getNumOfGills(int input) { return 15; }
7:     public static void main(String[] args) {
8:         System.out.println(new ClownFish().getNumOfGills(-1));
9:     }
10: }
```

Your reasoning: Line 5 is a valid overload. Line 6 implements the interface method. Answer is 15 (option A) since -1 is an int argument.
Your answer: A
Correct answer: **E**

You got the output right (15) but missed the compile error. Line 6 implements `getNumOfGills(int)` from the interface. The interface declares it implicitly `public`. Line 6 uses no access modifier, meaning package (default) access. That is a reduction in visibility from `public` to package -- which is not allowed when implementing an interface method. The fix is to add `public` to line 6.

The rule: when implementing an interface method, you must match or increase visibility. You can never reduce it. Interface methods are implicitly `public`, so the implementing class must declare them `public` explicitly.

---

### Q8 | When inserted in order, which modifiers can fill in the blank to create a properly encapsulated class?

```java
public class Rabbits {
    ___ int numRabbits = 0;
    ___ void multiply() { numRabbits *= 6; }
    ___ int getNumberOfRabbits() { return numRabbits; }
}
```

Your reasoning: Encapsulation requires the field to be `private`. Methods can be any access level. Eliminated D. Any combination with `private` on the field works.
Your answer: A, B, C
Correct answer: **A, B, C**

Correct. The only hard requirement for encapsulation is that instance variables are `private`. Methods can use any access modifier. Option D fails because the field is `public`. Option E is wrong -- encapsulation has nothing to do with method naming conventions. Options A, B, and C all have `private` on the field, satisfying the requirement.

---

### Q9 | Which of the following statements can be inserted in the blank so that the code will compile successfully?

```java
abstract class Snake {}
class Cobra extends Snake {}
class GardenSnake extends Cobra {}
public class SnakeHandler {
    private Snake snakey;
    public void setSnake(Snake mySnake) { this.snakey = mySnake; }
    public static void main(String[] args) {
        new SnakeHandler().setSnake( _______ );
    }
}
```

Your reasoning: Snake is abstract, cannot be instantiated. Object is a supertype, not valid. String is unrelated. Cobra and GardenSnake are subtypes of Snake. null always works.
Your answer: A, E, F
Correct answer: **A, E, F**

All correct. The method accepts any `Snake` reference. `Cobra` and `GardenSnake` are subtypes and can be passed without casting. `null` is always a valid argument for any object reference type.

---

### !! Q10 - WRONG !!

### Q10 | What types can be inserted in the blanks on the lines marked X and Z that allow the code to compile?

```java
interface Walk { private static List move() { return null; } }
interface Run extends Walk { public ArrayList move(); }
class Leopard implements Walk {
    public _______ move() { // X
        return null;
    }
}
class Panther implements Run {
    public _______ move() { // Z
        return null;
    }
}
```

Your reasoning: `Walk`'s `move()` is private static so it is not inherited. Any valid return type works for X. `Run` declares `ArrayList move()` so Z must be `ArrayList` or a subtype.
Your answer: B, C, E
Correct answer: **A, B, C, E**

Your reasoning was correct. You missed A (Integer on line X). Because `Walk`'s `move()` is private and not inherited by `Leopard`, `Leopard.move()` is a brand new method with no inheritance constraint. The return type is completely free -- `Integer`, `ArrayList`, `List`, `String`, anything. A, B, and C are all valid for X.

For Z: `Run` declares `ArrayList move()`, which `Panther` must implement. The return type must be `ArrayList` or a subtype of `ArrayList`. E (`ArrayList`) is valid. D (`List`) is not -- `List` is a supertype of `ArrayList`, not a subtype, so it would not satisfy the covariant return type rule.

---

### Q11 | What is the result of the following code?

```java
1: public class Movie {
2:     private int butter = 5;
3:     private Movie() {}
4:     protected class Popcorn {
5:         private Popcorn() {}
6:         public static int butter = 10;
7:         public void startMovie() {
8:             System.out.println(butter);
9:         }
10:    }
11:    public static void main(String[] args) {
12:        var movie = new Movie();
13:        Movie.Popcorn in = new Movie().new Popcorn();
14:        in.startMovie();
15:    }
16: }
```

Your answer: B
Correct answer: **B**

Correct. Since Java 16, inner classes can contain static variables, so line 6 compiles. The private constructors are accessible from within the same outer class. Line 8 accesses `butter` -- the closest `butter` in scope is the static field on line 6 (value 10), not the outer class instance field (value 5). Output is 10.

---

### Q12 | Which of the following are true about encapsulation?

Your answer: A, B, E
Correct answer: **A, B, E**

Correct. Encapsulation allows getters and setters (A, B) and requires private instance variables (E). It does not require specific naming conventions (C is wrong) and explicitly forbids public instance variables (D is wrong).

---

### Q13 | What is the result of the following program?

```java
public class Weather {
    enum Seasons { WINTER, SPRING, SUMMER, FALL }
    public static void main(String[] args) {
        Seasons v = null;
        switch (v) {
            case Seasons.SPRING -> System.out.print("s");
            case Seasons.WINTER -> System.out.print("w");
            case Seasons.SUMMER -> System.out.print("m");
            default -> System.out.println("missing data");
        }
    }
}
```

Your answer: F
Correct answer: **F**

Correct. In a switch expression or statement using an enum, case labels must use the unqualified enum value name -- `SPRING`, not `Seasons.SPRING`. All three case labels use the qualified form, so all three are compile errors. More than one line does not compile, making F correct.

---

### !! Q14 - WRONG !!

### Q14 | Which statements about sealed classes are correct?

Your answer: A, C, D, E
Correct answer: **A, C, E**

D is wrong. The modifier is `non-sealed`, not `nonsealed`. It is a hyphenated keyword. The exam tested the exact spelling. `nonsealed` (without the hyphen) is not a valid Java keyword and the code would not compile. This is the kind of precision the exam tests on sealed classes.

A, C, and E are correct:
- A: a sealed interface does restrict which interfaces may extend it.
- C: a sealed class can be extended by an abstract class, as long as it is also marked `sealed`, `non-sealed`, or `final`.
- E: a sealed interface restricts which classes may implement it.

B is wrong: a `non-sealed` subclass allows indirect extension by unlisted classes -- so the statement "cannot be indirectly extended by a class not in the permits list" is false.
F is wrong: sealed classes can contain nested subclasses.

---

### Q15 | Which lines, when entered independently into the blank, allow the code to print "Not scared" at runtime?

```java
public class Ghost {
    public static void boo() { System.out.println("Not scared"); }
    protected final class Spirit {
        public void boo() { System.out.println("Booo!!!"); }
    }
    public static void main(String... haunt) {
        var g = new Ghost().new Spirit() {};
        _______;
    }
}
```

Your answer: G
Correct answer: **G**

Correct. `Spirit` is marked `final`, meaning it cannot be extended. The anonymous class `new Ghost().new Spirit() {}` tries to extend `Spirit` -- which is not allowed. The code does not compile at all, making G the only correct answer.

---

### Q16 | What is the result of compiling the following source file?

```java
1: public class Ostrich {
2:     private int count;
3:     static class OstrichWrangler {
4:         public int stampede() {
5:             return count;
6:         }
7:     }
8: }
```

Your answer: E
Correct answer: **E**

Correct. `OstrichWrangler` is a static nested class. Static nested classes have no outer instance reference, so they cannot access instance members of the enclosing class. `count` is an instance variable of `Ostrich`. Line 5 tries to access it directly -- compile error.

Two bytecode files are generated when it compiles (Ostrich.class and Ostrich$OstrichWrangler.class), but the code does not compile here.

---

### Q17 | Which lines of the following interface declarations do not compile?

```java
1: public interface Omnivore {
2:     int amount = 10;
3:     static boolean gather = true;
4:     static void eatGrass() {}
5:     int findMore() { return 2; }
6:     default float rest() { return 2; }
7:     protected int chew() { return 13; }
8:     private static void eatLeaves() {}
9: }
```

Your answer: E, G
Correct answer: **E, G**

Correct. Line 5 is a concrete method without `default`, `static`, or `private` -- it has a body but no valid modifier for a concrete interface method. Line 7 uses `protected`, which is not a valid access modifier for any interface member. All interface members must be `public` (implicit or explicit) or `private`.

---

### Q18 | What is printed by the following program?

```java
public class Deer {
    enum Food { APPLES, BERRIES, GRASS }
    protected class Diet {
        private Food getFavorite() { return Food.BERRIES; }
    }
    public static void main(String[] seasons) {
        System.out.print(switch(new Diet().getFavorite()) {
            case APPLES -> "a";
            case BERRIES -> "b";
            default -> "c";
        });
    }
}
```

Your answer: E
Correct answer: **E**

Correct. `Diet` is a non-static inner class. Instantiating it requires an instance of the outer `Deer` class. The `main()` method is static and has no `Deer` instance. `new Diet()` inside a static method does not compile. The fix would be `new Deer().new Diet()`.

---

### Q19 | Which of the following are printed by the Bear program?

```java
public class Bear {
    enum FOOD {
        BERRIES, INSECTS {
            public boolean isHealthy() { return true; }},
        FISH, ROOTS, COOKIES, HONEY;
        public abstract boolean isHealthy();
    }
    public static void main(String[] args) {
        System.out.print(FOOD.INSECTS);
        System.out.print(FOOD.INSECTS.ordinal());
        System.out.print(FOOD.INSECTS.isHealthy());
        System.out.print(FOOD.COOKIES.isHealthy());
    }
}
```

Your answer: G
Correct answer: **G**

Correct. `isHealthy()` is declared `abstract` in the enum, meaning every enum value must provide its own implementation. Only `INSECTS` provides one. `BERRIES`, `FISH`, `ROOTS`, `COOKIES`, and `HONEY` all fail to implement `isHealthy()`. The code does not compile.

---

### Q20 | Which statements about polymorphism and method inheritance are correct?

Your answer: A, D, F
Correct answer: **A, D, F**

Correct.
- A: for overridden methods, the runtime object determines which version runs -- you cannot know until runtime which subclass is actually there.
- D: `final` prevents overriding. `static` only prevents overriding (static methods are hidden instead), so D is the correct statement.
- F: hidden methods (static methods and variables) are resolved by the reference type at compile time.
- B is wrong: hidden methods are resolved by reference type, which is known at compile time.
- C is wrong: `static` prevents overriding but not hiding -- a subclass can still declare a static method with the same name.
- E is wrong: reference type determines hidden member access, but overridden method dispatch uses the runtime object.

---

### Q21 | Given the following record declaration, which lines of code can fill in the blank and allow the code to compile?

```java
public record RabbitFood(int size, String brand, LocalDate expires) {
    public static int MAX_STORAGE = 100;
    public RabbitFood() {
        _______;
    }
}
```

Your reasoning: You didn't remember if records could have variables, and guessed F.
Your answer: F
Correct answer: **F**

Correct, but for the right reason. This is an overloaded constructor (it has parentheses). The first line of an overloaded record constructor must be an explicit call to another constructor via `this()`. None of the options A through E call `this(...)`. They all attempt things in the body before `this()` has been called, which is not allowed. If the parentheses were removed (making it a compact constructor), then A, C, and E would be valid.

---

### Q22 | Which of the following can be inserted in the `rest()` method?

```java
public class Lion {
    class Cub {}
    static class Den {}
    static void rest() {
        _______;
    }
}
```

Your answer: C, D, G (with a note that you weren't sure if `Lion.new ...` syntax exists)
Correct answer: **C, D, G**

Correct. `rest()` is a static method, so it has no implicit `this`. Options:

- C: `new Lion().new Cub()` -- creates a Lion instance first, then creates a Cub on it. Valid.
- D: `var d = new Den()` -- Den is static, no outer instance needed. Valid.
- G: `new Lion.Den()` -- standard way to instantiate a static nested class from outside. Valid.
- A: `Lion.new Cub()` -- invalid syntax. You need an instance, not the class name.
- B: `new Lion().Cub()` -- invalid. `.Cub()` is not valid method call syntax for instantiation.
- E: `Lion.new Cub()` -- same as A, invalid syntax.
- F: `Lion.new Den()` -- `Den` is static, this syntax is for inner classes only. Invalid for static nested.
- H: `new Cub()` -- Cub is a non-static inner class. Cannot be instantiated from a static context without an outer Lion instance.

The `outerInstance.new InnerClass()` syntax is only for non-static inner classes, and requires an actual instance (not the class name).

---

### Q23 | What can be inserted into the blank line to print "Swim!" at runtime?

```java
interface Swim { default void perform() { System.out.print("Swim!"); } }
interface Dance { default void perform() { System.out.print("Dance!"); } }
public class Penguin implements Swim, Dance {
    public void perform() { System.out.print("Smile!"); }
    private void doShow() { _______ ; }
    public static void main(String[] eggs) { new Penguin().doShow(); }
}
```

Your answer: D
Correct answer: **D**

Correct. `Swim.super.perform()` is the only valid syntax to call a specific inherited default method. The Penguin class has overridden `perform()` to print "Smile!", so plain `perform()` or `super.perform()` would print "Smile!" or be ambiguous. `Swim.super.perform()` bypasses the override and calls Swim's default directly.

---

### Q24 | Which lines of the following interface do not compile?

```java
1: public interface BigCat {
2:     abstract String getName();
3:     static int hunt() { getName(); return 5; }
4:     default void climb() { rest(); }
5:     private void roar() { getName(); climb(); hunt(); }
6:     private static boolean sneak() { roar(); return true; }
7:     private int rest() { return 2; };
8: }
```

Your answer: B, E
Correct answer: **B, E**

Correct.

Line 3: `hunt()` is `static`. `getName()` is an abstract instance method. A static method has no instance, so it cannot call instance methods. Compile error.

Line 6: `sneak()` is `private static`. `roar()` is `private` (non-static instance method). A static method cannot call a non-static method without an instance reference. Compile error.

The rest compile without issue -- default and private instance methods can call each other and can call abstract methods freely.

---

### Q25 | What does the following program print?

```java
1: public class Zebra {
2:     private int x = 24;
3:     public int hunt() {
4:         String message = "x is ";
5:         abstract class Stripes {
6:             private int x = 0;
7:             public void print() {
8:                 System.out.print(message + Zebra.this.x);
9:             }
10:        }
11:        var s = new Stripes() {};
12:        s.print();
13:        return x;
14:    }
15:    public static void main(String[] args) {
16:        new Zebra().hunt();
17:    }
18: }
```

Your answer: E (line 11 generates a compiler error)
Correct answer: **B (x is 24)**

Your reasoning was that line 11 creates an anonymous class from an abstract local class -- which you thought was not allowed. It is actually valid. An abstract local class is just like an abstract class anywhere else: it can be subclassed. An anonymous class is exactly an unnamed subclass. `new Stripes() {}` creates an anonymous class that extends the abstract local class `Stripes` and provides no additional implementation -- which is fine since `Stripes` has no abstract methods itself.

`Zebra.this.x` uses the qualified this syntax to reach `Zebra`'s private field `x = 24`. `message` is `final` effectively (never reassigned). The print outputs `x is 24`.

---

### Q26 | Which statements about the following enum are true?

```java
1: public enum Animals {
2:     MAMMAL(true), INVERTEBRATE(Boolean.FALSE), BIRD(false),
3:     REPTILE(false), AMPHIBIAN(false), FISH(false) {
4:         public int swim() { return 4; }
5:     }
6:     final boolean hasHair;
7:     public Animals(boolean hasHair) {
8:         this.hasHair = hasHair;
9:     }
10:    public boolean hasHair() { return hasHair; }
11:    public int swim() { return 0; }
12: }
```

Your reasoning: `Boolean.FALSE` is a little suspicious. Otherwise thought it was G.
Your answer: G (with uncertainty -- leaning toward A)
Correct answer: **C, F**

Two errors you missed:

**Line 7 -- C:** Enum constructors are implicitly `private`. Writing `public` on an enum constructor is a compile error. The constructor must be `private` or have no access modifier at all.

**Line 5/missing semicolon -- F:** The enum value list must end with a semicolon when anything else follows (fields, constructors, methods). After `FISH(false) { ... }` on line 3-5, there is no semicolon before the field declaration on line 6. The missing semicolon is a compile error. The book flags "another line" (line 5 specifically, the closing brace of FISH's body) for this.

`Boolean.FALSE` is fine -- it is a valid `Boolean` wrapper object that unboxes to `false`. No issue there.

---

### Q27 | Which components does the compiler always insert for a record with at least one field?

Your answer: B, C, D, G
Correct answer: **B, C, D, G**

Correct. The compiler generates:
- B: an accessor method for each field (named after the field, no `get` prefix)
- C: `toString()`
- D: `equals()`
- G: `hashCode()`

A is wrong: a no-argument constructor is only generated if the record has no fields. E is wrong: records are immutable, no setters. F is wrong: no sort method exists.

---

### !! Q28 - WRONG !!

### Q28 | Which of the following classes and interfaces do not compile?

```java
public abstract class Camel { void travel(); }
public interface EatsGrass { private abstract int chew(); }
public abstract class Elephant {
    abstract private class SleepsAlot { abstract int sleep(); } }
public class Eagle { abstract soar(); }
public interface Spider { default void crawl() {} }
```

Your reasoning: `EatsGrass` does not compile because private methods cannot be abstract. `Eagle` does not compile because it is a concrete class with an abstract method.
Your answer: B, D
Correct answer: **A, B, D**

You missed A. `Camel` is an abstract class with `void travel()` -- a method that has no body and is not marked `abstract`. Inside a class (even an abstract class), a method without a body must be explicitly marked `abstract`. Without the keyword, this is simply an invalid method declaration. Compile error in `Camel`.

Your B and D reasoning was correct.

`Elephant` compiles -- an abstract class can contain an abstract inner class, and that inner class can have abstract methods. `Spider` compiles -- default methods with a body are valid in interfaces.

---

### !! Q29 - WRONG !!

### Q29 | How many lines of the following program contain a compilation error?

```java
1:  class Primate {
2:      protected int age = 2;
3:      { age = 1; }
4:      public Primate() {
5:          this().age = 3;
6:      }
7:  }
8:  public class Orangutan {
9:      protected int age = 4;
10:     { age = 5; }
11:     public Orangutan() {
12:         this().age = 6;
13:     }
14:     public static void main(String[] bananas) {
15:         final Primate x = (Primate)new Orangutan();
16:         System.out.println(x.age);
17:     }
18: }
```

Your reasoning: `Orangutan` does not extend `Primate`, so the cast on line 15 fails at runtime with a ClassCastException.
Your answer: C
Correct answer: **F (3 compilation errors)**

You spotted one problem (the cast on line 15) but misidentified it as a runtime exception rather than a compile error. The compiler knows at compile time that `Orangutan` and `Primate` are completely unrelated classes -- neither extends the other. Casting between unrelated types is rejected at compile time, not at runtime. That is error 1 (line 15).

Lines 5 and 12 both use `this()` as if it were a method call on an object -- `this().age = 3`. `this()` is constructor delegation syntax. It can only appear as the first statement inside a constructor, and it cannot be used as an expression or have `.age` chained onto it. These are compile errors. That is error 2 (line 5) and error 3 (line 12).

Three compilation errors total -- option F.

---

### !! Q30 - WRONG !!

### Q30 | Assuming the following classes are declared as top-level types in the same file, which classes contain compiler errors?

```java
sealed class Bird {
    public final class Flamingo extends Bird {}
}
sealed class Monkey {}
class EmperorTamarin extends Monkey {}
non-sealed class Mandrill extends Monkey {}
sealed class Friendly extends Mandrill permits Silly {}
final class Silly {}
```

Your answer: G (all compile)
Correct answer: **C, E**

Two errors you missed:

**EmperorTamarin -- C:** `EmperorTamarin` extends the sealed class `Monkey`. Every direct subclass of a sealed class must be marked `final`, `sealed`, or `non-sealed`. `EmperorTamarin` has none of these modifiers. Compile error.

**Friendly -- E:** `Friendly` is a sealed class that `permits Silly`. The `permits` clause means `Silly` must extend `Friendly`. But `Silly` is declared as `final class Silly {}` with no `extends` clause at all -- it does not extend `Friendly`. The `permits` clause demands the listed class actually extends the sealed class. Since `Silly` does not, `Friendly` does not compile. Note: the compile error is in `Friendly`, not `Silly`. `Silly` itself is a valid standalone class.

`Bird` and `Flamingo` compile -- the `permits` clause is optional when the subclass is nested inside the sealed class. `Flamingo` is nested and extends `Bird`, which satisfies the requirement. `Monkey` and `Mandrill` compile -- `permits` is optional when subclasses are in the same file, and `Mandrill` uses `non-sealed`.

---

## Concepts to Restudy

---

### Compile Error vs. ClassCastException -- The Compiler Knows More Than You Think

The compiler rejects casts between unrelated types outright -- it does not defer to runtime. If there is no inheritance path between two types, the cast is rejected at compile time.

```java
class Primate {}
class Orangutan {}  // does not extend Primate

Primate x = (Primate) new Orangutan(); // DOES NOT COMPILE
                                        // compiler sees unrelated types immediately
```

A `ClassCastException` only happens at runtime when the types are related (one is a supertype of the other) but the actual object is not the target type:

```java
class Primate {}
class Lemur extends Primate {}
class Orca extends Primate {}

Primate p = new Orca();
Lemur l = (Lemur) p; // compiles - Lemur and Orca share the Primate parent
                     // throws ClassCastException at runtime - object is Orca, not Lemur
```

The rule: if the compiler can prove the cast is impossible (no relationship), it fails at compile time. If the cast is possible in theory but wrong for this specific object, it fails at runtime.

---

### `this()` Is Constructor Delegation -- Not a Method Call

`this()` has one specific meaning: call another constructor in the same class. It is not a method, it is not an expression, and it cannot be used like one.

```java
public Primate() {
    this().age = 3;  // DOES NOT COMPILE - this() is not an expression
                     // you cannot chain .age onto a constructor call
}
```

Valid uses of `this()`:
```java
public Primate() {
    this(5);         // fine - calls Primate(int), must be first statement
}
```

Valid uses of `this` (without parentheses):
```java
public Primate(int age) {
    this.age = age;  // fine - this refers to the current instance
}
```

`this()` with parentheses = constructor call. `this` without parentheses = instance reference. They are completely different things.

---

### Abstract Methods in Classes Must Be Explicitly Marked `abstract`

Inside a class (abstract or not), a method without a body must be explicitly marked `abstract`. The class being abstract does not make its methods abstract by default.

```java
public abstract class Camel {
    void travel();          // DOES NOT COMPILE - no body, no abstract keyword
    abstract void travel(); // fine - explicitly abstract
}
```

This is the opposite of interfaces, where methods without a body are implicitly abstract. In a class, you must write the keyword. Always.

---

### Enum Constructors Are Implicitly Private

Enum constructors are always private. Writing `public` or `protected` on an enum constructor is a compile error.

```java
public enum Animals {
    MAMMAL(true);
    public Animals(boolean hasHair) {}  // DOES NOT COMPILE - cannot be public
    private Animals(boolean hasHair) {} // fine - private is the implicit modifier
    Animals(boolean hasHair) {}         // also fine - implicitly private
}
```

---

### Sealed Class Errors -- The Permits Contract Is Bidirectional

When you write `permits Silly`, you are making a contract: `Silly` is allowed to extend this sealed class AND must extend it. If `Silly` does not extend the sealed class, the sealed class with the `permits` clause does not compile.

```java
sealed class Friendly permits Silly {}
final class Silly {}               // Silly does not extend Friendly
// Friendly does not compile - Silly is listed in permits but does not extend Friendly
// Silly itself compiles fine
```

The error lives in the sealed class, not in `Silly`. `Silly` is just an innocent bystander that happens to be named.

---

### `non-sealed` Is Hyphenated -- Exact Spelling Required

`non-sealed` is a keyword with a hyphen. `nonsealed` (without the hyphen) is not a valid Java keyword and will cause a compile error. The exam tests this.

```java
public non-sealed class Panda extends Bear {} // correct
public nonsealed class Panda extends Bear {}  // DOES NOT COMPILE
```

---

## Thoughts and Advice

67% is a solid improvement on the chapter complexity. Chapter 7 is one of the densest in the book, and you held together well on the big conceptual sections -- polymorphism, records, interfaces, enums. The wrong answers were concentrated in edge cases and precision, not in misunderstanding the fundamentals.

**The compile-time vs. runtime distinction keeps tripping you up (Q29).** You saw the cast between unrelated types and called it a ClassCastException -- but unrelated types are caught by the compiler, not the JVM. The rule: if the compiler can see no possible relationship, it fails at compile time. ClassCastException only happens when the relationship exists in theory but the specific object is wrong. This distinction came up multiple times across chapters -- it is worth treating it as a dedicated rule to memorise.

**`this()` syntax (Q29).** You know `this()` calls another constructor. But the exam tested whether you know it cannot be used as an expression. `this().age = 3` is nonsense syntax -- constructor calls are statements, not expressions that return an object reference. The moment you see `this()` used as anything other than the first statement in a constructor, it is a compile error.

**Sealed class mechanics (Q30).** You knew the subclass modifier rule but missed two applications: the missing modifier on `EmperorTamarin`, and the `Friendly`/`Silly` permits-without-extends trap. For sealed classes, always check both directions: does the subclass have the required modifier, and does every class in the `permits` list actually extend the sealed class?

**Enum constructor access (Q26).** The `public` keyword on an enum constructor is a compile error. This is a small rule but the exam tests it precisely because it looks almost right -- you just swapped `private` for `public`.

**Record compile errors (Q5 pointing to wrong line, Q7 missing the access modifier).** In Q5 you identified the right problem but answered with the wrong line. The compile error is always on the class declaration when an abstract method is unimplemented. In Q7 you got the output right but missed that the method needs `public` to implement the interface correctly. Interface methods are implicitly public -- implementing them with default access is a visibility reduction.

The strong chapters were polymorphism and method overriding, nested classes, and records. Those came through clearly. The gaps are in small precise rules around sealed classes, enums, and when compile errors vs. runtime exceptions occur.
