# Collections and Generics

This chapter covers the Java Collections Framework, `Comparable`, `Comparator`, and
generics. Many of the built-in functional interfaces from Chapter 8 are used
throughout -- go back and review that table if anything feels unfamiliar.

---

### The Four Main Interfaces

A **collection** is a group of objects contained in a single object. The Java Collections
Framework is a set of classes in `java.util` for storing collections. There are four main
interfaces:

- **List** -- an ordered collection that allows duplicate entries. Elements are accessed by
  an `int` index.
- **Set** -- a collection that does not allow duplicate entries.
- **Queue** -- a collection that orders its elements in a specific order for processing.
  `Deque` is a subinterface of `Queue` that allows access at both ends.
- **Map** -- maps keys to values, with no duplicate keys allowed. Elements are key/value
  pairs.

#### Collection hierarchy

```
                          Collection
                               |
              +----------------+----------------+
              |                |                |
            List             Queue             Set
            /  \               |              /   \
       ArrayList  \          Deque        HashSet  TreeSet
                   \        /
                   LinkedList   <-- implements both List and Deque


        Map  (separate -- does not extend Collection)
       /    \
  HashMap  TreeMap
```

`Map` does not implement the `Collection` interface. It is part of the Java Collections
Framework but is treated separately because key/value pairs require different methods
than a plain collection of elements. It is still a collection (lowercase) in the general sense.

`LinkedList` implements both `List` and `Deque`. It can be used as an ordered list
accessed by index, and also as a double-ended queue.

---

### Using Common Collection APIs

The `Collection` interface provides a set of common methods that all implementing
classes share. The examples in this section use `ArrayList` and `HashSet` as concrete
implementations, but the methods apply to any class that implements `Collection`.

---

### The Diamond Operator

When constructing a collection, you must specify the type it holds. Without shorthand:

```java
List<Integer> list = new ArrayList<Integer>();
Map<Long, List<Integer>> mapOfLists = new HashMap<Long, List<Integer>>();
```

The type is written twice -- once on the left (the variable declaration) and once on the
right (the constructor call). The **diamond operator** `<>` lets you omit the type on the
right side when the compiler can infer it from the left:

```java
List<Integer> list = new ArrayList<>();
Map<Long, List<Integer>> mapOfLists = new HashMap<>();
```

Both pairs of declarations are equivalent to the compiler. The diamond operator is just
shorthand -- it removes the duplication.

#### The diamond operator can only appear on the right side of an assignment

`<>` is not a type -- it is an instruction to the compiler that says "figure out the type
from context." For it to work, the full type must already be written somewhere. The left
side of an assignment is where that full type lives.

When you write:

```java
List<Integer> list = new ArrayList<>();
```

The compiler reads the left side first: `List<Integer>`. Now it knows the element type is
`Integer`. When it hits `new ArrayList<>()` on the right, it uses that knowledge to fill in
the blank -- `<>` becomes `<Integer>`. The type only needs to be written once.

Flip it, and it breaks:

```java
List<> list = new ArrayList<Integer>(); // DOES NOT COMPILE - <> on the left side
```

The compiler reads the left side: `List<>`. There is nothing to infer from -- the left side
is the declaration, not an expression with a known type. Type inference only flows
left-to-right on an assignment, not right-to-left. `List<>` on the left is simply illegal
syntax.

The same applies to a method parameter:

```java
class InvalidUse {
    void use(List<> data) {} // DOES NOT COMPILE - <> in a parameter type
}
```

A parameter declaration needs a concrete type. `List<>` is not a type, it is an instruction
to infer one. But there is nothing to infer from in a parameter list -- the caller's argument
type is not visible at the point the parameter is declared.

The rule in one sentence: `<>` is only legal where the full generic type is already known
on the left side of the same assignment.

```java
List<String> a = new ArrayList<>();  // fine - left side has the full type
var b          = new ArrayList<String>(); // fine - right side has the full type, var infers from it
var c          = new ArrayList<>();  // problem - neither side has the full type
List<> d       = new ArrayList<String>(); // DOES NOT COMPILE - <> on the declaration side
```


---

### Common Collection API Methods

These methods are defined on the `Collection` interface and available on any implementing
class (`ArrayList`, `HashSet`, etc.). The generic type `E` refers to whatever type the
collection was created with.

---

#### `add(E element)` -- adding data

```java
public boolean add(E element)
```

Inserts an element and returns whether it was successful. For some types (`List`) it
always returns `true`. For others (`Set`) it returns `false` if the element already exists:

```java
Collection<String> list = new ArrayList<>();
System.out.println(list.add("Sparrow")); // true
System.out.println(list.add("Sparrow")); // true  - List allows duplicates

Collection<String> set = new HashSet<>();
System.out.println(set.add("Sparrow")); // true
System.out.println(set.add("Sparrow")); // false - Set does not allow duplicates
```

---

#### `remove(Object object)` -- removing data

```java
public boolean remove(Object object)
```

Removes a single matching element and returns whether a match was found and removed.
The parameter is `Object`, not `E` -- this is intentional. The check is done at runtime
using `equals()`. If you pass something that does not match any element, it simply
returns `false` without a compile error:

```java
Collection<String> birds = new ArrayList<>();
birds.add("hawk"); // [hawk]
birds.add("hawk"); // [hawk, hawk]
System.out.println(birds.remove("cardinal")); // false - not found
System.out.println(birds.remove("hawk"));     // true  - one match removed
System.out.println(birds);                    // [hawk] - only one was removed
```

`remove()` removes only the first matching element, not all of them.

##### Exam trap -- `remove(int index)` vs `remove(Object)` on a `List<Integer>`

`List` has two `remove` overloads:
- `remove(int index)` -- removes the element at that position
- `remove(Object object)` -- removes the first element equal to the argument

This ambiguity only exists on `List`. `Collection` only has `remove(Object)`, and `Set`
and `Queue` have no index-based access at all. The trap only fires when the declared
variable type is `List<Integer>`.

When you pass a plain `int` literal to a `List<Integer>`, Java picks `remove(int index)`.
When you pass an `Integer` object, Java picks `remove(Object)`. The results are
completely different:

```java
List<Integer> list = new ArrayList<>();
list.add(1); list.add(2); list.add(3); // [1, 2, 3]

list.remove(2);                  // removes element at INDEX 2 --> removes 3
System.out.println(list);        // [1, 2]

list.remove(Integer.valueOf(2)); // removes element with VALUE 2
System.out.println(list);        // [1]
```

The declared type of the variable determines which overloads are visible. If you declare
the variable as `Collection<Integer>` instead of `List<Integer>`, `remove(int index)` is
not visible and the trap disappears:

```java
Collection<Integer> c = new ArrayList<>();
c.add(1); c.add(2); c.add(3);
c.remove(2); // only remove(Object) visible - removes VALUE 2, not index 2
System.out.println(c); // [1, 3]
```

To remove by value from a `List<Integer>`, box the value explicitly:
`list.remove(Integer.valueOf(2))` or `list.remove((Integer) 2)`.

---

#### `isEmpty()` and `size()` -- counting elements

```java
public boolean isEmpty()
public int size()
```

```java
Collection<String> birds = new ArrayList<>();
System.out.println(birds.isEmpty()); // true
System.out.println(birds.size());    // 0
birds.add("hawk"); // [hawk]
birds.add("hawk"); // [hawk, hawk]
System.out.println(birds.isEmpty()); // false
System.out.println(birds.size());    // 2
```

`isEmpty()` and `size()` reflect the number of elements currently in the collection, not
its internal capacity. An `ArrayList` can have capacity greater than 0 while still being
logically empty.

---

#### `clear()` -- clearing the collection

```java
public void clear()
```

Discards all elements. The collection still exists but becomes empty:

```java
Collection<String> birds = new ArrayList<>();
birds.add("hawk"); // [hawk]
birds.add("hawk"); // [hawk, hawk]
System.out.println(birds.isEmpty()); // false
System.out.println(birds.size());    // 2
birds.clear();
System.out.println(birds.isEmpty()); // true
System.out.println(birds.size());    // 0
```

---

#### `contains(Object object)` -- checking contents

```java
public boolean contains(Object object)
```

Returns `true` if the collection contains at least one element equal to the argument.
Uses `equals()` internally to check for a match:

```java
Collection<String> birds = new ArrayList<>();
birds.add("hawk");
System.out.println(birds.contains("hawk"));   // true
System.out.println(birds.contains("robin"));  // false
```

Because `contains()` relies on `equals()`, the behaviour depends on how `equals()` is
implemented for the element type. For custom classes, if you do not override `equals()`,
it falls back to reference equality (same object in memory).

---

#### `removeIf(Predicate filter)` -- removing with conditions

```java
public boolean removeIf(Predicate<? super E> filter)
```

Removes all elements that match the predicate. Returns `true` if any elements were
removed. The `? super E` part is explained in the generics section later in the chapter --
for now, just know it accepts a `Predicate` that takes one element and returns `boolean`:

```java
Collection<String> list = new ArrayList<>();
list.add("Magician");
list.add("Assistant");
System.out.println(list); // [Magician, Assistant]
list.removeIf(s -> s.startsWith("A"));
System.out.println(list); // [Magician]
```

The same with a method reference:

```java
Collection<String> set = new HashSet<>();
set.add("Wand");
set.add("");
set.removeIf(String::isEmpty); // equivalent lambda: s -> s.isEmpty()
System.out.println(set);       // [Wand]
```

---

#### `forEach(Consumer action)` -- iterating

```java
public void forEach(Consumer<? super T> action)
```

Calls the consumer once for each element. Takes a `Consumer` -- one parameter, no
return value:

```java
Collection<String> cats = List.of("Annie", "Ripley");
cats.forEach(System.out::println); // method reference
cats.forEach(c -> System.out.println(c)); // equivalent lambda
```

##### Other iteration approaches

Enhanced for loop -- the most familiar form:

```java
for (String element : coll)
    System.out.println(element);
```

Iterator -- an older approach, useful when you need to remove elements during iteration:

```java
Iterator<String> iter = coll.iterator();
while (iter.hasNext()) {
    String string = iter.next();
    System.out.println(string);
}
```

`hasNext()` checks whether there is another element without moving the iterator.
`next()` moves to the next element and returns it. Always call `hasNext()` before `next()`
-- calling `next()` on an exhausted iterator throws `NoSuchElementException`.

---

#### `equals(Object object)` -- determining equality

```java
boolean equals(Object object)
```

Collections have a custom `equals()` that compares type and contents. The behaviour
varies by type -- `List` is order-sensitive, `Set` is not:

```java
var list1 = List.of(1, 2);
var list2 = List.of(2, 1);
var set1  = Set.of(1, 2);
var set2  = Set.of(2, 1);

System.out.println(list1.equals(list2)); // false - same elements, different order, List cares
System.out.println(set1.equals(set2));   // true  - same elements, Set does not care about order
System.out.println(list1.equals(set1));  // false - different types
```

---

#### Unboxing nulls -- a NullPointerException trap

A `null` can be added to a collection of wrapper types because `null` is a valid object
reference. The problem arises when you try to unbox it to a primitive:

```java
var heights = new ArrayList<Integer>();
heights.add(null);
int h = heights.get(0); // NullPointerException
```

Line 2 is legal -- `null` can be assigned to `Integer`. Line 3 tries to unbox `null` into an
`int`. Java attempts to call `intValue()` on `null`, which throws `NullPointerException`.
Any time you see `null` and autoboxing together, check whether an unboxing step could
dereference that null.

---

### Using the List Interface

A `List` is an ordered collection that allows duplicate entries. Elements are accessed by
an `int` index, starting at 0 -- like an array, but resizable.

```
Index:    0        1        2       ...
Data:   lions   pandas   zebras   ...
```

Use a `List` when order matters or when duplicates are needed. When in doubt about
which collection to use, default to `ArrayList`.

#### Comparing List implementations

**`ArrayList`**
- Backed by a resizable array that grows automatically as elements are added
- Lookup by index is constant time O(1)
- Adding or removing at an arbitrary position is slower (elements must shift)
- Best choice when reading more often than writing

**`LinkedList`**
- Implements both `List` and `Deque`
- Adding/removing at the beginning or end is constant time O(1)
- Lookup by arbitrary index is linear time O(n) -- must traverse from the start
- Best choice when used as a `Deque` (double-ended queue), not as a general list

---

#### Creating a List with a factory method

Three factory methods return a `List` without you needing to know the concrete type.
The key difference between them is mutability:

| Method | Description | Add? | Replace? | Delete? |
|---|---|---|---|---|
| `Arrays.asList(varargs)` | Fixed-size list backed by the array | No | Yes | No |
| `List.of(varargs)` | Fully immutable list | No | No | No |
| `List.copyOf(collection)` | Immutable copy of another collection | No | No | No |

```java
String[] array = new String[] {"a", "b", "c"};
List<String> asList = Arrays.asList(array); // [a, b, c]
List<String> of     = List.of(array);       // [a, b, c]
List<String> copy   = List.copyOf(asList);  // [a, b, c]

array[0] = "z";

System.out.println(asList); // [z, b, c] - backed by the array, reflects the change
System.out.println(of);     // [a, b, c] - immutable snapshot, unaffected
System.out.println(copy);   // [a, b, c] - immutable copy, unaffected

asList.set(0, "x");
System.out.println(Arrays.toString(array)); // [x, b, c] - change went back to the array

copy.add("y"); // UnsupportedOperationException - immutable
```

`Arrays.asList()` is backed by the original array -- changes to the list are reflected in
the array and vice versa. You can replace elements but cannot add or delete (that would
change the size of the underlying array, which is fixed). `List.of()` and `List.copyOf()`
are fully immutable -- any structural change or element replacement throws
`UnsupportedOperationException`.

---

#### Creating a List with a constructor

All collections support two standard constructors -- empty, and copy of another collection:

```java
var linked1 = new LinkedList<String>();         // empty
var linked2 = new LinkedList<String>(linked1);  // copy of linked1
```

`ArrayList` has a third constructor that sets the initial internal capacity (not the size --
no elements are added):

```java
var list1 = new ArrayList<String>();     // empty, default capacity
var list2 = new ArrayList<String>(list1); // copy of list1
var list3 = new ArrayList<String>(10);   // empty, initial capacity of 10 slots
```

`list3` has 0 elements -- the `10` is a performance hint to avoid resizing early, not a
count of elements.

---

#### `var` with `ArrayList` and the diamond operator

```java
var strings = new ArrayList<String>(); // type is ArrayList<String> - fine
```

If you use both `var` and `<>`, the compiler has no type information on either side and
defaults the element type to `Object`:

```java
var list = new ArrayList<>(); // compiles - type is ArrayList<Object>
list.add("a");                // fine - String is a subclass of Object
for (String s : list) { }    // DOES NOT COMPILE - list is ArrayList<Object>, not ArrayList<String>
```

The loop fails because `var` inferred `ArrayList<Object>`, and you cannot iterate it as
`String` without a cast. Avoid writing `var list = new ArrayList<>()` -- always give the
type on at least one side.

---

#### List methods

In addition to the `Collection` methods, `List` adds index-based operations:

| Method | Description |
|---|---|
| `add(E element)` | Adds element to the end |
| `add(int index, E element)` | Inserts at index, shifts the rest toward the end |
| `get(int index)` | Returns element at index |
| `remove(int index)` | Removes element at index, shifts the rest toward the front |
| `set(int index, E e)` | Replaces element at index, returns the original element |
| `replaceAll(UnaryOperator<E> op)` | Replaces each element with the result of the operator |
| `sort(Comparator<? super E> c)` | Sorts the list (covered in the Sorting section) |

```java
List<String> list = new ArrayList<>();
list.add("SD");          // [SD]
list.add(0, "NY");       // [NY, SD]
list.set(1, "FL");       // [NY, FL]
System.out.println(list.get(0)); // NY
list.remove("NY");       // [FL]
list.remove(0);          // []
list.set(0, "?");        // IndexOutOfBoundsException - list is empty, index 0 does not exist
```

`set()` and `remove(int index)` throw `IndexOutOfBoundsException` if the index is
out of range. An empty list has no valid indexes -- even index 0 throws.

##### `replaceAll()` with a `UnaryOperator`

`replaceAll()` calls the operator on each element and replaces the value in place:

```java
var numbers = Arrays.asList(1, 2, 3);
numbers.replaceAll(x -> x * 2);
System.out.println(numbers); // [2, 4, 6]
```

---

#### The `remove()` overload trap on `List<Integer>` -- revisited

```java
var list = new LinkedList<Integer>();
list.add(3);
list.add(2);
list.add(1);        // [3, 2, 1]
list.remove(2);     // int literal -> remove(int index) -> removes element at index 2 -> removes 1
                    // list is now [3, 2]
list.remove(Integer.valueOf(2)); // Integer object -> remove(Object) -> removes value 2
                    // list is now [3]
System.out.println(list); // [3]
```

Passing an index that does not exist throws `IndexOutOfBoundsException`:

```java
list.remove(100); // IndexOutOfBoundsException - no element at index 100
```

---

#### Converting a List to an array

```java
List<String> list = new ArrayList<>();
list.add("hawk");
list.add("robin");

Object[] objectArray = list.toArray();              // defaults to Object[]
String[] stringArray = list.toArray(new String[0]); // pass a typed array to get String[]

list.clear();
System.out.println(objectArray.length); // 2 - unaffected by clear()
System.out.println(stringArray.length); // 2 - unaffected by clear()
```

Notice that 'list.clear();' clears the original List. This does not affect either array. The array is a newly created object with no relationship to the original List. It is simply a copy.

`toArray()` with no arguments has no type information, so it can only return `Object[]`.
Even though the list contains `String` objects, you get back `Object[]` -- you would have
to cast each element yourself.

`toArray(T[] a)` takes an array as a type hint. You are not passing the storage -- you are
telling Java what element type you want in the returned array. Java looks at the type of the
array you pass and returns an array of that type:

```java
// new String[0] is just an empty String array with zero slots
// the size does not matter - you are using it purely as a type hint
String[] hint = new String[0]; // String[] with 0 slots - no elements

// toArray checks: does the list fit in hint? No - hint has 0 slots, list has 2 elements
// Java allocates a brand new String[2], fills it with the list elements, and returns it
String[] stringArray = list.toArray(hint);
```

Passing size `0` is the conventional pattern. Java will always allocate a new correctly
sized array when the hint is too small. Passing `new String[list.size()]` also works --
Java reuses that array directly instead of allocating a new one.

```java
// both of these produce the same result
String[] a = list.toArray(new String[0]);          // Java allocates a new String[2]
String[] b = list.toArray(new String[list.size()]); // Java fills the array you provided
```




---

### Using the Set Interface

Use a `Set` when you do not want to allow duplicate entries. The main thing all `Set`
implementations have in common is that they do not allow duplicates.

#### Comparing Set implementations

**`HashSet`**
- Backed by a hash table: keys are hash values, values are the stored objects
- Uses `hashCode()` to retrieve elements efficiently
- Add and contains: **O(1)** constant time
- **No guaranteed order** -- insertion order is lost
- Most commonly used `Set` implementation

**`TreeSet`**
- Backed by a sorted tree structure
- Elements are always in **sorted order**
- Add and checking whether an element exists: slower than `HashSet`, especially as the
  tree grows larger

| | Order | Speed |
|---|---|---|
| `HashSet` | none | O(1) |
| `TreeSet` | sorted | O(log n) |


#### Working with Set Methods

You can create an immutable `Set` in one line or make a copy of an existing one:

```java
Set<Character> letters = Set.of('z', 'o', 'o');
Set<Character> copy = Set.copyOf(letters);
```

Both `Set.of()` and `Set.copyOf()` produce fully immutable sets -- any mutation attempt
throws `UnsupportedOperationException`. Also, `Set.of()` does not silently drop
duplicates like a regular `HashSet` would. Passing duplicates throws
`IllegalArgumentException` at runtime:

`Set` is an interface and cannot be instantiated directly. `Set.of()` and `Set.copyOf()`
return an unspecified immutable implementation under the hood -- you never need to know
which concrete class they use.

```java
Set.of('z', 'o', 'o'); // compiles fine -- IllegalArgumentException thrown at runtime, 'o' is a duplicate
```

Those are the only extra methods you need to know for the `Set` interface for the exam.

`add()` returns `true` unless the element is already in the set. A set must preserve
uniqueness, so adding a duplicate returns `false`:

```java
Set<Integer> set = new HashSet<>();
boolean b1 = set.add(66); // true
boolean b2 = set.add(10); // true
boolean b3 = set.add(66); // false - already present
boolean b4 = set.add(8);  // true
set.forEach(System.out::println);
// prints (arbitrary order):
// 66
// 8
// 10
```

`HashSet` prints in an arbitrary order -- not sorted, not insertion order.

`equals()` is used to determine equality. `hashCode()` is used to know which bucket to
look in so Java doesn't have to scan the whole set.

A `HashSet` internally divides its storage into buckets. When you call `add()` or
`contains()`, Java uses `hashCode()` to jump straight to the right bucket first, then uses
`equals()` only on the elements in that bucket:
	
```java
set.contains("zebras");
// Step 1: compute "zebras".hashCode() --> say, -705903059
// Step 2: go directly to the bucket for that hash value
// Step 3: call equals() only on elements in that bucket
```

Best case: hash codes are unique, each bucket holds exactly one element, `equals()` is
called once. O(1).

```
Bucket -995544615 --> [pandas]
Bucket -705903059 --> [zebras]   // jump here, call equals() once
Bucket  102978519 --> [lions]
```

Worst case: all objects return the same hash code (a badly written `hashCode()` that
always returns `42`). Every element lands in the same bucket and Java has to call
`equals()` on all of them -- effectively a linear scan. O(n).

```
Bucket 42 --> [pandas, zebras, lions, tigers, ...]
              // must check every single one with equals()
```

