# Modules

This chapter introduces the Java Platform Module System (JPMS), which solves the
problem of managing large, complex Java applications made up of many packages and
third-party libraries.

---

## Introducing Modules

### The problem modules solve: JAR hell

Real applications are made up of hundreds or thousands of classes organized into
packages. Those packages are bundled into **JAR files** (Java Archive files -- ZIP files
with a `.jar` extension and some extra metadata).

Most applications also depend on third-party JAR files (open source libraries like
Spring or JUnit). Those libraries may themselves depend on other libraries. This creates
a complex chain of dependencies, and getting the right versions of every JAR onto the
classpath at runtime is fragile. The community calls this **JAR hell**:

- The wrong version of a class gets loaded silently.
- A class is missing entirely, causing a `ClassNotFoundException` at runtime.
- There is no way to know at compile time whether all dependencies are satisfied.

### What JPMS provides

The **Java Platform Module System (JPMS)**, introduced in Java 9, addresses these
problems by grouping code at a higher level than packages.

JPMS includes:

- A format for module JAR files
- A partitioning of the JDK itself into modules
- Additional command-line options for Java tools

### What a module is

A **module** is a group of one or more packages plus a special file called
`module-info.java`. This file is called the **module declaration** and is required in
every module.

The key difference from a plain JAR: a developer explicitly chooses which packages are
accessible outside the module. Everything else is hidden. This solves two of the main
JAR hell problems -- unintended access and missing dependencies -- by making both
explicit and checkable at startup.

---

### Exploring a module

#### Modules and dependencies

A real application can have many modules, each responsible for a different area of
functionality. Modules can depend on other modules. Those dependencies are declared
explicitly in `module-info.java` and represented as arrows in a dependency diagram.

Example: a zoo application broken into modules:

![[Pasted image 20261017193819.png|530]]

Each arrow points from the dependent module to the module it depends on. For example,
`zoo.staff` depends on both `zoo.animal.feeding` and `zoo.animal.talks`.

#### Inside a module

A single module (e.g., `zoo.animal.talks`) contains:

- One or more packages, each with their classes
- A `module-info.java` file at the root of the module

For example, `zoo.animal.talks` might look like this:

```
zoo.animal.talks/
├── zoo/animal/talks/content/
│   ├── ElephantScript.java
│   └── SeaLionScript.java
├── zoo/animal/talks/schedule/
│   ├── Weekday.java
│   └── Weekend.java
├── zoo/animal/talks/media/
│   ├── Signage.java
│   └── Announcement.java
└── module-info.java
```

The `module-info.java` file is required. Its contents define the module's name, what it
requires from other modules, and what it exports to other modules. This is covered in
detail in the following sections.

---

### Benefits of modules

Modules are optional, but they solve real problems:

| Benefit | What it means |
|---------|--------------|
| **Better access control** | Packages can be made accessible only within the module. This is a stronger form of encapsulation than `private`/`protected` -- entire packages can be hidden from the outside world. |
| **Clearer dependency management** | Modules declare what they depend on. Java checks that all required modules are present at startup, not the first time a missing class is accessed at runtime. Errors surface earlier and with a clearer message. |
| **Custom Java builds** | You can build a minimal Java runtime that includes only the JDK modules your application actually uses, instead of the full JDK (which is over 150 MB). |
| **Improved security** | A smaller runtime means fewer attack surfaces. Vulnerabilities in JDK parts you do not include cannot be exploited. |
| **Improved performance** | A smaller runtime means faster startup time and lower memory usage. |
| **Unique package enforcement** | Each package can come from only one module. Java prevents two modules from exporting the same package, eliminating ambiguity about which version of a class is being loaded. |

The access control and dependency management benefits are the most exam-relevant. The others are practical advantages of running a modular JDK.

---

## Creating and Running a Modular Program

This section walks through creating, compiling, and running the `zoo.animal.feeding`
module. 
![[Pasted image 20261018110525.png]]
---

### Creating the files

The module contains one package with one class:

```java
package zoo.animal.feeding;

public class Task {
    public static void main(String... args) {
        System.out.println("All fed!");
    }
}
```

The `module-info.java` file (the simplest possible form -- no dependencies, no exports):

```java
module zoo.animal.feeding {
}
```

#### Key differences between a module declaration and a regular class declaration

- `module-info.java` must be placed in the **root directory** of the module. Regular
  classes live in packages (subdirectories).
- The declaration uses the keyword `module`, not `class`, `interface`, or `enum`.
- Module names follow the same naming rules as packages -- periods (`.`) are allowed,
  dashes (`-`) are not.

#### Expected directory structure

```
feeding/
├── module-info.java
└── zoo/animal/feeding/
    └── Task.java
mods/           <-- output directory for compiled module artifacts
```

`feeding` is the module directory. `module-info.java` sits directly at its root. The
`Task.java` file is in the subdirectory matching its package name (`zoo/animal/feeding/`).

The `mods` directory is created at the same level as the module directory. It is used to
store the compiled module artifacts. The name `mods` is conventional but not required.

---

### Compiling the module

#### Where to run the command from

You run the command from the **parent directory** -- the one that contains the
`feeding/` module folder and the `mods/` output folder side by side:

```
<you are here>
├── feeding/
│   ├── module-info.java
│   └── zoo/animal/feeding/
│       └── Task.java
└── mods/
```

All paths in the command are written relative to this parent directory. If you run the
command from inside `feeding/` instead, every path would be wrong and the compiler
would not find your files.

#### The full command

```
javac --module-path mods -d feeding feeding/zoo/animal/feeding/*.java feeding/module-info.java
```

(Shown on one line as you would actually type it. The book splits it across lines for
readability only.)

#### What each part means

| Part | What it does |
|------|-------------|
| `javac` | The Java compiler. |
| `--module-path mods` | Tells the compiler where to look for other compiled modules that this module might depend on. `mods` is the directory you created for that purpose. This is the modular equivalent of `-classpath`. Here it could be omitted since `zoo.animal.feeding` has no dependencies, but you will need it once modules start depending on each other. |
| `-d feeding` | Tells the compiler where to write the compiled `.class` files. The compiler will recreate the package subdirectory structure inside `feeding/` automatically. |
| `feeding/zoo/animal/feeding/*.java` | The source files to compile. The `*` wildcard means "all `.java` files in this directory". This is the `Task.java` class. |
| `feeding/module-info.java` | The module declaration file. It must be compiled alongside the source files. |

After running this command, the `feeding/` directory will contain both the original
`.java` source files and the new `.class` files in the same subdirectory structure:

```
feeding/
├── module-info.class          <-- compiled module declaration
├── module-info.java
└── zoo/animal/feeding/
    ├── Task.class             <-- compiled class
    └── Task.java
```

#### The classpath options still exist

`-cp`, `--class-path`, and `-classpath` are still valid. They are still commonly used
for non-modular programs.

#### `--module-path` and `-p` are equivalent

The following four commands are all valid and equivalent:

```
javac -p mods -d feeding  feeding/zoo/animal/feeding/*.java  feeding/*.java
javac -p mods -d feeding  feeding/zoo/animal/feeding/*.java  feeding/module-info.java
javac -p mods -d feeding  feeding/zoo/animal/feeding/Task.java  feeding/module-info.java
javac -p mods -d feeding  feeding/zoo/animal/feeding/Task.java  feeding/*.java
```

You can list source files individually or use a wildcard (`*.java`) for all `.java` files
in a subdirectory.

#### javac options to memorize for the exam

| Use | Abbreviation | Long form |
|-----|-------------|-----------|
| Directory for class files | `-d <dir>` | n/a |
| Module path | `-p <path>` | `--module-path <path>` |

> The exam tests these options directly. Memorize both forms.

---

#### The bigger picture: how the command is structured

Think of the `javac` command as having three sections:

```
javac   [OPTIONS]   [SOURCE FILES]
```

```
javac   --module-path mods   -d feeding   feeding/zoo/animal/feeding/*.java   feeding/module-info.java
         ^^^^^^^^^^^^^^^^^    ^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              section 1        section 2                    section 3
```

| Section | What it is | What it means |
|---------|-----------|---------------|
| `--module-path mods` | Option -- where to find other modules | "If this module depends on other compiled modules, look for them in `mods/`." |
| `-d feeding` | Option -- where to put the output | "Write the compiled `.class` files into `feeding/`." |
| `feeding/.../*.java` `feeding/module-info.java` | Source files to compile | "These are the actual files I want you to compile." |

The options can appear in any order relative to each other. What matters is that the
source files come at the end.

---

#### Why the alternative commands all work

All four alternatives from the book compile the same two things: `Task.java` and
`module-info.java`. The variation is only in how you refer to them:

