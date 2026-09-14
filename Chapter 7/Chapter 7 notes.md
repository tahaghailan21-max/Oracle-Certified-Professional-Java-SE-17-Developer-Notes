# Beyond Classes

This chapter moves beyond classes to other Java types: interfaces, enums, sealed classes,
and records. The same rules from Chapter 5 still apply (access modifiers, static members,
etc.), with additional rules specific to each type.

Key reminders carried forward from earlier chapters:
- A Java file may have at most one public top-level type, and it must match the filename.
- A top-level type can only be declared with `public` or package access.
- This applies to classes, enums, records, interfaces, and all other top-level types.

---

### Implementing Interfaces

A class can only extend one class, which limits its use for inheritance. An interface removes
that restriction -- a class may implement any number of interfaces.

An **interface** is an abstract data type that declares a list of abstract methods that any
class implementing the interface must provide.

##### Declaring an interface

Interfaces are defined with the `interface` keyword. They support implicit modifiers --
modifiers the compiler inserts automatically even if you do not write them.

```java
public abstract interface CanBurrow {
    public abstract Float getSpeed(int age);  // abstract method
    public static final int MINIMUM_DEPTH = 2; // constant variable
}
```

The modifiers `abstract` (on the interface itself), `public abstract` (on methods), and
`public static final` (on variables) are all implicit. The compiler inserts them whether
you write them or not. These are covered in detail shortly.

Interface variables are called **constants** because they are always `public`, `static`, and
`final`. They must be initialized at declaration and can be accessed without an instance.

##### Interfaces cannot be instantiated or marked `final`

```java
public class Biped {
    public static void main(String[] args) {
        var e = new WalksOnTwoLegs(); // DOES NOT COMPILE - interfaces cannot be instantiated
    }
}

public final interface WalksOnEightLegs {} // DOES NOT COMPILE - interfaces cannot be final
```

An interface cannot be instantiated for the same reason an abstract class cannot. Marking
it `final` would mean no class could ever implement it -- which makes the interface
useless. The compiler rejects both.

An interface with no methods is valid -- interfaces are not required to declare anything:

```java
public abstract interface WalksOnTwoLegs {} // fine - no methods required
```

##### Implementing an interface

A class uses the `implements` keyword to declare it is implementing an interface. A class
can implement multiple interfaces separated by commas. Every abstract method from
every implemented interface must be overridden in the concrete class.

```java
public interface Climb {
    Number getSpeed(int age);
}

public class FieldMouse implements Climb, CanBurrow {
    public Float getSpeed(int age) {
        return 11f;
    }
}
```

`FieldMouse` implements both `Climb` and `CanBurrow`. The single `getSpeed()` method
satisfies both interfaces at once because the signatures are compatible. The return type
`Float` is covariant with `Number` (Float is a subtype of Number).

Two things to note:
- The interface method `getSpeed()` is implicitly `public`. The implementing class must
  explicitly declare it `public` -- it cannot use a more restrictive modifier.
- Covariant return types work here exactly as they do with class overriding.

##### Extra: what happens if you omit `public` on the implementing method?

```java
public class FieldMouse implements Climb {
    Float getSpeed(int age) { // DOES NOT COMPILE - package access is less permissive than public
        return 11f;
    }
}
```

The interface method is implicitly `public`. Package access is a reduction in visibility.
The same override rule applies: you cannot reduce visibility when implementing an
interface method.



---

### Extending an Interface

An interface can extend another interface using the `extends` keyword, just like a class:

```java
public interface Nocturnal {}
public interface HasBigEyes extends Nocturnal {}
```

Unlike a class, which can only extend one class, an interface can extend multiple interfaces:

```java
public interface Nocturnal {
    public int hunt();
}

public interface CanFly {
    public void flap();
}

public interface HasBigEyes extends Nocturnal, CanFly {}

public class Owl implements HasBigEyes {
    public int hunt() { return 5; }
    public void flap() { System.out.println("Flap!"); }
}
```

`Owl` implements `HasBigEyes`, which pulls in `hunt()` from `Nocturnal` and `flap()` from
`CanFly`. The class must provide both.

##### Why multiple interface extension is safe

Multiple inheritance is forbidden for classes because of constructors and instance state.
When two parent classes both define the same field or have their own constructor chains,
there is no clear rule for which constructor runs first or which field value the child inherits.
The constructor chain must be a single unbroken line from the object up to `Object`.

Imagine if Java allowed this (it does not):

```java
class A {
    int x = 1;
    A() { System.out.println("A constructor"); }
}

class B {
    int x = 2;
    B() { System.out.println("B constructor"); }
}

// hypothetical - does not compile in Java
class C extends A, B {
    void show() {
        System.out.println(x); // which x? A's (1) or B's (2)? no clear answer
    }
}
```

Which constructor runs first -- `A()` or `B()`? Which `x` does `C` inherit? Java has no
rule to resolve this, so multiple class inheritance is forbidden entirely.

Interfaces have none of that. They have no constructors and no instance fields. They are
never initialized as part of creating an object. When `new Owl()` is called, the `Owl`
constructor chain runs -- `HasBigEyes`, `Nocturnal`, and `CanFly` are not part of that
chain at all. They are pure contracts.

If two interfaces define the same method signature, the implementing class provides one
implementation that satisfies both at once -- no ambiguity:

```java
public interface Nocturnal {
    public int hunt();
}

public interface Predator {
    public int hunt(); // same signature as Nocturnal.hunt()
}

public class Owl implements Nocturnal, Predator {
    public int hunt() { return 5; } // one method satisfies both interfaces simultaneously
}
```

There is no conflict because the class is just providing one implementation. Both
`Nocturnal` and `Predator` required `hunt()` -- `Owl` delivers it once and both contracts
are fulfilled.

If two interfaces define the same constant name, the compiler requires you to qualify
which one you mean when accessing it:

```java
public interface Nocturnal {
    int SPEED = 10; // implicitly public static final
}

public interface Predator {
    int SPEED = 20; // implicitly public static final
}

public class Owl implements Nocturnal, Predator {
    public void show() {
        System.out.println(SPEED);           // DOES NOT COMPILE - ambiguous
        System.out.println(Nocturnal.SPEED); // fine - 10
        System.out.println(Predator.SPEED);  // fine - 20
    }
}
```

Since constants are `static`, they are accessed via the interface name. No ambiguity once
you qualify. The compiler simply forces you to be explicit.

Multiple inheritance is only dangerous when state or initialization is involved. Interfaces
carry neither, so the conflict never arises.

---

### Inheriting an Interface

The same rule from abstract classes applies here: the first concrete class in the hierarchy
must implement every inherited abstract method, regardless of where those methods came
from -- interfaces, abstract classes, or both.

##### Counting inherited abstract methods

```
+----------------------------------+
|      abstract class Animal       |
|      abstract int getType()      |
+----------------------------------+
               ^ extends
+----------------------------------+       implements      +-------------------+
|      abstract class Bird         | --------------------> |   interface Fly   |
|      abstract boolean canSwoop() |                       |   void fly()      |
+----------------------------------+                       +-------------------+
               ^ extends
+----------------------------------+       implements      +-------------------+
|          class Swan              | --------------------> |  interface Swim   |
|              ???                 |                       |  void swim()      |
+----------------------------------+                       +-------------------+
```

`Swan` is the first concrete class. It must implement every abstract method inherited
from the entire hierarchy above it:
- `getType()` from `Animal`
- `canSwoop()` from `Bird`
- `fly()` from `Fly` (via `Bird`)
- `swim()` from `Swim` (directly implemented by `Swan`)

##### Abstract classes can defer implementation

An abstract class that implements an interface is not required to implement any of the
interface's abstract methods. It can defer all of them to the first concrete subclass.

```java
public interface HasTail {
    public int getTailLength();
}

public interface HasWhiskers {
    public int getNumberOfWhiskers();
}

public abstract class HarborSeal implements HasTail, HasWhiskers {}
// fine - abstract class, not required to implement anything

public class CommonSeal extends HarborSeal {} // DOES NOT COMPILE
// CommonSeal is concrete and the first concrete subclass
// it must implement getTailLength() and getNumberOfWhiskers() - it does not
```

`HarborSeal` compiles because it is abstract -- it can ignore inherited abstract methods
and pass them down. `CommonSeal` is concrete and is the first in the chain to be required
to provide implementations. It provides none, so it does not compile.

##### Extra: abstract class partially implementing an interface

An abstract class can implement some interface methods and leave the rest for subclasses:

```java
public interface HasTail {
    public int getTailLength();
}

public interface HasWhiskers {
    public int getNumberOfWhiskers();
}

public abstract class HarborSeal implements HasTail, HasWhiskers {
    public int getTailLength() { return 20; } // implements one, defers the other
}

public class CommonSeal extends HarborSeal {
    public int getNumberOfWhiskers() { return 6; } // only needs to cover what's still abstract
}
```

`CommonSeal` only needs to implement `getNumberOfWhiskers()` because `HarborSeal`
already provided `getTailLength()`. Whatever an abstract class covers, the concrete
subclass does not need to repeat.

---

### Mixing Class and Interface Keywords

The keywords `extends` and `implements` are not interchangeable. The rules are strict:

| Relationship | Correct keyword | Example |
|---|---|---|
| Class inheriting a class | `extends` | `class Dog extends Animal` |
| Class inheriting an interface | `implements` | `class Dog implements Runnable` |
| Interface inheriting an interface | `extends` | `interface A extends B` |
| Interface inheriting a class | not allowed | -- |

```java
public interface CanRun {}
public class Cheetah extends CanRun {}   // DOES NOT COMPILE - class cannot extend an interface
public class Hyena {}
public interface HasFur extends Hyena {} // DOES NOT COMPILE - interface cannot extend a class
```

A class cannot `extend` an interface -- it must `implement` it. An interface cannot extend
a class at all. The exam frequently mixes these to see if you notice.

---

### Inheriting Duplicate Abstract Methods

A class can implement two interfaces that declare the same method signature, as long as
a single implementation can satisfy both. This is called compatible duplicate abstract methods.

