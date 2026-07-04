export const srpBody = `The **Single Responsibility Principle (SRP)** states that a class should have only one reason to change — meaning one well-defined responsibility driven by one actor or stakeholder.

If a class handles payroll calculation *and* database persistence, a change to tax rules and a change to the database schema both force edits to the same class. Split responsibilities so each class has a single axis of change.

---

### The Core Concept: "One Reason to Change"

Imagine an **HR system** where \`Employee\` handles both pay calculation and saving to the database.

* Finance changes tax rules → edit \`Employee\`.
* DevOps migrates to a new database → edit \`Employee\` again.
* QA must retest the entire class for unrelated changes.
* Two teams stepping on the same file creates merge conflicts.

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — two reasons to change: reporting + persistence
class Employee:
    def calculate_pay(self) -> float:
        return 0.0

    def save_to_database(self) -> None:
        print("Saving employee")
@java
// Anti-pattern — two reasons to change: reporting + persistence
class Employee {
    double calculatePay() { return 0; }
    void saveToDatabase() { System.out.println("Saving employee"); }
}
\`\`\`

**The Problem:** Mixed concerns in one class. Finance and infrastructure changes collide in the same unit.

---

### Refactoring with SRP

#### Step 1: Identify Separate Responsibilities

Pay calculation and persistence are different reasons to change.

#### Step 2: Extract Pay Logic

\`\`\`codetabs
@python
class PayCalculator:
    def calculate(self, employee: "Employee") -> float:
        return 0.0
@java
class PayCalculator {
    double calculate(Employee employee) { return 0; }
}
\`\`\`

#### Step 3: Extract Persistence

\`\`\`codetabs
@python
class EmployeeRepository:
    def save(self, employee: "Employee") -> None:
        print("Saving employee")
@java
class EmployeeRepository {
    void save(Employee employee) {
        System.out.println("Saving employee");
    }
}
\`\`\`

#### Step 4: Slim Domain Model

\`Employee\` holds data; services handle concerns:

\`\`\`codetabs
@python
class Employee:
    def __init__(self, name: str) -> None:
        self.name = name

calc = PayCalculator()
repo = EmployeeRepository()
emp = Employee("Alex")
repo.save(emp)
@java
class Employee {
    String name;
    Employee(String name) { this.name = name; }
}

PayCalculator calc = new PayCalculator();
EmployeeRepository repo = new EmployeeRepository();
Employee emp = new Employee("Alex");
repo.save(emp);
\`\`\`

---

### When to Use It

* **God classes** mixing validation, persistence, formatting, and notifications.
* **Multiple stakeholders** request changes to the same class — split by actor.
* **Testing is painful** because you cannot isolate one concern.
* **Cohesive behavior** still belongs together — \`PdfExporter\` with five related methods is one responsibility.

### Comparison: SRP vs "One Method Per Class"

* **SRP:** one *reason to change* (one stakeholder concern), not one method. \`InvoiceCalculator\` may have many cohesive methods.
* **Over-splitting:** extracting every method into its own class creates shotgun surgery — balance cohesion with separation.
`;

