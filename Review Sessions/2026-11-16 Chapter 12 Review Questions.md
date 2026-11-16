# Chapter 12 - Modules: Review Questions
Date: 2026-11-16
Score: 19 / 25 (76%)

---

## Results

| Q  | Your Answer | Correct Answer | Result  |
|----|-------------|----------------|---------|
| 1  | E           | E              | correct |
| 2  | B           | B              | correct |
| 3  | G           | G              | correct |
| 4  | D           | D              | correct |
| 5  | E, F        | E, F           | correct |
| 6  | A, F        | A, F           | correct |
| 7  | E           | A, B, E        | wrong   |
| 8  | A, D        | A, D           | correct |
| 9  | F           | F              | correct |
| 10 | B, C        | B, C           | correct |
| 11 | B, E        | D, G, H        | wrong   |
| 12 | A, B, C, E, F | A, B, C, F   | wrong   |
| 13 | B           | D              | wrong   |
| 14 | G           | C              | wrong   |
| 15 | B           | B              | correct |
| 16 | A           | A              | correct |
| 17 | E           | E              | correct |
| 18 | D           | D              | correct |
| 19 | E           | E              | correct |
| 20 | A           | A              | correct |
| 21 | H           | H              | correct |
| 22 | A, E        | A, F           | wrong   |
| 23 | E           | E              | correct |
| 24 | A           | A              | correct |
| 25 | A, C, D     | A, C, D        | correct |

---

## All Questions and Reasoning

### Q1 | Which statement is true of the following module?

```
|--- zoo
     |-- staff
          |-- Vet.java
```

A. The directory structure shown is a valid module.
B. The directory structure would be a valid module if module.java were added directly underneath zoo/staff.
C. The directory structure would be a valid module if module.java were added directly underneath zoo.
D. The directory structure would be a valid module if module-info.java were added directly underneath zoo/staff.
E. The directory structure would be a valid module if module-info.java were added directly underneath zoo.
F. None of these changes would make this directory structure a valid module.

Your reasoning: the file name should be module-info.java and it should be in the root.
Your answer: E
Correct answer: **E**

Correct. A module requires a `module-info.java` file at the root directory of the module. The root here is `zoo/`, so option E is right. Options B and C are wrong because `module.java` is not a valid name. Option D places `module-info.java` inside a package subdirectory rather than the module root.

---

### Q2 | Fill in the blank so that code in module dog can access the animal.behavior package in module animal.

```
module animal {
    _______ animal.behavior;
}
```

A. export
B. exports
C. require
D. requires
E. require transitive
F. requires transitive
G. None of the above

Your reasoning: the keyword is exports.
Your answer: B
Correct answer: **B**

Correct. The directive to make a package available to other modules is `exports` (with an `s`). `export` without the `s` does not exist. `requires` and `requires transitive` are for declaring dependencies, not for exposing packages.

---

### Q3 | Fill in the blanks so this command to run the program is correct:

```
java
    ___ zoo.animal.talks/zoo/animal/talks/Peacocks
    ___ modules
```

A. -d and -m
B. -d and -p
C. -m and -d
D. -m and -p
E. -p and -d
F. -p and -m
G. None of the above

Your reasoning: Java is used to run classes but no correct class is specified here. The class name should use dots not slashes, so the command is wrong regardless of which options are used.
Your answer: G
Correct answer: **G**

Correct. The `-m` / `--module` option requires the format `moduleName/fully.qualified.ClassName` using dots for the class name. The command uses slashes (`zoo/animal/talks/Peacocks`) instead of dots, which is not the correct format for a class name. Option D would have been correct if the class name were written properly as `zoo.animal.talks.Peacocks`.

---

### Q4 | Which of the following pairs make up a service?

A. Consumer and service locator
B. Consumer and service provider interface
C. Service locator and service provider
D. Service locator and service provider interface
E. Service provider and service provider interface

Your reasoning: the service is composed of the interface and the service locator.
Your answer: D
Correct answer: **D**

Correct. A service is made up of the service provider interface (which defines the contract) and the service locator (which finds implementations at runtime). The service provider is the implementation and is explicitly not considered part of the service. The consumer uses the service but is not part of it.

---

### Q5 | A(n) _______________ module is on the classpath while a(n) ____________ module is on the module path. (Choose all that apply.)

A. automatic, named
B. automatic, unnamed
C. named, automatic
D. named, unnamed
E. unnamed, automatic
F. unnamed, named

Your reasoning: only unnamed modules are on the classpath.
Your answer: E, F
Correct answer: **E, F**

