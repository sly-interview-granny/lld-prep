import type { SolidPrinciple } from './types';
import { solidBodies } from './conceptBodies/solid';

export type { SolidPrinciple };

export const solidPrinciples: SolidPrinciple[] = [
  {
    letter: 'S',
    body: solidBodies.S,
    title: 'Single Responsibility Principle',
    description: 'A class should have only one reason to change.',
    definition:
      'SRP states that a class should have a single, well-defined responsibility — one axis of change driven by one actor or stakeholder. If a class handles both order validation and email notifications, a change to SMTP configuration forces you to touch and redeploy order logic. Splitting responsibilities into focused classes improves testability, readability, and parallel development. Responsibility means "reason to change," not "one method only" — a cohesive `InvoiceCalculator` with five related methods still has one job. SRP applies at every level: methods, classes, modules, and microservices. In LLD interviews, spotting the God class and proposing a clean split is one of the most common exercises.',
    analogy:
      'A restaurant: the chef cooks, the waiter serves, the cashier handles payments. If one person did all three, a menu change, a POS upgrade, and a health inspection would all disrupt the same employee — too many reasons to change. Specialized roles mean each person changes only when their domain changes.',
    detailedExample:
      'A `UserService` that authenticates users, sends welcome emails, and writes audit logs violates SRP. Split into `AuthService` (login, tokens), `NotificationService` (emails), and `AuditLogger` (compliance). When marketing changes email templates, only `NotificationService` changes. When security updates JWT logic, only `AuthService` changes. `OrderController` should delegate — not embed — business rules and persistence.',
    whenAsked:
      'Q: "Explain SOLID" or "What is SRP?" — Answer: each class should have one reason to change — one stakeholder concern. Give the God class example and show how splitting improves maintainability.\n\nQ: "Does SRP mean one method per class?" — Answer: No. Cohesive related behavior belongs together. `PdfExporter` may have `addPage()`, `addHeader()`, `save()` — all one responsibility: PDF generation.\n\nQ: "What violates SRP in this code?" — Answer: identify mixed concerns (persistence + validation + formatting in one class), name the actors who would request changes, and propose extracted classes.',
    codePython: `# Violation — two reasons to change: reporting + persistence
class Employee:
    def calculate_pay(self) -> float:
        return 0.0

    def save_to_database(self) -> None:
        print("Saving employee")

# Better — separate responsibilities
class PayCalculator:
    def calculate(self, employee: "Employee") -> float:
        return 0.0

class EmployeeRepository:
    def save(self, employee: "Employee") -> None:
        print("Saving employee")`,
    codeJava: `// Violation — two reasons to change: reporting + persistence
class Employee {
    double calculatePay() { return 0; }
    void saveToDatabase() { System.out.println("Saving employee"); }
}

// Better — separate responsibilities
class PayCalculator {
    double calculate(Employee employee) { return 0; }
}

class EmployeeRepository {
    void save(Employee employee) {
        System.out.println("Saving employee");
    }
}`,
    interviewTips: [
      'One class = one reason to change (one actor/stakeholder concern).',
      'Not "one method only" — cohesive related behavior can live together.',
      'God classes (UserManager doing auth + CRUD + email) are classic violations.',
      'SRP enables smaller units that are easier to test, review, and reuse.',
      'At service level: OrderService should not format PDF invoices — delegate to InvoiceRenderer.',
      'Over-splitting creates shotgun surgery — balance cohesion with separation.',
      'Ask "who would request a change?" — if multiple departments, split.',
    ],
    commonMistakes: [
      'Splitting every method into its own class — creates fragmentation without benefit.',
      'Confusing SRP with "a class should do one thing" without naming the stakeholder.',
      'Leaving formatting, validation, and DB access in a single controller.',
      'Applying SRP only to classes but ignoring fat methods with mixed logic.',
    ],
  },
  {
    letter: 'O',
    body: solidBodies.O,
    title: 'Open/Closed Principle',
    description: 'Open for extension, closed for modification.',
    definition:
      'OCP says you should add new behavior by extending the system (new classes, strategies, plugins) rather than editing existing, tested code. Stable abstractions define extension points; concrete variants plug in without modifying the core. This reduces regression risk as requirements grow — the checkout flow should not need changes when you add cryptocurrency payments. OCP does not mean never modifying any file — bug fixes and internal refactors are fine. It targets behavioral extension. Achieving OCP usually requires abstractions (interfaces, abstract classes) upfront, which trades initial complexity for long-term flexibility. It pairs directly with Strategy, Factory, and Template Method patterns.',
    analogy:
      'USB ports: manufacturers add new devices (keyboards, drives, microphones) without redesigning the laptop motherboard each time. The port is the stable interface; devices are extensions. The laptop is closed for modification (you do not solder new circuits) but open for extension (plug in new peripherals).',
    detailedExample:
      'In a tax calculation system, `TaxStrategy` interface with `calculate(amount)`. Implement `UsTax`, `EuTax`, `GstTax`. `InvoiceService` accepts any `TaxStrategy` — adding Japan consumption tax means adding `JapanTax` class, zero edits to `InvoiceService`. Contrast with a switch on country code inside `InvoiceService` — every new country modifies tested code (OCP violation).',
    whenAsked:
      'Q: "How would you add a new payment method without changing existing code?" — Answer: define `PaymentMethod` interface, inject implementation. New method = new class implementing interface. Checkout depends on abstraction.\n\nQ: "Does OCP mean you never edit files?" — Answer: No. Fix bugs, improve internals. OCP means new features extend via new types, not by growing if/else chains in stable modules.\n\nQ: "When is OCP over-engineering?" — Answer: when you have one variant and no foreseeable extension. Start simple; introduce abstraction when second variant appears (rule of three).',
    codePython: `from abc import ABC, abstractmethod

class Discount(ABC):
    @abstractmethod
    def apply(self, price: float) -> float:
        pass

class NoDiscount(Discount):
    def apply(self, price: float) -> float:
        return price

class StudentDiscount(Discount):
    def apply(self, price: float) -> float:
        return price * 0.9

class Checkout:
    def total(self, price: float, discount: Discount) -> float:
        return discount.apply(price)  # add new Discount — no Checkout edit`,
    codeJava: `interface Discount {
    double apply(double price);
}

class NoDiscount implements Discount {
    @Override
    public double apply(double price) {
        return price;
    }
}

class StudentDiscount implements Discount {
    @Override
    public double apply(double price) {
        return price * 0.9;
    }
}

class Checkout {
    double total(double price, Discount discount) {
        return discount.apply(price); // add new Discount — no Checkout edit
    }
}`,
    interviewTips: [
      'Extend via new implementations, not by editing switch statements in core logic.',
      'Strategy, Template Method, and Factory patterns are OCP enablers — name them.',
      'Requires abstractions upfront — balance with YAGNI and rule of three.',
      'Changing a bug fix inside a class is fine; OCP targets behavioral extension.',
      'Show before (switch on type) and after (polymorphic strategy) in interviews.',
      'Plugin architectures and handler registries are OCP at system scale.',
      'OCP + DIP together: depend on abstraction, extend with new implementations.',
    ],
    commonMistakes: [
      'Creating interfaces for every class when only one implementation exists.',
      'Adding a new if-branch and claiming OCP compliance.',
      'Modifying shared enums for every new variant — enums are often OCP violations.',
      'Confusing "closed for modification" with "never touch the file again."',
    ],
  },
  {
    letter: 'L',
    body: solidBodies.L,
    title: 'Liskov Substitution Principle',
    description:
      'Subtypes must be substitutable for their base types without breaking correctness.',
    definition:
      'LSP requires that if S is a subtype of T, anywhere you use T you can substitute S without the program knowing or breaking. Subclasses must honor the parent\'s contract: preconditions cannot be strengthened, postconditions cannot be weakened, and invariants must hold. No surprising exceptions, no-ops, or narrowed behavior. Violations often appear as broken IS-A hierarchies where the subtype is not truly a specialized form of the parent. LSP connects inheritance to safe polymorphism — without it, runtime dispatch is unreliable. Barbara Liskov formalized this in 1987; the Square/Rectangle problem is the canonical interview example.',
    analogy:
      'Substituting a trained substitute teacher for the regular teacher: students expect the same syllabus, homework policies, and grading rules. If the substitute refuses to teach math because they "only do science," or changes the grading scale mid-semester, the substitution contract is broken — even though both are "teachers."',
    detailedExample:
      'In a file storage system, `ReadOnlyFile` should not extend `File` if it overrides `write()` to throw `UnsupportedOperationException`. Code expecting `File` will break when given `ReadOnlyFile`. Instead, model `Readable` and `Writable` interfaces; `File` implements both, `ReadOnlyFile` implements only `Readable`. Callers depending on `Writable` never receive a read-only object.',
    whenAsked:
      'Q: "Is Square a Rectangle?" — Answer: mathematically yes, in OOP with setters for width/height independently, no. Square violates Rectangle\'s contract — substituting Square where Rectangle is expected breaks `doubleWidth()` logic. Use separate types or a Shape interface.\n\nQ: "How do you detect LSP violations?" — Answer: subclass throws where parent does not, returns null unexpectedly, strengthens preconditions (requires more), or weakens postconditions (guarantees less).\n\nQ: "How does LSP relate to inheritance?" — Answer: inheritance is only valid when LSP holds. IS-A without substitutability is a modeling error.',
    codePython: `class Rectangle:
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def set_width(self, width: float) -> None:
        self.width = width

    def set_height(self, height: float) -> None:
        self.height = height

    def area(self) -> float:
        return self.width * self.height

class Square(Rectangle):
    def set_width(self, width: float) -> None:
        self.width = self.height = width  # breaks Rectangle contract

    def set_height(self, height: float) -> None:
        self.width = self.height = height

def double_width(rect: Rectangle) -> None:
    rect.set_width(rect.width * 2)
    print(rect.area())  # Square breaks expected area`,
    codeJava: `class Rectangle {
    protected double width;
    protected double height;

    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    void setWidth(double width) { this.width = width; }
    void setHeight(double height) { this.height = height; }
    double area() { return width * height; }
}

class Square extends Rectangle {
    @Override
    void setWidth(double width) {
        this.width = this.height = width; // breaks Rectangle contract
    }

    @Override
    void setHeight(double height) {
        this.width = this.height = height;
    }
}

class Geometry {
    static void doubleWidth(Rectangle rect) {
        rect.setWidth(rect.width * 2);
        System.out.println(rect.area()); // Square breaks expected area
    }
}`,
    interviewTips: [
      'If subclass breaks callers expecting parent behavior, LSP is violated.',
      'Square/Rectangle is the canonical anti-example — mention it before the interviewer asks.',
      'Prefer composition or separate types when behavior diverges significantly.',
      'LSP connects IS-A inheritance to safe polymorphism — they are inseparable.',
      'Check: does override throw UnsupportedOperationException? Likely LSP violation.',
      'Design by contract: preconditions, postconditions, invariants must be compatible.',
      'Fix violations by splitting interfaces (ISP) rather than forcing broken hierarchies.',
    ],
    commonMistakes: [
      'Defending Square extends Rectangle with "it works for our use case."',
      'Using inheritance for shared code when LSP does not hold.',
      'Overriding parent methods to do nothing — silent contract breakage.',
      'Ignoring that LSP applies to interface implementations, not just class inheritance.',
    ],
  },
  {
    letter: 'I',
    body: solidBodies.I,
    title: 'Interface Segregation Principle',
    description:
      'Clients should not depend on methods they do not use; prefer small, focused interfaces.',
    definition:
      'ISP splits fat interfaces into role-specific ones so implementers are not forced to provide empty, throwing, or meaningless stub methods. Clients depend only on the capabilities they need, which keeps coupling low and makes mock implementations trivial in tests. A `Worker` interface with `work()`, `eat()`, and `sleep()` forces `Robot` to implement `eat()` — absurd. Segregated `Workable` and `Eatable` interfaces let each type implement only what applies. ISP applies beyond classes: REST APIs with bloated endpoints, fat DTOs, and god-service interfaces all benefit from segregation. It works hand-in-hand with DIP — inject the smallest interface slice the client needs.',
    analogy:
      'A smart TV remote with only power, volume, and input buttons vs a universal remote with 200 buttons where half do nothing on your device. The slim remote (segregated interface) is easier to use and does not expose irrelevant actions. You should not need a PhD to change the channel.',
    detailedExample:
      'In a printer/scanner/fax multifunction device, avoid one `IMachine` with `print()`, `scan()`, `fax()`. A basic printer should not stub `scan()`. Define `Printer`, `Scanner`, `Fax` interfaces. `SimplePrinter implements Printer` only. `AllInOneDevice implements Printer, Scanner, Fax`. Client code depending on `Printer` never sees unused scan methods — tests mock only `Printer`.',
    whenAsked:
      'Q: "Show an ISP violation" — Answer: fat `Worker` interface applied to `Robot` that must stub `eat()`. Fix: split into `Workable`, `Eatable`; Human implements both, Robot implements `Workable`.\n\nQ: "How small should interfaces be?" — Answer: one cohesive role or capability. `Serializable`, `Comparable`, `Runnable` are good examples. Avoid one-method-per-interface absurdity unless the role is truly distinct.\n\nQ: "ISP vs SRP — what is the difference?" — Answer: SRP is about class responsibilities; ISP is about interface surface area clients must depend on. Fat interface can force classes to mix concerns.',
    codePython: `from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self) -> None:
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None:
        pass

class Human(Workable, Eatable):
    def work(self) -> None:
        print("Working")

    def eat(self) -> None:
        print("Eating")

class Robot(Workable):
    def work(self) -> None:
        print("Working")
    # no forced eat() stub`,
    codeJava: `interface Workable {
    void work();
}

interface Eatable {
    void eat();
}

class Human implements Workable, Eatable {
    @Override
    public void work() {
        System.out.println("Working");
    }

    @Override
    public void eat() {
        System.out.println("Eating");
    }
}

class Robot implements Workable {
    @Override
    public void work() {
        System.out.println("Working");
    }
    // no forced eat() stub
}`,
    interviewTips: [
      'Many small interfaces beat one "god interface" with unrelated methods.',
      'Fat interfaces force dummy implementations — classic interview code smell.',
      'Role interfaces (Printable, Serializable, Closeable) are textbook examples.',
      'Works with DI: inject only the interface slice the client needs.',
      'Adapter pattern can wrap a fat legacy interface behind slim client-facing ones.',
      'REST: prefer focused endpoints over one mega `/api/doEverything` resource.',
      'ISP + LSP: segregate rather than inherit broken behavior.',
    ],
    commonMistakes: [
      'Splitting interfaces so finely that wiring and discovery become painful.',
      'Creating ISP-compliant interfaces but injecting the fat parent type anyway.',
      'Stub methods that throw UnsupportedOperationException instead of segregating.',
      'Confusing ISP with "one method per interface" — role cohesion matters.',
    ],
  },
  {
    letter: 'D',
    body: solidBodies.D,
    title: 'Dependency Inversion Principle',
    description:
      'High-level modules should depend on abstractions, not concrete implementations.',
    definition:
      'DIP inverts the typical dependency direction: business logic (high-level) defines interfaces it needs, and low-level details (database, email, file system) implement them. Both layers depend on abstractions, not on each other directly. Without DIP, `OrderService` imports `PostgresOrderRepository` and becomes untestable without a real database. With DIP, `OrderService` depends on `OrderRepository` interface; Postgres and in-memory implementations are interchangeable. This is the foundation of testable, swappable infrastructure in LLD. Note: DIP (principle) is not the same as DI (dependency injection technique), but DI is how you apply DIP at runtime.',
    analogy:
      'A wall outlet standard: your lamp depends on the 120V/230V socket specification, not on a specific power plant or generator type. The utility implements the standard behind the wall; you plug in without caring whether electricity comes from solar, coal, or hydro. The abstraction (outlet spec) decouples appliance from generation.',
    detailedExample:
      'In a logging framework, `ApplicationService` depends on `Logger` interface with `info()` and `error()`. `FileLogger`, `CloudWatchLogger`, and `NoOpLogger` implement it. Production wires `CloudWatchLogger`; unit tests inject `NoOpLogger` or a capturing fake. `ApplicationService` never imports AWS SDK — high-level policy inverted from low-level detail.',
    whenAsked:
      'Q: "How do you test without a real database?" — Answer: DIP — `Service` depends on `Repository` interface; tests inject `InMemoryRepository`. No Postgres required.\n\nQ: "What is the difference between DIP and DI?" — Answer: DIP is the principle (depend on abstractions); DI is the technique (constructor injection, IoC container) to supply implementations. DI implements DIP.\n\nQ: "Who owns the interface — consumer or implementer?" — Answer: ideally the consumer (high-level module defines the port it needs). Hexagonal architecture calls these ports (defined by app) and adapters (infra implements).',
    codePython: `from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Order:
    id: str

class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> None:
        pass

class PostgresOrderRepository(OrderRepository):
    def save(self, order: Order) -> None:
        print(f"Saving order {order.id} to Postgres")

class OrderService:
    def __init__(self, repo: OrderRepository) -> None:
        self.repo = repo

    def place(self, order: Order) -> None:
        self.repo.save(order)

# Tests inject InMemoryOrderRepository — no Postgres needed
OrderService(PostgresOrderRepository())`,
    codeJava: `interface OrderRepository {
    void save(Order order);
}

record Order(String id) {}

class PostgresOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        System.out.println("Saving order " + order.id() + " to Postgres");
    }
}

class OrderService {
    private final OrderRepository repo;

    OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    void place(Order order) {
        repo.save(order);
    }
}

// Tests inject InMemoryOrderRepository — no Postgres needed
new OrderService(new PostgresOrderRepository());`,
    interviewTips: [
      'High-level policy should not import low-level details directly.',
      'Abstractions belong with the consumer (port) or shared domain module.',
      'Dependency Injection (constructor injection) is how you wire implementations at runtime.',
      'DIP + interfaces = easy unit tests with mocks, fakes, and stubs.',
      'Factory or IoC container resolves concrete types at composition root.',
      'Contrast with naive design: Service → new PostgresRepo() inside constructor (DIP violation).',
      'Hexagonal/ports-and-adapters architecture is DIP at system scale.',
    ],
    commonMistakes: [
      'Instantiating concrete dependencies inside the class (`new PostgresRepo()`).',
      'Putting interfaces in the infrastructure package instead of domain/application layer.',
      'Confusing DIP with "inject everything" — only invert boundaries that vary or need testing.',
      'Creating an interface per class without a swappable or testable motivation.',
    ],
  },
];