```java
public interface Herbivore { public void eatPlants(); }
public interface Omnivore  { public void eatPlants(); }

public class Bear implements Herbivore, Omnivore {
    public void eatPlants() {
        System.out.println("Eating plants");
    }
}
```

One `eatPlants()` method satisfies both interfaces simultaneously. No conflict.

##### When duplicate methods are incompatible

If two interfaces declare the same method name with signatures that cannot be satisfied
by a single implementation, the implementing class does not compile -- regardless of what
body is written inside it.

```java
public interface Herbivore { public void eatPlants(); }
public interface Omnivore  { public int eatPlants(); }

public class Tiger implements Herbivore, Omnivore { // DOES NOT COMPILE
    // no possible method can return both void and int at the same time
}
```

There is no return type that is covariant with both `void` and `int`. `void` is only covariant
with `void` -- nothing else. The conflict is irresolvable at the language level, so the
compiler rejects the class declaration itself, before even looking at what is inside it.

##### What makes two duplicate methods compatible?

The question is: can you write one method that is a valid override of both?

- Same return type: always compatible.
- Covariant return types (one is a subtype of the other): compatible -- use the narrower one.
- Unrelated return types (e.g. `void` and `int`): incompatible -- no single method works.

```java
public interface A { public Number getValue(); }
public interface B { public Integer getValue(); }

public class C implements A, B {
    public Integer getValue() { return 1; }
    // Integer is covariant with Number - satisfies both A and B
}
```

`Integer` is a subtype of `Number`, so `Integer getValue()` is a valid override of both
`A.getValue()` and `B.getValue()` simultaneously.


---

### Implicit Modifiers

An implicit modifier is one the compiler inserts automatically. You can write them
yourself or leave them out -- the compiled result is identical either way.

Implicit modifiers for interfaces:

| What | Implicit modifiers inserted |
|---|---|
| The interface itself | `abstract` |
| Interface variables | `public static final` |
| Interface methods without a body | `abstract` |
| Interface methods without `private` | `public` |

##### Example -- before and after compiler insertion

```java
// what you write
public interface Soar {
    int MAX_HEIGHT = 10;
    final static boolean UNDERWATER = true;
    void fly(int speed);
    abstract void takeoff();
    public abstract double dive();
}

// what the compiler sees
public abstract interface Soar {
    public static final int MAX_HEIGHT = 10;
    public final static boolean UNDERWATER = true;
    public abstract void fly(int speed);
    public abstract void takeoff();
    public abstract double dive();
}
```

The compiler adds `abstract` to the interface declaration, `public static final` to any
variable missing those modifiers, and `public abstract` to any method missing them.

##### Conflicting modifiers

If you explicitly mark an interface member with a modifier that conflicts with an implicit
one, it does not compile:

```java
public interface Dance {
    private int count = 4;  // DOES NOT COMPILE - variables are implicitly public, private conflicts
    protected void step();  // DOES NOT COMPILE - methods are implicitly public, protected conflicts
}
```

The compiler would apply `public` to both, creating a direct conflict with the explicit
`private` and `protected`. Neither compiles.

##### Full access modifier rules for interface members

The implicit `public` is only inserted when no access modifier is written. If you write an
access modifier yourself, the compiler leaves it alone -- but not all combinations are legal.

| Member | `public` | `protected` | package | `private` |
|---|---|---|---|---|
| Variable | Yes (implicit if omitted) | No | No | No |
| Abstract method | Yes (implicit if omitted) | No | No | No |
| Default method | Yes (implicit if omitted) | No | No | No |
| Static method | Yes (implicit if omitted) | No | No | No |
| Private method | No | No | No | Yes (required) |
| Private static method | No | No | No | Yes (required) |

The rules in plain terms:
- Variables can only ever be `public`. Trying to make them `protected`, package, or `private` is a compile error.
- Abstract, default, and static methods can only be `public`. `protected` and package are not supported. `private` would conflict with the implicit `public`.
- Private methods and private static methods must be explicitly marked `private`. They do not get the implicit `public` -- the compiler inserts nothing when `private` is written.
- `protected` is never allowed on any interface member because a class cannot `extend` an interface, making the subclass access that `protected` provides meaningless.

##### Interfaces vs. abstract classes -- implicit modifiers make a critical difference

Abstract classes do not use implicit modifiers. Every modifier must be written explicitly.
This creates a subtle trap with access levels:

```java
abstract class Husky {
    abstract void play(); // package access - must be written explicitly, no implicit public
}

interface Poodle {
    void play(); // implicitly public - even though nothing is written
}
```

Both `play()` methods are abstract, but they have different access levels. `Husky.play()`
is package access. `Poodle.play()` is implicitly `public`.

This matters the moment you implement or extend them:

```java
public class Webby extends Husky {
    void play() {} // fine - package access matches or is compatible with Husky's package access
}

public class Georgette implements Poodle {
    void play() {} // DOES NOT COMPILE - reduces public to package access
}
```

`Georgette` fails because `Poodle.play()` is implicitly `public` -- omitting the access
modifier does not mean "same as the parent." It means package access, which is a
reduction in visibility. The override rule requires the same or more permissive access.

The fix:

```java
public class Georgette implements Poodle {
    public void play() {} // fine - explicitly public, matches the implicit public in Poodle
}
```

When implementing an interface method, always write `public` explicitly. Leaving the
access modifier off looks harmless but silently reduces visibility and causes a compile error.


---

### Declaring Concrete Interface Methods

Interfaces have evolved beyond just abstract methods and constants. There are six member
types an interface can contain:

| Member type | Required modifiers | Implicit modifiers | Has body? |
|---|---|---|---|
| Constant variable | -- | `public static final` | Yes (assigned at declaration) |
| Abstract method | -- | `public abstract` | No |
| Default method | `default` | `public` | Yes |
| Static method | `static` | `public` | Yes |
| Private method | `private` | -- | Yes |
| Private static method | `private static` | -- | Yes |

The membership type determines how a member is accessed:
- **Class membership** (`static`, constant): shared among all instances, accessed via the
  interface name.
- **Instance membership** (abstract, default, private): associated with a particular instance
  of a class that implements the interface.

##### Why no `protected` or package access in interfaces?

`protected` makes no sense for interfaces because a class cannot `extend` an interface --
it can only `implement` it. `protected` is about subclass access, and interfaces have no
subclasses in the class sense.

Package access is not supported either, partly for backward compatibility. Interface methods
without an access modifier have always been implicitly `public`. Changing that default to
package access would silently break any existing code that relies on those methods being
public. So the only access options for interface methods are `public` (explicit or implicit)
and `private` (explicit only).


---

### Default Interface Methods

A **default method** is a concrete method defined in an interface using the `default`
keyword. It has a body and may be optionally overridden by implementing classes.

The main use case is backward compatibility: you can add a new default method to an
existing interface without breaking any class that already implements it. Those classes
inherit the default implementation automatically.

```java
public interface IsColdBlooded {
    boolean hasScales();           // abstract - must be implemented
    default double getTemperature() {
        return 10.0;               // default - optional to override
    }
}

public class Snake implements IsColdBlooded {
    public boolean hasScales() { return true; }     // required

    public double getTemperature() { return 12.0; } // optional override
}
```

`Snake` must implement `hasScales()` but can choose to override `getTemperature()` or
just inherit the default `10.0`.

Note: the `default` keyword here has nothing to do with `default` in a switch statement,
or with "default" (package) access. Three different uses of the same word in Java.

##### Default method rules

1. A default method may only be declared inside an interface.
2. Must use the `default` keyword and include a method body.
3. Implicitly `public`.
4. Cannot be marked `abstract`, `final`, or `static`.
5. May be optionally overridden by an implementing class.
6. If a class inherits two or more default methods with the same signature, it must override the method.

##### Why `abstract`, `final`, and `static` are all forbidden

- `abstract`: contradicts having a body.
- `final`: default methods are designed to be overridable. `final` would prevent that.
- `static`: default methods are instance methods. They belong to the object, not the class.

##### Common syntax errors

```java
public interface Carnivore {
    public default void eatMeat();                  // DOES NOT COMPILE - default method has no body
    public int getRequiredFoodAmount() { return 13; } // DOES NOT COMPILE - concrete method missing default keyword
}
```

An abstract method cannot have a body. A concrete method inside an interface must use
the `default` (or `static` or `private`) keyword -- otherwise the compiler does not know
what to do with it.

##### Inheriting duplicate default methods

If a class implements two interfaces that both define a default method with the same
signature, the compiler cannot decide which version to use and rejects the class:

```java
public interface Walk {
    public default int getSpeed() { return 5; }
}
public interface Run {
    public default int getSpeed() { return 10; }
}

public class Cat implements Walk, Run {} // DOES NOT COMPILE - ambiguous default method
```

The fix is to override the method in the class, removing the ambiguity:

```java
public class Cat implements Walk, Run {
    public int getSpeed() { return 1; } // override resolves the conflict
}
```

##### Calling a specific hidden default method

After overriding to resolve the conflict, you can still reach a specific interface's default
version using the syntax `InterfaceName.super.methodName()`:

```java
public class Cat implements Walk, Run {
    public int getSpeed() { return 1; }

    public int getWalkSpeed() {
        return Walk.super.getSpeed(); // calls Walk's default version specifically
    }
}
```

The interface name specifies which version, and `super` indicates instance inheritance
(not static access). Neither `Walk.getSpeed()` nor `Walk.this.getSpeed()` would compile
-- the `InterfaceName.super.method()` syntax is the only valid form.

The `super` is not redundant -- each part of the syntax does distinct work:

- `Walk.getSpeed()` -- looks like a static call. `getSpeed()` is not static, so this fails.
- `Walk.this.getSpeed()` -- `Walk.this` is inner class syntax for referencing an enclosing
  class instance. `Walk` is an interface, not an enclosing class, so this is not valid here.
- `Walk.super.getSpeed()` -- the only form that works. `Walk.` narrows which interface,
  `super` tells the JVM to follow instance inheritance upward from that interface rather
  than calling the current class's override.