This is why if you override `equals()` on a class, you must also override `hashCode()`
consistently. If two objects are `equal()` but have different hash codes, Java looks in the
wrong bucket and never finds the match -- the set stores what it thinks are two different
objects, silently breaking the no-duplicates contract.

With `TreeSet`, the same code prints in natural sorted order:

```java
Set<Integer> set = new TreeSet<>();
set.add(66); set.add(10); set.add(66); set.add(8);
set.forEach(System.out::println);
// 8
// 10
// 66
```

Numbers implement `Comparable`, which `TreeSet` uses for sorting.

---

### Using the Queue and Deque Interfaces

Use a `Queue` when elements are added and removed in a specific order. A standard queue
is **FIFO** (first-in, first-out) -- like a line of people.

A **`Deque`** (double-ended queue, pronounced "deck") allows inserting and removing
elements from both the front (head) and back (tail).

#### Comparing Deque Implementations

**`LinkedList`** -- implements both `List` and `Deque`. The trade-off is that it isn't as
efficient as a "pure" queue.

**`ArrayDeque`** -- use this when you don't need the `List` methods.

#### Queue Methods

| Functionality             | Throws exception | Returns null / false |
| ------------------------- | ---------------- | -------------------- |
| Add to back               | `add(E e)`       | `offer(E e)`         |
| Read from front           | `element()`      | `peek()`             |
| Get and remove from front | `remove()`       | `poll()`             |

The bolded behaviour (throws exception) is on the left. The safe behaviour (returns
`null`/`false`) is on the right.

```java
Queue<Integer> queue = new LinkedList<>();
queue.add(10);
queue.add(4);
System.out.println(queue.remove()); // 10 - removes and returns the front
System.out.println(queue.peek());   // 4  - reads front without removing

// --- throwing vs safe methods on an empty queue ---
Queue<Integer> q = new LinkedList<>();

// add() vs offer() -- both add to the back
q.add(1);    // [1]
q.offer(2);  // [1, 2] - same behaviour here, offer() matters for bounded queues

// element() vs peek() -- both read front without removing
q.element(); // 1  - queue is [1, 2]
q.peek();    // 1  - queue is [1, 2]

// remove() vs poll() -- both remove and return front
q.remove();  // 1  - queue is [2]
q.poll();    // 2  - queue is []

// now the queue is empty -- this is where they differ
q.peek();    // null    - safe, returns null
q.poll();    // null    - safe, returns null
q.element(); // NoSuchElementException - throws, queue is empty
q.remove();  // NoSuchElementException - throws, queue is empty
```

#### Deque Methods (double-ended)

| Functionality             | Methods                            |
| ------------------------- | ---------------------------------- |
| Add to front              | `addFirst(E e)`, `offerFirst(E e)` |
| Add to back               | `addLast(E e)`, `offerLast(E e)`   |
| Read from front           | `getFirst()`, `peekFirst()`        |
| Read from back            | `getLast()`, `peekLast()`          |
| Get and remove from front | `removeFirst()`, `pollFirst()`     |
| Get and remove from back  | `removeLast()`, `pollLast()`       |
|                           |                                    |

```java
Deque<Integer> deque = new LinkedList<>();
deque.offerFirst(10); // [10]
deque.offerLast(4);   // [10, 4]
deque.peekFirst();    // 10  - [10, 4] unchanged
deque.pollFirst();    // 10  - [4]
deque.pollLast();     // 4   - []
deque.pollFirst();    // null - empty
deque.peekFirst();    // null - empty
```

#### Using a Deque as a Stack (LIFO)

A stack is **LIFO** (last-in, first-out) -- like a stack of plates. You always add and remove
from the top.

| Functionality | Method |
|---|---|
| Add to front/top | `push(E e)` |
| Remove from front/top | `pop()` |
| Get first element | `peek()` |

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(10); // [10]
stack.push(4);  // [4, 10]
stack.peek();   // 4    - [4, 10] unchanged
stack.poll();   // 4    - [10]
stack.poll();   // 10   - []
stack.peek();   // null - empty
```

When using a `Deque`, always determine which mode it is operating in:
- **FIFO queue** -- get on at the back, off at the front
- **LIFO stack** -- add and remove from the top (front)
- **Double-ended** -- uses both ends

The mode is determined entirely by which methods you call -- nothing enforces it. The
same `ArrayDeque` object can be used as a stack in one place and a queue in another.

`Queue` and `Deque` are both interfaces. `Deque` extends `Queue`. The concrete classes
you instantiate are `ArrayDeque` and `LinkedList`:

```
Queue (interface)
  └── Deque (interface, extends Queue)
        ├── ArrayDeque (class)
        └── LinkedList (class, also implements List)
```

Declaring the variable as `Queue` limits visible methods to Queue methods, signalling
FIFO intent. Declaring as `Deque` exposes all methods for either end:

```java
Queue<Integer> q = new ArrayDeque<>();  // only Queue methods visible -- FIFO intent
Deque<Integer> d = new ArrayDeque<>();  // all Deque methods visible -- any mode
```

The variable type does not enforce anything at runtime -- it only controls what the
compiler lets you call.


---

### Using the Map Interface

Use a `Map` when you want to identify values by a key. All `Map` implementations have
keys and values in common. You don't need to know the names of specific interfaces the
different maps implement, but you do need to know that `TreeMap` is sorted.

#### Map.of() and Map.copyOf()

```java
Map.of("key1", "value1", "key2", "value2");
```

This is less than ideal -- it is hard to keep track of which parameter is a key and which is
a value. The better way is `Map.ofEntries()`:

```java
Map.ofEntries(
    Map.entry("key1", "value1"),
    Map.entry("key2", "value2"));
```

You can't forget to pass a value -- if you leave out a parameter, `entry()` won't compile.
`Map.copyOf(map)` works the same as `List.copyOf()` and `Set.copyOf()`.

#### Comparing Map Implementations

**`HashMap`** -- keys stored in a hash table, uses `hashCode()` of the keys. Add and
get by key: O(1). No guaranteed order of keys.

**`TreeMap`** -- keys stored in a sorted tree. Keys are always in sorted order. Add and
lookup: slower as the tree grows.

#### Map Methods

| Method | Description |
|---|---|
| `clear()` | Removes all keys and values |
| `containsKey(Object key)` | Returns whether key is in map |
| `containsValue(Object value)` | Returns whether value is in map |
| `entrySet()` | Returns `Set` of key/value pairs |
| `forEach(BiConsumer<K, V>)` | Loops through each key/value pair |
| `get(Object key)` | Returns value for key, or null if not found |
| `getOrDefault(Object key, V default)` | Returns value for key, or default if not found |
| `isEmpty()` | Returns whether map is empty |
| `keySet()` | Returns `Set` of all keys |
| `merge(K key, V value, Function)` | Sets value if key not set; runs function if key is set; removes if function returns null |
| `put(K key, V value)` | Adds or replaces key/value pair, returns previous value or null |
| `putIfAbsent(K key, V value)` | Adds value if key not present, returns null; otherwise returns existing value |
| `remove(Object key)` | Removes and returns value for key, or null if not found |
| `replace(K key, V value)` | Replaces value for key if present, returns original value or null |
| `replaceAll(BiFunction<K, V, V>)` | Replaces each value with result of function |
| `size()` | Returns number of key/value pairs |
| `values()` | Returns `Collection` of all values |

#### Calling Basic Methods

```java
Map<String, String> map = new HashMap<>();
map.put("koala", "bamboo");
map.put("lion", "meat");
map.put("giraffe", "leaf");
String food = map.get("koala"); // bamboo
for (String key : map.keySet())
    System.out.print(key + ","); // koala,giraffe,lion, (arbitrary order)
```

With `TreeMap`, keys are always printed in sorted order:

```java
Map<String, String> map = new TreeMap<>();
map.put("koala", "bamboo");
map.put("lion", "meat");
map.put("giraffe", "leaf");
for (String key : map.keySet())
    System.out.print(key + ","); // giraffe,koala,lion,
```

Note: `Map` does not have a `contains()` method -- that is on `Collection`. Use
`containsKey()` or `containsValue()` instead:

```java
System.out.println(map.contains("lion"));      // DOES NOT COMPILE
System.out.println(map.containsKey("lion"));   // true
System.out.println(map.containsValue("lion")); // false
System.out.println(map.size());                // 3
map.clear();
System.out.println(map.size());                // 0
System.out.println(map.isEmpty());             // true
```

#### Iterating through a Map

`forEach()` on a `Map` takes a `BiConsumer` -- both key and value as parameters:

```java
Map<Integer, Character> map = new HashMap<>();
map.put(1, 'a'); map.put(2, 'b'); map.put(3, 'c');
map.forEach((k, v) -> System.out.println(v));

// if you only need values:
map.values().forEach(System.out::println);

// to iterate key/value pairs as entries:
map.entrySet().forEach(e ->
    System.out.println(e.getKey() + " " + e.getValue()));
```

#### Getting Values Safely

`get()` returns `null` if the key is not in the map. `getOrDefault()` returns a fallback
instead:

```java
Map<Character, String> map = new HashMap<>();
map.put('x', "spot");
System.out.println(map.get('x'));              // spot
System.out.println(map.getOrDefault('x', "")); // spot
System.out.println(map.get('y'));              // null
System.out.println(map.getOrDefault('y', "")); // (empty string)
```

#### Replacing Values

```java
Map<Integer, Integer> map = new HashMap<>();
map.put(1, 2);
map.put(2, 4);
Integer original = map.replace(2, 10); // returns 4, map is now {1=2, 2=10}
map.replaceAll((k, v) -> k + v);       // map is now {1=3, 2=12}
```

#### Putting if Absent

`putIfAbsent()` sets a value only if the key is not already mapped to a non-null value:

```java
Map<String, String> favorites = new HashMap<>();
favorites.put("Jenny", "Bus Tour");
favorites.put("Tom", null);
favorites.putIfAbsent("Jenny", "Tram"); // skipped - Jenny already has a value
favorites.putIfAbsent("Sam", "Tram");   // added - Sam not present
favorites.putIfAbsent("Tom", "Tram");   // added - Tom present but value is null
System.out.println(favorites);          // {Tom=Tram, Jenny=Bus Tour, Sam=Tram}
```

#### Merging Data

`merge()` adds logic for choosing a value when a key already exists. You pass a
`BiFunction` that takes the old and new values and returns the one to keep. In the
`BiFunction`, `v1` is always the **existing value in the map** and `v2` is always the
**new value you passed into `merge()`**:

```java
BiFunction<String, String, String> mapper = (v1, v2)
    -> v1.length() > v2.length() ? v1 : v2;

Map<String, String> favorites = new HashMap<>();
favorites.put("Jenny", "Bus Tour");
favorites.put("Tom", "Tram");

String jenny = favorites.merge("Jenny", "Skyride", mapper); // Bus Tour wins (longer)
String tom   = favorites.merge("Tom", "Skyride", mapper);   // Skyride wins (longer)

