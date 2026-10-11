# Exceptions, Formatting, and Localization

This chapter covers three ways of making applications adapt to change:

- **Exceptions** -- handling things that go wrong at runtime, whether from bad user
  input, coding mistakes, or external failures like a lost network connection.
- **Formatting** -- presenting data (numbers, dates, currency) in a way that fits the
  context.
- **Localization** -- building applications that can support multiple languages and
  geographic regions without a rewrite.

---

### Understanding Exceptions

#### What an exception is

An exception is Java's way of saying "I don't know what to do here -- you deal with it."
When a method encounters a situation it cannot handle, it throws an exception and
stops executing. The responsibility shifts to the calling code.

There are two broad categories of failure:

- **Coding mistakes** -- accessing an invalid array index, calling a method on `null`,
  dividing by zero. These are bugs.
- **External failures** -- the database goes down, the network drops, a file is missing.
  These are beyond the program's control but must still be handled.

Java gives you a structured framework for dealing with both.

---

#### Return codes vs. exceptions

One alternative to exceptions is returning a special value to signal failure:

```java
public int indexOf(String[] names, String name) {
    for (int i = 0; i < names.length; i++) {
        if (names[i].equals(name)) return i;
    }
    return -1; // signals "not found"
}
```

This works for simple searches but has problems:

- The caller must remember to check the return value. The compiler does not enforce it.
- A magic value like `-1` can be confused with a legitimate result.
- There is no standard way to attach a message or context to the failure.

Java provides exceptions precisely to avoid these problems. Prefer exceptions over
return codes for signaling failure.

---