Plain `super.getSpeed()` would also fail because it is still ambiguous between `Walk` and
`Run`. You need both parts together:

```java
public class Cat implements Walk, Run {
    public int getSpeed() { return 1; }

    public int test() {
        return getSpeed();            // calls Cat's version -> 1
        return super.getSpeed();      // DOES NOT COMPILE - ambiguous between Walk and Run
        return Walk.super.getSpeed(); // calls Walk's default -> 5
        return Run.super.getSpeed();  // calls Run's default -> 10
    }
}
```

```java
public int getWalkSpeed() {
    return Walk.getSpeed();       // DOES NOT COMPILE - getSpeed() is not static
    return Walk.this.getSpeed();  // DOES NOT COMPILE - Walk is not an enclosing class
    return Walk.super.getSpeed(); // fine - correct syntax
}
```

##### Extra compile error cases for `InterfaceName.super` syntax

```java
public interface Walk {
    public default int getSpeed() { return 5; }
}
public interface Run {
    public default int getSpeed() { return 10; }
}

public class Cat implements Walk, Run {
    public int getSpeed() { return 1; }

    public int test() {
        return Walk.super.getSpeed();   // fine - calls Walk's default (5)
        return Run.super.getSpeed();    // fine - calls Run's default (10)

        return Animal.super.getSpeed(); // DOES NOT COMPILE - Animal is not an interface
                                        // Cat implements

        return Walk.super.fly();        // DOES NOT COMPILE - fly() does not exist on Walk

        // Walk.super can only be used inside a class that implements Walk
    }
}

public class Dog { // does not implement Walk
    public int test() {
        return Walk.super.getSpeed();   // DOES NOT COMPILE - Dog does not implement Walk
    }
}
```

The syntax `InterfaceName.super.method()` is only valid when:
1. The class actually implements the named interface.
2. The method exists on that interface as a default method.
3. It is used inside an instance method or constructor (not a static context).

---

### Static Interface Methods

Static interface methods behave like static methods in classes. They have a body, belong
to the interface itself (not to any instance), and are accessed via the interface name.

##### Static interface method rules

1. Must use the `static` keyword and include a method body.
2. Implicitly `public` if no access modifier is written.
3. Cannot be marked `abstract` or `final`.
4. Not inherited -- cannot be called without the interface name, even inside a class that implements the interface.

```java
public interface Hop {
    static int getJumpHeight() {
        return 8;
    }
}

public class Skip {
    public int skip() {
        return Hop.getJumpHeight(); // fine - accessed via interface name
    }
}
```

##### Static methods are not inherited

This is the key difference from default methods. Even inside a class that implements the
interface, the static method is not in scope without the interface name:

```java
public class Bunny implements Hop {
    public void printDetails() {
        System.out.println(getJumpHeight());      // DOES NOT COMPILE - not inherited
        System.out.println(Hop.getJumpHeight());  // fine - explicit interface name required
    }
}
```

This also means the multiple inheritance ambiguity problem never arises for static methods.
Two interfaces can both define `static void doSomething()` and a class can implement
both -- there is no conflict because neither version is inherited. You always qualify with
the interface name to pick the one you want.

```java
public interface Walk { static int getSpeed() { return 5; } }
public interface Run  { static int getSpeed() { return 10; } }

public class Cat implements Walk, Run {
    public void test() {
        System.out.println(Walk.getSpeed()); // 5
        System.out.println(Run.getSpeed());  // 10
        // no conflict, no override required
    }
}
```

---

### Private Interface Methods

Private and private static methods can be added to interfaces to reduce code duplication
between default and static methods. They are internal helpers -- visible only inside the
interface declaration, never to implementing classes.

```java
public interface Schedule {
    default void wakeUp()     { checkTime(7); }
    default void workOut()    { checkTime(18); }

    private void checkTime(int hour) {
        if (hour > 17) {
            System.out.println("You're late!");
        } else {
            System.out.println("You have " + (17 - hour) + " hours left to make the appointment");
        }
    }
}
```

Without `checkTime()`, the same logic would have to be duplicated inside `wakeUp()` and
`workOut()`. Private methods avoid that while keeping the logic hidden from implementing
classes.

##### Private interface method rules

1. Must be marked `private` and include a method body.
2. `private static` methods can be called by any method within the interface (default,
   static, private, private static).
3. `private` (non-static) methods can only be called by default methods and other
   private non-static methods within the interface.

The distinction mirrors the instance vs. static divide in classes: a non-static method can
only be called from a non-static context, while a static method can be called from anywhere.

```java
public interface Foo {
    default void a()        { helper(); }        // fine - default calling private
    static void b()         { helper(); }        // DOES NOT COMPILE - static cannot call non-static private
    static void c()         { staticHelper(); }  // fine - static calling private static
    default void d()        { staticHelper(); }  // fine - non-static can call private static

    private void helper()         { System.out.println("helper"); }
    private static void staticHelper() { System.out.println("static helper"); }
}
```

##### Implementing classes cannot call private interface methods

```java
public class MySchedule implements Schedule {
    public void test() {
        checkTime(10); // DOES NOT COMPILE - private, not accessible outside the interface
    }
}
```

Private methods are implementation details of the interface. They are completely invisible
to anything outside the interface declaration.


---

### Calling Abstract Methods from Default and Private Methods

Default and private non-static methods can call abstract methods declared in the same
interface. This works because when these methods are invoked, there is always a concrete
instance behind them -- a class that has already implemented the abstract method.

```java
public interface ZooRenovation {
    public String projectName();  // abstract (implicit)
    abstract String status();     // abstract (explicit)

    default void printStatus() {
        System.out.print("The " + projectName() + " project " + status());
        // fine - default method can call abstract methods on the same interface
    }
}
```

Both `projectName()` and `status()` are abstract and implicitly public. The default method
`printStatus()` can call both because by the time `printStatus()` is ever invoked, it is
called on a concrete object that has provided implementations for both.

Static methods cannot do this -- they have no instance, so there is no guarantee that an
implementation of the abstract method exists.

---

### Interface Member Access -- Full Reference

| Member | Accessible from default and private methods? | Accessible from static methods? | Accessible from implementing class methods? | Accessible without an instance? |
|---|---|---|---|---|
| Constant variable | Yes | Yes | Yes | Yes |
| Abstract method | Yes | No | Yes | No |
| Default method | Yes | No | Yes | No |
| Static method | Yes | Yes | Yes (interface name required) | Yes (interface name required) |
| Private method | Yes | No | No | No |
| Private static method | Yes | Yes | No | No |

##### Quick tips for the exam

- Treat abstract, default, and private non-static methods as **instance members** -- they require an object and can call each other freely.
- Treat static methods and constant variables as **class-level members** -- they belong to the interface itself, not to any instance.
- All private methods are only accessible within the interface declaration -- never from implementing classes.

##### Worked example

```java
public interface ZooTrainTour {
    abstract int getTrainName();
    private static void ride() {}
    default void playHorn() { getTrainName(); ride(); }  // fine
    public static void slowDown() { playHorn(); }        // DOES NOT COMPILE
    static void speedUp() { ride(); }                    // fine
}
```

- `playHorn()` is a default (instance) method. It can call `getTrainName()` (abstract instance method) and `ride()` (private static -- accessible from any method in the interface). Fine.
- `slowDown()` is static. It tries to call `playHorn()`, which is a default instance method. Static methods have no instance, so they cannot call instance methods without a reference object. Does not compile.
- `speedUp()` is static. It calls `ride()`, which is private static. Static can call private static. Fine.


---

### Working with Enums

An **enum** (enumeration) is a type that represents a fixed set of constants known at
compile time. Examples include days of the week, seasons, compass directions, and so on.

Enums are better than a collection of `static final` constants because they provide
**type-safe checking**. You cannot pass an invalid value to a method expecting an enum
without getting a compile error. With plain `int` or `String` constants, invalid values
only surface at runtime.

##### Declaring a simple enum

```java
public enum Season {
    WINTER, SPRING, SUMMER, FALL  // semicolon optional for simple enums
}
```

Enum values are constants and are written in SCREAMING_SNAKE_CASE by convention.
The access modifier follows the same rules as classes: `public` or package access only.

##### Using an enum

```java
var s = Season.SUMMER;
System.out.println(Season.SUMMER); // SUMMER - toString() prints the name
System.out.println(s == Season.SUMMER); // true
```

Enum values can be compared with `==` or `equals()`. Each enum value is initialized
exactly once by the JVM, so `==` is safe and idiomatic.

##### Enums cannot be extended

```java
public enum ExtendedSeason extends Season {} // DOES NOT COMPILE
```

The values of an enum are fixed at compile time. Extending an enum to add more values
is not allowed. Enums implicitly extend `java.lang.Enum` and cannot extend anything else.

##### `values()`, `name()`, and `ordinal()`

`values()` returns an array of all enum values in declaration order. `name()` returns the
name as a String. `ordinal()` returns the zero-based position in the declaration.

```java
for (var season : Season.values()) {
    System.out.println(season.name() + " " + season.ordinal());
}
```

Output:
```
WINTER 0
SPRING 1
SUMMER 2
FALL 3
```

The ordinal value is stable for the life of the program but you should not rely on it in
logic -- if someone reorders the enum values, all ordinals shift. Use the enum name instead.

##### Enums are not ints

```java
if (Season.SUMMER == 2) {} // DOES NOT COMPILE - cannot compare an enum to an int
```

An enum is a full Java type, not a primitive. Its ordinal is an `int` internally, but the enum
value itself is not an `int` and cannot be directly compared to one.


---

### `valueOf()` -- Retrieving an Enum from a String

`valueOf()` retrieves an existing enum value by its exact name as a String:

```java
Season s = Season.valueOf("SUMMER"); // fine - returns Season.SUMMER
Season t = Season.valueOf("summer"); // throws IllegalArgumentException at runtime
```

The string must match the enum value name exactly, including case. No match means an
`IllegalArgumentException` at runtime -- not a compile error.