System.out.println(favorites); // {Tom=Skyride, Jenny=Bus Tour}
System.out.println(jenny);     // Bus Tour
System.out.println(tom);       // Skyride
```

If the key has a `null` value or is not in the map, the mapping function is not called and
the new value is used directly:

```java
favorites.put("Sam", null);
favorites.merge("Sam", "Skyride", mapper); // function not called, Sam=Skyride
```

If the mapping function returns `null`, the key is removed from the map:

```java
BiFunction<String, String, String> mapper = (v1, v2) -> null;
favorites.put("Jenny", "Bus Tour");
favorites.merge("Jenny", "Skyride", mapper); // function returns null -> Jenny removed
favorites.merge("Sam", "Skyride", mapper);   // Sam not in map -> Sam=Skyride added
```

**`merge()` behaviour summary:**

| Key in map     | Mapping function returns | Result                                    |
| -------------- | ------------------------ | ----------------------------------------- |
| null value     | N/A (not called)         | Key's value set to the new value          |
| non-null value | null                     | Key removed from map                      |
| non-null value | non-null value           | Key's value replaced with function result |
| not in map     | N/A (not called)         | Key added with the new value              |


---

### Comparing Collection Types

| Type  | Duplicates?  | Always ordered?     | Keys and values? | Specific add/remove order? |
| ----- | ------------ | ------------------- | ---------------- | -------------------------- |
| List  | Yes          | Yes (by index)      | No               | No                         |
| Map   | Yes (values) | No                  | Yes              | No                         |
| Queue | Yes          | Yes (defined order) | No               | Yes                        |
| Set   | No           | No                  | No               | No                         |

| Type         | Interface       | Sorted? | Calls hashCode? | Calls compareTo? |
| ------------ | --------------- | ------- | --------------- | ---------------- |
| `ArrayDeque` | `Deque`         | No      | No              | No               |
| `ArrayList`  | `List`          | No      | No              | No               |
| `HashMap`    | `Map`           | No      | Yes             | No               |
| `HashSet`    | `Set`           | No      | Yes             | No               |
| `LinkedList` | `List`, `Deque` | No      | No              | No               |
| `TreeMap`    | `Map`           | Yes     | No              | Yes              |
| `TreeSet`    | `Set`           | Yes     | No              | Yes              |

Data structures that involve sorting do not allow `null` values.

---

### Older Collections

These are no longer on the exam but appear in older code. They were early thread-safe
data structures, now replaced by better concurrent alternatives:

- `Vector` -- implements `List`
- `Hashtable` -- implements `Map`
- `Stack` -- implements `Queue`


---

### Sorting Data

For numbers, sort order is numerical. For `String` objects, order follows the Unicode
character mapping -- numbers sort before letters, and uppercase letters sort before
lowercase letters.

`Collections.sort()` returns `void` -- the method parameter is what gets sorted.

---

#### Creating a Comparable Class

```java
public interface Comparable<T> {
    int compareTo(T o);
}
```

Implement `Comparable` on your class to make it usable in data structures that require
comparison. The generic `T` lets you avoid a cast in `compareTo()`.

```java
public class Duck implements Comparable<Duck> {
    private String name;
    public Duck(String name) { this.name = name; }
    public String toString() { return name; }
    public int compareTo(Duck d) {
        return name.compareTo(d.name); // sorts ascending by name
    }
    public static void main(String[] args) {
        var ducks = new ArrayList<Duck>();
        ducks.add(new Duck("Quack"));
        ducks.add(new Duck("Puddles"));
        Collections.sort(ducks);
        System.out.println(ducks); // [Puddles, Quack]
    }
}
```

`compareTo()` return value rules:
- `0` -- current object is equal to the argument
- negative -- current object is smaller than the argument
- positive -- current object is larger than the argument

```java
public class Animal implements Comparable<Animal> {
    private int id;
    public int compareTo(Animal a) {
        return id - a.id; // ascending order
        // use a.id - id for descending order
        // use Integer.compare(id, a.id) as an alternative
    }
    public static void main(String[] args) {
        var a1 = new Animal(); a1.id = 5;
        var a2 = new Animal(); a2.id = 7;
        System.out.println(a1.compareTo(a2)); // negative (5 < 7)
        System.out.println(a1.compareTo(a1)); // 0
        System.out.println(a2.compareTo(a1)); // positive (7 > 5)
    }
}
```

#### Casting the compareTo() Argument

Without generics, `compareTo()` receives an `Object` and requires a cast:

```java
public class LegacyDuck implements Comparable {
    private String name;
    public int compareTo(Object obj) {
        LegacyDuck d = (LegacyDuck) obj; // cast required -- no generics
        return name.compareTo(d.name);
    }
}
```

#### Checking for null

When writing your own `compareTo()`, check for null if the data is not validated ahead
of time:

```java
public class MissingDuck implements Comparable<MissingDuck> {
    private String name;
    public int compareTo(MissingDuck quack) {
        if (quack == null)
            throw new IllegalArgumentException("Poorly formed duck!");
        if (this.name == null && quack.name == null) return 0;
        else if (this.name == null) return -1;
        else if (quack.name == null) return 1;
        else return name.compareTo(quack.name);
    }
}
```

#### Keeping compareTo() and equals() Consistent

If `compareTo()` returns 0, `equals()` should return `true`, and vice versa. You are
strongly encouraged to keep them consistent because not all collection classes behave
predictably if they are not. A class can technically define `compareTo()` inconsistent with
`equals()` -- but this causes confusing behaviour, and a `Comparator` should be used
instead for that sort order.

---

#### Comparing Data with a Comparator

Use `Comparator` when the class does not implement `Comparable`, or when you want to
sort the same class in different ways at different times. `Comparator` is defined outside the
class being compared.

```java
Comparator<Duck> byWeight = new Comparator<Duck>() {
    public int compare(Duck d1, Duck d2) {
        return d1.getWeight() - d2.getWeight();
    }
};
Collections.sort(ducks);           // uses compareTo() -- by name
Collections.sort(ducks, byWeight); // uses Comparator  -- by weight
```

`Comparator` is a functional interface -- rewrite with a lambda or method reference:

```java
Comparator<Duck> byWeight = (d1, d2) -> d1.getWeight() - d2.getWeight();
Comparator<Duck> byWeight = Comparator.comparing(Duck::getWeight);
// Duck::getWeight is a type 3 method reference (instance method on a parameter).
// The equivalent lambda is: Comparator.comparing(duck -> duck.getWeight())
//
// Comparator.comparing() only needs you to tell it ONE thing:
// "given a single Duck, how do I get the value I want to compare by?"
// That is the Function<Duck, Integer> you pass in.
//
// Internally, comparing() does the rest:
//   1. call getWeight() on d1 --> get an Integer
//   2. call getWeight() on d2 --> get an Integer
//   3. compare those two Integers and return negative/0/positive
//
// So you never write the two-parameter compare(d1, d2) logic yourself --
// you just hand it the extraction function and it builds the Comparator for you.
```

`Comparator.comparing()` is a static interface method that creates a `Comparator` from
a lambda or method reference.

#### Comparable vs Comparator

| Difference                               | Comparable    | Comparator  |
| ---------------------------------------- | ------------- | ----------- |
| Package                                  | `java.lang`   | `java.util` |
| Implemented by the class being compared? | Yes           | No          |
| Method name                              | `compareTo()` | `compare()` |
| Number of parameters                     | 1             | 2           |
| Common to declare with a lambda?         | No            | Yes         |

`Comparable` is imported automatically (`java.lang`). `Comparator` requires an explicit
import (`java.util`).

`Comparable` takes 1 parameter because it is implemented inside the class -- `this` is
already one of the two objects being compared, so only the other object needs to be passed
in. `Comparator` takes 2 parameters because it is defined outside the class -- it has no
`this`, so both objects must be provided explicitly:

```java
// Comparable -- this is duck1, d is duck2
public int compareTo(Duck d) {
    return this.name.compareTo(d.name);
}

// Comparator -- external, no 'this', both ducks passed in
public int compare(Duck d1, Duck d2) {
    return d1.getWeight() - d2.getWeight();
}
```

Exam trap -- wrong method name:

```java
var byWeight = new Comparator<Duck>() { // DOES NOT COMPILE
    public int compareTo(Duck d1, Duck d2) { // wrong -- should be compare()
        return d1.getWeight() - d2.getWeight();
    }
};
```

#### Comparing Multiple Fields

Chain `Comparator` methods to sort by multiple fields:

```java
// manual approach
public class MultiFieldComparator implements Comparator<Squirrel> {
    public int compare(Squirrel s1, Squirrel s2) {
        int result = s1.getSpecies().compareTo(s2.getSpecies());
        if (result != 0) return result;
        return s1.getWeight() - s2.getWeight();
    }
}

// cleaner approach using method chaining
Comparator<Squirrel> c = Comparator.comparing(Squirrel::getSpecies)
    .thenComparingInt(Squirrel::getWeight);
 
// descending order
var c = Comparator.comparing(Squirrel::getSpecies).reversed();
```

`comparing()` is a **static** method -- called on the `Comparator` interface itself, returns
a new `Comparator` object. `thenComparingInt()` and `reversed()` are **default instance
methods** -- called on the `Comparator` object that `comparing()` returned:

```java
Comparator.comparing(Squirrel::getSpecies) // static call -- produces a Comparator object
    .thenComparingInt(Squirrel::getWeight); // instance call on that object
```

`comparing()` expects a `Function<T, R>` -- something that takes one object and returns
the value to compare by. `Squirrel::getSpecies` is a type 3 method reference and satisfies
`Function<Squirrel, String>` exactly -- `T` is `Squirrel` (the instance the method is called
on), `R` is `String` (what `getSpecies()` returns). The equivalent lambda is
`s -> s.getSpecies()`.

`thenComparingInt()` expects a `ToIntFunction<T>` -- same idea but returns a primitive
`int` directly to avoid boxing. `Squirrel::getWeight` fits because `getWeight()` returns
an `int`.

Helper default methods for chaining a `Comparator`:

| Method                          | Description                                                     |
| ------------------------------- | --------------------------------------------------------------- |
| `reversed()`                    | Reverses the order of the current comparator                    |
| `thenComparing(function)`       | If previous comparator returns 0, use this one (returns Object) |
| `thenComparingDouble(function)` | Same, for `double` return type                                  |
| `thenComparingInt(function)`    | Same, for `int` return type                                     |
| `thenComparingLong(function)`   | Same, for `long` return type                                    |

**`reversed()` placement matters -- exam trap**

`reversed()` only flips what has been chained before it. Anything chained after it is
fresh and unaffected.

For all three cases, assume these four squirrels (species, weight, age):

```java
Squirrel a = new Squirrel("grey", 3, 10);
Squirrel b = new Squirrel("grey", 7, 5);
Squirrel c = new Squirrel("red",  3, 10);
Squirrel d = new Squirrel("red",  7, 5);
// unsorted input order: [a, b, c, d]
```

---

**Case 1: `reversed()` between two comparisons**

```java
Comparator.comparing(Squirrel::getSpecies)   // species A-Z ...
    .reversed()                               // ... flipped to Z-A
    .thenComparingInt(Squirrel::getWeight);   // weight ascending (unaffected by reversed)
