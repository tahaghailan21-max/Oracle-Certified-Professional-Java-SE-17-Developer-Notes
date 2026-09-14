# Class Design

---

### Understanding Inheritance

**Inheritance** is the process by which a subclass automatically includes certain members
of its parent class -- primitives, objects, and methods -- without having to redeclare them.

Terminology:
- **Subclass / child class** -- the class that inherits from another.
- **Superclass / parent class** -- the class being inherited from.
- When working with interfaces and other types, the more general terms **subtype** and
  **supertype** are used instead.

##### Declaring a Subclass

Use the `extends` keyword to declare that a class inherits from another:

```java
public class Mammal { }
public final class Rhinoceros extends Mammal { }
```

The superclass does not need any special declaration -- it just must not be marked `final`.
Marking a class `final` prevents it from being extended at all.

##### Inheritance is transitive

Given classes X, Y, Z:
- If X extends Y, and Y extends Z, then X is a subclass (descendant) of Z.
- Z is a superclass (ancestor) of X.
- X is a **direct** subclass of Y only -- not of Z. The term "direct" means one level up.

##### What members are inherited?

| Modifier | Inherited by subclass? |
|---|---|
| `public` | Yes |
| `protected` | Yes |
| Package (no modifier) | Yes, if subclass is in the same package |
| `private` | No -- never accessible via inheritance |

Private members still exist in the parent object. The subclass just cannot access them
directly. The parent class can still use them internally, and their values affect the object's
state.

##### Private members -- memory vs. inheritance

There are two separate things to keep straight:

- **Memory**: when you create a child object, the memory allocated for it contains space
  for ALL fields declared in the entire class hierarchy, including the parent's private ones.
  They have to be there because the parent's own methods still use them.
- **Inheritance (language level)**: the subclass does not inherit private members. This
  means the subclass cannot reference them by name -- it cannot read them, write them,
  or call them directly.

The parent's methods that use private fields still work correctly when called on a child
object, because those methods belong to the parent class and run in the parent's context.
The parent always has access to its own private members.

```java
public class BigCat {
    private double size = 5.0;           // private field

    public double getSize() {
        return size;                     // BigCat can use its own private field
    }
}

public class Jaguar extends BigCat {
    public void show() {
        System.out.println(size);        // DOES NOT COMPILE - size is not inherited
        System.out.println(getSize());   // fine - getSize() is public and returns size internally
    }
}
```

The private field `size` physically exists inside every `Jaguar` object on the heap. But
`Jaguar` code cannot reference it directly. The only way to reach it is through a public or
protected method that `BigCat` provides.

##### What is and is not possible with private members

```java
public class Animal {
    private int age = 5;
    private void breathe() { System.out.println("breathing"); }
    public int getAge() { return age; }
    public void live() { breathe(); }  // Animal can call its own private method
}

public class Dog extends Animal {

    public void check() {
        System.out.println(age);    // DOES NOT COMPILE - private field not inherited
        breathe();                  // DOES NOT COMPILE - private method not inherited
        System.out.println(getAge()); // fine - public getter inherited
        live();                     // fine - public method inherited, it calls breathe() internally
    }

    // you CAN declare a new field or method with the same name - it is a brand new member,
    // not an override, not related to Animal's private age at all
    private int age = 10;           // this is Dog's own separate age field

    public void showAge() {
        System.out.println(age);    // prints 10 - this is Dog's age, not Animal's
    }
}
```

Key points:
- A child class cannot read, write, or call any private member of the parent directly.
- The parent's public/protected methods that internally use private members work fine
  when called through a child object -- the parent's context handles the private access.
- You can declare a new field or method in the child with the same name as a private
  parent member. It does not override or conflict -- it is an entirely new member that
  just happens to share a name.

```java
public class BigCat {
    protected double size;
}

public class Jaguar extends BigCat {
    public Jaguar() {
        size = 10.2;  // fine - size is protected, inherited by Jaguar
    }
    public void printDetails() {
        System.out.print(size);  // fine
    }
}

public class Spider {
    public void printDetails() {
        System.out.println(size);  // DOES NOT COMPILE - size is not inherited by Spider
    }
}
```

`Jaguar` extends `BigCat` and inherits `size` because it is `protected`. `Spider` has no
relationship to `BigCat` at all -- it cannot access `size`.

---

### Class Modifiers

| Modifier | Description | Covered in |
|---|---|---|
| `final` | The class may not be extended | Chapter 6 |
| `abstract` | May contain abstract methods; requires a concrete subclass to instantiate | Chapter 6 |
| `sealed` | May only be extended by a specific list of classes | Chapter 7 |
| `non-sealed` | A subclass of a sealed class that permits unnamed subclasses | Chapter 7 |
| `static` | Used for static nested classes defined within another class | Chapter 7 |

##### `final` classes

A `final` class cannot be extended. Any attempt to subclass it is a compile error:

```java
public final class Rhinoceros extends Mammal { }
public class Clara extends Rhinoceros { }  // DOES NOT COMPILE
```

On the exam: if you see a class marked `final` and another class extending it, it does not
compile. Spot it immediately.

---

### Single vs. Multiple Inheritance

Java supports **single inheritance** -- a class may have only one direct parent class.

**Multiple inheritance** (having more than one direct parent) is not supported in Java.
The reason: when two parents both define the same field or method, there is no clear rule
for which one the child inherits. Java avoids this ambiguity entirely.

Java does allow one exception: a class may implement multiple **interfaces**. Interfaces
are covered in Chapter 7.

Single inheritance does not prevent a parent from having multiple children. It only means
each child has exactly one parent.

---

### Inheriting Object

Every class in Java ultimately inherits from `java.lang.Object`. `Object` is the only class
that has no parent.

When you write a class with no `extends`:

```java
public class Zoo { }
```

The compiler silently inserts `extends Object`:

```java
public class Zoo extends Object { }  // what the compiler actually sees
```

When you write a class that already extends something, the compiler does nothing -- your
class will reach `Object` through the chain of whatever it extends.

##### Why this does not violate single inheritance

There is never a class with two direct parents. The inheritance is always a single
unbroken chain up to `Object` at the top.

```java
public class Animal { }          // compiler adds: extends Object
public class Dog extends Animal { }
```

What Java sees:

```
Object
  |
Animal     (direct parent: Object)
  |
Dog        (direct parent: Animal -- reaches Object through Animal)
```

`Dog` has one direct parent: `Animal`. `Animal` has one direct parent: `Object`. That is
three classes connected in a single line. No multiple inheritance.

The "compiler inserts `extends Object`" rule only fires when no `extends` is written. If
you already extend something, the compiler leaves it alone -- `Object` is already
reachable through the chain.

Every class hierarchy, no matter how deep, ends with `Object` at the top. This means
every class in Java has access to `Object`'s methods -- including `toString()`,
`equals()`, and `hashCode()` -- even without explicitly extending `Object`.

Primitive types (`int`, `boolean`, etc.) do not inherit from `Object` because they are not
classes. Through autoboxing they can be assigned or passed as their wrapper class
equivalent, which does inherit from `Object`.

---

### Extending a Class

```java
// Animal.java
public class Animal {
    private int age;
    protected String name;

    public int getAge() { return age; }
    public void setAge(int newAge) { age = newAge; }
}

// Lion.java
public class Lion extends Animal {
    protected void setProperties(int age, String n) {
        setAge(age);  // age is private in Animal - must go through the setter
        name = n;     // name is protected - directly accessible in the subclass
    }

    public void roar() {
        System.out.print(name + ", age " + getAge() + ", says: Roar!");
    }

    public static void main(String[] args) {
        var lion = new Lion();
        lion.setProperties(3, "kion");
        lion.roar();  // kion, age 3, says: Roar!
    }
}
```

- `age` is `private` in `Animal`. `Lion` cannot reference it directly. It reaches it through
  the inherited public methods `setAge()` and `getAge()`.
- `name` is `protected` in `Animal`. `Lion` inherits it and can read and write it directly.

Trying to access `age` directly in `Lion` is a compile error:

```java
public class Lion extends Animal {
    public void roar() {
        System.out.print("Lions age: " + age); // DOES NOT COMPILE - age is private
    }
}
```

Quick reminder of what is inherited based on access:

| Modifier | Same package | Different package subclass |
|---|---|---|
| `private` | Never | Never |
| package | Yes | No |
| `protected` | Yes | Yes |
| `public` | Yes | Yes |

---

### Applying Class Access Modifiers

##### Multiple classes in one file

A single `.java` file can contain multiple class declarations. The rules:
- At most **one** class may be `public`.
- If one class is `public`, the **filename must exactly match** that class's name.
- All other classes in the same file must have **package access** (no modifier).
- You can have as many package-access classes as you want in one file.

```java
// Bear.java - valid: three package-access classes in one file
class Bird {}
class Bear {}
class Fish {}
```

```java
// Animal.java - valid: one public class, filename matches
public class Animal {}
class Helper {}   // package access, fine alongside the public class
```

##### Why would you put multiple classes in one file?

A `.java` file is just a text file. The compiler produces a separate `.class` file for each
class declaration it finds, regardless of how many are in the source file.

The practical use case: a small helper class that is only ever used by one other class in
the same package. Rather than creating a whole separate file, you put it alongside the class
it supports. It stays package-access so nothing outside the package can touch it.

```java
// OrderProcessor.java
public class OrderProcessor {
    public void process(Order order) {
        OrderValidator validator = new OrderValidator();
        if (validator.isValid(order)) { /* process */ }
    }
}

class OrderValidator {
    boolean isValid(Order order) {
        return order != null;
    }
}
```

`OrderValidator` only makes sense next to `OrderProcessor`. Keeping it in the same file
signals that clearly and avoids cluttering the package with an extra file. In practice, most
developers still prefer one class per file for clarity, but the pattern is legal and
occasionally useful for tightly coupled helpers.

##### General rule

> A `.java` file may contain multiple class declarations. At most one may be `public`.
> If one is `public`, the filename must match it exactly. All others must have package access.

##### Exam traps

```java
// File: Dog.java
public class Animal {}   // DOES NOT COMPILE - filename is Dog.java, not Animal.java
public class Dog {}
```

Two `public` classes in one file:

```java
// File: Animal.java
public class Animal {}
public class Dog {}      // DOES NOT COMPILE - only one public class allowed per file
```

`public` class whose name does not match the filename:

```java
// File: Animal.java
class Dog {}             // fine - package access, filename does not need to match
public class Cat {}      // DOES NOT COMPILE - public class name must match filename Animal
```

No `public` class at all -- completely valid:

```java
// File: Helpers.java
class A {}   // fine
class B {}   // fine
class C {}   // fine - no public class, filename can be anything
```

##### What access modifiers are allowed on a top-level class?

Only two options exist for top-level classes:

| Modifier | Effect |
|---|---|
| `public` | Visible from any package |
| *(none)* -- package access | Visible only within the same package |

`protected` and `private` are not allowed on top-level classes and cause a compile error:

```java
protected class ClownFish {}  // DOES NOT COMPILE
private class BlueTang {}     // DOES NOT COMPILE
```

The reason `protected` and `private` make no sense for a top-level class:
- `private` would mean "only visible inside the same class" -- but a top-level class has
  nothing containing it, so nothing could ever use it.
- `protected` would mean "same package plus subclasses" -- but subclasses need to see the
  class to extend it, and the rules get contradictory.

##### Nested classes are different

When a class is declared inside another class, all four access modifiers (`public`,
`protected`, package, `private`) are permitted. This is covered in Chapter 7.

---

### Accessing the `this` Reference

When a method parameter has the same name as an instance variable, Java uses the most
local scope -- meaning it treats both sides of the assignment as the parameter, completely
ignoring the instance variable.

```java
public class Flamingo {
    private String color = null;

    public void setColor(String color) {
        color = color;  // assigns the parameter to itself - instance variable unchanged
    }

    public static void main(String... unused) {
        var f = new Flamingo();
        f.setColor("PINK");
        System.out.print(f.color); // null - the instance variable was never touched
    }
}
```

The fix is `this`. The `this` reference refers to the current instance of the class. Prefixing
a variable with `this.` tells Java you mean the instance variable, not the local one.

```java
public void setColor(String color) {
    this.color = color;  // this.color = instance variable, color = parameter
}
```

##### Where `this` can and cannot be used

- Allowed: any instance method, constructor, or instance initializer block.
- Not allowed: static methods and static initializer blocks. There is no instance in a
  static context, so `this` has nothing to refer to.

##### `this` is optional when there is no naming conflict

If the variable name is unique (no local variable or parameter shadows it), Java finds the
instance variable on its own. `this.` is just explicit -- not required.

##### Exam trap -- assignment in the wrong direction

```java
public class Duck {
    private String color;
    private int height;
    private int length;

    public void setData(int length, int theHeight) {
        length = this.length;   // BACKWARDS - assigns instance variable (0) to the parameter
        height = theHeight;     // fine - no name conflict
        this.color = "white";   // fine - this. is optional here but not wrong
    }

    public static void main(String[] args) {
        Duck b = new Duck();
        b.setData(1, 2);
        System.out.print(b.length + " " + b.height + " " + b.color); // 0 2 white
    }
}
```

Line 7 is the trap. `length = this.length` reads the instance variable (`0`) and assigns
it to the parameter. The instance variable is never updated. The parameter just gets
overwritten with the default value and then discarded when the method ends.

The correct form would be `this.length = length` -- instance variable on the left,
parameter on the right.

---

### Calling the `super` Reference

When a child class declares a variable or method with the same name as one in the parent,
the object instance holds **two separate copies** -- one at each level of the hierarchy.

`this` refers to the current instance and includes both current and inherited members.
`super` refers only to inherited members -- it skips anything defined in the current class.

```java
public class Reptile {
    protected int speed = 10;
}

public class Crocodile extends Reptile {
    protected int speed = 20;  // hides Reptile's speed

    public int getSpeed() {
        return speed;        // returns 20 - Java finds Crocodile's speed first
    }
}
```

A `Crocodile` object holds two `speed` values: `10` (Reptile level) and `20` (Crocodile
level). Without any prefix, Java uses the most local scope -- the Crocodile-level `20`.

To reach the parent's version, use `super`:

```java
public int getSpeed() {
    return super.speed;  // returns 10 - Reptile's speed
}
```

##### `this` vs. `super` -- what each can see

| | `this` | `super` |
|---|---|---|
| Current class members | Yes | No |
| Inherited members | Yes | Yes |
| Local variables / parameters | No (use plain name) | No |

`super` only works for inherited members. If the member is defined only in the current
class, `super` cannot see it.

##### The Beetle example -- a compile error hidden inside

```java
class Insect {
    protected int numberOfLegs = 4;
    String label = "buggy";
}

public class Beetle extends Insect {
    protected int numberOfLegs = 6;
    short age = 3;

    public void printData() {
        System.out.println(this.label);   // fine - label is inherited, this includes inherited
        System.out.println(super.label);  // fine - label is inherited, super can see it
        System.out.println(this.age);     // fine - age is in Beetle, this includes current class
        System.out.println(super.age);    // DOES NOT COMPILE - age is not inherited, super cannot see it
        System.out.println(numberOfLegs); // 6 - no prefix, Java finds Beetle's copy first
    }
}
```

Line by line:
- `this.label` and `super.label`: `label` is defined in `Insect` and inherited by `Beetle`.
  Both `this` and `super` can reach it. Both print `buggy`.
- `this.age`: `age` is defined in `Beetle`. `this` includes current class members. Fine,
  prints `3`.
- `super.age`: `age` is only in `Beetle`, not inherited from anywhere. `super` only sees
  inherited members -- it has no `age` to find. Compile error.
- `numberOfLegs` (no prefix): both `Insect` and `Beetle` have this variable. Java starts
  from the narrowest scope -- `Beetle`'s copy is found first. Prints `6`. If you wanted
  `Insect`'s copy, you would write `super.numberOfLegs` (prints `4`).

##### When do you actually need `super`?

Only when there is a naming conflict -- a variable or method in the current class that
shadows or overrides one in the parent. Without a conflict, `this.member` and
`super.member` find the same thing, so `super` is redundant. This comes up most
commonly with method overriding and variable hiding, covered next in this chapter.

---

### Declaring Constructors

A constructor is a special method that:
- Has the **same name as the class** (case-sensitive).
- Has **no return type** -- not even `void`.
- Is called when a new instance of the class is created with `new`.

```java
public class Bunny {
    public Bunny() {
        System.out.print("hop");
    }
}
```

##### Invalid constructors

```java
public class Bunny {
    public bunny() {}       // DOES NOT COMPILE - name doesn't match class (case-sensitive)
                            // Java treats it as a method missing a return type
    public void Bunny() {} // valid METHOD, not a constructor - has a return type
}
```

##### `var` is not allowed in constructor (or method) parameters

```java
public class Bonobo {
    public Bonobo(var food) {} // DOES NOT COMPILE
}
```

`var` is not allowed as a parameter type in either constructors or regular methods. This
applies to both -- not just constructors.

##### Constructor overloading

A class can have multiple constructors as long as each has a distinct parameter list
(same rule as method overloading -- only the parameter types and order matter):

```java
public class Turtle {
    private String name;
    public Turtle() { name = "John Doe"; }
    public Turtle(int age) {}
    public Turtle(long age) {}
    public Turtle(String newName, String... favoriteFoods) { name = newName; }
}
```

---

### The Default Constructor

If you do not write any constructor, the compiler automatically inserts a no-argument
constructor with an empty body. This is called the **default constructor**.

```java
public class Rabbit {}
// equivalent to:
public class Rabbit {
    public Rabbit() {}
}
```

The default constructor only appears in the compiled `.class` file, not in your `.java`
source file.

**Critical rule: the compiler only inserts the default constructor when no constructors are
defined at all.** If you define even one constructor (any signature, any access), the default
is not added.

```java
public class Rabbit1 {}                         // gets a default constructor
public class Rabbit2 { public Rabbit2() {} }    // has one - no default added
public class Rabbit3 { public Rabbit3(boolean b) {} } // has one - no default added
public class Rabbit4 { private Rabbit4() {} }   // has one - no default added
```

```java
var r1 = new Rabbit1();       // fine - uses generated default constructor
var r2 = new Rabbit2();       // fine - uses user-defined no-arg constructor
var r3 = new Rabbit3(true);   // fine - passes the required boolean
var r4 = new Rabbit4();       // DOES NOT COMPILE - constructor is private
```

A class with only private constructors cannot be instantiated from outside the class.
This is useful for classes that only have static methods, or where you want full control
over how instances are created (factory pattern, singleton, etc.).

---

### Calling Overloaded Constructors with `this()`

One constructor can call another constructor in the same class using `this()`. This is
called **constructor chaining** and avoids duplicating setup logic.

```java
public class Hamster {
    private String color;
    private int weight;

    public Hamster(int weight, String color) {
        this.weight = weight;
        this.color = color;
    }

    public Hamster(int weight) {
        this(weight, "brown"); // delegates to the two-parameter constructor
    }
}
```

##### Why `new Hamster(...)` inside a constructor does not work

When you call `new Hamster(15)`, Java allocates memory for an object -- call it **Object A**.
This is the one the caller will get back. Java then starts running `Hamster(int weight)` on
**Object A**.

If inside that constructor you write `new Hamster(weight, "brown")`:

1. Java allocates memory for a second object -- call it **Object B**.
2. Java runs `Hamster(int weight, String color)` on **Object B**, setting **Object B's**
   `weight` to 15 and **Object B's** `color` to `"brown"`.
3. That constructor finishes. **Object B** is fully built, but nobody stored it in a variable.
   It is immediately eligible for garbage collection.
4. Control returns to `Hamster(int weight)` still running on **Object A**. That method ends.
5. The caller receives **Object A** -- with `weight = 0` and `color = null`. Nothing ever
   touched it.

```java
public Hamster(int weight) {
    new Hamster(weight, "brown"); // builds Object B, configures Object B, discards Object B
                                  // Object A (the one the caller gets) is untouched
}
```

With `this(weight, "brown")`, no new object is created. Java runs
`Hamster(int weight, String color)` directly on **Object A** -- the same object already
being built. Object A gets `weight = 15` and `color = "brown"`. The caller receives Object A,
fully configured. One object the whole time.

##### `this` vs `this()` -- they look the same but are completely different

| | `this` | `this()` |
|---|---|---|
| What it is | A reference to the current instance | A call to another constructor in the same class |
| What it does | Accesses fields and methods on the current object | Delegates construction to a different constructor |
| Where it appears | Inside any instance method, constructor, or instance initializer | Only as the first statement inside a constructor |

```java
public class Hamster {
    private int weight;
    private String color;

    public Hamster(int weight, String color) {
        this.weight = weight;   // this. = reference to instance field
        this.color = color;
    }

    public Hamster(int weight) {
        this(weight, "brown");  // this() = calls the two-param constructor
    }
}
```

The exam will use both in the same class to test whether you can tell them apart.

##### Rules for `this()`

`this()` must be the **first statement** in the constructor. Any real Java statement before
it is a compile error. Comments are not statements and are allowed anywhere.

```java
public Hamster(int weight) {
    System.out.println("chew"); // a statement - not allowed before this()
    this(weight, "brown");      // DOES NOT COMPILE - not the first statement
}
```

##### No cyclic constructor calls

The compiler detects constructor cycles and rejects them:

```java
// direct cycle - constructor calls itself
public class Gopher {
    public Gopher(int dugHoles) {
        this(5); // DOES NOT COMPILE - calls itself infinitely
    }
}

// indirect cycle - two constructors call each other
public class Gopher {
    public Gopher() {
        this(5); // DOES NOT COMPILE
    }
    public Gopher(int dugHoles) {
        this(); // DOES NOT COMPILE
    }
}
```

##### Constructor rules summary