```
javac -p mods -d feeding  feeding/zoo/animal/feeding/*.java  feeding/*.java
```
- `-p` is the short form of `--module-path`. Identical meaning.
- `feeding/zoo/animal/feeding/*.java` matches `Task.java` by wildcard.
- `feeding/*.java` matches `module-info.java` by wildcard (it is the only `.java` file
  directly inside `feeding/`).

```
javac -p mods -d feeding  feeding/zoo/animal/feeding/*.java  feeding/module-info.java
```
- Same as above but `module-info.java` is named explicitly instead of via wildcard.

```
javac -p mods -d feeding  feeding/zoo/animal/feeding/Task.java  feeding/module-info.java
```
- Both files are named explicitly. No wildcards at all.

```
javac -p mods -d feeding  feeding/zoo/animal/feeding/Task.java  feeding/*.java
```
- `Task.java` named explicitly; `module-info.java` matched by wildcard.

The pattern: **`-p` and `--module-path` are interchangeable; explicit filenames and
`*.java` wildcards are interchangeable.** Any combination that results in both
`Task.java` and `module-info.java` being compiled is valid.

---

### A note on build tools

In real projects, `javac` and `java` commands are rarely typed manually. Build tools like
Maven and Gradle handle compilation automatically, and they suggest their own output
directories (e.g., `target/classes`). The module command syntax is something you
primarily need to know for the exam. The underlying concepts apply regardless.

---

### Running the module

#### What the command does

Running a modular program is like running a normal program, except you have to tell
Java two things instead of one:

- **Which module** contains the class you want to run
- **Which class** inside that module to run

In a non-modular program you just do:

```
java com.sybex.OCP
```

Java finds that class on the classpath. With modules, there is no classpath -- there is
a module path. And Java needs to know the module by name before it can look inside it
for your class.

---

#### Definitions you need first

**Fully qualified class name** -- the complete name of a class including its package,
written with dots:

```
zoo.animal.feeding.Task
^^^^^^^^^^^^^^^^^^^  ^^^^
     package         class
```

The simple name is just `Task`. The fully qualified name is `zoo.animal.feeding.Task`.
You have already seen this every time you write `java.util.ArrayList` in full without importing it.

**Module name** -- the name declared in `module-info.java`. For example:
`zoo.animal.feeding`. This is separate from the class name -- it identifies the module as a whole, not any specific class inside it.

---

#### The command

```
java --module-path feeding --module zoo.animal.feeding/zoo.animal.feeding.Task
```

| Part | What it means |
|------|--------------|
| `--module-path feeding` | Look for compiled modules in the `feeding/` directory. The modular equivalent of `--class-path`. |
| `--module` | Flag that says "I am specifying a module and a class to run." |
| `zoo.animal.feeding` | The module name (left of the `/`). |
| `/` | Separator between the module name and the class name. Not a file path. |
| `zoo.animal.feeding.Task` | The fully qualified class name (right of the `/`). |

The structure of the `--module` argument is always:

```
moduleName/fully.qualified.ClassName
```

Always exactly one `/`. Never written like a file path:

```
-m zoo/animal/feeding/zoo.animal.feeding.Task   // WRONG -- looks like a path, is not
-m zoo.animal.feeding/zoo.animal.feeding.Task   // correct
```

In this example the module name (`zoo.animal.feeding`) and the package name
(`zoo.animal.feeding`) look identical. That is just a naming convention -- module names
typically match the full package name or the start of it. They are still two separate
things.

Using the short forms (`-p` for `--module-path`, `-m` for `--module`):

```
java -p feeding -m zoo.animal.feeding/zoo.animal.feeding.Task
```

#### java options to memorize for the exam

| Use | Abbreviation | Long form |
|-----|-------------|-----------|
| Module name | `-m <name>` | `--module <name>` |
| Module path | `-p <path>` | `--module-path <path>` |

---

### Packaging the module

After compiling, you can package the module into a JAR file so it can be used by other
modules. Create the `mods/` directory first, then run:

```
jar -cvf mods/zoo.animal.feeding.jar -C feeding/ .
```

- `-cvf` -- create, verbose, file (standard JAR flags, nothing module-specific).
- `mods/zoo.animal.feeding.jar` -- the output JAR file. Naming it after the module is
  conventional.
- `-C feeding/ .` -- change into the `feeding/` directory and include everything in it.

  A JAR file is essentially a ZIP file. Every file inside it has a recorded path. The
  question is: what does that path start with?

  If you listed the files manually without `-C`, the JAR would record paths as you typed
  them, including the `feeding/` prefix:

  ```
  feeding/module-info.class
  feeding/zoo/animal/feeding/Task.class
  ```

  When Java opens the JAR as a module it looks for `module-info.class` at the root. It
  would not find it -- it would find `feeding/module-info.class` instead. The module
  system would fail.

  `-C feeding/ .` tells `jar` to step into `feeding/` first, then grab everything from
  there. Because `jar` is now standing inside `feeding/` when it records the paths, the
  `feeding/` prefix is gone:

  ```
  module-info.class
  zoo/animal/feeding/Task.class
  ```

  `module-info.class` is at the root, which is exactly what Java expects. The short
  version: `-C feeding/ .` means "don't include the folder name itself, just include
  what's inside it."

There is nothing module-specific about this `jar` command. It simply packages the
compiled contents of `feeding/` into a JAR.

#### Running from the packaged JAR

Once packaged, use `mods` as the module path instead of `feeding`:

```
java -p mods -m zoo.animal.feeding/zoo.animal.feeding.Task
```

The command looks identical to the loose-class version -- the only difference is the
module path argument:

| Stage | Module path argument |
|-------|---------------------|
| Running loose compiled classes | `-p feeding` |
| Running from the packaged JAR | `-p mods` |

Java finds the module inside `mods/zoo.animal.feeding.jar` automatically because the
module path points to the directory containing it.

---


## Updating the Example for Multiple Modules

The zoo application has four modules total. The other three all depend on
`zoo.animal.feeding`. The dependency diagram looks like this:
![[Pasted image 20261110150906.png|531]]

<!-- Figure 12.6: zoo.animal.feeding is required by zoo.animal.care, zoo.animal.talks, and zoo.staff -->


---

### Updating the feeding module: `exports`

For other modules to call code inside `zoo.animal.feeding`, the module must explicitly
declare that intent using the `exports` directive.

Without `exports`, a module can still be run from the command line, but its packages
are invisible to other modules.

```java
module zoo.animal.feeding {
    exports zoo.animal.feeding;
}
```

The package name after `exports` must be the full package name, not a wildcard.
Exporting a package does not automatically export its subpackages.

Recompile and repackage with the same commands as before:

```
javac -p mods -d feeding feeding/zoo/animal/feeding/*.java feeding/module-info.java
jar -cvf mods/zoo.animal.feeding.jar -C feeding/ .
```

---

### Creating the care module: `requires`

`zoo.animal.care` has two packages:

- `zoo.animal.care.medical` -- intended for use by other modules; will be exported.
- `zoo.animal.care.details` -- internal only; will not be exported.

![[Pasted image 20261110151319.png|618]]

The two classes:

```java
// HippoBirthday.java
package zoo.animal.care.details;
import zoo.animal.feeding.*;
public class HippoBirthday {
    private Task task;
}
```

```java
// Diet.java
package zoo.animal.care.medical;
public class Diet { }
```

The `module-info.java`:

```java
module zoo.animal.care {
    exports zoo.animal.care.medical;
    requires zoo.animal.feeding;
}
```

- `exports zoo.animal.care.medical` -- makes this package visible to other modules.
  `zoo.animal.care.details` is not listed, so it stays private to this module.
- `requires zoo.animal.feeding` -- declares that this module depends on
  `zoo.animal.feeding`. Java verifies the dependency is present at startup.

#### Convention: module name as package prefix

The packages inside a module typically begin with the same prefix as the module name
(`zoo.animal.care.medical`, `zoo.animal.care.details`). Think of it as the module
"claiming" that package namespace and all subpackages beneath it.

Compile and package:

```
javac -p mods
    -d care
    care/zoo/animal/care/details/*.java
    care/zoo/animal/care/medical/*.java
    care/module-info.java

jar -cvf mods/zoo.animal.care.jar -C care/ .
```

All packages in the module must be listed as separate source file arguments to `javac`.
In practice a build tool handles this; for the exam, know that you list each package
path explicitly.

---

### Creating the talks module: multiple `exports` and `requires`

`zoo.animal.talks` depends on two modules and exports three packages.

![[Pasted image 20261111093433.png|517]]


![[Pasted image 20261111093446.png]]


