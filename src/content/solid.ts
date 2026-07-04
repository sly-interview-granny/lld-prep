import type { SolidPrinciple } from './types';

export type { SolidPrinciple };

export const solidPrinciples: SolidPrinciple[] = [
  {
    letter: 'S',
    title: 'Single Responsibility Principle',
    description: 'A class should have only one reason to change.',
    definition:
      'The Single Responsibility Principle (SRP) states that a class should have one, and only one, reason to change — meaning it should encapsulate a single axis of responsibility tied to one actor or stakeholder concern. If OrderService validates orders, calculates tax, persists to the database, and sends confirmation emails, a change to SMTP configuration forces redeploying order validation logic. Splitting these into OrderValidator, TaxCalculator, OrderRepository, and NotificationService isolates change blast radius. SRP improves testability because each unit has a narrow surface area to mock and assert. It does not mean "one method per class" — cohesive operations that belong to the same concern (all CRUD on Order) can live together. At scale, SRP applies to modules and microservices too: a payment service should not also own user profile photos.',
    analogy:
      'In a restaurant, the chef cooks, the waiter serves, and the cashier handles payments — each role has one primary reason their workflow changes (menu updates affect the chef, POS upgrades affect the cashier, table layout affects the waiter). If one person did all three jobs, a menu change and a new payment terminal would both disrupt the same individual, creating unnecessary coupling and bottlenecks.',
    detailedExample:
      'In an e-commerce codebase, refactor UserManager (auth + CRUD + email + password reset) into AuthService, UserRepository, EmailNotifier, and PasswordResetHandler. When marketing requests a new welcome email template, you touch EmailNotifier only — OrderService and AuthService remain untouched. Unit tests for tax calculation no longer need to mock SMTP. This is the refactor interviewers expect when they show a 400-line "God class."',
    whenAsked:
      'Q1: "Explain SOLID" — Give one crisp sentence per letter; SRP is usually first: one reason to change per class/module. Q2: "What violates SRP in this code?" — Identify mixed concerns (persistence + UI + business rules in one class) and name the separate actors who would request changes. Q3: "Isn\'t one method per class too granular?" — Clarify SRP is about cohesive responsibility, not counting methods. PayCalculator with calculate(), calculateOvertime(), and getTaxBracket() is fine — all change when payroll rules change.',
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
      'One class = one reason to change, tied to one actor/stakeholder (Robert Martin\'s formulation).',
      'Not "one method only" — cohesive related behavior sharing one change driver belongs together.',
      'God classes (UserManager doing auth + CRUD + email) are the classic violation — proactively split them.',
      'SRP enables smaller units that are easier to test, review, and reuse across features.',
      'Apply at module level too: a reporting package should not own payment capture logic.',
      'Watch for Feature Envy — methods that mostly use another class\'s data signal misplaced responsibility.',
      'Pitfall: splitting into dozens of one-liner classes creates navigation overhead without real separation of concerns.',
    ],
    commonMistakes: [
      'Interpreting SRP as literally one public method per class.',
      'Separating read and write into different classes when they share identical change drivers and invariants.',
      'Ignoring SRP at service boundaries — microservices that do "everything for User" recreate monolith problems.',
    ],
  },
  {
    letter: 'O',
    title: 'Open/Closed Principle',
    description: 'Open for extension, closed for modification.',
    definition:
      'The Open/Closed Principle (OCP) says software entities should be open for extension but closed for modification — you add new behavior by introducing new code (classes, plugins, strategies) rather than editing existing, tested production code. Stable abstractions define extension points; concrete variants plug in without changing the core module. This reduces regression risk as requirements grow: adding CryptoPayment should mean a new CryptoPaymentProcessor class, not a modified switch in CheckoutService. OCP does not forbid bug fixes inside existing classes — it targets behavioral extension. Achieving OCP typically requires upfront abstraction (interfaces, abstract base classes, registries), which must be balanced against YAGNI when only one variant exists today.',
    analogy:
      'USB-C ports on a laptop illustrate OCP: manufacturers ship keyboards, drives, and docks that extend functionality without redesigning the motherboard for each device. The port is the stable abstraction; each peripheral is an extension. You do not solder a new circuit every time you plug in a mouse — you extend through the standard interface.',
    detailedExample:
      'In a checkout system, Checkout.total(price, discount) delegates to Discount.apply() instead of if discountType == "STUDENT": .... Adding SeniorDiscount, EmployeeDiscount, or PromoCodeDiscount means new Discount implementations registered in a factory or DI container — Checkout remains unchanged and its unit tests stay green. The same approach applies to export formats (PdfExporter, CsvExporter), pricing rules, and notification channels.',
    whenAsked:
      'Q1: "How would you add a new payment method without changing existing code?" — Introduce PaymentProcessor interface, implement new class, wire via DI/factory; Checkout depends on abstraction. Q2: "Does OCP apply to every change?" — No; bug fixes and internal refactors modify existing code. OCP targets new behavioral variants. Q3: "OCP vs YAGNI?" — Start concrete when one variant exists; extract abstraction when the second variant arrives or when extension frequency is predictable.',
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
      'Extend via new implementations, not by editing growing switch/if-else chains on type enums.',
      'Strategy, Template Method, Factory, and Plugin/registry patterns are OCP enablers — name them explicitly.',
      'Requires abstractions upfront — balance with YAGNI; refactor to OCP when second variant appears.',
      'Bug fixes inside a class are fine; OCP targets adding new behavior without touching stable core logic.',
      'Registries (Map<String, Handler>) decouple discovery from core processing loops.',
      'Contrast with violation: checkout switch on paymentType that grows every sprint — maintenance nightmare.',
      'Pitfall: abstracting every line of code "for OCP" before requirements exist — over-engineering.',
    ],
    commonMistakes: [
      'Adding another elif branch while claiming to follow OCP — modification is not extension.',
      'Creating interfaces with only one implementation and no foreseeable second variant (premature abstraction).',
      'Forgetting to register new implementations in factory/DI config — extension class exists but is never wired.',
    ],
  },
  {
    letter: 'L',
    title: 'Liskov Substitution Principle',
    description:
      'Subtypes must be substitutable for their base types without breaking correctness.',
    definition:
      'The Liskov Substitution Principle (LSP), named after Barbara Liskov, requires that if S is a subtype of T, objects of type S must be usable anywhere objects of type T are expected without altering the correctness of the program. Subclasses must honor the parent\'s contract: preconditions cannot be strengthened, postconditions cannot be weakened, and invariants of the parent must remain true. Subtypes should not throw unexpected exceptions, return null where the parent never did, or override methods to no-op when callers expect real work. LSP is what makes IS-A inheritance and runtime polymorphism trustworthy — without it, callers need defensive instanceof checks that defeat the purpose of polymorphism. Violations often reveal a modeling error: the inheritance hierarchy does not reflect true substitutability.',
    analogy:
      'A trained substitute teacher must deliver the same syllabus, assign homework on schedule, and grade by the rubric students expect from the regular teacher. If the substitute refuses to teach math because they "only do science," or changes grading rules mid-semester, the substitution contract is broken — students and administrators cannot rely on the role swap anymore.',
    detailedExample:
      'In a graphics library, Rectangle has setWidth, setHeight, and area(). A function doubleWidth(rect: Rectangle) doubles width and expects area to double accordingly. Square extends Rectangle and forces width == height on every setter — doubleWidth breaks because area quadruples instead of doubling. Fix: separate Square and Rectangle types, or model Shape with read-only dimensions, or use composition — never inherit Square from mutable Rectangle.',
    whenAsked:
      'Q1: "Is Square extends Rectangle valid?" — No; Square violates Rectangle\'s independent width/height contract. Walk through doubleWidth and show broken area. Q2: "How do you detect LSP violations?" — Subclass overrides that throw UnsupportedOperationException, empty overrides, tightened preconditions, or callers that must check concrete type before calling. Q3: "LSP vs duck typing?" — Duck typing allows structural compatibility; LSP still demands behavioral compatibility wherever a declared supertype is expected.',
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
      'If a subclass breaks callers expecting parent behavior, LSP is violated — inheritance was the wrong tool.',
      'Square/Rectangle is the canonical anti-example — volunteer it when discussing IS-A or polymorphism.',
      'Prefer composition or separate types when dimensions/behavior diverge in ways callers cannot ignore.',
      'LSP connects IS-A inheritance to safe polymorphism — it is the behavioral half of the IS-A claim.',
      'Watch for overrides that throw NotImplementedException or silently ignore calls — red flags.',
      'Design by contract: document pre/postconditions; subclasses must preserve them.',
      'Pitfall: assuming structural similarity (both have width/height) implies valid IS-A substitutability.',
    ],
    commonMistakes: [
      'Inheriting solely to reuse code when the subtype cannot honor all parent method semantics.',
      'Overriding parent methods to throw "not supported" for subclass instances used polymorphically.',
      'Weakening guarantees (e.g., parent promises non-null, subclass returns null) without updating callers.',
    ],
  },
  {
    letter: 'I',
    title: 'Interface Segregation Principle',
    description:
      'Clients should not depend on methods they do not use; prefer small, focused interfaces.',
    definition:
      'The Interface Segregation Principle (ISP) states that no client should be forced to depend on methods it does not use — prefer many small, role-specific interfaces over one large "fat" interface. When Robot implements Worker with work(), eat(), and sleep(), Robot must stub eat() and sleep() with empty bodies or exceptions. Splitting into Workable, Eatable, and Sleepable lets Human implement all three while Robot implements only Workable. ISP reduces coupling because clients see only the capabilities they need, which simplifies mocking in tests and prevents accidental calls to irrelevant operations. It complements SRP at the interface level: interfaces themselves should represent one cohesive role. ISP also applies to API design — expose focused endpoints rather than one mega-service contract.',
    analogy:
      'A smart TV remote with only power, volume, and input-select buttons beats a universal remote with 200 buttons where half do nothing on your device. The slim remote segregates controls to what your TV actually supports — you are never forced to ignore or accidentally press irrelevant buttons. Segregated interfaces are that slim remote for your code.',
    detailedExample:
      'In a document processing system, replace PrintableScannerFaxMachine with separate Printable, Scannable, and Faxable interfaces. BasicPrinter implements Printable; AllInOneDevice implements all three; EmailSender implements neither print nor scan. DocumentService depends on Printable when generating PDFs — it never sees fax methods. Adding cloud upload means a new CloudUploadable interface without bloating printer contracts.',
    whenAsked:
      'Q1: "Show an ISP violation." — Fat Worker interface with eat()/sleep() forced on Robot; split into role interfaces. Q2: "Interface vs abstract class for ISP?" — Interfaces segregate capabilities cleanly; abstract classes carry shared state but can still be split into multiple interfaces implemented by one class. Q3: "How does ISP relate to REST APIs?" — Clients consume focused resources (/orders, /payments) instead of one god endpoint with dozens of unrelated operations.',
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
      'Many small, role-specific interfaces beat one god interface that forces dummy implementations.',
      'Fat interfaces with unrelated methods signal ISP violation — split by client use case or actor role.',
      'Role interfaces (Printable, Serializable, Closeable) are textbook examples interviewers recognize.',
      'Works with DI: inject Workable to a task runner, not WorkerWithHumanNeeds when the client is a factory bot.',
      'ISP + SRP: class has one responsibility; interface exposes one role to its clients.',
      'In Java, default methods on interfaces can share code without forcing unrelated implementers.',
      'Pitfall: splitting interfaces so finely that wiring and discovery become harder than the problem warrants.',
    ],
    commonMistakes: [
      'One interface per class by reflex even when clients genuinely need the full surface area.',
      'Leaving fat interfaces and using adapter classes everywhere instead of fixing the root contract.',
      'Segregating interfaces but injecting the fat super-interface type in constructors anyway.',
    ],
  },
  {
    letter: 'D',
    title: 'Dependency Inversion Principle',
    description:
      'High-level modules should depend on abstractions, not concrete implementations.',
    definition:
      'The Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules — both should depend on abstractions. Business policy (OrderService, pricing rules, workflow orchestration) defines the interfaces it needs; infrastructure (PostgresOrderRepository, SmtpEmailSender, S3FileStore) implements those interfaces. Dependency direction points inward toward domain logic, not outward toward frameworks and databases. This inversion is the foundation of hexagonal/ports-and-adapters architecture and clean architecture layering. DIP enables unit testing without real databases or network calls by injecting in-memory fakes. Note: DIP is about dependency direction and abstractions; Dependency Injection (DI) is the technique for supplying implementations at runtime — related but not identical.',
    analogy:
      'Electrical wall outlets standardize 120V/240V socket specs so your lamp depends on the outlet standard, not on a specific power plant or generator type. The utility company implements the standard behind the wall; you plug in without knowing whether electricity comes from coal, solar, or hydro. Swapping the backend power source does not require rewiring your lamp.',
    detailedExample:
      'OrderService (high-level) depends on OrderRepository interface defined alongside domain models. PostgresOrderRepository, MongoOrderRepository, and InMemoryOrderRepository implement save(order) differently. Production wiring injects Postgres; tests inject InMemory. Adding Redis cache means a new CachedOrderRepository decorator implementing the same interface — OrderService never imports JDBC or Redis SDK types.',
    whenAsked:
      'Q1: "How do you test without a real database?" — OrderService accepts OrderRepository interface; tests pass InMemoryOrderRepository. DIP makes swapping trivial. Q2: "DIP vs Dependency Injection?" — DIP is the design rule (depend on abstractions); DI is the mechanism (constructor/setter injection, IoC container) to provide concrete instances. Q3: "Where should interfaces live?" — With the consumer (application/domain layer) as "ports," or in a shared domain module — not buried inside infrastructure packages where high-level code must import low-level packages.',
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
      'High-level policy must not import low-level details (JDBC, HTTP clients) directly — both depend on abstractions.',
      'Abstractions belong with the consumer (port) or shared domain — infrastructure implements them (adapter).',
      'Dependency Injection is how you wire concrete implementations at runtime; DIP is why you do it.',
      'Constructor injection makes dependencies explicit and supports immutable, testable services.',
      'DIP + interfaces = easy unit tests with mocks, fakes, and in-memory implementations.',
      'Contrast violation: new PostgresOrderRepository() inside OrderService constructor — untestable, tightly coupled.',
      'Pitfall: creating interfaces for every class regardless of variation need — apply DIP where swap/test value exists.',
    ],
    commonMistakes: [
      'Confusing DIP with "use a DI framework" — Spring/Guice help, but the principle is about dependency direction.',
      'Putting repository interfaces in the infrastructure package, forcing domain to depend on infra layer.',
      'Injecting concrete classes because "we only have one implementation" — blocks testing and future swaps.',
    ],
  },
];