- A class can have many overloaded constructors, provided each has a distinct parameter list.
- The compiler inserts a default no-argument constructor only if no constructors are declared.
- `this()` must be the first line of the constructor if used.
- Java does not allow cyclic constructor calls.

---

### Calling Parent Constructors with `super()`

Every object in Java must be fully initialised from the top of the hierarchy downward.
Before a child class can do anything, the parent class must have already set itself up. That
setup happens in the parent's constructor.

Java enforces this with one rule: **the first thing every constructor must do is initialise
the parent**. This is done by calling either:
- `super()` -- calls a constructor in the parent class.
- `this()` -- calls another constructor in the same class, which must itself eventually
  call `super()`.

If you do not write either one yourself, the compiler silently inserts `super()` for you.
This implicit call uses the no-argument version, so it only works if the parent has a
no-argument constructor available.

##### The chain always goes all the way to Object

Every constructor eventually calls a parent constructor, which calls its parent constructor,
all the way up until `Object`'s constructor runs. Only after the full chain completes from
top to bottom does your class's own constructor body execute.

Think of it as building floors of a building: you cannot build the second floor until the
first floor is done. `super()` is the rule that forces construction from the bottom up.

##### `super()` and `this()` are mutually exclusive on the first line

You can only have one of them, and whichever you choose must be first. You cannot have
both, and you cannot put any real statement before either of them.

You only need to write `super(...)` yourself when:
- You want to call a specific parent constructor that takes arguments.
- You want to be explicit even for the no-argument version.

```java
public class Animal {
    private String name;

    public Animal(String name) {
        this.name = name;
    }
}

public class Dog extends Animal {

    public Dog(String name) {
        super(name);  // must write this explicitly - Animal has no no-arg constructor
    }
}
```

If you omit `super(name)` here, the compiler tries to insert `super()` automatically.
But `Animal` has no no-argument constructor -- only `Animal(String name)`. The compiler
cannot call something that doesn't exist. Compile error.

Contrast with a parent that has a no-arg constructor -- here you do not need to write
anything:

```java
public class Animal {
    public Animal() {}  // no-arg constructor exists
}

public class Dog extends Animal {
    public Dog() {
        // compiler inserts super() here automatically - no need to type it
    }
}
```

##### The chain in action -- Animal, Zebra, and Object

```java
public class Animal {
    private int age;

    public Animal(int age) {
        super();       // calls Object() - the no-arg constructor in java.lang.Object
        this.age = age;
    }
}

public class Zebra extends Animal {

    public Zebra(int age) {
        super(age);  // explicitly calls Animal(int age)
    }

    public Zebra() {
        this(4);     // calls Zebra(int age), which calls super(age), which calls Object()
    }
}
```

Tracing `new Zebra()`:
1. `Zebra()` runs. First line is `this(4)` -- delegates to `Zebra(int age)`.
2. `Zebra(4)` runs. First line is `super(4)` -- calls `Animal(int age)`.
3. `Animal(4)` runs. Compiler inserted `super()` -- calls `Object()`.
4. `Object()` completes. Control returns down the chain.
5. `Animal(4)` body finishes (`age = 4`). Control returns to `Zebra(4)`.
6. `Zebra(4)` body finishes. Control returns to `Zebra()`.
7. `Zebra()` body finishes. The object is fully constructed.

Every `this()` call must eventually lead to a `super()` call -- that is how the chain
always reaches `Object` no matter how many delegations happen along the way.

---

### `super` vs `super()` -- completely different things

| | `super` | `super()` |
|---|---|---|
| What it is | A reference to the parent class instance | A call to a parent constructor |
| What it does | Accesses inherited fields and methods | Initialises the parent part of the object |
| Where it appears | Any instance method or constructor body | Only as the first statement of a constructor |

```java
public class Animal {
    protected String name;
}

public class Dog extends Animal {
    public Dog(String name) {
        super();            // super() - calls Animal's no-arg constructor
        super.name = name;  // super. - accesses the inherited field
    }
}
```

##### `super()` can only appear once and must be first

```java
public class Zoo {
    public Zoo() {
        System.out.println("Zoo created");
        super(); // DOES NOT COMPILE - not the first statement
    }
}

public class Zoo {
    public Zoo() {
        super();                       // fine - first statement
        System.out.println("Zoo created");
        super(); // DOES NOT COMPILE - super() already used, cannot appear again
    }
}
```

##### Child constructors can call any valid parent constructor

The child is not required to call a matching parent constructor. Any parent constructor
with compatible arguments is acceptable:

```java
public class Animal {
    private int age;
    private String name;

    public Animal(int age, String name) {
        super();
        this.age = age;
        this.name = name;
    }

    public Animal(int age) {
        super();
        this.age = age;
        this.name = null;
    }
}

public class Gorilla extends Animal {
    public Gorilla(int age) {
        super(age, "Gorilla"); // calls Animal(int age, String name)
    }

    public Gorilla() {
        super(5);              // calls Animal(int age)
    }
}
```

---

### Compiler Enhancements -- What Java Inserts Automatically

The compiler performs two automatic insertions if you do not write them yourself:

1. If a class has no constructor, the compiler adds a default no-argument constructor.
2. If a constructor does not start with `this()` or `super()`, the compiler inserts `super()`
   as the first line.

These three definitions of `Donkey` are all identical after compilation:

```java
public class Donkey {}

public class Donkey {
    public Donkey() {}
}

public class Donkey {
    public Donkey() {
        super();   // what the compiler produces in all three cases
    }
}
```

This is why all the classes written earlier in the book compiled without explicit
`super()` calls -- the compiler was inserting them silently the whole time.

---

### Default Constructor Tips and Tricks

##### The two-step mental model

When the compiler processes a constructor, it does two things in sequence:

1. If the constructor has no `super()` or `this()` on the first line, **insert `super()` automatically**.
2. Check whether the parent actually has a no-argument constructor. If it does not, **compile error**.

The compiler inserts `super()` blindly -- it does not check first. The error only appears
at step 2 when the inserted call has nowhere to go.

##### The problem in practice

```java
public class Mammal {
    public Mammal(int age) {}  // only constructor - takes an int
                               // compiler does NOT insert a default no-arg constructor
                               // because Mammal already has a constructor
}
```

`Mammal` has no no-argument constructor. Now look at its subclasses:

```java
public class Seal extends Mammal {}  // DOES NOT COMPILE
```

`Seal` has no constructor. The compiler inserts a default one:

```java
public class Seal extends Mammal {
    public Seal() {
        super(); // inserted by compiler - but Mammal(no-args) does not exist!
    }
}
```

The inserted `super()` tries to call `Mammal()` which was never defined. Compile error.

```java
public class Elephant extends Mammal {
    public Elephant() {}  // DOES NOT COMPILE
}
```

`Elephant` wrote a constructor but did not call `super()` or `this()`. The compiler inserts
`super()`. Same problem -- `Mammal()` does not exist. Compile error.

##### The fix: explicitly call a parent constructor that actually exists

```java
public class Seal extends Mammal {
    public Seal() {
        super(6);  // calls Mammal(int age) - this exists
    }
}

public class Elephant extends Mammal {
    public Elephant() {
        super(4);  // calls Mammal(int age) - this exists
    }
}
```

Once `Elephant` provides a working no-argument constructor, its own subclasses can
safely use the default insertion again:

```java
public class AfricanElephant extends Elephant {}
// compiles fine - compiler inserts super() which calls Elephant() which exists
```

##### Full example walking through the whole chain

```java
public class Vehicle {
    private int speed;

    public Vehicle(int speed) {
        super();           // calls Object() - exists, fine
        this.speed = speed;
    }
    // no no-arg constructor
}

public class Car extends Vehicle {
    // DOES NOT COMPILE if written as:
    // public Car() {}
    // because compiler inserts super() -> Vehicle() which doesn't exist

    public Car() {
        super(60);  // must explicitly call Vehicle(int speed)
    }
}

public class SportsCar extends Car {
    // compiles fine - compiler inserts super() -> Car() which exists
}
```

##### Quiz -- what happens here?

```java
public class Bird {
    public Bird(String species) {}
}

public class Parrot extends Bird {
    public Parrot() {}
}

public class AfricanGrey extends Parrot {}
```

Which of these compile and which do not? Work it out before reading below.

---

**Answer:**

- `Bird`: fine. Has one constructor. No default inserted (one already exists).
- `Parrot`: does NOT compile. `Parrot()` has no `super()` or `this()`. Compiler inserts
  `super()`. This tries to call `Bird()` which does not exist -- `Bird` only has
  `Bird(String species)`. Compile error.
- `AfricanGrey`: would be fine on its own IF `Parrot` compiled (it would insert
  `super()` -> `Parrot()` which exists). But since `Parrot` itself does not compile,
  nothing in this chain compiles.

The fix:

```java
public class Parrot extends Bird {
    public Parrot() {
        super("Parrot");  // explicitly call Bird(String species)
    }
}
```

---

### Constructor Rules -- Final Summary

1. The first line of every constructor is a call to a parent constructor using `super()` or
   an overloaded constructor using `this()`.
2. If the constructor does not contain `this()` or `super()`, the compiler automatically
   inserts `super()` with no arguments as the first line.
3. If `super()` is inserted or written explicitly, it must refer to a constructor that actually
   exists in the parent class -- otherwise it is a compile error.
4. `super()` and `this()` must each be the first line of the constructor -- you can only
   have one of them.
 

---

### Initializing Objects -- Order of Initialization

There are two completely separate initialization sequences. Mixing them up is the most
common source of confusion.

| | Class initialization | Instance initialization |
|---|---|---|
| When | Once per class, ever | Every time `new` is called |
| What runs | Static variables, static initializers | Instance variables, instance initializers, constructors |
| Triggered by | First use of the class | `new ClassName(...)` |

---

### Initializing Classes (Class Initialization)

Class initialization loads the class itself. It happens **at most once** for each class and
runs before any instance is created or any static member is accessed.

**Order for initializing class X:**
1. If X has a superclass Y, initialize Y first (top of hierarchy down).
2. Process all static variable declarations in file order.
3. Process all static initializer blocks in file order.

No constructors, no instance variables -- this is purely static setup.

##### Example: `Hippo` with `main()` inside itself

```java
public class Animal {
    static { System.out.print("A"); }
}

public class Hippo extends Animal {
    static { System.out.print("B"); }

    public static void main(String[] grass) {
        System.out.print("C");
        new Hippo();
        new Hippo();
        new Hippo();
    }
}
```

Output: `ABC`

Trace:
1. JVM must load `Hippo` to run `main()` (the entry point class loads before `main()` executes).
2. `Hippo` extends `Animal`, so `Animal` initializes first -> prints `A`.
3. `Hippo`'s static block runs -> prints `B`.
4. `main()` starts running -> prints `C`.
5. `new Hippo()` x3: class is already initialized, nothing static runs again. Only instance
   initialization would run (not shown here).

Result: `ABC` printed exactly once no matter how many instances are created.

##### Example: `Hippo` called from a different class