```java
module zoo.animal.talks {
    exports zoo.animal.talks.content;
    exports zoo.animal.talks.media;
    exports zoo.animal.talks.schedule;

    requires zoo.animal.feeding;
    requires zoo.animal.care;
}
```

There is no limit on the number of `exports` or `requires` statements. Each package to
be exported gets its own `exports` line; each module dependency gets its own `requires`
line.

The six classes (all empty except `Announcement`):

```java
package zoo.animal.talks.content;
public class ElephantScript { }

package zoo.animal.talks.content;
public class SeaLionScript { }

package zoo.animal.talks.media;
public class Announcement {
    public static void main(String[] args) {
        System.out.println("We will be having talks");
    }
}

package zoo.animal.talks.media;
public class Signage { }

package zoo.animal.talks.schedule;
public class Weekday { }

package zoo.animal.talks.schedule;
public class Weekend { }
```

Compile and package:

```
javac -p mods
    -d talks
    talks/zoo/animal/talks/content/*.java
    talks/zoo/animal/talks/media/*.java
    talks/zoo/animal/talks/schedule/*.java
    talks/module-info.java

jar -cvf mods/zoo.animal.talks.jar -C talks/ .
```

---

### Creating the staff module: `requires` only, no `exports`

`zoo.staff` has one package and does not expose anything outside the module.

![[Pasted image 20261111093934.png]]
<!-- Figure 12.10: zoo.staff contents -- one package plus module-info.java -->

![[Pasted image 20261111093950.png]]
<!-- Figure 12.11: zoo.staff depends on all three other modules -->

```java
module zoo.staff {
    requires zoo.animal.feeding;
    requires zoo.animal.care;
    requires zoo.animal.talks;
}
```

No `exports` statements because nothing in `zoo.staff` is meant to be used by other
modules. A module with only `requires` and no `exports` is perfectly valid.

The single class:

```java
package zoo.staff;
public class Jobs { }
```

Compile and package:

```
javac -p mods
    -d staff
    staff/zoo/staff/*.java staff/module-info.java

jar -cvf mods/zoo.staff.jar -C staff/ .
```

---

### Summary: `exports` and `requires`

| Directive | Purpose | Required? |
|-----------|---------|-----------|
| `exports <package>` | Makes a package visible to other modules | Only if other modules need to use this package |
| `requires <module>` | Declares a dependency on another module | Yes, for every module this module uses |

Key rules:
- `exports` takes a **package name**.
- `requires` takes a **module name**.
- Neither accepts wildcards.
- A package that is not exported is completely hidden from all other modules, even if
  the classes inside it are `public`.
- Java verifies all `requires` dependencies are present at startup, not at the first
  runtime access.

---


## Diving into the Module Declaration

The directives covered here -- `exports`, `requires`, and `opens` -- can appear in any
order inside a module declaration. The order does not affect behavior.

---

### `exports`: exporting a package

#### Unqualified exports

`exports packageName` makes a package available to **all** other modules:

```java
exports zoo.animal.talks.media;
```

#### Qualified exports

`exports packageName to moduleName` restricts access to a **specific** module:

```java
module zoo.animal.talks {
    exports zoo.animal.talks.content to zoo.staff;
    exports zoo.animal.talks.media;
    exports zoo.animal.talks.schedule;

    requires zoo.animal.feeding;
    requires zoo.animal.care;
}
```

Here, `zoo.animal.talks.content` is only accessible to `zoo.staff`. No other module
can use it, even if it `requires zoo.animal.talks`. The other two packages remain
unqualified and are accessible to any module that requires `zoo.animal.talks`.

Qualified exports are useful when you know exactly which module should have access
and want to prevent unintended use by future modules.

---

### What "exported" actually means

Exporting a package does not expose everything in it -- only the following are visible
outside the module:

- All `public` classes, interfaces, enums, and records in the package.
- All `public` and `protected` fields and methods in those types.

`private` members and package-private (no modifier) members remain inaccessible
regardless of whether the package is exported.

#### Full access control table with modules

| Level | Within module code | Outside module |
|-------|--------------------|----------------|
| `private` | Available only within the class | No access |
| Package-private | Available only within the package | No access |
| `protected` | Available within package or to subclasses | Accessible to subclasses only if package is exported |
| `public` | Available to all classes in the module | Accessible only if package is exported |

The key takeaway: `public` alone is no longer enough for code outside the module to
access a type. The package must also be exported. Modules add a fourth layer of access
control on top of the existing four modifiers.

---


### `requires transitive`: implicit dependencies

`requires moduleName` declares a direct dependency. `requires transitive moduleName`
does the same, but also passes that dependency on to any module that requires this one.
Any module that requires yours automatically gets access to the transitive dependency
without having to declare it explicitly.

#### Example: redesigning the zoo modules with transitive dependencies

The figure below shows the same four modules redrawn using transitive dependencies.
Dashed lines represent relationships that are now implied transitively; solid lines are
the explicit `requires` statements still needed.

![[Pasted image 20261111095616.png]]
<!-- Figure 12.12: transitive dependency version of the zoo modules -->

`zoo.animal.feeding` is unchanged -- it still exports its package:

```java
module zoo.animal.feeding {
    exports zoo.animal.feeding;
}
```

`zoo.animal.care` switches to `requires transitive`, so any module that requires`zoo.animal.care` automatically gets`zoo.animal.feeding` too:

```java
module zoo.animal.care {
    exports zoo.animal.care.medical;
    requires transitive zoo.animal.feeding;
}
```

`zoo.animal.talks` requires `zoo.animal.care` transitively, which makes the explicit `requires zoo.animal.feeding` redundant:

```java
module zoo.animal.talks {
    exports zoo.animal.talks.content to zoo.staff;
    exports zoo.animal.talks.media;
    exports zoo.animal.talks.schedule;

    // no longer needed: requires zoo.animal.feeding;
    // no longer needed: requires zoo.animal.care;
    requires transitive zoo.animal.care;
}
```

`zoo.staff` now only needs to require `zoo.animal.talks`, and all other dependencies flow in automatically:

```java
module zoo.staff {
    // no longer needed: requires zoo.animal.feeding;
    // no longer needed: requires zoo.animal.care;
    requires zoo.animal.talks;
}
```

#### Effects of `requires transitive` on `zoo.animal.care`

When `zoo.animal.care` uses `requires transitive zoo.animal.feeding`:

- `zoo.animal.care` cannot be compiled or executed without `zoo.animal.feeding`.
- `zoo.animal.talks` cannot be compiled or executed without `zoo.animal.feeding`, even if it never explicitly references any package from that module.
- `zoo.animal.talks` may optionally declare `requires zoo.animal.feeding` itself, but it is not required to.

Without the `transitive` modifier, every module in the chain would have to declare `requires zoo.animal.feeding` individually.

#### Duplicate `requires` -- does not compile

A module cannot list the same dependency in both `requires` and `requires transitive`.
This is redundant and Java rejects it:

```java
module bad.module {
    requires zoo.animal.talks;
    requires transitive zoo.animal.talks;  // DOES NOT COMPILE
}
```

Think of `requires transitive` as `requires` plus extra propagation behavior. Having both for the same module is a contradiction.

---

### `opens`: enabling reflection

Reflection is a Java feature that allows code to inspect and invoke other code at runtime,
including code that may not be known at compile time. It can even bypass access control.

#### What reflection actually does

Reflection lets external code look up classes, fields, and methods by name as strings at
runtime, and call them even without knowing they exist at compile time:

```java
// Another module using reflection to call into zoo.animal.talks.schedule
Class<?> clazz = Class.forName("zoo.animal.talks.schedule.Weekday");
Method method = clazz.getDeclaredMethod("getSchedule");
method.setAccessible(true);  // bypass access control
Object result = method.invoke(clazz.newInstance());
```

`setAccessible(true)` is the dangerous part -- it can bypass `private`, `protected`,
and package-private access entirely. This is why modules do not allow it by default.

This is not a module examining itself. It is an external module examining yours from the
outside at runtime.

#### Why frameworks need it

Frameworks like Spring, Hibernate, and JUnit rely on reflection heavily. They inspect
your classes at runtime, read annotations, call constructors, and inject dependencies --
all without knowing your specific class names at compile time. If your module does not
`opens` the relevant packages, those frameworks throw an `InaccessibleObjectException`
at runtime even if the code compiled without errors.

#### `exports` vs `opens`

| Directive | What it allows |
|-----------|---------------|
| `exports` | Other modules can compile against your code (normal method calls) |
| `opens` | Other modules can use reflection on your code at runtime |

A package can be exported without being open, open without being exported, or both.

By default, modules block all reflective access. The `opens` directive explicitly opts a
package in.

