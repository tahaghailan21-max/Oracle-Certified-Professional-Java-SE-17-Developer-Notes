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