```java
public class HippoFriend {
    public static void main(String[] grass) {
        System.out.print("C");
        new Hippo();
    }
}
```

Output: `CAB`

Trace:
1. JVM loads `HippoFriend` to run `main()`. `HippoFriend` has no static members -- nothing prints.
2. `main()` starts running -> prints `C`.
3. `new Hippo()` is encountered. `Hippo` has not been loaded yet -- load it now.
4. `Hippo` extends `Animal`, so `Animal` initializes first -> prints `A`.
5. `Hippo`'s static block runs -> prints `B`.
6. `Hippo` object is created.

Result: `CAB`. The `C` comes first because `HippoFriend`'s `main()` was already running
before `Hippo` was ever needed.

##### The key rule

The class containing `main()` is always loaded before `main()` executes. All other classes
are loaded the first time they are actually needed (first use). This is why the same
`Hippo` class prints `AB` before `C` in the first example but after `C` in the second.


---

### Initializing `final` Fields

Default values (`0`, `null`, etc.) are only applied to **non-final** fields. A `final` instance
variable gets no default -- you must explicitly assign it yourself.

A `final` instance variable can be assigned in exactly three places:
1. At the point of declaration.
2. In an instance initializer block.
3. In a constructor.

```java
public class MouseHouse {
    private final int volume;
    private final String name = "The Mouse House";  // 1. declaration assignment

    { volume = 10; }                                // 2. instance initializer assignment
}
```

```java
public class MouseHouse {
    private final int volume;
    private final String name;

    { volume = 10; }                    // instance initializer

    public MouseHouse() {
        this.name = "Empty House";      // 3. constructor assignment
    }
}
```

##### Each constructor is reviewed individually

The compiler checks each constructor on its own. For each constructor it asks: "by the
time this constructor finishes, have all `final` instance variables been assigned exactly
once?"

It does not share credit between constructors. If a `final` variable is not assigned in a
declaration or instance initializer, then **every** constructor must assign it -- not just one
of them.

```java
public class MouseHouse {
    private final int volume;
    private final String type;

    { this.volume = 10; }  // volume assigned here - no constructor needs to touch it

    public MouseHouse(String type) {
        this.type = type;   // type assigned - fine
    }

    public MouseHouse() {          // DOES NOT COMPILE
        this.volume = 2;           // DOES NOT COMPILE - volume already assigned in initializer
    }                              // also: type is never assigned in this constructor
}
```

Two errors in the no-argument constructor:
- `this.volume = 2` is a second assignment to a `final` variable already set in the
  instance initializer. Final variables can only be assigned once.
- `type` is never assigned anywhere outside a constructor, so this constructor was
  required to assign it. It did not. Compile error reported on the constructor declaration
  line itself.

##### `final` local variables vs. `final` instance variables

| | `final` local variable | `final` instance variable |
|---|---|---|
| Must be assigned | Only if you read it | Always -- before the constructor ends |
| Default value | None | None |
| Unread and unassigned | Legal | Compile error |

A local `final` variable that is declared but never assigned and never used is perfectly
legal -- the compiler only complains if you try to read it before assigning. Instance
`final` variables are stricter because the compiler cannot know at compile time whether
the field will be accessed later by some other method.

##### Fixing the problem with `this()` delegation

If a constructor delegates to another constructor via `this()`, the compiler follows the
chain. As long as the constructor being delegated to handles all the required `final`
assignments, the delegating constructor does not need to assign anything itself.

```java
public class MouseHouse {
    private final int volume;
    private final String type;

    { this.volume = 10; }

    public MouseHouse(String type) {
        this.type = type;   // assigns type - compiles fine
    }

    public MouseHouse() {
        this(null);         // delegates to MouseHouse(String) which assigns type
                            // null is a valid value for a final reference variable
    }
}
```

`MouseHouse()` itself never assigns `type`, but it calls `MouseHouse(String)` which does.
The compiler follows the chain and sees that by the time construction finishes, `type` is
assigned exactly once. Fine.

Note: `null` is a valid explicit assignment for a `final` reference variable. The rule is
that the variable must be **explicitly set** -- the default null that non-final fields get
automatically does not count. You have to write the assignment yourself.

---

### Initializing Instances (Instance Initialization Order)

Every time `new` is called, the following steps happen in order:

1. **Initialize the class** if it has not been initialized yet (static variables and static
   initializers, top of hierarchy first).
2. **Initialize the superclass instance** first -- follow the chain all the way up before
   doing anything in the current class.
3. **Process instance variable declarations and instance initializers in file order** -- these
   are not two separate phases. They are processed together in a single top-to-bottom pass
   in the order they appear in the source file.
4. **Run the constructor body** -- always last, after all fields and initializers are done.

##### Instance variables and initializers run in file order -- not in two separate phases

```java
public class Example {
    { System.out.println("initializer 1"); }  // runs first - appears first in file
    int x = 10;                               // runs second
    { System.out.println("initializer 2"); }  // runs third
    int y = 20;                               // runs fourth
    // constructor body runs after all of the above
}
```

If a variable declaration appears before an initializer block, the variable is assigned
first. If an initializer block appears before a variable declaration, the block runs first.
File order is the only rule.

##### The constructor always runs last

No matter where the constructor is physically written in the file, its body executes after
all instance variable declarations and instance initializer blocks have completed.

##### Full order summary

| Step | What runs |
|---|---|
| 1 | Static initialization of the class hierarchy (once ever, top down) |
| 2 | Superclass instance initialization (recurse up the chain) |
| 3 | Instance fields and instance initializers in file order (combined, top to bottom) |
| 4 | Constructor body |


---

### Instance Initialization -- Worked Examples

##### Example 1: no inheritance

```java
public class ZooTickets {
    private String name = "BestZoo";                          // line 2
    { System.out.print(name + "-"); }                         // line 3
    private static int COUNT = 0;                             // line 4
    static { System.out.print(COUNT + "-"); }                 // line 5
    static { COUNT += 10; System.out.print(COUNT + "-"); }    // line 6

    public ZooTickets() {
        System.out.print("z-");
    }

    public static void main(String... patrons) {
        new ZooTickets();
    }
}
```

Output: `0-10-BestZoo-z-`

Trace:
1. Class initialization (static, top down -- Object has nothing, ZooTickets runs lines 4, 5, 6):
   - `COUNT = 0` assigned.
   - Static block on line 5: prints `0-`.
   - Static block on line 6: `COUNT` becomes 10, prints `10-`.
2. Instance initialization (lines 2 and 3 in file order):
   - `name = "BestZoo"` assigned.
   - Instance initializer on line 3: prints `BestZoo-`.
3. Constructor body runs: prints `z-`.

---

##### Example 2: inheritance

```java
class Primate {
    public Primate() {
        // compiler inserts: super(); -> calls Object()
        System.out.print("Primate-");
    }
}

class Ape extends Primate {
    public Ape(int fur) {
        // compiler inserts: super(); -> calls Primate()
        System.out.print("Ape1-");
    }
    public Ape() {
        // compiler inserts: super(); -> calls Primate()
        System.out.print("Ape2-");
    }
}

public class Chimpanzee extends Ape {
    public Chimpanzee() {
        super(2);  // explicit call -> calls Ape(int fur)
        System.out.print("Chimpanzee-");
    }

    public static void main(String[] args) {
        new Chimpanzee();
    }
}
```

Output: `Primate-Ape1-Chimpanzee-`

Trace starting from `new Chimpanzee()`:
1. `Chimpanzee()` is called. First line: `super(2)` -- calls `Ape(int fur)`.
2. `Ape(int fur)` is called. Compiler inserted `super()` -- calls `Primate()`.
3. `Primate()` is called. Compiler inserted `super()` -- calls `Object()`.
4. `Object()` completes. Chain unwinds:
5. `Primate()` body runs: prints `Primate-`.
6. `Ape(int fur)` body runs: prints `Ape1-`.
7. `Chimpanzee()` body runs: prints `Chimpanzee-`.

Only `Ape(int fur)` is called -- not `Ape()`. Which `Ape` constructor runs depends
entirely on which one `Chimpanzee` calls via `super(2)`. `Ape()` is never involved.

##### Why this compiles even though no constructor explicitly calls super

The compiler inserts `super()` automatically into every constructor that does not start
with `super()` or `this()`. For `Primate` and both `Ape` constructors, the insertion
targets `Object()` and `Primate()` respectively -- both of which have a no-argument
constructor available. So the inserted calls have somewhere to go and everything compiles.

The only time this fails is when the compiler inserts `super()` but the parent has no
no-argument constructor -- as seen in the `Mammal`/`Seal` example earlier.

##### Why the `Mammal`/`Seal` example fails -- the two rules in conflict

The compiler inserts `super()` blindly. It does not check first whether the parent has a
no-argument constructor. It just inserts it and then the call either works or it does not.

Two rules working together cause the problem:

- **Rule 1**: the compiler only inserts a default no-argument constructor into a class that
  has **no constructors at all**. If even one constructor exists, no default is inserted.
- **Rule 2**: the compiler always inserts `super()` into any constructor that does not
  already start with `super()` or `this()`.

```java
public class Mammal {
    public Mammal(int age) {}
    // Mammal already has a constructor, so Rule 1 does not fire
    // no Mammal() is ever created
}

public class Seal extends Mammal {
    // no constructor written
    // Rule 1 fires: compiler inserts a default constructor
    // Rule 2 fires: compiler inserts super() into it

    // what the compiler produces:
    public Seal() {
        super(); // tries to call Mammal() -- which does not exist -- compile error
    }
}
```

`Mammal` already has a constructor, so the compiler never inserts `Mammal()`. Then
`Seal` gets a default constructor with `super()` inserted -- but `super()` has nowhere to
go. The inserted call points at a constructor that was never created.

---

### Initialization Order -- Further Examples

##### Example 3: static and instance mixed, no inheritance

```java
public class Cuttlefish {
    private String name = "swimmy";                    // line 2
    { System.out.println(name); }                      // line 3
    private static int COUNT = 0;                      // line 4
    static { System.out.println(COUNT); }              // line 5
    { COUNT++; System.out.println(COUNT); }            // line 6

    public Cuttlefish() {
        System.out.println("Constructor");
    }

    public static void main(String[] args) {
        System.out.println("Ready");
        new Cuttlefish();
    }
}
```

Output:
```
0
Ready
swimmy
1
Constructor
```

Trace:
1. Class initialization (static members in file order):
   - `COUNT = 0` (line 4).
   - Static block (line 5): prints `0`.
2. `main()` runs: prints `Ready`.
3. `new Cuttlefish()` -- instance initialization (lines 2, 3, 6 in file order):
   - `name = "swimmy"` (line 2).
   - Instance initializer (line 3): prints `swimmy`.
   - Instance initializer (line 6): `COUNT++` makes it 1, prints `1`.
4. Constructor body: prints `Constructor`.

Note: `COUNT` is a static variable. It can be accessed and modified from instance
initializers -- the field belongs to the class but is readable from anywhere in the class.

---