Correct. Unnamed modules are on the classpath. Both named and automatic modules are on the module path. E covers "unnamed on classpath, automatic on module path" and F covers "unnamed on classpath, named on module path."

---

### Q6 | Which of the following statements are true in a module-info.java file? (Choose all that apply.)

A. The opens directive allows the use of reflection.
B. The opens directive declares that an API is called.
C. The use directive allows the use of reflection.
D. The use directive declares that an API is called.
E. The uses directive allows the use of reflection.
F. The uses directive declares that an API is called.

Your reasoning: `opens` allows reflection on a package. `uses` declares that this module will call `ServiceLoader` at runtime.
Your answer: A, F
Correct answer: **A, F**

Correct. Options C and D are wrong because `use` (without an `s`) is not a valid directive. `opens` is for granting reflective access (A). `uses` declares that the module consumes a service -- it tells the module system this module will call `ServiceLoader.load()` for that interface (F). Calling it "declaring that an API is called" is the book's way of describing service consumption.

---

### Q7 | Which of the following JAR filenames and generated automatic module name pairs are correct? (Choose all that apply.)

A. emily-1.0.0.jar and emily
B. emily-1.0.0-SNAPSHOT.jar and emily
C. emily_the_cat-1.0.0.jar and emily_the_cat
D. emily_the_cat-1.0.0.jar and emily-the-cat
E. emily.$.jar and emily
F. emily.$.jar and emily.
G. emily.$.jar and emily..

Your reasoning: only E looked right.
Your answer: E
Correct answer: **A, B, E**

> WRONG ANSWER

You got E right but missed A and B. All three follow the same algorithm: remove the extension, strip the version, replace special characters with dots, collapse adjacent dots, trim leading/trailing dots. Working through A and B:

- `emily-1.0.0.jar` -> remove extension -> `emily-1.0.0` -> remove version (`-1.0.0`) -> `emily` -> no special characters -> `emily`. Correct.
- `emily-1.0.0-SNAPSHOT.jar` -> remove extension -> `emily-1.0.0-SNAPSHOT` -> remove version (`-1.0.0-SNAPSHOT`) -> `emily` -> `emily`. Correct.

The version suffix includes not just digits and dots but also extra text like `-SNAPSHOT` or `-RC`. Both result in `emily` after stripping. For C and D: underscores are special characters and get replaced with dots, giving `emily.the.cat`, not `emily_the_cat` or `emily-the-cat`. For E: `emily.$.jar` -> remove `.jar` -> `emily.$` -> no version -> replace `$` with `.` -> `emily..` -> collapse adjacent dots -> `emily.` -> remove trailing dot -> `emily`. Correct.

---

### Q8 | Which of the following statements are true? (Choose all that apply.)

A. Modules with cyclic dependencies will not compile.
B. Packages with a cyclic dependency will not compile.
C. A cyclic dependency always involves exactly two modules.
D. A cyclic dependency always involves at least two requires statements.
E. An unnamed module can be involved in a cyclic dependency with an automatic module.

Your reasoning: cyclic dependencies between modules prevent compilation. Packages can have cyclic dependencies -- that is allowed. Cycles can involve more than two modules.
Your answer: A, D
Correct answer: **A, D**

Correct. A is correct because JPMS enforces the no-cycles rule at compile time. B is wrong because Java allows cyclic dependencies between packages within a module. C is wrong because a cycle can involve three or more modules (A requires B, B requires C, C requires A). D is correct because a cycle requires at least two `requires` statements forming a loop. E is wrong because unnamed modules cannot be referenced from an automatic module -- you cannot write `requires` pointing to an unnamed module, so they cannot participate in a declared cycle.

---

### Q9 | Which line of code needs to be in your module-info.java for a service provider?

```java
package dragon;
import magic.*;
public class Dragon implements Magic {
    public String getPower() { return "breathe fire"; }
}
```

A. provides dragon.Dragon by magic.Magic;
B. provides dragon.Dragon using magic.Magic;
C. provides dragon.Dragon with magic.Magic;
D. provides magic.Magic by dragon.Dragon;
E. provides magic.Magic using dragon.Dragon;
F. provides magic.Magic with dragon.Dragon;

Your reasoning: the syntax is `provides <interface> with <implementation>`.
Your answer: F
Correct answer: **F**

Correct. The `provides` directive takes the interface name first and the implementing class second, joined by `with`. `Magic` is the interface (from the `magic` package) and `Dragon` is the implementation. Only F has the correct order and correct keyword.

---