#### Unqualified `opens`

Allows any module to use reflection on this package:

```java
opens zoo.animal.talks.schedule;
```

#### Qualified `opens`

Restricts reflective access to a specific module:

```java
opens zoo.animal.talks.media to zoo.staff;
```

Example with both:

```java
module zoo.animal.talks {
    opens zoo.animal.talks.schedule;
    opens zoo.animal.talks.media to zoo.staff;
}
```

You do not need to know how to write reflection code for the exam -- just know that
`opens` is what grants permission for it, and why it exists.

---

### `open module`: opening all packages at once

Instead of listing individual `opens` directives, you can mark the entire module as open
using the `open` modifier on the module declaration itself:

```java
open module zoo.animal.talks {
}
```

This makes every package in the module available for reflection.

#### `open module` and `opens` cannot be combined

If the module is already declared `open`, individual `opens` directives inside it are
redundant and cause a compile error:

```java
open module zoo.animal.talks {
    opens zoo.animal.talks.schedule;  // DOES NOT COMPILE
}
```

The packages are already open -- adding `opens` is contradictory.

#### `open` vs `opens` -- easy to confuse

| Syntax | Where it appears | Effect |
|--------|-----------------|--------|
| `open module name { }` | Module declaration keyword | Opens all packages for reflection |
| `opens packageName;` | Directive inside the module body | Opens one specific package for reflection |

The only difference in spelling is the `s` -- but the meaning and placement are
completely different.

---


## Services

A **service** is composed of:

1. A **service provider interface** (SPI) -- an interface (or abstract class) that defines
   the behavior.
2. Any supporting classes the interface references.
3. A **service locator** -- the lookup mechanism for finding implementations.

The implementations themselves are **not** part of the service. They are provided
separately by service provider modules.

The tour application example uses four modules:

![[Pasted image 20261111125452.png]]
<!-- Figure 12.13: four modules in the tour application -->

Having four separate modules is not required -- the SPI and service locator could live in
the same module. The example splits them to illustrate each role clearly.

---

### Declaring the service provider interface

The `zoo.tours.api` module defines the service. It has two files.

A supporting record used by the interface:

```java
// Souvenir.java
package zoo.tours.api;

public record Souvenir(String description) { }
```

The service provider interface itself:

```java
// Tour.java
package zoo.tours.api;

public interface Tour {
    String name();
    int length();
    Souvenir getSouvenir();
}
```

All three methods use the implicit `public` modifier that interfaces provide.

The module declaration exports the package so other modules can see the interface:

```java
// module-info.java
module zoo.tours.api {
    exports zoo.tours.api;
}
```

Compile and package:

```
javac -d serviceProviderInterfaceModule
    serviceProviderInterfaceModule/zoo/tours/api/*.java
    serviceProviderInterfaceModule/module-info.java

jar -cvf mods/zoo.tours.api.jar -C serviceProviderInterfaceModule/ .
```

> `-p` is omitted here because `zoo.tours.api` has no `requires` -- it does not depend
> on any other module, so there are no compiled modules for the compiler to look up.
> You only need `-p` when the module has at least one `requires` directive.

#### Note on "service provider interface"

Despite the name, a service provider interface can technically be an **abstract class**
rather than an actual interface. The exam only uses actual interfaces for this, so the
term SPI in this context means interface.

The service consists of the SPI (`Tour`), its supporting classes (`Souvenir`), and the
lookup mechanism defined next. The implementations are defined separately and are
not part of the service itself.

---


### Creating a service locator: `uses`

A **service locator** finds implementations of a service provider interface at runtime.
Java provides `ServiceLoader` for this purpose. You pass the SPI type to `ServiceLoader.load()` and it returns all available implementations.

```java
// TourFinder.java
package zoo.tours.reservations;

import java.util.*;
import zoo.tours.api.*;

public class TourFinder {

    public static Tour findSingleTour() {
        ServiceLoader<Tour> loader = ServiceLoader.load(Tour.class);
        for (Tour tour : loader)
            return tour;
        return null;
    }

    public static List<Tour> findAllTours() {
        List<Tour> tours = new ArrayList<>();
        ServiceLoader<Tour> loader = ServiceLoader.load(Tour.class);
        for (Tour tour : loader)
            tours.add(tour);
        return tours;
    }
}
```

`findSingleTour()` is a convenience method for when exactly one implementation is
expected. `findAllTours()` handles any number of implementations. At runtime there may
be many providers, or none.

> `ServiceLoader.load()` is relatively expensive. In a real application, cache the result
> rather than calling it repeatedly.

The module declaration for `zoo.tours.reservations`:

```java
// module-info.java
module zoo.tours.reservations {
    exports zoo.tours.reservations;
    requires zoo.tours.api;
    uses zoo.tours.api.Tour;
}
```

Both `requires` and `uses` are needed:
- `requires zoo.tours.api` -- needed at compile time so the code can reference the
  `Tour` interface.
- `uses zoo.tours.api.Tour` -- tells the module system that this module will look up
  implementations of `Tour` at runtime via `ServiceLoader`. Without this, the lookup
  will not work even if everything compiles.

Compile and package:

```
javac -p mods -d serviceLocatorModule
    serviceLocatorModule/zoo/tours/reservations/*.java
    serviceLocatorModule/module-info.java

jar -cvf mods/zoo.tours.reservations.jar -C serviceLocatorModule/ .
```

---

### `ServiceLoader` API

Two methods to know for the exam:

```java
public final class ServiceLoader<S> implements Iterable<S> {
    public static <S> ServiceLoader<S> load(Class<S> service) { ... }
    public Stream<Provider<S>> stream() { ... }
}
```

- `load()` returns an `Iterable` you can loop through directly. Each element is already
  an instantiated service object.
- `stream()` returns a `Stream<Provider<S>>`. Each element is a `Provider` wrapper,
  not the service itself -- you must call `.get()` to unwrap it and get the actual object.

#### Why `stream()` returns `Provider` wrappers instead of the service directly

When you iterate with `load()` in a `for` loop, Java instantiates each service provider
one at a time as you go through the loop. That is fine for a loop.

A `Stream` is different -- it is **lazy**. Operations on a stream (like `filter`, `map`,
`limit`) are not executed until a terminal operation triggers them. This means the stream
needs a way to represent "a potential service that hasn't been created yet" before
deciding whether to actually create it.

The problem: to give you a `Stream<Tour>` directly, Java would have to instantiate all
registered `TourImpl` objects upfront just to put them in the stream -- even if you only
need one of them.

Imagine 100 service providers are registered and you want only the first one whose
`length()` is over 60 minutes:

```java
// Without Provider -- hypothetical, not how it works:
// Java would have to create all 100 TourImpl objects NOW just to build the stream,
// even though you only need one.
stream.filter(t -> t.length() > 60)
      .findFirst();
// You paid for 100 objects but used 1.
```

With `Provider`, the stream contains 100 lightweight handles -- no `TourImpl` is
created yet. The actual object is only instantiated when you call `.get()`, and only
for the providers you decide to keep:

```java
// With Provider -- what actually happens:
ServiceLoader.load(Tour.class)
    .stream()                   // 100 lightweight Provider handles, zero TourImpl objects created
    .map(Provider::get)         // only HERE does each TourImpl get instantiated
    .filter(t -> t.length() > 60)
    .findFirst();
```

If you put a `filter` before `.map(Provider::get)`, only the providers that pass the
filter ever get instantiated:

```java
ServiceLoader.load(Tour.class)
    .stream()                          // still just handles, nothing created
    .filter(p -> someChapFilter(p))    // discard providers cheaply, before creating them
    .map(Provider::get)                // only survivors get instantiated here
    .findFirst();
```

Think of `Provider` as a ticket. It is a cheap stand-in that lets the stream do its work
before you commit to creating the expensive object. You cash the ticket (call `.get()`)
only when you have decided you actually need that specific one.

Example using `stream()`:

```java
ServiceLoader.load(Tour.class)
    .stream()                        // Stream<Provider<Tour>> -- nothing instantiated yet
    .map(Provider::get)              // call .get() on each Provider -> instantiates the Tour
    .mapToInt(Tour::length)          // extract the length from each Tour
    .max()                           // find the longest tour
    .ifPresent(System.out::println); // print it if any tours exist
```

If you had a `filter` step before `.map(Provider::get)`, only the providers that survive
the filter would ever be instantiated -- the rest are discarded as lightweight `Provider`
handles without creating the actual objects.

---

### Invoking from a consumer: `requires` only

A **consumer** (or client) is a module that obtains and uses a service through the
service locator. It does not need to know about the implementations -- the service
locator handles discovery.

