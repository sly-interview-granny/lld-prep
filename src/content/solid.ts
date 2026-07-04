import type { SolidPrinciple } from './types';

export type { SolidPrinciple };

export const solidPrinciples: SolidPrinciple[] = [
  {
    letter: 'S',
    title: 'Single Responsibility Principle',
    description: 'A class should have only one reason to change.',
    definition:
      'SRP states that a class should have a single, well-defined responsibility — one axis of change. If a class handles both order validation and email notifications, a change to SMTP config forces you to redeploy order logic. Splitting responsibilities into focused classes improves testability and readability.',
    analogy:
      'A restaurant: the chef cooks, the waiter serves, the cashier handles payments. If one person did all three, a menu change and a POS upgrade would both disrupt the same person — too many reasons to change.',
    whenAsked:
      'Very common opener: "Explain SOLID" or "What violates SRP in this code?" Interviewers show a God class and ask you to refactor. Follow-ups: one reason to change vs one method, granularity (how small is too small), and SRP at module/service level.',
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
      'SRP enables smaller units that are easier to test and reuse.',
    ],
  },
  {
    letter: 'O',
    title: 'Open/Closed Principle',
    description: 'Open for extension, closed for modification.',
    definition:
      'OCP says you should add new behavior by extending the system (new classes, strategies, plugins) rather than editing existing, tested code. Stable abstractions define extension points; concrete variants plug in without modifying the core. This reduces regression risk as requirements grow.',
    analogy:
      'USB ports: manufacturers add new devices (keyboards, drives) without redesigning the laptop motherboard each time. The port is the stable interface; devices are extensions.',
    whenAsked:
      'Asked after showing switch/if-else on types: "How would you add a new payment method?" Follow-ups: relationship to Strategy pattern, whether OCP applies to every change, and trade-offs of premature abstraction.',
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
      'Extend via new implementations, not by editing switch statements.',
      'Strategy, Template Method, and Factory patterns support OCP.',
      'Requires abstractions upfront — balance with YAGNI.',
      'Changing a bug fix inside a class is fine; OCP targets behavioral extension.',
    ],
  },
  {
    letter: 'L',
    title: 'Liskov Substitution Principle',
    description:
      'Subtypes must be substitutable for their base types without breaking correctness.',
    definition:
      'LSP requires that if S is a subtype of T, anywhere you use T you can use S without the program knowing or breaking. Subclasses must honor the parent\'s contract: same preconditions, same or weaker; same or stronger postconditions; no surprising exceptions or no-ops. Violations often appear as broken IS-A hierarchies.',
    analogy:
      'Substituting a trained substitute teacher for the regular teacher: students expect the same syllabus and grading rules. If the substitute refuses to teach math because they "only do science," the substitution contract is broken.',
    whenAsked:
      'Famous trap: "Square extends Rectangle — valid?" Follow-ups: pre/postconditions, covariant return types, when to favor composition, and detecting LSP violations in legacy code.',
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
      'Square/Rectangle is the canonical anti-example — say it proactively.',
      'Prefer composition or separate types when behavior diverges.',
      'LSP connects IS-A inheritance to safe polymorphism.',
    ],
  },
  {
    letter: 'I',
    title: 'Interface Segregation Principle',
    description:
      'Clients should not depend on methods they do not use; prefer small, focused interfaces.',
    definition:
      'ISP splits fat interfaces into role-specific ones so implementers are not forced to provide empty or throwing stub methods. Clients depend only on the capabilities they need, which keeps coupling low and makes mock implementations easier in tests.',
    analogy:
      'A smart TV remote with only the buttons you need vs a universal remote with 200 buttons where half do nothing on your device. Segregated interfaces are the slim remote.',
    whenAsked:
      'Show a bloated interface like Worker with work(), eat(), sleep() applied to a Robot. Follow-ups: interface vs abstract class, how many methods per interface, and applying ISP to REST API design.',
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
      'Many small interfaces beat one "god interface."',
      'Fat interfaces force dummy implementations — code smell in interviews.',
      'Role interfaces (Printable, Serializable) are classic examples.',
      'Works with DI: inject only the interface slice the client needs.',
    ],
  },
  {
    letter: 'D',
    title: 'Dependency Inversion Principle',
    description:
      'High-level modules should depend on abstractions, not concrete implementations.',
    definition:
      'DIP inverts the typical dependency direction: business logic (high-level) defines interfaces it needs, and low-level details (DB, email, file system) implement them. Both layers depend on abstractions, not on each other directly. This is the foundation of testable, swappable infrastructure in LLD.',
    analogy:
      'A wall outlet standard: your lamp depends on the 120V socket spec, not on a specific power plant. The utility implements the standard; you plug in without caring about the generator type.',
    whenAsked:
      'Asked when designing services: "How do you test without a real database?" Follow-ups: DIP vs DI (dependency injection), IoC containers, constructor injection, and how DIP enables mocking.',
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
      'Abstractions belong with the consumer (port) or shared module.',
      'Dependency Injection is how you wire implementations at runtime.',
      'DIP + interfaces = easy unit tests with mocks/fakes.',
    ],
  },
];