`valueOf()` does not create a new enum value. Each enum value is created once when the
enum is first loaded by the JVM. `valueOf()` just looks up and returns the already-existing
instance with that name.

---

### Enums in Switch Statements and Expressions

Enums work in both switch statements and switch expressions. Inside a `case`, you use
just the value name -- not the qualified `EnumType.VALUE` form. The compiler already
knows the type from the switch variable, so the type name is implicit and must be omitted.

```java
Season summer = Season.SUMMER;
switch (summer) {
    case WINTER:
        System.out.print("Get out the sled!");
        break;
    case SUMMER:
        System.out.print("Time for the pool!");  // prints this
        break;
    default:
        System.out.print("Is it summer yet?");
}
```

```java
var message = switch (summer) {
    case Season.WINTER -> "Get out the sled!"; // DOES NOT COMPILE - qualified name not allowed
    case 0             -> "Time for the pool!"; // DOES NOT COMPILE - int not allowed
    default            -> "Is it summer yet?";
};
```

Two rules:
- Case labels must use the unqualified enum name (`WINTER`, not `Season.WINTER`).
- Case labels must be enum values -- `int` literals are not allowed.

---

### Adding Constructors, Fields, and Methods to Enums

A simple enum is just a list of values. A complex enum can also have instance variables,
constructors, and methods -- making each enum value carry its own data.

```java
public enum Season {
    WINTER("Low"), SPRING("Medium"), SUMMER("High"), FALL("Medium"); // semicolon required

    private final String expectedVisitors;

    private Season(String expectedVisitors) {  // constructor is implicitly private
        this.expectedVisitors = expectedVisitors;
    }

    public void printExpectedVisitors() {
        System.out.println(expectedVisitors);
    }
}
```

##### What does `WINTER("Low")` mean?

Each enum value is an object. `WINTER("Low")` is a constructor call -- it tells the JVM to
construct the `WINTER` value using the constructor that takes a String, passing `"Low"`.
The parentheses work exactly like arguments to `new`, but without the `new` keyword.

The parallel to a regular class:

```java
// equivalent logic with a regular class
Season winter = new Season("Low");
Season spring = new Season("Medium");
```

With an enum, the JVM does this construction automatically when the enum is first loaded.
You just supply the constructor arguments directly on each value declaration.

A simple enum value with no parentheses calls a no-argument constructor. If the enum
only defines a constructor that requires arguments, every value must supply them.

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),  // calls Planet(double mass, double radius)
    VENUS  (4.869e+24, 6.0518e6),
    EARTH  (5.976e+24, 6.37814e6);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {
        this.mass   = mass;
        this.radius = radius;
    }
}
```
- The semicolon after the value list is **required** when anything else follows (fields, constructors, methods). It is optional for simple enums with only values.
- The enum values list must always come first -- before any fields, constructors, or methods.
- Instance variables should be `private final` to keep enum values immutable. Mutable enum state is technically possible but a bad practice -- enum values are shared across the JVM.
- Enum constructors are **implicitly private**. Writing `private` explicitly is optional. Writing `public` or `protected` is a compile error.

```java
public enum Season {
    WINTER("Low");
    public Season(String s) {} // DOES NOT COMPILE - enum constructors cannot be public
}
```

##### Enum values are constructed once

The constructor runs the first time any enum value is accessed. After that, the JVM
returns the already-constructed instance.

```java
public enum OnlyOne {
    ONCE(true);
    private OnlyOne(boolean b) { System.out.print("constructing,"); }
}

public class PrintTheOne {
    public static void main(String[] args) {
        System.out.print("begin,");
        OnlyOne first  = OnlyOne.ONCE; // prints constructing,
        OnlyOne second = OnlyOne.ONCE; // prints nothing - already constructed
        System.out.print("end");
    }
}
// output: begin,constructing,end
```

##### Calling enum methods

```java
Season.SUMMER.printExpectedVisitors(); // calls the method on the SUMMER enum value
```

##### Per-value method bodies

Each enum value can have its own method body. This looks like an anonymous subclass
attached to each value:

```java
public enum Season {
    WINTER {
        public String getHours() { return "10am-3pm"; }
    },
    SPRING {
        public String getHours() { return "9am-5pm"; }
    },
    SUMMER {
        public String getHours() { return "9am-7pm"; }
    },
    FALL {
        public String getHours() { return "9am-5pm"; }
    };

    public abstract String getHours(); // each value must implement this
}
```

The enum declares `getHours()` as abstract, forcing every value to provide an
implementation. If any value is missing its body, the compiler reports an error.

##### Default implementation with selective overrides

If most values share the same behaviour, define a default implementation on the enum
and only override the special cases:

```java
public enum Season {
    WINTER {
        public String getHours() { return "10am-3pm"; }
    },
    SUMMER {
        public String getHours() { return "9am-7pm"; }
    },
    SPRING, FALL; // use the default

    public String getHours() { return "9am-5pm"; } // default for SPRING and FALL
}
```

`SPRING` and `FALL` inherit the default `getHours()`. `WINTER` and `SUMMER` override it.
Note: because the method is no longer `abstract`, values without a body are allowed.

##### Enums can implement interfaces

```java
public interface Weather { int getAverageTemperature(); }

public enum Season implements Weather {
    WINTER, SPRING, SUMMER, FALL;
    public int getAverageTemperature() { return 30; }
}
```

An enum can implement any number of interfaces. It just has to provide implementations
for all the abstract methods, same as a class. An enum cannot extend a class or another
enum (it already implicitly extends `java.lang.Enum`).

---

### Sealed Classes

A **sealed class** restricts which other classes may directly extend it. The permitted
subclasses are declared explicitly in the sealed class definition. This is new in Java 17.

##### Declaring a sealed class

```java
public sealed class Bear permits Kodiak, Panda {}

public final class Kodiak extends Bear {}

public non-sealed class Panda extends Bear {}
```

The sealed class uses `permits` to list every class allowed to directly extend it. The
subclasses must then declare one of three modifiers:

| Modifier on subclass | Meaning |
|---|---|
| `final` | Cannot be extended further |
| `sealed` | Can be extended, but only by its own named permitted list |
| `non-sealed` | Can be extended by any class freely -- reopens the hierarchy |

##### New keywords introduced

- `sealed` -- marks a class or interface as only extendable by a named list
- `permits` -- lists the allowed direct subclasses or implementors
- `non-sealed` -- marks a subclass of a sealed class as open for unrestricted extension

##### Key rule

Every direct subclass of a sealed class must be marked `final`, `sealed`, or `non-sealed`.
No other option is valid. If a subclass omits all three, it does not compile.

```java
public sealed class Bear permits Kodiak {}

public class Kodiak extends Bear {} // DOES NOT COMPILE - must be final, sealed, or non-sealed
```

##### Modifier order and permits list errors

```java
public class sealed Frog permits GlassFrog {} // DOES NOT COMPILE - sealed must come before class
public final class GlassFrog extends Frog {}
```

```java
public abstract sealed class Wolf permits Timber {}
public final class Timber extends Wolf {}
public final class MyWolf extends Wolf {} // DOES NOT COMPILE - MyWolf not listed in permits
```

The `sealed` modifier must appear before the `class` keyword, following the same
placement rules as other modifiers. And every class that directly extends a sealed class
must be named in the `permits` list -- no exceptions.

Sealed classes are commonly declared with `abstract`, though it is not required.

##### Compilation rules -- same package requirement

A sealed class and all its direct subclasses must be in the same package and compiled
together. A sealed class without its permitted subclasses present does not compile:

```java
// Penguin.java
package zoo;
public sealed class Penguin permits Emperor {} // DOES NOT COMPILE alone - Emperor must exist
```

The subclass must also explicitly extend the sealed class -- declaring it in the same
package is not enough on its own:

```java
// Penguin.java
package zoo;
public sealed class Penguin permits Emperor {} // DOES NOT COMPILE

// Emperor.java
package zoo;
public final class Emperor {} // declared but does not extend Penguin - still a compile error
```

Both files must be present and `Emperor` must extend `Penguin` for either to compile.

Note: named modules (Chapter 12) allow sealed classes and their subclasses to live in
different packages, provided they are in the same named module.

##### Where must permitted subclasses live?

A class listed in `permits` must be in one of these locations:

| Location                                          | Allowed?            |
| ------------------------------------------------- | ------------------- |
| Same file as the sealed class                     | Yes                 |
| Same package, different file                      | Yes                 |
| Different package, same named module (Chapter 12) | Yes                 |
| Different package, no named module                | No -- compile error |

You cannot list a class from a different package in `permits` unless you are using the
named module system. The compiler will reject it outright. This is not a runtime check --
it fails at compile time.

```java
// package zoo
public sealed class Animal permits zoo.sub.Dog {} // DOES NOT COMPILE (unnamed module)
                                                   // Dog is in a different package

