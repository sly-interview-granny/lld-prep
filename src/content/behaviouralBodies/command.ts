export const commandBody = `The **Command Design Pattern** is a behavioral design pattern that encapsulates a request as an object, letting you parameterize clients with different requests, queue or log operations, and support undoable actions.

Instead of the UI calling \`document.insertText()\` directly and losing any record of what happened, each user action becomes a command object with \`execute()\` and \`undo()\` that the editor can stack, replay, or reverse.

---

### The Core Concept: "Actions You Can Replay and Reverse"

Imagine you are building a **Collaborative Document Editor** — think Google Docs for system design notes.

* Users type, delete, bold selections, and insert diagrams.
* Ctrl+Z must undo the last action without corrupting shared state.
* Ctrl+Y must redo what was undone.
* Remote collaborators send the same commands over the wire so everyone converges on identical content.

If you don't use the Command Pattern, undo becomes a fragile special case:

\`\`\`java
// Anti-pattern: editor mutates directly; undo is bolted on
public class DocumentEditor {
    private StringBuilder content = new StringBuilder();

    public void insertText(int position, String text) {
        content.insert(position, text);
    }

    public void deleteText(int position, int length) {
        content.delete(position, position + length);
    }

    // Undo requires remembering arbitrary prior snapshots or inverse logic per method
    public void undoLastAction(Object lastAction) {
        if (lastAction instanceof InsertAction) {
            InsertAction a = (InsertAction) lastAction;
            content.delete(a.position, a.position + a.text.length());
        }
        // Different branch for every action type — duplicated and error-prone
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: editor mutates directly; undo is bolted on
class DocumentEditor:
    def __init__(self) -> None:
        self.content = ""

    def insert_text(self, position: int, text: str) -> None:
        self.content = self.content[:position] + text + self.content[position:]

    def delete_text(self, position: int, length: int) -> None:
        self.content = self.content[:position] + self.content[position + length:]

    def undo_last_action(self, last_action: dict) -> None:
        if last_action["type"] == "insert":
            pos = last_action["position"]
            text = last_action["text"]
            self.content = self.content[:pos] + self.content[pos + len(text):]
\`\`\`

**The Problem:** Every new editing operation needs bespoke undo logic scattered across the editor. Queuing, logging, macro recording, and collaborative replay all re-implement the same action metadata. Testing undo requires reaching into private document state.

---

### Refactoring with Command Pattern

Each user action becomes a command object; an \`Invoker\` (or history manager) executes and stacks them.

#### Step 1: Define the Command Interface

\`\`\`java
public interface Command {
    void execute();
    void undo();
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class Command(ABC):
    @abstractmethod
    def execute(self) -> None:
        pass

    @abstractmethod
    def undo(self) -> None:
        pass
\`\`\`

#### Step 2: Implement Concrete Commands

\`\`\`java
public class InsertTextCommand implements Command {
    private final Document document;
    private final int position;
    private final String text;

    public InsertTextCommand(Document document, int position, String text) {
        this.document = document;
        this.position = position;
        this.text = text;
    }

    public void execute() {
        document.insertAt(position, text);
    }

    public void undo() {
        document.deleteAt(position, text.length());
    }
}

public class DeleteTextCommand implements Command {
    private final Document document;
    private final int position;
    private final String deletedText;

    public DeleteTextCommand(Document document, int position, int length) {
        this.document = document;
        this.position = position;
        this.deletedText = document.slice(position, position + length);
    }

    public void execute() {
        document.deleteAt(position, deletedText.length());
    }

    public void undo() {
        document.insertAt(position, deletedText);
    }
}
\`\`\`
\`\`\`python
class InsertTextCommand(Command):
    def __init__(self, document: "Document", position: int, text: str) -> None:
        self.document = document
        self.position = position
        self.text = text

    def execute(self) -> None:
        self.document.insert_at(self.position, self.text)

    def undo(self) -> None:
        self.document.delete_at(self.position, len(self.text))


class DeleteTextCommand(Command):
    def __init__(self, document: "Document", position: int, length: int) -> None:
        self.document = document
        self.position = position
        self.deleted_text = document.slice(self.position, self.position + length)

    def execute(self) -> None:
        self.document.delete_at(self.position, len(self.deleted_text))

    def undo(self) -> None:
        self.document.insert_at(self.position, self.deleted_text)
\`\`\`

#### Step 3: Create the Invoker (History Manager)

\`\`\`java
public class CommandHistory {
    private final Deque<Command> undoStack = new ArrayDeque<>();
    private final Deque<Command> redoStack = new ArrayDeque<>();

    public void execute(Command command) {
        command.execute();
        undoStack.push(command);
        redoStack.clear();
    }

    public void undo() {
        if (undoStack.isEmpty()) return;
        Command command = undoStack.pop();
        command.undo();
        redoStack.push(command);
    }

    public void redo() {
        if (redoStack.isEmpty()) return;
        Command command = redoStack.pop();
        command.execute();
        undoStack.push(command);
    }
}
\`\`\`
\`\`\`python
class CommandHistory:
    def __init__(self) -> None:
        self.undo_stack: list[Command] = []
        self.redo_stack: list[Command] = []

    def execute(self, command: Command) -> None:
        command.execute()
        self.undo_stack.append(command)
        self.redo_stack.clear()

    def undo(self) -> None:
        if not self.undo_stack:
            return
        command = self.undo_stack.pop()
        command.undo()
        self.redo_stack.append(command)

    def redo(self) -> None:
        if not self.redo_stack:
            return
        command = self.redo_stack.pop()
        command.execute()
        self.undo_stack.append(command)
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Document doc = new Document("Hello ");
        CommandHistory history = new CommandHistory();

        history.execute(new InsertTextCommand(doc, 6, "World"));
        System.out.println(doc.getContent()); // Hello World

        history.undo();
        System.out.println(doc.getContent()); // Hello 

        history.redo();
        System.out.println(doc.getContent()); // Hello World
    }
}
\`\`\`
\`\`\`python
class Document:
    def __init__(self, content: str = "") -> None:
        self.content = content

    def insert_at(self, position: int, text: str) -> None:
        self.content = self.content[:position] + text + self.content[position:]

    def delete_at(self, position: int, length: int) -> None:
        self.content = self.content[:position] + self.content[position + length:]

    def slice(self, start: int, end: int) -> str:
        return self.content[start:end]


doc = Document("Hello ")
history = CommandHistory()

history.execute(InsertTextCommand(doc, 6, "World"))
print(doc.content)  # Hello World

history.undo()
print(doc.content)  # Hello 

history.redo()
print(doc.content)  # Hello World
\`\`\`

---

### When to Use It

* **Undo/redo stacks:** When user actions must be reversible — editors, drawing tools, configuration panels.
* **Action logging and audit:** When you need a record of what happened and when — transactional outbox, admin audit trails.
* **Macro and batch execution:** When commands can be queued, scheduled, or replayed in sequence.
* **Decoupling UI from domain:** When toolbar buttons should not know document internals — they only construct and submit commands.
* **Collaborative sync:** When the same command objects can be serialized and applied on remote replicas.

### Comparison: Command vs. Memento Pattern

Both support undo, but they snapshot differently:

* **Command Pattern:** Encapsulates **discrete actions** with explicit \`execute()\` / \`undo()\` — memory-efficient when operations are small and reversible incrementally.
* **Memento Pattern:** Captures **full object state** at a checkpoint — simpler when undo means restoring an entire complex graph and inverse operations are hard to define.`;