export const ocpBody = `The **Open/Closed Principle (OCP)** says software entities should be **open for extension** but **closed for modification** — add new behavior via new classes, not by editing tested core logic.

Stable abstractions define extension points; concrete variants plug in without changing the modules that depend on them.

---

### The Core Concept: "Extend, Don't Edit"

Imagine a **checkout system** that applies discounts.

* You start with no discount and student discount.
* Marketing adds senior citizen and seasonal promotions.
* Each new discount type should not require editing \`Checkout\`.

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — every new discount edits Checkout
class Checkout:
    def total(self, price: float, discount_type: str) -> float:
        if discount_type == "student":
            return price * 0.9
        elif discount_type == "senior":
            return price * 0.85
        return price
@java
// Anti-pattern — every new discount edits Checkout
class Checkout {
    double total(double price, String discountType) {
        if ("student".equals(discountType)) return price * 0.9;
        if ("senior".equals(discountType)) return price * 0.85;
        return price;
    }
}
\`\`\`

**The Problem:** Every new discount modifies stable checkout code — regression risk grows with each if-branch.

---

### Refactoring with OCP

#### Step 1: Define the Extension Point

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class Discount(ABC):
    @abstractmethod
    def apply(self, price: float) -> float:
        pass
@java
interface Discount {
    double apply(double price);
}
\`\`\`

#### Step 2: Implement Concrete Extensions

\`\`\`codetabs
@python
class NoDiscount(Discount):
    def apply(self, price: float) -> float:
        return price

class StudentDiscount(Discount):
    def apply(self, price: float) -> float:
        return price * 0.9
@java
class NoDiscount implements Discount {
    @Override
    public double apply(double price) { return price; }
}

class StudentDiscount implements Discount {
    @Override
    public double apply(double price) { return price * 0.9; }
}
\`\`\`

#### Step 3: Core Module Depends on Abstraction

\`\`\`codetabs
@python
class Checkout:
    def total(self, price: float, discount: Discount) -> float:
        return discount.apply(price)  # add new Discount — no Checkout edit
@java
class Checkout {
    double total(double price, Discount discount) {
        return discount.apply(price); // add new Discount — no Checkout edit
    }
}
\`\`\`

#### Step 4: Add New Behavior by Adding Classes

\`\`\`codetabs
@python
class SeniorDiscount(Discount):
    def apply(self, price: float) -> float:
        return price * 0.85

Checkout().total(100, SeniorDiscount())
@java
class SeniorDiscount implements Discount {
    @Override
    public double apply(double price) { return price * 0.85; }
}

new Checkout().total(100, new SeniorDiscount());
\`\`\`

---

### When to Use It

* **Growing variant lists** — payment methods, tax rules, export formats.
* **Stable core logic** that should not change when requirements grow.
* **Plugin/handler architectures** — register new implementations without editing the registry's core.
* **Rule of three** — introduce abstraction when the second variant appears, not before.

### Comparison: OCP vs YAGNI

* **OCP:** invest in extension points when variants are real or imminent — Strategy, Factory, and handler registries enable OCP.
* **YAGNI:** don't create interfaces for a single implementation with no foreseeable extension. Balance upfront abstraction with practical need.
`;

export const lspBody = `The **Liskov Substitution Principle (LSP)** requires that subtypes must be substitutable for their base types without breaking program correctness — subclasses honor the parent's contract.

If code expects a \`Rectangle\`, passing a \`Square\` must not break \`doubleWidth()\`. Violations mean the IS-A relationship is wrongly modeled.

---

### The Core Concept: "Substitute Without Surprises"

Imagine a **geometry library** where \`Rectangle\` has independent \`width\` and \`height\` setters.

* \`Square\` extends \`Rectangle\` because "a square is a rectangle."
* Setting width on a square also sets height — breaking rectangle expectations.
* \`doubleWidth(rect)\` produces wrong area for squares.

\`\`\`anti-pattern-codetabs
@python
class Rectangle:
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def set_width(self, width: float) -> None:
        self.width = width

    def area(self) -> float:
        return self.width * self.height

class Square(Rectangle):
    def set_width(self, width: float) -> None:
        self.width = self.height = width  # breaks Rectangle contract
@java
class Rectangle {
    protected double width, height;
    void setWidth(double width) { this.width = width; }
    double area() { return width * height; }
}

class Square extends Rectangle {
    @Override
    void setWidth(double width) {
        this.width = this.height = width; // breaks Rectangle contract
    }
}
\`\`\`

**The Problem:** \`Square\` is not substitutable for \`Rectangle\`. Callers expecting independent width/height break silently.

---

### Fixing LSP Violations

#### Step 1: Recognize the Broken Contract

Subclass strengthens preconditions or weakens postconditions — LSP violation.

#### Step 2: Model with a Shared Abstraction

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass
@java
interface Shape {
    double area();
}
\`\`\`

#### Step 3: Siblings, Not Parent-Child

\`\`\`codetabs
@python
class Rectangle(Shape):
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

class Square(Shape):
    def __init__(self, side: float) -> None:
        self.side = side

    def area(self) -> float:
        return self.side * self.side
@java
class Rectangle implements Shape {
    private final double width, height;
    Rectangle(double width, double height) {
        this.width = width; this.height = height;
    }
    @Override public double area() { return width * height; }
}

class Square implements Shape {
    private final double side;
    Square(double side) { this.side = side; }
    @Override public double area() { return side * side; }
}
\`\`\`

#### Step 4: Client Depends on Abstraction

\`\`\`codetabs
@python
def print_area(shape: Shape) -> None:
    print(shape.area())  # works for any Shape
@java
static void printArea(Shape shape) {
    System.out.println(shape.area()); // works for any Shape
}
\`\`\`

---

### When to Use It

* **Every IS-A inheritance** must pass the substitutability test.
* **Detect violations:** subclass throws where parent doesn't, no-op overrides, narrowed behavior.
* **Prefer composition** when behavior diverges significantly from the parent contract.
* **Design by contract:** preconditions, postconditions, and invariants must be compatible.

### Comparison: LSP vs Inheritance

* **Inheritance:** shares code through IS-A — only valid when LSP holds.
* **LSP:** the test that validates inheritance — without it, polymorphism is unsafe and runtime dispatch is unreliable.
`;

