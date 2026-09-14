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