// package zoo.sub
public final class Dog extends Animal {}
```

The short version: without named modules, all classes in the `permits` list must be in
the same package as the sealed class.

---

### Sealed Class -- Subclass Modifier Rules

Every direct subclass of a sealed class must use exactly one of three modifiers: `final`,
`sealed`, or `non-sealed`. No other option exists. The compiler will reject anything else.

##### `final` subclass

The subclass cannot be extended any further. The hierarchy ends here.

```java
public sealed class Antelope permits Gazelle {}
public final class Gazelle extends Antelope {}
public class George extends Gazelle {} // DOES NOT COMPILE - Gazelle is final
```

##### `sealed` subclass

The subclass is itself sealed and must declare its own `permits` list. The chain of
fixed-set inheritance continues downward.

```java
public sealed class Mammal permits Equine {}
public sealed class Equine extends Mammal permits Zebra {}
public final class Zebra extends Equine {}
```

`Zebra` is an indirect subclass of `Mammal` but does not need to be in `Mammal`'s permits
list -- it only needs to be in `Equine`'s list. Despite this, the set of classes that can ever
be a `Mammal` at runtime is still fixed: only `Mammal`, `Equine`, or `Zebra`. The hierarchy
is still closed, just spread across two levels.

##### `non-sealed` subclass

The subclass reopens the hierarchy. Any class can extend it without being named anywhere.
This is the escape hatch -- useful when you want to seal a class against most extensions
but allow one branch to remain open.

```java
public sealed class Wolf permits Timber {}
public non-sealed class Timber extends Wolf {}
public class MyWolf extends Timber {}       // fine - Timber is non-sealed
public class MyFurryWolf extends MyWolf {}  // fine - MyWolf has no restriction either
```

`Wolf` is still sealed -- nobody can directly extend `Wolf` except `Timber`. But `Timber` is
non-sealed, so anything can extend `Timber`. Any instance of `MyWolf` or `MyFurryWolf`
is also an instance of `Timber`, which is named in `Wolf`'s permits list. Polymorphism
keeps the type system consistent.

Think of it as: `Wolf` controls its direct children strictly. What those children do with
their own subclasses is their business.

---

### Omitting the `permits` Clause

The `permits` clause is required when the subclasses are in separate files. When they are
in the same file or nested inside the sealed class, `permits` is optional -- but `extends` in
the subclass is always required.

##### Same file -- `permits` optional

```java
// Snake.java
public sealed class Snake {}       // permits omitted - Cobra is in the same file
final class Cobra extends Snake {} // extends still required
```

```java
// Snake.java -- same thing with explicit permits (both are valid)
public sealed class Snake permits Cobra {}
final class Cobra extends Snake {}
```

If `Cobra` were in a separate file, the first version without `permits` would not compile.

##### Nested subclass -- `permits` optional, but syntax is different if used

```java
// Snake.java
public sealed class Snake {
    final class Cobra extends Snake {} // nested - permits not required
}
```

If you want to name a nested subclass in the `permits` clause, you must use the outer
class name as a qualifier:

```java
public sealed class Snake permits Snake.Cobra { // qualified name required
    final class Cobra extends Snake {}
}

public sealed class Snake permits Cobra { // DOES NOT COMPILE - Cobra not in scope here
    final class Cobra extends Snake {}
}
```

When all subclasses are nested, the recommendation is to just omit `permits` entirely --
it is cleaner and avoids the qualification issue.

##### `permits` clause reference table

The only thing that makes `permits` optional is the subclass being in the same file.
Everything else requires it.

| Where are the direct subclasses? | `permits` clause |
|---|---|
| Same file, side by side | Optional |
| Same file, nested inside the sealed class | Optional |
| Different file -- same package or named module | Required |

##### Extra examples covering all the rules together

```java
// separate files - permits required
public sealed class Shape permits Circle, Square {}  // Shape.java
public final class Circle extends Shape {}           // Circle.java
public final class Square extends Shape {}           // Square.java

// subclass not in permits - compile error
public final class Triangle extends Shape {}         // DOES NOT COMPILE

// subclass missing modifier - compile error
public class Circle extends Shape {}                 // DOES NOT COMPILE - needs final/sealed/non-sealed

// two levels of sealed
public sealed class Vehicle permits Car {}
public sealed class Car extends Vehicle permits ElectricCar {}
public final class ElectricCar extends Car {}
// ElectricCar is not in Vehicle's permits - fine, it only needs to be in Car's permits
// but any Vehicle at runtime must be a Vehicle, Car, or ElectricCar - set is still fixed
```


---

### Sealed Interfaces

Interfaces can also be sealed. The rules are largely the same as sealed classes, with one
important difference: the `permits` list on a sealed interface can name either a class that
implements it or an interface that extends it.

```java
// sealed interface
public sealed interface Swims permits Duck, Swan, Floats {}

// classes permitted to implement the sealed interface
public final class Duck implements Swims {}
public final class Swan implements Swims {}

// interface permitted to extend the sealed interface
public non-sealed interface Floats extends Swims {}
```

`Duck` and `Swan` are concrete classes -- they use `implements` and must be marked
`final`, `sealed`, or `non-sealed` just like subclasses of a sealed class.

`Floats` is an interface that extends `Swims`. Interfaces are implicitly `abstract` and
can never be marked `final`. This means an interface in the `permits` list can only be
marked `sealed` or `non-sealed` -- `final` is not an option.

##### Modifier options for permitted types

| Permitted type | `final` | `sealed` | `non-sealed` |
|---|---|---|---|
| Class implementing a sealed interface | Yes | Yes | Yes |
| Interface extending a sealed interface | No -- interfaces cannot be `final` | Yes | Yes |

##### Same package / named module rule

The sealed interface must be in the same package or named module as every class or
interface listed in its `permits` clause. The same rule that applies to sealed classes
applies here.

---

### Sealed Class and Interface -- Rules Summary

| Rule | Detail |
|---|---|
| Declaration | Use `sealed` and `permits` modifiers |
| Location | Sealed class/interface and all direct subclasses/implementors must be in the same package or named module |
| Direct subclass modifiers | Must be `final`, `sealed`, or `non-sealed` -- no other option |
| `permits` clause | Optional only when subclasses are in the same file or nested inside the sealed class; required otherwise |
| Interfaces | A sealed interface can permit classes (that implement it) and interfaces (that extend it) |
| Interface subtype modifiers | Cannot be `final`; must be `sealed` or `non-sealed` |

##### Why sealed classes exist -- pattern matching preview

Sealed classes pair naturally with switch expressions and pattern matching. Because the
compiler knows every possible subtype at compile time, a switch over a sealed type does
not need a `default` branch -- the compiler can verify exhaustiveness on its own.

```java
public void printName(Fish fish) {
    System.out.println(switch (fish) {
        case Trout t -> t.getTroutName();
        case Bass b  -> b.getBassName();
        // no default needed - Fish is sealed, Trout and Bass are the only subtypes
    });
}
```

If `Fish` were not sealed, the compiler could not guarantee that `Trout` and `Bass` cover
all cases, so a `default` branch would be required. The sealed contract is what makes the
exhaustiveness check possible.

Note: this pattern matching feature was still in Preview in Java 17 and is not on the
exam. It illustrates the design intent behind sealed classes -- a closed hierarchy is
something the compiler can reason about completely.

---

### Encapsulating Data with Records

#### Understanding Encapsulation

A **POJO** (Plain Old Java Object) is a class used to model and pass data around, often
with few or no complex methods. A **JavaBean** is a POJO with additional conventions
applied (getter/setter naming, serialization, etc.).

##### The problem without encapsulation

```java
public class Crane {
    int numberEggs; // package access - anyone in the same package can write to this
    String name;
    public Crane(int numberEggs, String name) {
        this.numberEggs = numberEggs;
        this.name = name;
    }
}

public class Poacher {
    public void badActor() {
        var mother = new Crane(5, "Cathy");
        mother.numberEggs = -100; // compiles fine - no protection at all
    }
}
```

Package access on instance variables means any class in the same package can assign
invalid values directly. There is nothing stopping `Poacher` from setting a negative egg count.

##### Encapsulation: the fix

**Encapsulation** protects class members by restricting access to them. The standard
implementation in Java:
- Declare all instance variables `private`.
- Provide public getter methods to read values.
- Optionally provide public setter methods to write values, with validation inside them.

```java
public final class Crane {
    private final int numberEggs;
    private final String name;

    public Crane(int numberEggs, String name) {
        if (numberEggs >= 0) this.numberEggs = numberEggs; // guard condition
        else throw new IllegalArgumentException();
        this.name = name;
    }

    public int getNumberEggs() { // getter / accessor method
        return numberEggs;
    }

    public String getName() { // getter / accessor method
        return name;
    }
}
```

`numberEggs` and `name` are `private` -- only code inside `Crane` can read or write them.
The constructor validates the input. No setter exists, so the values cannot change after
construction. This class is both encapsulated and immutable.

##### Encapsulation vs. immutability

These are two separate properties that often go together but are not the same thing:

| Property | What it means | How to achieve it |
|---|---|---|
| Encapsulated | Outside code cannot directly access instance variables | Declare instance variables `private` |
| Immutable | Object state cannot change after construction | No setters, fields `final`, class `final` |

A class can be encapsulated without being immutable (private fields with setters). A
class that is immutable is always encapsulated (you cannot protect state without `private`).

##### Encapsulation does not require getters or setters

As long as all instance variables are `private`, the class is encapsulated. Getters and
setters are optional:
	
```java
public class Vet {
    private String name = "Dr Rogers";
    private int yearsExperience = 25;
    // no getters, no setters - still fully encapsulated
    // not very useful from outside, but valid
}
```

##### Extra: setter with validation (encapsulated but mutable)

```java
public class Crane {
    private int numberEggs;
    private String name;

    public Crane(int numberEggs, String name) {
        setNumberEggs(numberEggs); // reuse the setter's validation in the constructor
        this.name = name;
    }

    public int getNumberEggs() { return numberEggs; }
    public String getName()    { return name; }

    public void setNumberEggs(int numberEggs) {
        if (numberEggs < 0) throw new IllegalArgumentException("Eggs cannot be negative");
        this.numberEggs = numberEggs;
    }
}
```

This version is encapsulated (private fields, public accessors) but not immutable (the
setter allows state to change after construction). The validation in the setter is what
prevents invalid data -- the caller cannot bypass it by writing directly to the field.

---

### Records

A **record** is a special type of data-oriented class where the compiler generates all the
boilerplate for you. The entire encapsulated `Crane` class from before collapses to one line:

```java
public record Crane(int numberEggs, String name) {}
```

The syntax: the `record` keyword, the record name, and a parenthesised list of fields.
The body `{}` is optional content -- constructors, methods, and constants can go there.

##### What the compiler generates automatically

| Generated member | Description |
|---|---|
| Constructor | A canonical constructor with parameters matching the record fields in declaration order |
| Accessor methods | One per field, named exactly as the field (no `get` prefix) |
| `equals()` | Returns `true` if every field is equal in terms of `equals()` |
| `hashCode()` | Consistent hash using all fields |
| `toString()` | Prints each field in a convenient format |

##### Using a record

```java
var mommy = new Crane(4, "Cammy");
System.out.println(mommy.numberEggs()); // 4   - accessor, no "get" prefix
System.out.println(mommy.name());       // Cammy
```

Accessor methods are named after the field directly -- `numberEggs()`, not `getNumberEggs()`.

##### Constructor argument order is strict

The generated constructor takes parameters in the exact order they appear in the record
declaration. Getting the order or types wrong is a compile error:

```java
var mommy1 = new Crane("Cammy", 4); // DOES NOT COMPILE - wrong order
var mommy2 = new Crane("Cammy");    // DOES NOT COMPILE - missing argument
```

##### `toString()`, `equals()`, and `hashCode()` in action

```java
var father = new Crane(0, "Craig");
System.out.println(father);                              // Crane[numberEggs=0, name=Craig]