export const ispBody = `The **Interface Segregation Principle (ISP)** says clients should not be forced to depend on methods they do not use — prefer small, focused interfaces over fat "god interfaces."

A \`Robot\` that must implement \`eat()\` because \`Worker\` requires it is a classic violation.

---

### The Core Concept: "No Forced Stubs"

Imagine a **factory workforce** system with humans and robots.

* Humans work and eat lunch.
* Robots only work — they don't eat.
* A fat \`Worker\` interface forces \`Robot\` to stub \`eat()\`.

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — Robot forced to implement irrelevant eat()
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self) -> None:
        pass

    @abstractmethod
    def eat(self) -> None:
        pass

class Robot(Worker):
    def work(self) -> None:
        print("Working")

    def eat(self) -> None:
        raise NotImplementedError("Robots don't eat")
@java
// Anti-pattern — Robot forced to implement irrelevant eat()
interface Worker {
    void work();
    void eat();
}

class Robot implements Worker {
    @Override public void work() { System.out.println("Working"); }
    @Override public void eat() { throw new UnsupportedOperationException(); }
}
\`\`\`

**The Problem:** Implementers provide dummy or throwing methods for capabilities they don't have. Clients see irrelevant API surface.

---

### Refactoring with ISP

#### Step 1: Split by Role

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self) -> None:
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None:
        pass
@java
interface Workable {
    void work();
}

interface Eatable {
    void eat();
}
\`\`\`

#### Step 2: Implement Only Relevant Interfaces

\`\`\`codetabs
@python
class Human(Workable, Eatable):
    def work(self) -> None:
        print("Working")

    def eat(self) -> None:
        print("Eating")

class Robot(Workable):
    def work(self) -> None:
        print("Working")
    # no forced eat() stub
@java
class Human implements Workable, Eatable {
    @Override public void work() { System.out.println("Working"); }
    @Override public void eat() { System.out.println("Eating"); }
}

class Robot implements Workable {
    @Override public void work() { System.out.println("Working"); }
    // no forced eat() stub
}
\`\`\`

#### Step 3: Clients Depend on Smallest Interface

\`\`\`codetabs
@python
def assign_task(worker: Workable) -> None:
    worker.work()
@java
static void assignTask(Workable worker) {
    worker.work();
}
\`\`\`

#### Step 4: Wire the Right Type

\`\`\`codetabs
@python
assign_task(Robot())
assign_task(Human())
@java
assignTask(new Robot());
assignTask(new Human());
\`\`\`

---

### When to Use It

* **Fat interfaces** with unrelated methods — \`print()\`, \`scan()\`, \`fax()\` on one type.
* **Forced stub implementations** that throw or do nothing.
* **Testing** — mock only the interface slice the client needs.
* **REST APIs** — focused endpoints over mega-resources.

### Comparison: ISP vs SRP

* **ISP:** about interface surface area — clients shouldn't see methods they don't use.
* **SRP:** about class responsibilities — one reason to change. A fat interface can force classes to mix concerns; ISP splits the contract, SRP splits the implementation.
`;

