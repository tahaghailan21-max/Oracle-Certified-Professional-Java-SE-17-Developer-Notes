# Chapter 6 - Class Design: Review Questions
Date: 2026-09-13
Score: 10 / 26 (38%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | A, B, E     | E              | wrong   |
| 2  | B, F        | A, B, F        | wrong   |
| 3  | B, C        | B, C           | correct |
| 4  | F           | F              | correct |
| 5  | C           | E              | wrong   |
| 6  | A, D        | D, E           | wrong   |
| 7  | A           | A              | correct |
| 8  | D           | D              | correct |
| 9  | C, E        | B, E           | wrong   |
| 10 | A, C, G     | A, C           | wrong   |
| 11 | F           | C              | wrong   |
| 12 | C           | C              | correct |
| 13 | A, G        | A, G           | correct |
| 14 | B, C, D, E, F | B, E, F      | wrong   |
| 15 | B           | C              | wrong   |
| 16 | D           | D              | correct |
| 17 | C, E, F     | C, F           | wrong   |
| 18 | C, D, F     | D, F           | wrong   |
| 19 | E           | F              | wrong   |
| 20 | E           | E              | correct |
| 21 | B, F, G     | B, G           | wrong   |
| 22 | B           | D              | wrong   |
| 23 | (no answer) | B              | wrong   |
| 24 | B           | C              | wrong   |
| 25 | B, C        | B, C           | correct |
| 26 | (no answer) | D              | wrong   |

---

## All Questions and Reasoning

### Q1 | Which code can be inserted to have the code print 2?

```java
public class BirdSeed {
    private int numberBags;
    boolean call;
    public BirdSeed() {
        // LINE 1
        call = false;
        // LINE 2
    }
    public BirdSeed(int numberBags) {
        this.numberBags = numberBags;
    }
    public static void main(String[] args) {
        var seed = new BirdSeed();
        System.out.print(seed.numberBags);
    }
}
```

A. Replace line 1 with `BirdSeed(2);`
B. Replace line 2 with `BirdSeed(2);`
C. Replace line 1 with `new BirdSeed(2);`
D. Replace line 2 with `new BirdSeed(2);`
E. Replace line 1 with `this(2);`
F. Replace line 2 with `this(2);`
G. The code prints 2 without any changes.

Your reasoning: G is wrong. A and B will print 2. F is wrong because `this()` must be first. E is fine. C and D create a new object so they won't affect the one in main.
Your answer: A, B, E
Correct answer: **E**

### !! Q1 - WRONG !!

You got E right, but you included A and B -- those do not compile. `BirdSeed(2)` without `new` is not a valid statement. It looks like a method call, but there is no method named `BirdSeed` -- only a constructor. Constructors are not callable like regular methods. The only ways to call another constructor from inside a constructor are `this()` (same class) and `super()` (parent class).

```java
public BirdSeed() {
    BirdSeed(2);  // DOES NOT COMPILE - not a valid method call or constructor call
}
```

C and D are correct in your reasoning -- they create a separate object and the one in main stays unaffected, printing 0.
F is wrong because `this()` must be the first statement, and LINE 2 is after a real statement (`call = false`).
E is the only correct answer.

---

### Q2 | Which modifier pairs can be used together in a method declaration?

A. `static` and `final`
B. `private` and `static`
C. `static` and `abstract`
D. `private` and `abstract`
E. `abstract` and `final`
F. `private` and `final`

Your reasoning: `abstract` can't be used with `static`, `private`, or `final`. So B and F.
Your answer: B, F
Correct answer: **A, B, F**

### !! Q2 - WRONG !!

You missed A. `static` and `final` together is perfectly legal. There is no conflict: `final` means the method cannot be overridden (or in this case hidden), and `static` means it belongs to the class rather than an instance. They do not contradict each other.

The actual rule is only that `abstract` cannot be combined with `static`, `private`, or `final` -- because all three of those prevent a subclass from ever providing an implementation, making the `abstract` contract impossible to fulfil. `static` and `final` have no such conflict with each other.

| Pair | Legal? | Reason |
|---|---|---|
| `static final` | Yes | No conflict |
| `private static` | Yes | No conflict |
| `private final` | Yes | Redundant but allowed |
| `static abstract` | No | Static cannot be overridden |
| `private abstract` | No | Private not inherited, can't be implemented |
| `abstract final` | No | Final prevents overriding |

---

### Q3 | Which of the following statements about methods are true?

A. Overloaded methods must have the same signature.
B. Overridden methods must have the same signature.
C. Hidden methods must have the same signature.
D. Overloaded methods must have the same return type.
E. Overridden methods must have the same return type.
F. Hidden methods must have the same return type.

Your answer: B, C
Correct answer: **B, C**

No issues here. Overloaded methods have the same name but a different parameter list -- different signature, any return type. Overridden and hidden methods must have the same signature. Both overridden and hidden methods can have covariant (narrower) return types, so E and F are false.

---

### Q4 | What is the output of the following program?

```java
class Mammal {
    private void sneeze() {}
    public Mammal(int age) {
        System.out.print("Mammal");
    }
}
public class Platypus extends Mammal {
    int sneeze() { return 1; }
    public Platypus() {
        System.out.print("Platypus");
    }
    public static void main(String[] args) {
        new Mammal(5);
    }
}
```

Your reasoning: main creates a new Mammal, prints Mammal. Platypus won't compile because Mammal has no no-arg constructor so line 9's Platypus constructor can't implicitly call super().
Your answer: F
Correct answer: **F**

Correct. `sneeze()` in `Platypus` is a redeclaration, not an override (the parent's version is private and not inherited), so the different return type is fine. The compile error is in the `Platypus` constructor: the compiler tries to insert `super()` but `Mammal` has no no-arg constructor.

---

### Q5 | Which of the following complete the constructor so that this code prints out 50?

```java
class Speedster {
    int numSpots;
}
public class Cheetah extends Speedster {
    int numSpots;
    public Cheetah(int numSpots) {
        // INSERT CODE HERE
    }
    public static void main(String[] args) {
        Speedster s = new Cheetah(50);
        System.out.print(s.numSpots);
    }
}
```

A. `numSpots = numSpots;`
B. `numSpots = this.numSpots;`
C. `this.numSpots = numSpots;`
D. `numSpots = super.numSpots;`
E. `super.numSpots = numSpots;`
F. The code does not compile regardless of the code inserted.

Your reasoning: Cheetah hides Speedster's numSpots. C assigns 50 to Cheetah's copy.
Your answer: C
Correct answer: **E**

### !! Q5 - WRONG !!

You correctly identified that variable hiding is happening -- both Speedster and Cheetah have their own separate `numSpots`. That part of your reasoning was right. But then you stopped at C without asking which `numSpots` the main method is actually printing.

The key is the reference type in main: `Speedster s = new Cheetah(50)`. The variable `s` is declared as `Speedster`. Variable access is resolved by the compile-time reference type, not the runtime object. So `s.numSpots` reads Speedster's copy, not Cheetah's.

C assigns 50 to `this.numSpots` -- Cheetah's copy. But main prints Speedster's copy, which was never touched. It prints 0.

E assigns 50 to `super.numSpots` -- Speedster's copy. That is exactly what main reads. It prints 50.

| Option | What it does | What prints |
|---|---|---|
| A | assigns param to itself | 0 (Speedster's copy untouched) |
| B | assigns Cheetah's 0 to param | 0 |
| C | assigns 50 to Cheetah's copy | 0 (main reads Speedster's) |
| D | assigns Speedster's 0 to param | 0 |
| E | assigns 50 to Speedster's copy | **50** |

When variables are hidden, always trace which copy the specific reference type will read.

---

### Q6 | Which of the following declare immutable classes?

```java
public final class Moose {
    private final int antlers;
}

public class Caribou {
    private int antlers = 10;
}

public class Reindeer {
    private final int antlers = 5;
}

public final class Elk {}

public final class Deer {
    private final Object o = new Object();
}
```

Your reasoning: Moose looks perfect but antlers isn't initialized. Caribou could have a method reassign antlers. Reindeer isn't final. Elk looks fine. Deer has a mutable Object but no getter so it can't be accessed.
Your answer: A, D
Correct answer: **D, E**

### !! Q6 - WRONG !!

You correctly spotted that Caribou and Reindeer are not immutable (not `final` classes). You also correctly spotted Elk. But two errors:

**Moose does not compile.** A `private final int antlers` is never assigned. `final` instance variables get no default value -- they must be explicitly assigned at declaration, in an instance initializer, or in a constructor. Moose has none of those. Compile error. It is not a valid class at all, let alone an immutable one.

**Deer is immutable.** `Object o` is `private final` and there is no getter. The caller has zero way to access or modify `o`. Yes, `Object` itself is mutable, but a mutable object you can never reach is effectively immutable from the outside. Immutability is about what the caller can do -- if there is no path to the field, it does not matter what type it is.

A key insight: an immutable class does not need any fields at all (Elk proves this). And a field being a mutable type is only a problem if the caller can get a reference to it.

---

### Q7 | What is the output of the following code?

```java
class Arthropod {
    protected void printName(long input) { System.out.print("Arthropod"); }
    void printName(int input) { System.out.print("Spooky"); }
}
public class Spider extends Arthropod {
    protected void printName(int input) { System.out.print("Spider"); }
    public static void main(String[] args) {
        Arthropod a = new Spider();
        a.printName((short)4);
        a.printName(4);
        a.printName(5L);
    }
}
```

Your reasoning: short widens to int, Spider prints. int calls Spider again. long calls Arthropod.
Your answer: A
Correct answer: **A**

Correct. The `printName(int)` method in Arthropod has package access and Spider overrides it with `protected` -- that is allowed (more permissive). Polymorphism dispatches to Spider's version for lines 14 and 15. Line 16 passes a `long`, which matches `printName(long)` in Arthropod -- Spider has no `long` version to override it with.

---

### Q8 | What is the result of the following code?

```java
abstract class Bird {
    private final void fly() { System.out.println("Bird"); }
    protected Bird() { System.out.print("Wow-"); }
}
public class Pelican extends Bird {
    public Pelican() { System.out.print("Oh-"); }
    protected void fly() { System.out.println("Pelican"); }
    public static void main(String[] args) {
        var chirp = new Pelican();
        chirp.fly();
    }
}
```

Your reasoning: fly() in Bird is private, so Pelican redeclares it rather than overriding. Constructor chain prints Wow-Oh-. chirp's type is resolved as Pelican by var, so chirp.fly() calls Pelican's version.
Your answer: D
Correct answer: **D**

Correct. Two things to note: the `private final` on `Bird.fly()` is redundant (private methods cannot be inherited or overridden regardless of final) but legal. And because `var` resolves to `Pelican`, `chirp.fly()` calls Pelican's version -- if the reference type were `Bird`, `fly()` would not even be accessible (it is private).

---

### Q9 | Which of the following statements about overridden methods are true?

A. An overridden method must have parameters that are the same or covariant with the inherited method.
B. An overridden method may declare a new exception, provided it is not checked.
C. An overridden method must be more accessible than the method in the parent class.
D. An overridden method may declare a broader checked exception.
E. If an inherited method returns void, the overridden version must return void.

Your reasoning: A is wrong (params must match exactly, no covariant params). B sounds incomplete. C is true. D is false. E is true.
Your answer: C, E
Correct answer: **B, E**

### !! Q9 - WRONG !!

**C is wrong.** An overridden method must be the same or more accessible -- not strictly more accessible. If the parent method is `public`, the override must also be `public`. It does not need to be even more permissive than the parent. "Must be more accessible" implies the override has to go up in visibility, which is not true -- it can stay the same.

**B is correct.** An overridden method cannot throw new or broader checked exceptions. But it can freely throw new unchecked exceptions (RuntimeException and subclasses) because unchecked exceptions are not part of the checked exception rules. B specifically says "provided it is not checked" -- that is the exact condition that makes it legal.

| Exception scenario | Allowed in override? |
|---|---|
| Same checked exception | Yes |
| Narrower checked exception | Yes |
| No exception | Yes |
| Broader checked exception | No |
| New checked exception | No |
| New unchecked exception | Yes |

---

### Q10 | Which of the following pairs allow the code to compile?

```java
public class Howler {
    public Howler(long shadow) {
        ;           // LINE 3
    }
    private Howler(int moon) {
        super();
    }
}
class Wolf extends Howler {
    protected Wolf(String stars) {
        super(2L);
    }
    public Wolf() {
        ;           // LINE 14
    }
}
```

A. `this(3)` at line 3, `this("")` at line 14
B. `this()` at line 3, `super(1)` at line 14
C. `this((short)1)` at line 3, `this(null)` at line 14
D. `super()` at line 3, `super()` at line 14
E. `this(2L)` at line 3, `super((short)2)` at line 14
F. `this(5)` at line 3, `super(null)` at line 14
G. Remove lines 3 and 14.

Your answer: A, C, G
Correct answer: **A, C**

### !! Q10 - WRONG !!

G does not compile. If you remove line 14, `Wolf()` has no explicit `super()` or `this()` call. The compiler inserts `super()` automatically. But `Howler` has no no-argument constructor -- it only has `Howler(long)` and `Howler(int)`. The inserted `super()` has nowhere to go. Compile error.

A and C are both correct:
- A: `this(3)` in Howler calls `Howler(int moon)` (int matches). `this("")` in Wolf calls `Wolf(String stars)` which calls `super(2L)` which calls `Howler(long)`. Valid chain.
- C: `this((short)1)` widens to int, calls `Howler(int moon)`. `this(null)` in Wolf matches `Wolf(String stars)` (null is compatible with String). Valid chain.

The moment you see a class with no no-arg constructor, any constructor that does not explicitly call `super(...)` with matching args will fail -- even G, which looks like it removes the problem rather than fixing it.

---

### Q11 | What is the result of the following?

```java
public class PolarBear {
    StringBuilder value = new StringBuilder("t");
    { value.append("a"); }
    { value.append("c"); }
    private PolarBear() {
        value.append("b");
    }
    public PolarBear(String s) {
        this();
        value.append(s);
    }
    public PolarBear(CharSequence p) {
        value.append(p);
    }
    public static void main(String[] args) {
        Object bear = new PolarBear();
        bear = new PolarBear("f");
        System.out.println(((PolarBear)bear).value);
    }
}
```

Your answer: F (does not compile)
Correct answer: **C (tacbf)**

### !! Q11 - WRONG !!

The code compiles and runs fine. You said it tries to instantiate PolarBear with a constructor that doesn't exist -- but `main()` is inside the same class as the private constructor. A `static` method in the same class can access private constructors directly. This is exactly the same reason you can have a singleton pattern with a private constructor and a `static getInstance()` method in the same class.

Line 16: `new PolarBear()` calls the private constructor. Value builds: field init sets `t`, initializers append `a` and `c` -> `tac`, constructor appends `b` -> `tacb`. `bear` is assigned this object.

Line 17: `new PolarBear("f")` -- `String` is more specific than `CharSequence`, so `PolarBear(String s)` is called. Value builds again: `tac` (field + initializers), `this()` runs appending `b` -> `tacb`, then `s` ("f") appended -> `tacbf`. `bear` is reassigned to this second object.

Line 18: prints `tacbf`. Answer C.

The private constructor being called from `main()` inside the same class is the key trap here.

---

### Q12 | How many lines contain a compilation error?

```java
public class Rodent {
    public Rodent(Integer x) {}
    protected static Integer chew() throws Exception {
        System.out.println("Rodent is chewing");
        return 1;
    }
}
class Beaver extends Rodent {
    public Number chew() throws RuntimeException {
        System.out.println("Beaver is chewing on wood");
        return 2;
    }
}
```

Your reasoning: line 2 has a return type error. Line 9 has a broader return type and is non-static overriding static.
Your answer: C (2 lines)
Correct answer: **C**

Correct, though your line 2 reasoning was wrong -- that was not a compile error. The actual three errors are all on line 8/9:

1. `Beaver` has no constructor with an explicit `super()`. `Rodent` has no no-arg constructor (only `Rodent(Integer x)`). Compile error on the `Beaver` class declaration.
2. `Number` is not covariant with `Integer` -- `Number` is a supertype of `Integer`, not a subtype. Return type rule violated.
3. `chew()` is `static` in `Rodent` but not `static` in `Beaver`. You cannot hide a static method with an instance method. Rule 5 violated.

Three errors on two lines (the class declaration line and line 9), making the answer C.

---

### Q13 | Which classes compile and include a default constructor created by the compiler?

Your reasoning: A has no constructor so gets one. B and C have methods with missing return types (not constructors -- name doesn't match class). D has its own constructor. E and F have constructors. G has a method, not a constructor, so compiler adds one.
Your answer: A, G
Correct answer: **A, G**

Correct on both counts. `bird()` in G is a method (lowercase b, return type `Bird`) -- not a constructor. Since there are no constructors, the compiler inserts one.

---

### Q14 | Which of the following statements about inheritance are correct?

A. A class can directly extend any number of classes.
B. A class can implement any number of interfaces.
C. All variables inherit java.lang.Object.
D. If class A is extended by B, then B is a superclass of A.
E. If class C implements interface D, then C is a subtype of D.
F. Multiple inheritance is the property of a class to have multiple direct superclasses.

Your answer: B, C, D, E, F
Correct answer: **B, E, F**

### !! Q14 - WRONG !!

**C is wrong.** Variables do not inherit anything. Only classes and interfaces participate in inheritance hierarchies. `java.lang.Object` is the root of the class hierarchy -- primitive variables (`int`, `boolean`, etc.) are not classes and do not inherit from `Object`. Reference variables hold references to objects, but the variables themselves are not objects.

**D is wrong.** If A is extended by B, then B is a **subclass** of A, not a superclass. You had it backwards. A is the superclass; B is the subclass. The class being extended is the parent/superclass. The class doing the extending is the child/subclass.

---

### Q15 | Which statements about the following program are correct?

```java
abstract class Nocturnal {
    boolean isBlind();
}
public class Owl extends Nocturnal {
    public boolean isBlind() { return false; }
    public static void main(String[] args) {
        var nocturnal = (Nocturnal)new Owl();
        System.out.println(nocturnal.isBlind());
    }
}
```

Your answer: B (compiles, prints false)
Correct answer: **C (does not compile because of line 2)**

### !! Q15 - WRONG !!

Line 2 is `boolean isBlind();` inside an abstract class -- but it is not marked `abstract`. A method with no body and no `abstract` modifier inside a class (even an abstract class) is a compile error. Abstract classes are allowed to have abstract methods, but they must be explicitly marked `abstract`. A method without a body and without `abstract` is simply invalid.

If line 2 were `abstract boolean isBlind();`, the code would compile and print `false`. The missing `abstract` keyword is the entire issue.

This is a common exam trap: an abstract class that contains a method declaration without a body but also without the `abstract` keyword. Always check for that modifier.

---

### Q16 | What is the result of the following?

```java
class Arachnid {
    static StringBuilder sb = new StringBuilder();
    { sb.append("c"); }
    static { sb.append("u"); }
    { sb.append("r"); }
}
public class Scorpion extends Arachnid {
    static { sb.append("q"); }
    { sb.append("m"); }
    public static void main(String[] args) {
        System.out.print(Scorpion.sb + " ");
        System.out.print(Scorpion.sb + " ");
        new Arachnid();
        new Scorpion();
        System.out.print(Scorpion.sb);
    }
}
```

Your answer: D
Correct answer: **D**

Correct. The trace:
1. Class init: Arachnid static block -> `u`. Scorpion static block -> `uq`.
2. Lines 13-14 print `uq uq `.
3. `new Arachnid()`: instance initializers run in file order -> `c`, `r`. sb = `uqcr`.
4. `new Scorpion()`: Arachnid instance initializers run first -> `c`, `r`. Then Scorpion's -> `m`. sb = `uqcrcrm`.
5. Line 17 prints `uqcrcrm`.

Final output: `uq uq uqcrcrm`.

---

### Q17 | Which of the following are true?

A. `this()` can be called from anywhere in a constructor.
B. `this()` can be called from anywhere in an instance method.
C. `this.variableName` can be called from any instance method in the class.
D. `this.variableName` can be called from any static method in the class.
E. You can call the default constructor written by the compiler using `this()`.
F. You can access a private constructor with the `main()` method in the same class.

Your answer: C, E, F
Correct answer: **C, F**

### !! Q17 - WRONG !!

**E is wrong.** This is a subtle one. The default constructor is generated by the compiler only when no constructors are user-defined. But `this()` can only be called from inside another constructor in the same class. If the class has another constructor to call `this()` from, then the class already has at least one user-defined constructor -- which means the compiler never generated a default constructor in the first place. The two conditions are mutually exclusive. You can never be in a position to call a compiler-generated default constructor via `this()`.

---

### Q18 | Which statements about the following classes are correct?

```java
public class Mammal {
    private void eat() {}
    protected static void drink() {}
    public Integer dance(String p) { return null; }
}
class Primate extends Mammal {
    public void eat(String p) {}
}
class Monkey extends Primate {
    public static void drink() throws RuntimeException {}
    public Number dance(CharSequence p) { return null; }
    public int eat(String p) {}
}
```

A. `eat()` in Mammal is correctly overridden on line 7.
B. `eat()` in Mammal is correctly overloaded on line 7.
C. `drink()` in Mammal is correctly overridden on line 10.
D. `drink()` in Mammal is correctly hidden on line 10.
E. `dance()` in Mammal is correctly overridden on line 11.
F. `dance()` in Mammal is correctly overloaded on line 11.
G. `eat()` in Primate is correctly hidden on line 12.
H. `eat()` in Primate is correctly overloaded on line 12.

Your answer: C, D, F
Correct answer: **D, F**

### !! Q18 - WRONG !!

**C is wrong.** `drink()` is `static` in Mammal. Static methods are hidden, not overridden. C says "correctly overridden" -- that is the wrong term. D says "correctly hidden" -- that is the correct term. You selected both C and D, but only D is accurate.

For the rest:
- `eat()` in Mammal is `private` -- not inherited at all. So line 7 is neither an override nor an overload of Mammal's version. It is a brand new method in Primate. A and B are both wrong.
- `dance()` on line 11 has a different parameter type (`CharSequence` vs `String`) -- different signature, so it is an overload, not an override. F is correct, E is wrong.
- Line 12: `eat(String p)` in Monkey has return type `int`, but `eat(String p)` in Primate has return type `void`. `int` is not covariant with `void`. This is an invalid override attempt. G and H are both wrong -- line 12 does not compile at all.

---

### Q19 | What is the output of the following code?

```java
class Reptile {
    {System.out.print("A");}
    public Reptile(int hatch) {}
    void layEggs() { System.out.print("Reptile"); }
}
public class Lizard extends Reptile {
    static {System.out.print("B");}
    public Lizard(int hatch) {}
    public final void layEggs() { System.out.print("Lizard"); }
    public static void main(String[] args) {
        var reptile = new Lizard(1);
        reptile.layEggs();
    }
}
```

Your answer: E (does not compile because of line 3)
Correct answer: **F (none of the above -- would be BALizard if corrected, but does not compile because of line 9)**

### !! Q19 - WRONG !!

The code does not compile, but for a different reason than you said. Line 3 is fine -- `Reptile(int hatch)` is a valid constructor. The problem is line 9: `Lizard(int hatch)` has no explicit `super()` or `this()` call. The compiler inserts `super()` automatically. But `Reptile` has no no-argument constructor -- only `Reptile(int hatch)`. The inserted `super()` has nowhere to go. Compile error on line 9.

If line 9 were fixed to `super(hatch)` (or any valid int argument), the output would be `BALizard`: Lizard's static block runs first, then Reptile's instance initializer prints A during construction, then `layEggs()` calls the overridden final version in Lizard.

The fix is line 9, not line 3.

---

### Q20 | Which statement about the following program is correct?

```java
class Bird {
    int feathers = 0;
    Bird(int x) { this.feathers = x; }
    Bird fly() { return new Bird(1); }
}
class Parrot extends Bird {
    protected Parrot(int y) { super(y); }
    protected Parrot fly() { return new Parrot(2); }
}
public class Macaw extends Parrot {
    public Macaw(int z) { super(z); }
    public Macaw fly() { return new Macaw(3); }
    public static void main(String... sing) {
        Bird p = new Macaw(4);
        System.out.print(((Parrot)p.fly()).feathers);
    }
}
```

Your answer: E
Correct answer: **E**

Correct. `p.fly()` -- the reference type is `Bird` but the object is `Macaw`. Overriding means runtime object wins. `Macaw.fly()` is called, returning `new Macaw(3)`. `feathers` is set to 3. The cast to `Parrot` is valid (Macaw extends Parrot). `feathers` is visible (defined in Bird). Prints 3.

---

### Q21 | Which of the following are properties of immutable classes?

A. The class can contain setter methods, provided they are marked final.
B. The class must not be able to be extended outside the class declaration.
C. The class may not contain any instance variables.
D. The class must be marked static.
E. The class may not contain any static variables.
F. The class may only contain private constructors.
G. The data for mutable instance variables may be read, provided they cannot be modified by the caller.

Your answer: B, F, G
Correct answer: **B, G**

### !! Q21 - WRONG !!

**F is wrong.** An immutable class must prevent subclassing -- but there are two ways to do that: mark the class `final`, or make all constructors `private`. F says the class "may only contain private constructors" -- this is too strong. If the class is `final`, its constructors can be any access level. The requirement is that subclassing is impossible, not that constructors must be private. Private constructors are one strategy, not a requirement.

---

### Q22 | What does the following program print?

```java
class Person {
    static String name;
    void setName(String q) { name = q; }
}
public class Child extends Person {
    static String name;
    void setName(String w) { name = w; }
    public static void main(String[] p) {
        final Child m = new Child();
        final Person t = m;
        m.name = "Elysia";
        t.name = "Sophia";
        m.setName("Webby");
        t.setName("Olivia");
        System.out.println(m.name + " " + t.name);
    }
}
```

Your answer: B (Webby Olivia)
Correct answer: **D (Olivia Sophia)**

### !! Q22 - WRONG !!

This question combines two concepts: variable hiding and method overriding.

`name` is a static variable that is hidden (not overridden) in Child. There are two separate `name` variables: `Person.name` and `Child.name`. Which one you see depends on the reference type -- classic variable hiding.

`setName()` is an instance method. Child overrides it. Which version runs depends on the runtime object -- classic polymorphism. Both `m` and `t` point to the same `Child` object, so both `m.setName()` and `t.setName()` call Child's version.

Tracing line by line:
- Line 10: `m.name = "Elysia"` -- `m` is Child reference -> `Child.name = "Elysia"`
- Line 11: `t.name = "Sophia"` -- `t` is Person reference -> `Person.name = "Sophia"`
- Line 12: `m.setName("Webby")` -- calls Child's setName -> `Child.name = "Webby"`
- Line 13: `t.setName("Olivia")` -- `t` points to a Child object, override kicks in -> calls Child's setName -> `Child.name = "Olivia"`
- Line 14: `m.name` (Child ref) = "Olivia". `t.name` (Person ref) = "Sophia". Prints `Olivia Sophia`.

The trap: `t.setName("Olivia")` looks like it should call Person's setName and update Person.name to Olivia. But setName is an instance method that is overridden. The runtime object is a Child. Child's setName runs, updating Child.name. Person.name is never touched by setName at all.

---

### Q23 | What is the output of the following program?

```java
class Canine {
    public Canine(boolean t) { logger.append("a"); }
    public Canine() { logger.append("q"); }
    private StringBuilder logger = new StringBuilder();
    protected void print(String v) { logger.append(v); }
    protected String view() { return logger.toString(); }
}
class Fox extends Canine {
    public Fox(long x) { print("p"); }
    public Fox(String name) {
        this(2);
        print("z");
    }
}
public class Fennec extends Fox {
    public Fennec(int e) {
        super("tails");
        print("j");
    }
    public Fennec(short f) {
        super("eevee");
        print("m");
    }
    public static void main(String... unused) {
        System.out.println(new Fennec(1).view());
    }
}
```

Your answer: (no answer -- out of braincells)
Correct answer: **B (qpzj)**

### !! Q23 - WRONG !!

The key is to trace the constructor chain from the bottom up to find the path, then execute top-down.

`new Fennec(1)` -- `1` is an `int`, matches `Fennec(int e)`.
1. `Fennec(int e)` calls `super("tails")` -> `Fox(String name)`.
2. `Fox(String name)` calls `this(2)` -> `Fox(long x)` (2 is widened to long).
3. `Fox(long x)` has no explicit super call -- compiler inserts `super()` -> `Canine()` (no-arg).
4. `Canine()` executes: `logger` is initialised (field init runs first), then body appends `q`.
5. Unwind: `Fox(long x)` body: `print("p")` -> appends `p`. logger = `qp`.
6. Back to `Fox(String name)`: `print("z")` -> appends `z`. logger = `qpz`.
7. Back to `Fennec(int e)`: `print("j")` -> appends `j`. logger = `qpzj`.

Output: `qpzj`.

Note: `Fennec(short f)` is never called. The integer literal `1` matches `int` before it matches `short`.

---

### Q24 | What is printed by the following program?

```java
class Antelope {
    public Antelope(int p) { System.out.print("4"); }
    { System.out.print("2"); }
    static { System.out.print("1"); }
}
public class Gazelle extends Antelope {
    public Gazelle(int p) {
        super(6);
        System.out.print("3");
    }
    public static void main(String hopping[]) {
        new Gazelle(0);
    }
    static { System.out.print("8"); }
    { System.out.print("9"); }
}
```

Your answer: B (182943)
Correct answer: **C (182493)**

### !! Q24 - WRONG !!

You got the static init order right (1, then 8) and you got the constructor chain right. The mistake was the order of instance initializers vs. the constructor body within `Antelope`.

The rule: instance initializers and field declarations run in file order, and the constructor body always runs last -- regardless of where it appears in the source file.

In `Antelope`, the instance initializer `{ print("2"); }` appears on line 5, before the constructor on line 2. But file position within the class does not change the fundamental rule: instance initializers run before the constructor body. So for Antelope: instance init prints `2`, then constructor body prints `4`.

Trace:
1. Class init: Antelope static -> `1`, Gazelle static -> `8`. Printed so far: `18`.
2. `new Gazelle(0)` -> `Gazelle(int p)` -> `super(6)` -> `Antelope(int p)`.
3. Antelope instance init (file order, before constructor): prints `2`. Printed: `182`.
4. Antelope constructor body: prints `4`. Printed: `1824`.
5. Back in Gazelle: Gazelle instance init runs: prints `9`. Printed: `18249`.
6. Gazelle constructor body continues: prints `3`. Printed: `182493`.

You had `2` and `4` swapped -- `4` before `2`. The constructor body always runs after all instance initializers, even if the constructor is physically written first in the file.

---

### Q25 | Which of the following are true about a concrete class?

A. A concrete class can be declared as abstract.
B. A concrete class must implement all inherited abstract methods.
C. A concrete class can be marked as final.
D. A concrete class must be immutable.
E. A concrete method implementing an abstract method must match the method declaration exactly.

Your answer: B, C
Correct answer: **B, C**

Correct. A is a contradiction (concrete means not abstract). D has nothing to do with concreteness. E is wrong -- covariant return types are allowed, so the declaration does not need to match exactly.

---

### Q26 | What is the output of the following code?

```java
public abstract class Whale {
    public abstract void dive();
    public static void main(String[] args) {
        Whale whale = new Orca();
        whale.dive(3);
    }
}
class Orca extends Whale {
    static public int MAX = 3;
    public void dive() { System.out.println("Orca diving"); }
    public void dive(int... depth) { System.out.println("Orca diving deeper "+MAX); }
}
```

Your answer: (no answer)
Correct answer: **D (does not compile because of line 8)**

### !! Q26 - WRONG !!

The structure looks valid but line 8 is `whale.dive(3)` where `whale` is declared as `Whale`. The `Whale` class only knows about `dive()` -- the no-arg version. `dive(int... depth)` is defined in `Orca`, not in `Whale`. Because the reference type is `Whale`, the compiler only sees what `Whale` exposes. `Whale` has no `dive(int...)` method. Compile error on line 8.

This is an important distinction from polymorphism: polymorphism decides which version of a method runs at runtime. But the method must first be visible through the reference type at compile time. If the reference type does not declare the method, the compiler rejects the call regardless of what the actual object can do.

If the reference type were `Orca whale = new Orca()`, line 8 would compile and print `Orca diving deeper 3`.

---

## Thoughts and Advice

38% is a rough score. The good news: your conceptual reasoning was often on the right track, but precision is where things fell apart repeatedly. Here is the pattern across your wrong answers:

**Variable hiding (Q5, Q22) -- you know the concept but lose the thread mid-reasoning.** In Q5 you correctly identified that hiding was happening, then forgot to ask which copy the main method was actually reading. In Q22 you forgot that setName is an overridden instance method -- polymorphism applies to it. Variables are hidden (reference type decides), methods are overridden (runtime object decides). Every time you see a question mixing variable access and method calls, ask both questions separately.

**Constructor access rules (Q1, Q10, Q11) -- two distinct gaps.** First: `BirdSeed(2)` without `new` is not a valid call at all (Q1). There are only two ways to call a constructor: `new` or `this()`/`super()`. Second: private constructors are accessible from `main()` in the same class (Q11). The access modifier only blocks code in other classes.

**Method body rules (Q15) -- `abstract` keyword is not optional.** A method without a body inside a class must be explicitly marked `abstract`. Without the modifier it is just an invalid method declaration. The class being abstract does not save it.

**Initialisation order (Q24) -- instance initializers run before the constructor body, always.** The physical position of the constructor in the source file does not change this. If the initializer block appears after the constructor in the file, it still runs before the constructor body. This came up in Chapter 3 too -- it is worth revisiting.

**Reference type visibility (Q26) -- the compile-time check is separate from runtime dispatch.** Polymorphism controls which method runs at runtime, but the compiler decides at compile time whether the call is legal based on the declared reference type. If the method is not declared in the reference type, the call does not compile, full stop. This is a fundamental distinction that will keep coming up.

**Modifier rules (Q2, Q9, Q17, Q21) -- close but imprecise.** You knew the broad strokes but missed edge cases: `static final` is legal (Q2), overriding can keep the same access level, not just increase it (Q9), compiler-generated default constructors cannot be targeted by `this()` (Q17), private constructors are one strategy for immutability but not the only one (Q21). These are all places where "almost right" became wrong answers.

The chapter has a lot of rules that interact with each other. The priority for review: initialisation order, variable hiding vs. method overriding, and the constructor chain rules. Those three topics generated the majority of your wrong answers.


---

## Concepts to Restudy

---

### Return Type When Overloading

**The rule:** when overloading a method, the return type is completely unrestricted. You can use the same type, a subtype, a supertype, or a completely unrelated type. The return type plays no role whatsoever in distinguishing overloads -- only the parameter list matters.

This is the exact opposite of overriding, where the return type must be the same or a subtype (covariant). The two rules are frequently confused on the exam.

| Scenario | Return type rule |
|---|---|
| Overloading | No restriction -- any return type is legal |
| Overriding | Must be same or a subtype (covariant) |
| Hiding (static) | Must be same or a subtype (covariant) |

##### Examples

Different parameter list = overload. Return type can be anything:

```java
public class Animal {
    public String describe(int x) { return "int"; }
    public int describe(String s) { return 1; }       // fine - different param, int return
    public void describe(double d) {}                 // fine - different param, void return
    public Animal describe(boolean b) { return this; } // fine - different param, Animal return
}
```

None of these are related to each other by any return type rule. They are four independent methods that happen to share a name.

Same parameter list = override attempt. Now the return type rule kicks in:

```java
public class Animal {
    public CharSequence describe(int x) { return "animal"; }
}

public class Dog extends Animal {
    public String describe(int x) { return "dog"; }    // fine - String is a subtype of CharSequence
    public Object describe(int x) { return "dog"; }    // DOES NOT COMPILE - Object is a supertype
    public int describe(int x) { return 1; }           // DOES NOT COMPILE - int is not covariant with CharSequence
}
```

The moment the parameter list matches an inherited method, the override rules apply and the return type must be covariant.

##### The exam trap

The exam will show a method with a different return type and ask if it is a valid override or overload. The answer depends entirely on whether the parameter list matches:

```java
public class Animal {
    public int size(int x) { return x; }
}

public class Dog extends Animal {
    public String size(int x) { return "big"; } // DOES NOT COMPILE - same params, String not covariant with int
    public String size(String x) { return "big"; } // fine - different params, overload, return type free
}
```

`size(int x)` in Dog matches the inherited signature exactly -- it is an override attempt, and `String` is not covariant with `int`. Compile error.
`size(String x)` has a different parameter type -- it is a new overload. The `String` return type is completely fine.


---

### `super` With Hidden Variables

`super` is not limited to methods. It works on fields too. When a child class declares a variable with the same name as a parent variable (hiding it), `super.variableName` reaches the parent's copy from inside the child class.

```java
class Speedster {
    int numSpots = 0;
}

class Cheetah extends Speedster {
    int numSpots = 0;  // hides Speedster's numSpots

    public Cheetah(int numSpots) {
        this.numSpots = numSpots;   // assigns to Cheetah's copy
        super.numSpots = numSpots;  // assigns to Speedster's copy
    }
}
```

Both copies exist inside the same object. `this.numSpots` and plain `numSpots` reach Cheetah's copy. `super.numSpots` reaches Speedster's copy.

This matters when the caller holds a parent reference type, because variable access is resolved by the declared reference type at compile time:

```java
Speedster s = new Cheetah(50);
System.out.print(s.numSpots); // reads Speedster's copy - reference type is Speedster
```

If the goal is for `s.numSpots` to print 50, the constructor must assign 50 to `super.numSpots` (Speedster's copy), not `this.numSpots` (Cheetah's copy).

The rule is the same as with methods -- `super` always skips the current class and goes one level up. The difference from methods is that there is no polymorphism for variables: no matter what the runtime object is, variable access always uses the declared reference type.


---

### Immutability Is a Structural Property of the Class Definition

A class is immutable if its definition satisfies the five rules. It does not matter whether:
- instances can actually be created from outside
- fields are practically reachable by any caller
- there is any content to mutate at all

The assessment is purely structural -- you look at the class definition and check the rules.

```java
public final class Elk {}  // immutable - no fields, nothing to mutate
```

No fields means nothing can change. The class trivially satisfies every rule.

```java
public final class Deer {
    private final Object o = new Object();
}  // immutable - o is private final with no getter
```

`Object` is a mutable type, but the caller has no path to reach `o`. No getter, no public field, no method that returns it. From outside the class, `o` is completely inaccessible. The class satisfies all five rules and is immutable.

The fact that `Object` itself could be mutated if you had a reference to it is irrelevant -- nobody outside the class can get that reference.

Contrast with Moose:

```java
public final class Moose {
    private final int antlers;  // never assigned - DOES NOT COMPILE
}
```

Moose does not compile at all. A `final` instance variable that is never assigned (not at declaration, not in an instance initializer, not in a constructor) is a compile error. A class that does not compile cannot be considered immutable or anything else.

The takeaway: when evaluating immutability, check the rules against the definition. Do not let "there's nothing useful here" or "nobody can reach this" cloud the structural check.


---

### Watch Absolute Qualifier Words in Answer Options

The exam frequently uses words like **must**, **always**, **only**, **never**, **cannot** to turn a partially correct statement into a wrong one. These words make a statement absolute. If the real rule has any flexibility at all, the absolute version is wrong.

Q9 option C is the exact example:

- "An overridden method must be **more** accessible than the method in the parent class." -- WRONG
- The actual rule: the overridden method must be the **same or more** accessible.

"Must be more" means strictly greater. "Same or more" includes staying the same. One word changes the answer entirely.

When you see an answer option, pull out any absolute qualifier and ask: is the rule really this strict, or does it allow the same/equal case too?

Common patterns to watch:

| Word in the option | Question to ask |
|---|---|
| must be more | can it stay the same? |
| must always | are there any exceptions? |
| cannot | is there a case where it actually can? |
| only | are there other ways to achieve this? |
| never | is there even one scenario where it is allowed? |

If the answer to your question is yes, the option is wrong. The exam uses these qualifiers precisely because the real rule is slightly softer than the option states.


---

### Where the Compiler Inserts `super()`

The compiler inserts `super()` as the first line of **any** constructor that does not already start with `this()` or `super()`. This applies regardless of how many parameters the constructor has.

```java
class Canine {
    public Canine() { logger.append("q"); }          // constructor A
    public Canine(boolean t) { logger.append("a"); } // constructor B
    private StringBuilder logger = new StringBuilder();
}

class Fox extends Canine {
    public Fox(long x) { print("p"); }         // compiler inserts super() -> calls Canine()
    public Fox(String name) {
        this(2);                               // starts with this() -> compiler inserts nothing
        print("z");
    }
    public Fox(int x) { print("r"); }          // compiler inserts super() -> calls Canine()
}
```

What the compiler actually produces:

```java
class Fox extends Canine {
    public Fox(long x) {
        super();       // inserted - calls Canine()
        print("p");
    }
    public Fox(String name) {
        this(2);       // already there - nothing inserted
        print("z");
    }
    public Fox(int x) {
        super();       // inserted - calls Canine()
        print("r");
    }
}
```

`Fox(String name)` already starts with `this(2)` so the compiler leaves it alone. The other two have neither `this()` nor `super()` as the first line, so `super()` is inserted into both -- regardless of their parameter lists.

The inserted `super()` always calls the no-argument constructor of the parent. If the parent has no no-argument constructor, the insertion still happens but the call has nowhere to go -- compile error.

```java
class Animal {
    public Animal(int age) {} // only constructor - no no-arg version
}

class Dog extends Animal {
    public Dog() {}         // compiler inserts super() -> Animal() does not exist -> DOES NOT COMPILE
    public Dog(String name) {} // compiler inserts super() -> same problem -> DOES NOT COMPILE
    public Dog(int age) {
        super(age);         // explicit call -> fine, matches Animal(int age)
    }
}
```

Every constructor except `Dog(int age)` gets `super()` inserted and fails. The fix is always the same: explicitly call a parent constructor that actually exists.


---

### Navigating Initialisation Order Questions

The mental model: **constructors are the roadmap, initialisers are passengers that ride along with their class.**

#### Step 1: handle all static initialisers first

Static initialisers run once at class load time, before any instance is created. Superclass static first, then subclass static. Handle these completely before touching any constructor or instance initialiser.

#### Step 2: follow the constructor chain to find the class activation order

Start from `new X()` and follow every `super()` and `this()` call until you reach `Object`. This gives you the order in which each class "activates."

#### Step 3: for each class in activation order, run instance initialisers then constructor body

You do not run all instance initialisers globally first. Each class's initialisers run immediately before that class's constructor body, in the order the classes activated.

For each class:
1. Instance initialisers and field declarations in file order
2. Constructor body

```java
class Antelope {
    public Antelope(int p) { System.out.print("4"); }  // constructor body
    { System.out.print("2"); }                          // instance initialiser
    static { System.out.print("1"); }                   // static initialiser
}
public class Gazelle extends Antelope {
    public Gazelle(int p) {
        super(6);
        System.out.print("3");                          // constructor body
    }
    static { System.out.print("8"); }                   // static initialiser
    { System.out.print("9"); }                          // instance initialiser
}
```

Navigation:

- Static phase (once, superclass first): Antelope static -> `1`, Gazelle static -> `8`
- Constructor chain: `new Gazelle(0)` -> `super(6)` -> Antelope activates first, then Gazelle
- Antelope activates: instance initialiser -> `2`, constructor body -> `4`
- Gazelle activates: instance initialiser -> `9`, constructor body -> `3`

Final output: `182493`

The physical position of a constructor or initialiser in the source file does not change this order. The constructor body always runs after all instance initialisers for that class, even if the constructor is written before them in the file.


---

### Compile Time Check vs Runtime Dispatch

The compiler and the JVM do two completely separate jobs when a method is called through a reference variable.

**Compile time -- is the call legal?**
The compiler looks only at the declared reference type. If the method exists on that type's contract, the call is allowed. If not, it is rejected and never reaches runtime. The actual runtime object is irrelevant at this stage.

**Runtime -- which version runs?**
Once the compiler has approved the call, the JVM looks at the actual runtime object and dispatches to the most specific overriding version. This is polymorphism. The declared reference type is irrelevant at this stage.

```java
Whale whale = new Orca();

whale.dive();    // compile time: dive() is on Whale's contract -> allowed
                 // runtime: object is Orca -> Orca.dive() runs, prints "Orca diving"

whale.dive(3);   // compile time: dive(int...) is NOT on Whale's contract -> rejected
                 // never reaches runtime
```

The two steps are fully independent. Once the compiler approves a call, it hands off entirely to the JVM. The JVM never re-checks whether the method exists -- that was already verified. It only decides which version to run.

This also explains why calling an abstract method through a reference is fine:

```java
Whale whale = new Orca();
whale.dive(); // fine - Whale declares dive(), so the compiler approves it
              // Whale provides no implementation, but the compiler knows any concrete
              // object stored in a Whale reference must have one
```

`abstract` just means the declaring class provides no implementation. It does not make the method uncallable -- it guarantees the opposite: every concrete subclass must have an implementation ready, so the call is always safe.