```

- species Z-A: "red" before "grey"
- within "red": weight ascending -- c(3) before d(7)
- within "grey": weight ascending -- a(3) before b(7)
- Result: [c, d, a, b]

---

**Case 2: `reversed()` at the end**

```java
Comparator.comparing(Squirrel::getSpecies)
    .thenComparingInt(Squirrel::getWeight)
    .reversed();                              // flips EVERYTHING -- both species and weight go descending
```

- species Z-A: "red" before "grey"
- within "red": weight descending -- d(7) before c(3)
- within "grey": weight descending -- b(7) before a(3)
- Result: [d, c, b, a]

---

**Case 3: `reversed()` at the end, then another `thenComparing`**

```java
Comparator.comparing(Squirrel::getSpecies)
    .thenComparingInt(Squirrel::getWeight)
    .reversed()                              // flips species and weight (both descending)
    .thenComparingInt(Squirrel::getAge);     // age ascending -- fresh, unaffected by reversed
```

To make age visible, use squirrels that share the same species AND weight:

```java
Squirrel a = new Squirrel("red", 5, 8);   // age 8
Squirrel b = new Squirrel("red", 5, 2);   // age 2  -- same species+weight as a, age differs
Squirrel c = new Squirrel("grey", 3, 6);
Squirrel d = new Squirrel("grey", 3, 1);  // same species+weight as c, age differs
```

- species Z-A: "red" before "grey"
- within "red": weight descending -- a and b tied (both weight 5), move to age
- age ascending (fresh after reversed): b(age 2) before a(age 8)
- within "grey": weight descending -- c and d tied (both weight 3), move to age
- age ascending: d(age 1) before c(age 6)
- Result: [b, a, d, c]

Key point: if `reversed()` had also flipped age, the result would have been [a, b, c, d]
(age descending). It doesn't -- age sorts ascending because it was chained after `reversed()`.



```java
Squirrel s1 = new Squirrel("red",  "Acorn", 3, 0.4, 101L);
Squirrel s2 = new Squirrel("red",  "Acorn", 5, 0.6, 102L);
Squirrel s3 = new Squirrel("red",  "Beech", 3, 0.4, 103L);
Squirrel s4 = new Squirrel("grey", "Acorn", 3, 0.4, 104L);
List<Squirrel> squirrels = List.of(s1, s2, s3, s4);

Comparator<Squirrel> c = Comparator.comparing(Squirrel::getSpecies)  // 1. sort by species A-Z
    .reversed()                                                        // 2. flip -> Z-A, "red" before "grey"
    .thenComparing(Squirrel::getName)                                  // 3. tie on species? sort by name A-Z
    .thenComparingInt(Squirrel::getAge)                                // 4. tie on name? sort by age asc
    .thenComparingDouble(Squirrel::getSize)                            // 5. tie on age? sort by size asc
    .thenComparingLong(Squirrel::getId);                               // 6. tie on size? sort by id asc

squirrels.sort(c);
```

The chain works like a tiebreaker system. Step 1 is always checked. Each next step only
kicks in if the previous returned 0 (a tie). If any step produces a clear winner, the
remaining steps are skipped for that pair.

Step by step with the data above:

**Step 1 -- `comparing(getSpecies)` + `reversed()`**
Without reversed: grey < red (A-Z), s4 would come first.
With reversed: red < grey (Z-A), so s1, s2, s3 (all "red") come before s4 ("grey").
s4 is placed last. s1, s2, s3 are all "red" -- tied, move to step 2.

**Step 2 -- `thenComparing(getName)`**
s1=Acorn, s2=Acorn, s3=Beech.
Acorn < Beech, so s3 goes after s1 and s2. s1 and s2 still tied -- move to step 3.

**Step 3 -- `thenComparingInt(getAge)`**
s1=age 3, s2=age 5. 3 < 5, so s1 comes before s2. Tie broken.

**Final order: s1, s2, s3, s4.**


---

### Sorting and Searching

`Collections.sort()` uses `compareTo()` internally -- it expects the objects to be
`Comparable`. If the class does not implement `Comparable`, it does not compile:

```java
static record Rabbit(int id) {}
List<Rabbit> rabbits = new ArrayList<>();
rabbits.add(new Rabbit(3));
rabbits.add(new Rabbit(1));
Collections.sort(rabbits); // DOES NOT COMPILE -- Rabbit is not Comparable
```

Fix it by passing a `Comparator`:

```java
Comparator<Rabbit> c = (r1, r2) -> r1.id - r2.id;
Collections.sort(rabbits, c);
System.out.println(rabbits); // [Rabbit[id=1], Rabbit[id=3]]
```

To sort descending, either flip the comparator (`r2.id - r1.id`) or reverse afterward:

```java
Collections.sort(rabbits, c);
Collections.reverse(rabbits);
System.out.println(rabbits); // [Rabbit[id=3], Rabbit[id=1]]
```

You can also sort directly on the list object instead of using `Collections.sort()`.
`List.sort()` is an instance method on `List` itself -- `Collections.sort()` is a static
utility method. Both sort in place and return void, just called differently:

```java
Collections.sort(bunnies, c); // static -- pass the list as argument
bunnies.sort(c);              // instance -- called on the list directly
```

`list.sort()` expects a `Comparator<T>` -- the same two-parameter comparison logic you
already know. Internally it uses that comparator to repeatedly compare pairs of elements
and reorder them until the list is fully sorted. If you pass `null` instead of a comparator,
it falls back to the natural order (same as `Collections.sort(list)` with no comparator --
requires elements to be `Comparable`).

```java
List<String> bunnies = new ArrayList<>();
bunnies.add("long ear");
bunnies.add("floppy");
bunnies.add("hoppy");
bunnies.sort((b1, b2) -> b1.compareTo(b2)); // sorts alphabetically using String's natural order
System.out.println(bunnies); // [floppy, hoppy, long ear]
// equivalent: bunnies.sort(Comparator.naturalOrder());
// equivalent: bunnies.sort(null); // null = use natural order
```

There is no `sort()` method on `Set` or `Map` -- both are unordered.

#### binarySearch()

`binarySearch()` requires a sorted list. It returns the index of the match if found, or a
negative value if not found. The negative value is: `-(insertion point) - 1`.

```java
List<Integer> list = Arrays.asList(6, 9, 1, 8);
Collections.sort(list);                              // [1, 6, 8, 9]
System.out.println(Collections.binarySearch(list, 6)); // 1  - found at index 1
System.out.println(Collections.binarySearch(list, 3)); // -2 - not found
// 3 would be inserted at index 1 --> negate: -1 --> subtract 1: -2
```

If you call `binarySearch()` on a list that is not sorted in the same order as the
comparator you pass, the result is undefined. `binarySearch()` works by jumping to the
middle of the list and deciding whether to look left or right based on the comparator. It
trusts that the list is already sorted in the same order you pass. If it isn't, the jumps go
in the wrong direction and you get a nonsense result:

```java
var names = Arrays.asList("Fluffy", "Hoppy"); // actual order: ascending
Comparator<String> c = Comparator.reverseOrder(); // expects: descending
var index = Collections.binarySearch(names, "Hoppy", c); // undefined - mismatch
```

The rule: the list must be sorted using the same comparator you pass to `binarySearch()`.

```java
// WRONG -- list is ascending, comparator says descending
Collections.binarySearch(names, "Hoppy", Comparator.reverseOrder()); // undefined

// CORRECT -- sort and search with no comparator (natural order)
Collections.sort(names);
Collections.binarySearch(names, "Hoppy"); // reliable

// CORRECT -- sort and search with the same comparator
Collections.sort(names, Comparator.reverseOrder());
Collections.binarySearch(names, "Hoppy", Comparator.reverseOrder()); // reliable
```

No comparator passed to `binarySearch()` means natural ascending order is assumed. Passing
`Comparator.naturalOrder()` explicitly is equivalent -- both expect the same ordering.

`Comparator.naturalOrder()` and `Comparator.reverseOrder()` are static methods that return
ready-made comparators:

```java
Comparator.naturalOrder()  // A-Z, 1-2-3 -- same as the default sort order
Comparator.reverseOrder()  // Z-A, 3-2-1

list.sort(Comparator.naturalOrder());
list.sort(Comparator.reverseOrder());
```

Do not confuse `Comparator.reverseOrder()` with `.reversed()` -- they are different:

| | What it is | What it does |
|---|---|---|
| `Comparator.reverseOrder()` | static method | returns a brand new descending comparator |
| `.reversed()` | instance method | flips an existing comparator you already built |

#### TreeSet and Comparable

Unlike sorting, `TreeSet` does not check for `Comparable` at compile time. It throws a
`ClassCastException` at runtime when it tries to sort the first element added:

```java
Set<Rabbit> rabbits = new TreeSet<>();
rabbits.add(new Rabbit()); // ClassCastException -- Rabbit does not implement Comparable
```

Fix it by passing a `Comparator` to the `TreeSet` constructor:

```java
Set<Rabbit> rabbits = new TreeSet<>((r1, r2) -> r1.id - r2.id);
rabbits.add(new Rabbit()); // fine -- Java knows how to sort by id
```

The `TreeSet` constructor accepts any `Comparator` instance -- a lambda, an anonymous
class, or a plain object that implements `Comparator`. If you pass a regular object that
implements `Comparator`, the `TreeSet` will call its `compare()` method to sort.

A class can implement both `Comparable` and `Comparator` at the same time. When used as a
plain `TreeSet` (no constructor argument), Java uses `Comparable` via `compareTo()`. When
the object is passed into the `TreeSet` constructor, Java uses `Comparator` via `compare()`:

```java
public record Sorted(int num, String text)
        implements Comparable<Sorted>, Comparator<Sorted> {

    public int compareTo(Sorted s) { return text.compareTo(s.text); } // sorts by text
    public int compare(Sorted s1, Sorted s2) { return s1.num - s2.num; } // sorts by num

    public static void main(String[] args) {
        var s1 = new Sorted(88, "a");
        var s2 = new Sorted(55, "b");

        var t1 = new TreeSet<Sorted>();   // no comparator -- uses compareTo() --> sorts by text
        t1.add(s1); t1.add(s2);          // "a" < "b", so s1(88) before s2(55): [88, 55]

        var t2 = new TreeSet<Sorted>(s1); // s1 passed as Comparator -- uses compare() --> sorts by num
        t2.add(s1); t2.add(s2);           // 55 < 88, so s2(55) before s1(88): [55, 88]

        System.out.println(t1 + " " + t2); // [88, 55] [55, 88]
    }
}
```

---

### Working with Generics

Generics allow you to write parameterized types. Without them, a raw list can contain
anything, and the compiler cannot catch type mismatches -- you get a `ClassCastException`
at runtime instead:

```java
static void printNames(List list) {
    for (int i = 0; i < list.size(); i++) {
        String name = (String) list.get(i); // ClassCastException if element is not a String
    }
}
List names = new ArrayList();
names.add(new StringBuilder("Webby")); // legal - raw list accepts anything
printNames(names); // ClassCastException at runtime
```

With generics, the compiler catches the problem early:

```java
List<String> names = new ArrayList<>();
names.add(new StringBuilder("Webby")); // DOES NOT COMPILE
```

#### Creating Generic Classes

Declare a formal type parameter in angle brackets after the class name. `T` is available
anywhere within the class:

```java
public class Crate<T> {
    private T contents;
    public T lookInCrate() { return contents; }
    public void packCrate(T contents) { this.contents = contents; }
}
```

When you instantiate the class, you tell the compiler what `T` should be:

```java
Crate<Elephant> crateForElephant = new Crate<>();
crateForElephant.packCrate(elephant);
Elephant inNewHome = crateForElephant.lookInCrate();

