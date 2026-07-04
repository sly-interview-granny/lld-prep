export const mementoBody = `The **Memento Design Pattern** is a behavioral design pattern that captures and externalizes an object's internal state so it can be restored later, without violating encapsulation.

Instead of exposing private fields for undo stacks or save points, the originator packages a snapshot the caretaker can store but not inspect.

---

### The Core Concept: "Save Game Without Peeking at the Engine"

Imagine you are building a **Diagram Editor** for system design interviews.

* Users draw boxes, arrows, and labels on a canvas.
* Ctrl+Z must restore the previous canvas state.
* Save checkpoints before risky bulk operations.
* The history manager should not mutate shape internals directly.

A naive undo stack breaks encapsulation:

\`\`\`java
// Anti-pattern: history manager reaches into private state
public class CanvasHistory {
    private final Deque<List<Shape>> snapshots = new ArrayDeque<>();

    public void save(Canvas canvas) {
        snapshots.push(canvas.getShapesCopy()); // exposes internal list
    }

    public void undo(Canvas canvas) {
        canvas.setShapes(snapshots.pop()); // bypasses canvas invariants
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: history manager reaches into private state
class CanvasHistory:
    def __init__(self) -> None:
        self.snapshots: list[list[dict]] = []

    def save(self, canvas: "Canvas") -> None:
        self.snapshots.append(canvas.get_shapes_copy())

    def undo(self, canvas: "Canvas") -> None:
        canvas.set_shapes(self.snapshots.pop())
\`\`\`

**The Problem:** External code can put the canvas into invalid states. Shape invariants — unique IDs, connection integrity — are bypassed. Encapsulation leaks across layers.

---

### Refactoring with Memento Pattern

The originator creates opaque mementos; only it knows how to restore them.

#### Step 1: Define the Memento

\`\`\`java
public final class CanvasMemento {
    private final List<Shape> shapes;

    private CanvasMemento(List<Shape> shapes) {
        this.shapes = shapes;
    }

    static CanvasMemento capture(List<Shape> shapes) {
        return new CanvasMemento(deepCopy(shapes));
    }

    List<Shape> getShapes() { return shapes; } // package-private to originator
}
\`\`\`
\`\`\`python
from dataclasses import dataclass


@dataclass(frozen=True)
class CanvasMemento:
    shapes: tuple[dict, ...]

    @staticmethod
    def capture(shapes: list[dict]) -> "CanvasMemento":
        return CanvasMemento(tuple(dict(shape) for shape in shapes))
\`\`\`

#### Step 2: Originator Creates and Restores Mementos

\`\`\`java
public class Canvas {
    private List<Shape> shapes = new ArrayList<>();

    public CanvasMemento save() {
        return CanvasMemento.capture(shapes);
    }

    public void restore(CanvasMemento memento) {
        this.shapes = deepCopy(memento.getShapes());
    }

    public void addShape(Shape shape) {
        shapes.add(shape);
    }
}
\`\`\`
\`\`\`python
class Canvas:
    def __init__(self) -> None:
        self.shapes: list[dict] = []

    def save(self) -> CanvasMemento:
        return CanvasMemento.capture(self.shapes)

    def restore(self, memento: CanvasMemento) -> None:
        self.shapes = [dict(shape) for shape in memento.shapes]

    def add_shape(self, shape: dict) -> None:
        self.shapes.append(shape)
\`\`\`

#### Step 3: Caretaker Stores Mementos Only

\`\`\`java
public class CanvasHistory {
    private final Deque<CanvasMemento> undoStack = new ArrayDeque<>();

    public void push(CanvasMemento memento) {
        undoStack.push(memento);
    }

    public CanvasMemento pop() {
        return undoStack.pop();
    }
}
\`\`\`
\`\`\`python
class CanvasHistory:
    def __init__(self) -> None:
        self.undo_stack: list[CanvasMemento] = []

    def push(self, memento: CanvasMemento) -> None:
        self.undo_stack.append(memento)

    def pop(self) -> CanvasMemento:
        return self.undo_stack.pop()
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Canvas canvas = new Canvas();
        CanvasHistory history = new CanvasHistory();

        history.push(canvas.save());
        canvas.addShape(new Shape("UserService"));
        canvas.addShape(new Shape("Database"));

        canvas.restore(history.pop()); // undo to empty canvas
    }
}
\`\`\`
\`\`\`python
canvas = Canvas()
history = CanvasHistory()

history.push(canvas.save())
canvas.add_shape({"name": "UserService"})
canvas.add_shape({"name": "Database"})

canvas.restore(history.pop())  # undo to empty canvas
\`\`\`

---

### When to Use It

* **Undo/redo checkpoints:** When you must restore complex object graphs without exposing internals — editors, drawing apps, configuration tools.
* **Transactional savepoints:** When risky operations need a rollback point before proceeding.
* **Encapsulation-sensitive snapshots:** When caretakers should store state but not interpret it.
* **Command complement:** When inverse commands are harder than full state capture.

### Comparison: Memento vs. Command Pattern

Both support undo, but they snapshot differently:

* **Memento Pattern:** Captures **full state** at a point in time — restore replaces entire object internals.
* **Command Pattern:** Encapsulates **discrete actions** with \`execute()\` / \`undo()\` — often lighter memory, but each command must know how to reverse itself.`;