```java
// Tourist.java
package zoo.visitor;

import java.util.*;
import zoo.tours.api.*;
import zoo.tours.reservations.*;

public class Tourist {
    public static void main(String[] args) {
        Tour tour = TourFinder.findSingleTour();
        System.out.println("Single tour: " + tour);

        List<Tour> tours = TourFinder.findAllTours();
        System.out.println("# tours: " + tours.size());
    }
}
```

```java
// module-info.java
module zoo.visitor {
    requires zoo.tours.api;
    requires zoo.tours.reservations;
}
```

No `uses` directive needed here -- the consumer delegates all lookup to the service
locator module. It just needs `requires` for both the API and the reservations modules.

#### Why `uses` was needed in the service locator but not here

`uses` is the directive that tells the module system: "this module will call
`ServiceLoader.load()` to look up implementations of this interface at runtime."

The module that actually contains the `ServiceLoader.load(Tour.class)` call is
`zoo.tours.reservations` -- the service locator. That is the module the JVM needs to
warn: "you are going to go searching for `Tour` implementations at runtime, make sure
you declare that intent." Without `uses`, the module system would not wire up the
lookup and `ServiceLoader` would find nothing.

`zoo.visitor` never calls `ServiceLoader.load()` itself. It just calls
`TourFinder.findSingleTour()` and `TourFinder.findAllTours()` -- normal method
calls. The discovery already happened inside `zoo.tours.reservations`. The consumer
just receives the result. There is nothing to declare with `uses` because no service
lookup is happening in this module.

The rule: **`uses` goes in the module that calls `ServiceLoader.load()`, not in every
module that indirectly benefits from the result.**

Compile, package, and run:

```
javac -p mods -d consumerModule
    consumerModule/zoo/visitor/*.java consumerModule/module-info.java

jar -cvf mods/zoo.visitor.jar -C consumerModule/ .

java -p mods -m zoo.visitor/zoo.visitor.Tourist
```

Output at this point (no implementation exists yet):

```
Single tour: null
# tours: 0
```

---

### Adding a service provider: `provides ... with`

A **service provider** is a module that implements the SPI. The implementation class is
not exported -- callers should never reference it directly. Instead, the module declares
it via the `provides` directive.

```java
// TourImpl.java
package zoo.tours.agency;

import zoo.tours.api.*;

public class TourImpl implements Tour {
    public String name() { return "Behind the Scenes"; }
    public int length() { return 120; }
    public Souvenir getSouvenir() { return new Souvenir("stuffed animal"); }
}
```

```java
// module-info.java
module zoo.tours.agency {
    requires zoo.tours.api;
    provides zoo.tours.api.Tour with zoo.tours.agency.TourImpl;
}
```

The `provides` syntax is:

```
provides interfaceName with className;
```

- `requires zoo.tours.api` -- needed to reference the `Tour` interface at compile time.
- `provides ... with` -- registers `TourImpl` as an implementation of `Tour` with the
  module system. The package containing `TourImpl` is intentionally not exported; the
  implementation is made available only through the service mechanism.

#### Why `implements Tour` alone is not enough

`implements Tour` in the source code is a compile-time relationship. It tells the
compiler that `TourImpl` satisfies the `Tour` contract. It says nothing about discovery.

At runtime, there could be dozens of JAR files on the module path, and any of them
could contain a class that implements `Tour`. The JVM does not scan every class in
every JAR looking for implementations -- that would be slow and fragile.

`provides zoo.tours.api.Tour with zoo.tours.agency.TourImpl` is an explicit
registration. The module system reads all `module-info` files at startup and builds a
registry of "who provides what". When `ServiceLoader.load(Tour.class)` is called, it
consults that registry directly instead of scanning everything.

The two concerns are separate:
- `implements Tour` -- "does this class fulfill the contract?" (compiler)
- `provides ... with` -- "where should the runtime look when someone asks for a `Tour`?" (module system registry)

Both are required. One without the other does not work.

Compile and package:

```
javac -p mods -d serviceProviderModule
    serviceProviderModule/zoo/tours/agency/*.java
    serviceProviderModule/module-info.java

jar -cvf mods/zoo.tours.agency.jar -C serviceProviderModule/ .
```

Now run the consumer again without recompiling it:

```
java -p mods -m zoo.visitor/zoo.visitor.Tourist
```

Output:

```
Single tour: zoo.tours.agency.TourImpl@1936f0f5
# tours: 1
```

The service locator discovered the new implementation automatically. Neither
`zoo.tours.reservations` nor `zoo.visitor` needed to be recompiled. This is
**loose coupling** -- the service provider can be swapped out or added to without
touching any other module.

---

### Summary: services and directives

#### Service roles

| Artifact | Part of the service? | Directives required |
|----------|---------------------|---------------------|
| Service provider interface | Yes | `exports` |
| Service provider (implementation) | No | `requires`, `provides` |
| Service locator | Yes | `exports`, `requires`, `uses` |
| Consumer | No | `requires` |

#### All module directives

| Directive | Description |
|-----------|-------------|
| `exports package;` / `exports package to module;` | Makes a package available outside the module |
| `requires module;` / `requires transitive module;` | Specifies another module as a dependency |
| `opens package;` / `opens package to module;` | Allows the package to be used with reflection |
| `provides interfaceName with className;` | Registers an implementation of a service interface |
| `uses interfaceName;` | Declares that this module looks up a service at runtime |

---

## Discovering Modules

You do not need to memorize the output of the commands in this section. You do need
to know the syntax of the commands and what they do.

---

### Built-in modules

The JDK itself is modularized. The most important module to know is **`java.base`**.

- It contains most of the packages you have been using throughout the exam (collections,
  math, IO, NIO.2, concurrency, etc.).
- It is automatically available to every modular application -- you do not need a
  `requires java.base;` directive.
- You can write `requires java.base;` explicitly and it will compile, but it is redundant
  and should be omitted.

#### Common modules to know

| Module name | What it contains | Exam relevance |
|-------------|-----------------|----------------|
| `java.base` | Collections, math, IO, NIO.2, concurrency, etc. | Most of this book |
| `java.desktop` | AWT and Swing | Name only |
| `java.logging` | Logging | Name only |
| `java.sql` | JDBC | Chapter 15 |
| `java.xml` | XML | Name only |

#### Module naming conventions

- Modules beginning with **`java`** are standard APIs you are likely to use.
- Modules beginning with **`jdk`** are JDK-specific APIs (tools, internals, etc.).

For the exam, you need to be able to recognize module names from a list -- not recite
them from memory.

#### All `java.*` modules

| | | |
|---|---|---|
| `java.base` | `java.naming` | `java.smartcardio` |
| `java.compiler` | `java.net.http` | `java.sql` |
| `java.datatransfer` | `java.prefs` | `java.sql.rowset` |
| `java.desktop` | `java.rmi` | `java.transaction.xa` |
| `java.instrument` | `java.scripting` | `java.xml` |
| `java.logging` | `java.se` | `java.xml.crypto` |
| `java.management` | `java.security.jgss` | |
| `java.management.rmi` | `java.security.sasl` | |

#### All `jdk.*` modules

Review this list before the exam so the names sound familiar. You do not need to
memorize them.

| | | |
|---|---|---|
| `jdk.accessibility` | `jdk.javadoc` | `jdk.management.agent` |
| `jdk.attach` | `jdk.jcmd` | `jdk.management.jfr` |
| `jdk.charsets` | `jdk.jconsole` | `jdk.naming.dns` |
| `jdk.compiler` | `jdk.jdeps` | `jdk.naming.rmi` |
| `jdk.crypto.cryptoki` | `jdk.jdi` | `jdk.net` |
| `jdk.crypto.ec` | `jdk.jdwp.agent` | `jdk.nio.mapmode` |
| `jdk.dynalink` | `jdk.jfr` | `jdk.sctp` |
| `jdk.editpad` | `jdk.jlink` | `jdk.security.auth` |
| `jdk.hotspot.agent` | `jdk.jshell` | `jdk.security.jgss` |
| `jdk.httpserver` | `jdk.jsobject` | `jdk.xml.dom` |
| `jdk.incubator.foreign` | `jdk.jstatd` | `jdk.zipfs` |
| `jdk.incubator.vector` | `jdk.localedata` | |
| `jdk.jartool` | `jdk.management` | |

---


### Module discovery commands

The `java` command has three module-related options:

| Option | What it does |
|--------|-------------|
| `-d` / `--describe-module` | Describes a single module |
| `--list-modules` | Lists all available modules |
| `--show-module-resolution` | Shows module resolution logic at startup |

> It is possible to add modules, exports, and more at the command line using additional
> flags. Avoid doing this in practice -- it is confusing and hard to maintain.