var copy = new Crane(0, "Craig");
System.out.println(copy);                                // Crane[numberEggs=0, name=Craig]
System.out.println(father.equals(copy));                 // true
System.out.println(father.hashCode() + ", " + copy.hashCode()); // 1007, 1007
```

`toString()` format is `RecordName[field1=value1, field2=value2]`. Two records with the
same field values are `equals()` and have the same `hashCode()` automatically.

##### A record with no fields is valid

```java
public record Crane() {}
```

Not something you would use in real code, but it is legal and could appear on the exam.

---

### Record Immutability

Records do not have setters. Every field is implicitly `final` and cannot be modified after
the constructor runs. To "modify" a record you create a new one, copying over whatever
values you want to keep:

```java
var cousin = new Crane(3, "Jenny");
var friend = new Crane(cousin.numberEggs(), "Janeice"); // new record, reusing one field
```

##### Records are implicitly final

Just as interfaces are implicitly `abstract`, records are implicitly `final`. Writing `final`
explicitly is optional but does not change anything:

```java
public final record Crane(int numberEggs, String name) {} // fine - final is redundant but allowed
```

Because a record is `final`, it cannot be extended or used as a parent:

```java
public record BlueCrane() extends Crane {} // DOES NOT COMPILE - cannot extend a record
```

##### Extra: the field-level final is implicit too

Each field in a record is implicitly declared `private final`. You cannot write to it outside
the constructor, and the compiler will not let you declare it otherwise:

```java
public record Crane(final int numberEggs, String name) {} // final on the parameter is allowed
                                                           // but redundant - already implicit
```

```java
public record Crane(int numberEggs, String name) {
    public void badMethod() {
        numberEggs = 10; // DOES NOT COMPILE - fields are final
    }
}
```

##### Records are implicitly immutable -- three layers

Records are not just encapsulated -- they are fully immutable by design, enforced at three
levels simultaneously without you writing a single modifier:

| Layer | What it means |
|---|---|
| Record class is implicitly `final` | Cannot be subclassed -- no way to add mutable state via inheritance |
| Every field is implicitly `private final` | Cannot be reassigned after the constructor completes |
| No setters are generated | No public API to change state from outside |

All three apply automatically. You get immutability for free.

---

### Record Constructors

There are two ways to declare a constructor in a record: the long constructor and the
compact constructor.

#### The Long Constructor

You can explicitly declare the constructor the compiler would normally generate. This is
called the **long constructor**. It must have the same parameter list in the same order as
the record declaration.

```java
public record Crane(int numberEggs, String name) {
    public Crane(int numberEggs, String name) {
        if (numberEggs < 0) throw new IllegalArgumentException();
        this.numberEggs = numberEggs;
        this.name = name;
    }
}
```

The compiler will not insert its own constructor if you provide one with the matching
signature. Since every field is `final`, the long constructor must assign every field -- if any
field is left unassigned, it does not compile:

```java
public record Crane(int numberEggs, String name) {
    public Crane(int numberEggs, String name) {} // DOES NOT COMPILE - fields not assigned
}
```

The downside: with many fields, you are back to writing trivial assignments for every one
-- exactly the boilerplate records were meant to eliminate.

---

#### The Compact Constructor

A **compact constructor** is a special constructor syntax unique to records. It takes no
parameters and no parentheses. The compiler implicitly sets all fields at the end of the
compact constructor body, after your custom code runs.

```java
public record Crane(int numberEggs, String name) {
    public Crane {  // no parentheses, no parameters
        if (numberEggs < 0) throw new IllegalArgumentException();
        name = name.toUpperCase(); // transforms the input parameter before assignment
    }
}
```

Inside the compact constructor, the names `numberEggs` and `name` refer to the
constructor input parameters, not the fields. You can validate or transform them. The
compiler then appends the field assignments automatically:

```java
// what the compiler effectively generates after your compact constructor body:
this.numberEggs = numberEggs;
this.name = name;
```

So `name = name.toUpperCase()` modifies the local parameter. The compiler then assigns
that modified value to `this.name`. You never write `this.x = x` yourself in a compact
constructor.

##### Key differences between long and compact constructors

| | Long constructor | Compact constructor |
|---|---|---|
| Parentheses | Yes, with full parameter list | No parentheses at all |
| Parameter names | Same as record fields | Same as record fields (implicit) |
| Field assignment | Must be written manually | Done automatically by the compiler |
| Use case | Full control, including changing parameter types | Validation and transformation only |

##### Compact constructor exam trap

The compact constructor has no parentheses. The exam will try to trick you with a regular
constructor-looking signature:

```java
public record Crane(int numberEggs, String name) {
    public Crane { ... }   // compact constructor - correct
    public Crane() { ... } // DOES NOT COMPILE - this would be a no-arg long constructor,
                           // but the record already has fields so this conflicts
}
```

A no-arg long constructor `Crane()` is only valid if the record itself declares no fields.

##### Extra: compact constructor cannot assign fields directly

Inside a compact constructor, `this.field = value` is not allowed. You modify the
parameters, and the compiler handles the assignment:

```java
public record Crane(int numberEggs, String name) {
    public Crane {
        this.numberEggs = 0; // DOES NOT COMPILE - cannot assign fields in compact constructor
    }
}
```

The compiler forbids it because the compact constructor is designed so that the compiler
owns the assignment step. If you could write `this.numberEggs = 0` yourself, you could
silently ignore the input parameter and set the field to any value you like -- defeating the
guarantee that the field always reflects the (possibly validated or transformed) input.
Java closes that door at compile time rather than leaving it as a footgun.

---

#### Transforming Parameters in a Compact Constructor

The compact constructor can validate and transform input parameters before the compiler
assigns them to the fields. The names inside the compact constructor body refer to the
parameters, not the fields.

```java
public record Crane(int numberEggs, String name) {
    public Crane {
        if (name == null || name.length() < 1)
            throw new IllegalArgumentException();
        name = name.substring(0, 1).toUpperCase()
             + name.substring(1).toLowerCase(); // capitalises only the first letter
    }
}
```

After the compact constructor body runs, the compiler assigns the (now transformed)
parameters to the fields. So `this.name` ends up with the capitalised version.

To reiterate: you modify the parameter, not the field. Writing `this.name = ...` is a
compile error inside a compact constructor. Removing `this` is all it takes to make it valid:

```java
public record Crane(int numberEggs, String name) {
    public Crane {
        this.numberEggs = 10; // DOES NOT COMPILE - cannot assign to field
        numberEggs = 10;      // fine - modifies the parameter, compiler assigns it to the field
    }
}
```

---

#### Overloaded Constructors in Records

A record can also declare overloaded constructors with a completely different parameter
list. These follow the same rules as long constructors -- no compact syntax.

```java
public record Crane(int numberEggs, String name) {
    public Crane(String firstName, String lastName) {
        this(0, firstName + " " + lastName); // must call another constructor on the first line
    }
}
```

##### Rules for overloaded record constructors

- The first line must be an explicit call to another constructor via `this()`. There are no
  exceptions -- it is always required, unlike regular classes where `super()` or `this()` is
  often optional.
- Any transformation of data must happen on that first line (as arguments to `this()`).
  After the `this()` call completes, all fields are already assigned and the object is
  immutable -- you cannot modify them.

##### Why `this()` is mandatory -- design intent

The `this()` requirement is a record-specific rule, enforced unconditionally. It is not
derived from the `final` field rule -- a `final` field can be assigned once inside any
constructor of the same class, so technically you could assign all record fields yourself
in an overloaded constructor. Java still forbids it.

The rule exists by design: records are meant to have one single place where all fields are
set and validated -- the canonical constructor. Forcing every overloaded constructor to
go through `this()` guarantees that canonical constructor always runs, so any validation
or transformation logic you put there is never bypassed.

```java
public record Crane(int numberEggs, String name) {
    public Crane(String name) {
        // no this() on the first line - DOES NOT COMPILE
        // the rule is unconditional - even if you assigned every field here it would still fail
    }
}

