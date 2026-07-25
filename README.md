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
- Garbage Collection (eligibility rule, objects vs. references, tracing technique with worked
  examples)
- Default Imports & Method Parameters (what's auto-imported besides `java.lang`, and whether
  Java supports default parameter values)

### Chapter 2 — Operators
- Understanding Java Operators (operator/operand/result terminology, unary/binary/ternary)
- Operator Precedence (Table 2.1, precedence vs. associativity, and a full row-by-row
  walkthrough of every operator with worked "precedence in context" examples)

## How to add a chapter

The published site (Nextra on Vercel) is generated automatically from the
`Chapter N` folders by `scripts/build-content.mjs`, so those folders are the
single source of truth. Adding a chapter takes a few steps.

**1. Create the folder and notes file**

- Create a folder named exactly `Chapter N` at the repo root, for example
  `Chapter 3`: capital `C`, a space, then the number.
- Put the notes in a **single** `.md` file inside it (any filename works, e.g.
  `Chapter 3 notes.md`).
- Write plain Markdown. Keep braces `{}` and generics such as `List<String>`
  inside code fences or inline backticks. Avoid emojis and em dashes.

**2. (Optional) Give it a title**

Add a line to `CHAPTER_TITLES` in `scripts/build-content.mjs`:

```js
const CHAPTER_TITLES = {
  1: 'Building Blocks',
  2: 'Operators',
  3: 'Making Decisions'   // new
}
```

Without this the chapter still works; the sidebar and tab just show
`Chapter 3` instead of `Chapter 3: Making Decisions`.

**3. Commit and push**

```bash
git add "Chapter 3" scripts/build-content.mjs
git commit -m "Add Chapter 3 notes"
git push
```

Vercel auto-deploys on push. Its build runs the `prebuild` step, which
regenerates `content/chapter-3.mdx` and the sidebar order. The chapter then
appears at `/chapter-3`.

**Notes**

- Do not edit the `content/` folder directly. It is generated and gitignored;
  edit only the `Chapter N` folders.
- Preview locally with `npm run dev`, or run `npm run sync` to regenerate
  `content/` without starting the server.
- Editing an existing chapter is the same flow: edit its `.md`, commit, push.
- Landing-page cards have custom icons for the existing chapters only. Ask if
  you want a matching icon added for a new one.