### Q10 | What is true of a module containing a file named module-info.java with the following contents? (Choose all that apply.)

```java
module com.food.supplier {}
```

A. All packages inside the module are automatically exported.
B. No packages inside the module are automatically exported.
C. A main method inside the module can be run.
D. A main method inside the module cannot be run since the class is not exposed.
E. The module-info.java file contains a compiler error.
F. The module-info.java filename is incorrect.

Your reasoning: the syntax is valid, no package is exported, and the main method can be run from inside.
Your answer: B, C
Correct answer: **B, C**

Correct. An empty module declaration is valid -- no compiler error, correct filename. Without any `exports` directives, no packages are exported (B). Exporting is required for other modules to use the packages, but it is not required to run a `main()` method from the command line. The JVM can run the class directly without it being exported (C).

---

### Q11 | Which lines allow module puppy to access the animal.behavior package in module animal? (Choose all that apply.)

```
module animal {
    exports animal.behavior;
}
module dog {
    _______ animal; // line S
}
module puppy {
    _______ dog; // line T
}
```

A. require on line S
B. require on line T
C. requires on line S
D. requires on line T
E. require transitive on line S
F. require transitive on line T
G. requires transitive on line S
H. requires transitive on line T

Your reasoning: (not fully stated)
Your answer: B, E
Correct answer: **D, G, H**

> WRONG ANSWER

Several things went wrong here. First, `require` and `require transitive` (without the `s`) do not exist as valid directives. Options A, B, E, and F are all invalid syntax -- that eliminates them immediately.

Second, you need to understand what `requires transitive` does. For `puppy` to access `animal.behavior`, either:

1. `dog` uses `requires transitive animal` (line S = G) so that `puppy` automatically inherits the dependency on `animal` just by requiring `dog`. Then `puppy` only needs `requires dog` (line T = D).
2. OR `puppy` could also explicitly use `requires transitive animal` on line T (H), which also works because `requires transitive` does everything `requires` does and more.

So D works because `puppy requires dog` is enough when `dog` has `requires transitive animal`. G is needed on line S to make that transitive chain work. H also works on its own for line T because `requires transitive` is a superset of `requires`.

The key mistake: `require` without an `s` is not a valid Java keyword in module declarations.

---

### Q12 | Which of the following modules are provided by the JDK? (Choose all that apply.)

A. java.base
B. java.desktop
C. java.logging
D. java.util
E. jdk.base
F. jdk.compiler
G. jdk.xerces

Your reasoning: pure memorization question.
Your answer: A, B, C, E, F
Correct answer: **A, B, C, F**

> WRONG ANSWER

You included E (`jdk.base`) which does not exist. The base module is called `java.base`, not `jdk.base`. The `jdk.*` prefix is for JDK-specific tool modules -- the foundational runtime module always uses the `java.*` prefix. D is wrong because `java.util` is a package name, not a module name. G is wrong because `jdk.xerces` was made up.

---

### Q13 | Which of the following compiles and is equivalent to this loop?

```java
List<Unicorn> all = new ArrayList<>();
for (Unicorn current : ServiceLoader.load(Unicorn.class))
    all.add(current);
```

A. `ServiceLoader.load(Unicorn.class).getStream().collect(...)`
B. `ServiceLoader.load(Unicorn.class).stream().collect(...)`
C. `ServiceLoader.load(Unicorn.class).getStream().map(Provider::get).collect(...)`
D. `ServiceLoader.load(Unicorn.class).stream().map(Provider::get).collect(...)`
E. None of the above

Your reasoning: `getStream()` doesn't exist. Using `stream()` directly without `Provider::get` should work.
Your answer: B
Correct answer: **D**

> WRONG ANSWER

The for-each loop iterates over `ServiceLoader` as an `Iterable`, which gives you `Unicorn` objects directly. This is the key point: when you use the `stream()` method on `ServiceLoader`, it returns `Stream<Provider<Unicorn>>`, not `Stream<Unicorn>`. Each element is a `Provider` wrapper, not the service itself. You must call `.map(Provider::get)` to unwrap each provider into a `Unicorn` before collecting.

Option B fails to compile because you cannot collect a `Stream<Provider<Unicorn>>` into a `List<Unicorn>` without the `.map(Provider::get)` step -- the types don't match. Option D is correct: `stream()` (not `getStream()`) followed by `.map(Provider::get)` to unwrap, then collect.

This is exactly why the notes explain the `Provider` wrapper in detail -- the for-each loop hides this by using `Iterable<S>` directly, but `stream()` exposes the `Provider` layer.

---