Crate<Robot> robotCrate = new Crate<>(); // same class, different type
```

Multiple type parameters are allowed:

```java
public class SizeLimitedCrate<T, U> {
    private T contents;
    private U sizeLimit;
    public SizeLimitedCrate(T contents, U sizeLimit) {
        this.contents = contents;
        this.sizeLimit = sizeLimit;
    }
}
SizeLimitedCrate<Elephant, Integer> c1 = new SizeLimitedCrate<>(elephant, 15_000);
```

#### Naming Conventions for Generics

| Letter | Meaning |
|---|---|
| `E` | element |
| `K` | map key |
| `V` | map value |
| `N` | number |
| `T` | generic data type |
| `S`, `U`, `V` | multiple generic types |

#### Understanding Type Erasure

At compile time, the compiler replaces all references to the generic type `T` with its
**bound**. If the type parameter is unbounded (`T`), it becomes `Object`. If it is bounded
(`T extends Animal`), it becomes the bound type (`Animal`). It is not always `Object` --
only when there is no bound specified.

```java
// unbounded -- T becomes Object
public class Box<T> {
    private T value; // becomes: private Object value
}

// bounded -- T becomes Animal, not Object
public class Cage<T extends Animal> {
    private T animal; // becomes: private Animal animal
}
```

This means there is only one class file at runtime -- not separate copies for each
parameterized type. This process is called **type erasure**. Type erasure allows your code
to be compatible with older versions of Java that do not contain generics.

The compiler also adds the necessary casts automatically:

```java
// you write
Robot r = crate.lookInCrate();

// compiler produces
Robot r = (Robot) crate.lookInCrate();
```

#### Overloading a Generic Method

Type erasure means you cannot overload a method by changing only the generic parameter
type. After erasure, the generic parameter is stripped and only the raw type remains. If two
methods in the same class produce the same erased signature, it is a compile error -- even
if the generic parameters look different:

```java
// INVALID -- both erase to chew(List)
public void chew(List<Object> input) {}
public void chew(List<Double> input) {} // DOES NOT COMPILE

// INVALID -- both erase to process(Map)
public void process(Map<String, Integer> map) {}
public void process(Map<Integer, String> map) {} // DOES NOT COMPILE

// INVALID -- both erase to process(Object)
public <T> void process(T input) {}
public <U> void process(U input) {} // DOES NOT COMPILE
```

This applies across parent and subclass too:

```java
public class LongTailAnimal {
    protected void chew(List<Object> input) {}
}
public class Anteater extends LongTailAnimal {
    protected void chew(List<Double> input) {} // DOES NOT COMPILE -- same after erasure
}
```

This fails because the method is neither a valid override nor a valid overload:
- For an override, the signature must match exactly. `List<Object>` and `List<Double>` are
  different, so it is not an override.
- For a valid overload, the signatures must be distinguishable after erasure. Both erase to
  `List`, so the compiler sees two `chew(List)` methods in the same hierarchy, which is
  not allowed.

A true override compiles fine:

```java
public class Anteater extends LongTailAnimal {
    protected void chew(List<Object> input) {} // OK -- signatures match exactly, valid override
}
```

An overload across parent and subclass works when the raw types differ after erasure:

```java
public class Anteater extends LongTailAnimal {
    protected void chew(String input) {} // OK -- erases to chew(String), different raw type
}
```

Valid overloads are ones where the raw types differ after erasure:

```java
// VALID -- List and ArrayList are different raw types
public void process(List<String> list) {}
public void process(ArrayList<Integer> list) {} // compiles

// VALID -- one is generic, one is a plain type
public void process(List<String> list) {}
public void process(String input) {} // compiles
```

The rule: strip all generic parameters and look at what remains. If two methods in the
same class have the same name and the same raw parameter types after erasure, it is a
compile error regardless of what the generic parameters were.

This problem only arises when the only difference between two signatures lives inside the
`<>`. Concrete types are never erased, so overloading with them works normally:

```java
// VALID -- String and Integer are concrete types, nothing to erase
void run(String input) {}
void run(Integer input) {} // compiles fine

// INVALID -- only difference is inside <>, erased away
void run(List<String> input) {}
void run(List<Integer> input) {} // DOES NOT COMPILE -- both become run(List)
```

#### Returning Generic Types

When overriding a method that returns a generic type, the return type must be covariant
(subtype of the parent's return type), but **the generic parameter type must match exactly**:

```java
public class Mammal {
    public List<CharSequence> play() { ... }
    public CharSequence sleep() { ... }
}
public class Monkey extends Mammal {
    public ArrayList<CharSequence> play() { ... } // OK - ArrayList is subtype of List
}
public class Goat extends Mammal {
    public List<String> play() { ... }  // DOES NOT COMPILE - String != CharSequence as generic param
    public String sleep() { ... }       // OK - String is subtype of CharSequence
}
```

The `play()` in `Goat` fails even though `String` is a subtype of `CharSequence` -- the
generic parameter must match exactly. The `sleep()` method is fine because covariance
applies normally to non-generic return types.

General rule:
- Non-generic return type -- covariance applies normally, subtype is fine.
- Generic return type -- the raw type (e.g. `List`) can be a subtype, but the type inside
  `<>` must match the parent's exactly. Covariance does not apply inside the angle brackets.

#### Implementing Generic Interfaces

Three ways a class can implement a generic interface:

```java
public interface Shippable<T> {
    void ship(T t);
}

// 1. Specify the type -- class locks in the type
class ShippableRobotCrate implements Shippable<Robot> {
    public void ship(Robot t) { }
}

// 2. Keep it generic -- caller decides the type
class ShippableAbstractCrate<U> implements Shippable<U> {
    public void ship(U t) { }
}

// 3. Raw type -- no generics, old style, generates compiler warning
class ShippableCrate implements Shippable {
    public void ship(Object t) { }
}
```

#### Writing Generic Methods

Generic type parameters can be declared at the method level, not just the class level.
Declare the formal type parameter immediately before the return type. The `<T>` before
the return type is the declaration -- `Crate<T>` and `T t` are just usages of that declared
type. Without the declaration, the compiler does not know what `T` is:

```java
public static <T> Crate<T> ship(T t) { ... }
//             ^        ^      ^
//             |        |      parameter -- uses T
//             |        return type -- uses T
//             declares T exists for this method

public static Crate<T> ship(T t) { ... } // DOES NOT COMPILE -- T never declared
```

Same pattern as a class: `class Crate<T>` declares `T`, everything inside uses it. For a
method, the declaration moves to right before the return type.

```java
public class Handler {
    public static <T> void prepare(T t) {
        System.out.println("Preparing " + t);
    }
    public static <T> Crate<T> ship(T t) {
        System.out.println("Shipping " + t);
        return new Crate<T>();
    }
}
```

Omitting the formal parameter declaration is a compile error:

```java
public static <T> void sink(T t) { }     // OK
public static <T> T identity(T t) { return t; } // OK
public static T noGood(T t) { return t; } // DOES NOT COMPILE -- <T> missing before return type
```

A method-level generic type is independent of the class-level generic type, even if they
share the same letter:

```java
public class TrickyCrate<T> {          // T here is set at instantiation (e.g. Robot)
    public <T> T tricky(T t) {         // T here is set at the method call (e.g. String)
        return t;
    }
}
TrickyCrate<Robot> crate = new TrickyCrate<>();
crate.tricky("bot"); // class T = Robot, method T = String -- independent
```

#### Creating a Generic Record

Records support generics the same way classes do:

```java
public record CrateRecord<T>(T contents) {
    @Override
    public T contents() {
        if (contents == null)
            throw new IllegalStateException("missing contents");
        return contents;
    }
}
CrateRecord<Robot> record = new CrateRecord<>(new Robot());
```

#### What You Can't Do with Generic Types

These limitations exist because of type erasure -- at runtime, `T` is just `Object`:

- `new T()` -- not allowed, would become `new Object()`
- `new T[]` -- not allowed, would create an `Object[]`
- `instanceof T` -- not allowed, `List<Integer>` and `List<String>` look the same at runtime
- primitive type as generic parameter -- use the wrapper class instead (`Integer` not `int`)
- static variable of generic type -- not allowed, type is linked to the instance

#### Bounding Generic Types

A **wildcard** (`?`) represents an unknown generic type. To understand why wildcards
exist, start with what you already know about normal types:

```java
// Normal types -- subtype assignment works fine
Number n = new Integer(42); // OK -- Integer IS-A Number
Number n = new Double(3.14); // OK -- Double IS-A Number
```

You would expect the same to work with generics. It does not:

```java
// Generic types -- subtype assignment does NOT work
List<Number> list = new ArrayList<Integer>(); // DOES NOT COMPILE
```

`List<Integer>` is NOT a subtype of `List<Number>` even though `Integer` is a subtype
of `Number`. Java enforces this to protect type safety. Here is why:

```java
List<Integer> ints = new ArrayList<>();
ints.add(42);

List<Number> nums = ints;  // imagine this compiled -- ints and nums point to same object
nums.add(3.14);            // Double is a Number, compiler would allow this
Integer x = ints.get(1);  // ClassCastException -- 3.14 is not an Integer
```

If `List<Integer>` were a subtype of `List<Number>`, you could add a `Double` through
the `nums` reference into a list that was promised to hold only `Integer` values. Java
blocks the assignment entirely to prevent this.

This creates a real problem when writing methods. Suppose you want a method that
sums any list of numbers:

```java
// Too restrictive -- only accepts List<Number> exactly
// Refuses List<Integer> and List<Double> even though they only contain Numbers
public static long total(List<Number> list) { ... }

List<Integer> ints = List.of(1, 2, 3);
total(ints); // DOES NOT COMPILE
```

Wildcards solve this. `?` means "some type I don't need to know exactly":

```java
// Accepts List<Number>, List<Integer>, List<Double> -- anything that IS-A Number
public static long total(List<? extends Number> list) {
    long count = 0;
    for (Number number : list)
        count += number.longValue();
    return count;
}

List<Integer> ints = List.of(1, 2, 3);
total(ints); // compiles and works fine
```

The `? extends Number` wildcard tells Java: "I don't care exactly which type this list
holds, as long as that type extends Number." This is safe because you are only reading
from the list -- you never add anything.

Think about why adding would be a problem. If you have `List<? extends Number>`, Java
does not know whether it is actually a `List<Integer>`, a `List<Double>`, or a
`List<Number>`. All three satisfy the wildcard. Now if Java allowed you to add:

```java
List<? extends Number> list = new ArrayList<Integer>(); // valid assignment
list.add(3.14); // what if Java allowed this?
// but the actual list is ArrayList<Integer>
// 3.14 is a Double, not an Integer -- type safety broken
```

Java cannot know at compile time which specific type is behind the wildcard, so it forbids
all adds entirely. It is safer to allow nothing than to risk adding the wrong type.

Reading is always safe though -- whatever the actual type is, you know it extends
`Number`. So you can always read the elements out as `Number` references:

```java
for (Number number : list) // always safe -- the element IS-A Number regardless of actual type
    count += number.longValue();