public record Crane(int numberEggs, String name) {
    public Crane(String name) {
        this(0, name); // fine - delegates to the canonical constructor
    }
}
```

```java
public record Crane(int numberEggs, String name) {
    public Crane(int numberEggs, String firstName, String lastName) {
        this(numberEggs + 1, firstName + " " + lastName); // transformation happens here
        numberEggs = 10;      // no effect - modifies only the local parameter after fields are set
        this.numberEggs = 20; // DOES NOT COMPILE - fields are final and already assigned
    }
}
```

After `this()` returns, `this.numberEggs` is already assigned and `final`. The assignment
`numberEggs = 10` does nothing useful -- it modifies the local parameter, not the field.
`this.numberEggs = 20` is a flat compile error.

##### Cyclic constructor calls are forbidden

Just like regular classes, two overloaded record constructors cannot call each other in a
cycle:

```java
public record Crane(int numberEggs, String name) {
    public Crane(String name) {
        this(1); // DOES NOT COMPILE - calls Crane(int), which calls Crane(String) -> cycle
    }
    public Crane(int numberEggs) {
        this(""); // DOES NOT COMPILE - calls Crane(String), which calls Crane(int) -> cycle
    }
}
```

The compiler detects the cycle and rejects both constructors. Every overloaded constructor
chain must eventually bottom out at the canonical (long) constructor without looping back.

##### Summary: three constructor forms for records

| Form | Parentheses | Parameters | Assigns fields | First line rule |
|---|---|---|---|---|
| Long constructor | Yes | Full list, same order | Manually, must assign all | None |
| Compact constructor | No | None (implicit) | Automatically by compiler | None |
| Overloaded constructor | Yes | Any different list | Via `this()` call | Must call `this()` on line 1 |

---

### Customizing Records

Records support many of the same features as a regular class. Members a record can include:

- Overloaded and compact constructors
- Instance methods, including overriding any of the auto-generated ones (`accessors`, `equals()`, `hashCode()`, `toString()`)
- Nested classes, interfaces, annotations, enums, and records

##### Overriding generated methods

```java
public record Crane(int numberEggs, String name) {
    @Override public int numberEggs()    { return 10; }   // overrides the generated accessor
    @Override public String toString()   { return name; } // overrides the generated toString()
}
```

`@Override` is optional but recommended -- it lets the compiler confirm the method
actually overrides something rather than accidentally introducing a new one.

##### What you cannot add -- no extra instance fields

You can add static fields, but you cannot declare instance fields outside the record header.
Adding extra instance fields would break immutability and defeat the purpose of a record:

```java
public record Crane(int numberEggs, String name) {
    private static int type = 10; // fine - static field is allowed
    public int size;              // DOES NOT COMPILE - extra instance field not allowed
    private boolean friendly;     // DOES NOT COMPILE - extra instance field not allowed
}
```

##### No instance initializers

Records do not support instance initializer blocks. All field initialization must happen
inside a constructor:

```java
public record Crane(int numberEggs, String name) {
    { numberEggs = 1; } // DOES NOT COMPILE - instance initializers not allowed in records
}
```

##### Keep records simple

Records were designed to be simple data carriers. The more logic and members you add,
the less they resemble their intended purpose. If a type needs complex behaviour, a regular
class is likely the better fit.

---

### Nested Classes

A **nested class** is a class defined within another class. The term "nested class" is used
broadly to cover all nested types including nested interfaces, enums, records, and
annotations.

There are four flavors:

| Type                | Description                                              |
| ------------------- | -------------------------------------------------------- |
| Inner class         | A non-static type defined at the member level of a class |
| Static nested class | A static type defined at the member level of a class     |
| Local class         | A class defined within a method body                     |
| Anonymous class     | A local class with no name                               |

**Member level** means directly inside the class body -- the same place where you declare
instance variables, constructors, and methods. Anything written inside a method body is
not at member level; it is local to that method.

```java
public class Home {
    private String greeting = "Hi"; // member level - instance variable
    protected class Room { }        // member level - inner class (sits alongside other members)

    public void enterRoom() {
        class LocalRoom { }         // NOT member level - inside a method body, this is a local class
    }
}
```

The distinction between inner class and local class is purely about location: inner classes
sit at member level alongside fields and methods, local classes sit inside a method body.

Benefits: restrict helper classes to the containing class, improve encapsulation, make
single-use classes easier to write. Downside: tight coupling between the outer and inner
class, and nested classes can make code harder to read when overused.

---

### Inner Classes

An **inner class** (also called a member inner class) is a non-static type defined at the
member level of a class -- the same level as methods, instance variables, and constructors.

##### Properties of inner classes

- Can use any of the four access levels (`public`, `protected`, package, `private`) -- not
  just `public` and package like top-level types.
- Can extend a class and implement interfaces.
- Can be marked `abstract` or `final`.
- Can access all members of the outer class, including `private` ones, without any special
  syntax.

```java
public class Home {
    private String greeting = "Hi"; // outer class instance variable

    protected class Room {          // inner class
        public int repeat = 3;
        public void enter() {
            for (int i = 0; i < repeat; i++) greet(greeting); // accesses outer private field directly
        }
        private static void greet(String message) {
            System.out.println(message);
        }
    }

    public void enterRoom() {       // instance method in outer class
        var room = new Room();      // no qualifier needed - already inside Home instance
        room.enter();
    }

    public static void main(String[] args) {
        var home = new Home();
        home.enterRoom();           // prints "Hi" three times
    }
}
```

`greeting` is `private` in `Home`, but `Room` can read it directly because it lives inside
`Home`. The private access boundary is the class, and `Room` is inside that boundary.

##### Inner classes since Java 16 can have static members

Before Java 16, inner classes could not declare static methods or fields (except static
constants). This restriction was removed when records were introduced. All four nested
class types can now declare static variables and methods.

---

### Instantiating an Inner Class

Because an inner class is non-static, it is always associated with an instance of the outer
class. There are two ways to instantiate one.

##### From inside an instance method of the outer class

When you write `new Room()` inside a non-static method of `Home`, Java silently reads it
as `this.new Room()`. The `this` is implicit -- the method was called on a `Home` instance,
so Java already knows which outer object to attach the inner class to.

```java
public void enterRoom() {
    Room r  = new Room();       // fine - implicit this.new Room()
    Room r2 = this.new Room();  // also fine - same thing written explicitly
    r.enter();
}
```

##### From a static method of the outer class

A static method has no `this`, so `new Room()` on its own does not compile. You must
supply an explicit outer instance:

```java
public static void staticMethod() {
    Room r = new Room();        // DOES NOT COMPILE - no outer instance, no implicit this
    Home h = new Home();
    Room r2 = h.new Room();     // fine - outer instance provided explicitly
}
```

##### From outside the outer class entirely

Same requirement -- an explicit outer instance is needed. The type must also be qualified
with the outer class name:

```java
public class Other {
    public void test() {
        Home.Room r = new Home.Room(); // DOES NOT COMPILE - no outer instance
        Home h = new Home();
        Home.Room r2 = h.new Room();   // fine - outer instance provided
    }
}

// one-liner form:
new Home().new Room().enter();
```

##### Summary: when can you write `new Room()` without qualification?

Only when you are inside a non-static method (or constructor) of the outer class. In every
other context you must write `outerInstance.new Room()`.

The syntax `outerInstance.new InnerClass()` is the only way to instantiate an inner class
from a static context or from outside the outer class. Java needs an outer instance because
the inner class is tied to it.

##### Inner classes require an outer instance -- compile errors

```java
public class Fox {
    private class Den {}

    public void goHome() {
        new Den(); // fine - instance method, outer instance is available via this
    }

    public static void visitFriend() {
        new Den(); // DOES NOT COMPILE - static method has no outer instance
    }
}

public class Squirrel {
    public void visitFox() {
        new Den(); // DOES NOT COMPILE - two reasons:
                   // 1. not inside Fox, so no outer Fox instance
                   // 2. Den is private and not accessible outside Fox at all
    }
}
```

Even with a `Fox` reference, `Squirrel` still could not instantiate `Den` because it is
`private`. Both the outer instance and visibility must be satisfied.

---

### Referencing Members with the Same Name Across Nested Classes

When nested classes have instance variables with the same name, `this` alone is
ambiguous. Java provides a qualified `this` syntax: `OuterClassName.this.fieldName`.

```java
public class A {
    private int x = 10;

    class B {
        private int x = 20;

        class C {
            private int x = 30;

            public void allTheX() {
                System.out.println(x);        // 30 - closest scope (C's own x)
                System.out.println(this.x);   // 30 - same as above
                System.out.println(B.this.x); // 20 - B's x via qualified this
                System.out.println(A.this.x); // 10 - A's x via qualified this
            }
        }
    }

    public static void main(String[] args) {
        A a = new A();
        A.B b = a.new B();     // type is A.B - B is a member of A
        A.B.C c = b.new C();   // type is A.B.C - C is too deep for just C to resolve
        c.allTheX();
    }
}
```

- `x` and `this.x` both resolve to the innermost class's own field.
- `B.this.x` reaches `B`'s field by qualifying `this` with the enclosing class name.
- `A.this.x` reaches `A`'s field the same way.
- The type `A.B` is needed when referencing `B` outside of `A`. The type `A.B.C` is needed
  when referencing `C` from outside because Java cannot infer the full path from just `C`.

##### Extra: qualified this only works from non-static context

```java
public class A {
    private int x = 10;

    class B {
        public static void test() {
            System.out.println(A.this.x); // DOES NOT COMPILE - static method has no outer instance
        }
    }
}
```

You might wonder: `B` is a non-static inner class, so an `A` instance must exist for `B` to
exist at all -- does that mean `A.this` should be accessible? No. Here is the distinction:

- At runtime, an `A` instance does exist when `B.test()` runs. You had to create one to
  get a `B` in the first place.
- But `test()` is a static method. Static methods deliberately have no `this` reference --
  including `A.this`. The compiler blocks it regardless of what exists at runtime.

```java
A a = new A();
A.B b = a.new B(); // A instance exists - necessary to create B
b.test();          // test() is static - A.this is still not accessible inside it
```

It is a language-level restriction, not a memory question. Static methods are context-free
by definition. Even though the outer instance is physically there, Java will not let a static
method reach it. The fix is to make `test()` a non-static method, giving it access to `this`
and therefore `A.this`.

---

### Static Nested Classes

A **static nested class** is a static type defined at the member level of an enclosing class.
Unlike an inner class, it does not require an instance of the outer class to be instantiated.
The trade-off is that it cannot access instance variables or methods of the outer class --
it has no outer `this`.

Think of it as a top-level class that happens to live inside another class, with three extras:

- The enclosing class name creates a namespace -- you must use it to refer to the nested class from outside.
- It can be marked `private` or `protected` (top-level types can only be `public` or package).
- The enclosing class can access the static nested class's `private` fields and methods.

```java
public class Park {
    static class Ride {
        private int price = 6;
    }