### Q14 | Which of the following are legal commands to run a modular program where n is the module name and c is the fully qualified class name? (Choose all that apply.)

A. `java --module-path x -m n.c`
B. `java --module-path x -p n.c`
C. `java --module-path x-x -m n/c`
D. `java --module-path x -p n/c`
E. `java --module-path x-x -m n-c`
F. `java --module-path x -p n-c`
G. None of the above

Your reasoning: `--module-path` shows where to find module artifacts and `-m` indicates the module using `n/c` syntax.
Your answer: G
Correct answer: **C**

> WRONG ANSWER

You were right that `-m` takes `moduleName/className` format and that `--module-path` specifies the directory. The issue is you ruled out C without noticing that `x-x` is a perfectly valid folder name for the module path -- dashes are allowed in directory names. The module path is just a file system path; it doesn't have to follow Java naming rules.

Options B, D, F are wrong because `-p` is a synonym for `--module-path`, so using both `--module-path` and `-p` in the same command is specifying the same option twice. Options A and E are wrong because the module name and class name must be separated by `/`, not `.` or `-`. C is correct: `--module-path x-x` is a valid folder name, and `-m n/c` is the correct syntax.

---

### Q15 | For a top-down migration, all modules other than named modules are _____________ modules and are on the ____________.

A. automatic, classpath
B. automatic, module path
C. unnamed, classpath
D. unnamed, module path
E. None of the above

Your reasoning: in top-down migration everything is moved to the module path first. Unmigrated modules become automatic modules.
Your answer: B
Correct answer: **B**

Correct. Top-down migration moves all JARs to the module path at the start. The highest-level ones get `module-info.java` added first (becoming named modules). The remaining ones have no `module-info.java` and are on the module path, which makes them automatic modules.

---

### Q16 | If you add a second service provider module, how many of the existing modules do you need to recompile?

A. Zero
B. One
C. Two
D. Three
E. Four

Your reasoning: the new module needs to be compiled but none of the existing modules need recompiling.
Your answer: A
Correct answer: **A**

Correct. This is the key benefit of the service pattern and loose coupling. The service locator discovers providers dynamically at runtime by scanning the module path. Adding a new provider JAR requires no changes to any existing module -- the service locator finds it automatically.

---

### Q17 | Suppose we have a JAR file named cat-1.2.3-RC1.jar, and Automatic-Module-Name in the MANIFEST.MF is set to dog. What should an unnamed module referencing this automatic module include in module-info.java?

A. requires cat;
B. requires cat.RC;
C. requires cat-RC;
D. requires dog;
E. None of the above

Your reasoning: an unnamed module doesn't have a module-info.java.
Your answer: E
Correct answer: **E**

Correct. This was a trick question. An unnamed module lives on the classpath and does not use a `module-info.java` file at all. It simply treats the automatic module as a regular JAR on the classpath without any module declaration. If this were a named or automatic module needing to reference the automatic module, it would use `requires dog;` (the value of `Automatic-Module-Name`), but that is not what was asked.

---

### Q18 | Which commands are used to create a smaller Java image and work with native code, respectively?

A. jimage and jlink
B. jimage and jmod
C. jlink and jimage
D. jlink and jmod
E. jmod and jimage
F. jmod and jmod

Your reasoning: `jlink` creates a smaller runtime image and `jmod` is for working with native code.
Your answer: D
Correct answer: **D**

Correct. `jlink` builds a custom minimal Java runtime containing only the modules you need. `jmod` is the tool for working with JMOD files, which are used when native libraries need to be bundled with a module.

---

### Q19 | Which are true statements about the following module?

```java
class dragon {
    exports com.dragon.fire;
    exports com.dragon.scales to castle;
}
```

A. All modules can reference the com.dragon.fire package.
B. All modules can reference the com.dragon.scales package.
C. Only the castle module can reference the com.dragon.fire package.
D. Only the castle module can reference the com.dragon.scales package.
E. None of the above

Your reasoning: the declaration uses the keyword `class` instead of `module`, so it doesn't compile.
Your answer: E
Correct answer: **E**

Correct. A module declaration uses the keyword `module`, not `class`. Since the code does not compile, none of the other options apply. If the keyword were corrected to `module`, then A and D would be correct -- `com.dragon.fire` would be exported to all modules, and `com.dragon.scales` would be exported only to `castle`.

---

### Q20 | Which would you expect to see when describing any module?

A. requires java.base mandated
B. requires java.core mandated
C. requires java.lang mandated
D. requires mandated java.base
E. requires mandated java.core
F. requires mandated java.lang
G. None of the above