##### Example 4: inheritance with overloaded constructors (exam-level difficulty)

```java
class GiraffeFamily {
    static { System.out.print("A"); }        // line 2
    { System.out.print("B"); }               // line 3

    public GiraffeFamily(String name) {
        this(1);                             // delegates to GiraffeFamily(int)
        System.out.print("C");
    }

    public GiraffeFamily() {
        System.out.print("D");
    }

    public GiraffeFamily(int stripes) {
        System.out.print("E");
    }
}

public class Okapi extends GiraffeFamily {
    static { System.out.print("F"); }        // line 19
    { System.out.print("H"); }               // line 25

    public Okapi(int stripes) {
        super("sugar");                      // calls GiraffeFamily(String)
        System.out.print("G");
    }

    public static void main(String[] grass) {
        new Okapi(1);
        System.out.println();
        new Okapi(2);
    }
}
```

Output:
```
AFBECHG
BECHG
```

Trace for `new Okapi(1)`:

1. **Class initialization** (once ever):
   - `GiraffeFamily` is the superclass -- initialize it first: static block prints `A`.
   - `Okapi` static block prints `F`.

2. **Instance initialization of `GiraffeFamily`** (superclass first):
   - `GiraffeFamily` instance initializer (line 3): prints `B`.
   - `Okapi(int)` calls `super("sugar")` -> `GiraffeFamily(String name)`.
   - `GiraffeFamily(String name)` calls `this(1)` -> `GiraffeFamily(int stripes)`.
   - `GiraffeFamily(int stripes)` body runs: prints `E`.
   - Unwinds back to `GiraffeFamily(String name)` body: prints `C`.

3. **Instance initialization of `Okapi`**:
   - `Okapi` instance initializer (line 25): prints `H`.
   - `Okapi(int)` body continues: prints `G`.

Result: `AFBECHG`

For `new Okapi(2)`: class already initialized, so `AF` is skipped. Everything else repeats: `BECHG`.

`D` is never printed because `GiraffeFamily()` (the no-arg constructor) is never called.
Which constructor runs depends entirely on the chain that `Okapi` starts with `super("sugar")`.

---

### Initialization Rules -- Final Summary

- A class is initialized **at most once** by the JVM, before it is first referenced or used.
- All `static final` variables must be assigned exactly once: at declaration or in a static
  initializer.
- All `final` instance fields must be assigned exactly once: at declaration, in an instance
  initializer, or in a constructor.
- Non-final static and instance variables declared without a value receive a **default value**
  based on their type.
- Order of initialization: static members -> instance members (fields and initializers in
  file order) -> constructor body. Superclass always before subclass.


---

### Inheriting Members

Inheritance lets a subclass reuse methods and fields from a parent class without
redefining them. If five subclasses of `Animal` all need the same `eat()` method, define
it once in `Animal` -- all five inherit it automatically.

---

### Overriding a Method

**Method overriding** occurs when a subclass declares a new implementation for an
inherited method with the same signature and a compatible return type.

Reminder: the method signature is the **name + parameter list** only. Return type,
access modifier, optional specifiers, and exceptions are not part of the signature.

```java
public class Marsupial {
    public double getAverageWeight() {
        return 50;
    }
}

public class Kangaroo extends Marsupial {
    public double getAverageWeight() {
        return super.getAverageWeight() + 20;  // calls parent version, adds 20
    }

    public static void main(String[] args) {
        System.out.println(new Marsupial().getAverageWeight()); // 50.0
        System.out.println(new Kangaroo().getAverageWeight()); // 70.0
    }
}
```

`Kangaroo` overrides `getAverageWeight()` but still calls the parent version via `super`.
This is a common pattern: extend the parent's behaviour rather than replace it entirely.

- `this.getAverageWeight()` inside `Kangaroo` would call the overridden (Kangaroo) version.
- `super.getAverageWeight()` inside `Kangaroo` always calls the parent (Marsupial) version.

##### Override rules -- the full picture

**Rule 1: same signature = override (automatic, no annotation required)**

If a subclass declares a method with the same name and parameter list as an inherited
method, it is automatically an override. The `@Override` annotation is optional -- Java
does not require it. However, you should always use it because:
- It tells the compiler to verify this is actually an override. If you misspelled the method
  name or got the parameters wrong, the compiler catches it immediately.
- Without `@Override`, a typo silently creates a new unrelated method instead of
  overriding anything -- a hard bug to spot.

```java
public class Animal {
    public void eat() { System.out.println("eating"); }
}

public class Dog extends Animal {
    @Override
    public void eat() { System.out.println("dog eating"); }  // correct override

    public void Eat() {}   // NOT an override - different name (capital E), new method
    public void eat(int x) {} // NOT an override - different parameter list, new overload
}
```

**Rule 2: return type must be the same or a subtype (covariant return type)**

The return type of the overriding method must be identical to or a subtype of the
parent's return type. This is called a **covariant return type**.

```java
public class Animal {
    public Animal create() { return new Animal(); }
}

public class Dog extends Animal {
    @Override
    public Dog create() { return new Dog(); }  // fine - Dog is a subtype of Animal
}
```

```java
public class Animal {
    public Dog create() { return new Dog(); }
}

public class Kitten extends Animal {
    @Override
    public Animal create() { return new Animal(); }  // DOES NOT COMPILE
    // Animal is a supertype of Dog, not a subtype - not covariant
}
```

**Rule 3: access modifier must be the same or more permissive**

You cannot reduce visibility when overriding. You can increase it or keep it the same.

```java
public class Animal {
    protected void breathe() {}
}

public class Dog extends Animal {
    public void breathe() {}     // fine - public is more permissive than protected
    void breathe() {}            // DOES NOT COMPILE - package is less permissive than protected
    private void breathe() {}    // DOES NOT COMPILE - private is less permissive
}
```

**Rule 4: cannot throw new or broader checked exceptions**

The overriding method may throw the same checked exceptions, narrower ones, or none
at all. It cannot throw new or broader checked exceptions.

```java
public class Animal {
    public void sleep() throws IOException {}
}

public class Dog extends Animal {
    public void sleep() throws IOException {}           // fine - same
    public void sleep() throws FileNotFoundException {} // fine - narrower (subclass of IOException)
    public void sleep() {}                              // fine - throws nothing
    public void sleep() throws Exception {}             // DOES NOT COMPILE - broader than IOException
    public void sleep() throws SQLException {}          // DOES NOT COMPILE - unrelated checked exception
}
```

Unchecked exceptions (`RuntimeException` and subclasses) can be added freely -- they
are not subject to this rule.

**Rule 5: cannot override a `static` method with an instance method or vice versa**

```java
public class Animal {
    public static void breathe() {}
}

public class Dog extends Animal {
    @Override
    public void breathe() {}  // DOES NOT COMPILE - static vs instance mismatch
}
```

Static methods are not overridden -- they are hidden. More on this shortly.

**Rule 6: `final` methods cannot be overridden**

```java
public class Animal {
    public final void breathe() {}
}

public class Dog extends Animal {
    public void breathe() {}  // DOES NOT COMPILE - cannot override a final method
}
```

##### `@Override` does not change behaviour -- it only adds compiler verification

Without `@Override`:

```java
public class Dog extends Animal {
    public void eet() {}  // typo - compiles fine, silently creates a new method
}
```

With `@Override`:

```java
public class Dog extends Animal {
    @Override
    public void eet() {}  // DOES NOT COMPILE - compiler sees this is not actually an override
}
```

Always use `@Override`. It catches mistakes that would otherwise silently slip through.

---

### Overriding -- The Four Rules in Detail

##### Infinite call trap -- why `super` matters in an override

```java
public class Kangaroo extends Marsupial {
    public double getAverageWeight() {
        return getAverageWeight() + 20;  // StackOverflowError at runtime
    }
}
```

Without `super`, `getAverageWeight()` calls itself -- the overriding version, not the
parent version. Java does not look up to the parent automatically. The method recurses
infinitely and crashes with a `StackOverflowError` at runtime. Not a compile error.

---

##### Rule 1: same signature

Same name + same parameter list = override. Different parameter list = overload (a
completely independent method with no polymorphic relationship to the parent version).

**Extra: what happens if you match the signature but break another rule -- without `@Override`?**

You cannot escape the override rules by omitting `@Override`. The annotation only adds
a compiler verification step -- it does not change what the code means.

When the signature matches an inherited method, Java always treats the new method as
an override attempt and enforces all four rules. There is no way to declare it as a "brand
new unrelated method" when the name and parameter list are identical to something
inherited.

```java
public class Animal {
    public CharSequence getName() { return "animal"; }
}

public class Dog extends Animal {
    // same signature, non-covariant return type -- compile error, not a new method
    public int getName() { return 1; } // DOES NOT COMPILE
}
```

If the parameter list is different, it is genuinely a new overloaded method and the return
type can be anything:

```java
public class Dog extends Animal {
    public int getName(int x) { return 1; } // different params = new overload, no rules apply
}
```

---

##### Rule 2: access modifier must be same or more permissive

You cannot reduce visibility when overriding. Reducing it would create an ambiguity:

```java
public class Camel {
    public int getNumberOfHumps() { return 1; }
}

public class BactrianCamel extends Camel {
    private int getNumberOfHumps() { return 2; } // DOES NOT COMPILE
}
```

If this were allowed, the following would be ambiguous:

```java
Camel c = new BactrianCamel();
c.getNumberOfHumps(); // reference type Camel says public, actual object says private -- contradiction
```

Java prevents this by requiring the override to be at least as accessible.

If the overriding method is `public` as well, the call is unambiguous and compiles:

```java
public class BactrianCamel extends Camel {
    public int getNumberOfHumps() { return 2; }  // fine - same or more permissive
}

Camel c = new BactrianCamel();
c.getNumberOfHumps(); // returns 2 - the overriding version is called (polymorphism)
```

When the reference type is `Camel` but the object is `BactrianCamel`, Java always calls
the most specific overriding version at runtime. This is the core of polymorphism.

---

##### Rule 3: checked exceptions -- cannot be new or broader

The overriding method may throw the same checked exceptions, narrower ones (subclasses),
or none at all. It cannot introduce new checked exceptions or broaden the declared ones.

```java
public class Reptile {
    protected void sleep() throws IOException {}
    protected void hide() {}
    protected void exitShell() throws FileNotFoundException {}
}

public class GalapagosTortoise extends Reptile {
    public void sleep() throws FileNotFoundException {}  // fine - FileNotFoundException is narrower than IOException
    public void hide() throws FileNotFoundException {}  // DOES NOT COMPILE - introduces a new checked exception
    public void exitShell() throws IOException {}       // DOES NOT COMPILE - IOException is broader than FileNotFoundException
}
```

`FileNotFoundException` is a subclass of `IOException` -- narrower means more specific.
Unchecked exceptions (`RuntimeException` subclasses) can be added freely to any override.

---

##### Rule 4: covariant return type

The return type of the overriding method must be the same as or a subtype of the parent's
return type.

