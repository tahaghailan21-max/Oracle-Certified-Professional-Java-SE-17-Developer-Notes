# Oracle Certified Professional: Java SE 17 Developer — Notes

Study notes for the OCP Java SE 17 Developer certification (Exam 1Z0-829),
following the Sybex Study Guide by Jeanne Boyarsky and Scott Selikoff.

These are personal revision notes focused on the concepts that didn't stick on
a first read — the tricky, exam-tested details.

> The book PDF is intentionally excluded from this repository (see `.gitignore`).

## Contents

### Chapter 1 — Building Blocks
- Strings & Text Blocks (definition, purpose, incidental vs. essential whitespace,
  when a newline is created, formatting sequences)
- Primitive Types (the 8 types, writing literals, number bases, underscores)
- Reference Types vs. Primitives, and Wrapper Classes (parseInt vs. valueOf, boxing)
- Variable Types & Scope (local, instance, class variables; when a class is loaded)
- Initialization & Default Values (which variables get defaults, local-variable rules)
- The `final` Keyword (declaration, initialization, and its effect on default values, with
  legal/illegal reference table)
- Order of Initialization (constructors, instance initializer blocks, and the file-order vs.
  constructor-always-last rule)