Your reasoning: (not stated)
Your answer: A
Correct answer: **A**

Correct. `java.base` is automatically added as a dependency to every module. When you describe a module with `java -d`, this shows up as `requires java.base mandated` -- the module name comes before `mandated` in the output. `java.lang` is a package (automatically imported in classes), not a module. `java.core` does not exist.

---

### Q21 | Which module(s) need to specify a requires directive on the service provider?

A. Service locator
B. Service provider interface
C. Consumer
D. Consumer and service locator
E. Consumer and service provider
F. Service locator and service provider interface
G. Consumer, service locator, and service provider interface
H. None of the above

Your reasoning: no module ever specifies `requires` on the service provider since it is the implementation detail.
Your answer: H
Correct answer: **H**

Correct. The service provider is the implementation. No other module requires it directly -- that would defeat the purpose of loose coupling. The service locator finds it at runtime via `ServiceLoader`, not by declaring a `requires` dependency on it. The consumer and service locator both `require` the service provider interface module, not the provider itself.

---

### Q22 | Which are true statements? (Choose all that apply.)

A. An automatic module exports all packages to named modules.
B. An automatic module exports only the specified packages to named modules.
C. An automatic module exports no packages to named modules.
D. An unnamed module exports only the named packages to named modules.
E. An unnamed module exports all packages to named modules.
F. An unnamed module exports no packages to named modules.

Your reasoning: automatic modules export all packages. Both automatic and unnamed modules are available to all.
Your answer: A, E
Correct answer: **A, F**

> WRONG ANSWER

You got A right -- automatic modules export all their packages automatically. The mistake was E. An unnamed module is on the classpath, and code on the module path cannot read from the classpath. This is the one-way wall: classpath code can see modules, but modules cannot see classpath code. Unnamed modules export no packages to named or automatic modules (F). E is wrong -- unnamed modules are not visible to modules on the module path at all.

The confusion likely came from mixing up automatic modules (module path, exports everything) with unnamed modules (classpath, exports nothing to modules).

---

### Q23 | Which is the first line to contain a compiler error?

```java
1: module snake {
2:     exports com.snake.tail;
3:     exports com.snake.fangs to bird;
4:     requires skin;
5:     requires transitive skin;
6: }
```

A. Line 1
B. Line 2
C. Line 3
D. Line 4
E. Line 5
F. The code does not contain any compiler errors.

Your reasoning: it is redundant to `requires` the same module twice, so line 5 is a compile error.
Your answer: E
Correct answer: **E**

Correct. Each directive line is individually valid. Lines 4 and 5 are the trap -- both `requires skin` and `requires transitive skin` are valid in isolation, but Java does not allow the same module to appear in two separate `requires` statements. The second one on line 5 causes the compile error.

---

### Q24 | Which are true statements about a package in a JAR on the classpath containing a module-info.java file? (Choose all that apply.)

A. It is possible to make the package available to all other modules on the classpath.
B. It is possible to make the package available to all other modules on the module path.
C. It is possible to make the package available to exactly one other specific module on the classpath.
D. It is possible to make the package available to exactly one other specific module on the module path.
E. It is possible to make sure the package is not available to any other modules on the classpath.

Your reasoning: a JAR on the classpath is an unnamed module, its `module-info.java` is ignored, and modules on the module path cannot access classpath code. The classpath has no access control mechanism.
Your answer: A
Correct answer: **A**

Correct. Since the JAR is on the classpath, `module-info.java` is ignored and it behaves as an unnamed module. The classpath has no access restriction mechanism -- everything on the classpath can see everything else on the classpath, so A is correct. B and D are wrong because modules on the module path cannot read classpath code at all. C and E are wrong because the classpath has no facility to restrict package visibility to specific consumers.

---

### Q25 | Which statements are true about the directives you need to specify? (Choose all that apply.)

A. The consumer must use the requires directive.
B. The consumer must use the uses directive.
C. The service locator must use the requires directive.
D. The service locator must use the uses directive.
E. None of the above

Your reasoning: the consumer requires the service locator (and the API). The service locator must require the interface and declare `uses`.
Your answer: A, C, D
Correct answer: **A, C, D**

Correct. The consumer uses `requires` for both the service provider interface module and the service locator module (A, C). The service locator uses `requires` on the service provider interface module to compile against it, and `uses` to tell the module system it will call `ServiceLoader.load()` for that interface at runtime (D). The consumer does not need `uses` -- it never calls `ServiceLoader` directly.

---

## Notes to Self