Quick test: given parent return type A and overriding return type B -- can you assign a B
to an A reference without casting? If yes, B is covariant with A.

```java
public class Rhino {
    protected CharSequence getName() { return "rhino"; }
    protected String getColor() { return "grey"; }
}

public class JavanRhino extends Rhino {
    public String getName() { return "javan rhino"; }        // fine - String is a subtype of CharSequence
    public CharSequence getColor() { return "grey"; }        // DOES NOT COMPILE - CharSequence is NOT a subtype of String
}
```

`String` is a subtype of `CharSequence` (String implements CharSequence), so `getName()`
compiles. `CharSequence` is a supertype of `String`, not a subtype -- not all `CharSequence`
values are `String` values (a `StringBuilder` is a `CharSequence` but not a `String`).
So `getColor()` does not compile.

Special case: if the return type is `void`, both parent and override must be `void`. Nothing
is covariant with `void` except `void` itself.

---

### Redeclaring Private Methods

Private methods are not inherited, so they cannot be overridden. A child class can declare
a method with the same name as a private parent method, but it is a completely new
independent method -- none of the override rules apply.

```java
public class Beetle {
    private String getSize() { return "Undefined"; }
}

public class RhinocerosBeetle extends Beetle {
    private int getSize() { return 5; }  // fine - new independent method, not an override
                                          // return type difference is allowed because this is not an override
}
```

If `getSize()` in `Beetle` were `public`, then `RhinocerosBeetle`'s version would be an
attempted override -- and it would fail: `private` is more restrictive than `public` (rule 2),
and `int` is not covariant with `String` (rule 4).

---

### Hiding Static Methods

Static methods cannot be overridden. A child class that defines a static method with the
same signature as a parent static method **hides** it rather than overrides it.

##### Why it is called "hiding" and not "overriding"

The word "hiding" is not arbitrary -- it describes exactly what happens at a mechanical level.

When you override an instance method, the child's version genuinely replaces the parent's
for that object. No matter what reference type you use to hold the object, the runtime
always dispatches to the child's version. The parent's version is superseded and
unreachable (except via `super` inside the class).

When you "hide" a static method, the parent's version is never replaced -- it is just
blocked from view depending on which reference type you look through. Switch to a parent
reference and the parent's static method reappears immediately. Both versions exist at the
same time and both are reachable -- you just get a different one depending on the declared
type of the reference you used to access it.

The name "hiding" means exactly that: the child version is sitting in front of the parent
version and obscuring it. The parent version is still there, just hidden behind the child's.

This is also why static methods do not participate in polymorphism: polymorphism is about
the runtime object deciding which method runs. Static methods are resolved at compile
time using the declared reference type, so there is no runtime dispatch happening at all.
The JVM never looks at the actual object to decide which static method to call.

##### `super` cannot be used in a static context

`super` is a reference to the parent instance. In a static method there is no instance, so
`super` is illegal and the compiler rejects it immediately -- whether you are trying to
access a field or call a method.

```java
public class Bear {
    public static void eat() { System.out.println("Bear eating"); }
}

public class Panda extends Bear {
    public static void eat() {
        super.eat(); // DOES NOT COMPILE - super not allowed in a static context
    }
}
```

To call the parent's hidden static method from inside the child class, use the parent class
name explicitly:

```java
public class Panda extends Bear {
    public static void eat() {
        Bear.eat();                         // fine - explicit class name reaches the hidden method
        System.out.println("Panda eating");
    }
}
```

This is the only way to reach a hidden static method from the subclass. Outside the class,
anyone can call `Bear.eat()` directly the same way.

The same four override rules apply to hiding, plus one more:

**Rule 5: both methods must either both be static or both be non-static.** If one is static
and the other is not, the class does not compile.

```java
public class Bear {
    public static void eat() { System.out.println("Bear is eating"); }
}

public class Panda extends Bear {
    public static void eat() { System.out.println("Panda is chewing"); }

    public static void main(String[] args) {
        eat(); // prints "Panda is chewing" - Panda's version hides Bear's
    }
}
```

If `eat()` is removed from `Panda`, the inherited `Bear.eat()` is used and prints
`"Bear is eating"`.

##### Static vs instance mismatch -- all three cases fail

```java
public class Bear {
    public static void sneeze() {}     // static
    public void hibernate() {}         // instance
    public static void laugh() {}      // static
}

public class SunBear extends Bear {
    public void sneeze() {}            // DOES NOT COMPILE - parent is static, child is instance
    public static void hibernate() {}  // DOES NOT COMPILE - parent is instance, child is static
    protected static void laugh() {}   // DOES NOT COMPILE - static match fine, but protected is
                                       // more restrictive than public (rule 2 violated)
}
```

- `sneeze`: static in parent, instance in child -- rule 5 violated.
- `hibernate`: instance in parent, static in child -- rule 5 violated.
- `laugh`: both static (fine for rule 5), but `protected` is more restrictive than `public`
  -- rule 2 violated.

##### Overriding vs hiding -- the key behavioural difference

- **Overriding** replaces the method for all reference types (except `super`). At runtime,
  Java always calls the most specific version regardless of what reference type you use.
- **Hiding** only replaces the method when accessed through a child reference type. If you
  use a parent reference type, the parent version is called.

The difference only becomes visible when you use a parent reference type pointing at a
child object:

```java
class Bear {
    public static void eat() { System.out.println("Bear eating"); }    // static - will be hidden
    public void sleep() { System.out.println("Bear sleeping"); }       // instance - will be overridden
}

class Panda extends Bear {
    public static void eat() { System.out.println("Panda eating"); }   // hides Bear.eat()
    public void sleep() { System.out.println("Panda sleeping"); }      // overrides Bear.sleep()
}
```

```java
Bear b = new Panda();  // reference type is Bear, actual object is Panda

b.eat();    // "Bear eating"    -- HIDING: reference type (Bear) decides -> Bear.eat() called
b.sleep();  // "Panda sleeping" -- OVERRIDING: runtime object (Panda) decides -> Panda.sleep() called
```

Same object. Same reference variable. Two different behaviours:

- `sleep()` is overridden -- Java looks at the actual runtime object. The object is a
  `Panda`, so `Panda.sleep()` runs. The reference type does not matter.
- `eat()` is hidden -- Java looks at the declared reference type at compile time. The
  reference is `Bear`, so `Bear.eat()` runs. The fact that the object is actually a `Panda`
  is irrelevant.

Hidden static methods do not participate in polymorphism. Whatever reference type you
hold, you get that type's static method. Overridden instance methods do participate in
polymorphism -- the runtime object always wins.

More on this distinction in Chapter 7 (polymorphism).

---

### Hiding Variables

Variables cannot be overridden -- only hidden. A child class that declares a variable with
the same name as an inherited variable creates two separate copies inside the same object:
one at the parent level and one at the child level.

Which copy you see depends entirely on the **declared reference type**, not the actual
object type.

```java
class Carnivore {
    protected boolean hasFur = false;
}

public class Meerkat extends Carnivore {
    protected boolean hasFur = true;

    public static void main(String[] args) {
        Meerkat m = new Meerkat();
        Carnivore c = m;               // same object, different reference type

        System.out.println(m.hasFur);  // true  - Meerkat reference -> Meerkat's hasFur
        System.out.println(c.hasFur);  // false - Carnivore reference -> Carnivore's hasFur
    }
}
```

Only one object exists. Both `hasFur` variables exist inside it independently. The reference
type used to access the variable determines which copy is returned.

This is different from overriding: with overriding, the runtime type of the object
determines which method runs. With variable hiding, the compile-time reference type
determines which variable is seen.

---

### Writing `final` Methods

A `final` method cannot be overridden by a subclass. This rule applies to both overriding
and hiding -- a `final` instance method cannot be overridden, and a `final` static method
cannot be hidden.

```java
public class Bird {
    public final boolean hasFeathers() {
        return true;
    }
    public final static void flyAway() {}
}

public class Penguin extends Bird {
    public final boolean hasFeathers() { // DOES NOT COMPILE - cannot override a final method
        return false;
    }
    public final static void flyAway() {} // DOES NOT COMPILE - cannot hide a final static method
}
```

Whether the child's version also uses `final` is irrelevant -- the code will not compile
either way. The `final` on the parent is the only thing that matters.

##### `final` only blocks inheritance -- not redeclaration of private methods

This rule only applies to inherited methods. If the parent method is `private`, it is not
inherited at all, so there is nothing to block. The child class is simply declaring a brand
new method that happens to share the name.

```java
public class Bird {
    private final boolean hasFeathers() { return true; }
    private final static void flyAway() {}
}

public class Penguin extends Bird {
    public boolean hasFeathers() { return false; } // fine - not an override, redeclaring
    public static void flyAway() {}                // fine - not hiding, redeclaring
}
```

No inheritance, no override rules, no `final` restriction. Both methods in `Penguin` are
completely new and unrelated to `Bird`'s private versions.

---

### Creating Abstract Classes

##### The problem `abstract` solves

Sometimes you want to define a type in the hierarchy without it ever being instantiated
directly. You want subclasses to exist and be instantiated, but not the parent itself.
You also want to guarantee that every concrete subclass provides a specific method
implementation, without prescribing what that implementation is.

`abstract` solves both of those problems at once.

##### Declaring an abstract class

An abstract class is declared with the `abstract` modifier. It cannot be instantiated
directly -- `new AbstractClass()` is always a compile error.

```java
public abstract class Canine {}
public class Wolf extends Canine {}
public class Fox extends Canine {}
public class Coyote extends Canine {}
```

`Wolf`, `Fox`, and `Coyote` can all be instantiated. `Canine` cannot. A variable can still
have type `Canine`, but the actual object at runtime must be one of the concrete subclasses.

```java
abstract class Alligator {
    public static void main(String... food) {
        var a = new Alligator(); // DOES NOT COMPILE - cannot instantiate an abstract class
    }
}
```

An abstract class can be initialized only as part of instantiating a non-abstract subclass.
When you call `new Wolf()`, the `Canine` portion of the object is initialized as part of that
process -- but you never call `new Canine()` directly.

##### Abstract methods

An abstract class can declare abstract methods. An abstract method has the `abstract`
modifier and no body -- not even empty braces. It ends with a semicolon.

```java
public abstract class Canine {
    public abstract String getSound();   // no body - ends with semicolon
    public void bark() { System.out.println(getSound()); }
}
```

An abstract method is a contract: every concrete (non-abstract) subclass in the hierarchy
must provide an implementation, or it too must be declared `abstract`.

```java
public class Wolf extends Canine {
    public String getSound() {
        return "Wooooooof!";
    }
}
```

`Wolf` is concrete (not abstract) and provides `getSound()` -- this compiles fine.

##### What does and does not compile -- common exam traps

```java
public class Jackal extends Canine {
    public abstract String name;       // DOES NOT COMPILE - variables cannot be abstract
    public String getSound() {
        return "Laugh";
    }
}
```

Only methods can be marked `abstract`. Variables cannot.

A concrete class that fails to implement an abstract method:

```java
public class ArcticFox extends Canine {
    // does not override getSound()    // DOES NOT COMPILE - abstract method not implemented
}
```

`ArcticFox` is not marked `abstract`, so it is concrete. It must implement every abstract
method inherited from `Canine`. It does not, so it fails to compile.

A non-abstract class declaring an abstract method:

```java
public class Direwolf extends Canine {
    public String getSound() { return "Roar"; }
    public abstract void rest();      // DOES NOT COMPILE - concrete class cannot declare abstract methods
}
```

Only abstract classes can declare abstract methods. If you want to declare one, the class
itself must be `abstract`.

An override with a non-covariant return type:

```java
public class FennecFox extends Canine {
    public int getSound() { return 1; } // DOES NOT COMPILE - int is not covariant with String
}
```

All the normal override rules still apply when implementing an abstract method. The return
type must be the same or a subtype of the abstract method's return type.

##### Quick rules for abstract classes and methods

| Rule | Detail |
|---|---|
| Abstract class cannot be instantiated | `new AbstractClass()` is always a compile error |
| Abstract class can have abstract methods | Zero or more -- it is not required to have any |
| Abstract class can have concrete methods | Both abstract and non-abstract methods are allowed |
| Abstract method has no body | Ends with `;`, no `{}` |
| Variables cannot be abstract | Only methods can carry the `abstract` modifier |
| Concrete subclass must implement all abstract methods | Or itself be declared `abstract` |
| Abstract class can extend another abstract class | And may choose not to implement the parent's abstract methods |
| Non-abstract class cannot declare abstract methods | Declaring one forces the class to be `abstract` |



---

### Declaring Abstract Methods

##### An abstract class does not need abstract methods

An abstract class can contain everything a normal class can: variables, static and instance
methods, constructors, and so on. It is not required to have any abstract methods at all.
The only thing that makes a class abstract is the `abstract` keyword on the class itself.

```java
public abstract class Llama {
    public void chew() {}  // concrete method - fine in an abstract class
}
// Llama cannot be instantiated, but has no abstract methods
```

##### An abstract method cannot have a body

An abstract method ends with `;` and has no `{}`. Adding a body is a compile error.

```java
public abstract class Animal {
    public abstract void breathe();      // fine - no body
    public abstract void eat() {}        // DOES NOT COMPILE - abstract method cannot have a body
}
```

If you want a default implementation that subclasses can optionally override, just make it
a regular (non-abstract) concrete method. As long as it is not marked `final`, subclasses
are free to override it.

---

### Modifier Placement Rules

##### The general structure of a declaration

Every class and method declaration follows this conceptual order:

```
[access modifier]  [optional specifiers]  [return type / class keyword]  [name]  ...
```

In practice, Java is flexible about the order of modifiers that appear before the keyword
`class` or before the return type -- with one hard constraint: they must all come **before**
`class` (for classes) or **before the return type** (for methods). Once you hit `class` or
the return type, modifiers are no longer allowed.

##### Access modifiers

For a **top-level class**, only `public` or package (no modifier) is allowed. `protected` and
`private` are not legal on top-level classes.

For a **method**, any of the four access modifiers is allowed: `public`, `protected`, package,
`private`.

Access modifiers must appear before the return type (for methods) or before `class` (for
classes). They cannot appear after.

##### Optional specifiers (for methods)

Optional specifiers include `static`, `final`, `abstract`, `synchronized`, `native`, and
`strictfp`. For the exam the relevant ones are `static`, `final`, and `abstract`.

These must also appear before the return type. They can appear before or after the access
modifier, but never after the return type.

##### The `abstract` keyword -- placement rules

For a **class declaration**:
- Must come before the `class` keyword.
- Can be before or after the access modifier.
- Cannot come after `class`.

```java
public abstract class Tiger {}    // fine - abstract before class, after access modifier
abstract public class Tiger {}    // fine - abstract before access modifier, before class

public class abstract Bear {}     // DOES NOT COMPILE - abstract after class keyword
```

For a **method declaration**:
- Must come before the return type.
- Can be before or after the access modifier.
- Cannot come after the return type.

```java
public abstract int claw();       // fine - abstract before return type, after access modifier
abstract public int claw();       // fine - abstract before access modifier, before return type

public int abstract howl();       // DOES NOT COMPILE - abstract after return type
```

##### Full placement reference

```java
// CLASS - legal positions for abstract
public abstract class A {}   // fine
abstract public class A {}   // fine
public class abstract A {}   // DOES NOT COMPILE

// METHOD - legal positions for abstract
public abstract void run();        // fine
abstract public void run();        // fine
public void abstract run();        // DOES NOT COMPILE

// METHOD - legal positions for other specifiers (same rule applies to static, final)
public static void go() {}         // fine
static public void go() {}         // fine
public void static go() {}         // DOES NOT COMPILE

public final void stop() {}        // fine
final public void stop() {}        // fine
public void final stop() {}        // DOES NOT COMPILE
```

##### Key rule to remember

Everything goes **before** the `class` keyword or **before** the return type. Once you
reach `class` or the return type in the declaration, no more modifiers are allowed. The
order among the modifiers themselves (access vs. specifier) does not matter -- both
orderings compile.

##### `abstract` cannot be combined with `final` or `private`

These combinations are contradictions and will not compile:

| Combination | Why it fails |
|---|---|
| `abstract final class` | `abstract` requires subclassing; `final` forbids it |
| `abstract final method` | `abstract` requires overriding; `final` forbids it |
| `abstract private method` | `abstract` requires subclasses to override it; `private` means subclasses cannot see it -- impossible to fulfil the contract |

```java
public abstract final class Moose {}          // DOES NOT COMPILE
public abstract class Moose {
    public abstract final void eat();         // DOES NOT COMPILE
    private abstract void sleep();            // DOES NOT COMPILE
}
```


---

### Creating a Concrete Class

A **concrete class** is any non-abstract class. It becomes the point at which the hierarchy
must be complete: every abstract method inherited from anywhere in the chain must have
an implementation by the time you reach the first concrete subclass.

##### The first concrete subclass rule

The first concrete subclass that extends an abstract class is required to implement all
inherited abstract methods. Abstract classes in the middle of the chain can defer -- they
are not required to implement anything.

```java
public abstract class Animal {
    public abstract String getName();
}

public class Walrus extends Animal {} // DOES NOT COMPILE
// Walrus is the first concrete subclass - it must implement getName() - it does not
```

##### Abstract classes can partially implement the chain

An abstract class extending another abstract class can implement some, all, or none of
the parent's abstract methods. Whatever it does not implement gets passed down as still
abstract, and the first concrete subclass must cover the rest.

```java
public abstract class Mammal {
    abstract void showHorn();
    abstract void eatLeaf();
}

public abstract class Rhino extends Mammal {
    void showHorn() {}  // implements showHorn() -- no longer abstract in the chain
                        // eatLeaf() is not implemented -- still abstract, passed down
}

public class BlackRhino extends Rhino {
    void eatLeaf() {}   // BlackRhino is the first concrete subclass
                        // showHorn() was already implemented by Rhino - not required here
                        // eatLeaf() is still abstract - must implement it - does so here
}
```

`BlackRhino` only needs to implement `eatLeaf()` because `Rhino` already provided a
concrete `showHorn()`. `BlackRhino` is permitted but not required to override `showHorn()`.

##### Making a middle class concrete breaks the chain

If you remove `abstract` from `Rhino`, it becomes the first concrete subclass and must
implement everything:

```java
public class Rhino extends Mammal { // DOES NOT COMPILE
    void showHorn() {}
    // eatLeaf() not implemented - Rhino is now concrete and must implement both
}
```

##### Longer chain -- abstract methods accumulating across levels

```java
public abstract class Animal {
    abstract String getName();
}

public abstract class BigCat extends Animal {
    protected abstract void roar();
    // getName() not implemented here - still abstract, passed down
}

public class Lion extends BigCat {
    public String getName() { return "Lion"; }                          // from Animal
    public void roar() { System.out.println("The Lion lets out a loud ROAR!"); } // from BigCat
}
```

`BigCat` is abstract so it can ignore `getName()`. `Lion` is the first concrete subclass and
must implement both `getName()` (inherited from `Animal` via `BigCat`) and `roar()`
(declared in `BigCat`). It does, so it compiles.

##### Quick mental checklist for concrete subclasses

When you see a concrete class extending an abstract class on the exam:

1. Find every `abstract` method anywhere in the hierarchy above it.
2. Check whether any class between the abstract root and this concrete class already
   provided a concrete (non-abstract) implementation.
3. Whatever is still abstract must be implemented in the concrete class.
4. If any are missing, the concrete class does not compile.


---

### Constructors in Abstract Classes

Abstract classes can and do have constructors. They follow exactly the same rules as
constructors in non-abstract classes: the compiler inserts a default no-argument constructor
if none is declared, and every constructor must start with `super()` or `this()`.

The only difference is that an abstract class constructor can never be called via `new
AbstractClass()` directly -- it can only be reached when a non-abstract subclass is being
instantiated and the superclass chain is being initialised.

```java
abstract class Mammal {
    abstract CharSequence chew();

    public Mammal() {
        System.out.println(chew()); // compiles and runs fine
    }
}

public class Platypus extends Mammal {
    String chew() { return "yummy!"; }

    public static void main(String[] args) {
        new Platypus();  // prints: yummy!
    }
}
```

Trace:
1. `new Platypus()` -- `Platypus` has no constructor, so the compiler inserts a default one.
2. The default constructor calls `super()`, which runs `Mammal()`.
3. Inside `Mammal()`, `chew()` is called. At this point, the actual runtime object is a
   `Platypus`, so `Platypus.chew()` runs -- even though we are still inside the `Mammal`
   constructor. Returns `"yummy!"` which is printed.
4. `Mammal()` finishes. `Platypus` construction completes.

This works because by the time `Mammal()`'s body executes, there is already a concrete
object being constructed -- the `Platypus`. The `chew()` method has an implementation
available even at the moment the abstract class's constructor runs.

##### The key distinction

An abstract class constructor is identical to any other constructor in terms of rules and
compiler behaviour. It is only restricted in one way: it cannot be the target of a direct
`new` call. It can only be reached through the constructor chain of a concrete subclass.

##### Watch out: calling abstract (overridable) methods from a constructor

The example above compiles and works, but calling an overridable method from a
constructor is generally risky. If the subclass's `chew()` relied on a field that had not
been initialised yet (because the subclass's own field initialisers and constructor body
run after the superclass constructor finishes), it could return an unexpected value or throw
an exception.

```java
abstract class Mammal {
    abstract CharSequence chew();
    public Mammal() {
        System.out.println(chew());
    }
}

public class Platypus extends Mammal {
    private String food = "yummy!";  // initialised AFTER Mammal() runs
    String chew() { return food; }

    public static void main(String[] args) {
        new Platypus();  // prints: null  (food is not yet assigned when chew() is called)
    }
}
```