---

#### `--describe-module` / `-d`: describing a module

Instead of opening a JAR and reading `module-info.java` manually, you can ask Java to
describe it:

```
java -p mods -d zoo.animal.feeding
java -p mods --describe-module zoo.animal.feeding
```

Both commands are equivalent. `-p mods` tells Java where to find the compiled modules.
Without it, Java would not know where to look for `zoo.animal.feeding` and the command
would fail. This is the same `-p` you use when running a module -- the describe operation
still needs to locate the module first. Example output:

```
zoo.animal.feeding file:///absolutePath/mods/zoo.animal.feeding.jar
exports zoo.animal.feeding
requires java.base mandated
```

- Line 1: the module name and its file path.
- Line 2: the package it exports.
- Line 3: `requires java.base mandated` -- even though `zoo.animal.feeding` has no
  explicit `requires`, `java.base` is automatically added to every module. The word
  `mandated` signals that this was added automatically, not by the developer.
  This is the module equivalent of `java.lang` being automatically imported in every
  class.

For the exam: know the syntax of the command, not how to interpret the output.

#### Output details for a more complex module

Given this `module-info.java` for `zoo.animal.care`:

```java
module zoo.animal.care {
    exports zoo.animal.care.medical to zoo.staff;
    requires transitive zoo.animal.feeding;
}
```

Running `java -p mods -d zoo.animal.care` produces:

```
zoo.animal.care file:///absolutePath/mods/zoo.animal.care.jar
requires zoo.animal.feeding transitive
requires java.base mandated
qualified exports zoo.animal.care.medical to zoo.staff
contains zoo.animal.care.details
```

- `requires ... transitive` -- the transitive modifier appears after the module name in
  the output (reversed from the declaration syntax).
- `qualified exports` -- indicates an export restricted to a specific module.
- `contains` -- a package that exists in the module but is not exported to anyone.

---

#### `--list-modules`: listing available modules

Lists all modules visible to Java:

```
java --list-modules
```

This lists all JDK modules with their version numbers:

```
java.base@17
java.compiler@17
java.datatransfer@17
...
```

With a custom module path:

```
java -p mods --list-modules
```

This lists both the JDK modules and any custom modules found in `mods/`. Custom modules show a file system path instead of a version number:

```
zoo.animal.care file:///absolutePath/mods/zoo.animal.care.jar
zoo.animal.feeding file:///absolutePath/mods/zoo.animal.feeding.jar
```

> `--list-modules` exits immediately after printing the list. It does not run the program.

---

#### `--show-module-resolution`: debugging module resolution

Prints the full module resolution process at startup, then runs the program:

```
java --show-module-resolution
    -p feeding
    -m zoo.animal.feeding/zoo.animal.feeding.Task
```

- `-p feeding` -- module path: look for compiled modules in the `feeding/` directory.
- `-m zoo.animal.feeding/zoo.animal.feeding.Task` -- run the class `zoo.animal.feeding.Task` found inside the `zoo.animal.feeding` module.

Output looks like:

```
root zoo.animal.feeding file:///absolutePath/feeding/
java.base binds java.desktop jrt:/java.desktop
java.base binds jdk.jartool jrt:/jdk.jartool
...
jdk.security.auth requires java.naming jrt:/java.naming
...
All fed!
```

It starts with the root module being run, lists all modules pulled in transitively, and
finally prints the program output. Useful for debugging missing module errors. You do
not need to understand the output for the exam.

---

#### `jar --describe-module` / `-d`: describing from a JAR

The `jar` command can also describe a module:

```
jar -f mods/zoo.animal.feeding.jar -d
jar --file mods/zoo.animal.feeding.jar --describe-module
```

The output is nearly identical to the `java` version, with one minor difference: the JAR
version includes `/!module-info.class` in the file path. This difference is not
exam-relevant.

What is exam-relevant: **both `java` and `jar` can describe a module.**

#### Options to memorize

| Command | Short form | Long form |
|---------|-----------|-----------|
| `java` -- describe module | `-d` | `--describe-module` |
| `java` -- list modules | n/a | `--list-modules` |
| `java` -- show resolution | n/a | `--show-module-resolution` |
| `jar` -- describe module | `-d` | `--describe-module` |
| `jar` -- file to operate on | `-f` | `--file` |

---


### `jdeps`: analyzing dependencies

`jdeps` looks at the actual bytecode of a JAR, not just the module declaration. It tells
you what dependencies are genuinely used in the code, which is useful when migrating
a non-modular JAR to the module system.

You are not expected to memorize all its options -- just understand what it does and
how to use it for the basic cases.

#### Example: analyzing a non-modular JAR

```java
// Animatronic.java
package zoo.dinos;

import java.time.*;
import java.util.*;
import sun.misc.Unsafe;

public class Animatronic {
    private List<String> names;
    private LocalDate visitDate;

    public Animatronic(List<String> names, LocalDate visitDate) {
        this.names = names;
        this.visitDate = visitDate;
    }

    public void unsafeMethod() {
        Unsafe unsafe = Unsafe.getUnsafe();
    }
}
```

This class has no `module-info.java` -- it is not yet a module. The goal is to find out
what modules it would need to `requires` if it were modularized.

Compile and package without a module declaration:

```
javac zoo/dinos/*.java
jar -cvf zoo.dino.jar .
```

The compiler will warn about `sun.misc.Unsafe` being an internal API. That is expected
and discussed below.

#### Running `jdeps`

Basic run with no options:

```
jdeps zoo.dino.jar
```

Output:

```
zoo.dino.jar -> java.base
zoo.dino.jar -> jdk.unsupported
   zoo.dinos -> java.lang        java.base
   zoo.dinos -> java.time        java.base
   zoo.dinos -> java.util        java.base
   zoo.dinos -> sun.misc         JDK internal API (jdk.unsupported)
```

- The first two lines list the modules this JAR depends on -- these are what you would
  need to add as `requires` directives in a future `module-info.java`.
- The table below shows which packages are used and which module each comes from.
- `java.base` is always included automatically.
- `jdk.unsupported` is a real, shipping module in the JDK -- the name does not mean it
  is broken or missing. It means the APIs inside it (like `sun.misc.Unsafe`) are
  officially unsupported by Oracle: internal implementation details that were never
  part of the public Java API and may be removed in a future version. Treat a
  dependency on `jdk.unsupported` as a warning that the code should be updated.

#### Summary mode

For large projects with many packages, summary mode shows only the top-level module
dependencies:

```
jdeps -s zoo.dino.jar
jdeps --summary zoo.dino.jar
```

Output:

```
zoo.dino.jar -> java.base
zoo.dino.jar -> jdk.unsupported
```

Summary mode is useful for quickly identifying which modules you need, without the
per-package noise.

#### `--module-path` option

If your JAR depends on custom modules outside the JDK, use `--module-path` to tell
`jdeps` where to find them:

```
jdeps --module-path mods zoo.dino.jar
```

> Unlike most other module commands, `--module-path` has no short form on `jdeps`.
> `-p` does not work here.

---

#### `--jdk-internals`: identifying internal API usage

```
jdeps --jdk-internals zoo.dino.jar
```

Output:

```
zoo.dino.jar -> jdk.unsupported
   zoo.dinos.Animatronic -> sun.misc.Unsafe  JDK internal API (jdk.unsupported)

Warning: <omitted warning>

JDK Internal API          Suggested Replacement
sun.misc.Unsafe           See http://openjdk.java.net/jeps/260
```

- Lists every class in your JAR that calls an internal API, and which API it calls.
- Provides a suggestion for what to replace it with.

`-jdkinternals` is equivalent to `--jdk-internals`.

#### Why this matters in practice

Before JPMS, a class had to be `public` to be used outside its package. `sun.misc.Unsafe`
was public because the JDK itself needed it across packages -- Sun even named it
`Unsafe` hoping that would deter external use. It didn't work. Many widely used
open-source libraries started depending on it.

You are unlikely to use `Unsafe` directly in your own code, but you probably use a
library that does. When Oracle eventually blocks access to it, those libraries will break.

`jdeps --jdk-internals` lets you scan your JARs and their dependencies now to find
any such usage before it becomes a runtime problem. If you find one, check whether a
newer version of the library has already removed the dependency.

---


### `jmod`: working with JMOD files

JMOD files are not the same as module JAR files. Oracle recommends using JAR files
for almost all modules. JMOD files are only needed when a module contains native
libraries or something else that cannot go inside a JAR. This is unlikely to come up in
practice.

