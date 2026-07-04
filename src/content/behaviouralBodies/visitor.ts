export const visitorBody = `The **Visitor Design Pattern** is a behavioral design pattern that lets you define new operations on elements of an object structure without changing the classes of those elements.

Instead of adding \`exportPdf()\`, \`calculateTax()\`, and \`lint()\` methods to every node class, you externalize each operation into a dedicated visitor and use double dispatch.

---

### The Core Concept: "Stable Tree, Pluggable Operations"

Imagine you are building a **Shopping Cart Tax Engine** for an Indian marketplace.

* The cart contains heterogeneous items: \`Book\` (GST exempt), \`Electronics\` (18% GST), \`Grocery\` (5% GST).
* You need tax calculation today.
* Tomorrow, marketing wants export to invoice JSON.
* Next quarter, compliance wants a fraud-risk scan.

Adding every future operation inside each item class violates **Open-Closed Principle**:

\`\`\`java
// Anti-pattern: every new operation touches every item class
public class Book implements CartItem {
    public double calculateTax() { return 0; }
    public String toInvoiceJson() { return "{\\"type\\":\\"book\\"}"; }
    public int fraudScore() { return 1; }
    // more methods as requirements grow...
}

public class Electronics implements CartItem {
    public double calculateTax() { return price * 0.18; }
    public String toInvoiceJson() { return "{\\"type\\":\\"electronics\\"}"; }
    public int fraudScore() { return 5; }
}
\`\`\`
\`\`\`python
# Anti-pattern: every new operation touches every item class
class Book:
    def calculate_tax(self, price: float) -> float:
        return 0.0

    def to_invoice_json(self) -> str:
        return '{"type": "book"}'


class Electronics:
    def calculate_tax(self, price: float) -> float:
        return price * 0.18

    def to_invoice_json(self) -> str:
        return '{"type": "electronics"}'
\`\`\`

**The Problem:** The cart item hierarchy is stable, but operations keep multiplying. Each new report forces edits across all item types — merge conflicts and regression risk explode.

---

### Refactoring with Visitor Pattern

Items expose \`accept(visitor)\`; visitors implement \`visitBook\`, \`visitElectronics\`, etc.

#### Step 1: Define Visitor and Element Interfaces

\`\`\`java
public interface CartVisitor {
    double visitBook(Book item);
    double visitElectronics(Electronics item);
    double visitGrocery(Grocery item);
}

public interface CartItem {
    double accept(CartVisitor visitor);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class CartVisitor(ABC):
    @abstractmethod
    def visit_book(self, item: "Book") -> float:
        pass

    @abstractmethod
    def visit_electronics(self, item: "Electronics") -> float:
        pass

    @abstractmethod
    def visit_grocery(self, item: "Grocery") -> float:
        pass


class CartItem(ABC):
    @abstractmethod
    def accept(self, visitor: CartVisitor) -> float:
        pass
\`\`\`

#### Step 2: Implement Concrete Elements

\`\`\`java
public class Book implements CartItem {
    private final double price;
    public Book(double price) { this.price = price; }
    public double accept(CartVisitor visitor) { return visitor.visitBook(this); }
    public double getPrice() { return price; }
}

public class Electronics implements CartItem {
    private final double price;
    public Electronics(double price) { this.price = price; }
    public double accept(CartVisitor visitor) { return visitor.visitElectronics(this); }
    public double getPrice() { return price; }
}
\`\`\`
\`\`\`python
class Book(CartItem):
    def __init__(self, price: float) -> None:
        self.price = price

    def accept(self, visitor: CartVisitor) -> float:
        return visitor.visit_book(self)


class Electronics(CartItem):
    def __init__(self, price: float) -> None:
        self.price = price

    def accept(self, visitor: CartVisitor) -> float:
        return visitor.visit_electronics(self)
\`\`\`

#### Step 3: Implement Concrete Visitors

\`\`\`java
public class GstTaxVisitor implements CartVisitor {
    public double visitBook(Book item) { return 0; }
    public double visitElectronics(Electronics item) { return item.getPrice() * 0.18; }
    public double visitGrocery(Grocery item) { return item.getPrice() * 0.05; }
}

public class InvoiceExportVisitor implements CartVisitor {
    public double visitBook(Book item) {
        System.out.println("Export book line");
        return 0;
    }
    public double visitElectronics(Electronics item) {
        System.out.println("Export electronics line");
        return 0;
    }
    public double visitGrocery(Grocery item) {
        System.out.println("Export grocery line");
        return 0;
    }
}
\`\`\`
\`\`\`python
class GstTaxVisitor(CartVisitor):
    def visit_book(self, item: Book) -> float:
        return 0.0

    def visit_electronics(self, item: Electronics) -> float:
        return item.price * 0.18

    def visit_grocery(self, item: "Grocery") -> float:
        return item.price * 0.05


class InvoiceExportVisitor(CartVisitor):
    def visit_book(self, item: Book) -> float:
        print("Export book line")
        return 0.0

    def visit_electronics(self, item: Electronics) -> float:
        print("Export electronics line")
        return 0.0

    def visit_grocery(self, item: "Grocery") -> float:
        print("Export grocery line")
        return 0.0
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        List<CartItem> cart = List.of(new Book(499), new Electronics(29999));
        CartVisitor tax = new GstTaxVisitor();
        double totalTax = cart.stream()
            .mapToDouble(item -> item.accept(tax))
            .sum();
        System.out.println("Total GST: " + totalTax);
    }
}
\`\`\`
\`\`\`python
cart = [Book(499), Electronics(29999)]
tax_visitor = GstTaxVisitor()
total_tax = sum(item.accept(tax_visitor) for item in cart)
print(f"Total GST: {total_tax}")
\`\`\`

---

### When to Use It

* **Stable structure, volatile operations:** When node types rarely change but new analyses arrive frequently — compilers, linters, serializers.
* **Cross-cutting traversals:** When operations span an entire hierarchy and do not belong inside domain classes.
* **Multiple unrelated operations:** When tax, export, and fraud checks should stay in separate classes.
* **Double dispatch needed:** When the correct method depends on both visitor type and element type.

### Comparison: Visitor vs. Interpreter Pattern

Both involve structured trees, but they optimize for different change axes:

* **Visitor Pattern:** Easy to add **new operations** (new visitor class); hard to add new element types (update every visitor).
* **Interpreter Pattern:** Easy to add **new grammar nodes** with embedded \`interpret()\`; operations are tied to expression classes, not pluggable visitors.`;