export const dipBody = `The **Dependency Inversion Principle (DIP)** says high-level modules should depend on abstractions, not concrete implementations — and both layers should depend on interfaces, not on each other directly.

\`OrderService\` should not import \`PostgresOrderRepository\`. It should depend on \`OrderRepository\`, with Postgres as one interchangeable implementation.

---

### The Core Concept: "Depend on Abstractions"

Imagine an **order placement service** that saves orders to Postgres.

* Unit tests need a real database — slow and fragile.
* Switching to MongoDB requires editing \`OrderService\`.
* Business logic is coupled to infrastructure details.

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — high-level module depends on concrete low-level detail
class PostgresOrderRepository:
    def save(self, order) -> None:
        print(f"Saving order {order.id} to Postgres")

class OrderService:
    def __init__(self) -> None:
        self.repo = PostgresOrderRepository()  # hard-coded concrete type

    def place(self, order) -> None:
        self.repo.save(order)
@java
// Anti-pattern — high-level module depends on concrete low-level detail
class PostgresOrderRepository {
    void save(Order order) {
        System.out.println("Saving order " + order.id() + " to Postgres");
    }
}

class OrderService {
    private PostgresOrderRepository repo = new PostgresOrderRepository();

    void place(Order order) {
        repo.save(order);
    }
}
\`\`\`

**The Problem:** Business logic cannot be tested or deployed without Postgres. The dependency arrow points the wrong way.

---

### Refactoring with DIP

#### Step 1: Define the Abstraction (Port)

High-level module defines what it needs:

\`\`\`codetabs
@python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Order:
    id: str

class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> None:
        pass
@java
interface OrderRepository {
    void save(Order order);
}

record Order(String id) {}
\`\`\`

#### Step 2: Low-Level Module Implements Abstraction

\`\`\`codetabs
@python
class PostgresOrderRepository(OrderRepository):
    def save(self, order: Order) -> None:
        print(f"Saving order {order.id} to Postgres")
@java
class PostgresOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        System.out.println("Saving order " + order.id() + " to Postgres");
    }
}
\`\`\`

#### Step 3: Inject Abstraction into High-Level Module

\`\`\`codetabs
@python
class OrderService:
    def __init__(self, repo: OrderRepository) -> None:
        self.repo = repo

    def place(self, order: Order) -> None:
        self.repo.save(order)
@java
class OrderService {
    private final OrderRepository repo;

    OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    void place(Order order) {
        repo.save(order);
    }
}
\`\`\`

#### Step 4: Wire at Composition Root

\`\`\`codetabs
@python
# Production
OrderService(PostgresOrderRepository())

# Tests inject InMemoryOrderRepository — no Postgres needed
@java
// Production
new OrderService(new PostgresOrderRepository());

// Tests inject InMemoryOrderRepository — no Postgres needed
\`\`\`

---

### When to Use It

* **Infrastructure boundaries** — database, email, file system, external APIs.
* **Unit testing** — inject fakes/mocks instead of real dependencies.
* **Swappable implementations** — Postgres vs in-memory vs MongoDB.
* **Hexagonal architecture** — application defines ports; adapters implement them.

### Comparison: DIP vs Dependency Injection (DI)

* **DIP:** the principle — depend on abstractions, invert the dependency direction.
* **DI:** the technique — constructor injection, setter injection, IoC containers wire concrete implementations at runtime. DI is how you *apply* DIP.
`;

export const solidBodies: Record<string, string> = {
  S: srpBody,
  O: ocpBody,
  L: lspBody,
  I: ispBody,
  D: dipBody,
};