Native libraries are platform-specific binary files -- `.dll` on Windows, `.so` on Linux,
`.dylib` on macOS. A JAR can only contain Java bytecode and resources; it cannot
package these binaries in a way the JVM can load them via `System.loadLibrary()`.
For example, a module that wraps a C library for hardware access (a camera driver, a
GPU computation library, a cryptographic hardware device) needs to bundle that binary
alongside the Java classes. JMOD was designed for exactly this case.

You do not need to memorize the syntax of `jmod` for the exam -- just know that it
exists and what its modes do.

| Mode | Description |
|------|-------------|
| `create` | Creates a JMOD file |
| `extract` | Extracts all files from a JMOD (like unzipping) |
| `describe` | Prints module details such as `requires` |
| `list` | Lists all files in the JMOD file |
| `hash` | Prints or records hashes |

---

### `jlink`: creating a custom runtime image

One of the practical benefits of modules is the ability to ship only the parts of Java
your application actually needs, rather than the full JDK (which is over 150 MB).
`jlink` builds a minimal Java runtime containing only the specified modules and their
dependencies.

```
jlink --module-path mods --add-modules zoo.animal.talks --output zooApp
```

| Part | Meaning |
|------|---------|
| `--module-path mods` | Where to find custom modules (also `-p`) |
| `--add-modules zoo.animal.talks` | The module(s) to include; dependencies are pulled in automatically |
| `--output zooApp` | Name of the output directory containing the custom runtime |

The output directory contains the same structure as a full JDK (`bin`, `conf`, `lib`,
etc.) but only with what is needed. In the zoo example, the resulting zipped image is
around 15 MB compared to 150+ MB for the full JDK. The savings come from excluding
unneeded JDK modules and development tools like `javac`, which are not needed at
runtime.

---

## Command-Line Reference

### Operations summary

| Description | Syntax |
|-------------|--------|
| Compile nonmodular code | `javac -cp classpath -d directory classesToCompile` |
| | `javac --class-path classpath -d directory classesToCompile` |
| | `javac -classpath classpath -d directory classesToCompile` |
| Run nonmodular code | `java -cp classpath package.className` |
| | `java -classpath classpath package.className` |
| | `java --class-path classpath package.className` |
| Compile module | `javac -p moduleFolderName -d directory classesToCompileIncludingModuleInfo` |
| | `javac --module-path moduleFolderName -d directory classesToCompileIncludingModuleInfo` |
| Run module | `java -p moduleFolderName -m moduleName/package.className` |
| | `java --module-path moduleFolderName --module moduleName/package.className` |
| Describe module | `java -p moduleFolderName -d moduleName` |
| | `java --module-path moduleFolderName --describe-module moduleName` |
| | `jar --file jarName --describe-module` |
| | `jar -f jarName -d` |
| List available modules | `java --list-modules` |
| | `java -p moduleFolderName --list-modules` |
| | `java --module-path moduleFolderName --list-modules` |
| View dependencies | `jdeps -s --module-path moduleFolderName jarName` |
| | `jdeps --summary --module-path moduleFolderName jarName` |
| | `jdeps --jdk-internals jarName` |
| | `jdeps -jdkinternals jarName` |
| Show module resolution | `java --show-module-resolution -p moduleFolderName -m moduleName` |
| | `java --show-module-resolution --module-path moduleFolderName --module moduleName` |
| Create runtime image | `jlink -p moduleFolderName --add-modules moduleName --output zooApp` |
| | `jlink --module-path moduleFolderName --add-modules moduleName --output zooApp` |

---

### `javac` options

| Option | Description |
|--------|-------------|
| `-cp <classpath>` / `-classpath <classpath>` / `--class-path <classpath>` | Location of JARs in a nonmodular program |
| `-d <dir>` | Directory in which to place generated `.class` files |
| `-p <path>` / `--module-path <path>` | Location of JARs in a modular program |

### `java` options

| Option | Description |
|--------|-------------|
| `-p <path>` / `--module-path <path>` | Location of JARs in a modular program |
| `-m <name>` / `--module <name>` | Module name to run |
| `-d` / `--describe-module` | Describes details of a module |
| `--list-modules` | Lists observable modules without running the program |
| `--show-module-resolution` | Shows module resolution when running the program |

### `jar` options

| Option | Description |
|--------|-------------|
| `-c` / `--create` | Creates a new JAR file |
| `-v` / `--verbose` | Prints details when working with JAR files |
| `-f` / `--file` | JAR filename |
| `-C` | Directory containing files to be used to create the JAR |
| `-d` / `--describe-module` | Describes details of a module |

### `jdeps` options

| Option | Description |
|--------|-------------|
| `--module-path <path>` | Location of JARs in a modular program (no short form) |
| `-s` / `--summary` | Summarizes output |
| `--jdk-internals` / `-jdkinternals` | Lists uses of internal JDK APIs |

### `jlink` options

| Option | Description |
|--------|-------------|
| `-p <path>` / `--module-path <path>` | Location of JARs in a modular program |
| `--add-modules` | List of modules to package into the runtime image |
| `--output` | Name of the output directory |

---

## Comparing Types of Modules

There are three types of modules: named, automatic, and unnamed.

---

### Classpath vs. module path -- a quick refresher

When you run a Java program, the JVM needs to know where to find compiled classes
and JARs. You tell it by specifying a path.

The **classpath** (`-cp` / `--class-path`) is the original mechanism, used since the
beginning of Java. It is a list of directories and JAR files the JVM searches when
looking for a class. If a class is "on the classpath", it means the JAR or directory
containing it was passed via `-cp`. Everything is visible to everything else -- there is
no access control between JARs.

```
java -cp libs/spring.jar:libs/jackson.jar com.example.Main
```

The **module path** (`-p` / `--module-path`) is the modular equivalent introduced in
Java 9. It is also a list of directories and JARs, but the JVM treats each entry as a
module rather than a flat bag of classes. Access between modules is controlled by
`exports`, `requires`, and `opens` declarations. If a JAR is "on the module path", it
means it was passed via `-p` and the module system applies to it.

```
java -p mods -m zoo.animal.feeding/zoo.animal.feeding.Task
```

The same JAR file can behave differently depending on which path you put it on:
- On the **classpath**: treated as legacy code, no module rules apply.
- On the **module path**: treated as a module, module rules apply.

This distinction is exactly what determines whether a JAR is a named, automatic, or
unnamed module -- it is about which path you place it on, not just what files it contains.

---

### Named modules

A named module contains a `module-info.java` file at the root of the JAR. It lives on
the **module path**. Everything covered in this chapter so far has been a named module.

If a JAR contains a `module-info.java` file but is placed on the **classpath**, it is not
considered a named module -- the file is ignored and the JAR is treated as an unnamed
module.

Memory aid: a named module has its name explicitly declared inside `module-info.java`
and lives on the module path.

> From Chapter 7: the only way for subclasses of a sealed class to be in a different
> package is to be within the same named module.

---

### Automatic modules

An automatic module is a regular JAR (no `module-info.java`) placed on the
**module path**. Java treats it as a module automatically:

- All its packages are automatically exported.
- It can read all other modules on the module path.
- Java determines its module name automatically.

#### How the module name is determined

Every JAR has a `META-INF/MANIFEST.MF` file. If the JAR author added an
`Automatic-Module-Name` property to that file, Java uses that name directly.

![[Pasted image 20261111214528.png]]

```
Manifest-Version: 1.0
Created-By: 17 (Oracle Corporation)
Automatic-Module-Name: holiday.calendar
```

This was introduced so library authors could "reserve" their future module name before
fully modularizing their library. If present, always use this name.

If no `Automatic-Module-Name` is specified, Java derives the name from the JAR
filename using this algorithm:

1. Remove the `.jar` extension.
2. Remove the version suffix from the end (e.g. `-1.0.0`, `-1.0-RC`).
3. Replace any character that is not a letter or digit with a dot (`.`).
4. Replace any sequence of multiple dots with a single dot.
5. Remove any leading or trailing dots.

#### Worked examples

| Step | Example 1 | Example 2 |
|------|-----------|-----------|
| Starting JAR name | `commons2-x-1.0.0-SNAPSHOT.jar` | `mod_$-1.0.jar` |
| Remove extension | `commons2-x-1.0.0-SNAPSHOT` | `mod_$-1.0` |
| Remove version | `commons2-x` | `mod_$` |
| Replace special characters | `commons2.x` | `mod..` |
| Replace sequences of dots | `commons2.x` | `mod.` |
| Remove leading/trailing dots | `commons2.x` | `mod` |

The algorithm does its best but cannot always produce a good name. Unusual filenames
like `1.2.0-calendar-1.2.2-good-1.jar` are out of scope for the exam.

---

### Unnamed modules

