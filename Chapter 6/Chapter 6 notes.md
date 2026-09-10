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