    public static void main(String[] args) {
        var ride = new Ride();                // fine - no Park instance needed
        System.out.println(ride.price);       // fine - enclosing class can access private members
    }
}
```

##### Instantiating from outside the enclosing class

```java
Park.Ride ride = new Park.Ride(); // qualified name required from outside
```

No outer instance needed -- just the qualified type name.

##### Static nested class vs. inner class -- key difference

| | Inner class | Static nested class |
|---|---|---|
| Needs outer instance to instantiate | Yes | No |
| Can access outer instance members | Yes | No |
| Access modifiers allowed | All four | All four |

##### What is the point of a static nested class?

The purpose is namespacing and encapsulation. Use it when a class only makes sense in
the context of one other class, but does not need to reach into that class's instance state.
A common example is a helper type like a `Node` inside a data structure:

```java
public class LinkedList {
    static class Node {
        int value;        // instance field - fine
        Node next;        // instance field - fine
        static int count; // static field - also fine

        Node(int value) {
            this.value = value;
            count++;
        }
    }

    public static void main(String[] args) {
        Node n1 = new Node(10); // no LinkedList instance needed
        Node n2 = new Node(20);
        n1.next = n2;
        System.out.println(Node.count); // 2
    }
}
```

A static nested class can have both instance fields and static fields -- the "static" only
means it is not tied to an outer instance, not that everything inside it must be static.

##### What a static nested class cannot do

It cannot access the outer class's instance members -- there is no outer `this`:

```java
public class Park {
    private String name = "Central Park";

    static class Ride {
        public void show() {
            System.out.println(name);      // DOES NOT COMPILE - no outer instance
            System.out.println(Park.name); // DOES NOT COMPILE - name is not static
        }
    }
}
```

If you need outer instance data, either pass a reference in manually or use an inner class:

```java
static class Ride {
    private Park park; // hold a reference manually

    Ride(Park park) {
        this.park = park;
    }

    public void show() {
        System.out.println(park.name); // fine - explicit reference
                                       // private access works because Ride is nested inside Park
    }
}
```

---

### Local Classes

A **local class** is a nested class declared inside a method body (or constructor or
initializer block). It behaves like a local variable -- it does not exist until the method is
called and goes out of scope when the method returns.

##### Properties of local classes

- No access modifier -- they cannot be `public`, `protected`, or `private`.
- Can be marked `final` or `abstract`.
- Have access to all fields and methods of the enclosing class when defined inside an
  instance method.
- Can access local variables only if those variables are `final` or effectively final.

```java
public class PrintNumbers {
    private int length = 5;

    public void calculate() {
        final int width = 20;

        class Calculator {               // local class - no access modifier
            public void multiply() {
                System.out.print(length * width); // length (instance field) and width (final local) - both fine
            }
        }

        var calculator = new Calculator();
        calculator.multiply();           // 100
    }

    public static void main(String[] args) {
        var printer = new PrintNumbers();
        printer.calculate();
    }
}
```

##### The effectively final rule

Local classes can only reference local variables that are `final` or effectively final (never
reassigned after initialisation). If a local variable is reassigned after the local class is
declared, the class cannot reference it:

```java
public void processData() {
    final int length = 5;  // final - allowed
    int width = 10;        // effectively final? depends on what happens next
    int height = 2;        // effectively final - never reassigned

    class VolumeCalculator {
        public int multiply() {
            return length * width * height; // DOES NOT COMPILE - width is not effectively final
        }
    }

    width = 2; // this reassignment makes width NOT effectively final
}
```

`length` is `final`. `height` is never reassigned so it is effectively final. `width` is
reassigned on the last line, so it is neither -- the local class cannot reference it.

##### Why only final or effectively final?

The restriction applies only to local variables of the method -- not to instance fields of
the enclosing class. The reason comes down to where each lives in memory.

**Local variables** live on the stack. They are created when the method is called and
destroyed when it returns. The local class's `.class` file has no link to that stack frame.
To bridge the gap, Java passes a copy of the local variable's value into the local class's
constructor at instantiation time. A copy is only safe if the original never changes -- if it
did, the local class would be holding a stale value. Hence the final or effectively final rule.

**Instance fields** live on the heap, inside the enclosing object. The local class (when
defined in an instance method) always holds a reference to the outer `this`, which points
to that heap object. It does not need a copy -- it reads the current value directly through
the reference whenever it needs it. The value can change freely and the local class always
sees the latest version.

```java
public class PrintNumbers {
    private int length = 5; // instance field on the heap - no restriction

    public void calculate() {
        final int width = 20; // local variable - final, safe to copy
        int height = 2;       // local variable - effectively final, safe to copy

        class Calculator {
            public void multiply() {
                length = 99;  // fine - instance field, modified via outer this reference
                System.out.print(length * width * height); // 99 * 20 * 2 = 3960
            }
        }

        new Calculator().multiply();
    }
}
```

In plain terms:
- Instance fields: always accessible and modifiable. The local class reads live from the heap via the outer `this`. No copy is made, so there is no stale value problem.
- Local variables: must be final or effectively final. The local variable lives on the method's stack frame. The stack frame is gone when the method returns, but the local class instance can outlive the method. Java cannot keep a pointer to a dead stack frame, so it copies the value at construction time instead. A copy can go stale if the original changes -- the final rule prevents that.

The `.class` file for the local class is generated at compile time. The copy of the local
variable's value is passed at runtime, at the moment `new LocalClass()` is called. The
compiler enforces the final rule at compile time because it knows a copy will happen and
has no way to guarantee correctness if the value can change after that point.

---

### Anonymous Classes

An **anonymous class** is a local class with no name. It is declared and instantiated in a
single statement using `new`, a type name, and a body `{}`. It must either extend a class
or implement an interface -- it cannot do both (unless extending `Object`, which does not
count as a real constraint).

##### What problem does it solve?

Normally, to use a subclass you declare it separately and then instantiate it:

```java
// step 1: declare the subclass somewhere
class MySale extends SaleTodayOnly {
    int dollarsOff() { return 3; }
}

// step 2: instantiate it where you need it
SaleTodayOnly sale = new MySale();
```

An anonymous class collapses both steps into one. You skip the name and write the class
body directly at the point of instantiation:

```java
// one statement: declare the class body AND create the instance at the same time
SaleTodayOnly sale = new SaleTodayOnly() { // "give me a SaleTodayOnly, body is right here"
    int dollarsOff() { return 3; }         // this IS the class body
};                                         // end of body + end of statement - semicolon required
```

Everything between `{` and `}` is the anonymous class. It extends `SaleTodayOnly`,
provides `dollarsOff()`, and creates exactly one instance -- all in one go. The class has no
name and cannot be referenced or reused anywhere else.

##### Extending an abstract class

```java
public class ZooGiftShop {
    abstract class SaleTodayOnly {
        abstract int dollarsOff();
    }

    public int admission(int basePrice) {
        SaleTodayOnly sale = new SaleTodayOnly() { // line 1: start of anonymous class
            int dollarsOff() { return 3; }          // line 2: method implementation
        };                                          // line 3: end of class body + semicolon
        return basePrice - sale.dollarsOff();       // line 4: use the instance normally
    }
}
```

`SaleTodayOnly` is abstract and cannot be instantiated on its own. The `{}` body after
`new SaleTodayOnly()` provides the implementation right there, anonymously. This is
equivalent to declaring a named local class that extends `SaleTodayOnly` and immediately
creating one instance of it.

The semicolon after `}` is required -- the whole thing is a local variable declaration, and
local variable declarations must end with a semicolon.

##### Implementing an interface

```java
public class ZooGiftShop {
    interface SaleTodayOnly {
        int dollarsOff();
    }

    public int admission(int basePrice) {
        SaleTodayOnly sale = new SaleTodayOnly() { // anonymous class implementing SaleTodayOnly
            public int dollarsOff() { return 3; }  // public - interface methods are implicitly public
        };
        return basePrice - sale.dollarsOff();
    }
}
```

The syntax is identical. The only differences: the type is an interface, and the method must
be `public`. An instance of a class is created on the `new` line -- not an instance of the
interface. Java infers whether you are extending a class or implementing an interface from
the type name.

##### Anonymous class as an instance variable (outside a method)

```java
public class Gorilla {
    interface Climb {}
    Climb climbing = new Climb() {}; // anonymous class at member level
}
```

Anonymous classes can be declared outside a method body too, as instance variable
initialisers.

##### Cannot extend and implement simultaneously

An anonymous class can only extend one class or implement one interface -- not both.
If you need both, use a named local class or a regular class instead.

##### Anonymous classes and lambda expressions

Before Java 8, anonymous classes were commonly used for short one-method
implementations:

```java
redButton.setOnAction(new EventHandler<ActionEvent>() {
    public void handle(ActionEvent e) {
        System.out.println("Red button pressed!");
    }
});
```

Since Java 8, lambdas replace most of these:

```java
redButton.setOnAction(e -> System.out.println("Red button pressed!"));
```

Anonymous classes are still useful when the interface has multiple methods, or when the
implementation needs to extend a class rather than implement a functional interface.

---

### Nested Classes -- Full Reference Tables

##### Permitted modifiers

| Modifier | Inner class | Static nested class | Local class | Anonymous class |
|---|---|---|---|---|
| Access modifiers | All four | All four | None | None |
| `abstract` | Yes | Yes | Yes | No |
| `final` | Yes | Yes | Yes | No |

Local and anonymous classes cannot have access modifiers because they are not accessible
by name from outside their declaration scope. Anonymous classes cannot be `abstract` or
`final` because they are instantiated immediately at declaration -- you cannot instantiate
an abstract class, and `final` on something with no name is meaningless.

##### Access rules

| | Inner class | Static nested class | Local class | Anonymous class |
|---|---|---|---|---|
| Can extend a class or implement interfaces? | Yes, any number | Yes, any number | Yes, any number | No -- exactly one superclass or one interface |
| Can access instance members of enclosing class? | Yes | No | Yes (if in an instance method) | Yes (if in an instance method) |
| Can access local variables of enclosing method? | N/A | N/A | Yes (if final or effectively final) | Yes (if final or effectively final) |

Key exam traps from these tables:
- A static nested class accessing an outer instance variable without a reference to the outer object does not compile.
- A local or anonymous class referencing a reassigned local variable does not compile.
- An anonymous class cannot implement an interface and extend a class at the same time.