`food` is `null` when `Mammal()`'s body runs because instance field initialisers for
`Platypus` have not executed yet. The constructor chain goes top-down: `Mammal()`
runs before `Platypus`'s own fields are set. The exam will test you on this interaction.

The good practice is to not call overridable methods from a constructor at all -- abstract
or not. The parent constructor has no way to know whether the subclass version of that
method depends on subclass state that has not been set up yet.

The standard fix is to pass the value as a constructor argument instead of calling back
into the subclass:

```java
abstract class Mammal {
    public Mammal(CharSequence food) {
        System.out.println(food); // no virtual dispatch - just uses the value passed in
    }
}

public class Platypus extends Mammal {
    private String food = "yummy!";
    public Platypus() {
        super("yummy!"); // value passed directly - no dependency on field initialisation order
    }
}
```

The parent receives the value it needs without reaching back into the subclass. Field
initialisation order is no longer a concern.

---

### Spotting Invalid Abstract Method Declarations

Abstract methods have strict syntax requirements. The exam frequently presents methods
that look almost right but fail on one detail.

```java
public abstract class Turtle {
    public abstract long eat()          // DOES NOT COMPILE - missing semicolon
    public abstract void swim() {};     // DOES NOT COMPILE - abstract method cannot have a body
    public abstract int getAge() {      // DOES NOT COMPILE - abstract method cannot have a body
        return 10;
    }
    public abstract void sleep;         // DOES NOT COMPILE - missing parentheses ()
    public void goInShell();            // DOES NOT COMPILE - concrete method must have a body
}
```

Line by line:
- `eat()` -- `abstract` method declarations must end with `;`. Missing it is a compile error.
- `swim()` -- has `{}` after the declaration. An abstract method cannot have a body, not even empty braces.
- `getAge()` -- same as above. Body with a return statement, but `abstract` forbids any body at all.
- `sleep` -- missing `()`. Without parentheses it is not a method declaration at all.
- `goInShell()` -- not marked `abstract`, so it is a concrete method. Concrete methods must provide a body. A semicolon instead of `{}` is only legal for abstract methods.

The rule in two parts:
- `abstract` method: ends with `;`, no `{}` anywhere.
- Concrete method: must have `{}`, even if the body is empty.

---

### Illegal Modifier Combinations on Abstract Classes and Methods

##### `abstract` + `final`

`abstract` means "must be extended or overridden." `final` means "cannot be extended or
overridden." They are direct opposites and cannot appear together on either a class or a
method.

```java
public abstract final class Tortoise { // DOES NOT COMPILE
    public abstract final void walk();  // DOES NOT COMPILE
}
```

##### `abstract` + `private`

An abstract method is a contract that subclasses must fulfil by overriding it. A `private`
method is invisible to subclasses -- they cannot inherit it, so they cannot override it. The
contract can never be fulfilled, and the compiler rejects it immediately.

```java
public abstract class Whale {
    private abstract void sing(); // DOES NOT COMPILE
}

public class HumpbackWhale extends Whale {
    private void sing() {          // this looks like an implementation but it is not
        System.out.println("Humpback whale is singing");
    }
}
```

Even though `HumpbackWhale` declares a `sing()` method, it is not an override of
`Whale.sing()` because `private` methods are not inherited. The compiler catches the
problem at the `private abstract` declaration in `Whale` -- it never even gets to
`HumpbackWhale`.

Note: `final` and `private` together on a method is legal (though redundant). `abstract` and
`private` together is not.

##### Changing `private` to `protected` in the parent does not automatically fix things

```java
public abstract class Whale {
    protected abstract void sing();
}

public class HumpbackWhale extends Whale {
    private void sing() { // DOES NOT COMPILE - reduces visibility
        System.out.println("Humpback whale is singing");
    }
}
```

The abstract modifier is removed so the `private abstract` error is gone -- but now the
normal override rule kicks in: you cannot reduce visibility when overriding. `protected` in
the parent means the override must be `protected` or `public`. `private` is more
restrictive, so it still does not compile -- for a completely different reason.

##### `abstract` + `static`

A static method belongs to the class, not to any instance. Static methods can only be
hidden, not overridden. If a method cannot be overridden, it can never be implemented by
a subclass -- making `abstract` meaningless. The combination is rejected.

```java
abstract class Hippopotamus {
    abstract static void swim(); // DOES NOT COMPILE
}
```

##### Illegal combinations -- quick reference

| Combination | Why illegal |
|---|---|
| `abstract final` class or method | Contradictory: abstract requires extension, final forbids it |
| `abstract private` method | Private methods are not inherited; the contract can never be fulfilled |
| `abstract static` method | Static methods cannot be overridden; the contract can never be fulfilled |


---

### Declaring an Immutable Class

An **immutable object** is an object whose state cannot change after it is created. Every
field is set at construction time and stays the same for the life of the object. `String` is
the canonical Java example.

There are five rules for writing an immutable class. Each one seals off a specific path
through which state could otherwise be changed.

##### Rule 1: Mark the class `final` (or make all constructors `private`)

If the class can be subclassed, someone can extend it, add mutable fields, and override
methods to return different values. Their subclass is still a valid instance of your type, but
it is mutable. `final` cuts that off entirely.

```java
public class ImmutablePoint {
    private final int x;
    private final int y;
    public ImmutablePoint(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
}

// attacker subclasses it and adds mutable state
public class MutablePoint extends ImmutablePoint {
    private int secretX;
    public MutablePoint(int x, int y) { super(x, y); this.secretX = x; }
    @Override
    public int getX() { return secretX; }  // overridden to return different values
    public void setSecretX(int v) { this.secretX = v; }
}

ImmutablePoint p = new MutablePoint(1, 2);
((MutablePoint) p).setSecretX(99);
p.getX(); // 99 -- the supposed immutable object changed
```

Marking `ImmutablePoint` as `final` prevents `MutablePoint` from compiling at all.

##### Rule 2: Mark all instance variables `private` and `final`

`private` prevents external code from reading or writing fields directly. `final` prevents
anything -- including the class's own methods -- from reassigning the field after the
constructor finishes.

Without `private`: `animal.name = "Tiger"` is legal from anywhere.
Without `final`: a method inside the class could do `this.name = "Tiger"` later.

Both are needed. `private` seals the field from outside; `final` seals it from inside.

##### Rule 3: Don't define setter methods

The direct consequence of rule 2. Do not provide any method whose purpose is to change
state. With `private final` fields a setter cannot reassign the field anyway, but the rule
exists as a design principle: no API should promise to modify the object's state.

##### Rule 4: Don't allow referenced mutable objects to be modified

This is the subtle rule. A `final` field means the reference stored in that field cannot be
changed -- it will always point to the same object. But if that object is itself mutable, its
contents can still change.

```java
public final class Animal {
    private final ArrayList<String> favoriteFoods;

    public Animal() {
        this.favoriteFoods = new ArrayList<>();
        this.favoriteFoods.add("Apples");
    }

    public List<String> getFavoriteFoods() {
        return favoriteFoods;  // hands out the real list reference
    }
}

var zebra = new Animal();
zebra.getFavoriteFoods().clear();
zebra.getFavoriteFoods().add("Chocolate Chip Cookies");
// the list changed - Animal is not immutable
```

`favoriteFoods` is `final` -- the field always points to the same `ArrayList` object. But
`ArrayList` is mutable, and the getter just handed the caller a direct reference to it. The
field reference never changed, but the contents did.

**Fix option 1: delegate read access through wrapper methods**

Never hand out the reference. Expose only the operations callers need:

```java
public final class Animal {
    private final List<String> favoriteFoods;

    public Animal() {
        this.favoriteFoods = new ArrayList<>();
        this.favoriteFoods.add("Apples");
    }

    public int getFavoriteFoodsCount() {
        return favoriteFoods.size();
    }

    public String getFavoriteFoodsItem(int index) {
        return favoriteFoods.get(index);
    }
}
```

Callers can read the data but have no reference to the list itself, so they cannot mutate it.

**Fix option 2: return a defensive copy**

Return a copy of the mutable object instead of the original. Changes to the copy do not
affect the internal state.

```java
public ArrayList<String> getFavoriteFoods() {
    return new ArrayList<>(this.favoriteFoods);  // copy - original is untouched
}
```

The trade-off: a new object is allocated on every call. For large collections called
frequently this can be expensive.

##### Rule 5: Use a constructor to set all properties, making a copy if needed

All state is set in the constructor -- that is the only place. But if the constructor accepts a
mutable object as a parameter and stores the reference directly, the caller still holds that
reference and can mutate it from outside.

The constructor is also where you enforce **invariants** -- conditions that must be true for
every instance of the object at all times. For example, "favoriteFoods must always contain
at least one element" is an invariant. You validate it on the way in and throw if it is violated.

```java
public final class Animal {
    private final ArrayList<String> favoriteFoods;

    public Animal(ArrayList<String> favoriteFoods) {
        if (favoriteFoods == null || favoriteFoods.size() == 0)
            throw new RuntimeException("favoriteFoods is required");
        this.favoriteFoods = favoriteFoods;  // stores the caller's reference - still dangerous
    }

    public int getFavoriteFoodsCount() { return favoriteFoods.size(); }
    public String getFavoriteFoodsItem(int index) { return favoriteFoods.get(index); }
}
```

The validation looks correct, but the object is still mutable. The caller passed in their own
`ArrayList` and still holds a reference to it. After construction they can mutate it freely:

```java
var favorites = new ArrayList<String>();
favorites.add("Apples");
var zebra = new Animal(favorites);          // caller still holds the reference
System.out.println(zebra.getFavoriteFoodsItem(0)); // Apples

favorites.clear();
favorites.add("Chocolate Chip Cookies");
System.out.println(zebra.getFavoriteFoodsItem(0)); // Chocolate Chip Cookies - state changed
```

The invariant was satisfied at construction time, but the caller bypassed it entirely by
mutating the original list. The stored reference and the caller's reference point to the same
object -- changing one changes the other.

The fix is a **defensive copy**: copy the incoming object immediately so that the class owns
its own separate instance. The caller's original and the stored copy are now independent.

```java
public Animal(List<String> favoriteFoods) {
    if (favoriteFoods == null || favoriteFoods.size() == 0)
        throw new RuntimeException("favoriteFoods is required");
    this.favoriteFoods = new ArrayList<>(favoriteFoods);  // defensive copy
}
```

Validate first, then copy. If you copy first, you could end up copying an invalid list and
then throwing -- wasteful. Validate on the original, copy only if it passes.

Now the caller can do whatever they want with their list and the `Animal` is unaffected.
The invariant is permanently enforced.

##### The mental model

Every path to changing state must be sealed:

| Path | Sealed by |
|---|---|
| Direct field access from outside | Rule 2 (`private`) |
| Field reassignment from inside | Rule 2 (`final`) |
| Setter methods | Rule 3 |
| Subclass overriding behaviour | Rule 1 (`final` class) |
| Mutable object handed out via getter | Rule 4 (delegate or defensive copy) |
| Mutable object passed in via constructor | Rule 5 (defensive copy on intake) |