An unnamed module is any regular JAR placed on the **classpath**. It has nothing to do
with whether the JAR has a `module-info.java` file or not -- what makes it unnamed is
simply that it is on the classpath, not the module path.

Before Java 9 and JPMS, all Java code ran on the classpath and there were no modules.
When modules were introduced, the JDK team needed old non-modular code to keep
working without being rewritten. The solution was to treat all classpath JARs as a single
special blob called the unnamed module. Think of it as "the place where all the old
pre-modules code lives."

The following four rules are always true simultaneously for any unnamed module -- they
are not alternatives:

**1. `module-info.java` is ignored.**
If a JAR on the classpath happens to contain a `module-info.java` file, Java ignores it
completely. The JAR is still treated as classpath code, not a module.

**2. It exports nothing to named or automatic modules.**
Named modules can only import packages that are explicitly declared with `exports` in
a `module-info.java`. Since unnamed modules have no `module-info.java` (or it is
ignored), they never declare any exports. This means named modules cannot reference
any code from classpath JARs. You cannot write `requires someClasspathJar;` in a
`module-info.java` -- the module system does not recognize classpath code as something
you can depend on.

**3. It can read from any JAR on the classpath or module path.**
Classpath code can still use classes from named modules (like `java.util.ArrayList`
from `java.base`). This was necessary to allow old code to keep compiling and running
after Java 9 without modification. It can also read other classpath JARs the same way
it always did.

**4. It is not readable by code on the module path.**
Named and automatic modules cannot see into the classpath. This is intentional -- if
they could, the whole point of explicit dependency declarations would be undermined.

The one-way rule to remember: **classpath code can see modules, but modules cannot
see classpath code.**

The name "unnamed" comes from the fact that all classpath JARs are lumped together
into a single anonymous blob with no module name. There is no name you can write in
a `requires` directive to reference it.

---

### Comparison table

| Property | Named | Automatic | Unnamed |
|----------|-------|-----------|---------|
| Contains `module-info.java`? | Yes | No | Ignored if present |
| Packages exported to other modules? | Those declared in `module-info.java` | All packages | None |
| Readable by code on the module path? | Yes | Yes | No |
| Readable by JARs on the classpath? | Yes | Yes | Yes |

Key rule: **code on the classpath can access the module path, but code on the module
path cannot read from the classpath.**

---


## Migrating an Application

You do not have to convert an existing application to modules to use Java 17 features
(except for the module-specific features in this chapter). Migration should be a
deliberate decision, not an assumption.

The exam covers migration scenarios in a simplified setting -- no complex open-source
dependencies, small applications. Real-world migration is significantly harder.

---

### Determining the order

Before migrating, map out the dependency graph of the existing JARs. The arrows in
the diagram point from the project that depends on another to the project it depends on
(from `requires` to the thing being required).

![[Pasted image 20261112151403.png]]
 Figure : dependency graph of three JARs showing top and bottom


Projects with no dependencies are at the **bottom**. Projects that depend on others are
at the **top**. This top/bottom terminology is what "top-down" and "bottom-up" refer to.

The dependency graph does not always produce a unique order. If two projects have no
dependency between them, either can be migrated first.

![[Pasted image 20261112151714.png]]
Figure: dependency graph where order is not unique

---

### Bottom-up migration

Best used when you have control over all JARs in the application and can modularize
any of them.

Steps:

1. Pick the lowest-level project that has not yet been migrated (one with no
   dependencies on other unmigrated projects).
2. Add a `module-info.java` file. Add `exports` for any package used by higher-level
   JARs. Add `requires` for any modules this one depends on.
3. Move this newly named module from the **classpath** to the **module path**.
4. Leave all unmigrated projects as unnamed modules on the classpath.
5. Repeat from the bottom up until all projects are migrated.

![[Pasted image 20261112151955.png|612]]
Figure: bottom-up migration, one project at a time from bottom to top

During migration you have a mix of named modules (module path) and unnamed modules
(classpath):
- Named modules are on the module path and **cannot** access unnamed modules.
- Unnamed modules are on the classpath and **can** access both the classpath and the
  module path.

---

### Top-down migration

Best used when you do not have control over all JARs -- for example, when a
lower-level project belongs to another team that is not ready to modularize.

Steps:

1. Place **all** projects on the module path. They all become automatic modules
   initially.
2. Pick the highest-level project that has not yet been migrated.
3. Add a `module-info.java` to convert it from an automatic module into a named
   module. Add `exports` and `requires` as needed. You can use the automatic module
   names of other modules in your `requires` directives since they haven't been
   formally named yet.
4. Repeat from the top down until all projects are migrated.

![[Pasted image 20261112152249.png|584]]
Figure: top-down migration, one project at a time from top to bottom

During migration you have a mix of named modules and automatic modules -- everything
is on the module path:
- Named modules have been fully migrated.
- Automatic modules are the lower-level ones not yet migrated. Named modules can
  access them because automatic modules are on the module path and export everything.

---

### Comparison table

| Category                                  | Bottom-Up                   | Top-Down                        |
| ----------------------------------------- | --------------------------- | ------------------------------- |
| Project that depends on all others (top)  | Unnamed module on classpath | Named module on module path     |
| Project that has no dependencies (bottom) | Named module on module path | Automatic module on module path |

This table describes where each project ends up **during** migration -- not at the end
when everything is done, but in the middle when some projects are migrated and others
are not.

**Bottom-up** -- you migrate from the bottom first:
- The bottom projects (no dependencies) get migrated first, so they become proper
  named modules on the module path.
- The top projects haven't been migrated yet, so they stay as unnamed modules on the
  classpath while you work your way up.

**Top-down** -- you migrate from the top first:
- The top projects get migrated first, so they become proper named modules on the
  module path.
- The bottom projects haven't been migrated yet, but everything was moved to the
  module path at the start. Since they have no `module-info.java`, they become
  automatic modules on the module path.

The critical difference is in the bottom row: in bottom-up, unmigrated bottom projects
stay as **unnamed modules on the classpath**. In top-down, everything was moved to
the module path upfront, so unmigrated bottom projects become **automatic modules on
the module path** instead.

---


### Splitting a big project into modules

The process is the same regardless of project size. Steps:

1. Break the existing packages into logical groupings.
2. Draw the dependencies between those groups.
3. Each group becomes a module. Packages that are closely related and have no reason
   to be separated can share a module.

![[Pasted image 20261112153302.png|582]]
Figure: first attempt at decomposition -- seven packages mapped to fewer modules

---

### Cyclic dependencies

JPMS does not allow **cyclic dependencies** between modules. A cyclic dependency
is when two modules directly or indirectly depend on each other.

If `zoo.tickets.delivery` requires `zoo.tickets.discount`, then
`zoo.tickets.discount` is not allowed to require `zoo.tickets.delivery`. This applies
to indirect cycles too -- if A requires B and B requires C, then C cannot require A.

#### Breaking a cycle with a shared module

The standard solution is to extract the shared code into a third module that both
original modules can depend on. Neither of the original modules needs to depend on
the other anymore.

![[Pasted image 20261112154208.png|642]]
Figure: cyclic dependency removed by introducing zoo.tickets.etech as a shared module

The new module (`zoo.tickets.etech` in the example) contains the code that both
sides needed from each other. Each original module now requires the new shared
module instead of each other.

---

### Cyclic dependencies cause a compile error

Java enforces the no-cycles rule at compile time. Neither module in a cycle can be
compiled:

```java
// zoo.butterfly module
package zoo.butterfly;
public class Butterfly {
    private Caterpillar caterpillar;
}
```

```java
module zoo.butterfly {
    exports zoo.butterfly;
    requires zoo.caterpillar;
}
```

```java
// zoo.caterpillar module
package zoo.caterpillar;
public class Caterpillar {
    Butterfly emergeCocoon() {
        // logic omitted
    }
}
```

```java
module zoo.caterpillar {
    exports zoo.caterpillar;
    requires zoo.butterfly;
}
```

`zoo.butterfly` cannot be compiled without `zoo.caterpillar` being available first.
But `zoo.caterpillar` cannot be compiled without `zoo.butterfly`. Neither can go
first -- the compiler rejects both. This is the cyclic dependency problem made
concrete.

This is one of the advantages of JPMS: it prevents you from accidentally writing code
with circular dependencies. The problem is caught at compile time, not at runtime.

#### Three-module cycles are also forbidden

If `ballA` requires `ballB` and `ballB` requires `ballC`, then `ballC` cannot require
`ballA`. Following the arrows forms a closed loop, which is a cycle regardless of how
many modules are involved.

> Java allows cyclic dependencies between **packages within a single module**. The
> no-cycles rule applies only between **modules**, not between packages inside the
> same module.

---