```

The write restriction is enforced at **compile time**, not runtime. The compiler knows
from the wildcard type whether writing is permitted -- it does not wait until runtime:

```java
List<? extends Number> list = new ArrayList<Integer>();
list.add(42);   // DOES NOT COMPILE -- compiler blocks it instantly
list.add(null); // compiles -- null is the only exception
```

The rules are fixed:
- `List<?>` -- all `add()` calls blocked except `add(null)`
- `List<? extends X>` -- all `add()` calls blocked except `add(null)`
- `List<? super X>` -- `add(X)` and subtypes of X allowed, anything wider is blocked

| Type                   | Syntax           | Example                                                           |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| Unbounded wildcard     | `?`              | `List<?> a = new ArrayList<String>()`                             |
| Upper bounded wildcard | `? extends type` | `List<? extends Exception> a = new ArrayList<RuntimeException>()` |
| Lower bounded wildcard | `? super type`   | `List<? super Exception> a = new ArrayList<Object>()`             |

Memory trick -- **PECS: Producer Extends, Consumer Super**. If the list produces values
for you to read, use `extends`. If the list consumes values you add to it, use `super`.

---

#### Creating Unbounded Wildcards

`List<?>` means a list of any type. Use it when you only need to read elements as
`Object` and do not need to add anything.

`List<String>` cannot be passed to a method that expects `List<Object>` -- even though
`String` extends `Object`. Java prevents this to protect type safety:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(42);
List<Object> objects = numbers; // DOES NOT COMPILE
objects.add("forty two");       // would break the Integer promise on numbers
```

The fix is `List<?>` -- accepts any list:

```java
public static void printList(List<?> list) {
    for (Object x : list)
        System.out.println(x);
}
List<String> keywords = new ArrayList<>();
keywords.add("java");
printList(keywords); // compiles fine
```

`List<?>` vs `var`:

```java
List<?> x1 = new ArrayList<>();  // type is List, get() returns Object
var x2     = new ArrayList<>();   // type is ArrayList<Object>, can only assign to List<Object>
```

`List<?>` vs `List<T>`: they are different things used in different contexts.

`List<T>` with a named type parameter is used when you need to **refer to that type
again** -- in the return type, another parameter, or the method body:

```java
// T is used in both the parameter and the return type -- needs a name
public static <T> T first(List<T> list) {
    return list.get(0); // can only say "return T" because we gave it a name
}
```

`List<?>` is used when you **do not need to refer to the type at all** -- you accept any
list and only care about reading elements as `Object`:

```java
// never use the type again inside the method -- no name needed
public static void printList(List<?> list) {
    for (Object x : list)
        System.out.println(x);
}
```

You could write `printList` with `<T>` instead and it would also compile. But `?` signals
"I don't care what the type is, I'm not using it." Using `<T>` when you never refer to `T`
again is unnecessary noise. `?` is essentially a shorthand for declaring `<T>` but never
using it.

---

#### Creating Upper-Bounded Wildcards

`? extends Type` means the list holds `Type` or any subtype of `Type`. Use when you
need to read from the list as `Type`:

```java
public static long total(List<? extends Number> list) {
    long count = 0;
    for (Number number : list)
        count += number.longValue();
    return count;
}
// accepts: List<Number>, List<Integer>, List<Double>
```

The trade-off: the list becomes logically immutable -- you cannot add anything. Java
does not know the actual type at runtime (could be `List<Integer>` or `List<Double>`),
so adding anything is forbidden:

```java
List<? extends Bird> birds = new ArrayList<Bird>();
birds.add(new Sparrow()); // DOES NOT COMPILE
birds.add(new Bird());    // DOES NOT COMPILE
```

Note: upper bounds use `extends` regardless of whether the bound is a class or an
interface -- never `implements`:

```java
private void groupOfFlyers(List<? extends Flyer> flyer) {} // Flyer is an interface, still extends
```

---

#### Creating Lower-Bounded Wildcards

`? super Type` means the list holds `Type` or any supertype of `Type`. Use when you
need to add elements of `Type` to the list:

```java
public static void addSound(List<? super String> list) {
    list.add("quack"); // safe -- String fits into List<String>, List<Object>, etc.
}
List<String> strings = new ArrayList<>();
List<Object> objects = new ArrayList<>();
addSound(strings); // accepts -- String is lower bound
addSound(objects); // accepts -- Object is supertype of String
```

Why `List<?>` and `List<? extends Object>` don't work here:

| Parameter type | Method compiles | Accepts `List<String>` | Accepts `List<Object>` |
|---|---|---|---|
| `List<?>` | No -- unbounded wildcards are immutable | Yes | Yes |
| `List<? extends Object>` | No -- upper-bounded wildcards are immutable | Yes | Yes |
| `List<Object>` | Yes | No -- must be exact match | Yes |
| `List<? super String>` | Yes | Yes | Yes |

Lower bounds let you add, but reading is restricted to `Object` -- you only know the
element is at minimum a supertype of `String`, which could be anything.

#### Understanding Generic Supertypes

With lower bounds, subtypes of the bound are also accepted when adding:

```java
List<? super IOException> exceptions = new ArrayList<Exception>();
exceptions.add(new Exception());             // DOES NOT COMPILE -- could be List<IOException>
exceptions.add(new IOException());           // fine -- fits in all possible types
exceptions.add(new FileNotFoundException()); // fine -- FileNotFoundException IS an IOException
```

`List<? super IOException>` means the actual list could be any of:
- `List<IOException>`
- `List<Exception>`
- `List<Object>`

When you add, the element must fit into **all three** possibilities -- because Java does not
know which one it actually is at compile time.

`Exception` does not fit into `List<IOException>` -- `Exception` is a supertype, too wide.
So line 1 fails.

`IOException` fits into all three -- it IS an `IOException`, it IS an `Exception`, it IS an
`Object`. So line 2 works.

`FileNotFoundException` also fits into all three -- it is a subtype of `IOException`, so it
satisfies every possible type the wildcard could represent. So line 3 works.

The rule for adding to `List<? super X>`: you can only safely add `X` or subtypes of `X`.
Supertypes of `X` are not guaranteed to fit -- they might be too wide for the narrowest
possibility (`List<X>` itself).

---

#### Combining Generic Declarations

```java
class A {}
class B extends A {}
class C extends B {}

List<?> list1 = new ArrayList<A>();           // OK -- unbounded accepts any type
List<? extends A> list2 = new ArrayList<A>(); // OK -- A satisfies ? extends A
List<? super A> list3 = new ArrayList<A>();   // OK -- A is the lower bound itself

List<? extends B> list4 = new ArrayList<A>(); // DOES NOT COMPILE -- A is not B or subtype of B
List<? super B> list5 = new ArrayList<A>();   // OK -- A is supertype of B
List<?> list6 = new ArrayList<? extends A>(); // DOES NOT COMPILE -- can't use wildcard when instantiating
```

---

#### Passing Generic Arguments

```java
// valid -- T is declared, parameter is list of T or subtype, returns T
<T> T first(List<? extends T> list) {
    return list.get(0);
}
```
Declares method-level type `T`. The parameter accepts a list of `T` or any subtype.
Returns one element as `T`. Call it with `List<String>` and `T` becomes `String`.

```java
// DOES NOT COMPILE -- wildcard is not a valid return type
<T> <? extends T> second(List<? extends T> list) {
    return list.get(0);
}
```
`<? extends T>` is written as the return type. A wildcard is not a type -- it is a
constraint on a parameter. You cannot return "some unknown type that extends T" because
the caller would not know what they are receiving. Return types must be concrete. Should
be `<T> T second(...)`.

```java
// DOES NOT COMPILE -- B here is a type parameter, not the class B
<B extends A> B third(List<B> list) {
    return new B();
}
```
`<B extends A>` declares a method-level type parameter named `B` that must extend `A`.
This shadows the class `B` that exists outside the method. Inside here, `B` no longer means
the class -- it means "some unknown type that extends A, resolved at call time." You cannot
call `new B()` because Java does not know the exact type at compile time. Same reason you
cannot do `new T()` -- there is no constructor to call for an unknown type.

```java
// valid -- accepts List<B>, List<A>, or List<Object>
void fourth(List<? super B> list) {}
```
Straightforward lower-bounded wildcard. Nothing unusual.

```java
// DOES NOT COMPILE -- super/extends in wildcards must always use ?, not a named type parameter
<X> void fifth(List<X super B> list) {}
```
`X super B` is not valid syntax. `super` and `extends` in wildcard position must always
be written with `?` on the left: `? super B`. A named type parameter (`X`) cannot be used
in place of `?` in a wildcard.


---

#### Where `extends` and `super` can appear

| Context | Syntax | `extends` | `super` | Named type (`T`, `X`) | Wildcard (`?`) |
|---|---|---|---|---|---|
| Type parameter declaration | `<T extends Foo>` | yes | no | yes (required) | no |
| Wildcard bound | `? extends Foo` / `? super Foo` | yes | yes | no | yes (required) |

The two contexts look similar but are governed by completely separate grammar rules.

**Type parameter declaration** (`<T extends Foo>`) -- appears in the angle brackets of a
method signature or class definition. Declares a new named type variable. Only `extends`
is allowed here; `super` is not legal in a type parameter declaration. The name (`T`, `B`,
`X`) is required because you need to refer to it later in the signature or body.

**Wildcard bound** (`? extends Foo` / `? super Foo`) -- appears inside a generic type
argument, e.g. `List<? extends Foo>`. `?` is required on the left; you cannot substitute a
named type parameter there. Both `extends` and `super` are legal. No name is introduced
-- the wildcard represents an unknown type you never refer to by name.

The confusion in `third()` vs `fifth()`:

- `<B extends A> B third(List<B> list)` -- the `<B extends A>` part is a type parameter
  declaration. `B` is the new name; `extends A` is its upper bound. Legal.
- `<X> void fifth(List<X super B> list)` -- `X` was already declared as a named type
  parameter. Writing `X super B` inside `List<...>` tries to use a named type in wildcard
  position, which is not valid syntax. The only legal forms inside `List<...>` are a concrete
  type (`List<B>`), a wildcard (`List<?>`), or a bounded wildcard (`List<? super B>`).


---

## Wildcard Validity -- Decision Model

Assume this hierarchy for all examples below:

```java
class Animal {}
class Bird extends Animal {}
class Sparrow extends Bird {}
```

---

### Rule 1 -- Wildcards are only legal in type arguments, never in `new` or type parameter declarations

A wildcard (`?`) can only appear inside the angle brackets of a variable type, method
parameter type, or return type. Two places where it is never allowed:

**Never in `new`:** when you instantiate a generic type, Java needs to know the exact
concrete type. A wildcard is not a type -- it is a constraint. You cannot allocate memory
for "some unknown type."

```java
List<? extends Animal> list = new ArrayList<Bird>();          // OK -- wildcard on the left only
List<? extends Animal> list = new ArrayList<? extends Bird>(); // DOES NOT COMPILE -- wildcard in new
```

**Never in a type parameter declaration:** a type parameter declaration is the `<T>` or
`<T extends Foo>` at the start of a method or class. Those must use a name, not `?`,
because you need to refer to the type again inside the method body or signature.

```java
<T extends Animal> T first(List<T> list) { return list.get(0); } // OK -- named T, used in return type
<? extends Animal> ? first(List<?> list) { return list.get(0); } // DOES NOT COMPILE -- ? in declaration
```

The pattern to remember: **`?` always appears inside `List<...>` (or any generic type
argument). It never appears in `new Foo<...>()` or in `<...>` at the start of a method.**

---

### Rule 2 -- Inside a type argument, only four forms are legal

| Form                   | Example                | Valid?                                             |
| ---------------------- | ---------------------- | -------------------------------------------------- |
| Concrete type          | `List<Bird>`           | yes                                                |
| Unbounded wildcard     | `List<?>`              | yes                                                |
| Upper-bounded wildcard | `List<? extends Bird>` | yes                                                |
| Lower-bounded wildcard | `List<? super Bird>`   | yes                                                |
| Named type with bound  | `List<T extends Bird>` | NO -- type parameter syntax, not valid here        |
| Named type with super  | `List<X super Bird>`   | NO -- `super` requires `?` on the left, not a name |

```java
void process(List<? extends Bird> list) {}  // OK
void process(List<T extends Bird> list) {}  // DOES NOT COMPILE -- T extends is declaration syntax
void process(List<X super Bird> list) {}    // DOES NOT COMPILE -- super requires ?, not a name
```

The `?` must always be on the left of `extends` or `super` when used inside a type
argument. A named type parameter (`T`, `X`, `B`) cannot appear there.

`T extends Bird` looks familiar because you have seen it -- but in a different position.
It is legal on a class name or at the start of a method signature (type parameter
declaration). It is not legal inside `List<...>`:

```java
// LEGAL -- T extends Bird is on the class name, declaring a type parameter for the whole class
public class Cage<T extends Bird> {
    private T animal;
}

// LEGAL -- T extends Bird is at the start of the method signature, then plain T goes inside List<>
<T extends Bird> void process(List<T> list) {}

// ILLEGAL -- T extends Bird is inside List<...>, which only accepts ?, a concrete type, or a plain T
void process(List<T extends Bird> list) {}  // DOES NOT COMPILE
```

The pattern: `<T extends Bird>` belongs on the **outside** (class or method declaration).
Inside `List<...>` you use either `?` with a bound (`? extends Bird`) or a plain name (`T`)
that was already declared outside.

---

### Rule 3 -- The concrete type on the right must satisfy the wildcard on the left

When assigning `List<wildcard> x = new ArrayList<Concrete>()`, the concrete type must
fit within the bounds of the wildcard.

**Unbounded `?` -- accepts any concrete type:**

```java
List<?> x = new ArrayList<Animal>();  // OK
List<?> x = new ArrayList<Bird>();    // OK
List<?> x = new ArrayList<String>();  // OK -- any type at all
```

**Upper-bounded `? extends Foo` -- concrete type must be `Foo` or a subtype of `Foo`:**

```java
List<? extends Animal> x = new ArrayList<Animal>();  // OK -- Animal itself
List<? extends Animal> x = new ArrayList<Bird>();    // OK -- Bird extends Animal
List<? extends Animal> x = new ArrayList<Sparrow>(); // OK -- Sparrow extends Bird extends Animal
List<? extends Animal> x = new ArrayList<Object>();  // DOES NOT COMPILE -- Object is not a subtype of Animal
List<? extends Bird>   x = new ArrayList<Animal>();  // DOES NOT COMPILE -- Animal is a supertype of Bird
```

**Lower-bounded `? super Foo` -- concrete type must be `Foo` or a supertype of `Foo`:**

```java
List<? super Bird> x = new ArrayList<Bird>();    // OK -- Bird itself
List<? super Bird> x = new ArrayList<Animal>();  // OK -- Animal is supertype of Bird
List<? super Bird> x = new ArrayList<Object>();  // OK -- Object is supertype of everything
List<? super Bird> x = new ArrayList<Sparrow>(); // DOES NOT COMPILE -- Sparrow is a subtype of Bird
```

A common trap -- `? super` and `? extends` feel backwards to many people. A memory anchor:
- `? extends Bird` means "Bird or something more specific" -- the list holds narrow types
- `? super Bird` means "Bird or something more general" -- the list holds wide types

---

### Rule 4 -- What you can read and write depends on the wildcard

**`List<?>` and `List<? extends Foo>` -- read-only, no adds**

Java does not know the exact type behind the wildcard at compile time. A
`List<? extends Animal>` could actually be a `List<Bird>` or a `List<Sparrow>`. If Java
let you add a `Bird` and it turned out to be a `List<Sparrow>`, type safety would break.
So Java forbids all adds. The only exception is `null` because null has no type.

```java
List<? extends Animal> list = new ArrayList<Bird>();
list.add(new Bird());    // DOES NOT COMPILE -- could be a List<Sparrow>, Bird would not fit
list.add(new Animal());  // DOES NOT COMPILE -- same reason
list.add(null);          // OK -- null is always safe

Animal a = list.get(0);  // OK -- whatever the actual type is, it IS-A Animal
```

**`List<? super Foo>` -- can add `Foo` and subtypes, reads only as `Object`**

A `List<? super Bird>` could be a `List<Bird>`, `List<Animal>`, or `List<Object>`. Any
element you add must fit into all three possibilities. `Bird` fits into all three (it IS-A
Bird, IS-A Animal, IS-A Object). `Sparrow` also fits (it IS-A Bird). But `Animal` does not
fit -- if the actual list is a `List<Bird>`, an `Animal` is too wide.

Reading is restricted to `Object` because that is the only type guaranteed to cover all
possibilities -- you don't know if you're reading from a `List<Bird>` or a `List<Object>`.

```java
List<? super Bird> list = new ArrayList<Animal>();
list.add(new Bird());    // OK -- Bird satisfies ? super Bird
list.add(new Sparrow()); // OK -- Sparrow is a subtype of Bird
list.add(new Animal());  // DOES NOT COMPILE -- Animal is wider than Bird

Object o = list.get(0);  // OK -- can only read as Object
Animal a = list.get(0);  // DOES NOT COMPILE -- compiler only knows it's Object
```

Summary table:

| Wildcard | Add? | Read as? |
|---|---|---|
| `?` | null only | `Object` |
| `? extends Foo` | null only | `Foo` |
| `? super Foo` | `Foo` and subtypes of `Foo` | `Object` only |

---

### Rule 5 -- Always `extends` in bounds, never `implements`, never `super` in type parameter declarations

In both wildcard bounds and type parameter declarations, the keyword is always `extends`
even when the bound is an interface. `implements` is never valid in any generic context.

```java
List<? extends Comparable<String>> list  // OK -- Comparable is an interface, still uses extends
List<? implements Comparable<String>> list // DOES NOT COMPILE -- implements is never valid here

<T extends Serializable> void foo(List<T> list) {} // OK -- interface bound in type parameter
<T implements Serializable> void foo(List<T> list) {} // DOES NOT COMPILE
```

`super` is only valid in a wildcard bound -- never in a type parameter declaration:

```java
<T extends Animal> void foo(List<T> list) {} // OK
<T super Animal>   void foo(List<T> list) {} // DOES NOT COMPILE -- super not allowed in type parameter
void foo(List<? super Animal> list) {}        // OK -- super is fine in a wildcard bound
```

---

### Practice questions

Work out each one before reading the answer.

**Q1.** Does this compile?

```java
List<? extends Bird> list = new ArrayList<? extends Sparrow>();
```

Answer: No. Wildcards cannot appear inside `new`. The right side must be a concrete type:
`new ArrayList<Sparrow>()` would be correct.

---

**Q2.** Does this compile?

```java
List<? super Sparrow> list = new ArrayList<Animal>();
```

Answer: Yes. `Animal` is a supertype of `Sparrow`, so it satisfies `? super Sparrow`.

---

**Q3.** Does this compile?

```java
<T> void add(List<T super Bird> list, T item) {}
```

Answer: No. `T super Bird` is not valid syntax. `super` in a type argument requires `?` on
the left: `List<? super Bird>`. A named type parameter (`T`) cannot be used in place of `?`.

---

**Q4.** What is wrong with this method?

```java
<T> <? extends T> firstOrNull(List<? extends T> list) {
    return list.isEmpty() ? null : list.get(0);
}
```

Answer: The return type `<? extends T>` is illegal. A wildcard is not a concrete type and
cannot be used as a return type -- the caller would not know what type they are receiving.
The correct return type is `T`: `<T> T firstOrNull(List<? extends T> list)`.

---

**Q5.** Which lines compile?

```java
List<? super Bird> birds = new ArrayList<Animal>();
birds.add(new Sparrow()); // line A
birds.add(new Bird());    // line B
birds.add(new Animal());  // line C
Object o = birds.get(0);  // line D
Animal a = birds.get(0);  // line E
```

Answer:
- Line A: compiles -- `Sparrow` is a subtype of `Bird`
- Line B: compiles -- `Bird` is the lower bound itself
- Line C: does NOT compile -- `Animal` is wider than `Bird`; the actual list could be `List<Bird>` and `Animal` would not fit
- Line D: compiles -- can always read as `Object`
- Line E: does NOT compile -- compiler only guarantees `Object`, not `Animal`

---

**Q6.** Does this compile?

```java
public record Sorted(int num, String text)
        implements Comparable<Sorted>, Comparator<Sorted> {

    public int compareTo(Sorted s) { return text.compareTo(s.text); }
    public int compare(Sorted s1, Sorted s2) { return s1.num - s2.num; }

    public static void main(String[] args) {
        var s1 = new Sorted(88, "a");
        var s2 = new Sorted(55, "b");
        var t1 = new TreeSet<Sorted>();
        var t2 = new TreeSet<Sorted>(s1);
        t1.add(s1); t1.add(s2);
        t2.add(s1); t2.add(s2);
        System.out.println(t1 + " " + t2);
    }
}
```

What does it print?

Answer: `[88, 55] [55, 88]`

`t1` has no comparator -- uses `Comparable` via `compareTo()`, which sorts by `text`.
"a" < "b", so s1(text="a", num=88) comes first: `[88, 55]`.

`t2` receives `s1` as its constructor argument. `s1` implements `Comparator`, so `TreeSet`
uses it -- calling `compare()`, which sorts by `num`. 55 < 88, so s2(num=55) comes
first: `[55, 88]`.

The trap: when an object is passed to the `TreeSet` constructor, Java uses `Comparator`
(`compare()`), not `Comparable` (`compareTo()`), even if the object implements both.
