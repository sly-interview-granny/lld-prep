import type { InterviewConcept } from './types';

export type Concept = InterviewConcept;

export const oopConcepts: Concept[] = [
  {
    title: 'Abstraction',
    description: 'Hides unnecessary details to reduce complexity.',
    definition:
      'Abstraction focuses on what an object does rather than how it does it, exposing only the essential operations callers need. You define a contract — through an interface, abstract class, or a small public API — and push implementation details behind that boundary. In system design, abstraction is how you manage complexity: each layer (controller → service → repository) speaks in terms of capabilities, not concrete classes. It reduces coupling because clients depend on stable contracts, not volatile internals. Interviewers care about abstraction because it is the foundation of modular LLD: you can swap Stripe for PayPal without rewriting checkout logic. Good abstraction also makes code self-documenting — the interface name tells you what is possible without reading 200 lines of implementation.',
    analogy:
      'Driving a car: you use the steering wheel, pedals, and ignition without knowing fuel injection timing, ABS sensor calibration, or transmission gear ratios. The dashboard shows speed and fuel level — the outcomes you care about — while the engine management system handles thousands of decisions per second behind the scenes. If the manufacturer upgrades from carburetor to fuel injection, your driving experience stays the same because the abstraction layer (pedals and wheel) did not change.',
    detailedExample:
      'In a notification service, define a `NotificationChannel` interface with `send(recipient, message)`. Callers in `OrderService` depend only on that interface. Concrete classes `EmailChannel`, `SmsChannel`, and `PushChannel` hide SMTP configuration, Twilio API keys, and FCM payload formatting. When product adds Slack alerts, you add `SlackChannel` without touching order placement code — the abstraction isolates the "what" (deliver a message) from the "how" (protocol-specific delivery).',
    whenAsked:
      'Q: "What is abstraction in OOP?" — Answer: simplifying interaction by exposing essential behavior and hiding implementation. Give the payment processor example: checkout calls `charge()`, not Stripe HTTP endpoints.\n\nQ: "How is abstraction different from encapsulation?" — Answer: abstraction is about reducing conceptual complexity (what you see); encapsulation is about protecting internal state (what you can touch). A `BankAccount` encapsulates balance; a `PaymentProcessor` interface abstracts away provider details. They often work together but solve different problems.\n\nQ: "When would you use an abstract class vs an interface?" — Answer: interface for pure contracts with no shared state; abstract class when subclasses share common fields or default behavior. In Java, prefer interfaces for capability contracts; use abstract classes when you have genuine shared implementation.',
    codePython: `from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount: float, currency: str) -> str:
        pass

class StripeProcessor(PaymentProcessor):
    def charge(self, amount: float, currency: str) -> str:
        # Stripe API details hidden from callers
        return f"Stripe charged {amount} {currency}"

def checkout(processor: PaymentProcessor, total: float) -> str:
    return processor.charge(total, "USD")`,
    codeJava: `interface PaymentProcessor {
    String charge(double amount, String currency);
}

class StripeProcessor implements PaymentProcessor {
    @Override
    public String charge(double amount, String currency) {
        // Stripe API details hidden from callers
        return "Stripe charged " + amount + " " + currency;
    }
}

class Checkout {
    static String checkout(PaymentProcessor processor, double total) {
        return processor.charge(total, "USD");
    }
}`,
    interviewTips: [
      'Abstraction = exposing essential behavior, hiding implementation — say both parts explicitly.',
      'Contrast with encapsulation: abstraction simplifies the mental model; encapsulation protects mutable state.',
      'Use interfaces or abstract classes to define contracts that high-level modules depend on.',
      'In layered architecture, each tier abstracts the tier below (service abstracts repository, repository abstracts DB).',
      'Leaky abstractions are a red flag — if callers need to know HTTP status codes, the abstraction failed.',
      'Compare to information hiding: abstraction is the design decision; encapsulation is the mechanism.',
      'Mention that over-abstraction (interfaces for everything) hurts readability — balance with YAGNI.',
    ],
    commonMistakes: [
      'Confusing abstraction with encapsulation — they are related but not interchangeable.',
      'Exposing internal types in public APIs (returning raw DB rows instead of domain objects).',
      'Creating "god interfaces" with 15 methods instead of small, focused contracts.',
      'Saying abstraction means "making things abstract" — it means simplifying the view, not removing concreteness.',
    ],
  },
  {
    title: 'Polymorphism',
    description:
      'Allows one interface to be used for general activities (flexibility).',
    definition:
      'Polymorphism lets different classes respond to the same message or interface in their own way, enabling one piece of code to work with many types. Runtime (dynamic) polymorphism uses method overriding: the actual object type at call time decides which implementation runs. Compile-time (static) polymorphism uses method overloading or generics to resolve behavior before execution. It is the mechanism that makes "program to an interface, not an implementation" practical — your `alert_user(notifier)` function works with email, SMS, or push without branching on type. Polymorphism reduces conditional complexity and is the backbone of the Strategy, Factory, and Template Method patterns. In interviews, showing polymorphism often means refactoring an if/else chain into a hierarchy or strategy map.',
    analogy:
      'A universal remote with a "Play" button: pressing Play starts a DVD player, a streaming app, or a game console — same action, different behavior depending on the device connected. You do not reprogram the remote for each device; each device implements the "Play" contract in its own way. Adding a new Blu-ray player means plugging it in, not rewriting the remote firmware.',
    detailedExample:
      'In a ride-sharing fare calculator, define `PricingStrategy` with `calculate(distance, duration)`. `StandardPricing`, `SurgePricing`, and `PoolPricing` each implement the method differently. `TripService` holds a `PricingStrategy` reference and calls `calculate()` without knowing which algorithm runs. When the business adds subscription pricing, you add `SubscriptionPricing` — no changes to trip booking logic. This replaces a brittle `if trip.type == "surge": ... elif ...` chain with polymorphic dispatch.',
    whenAsked:
      'Q: "Give an example of polymorphism." — Answer: a `Notifier` interface with `send()`; `EmailNotifier` and `SmsNotifier` implement it differently; client code calls `notifier.send()` and runtime picks the right class.\n\nQ: "What is the difference between compile-time and runtime polymorphism?" — Answer: compile-time = overloading (same method name, different params) or generics (`List<String>` vs `List<Integer>`); runtime = overriding where the JVM/Python dispatcher uses the actual object type. LLD interviews focus on runtime polymorphism.\n\nQ: "How does polymorphism relate to SOLID?" — Answer: it enables Open/Closed (extend via new subclasses) and Liskov Substitution (subtypes interchangeable). It is how you avoid modifying existing code when adding behavior.',
    codePython: `from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        pass

class EmailNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"Email: {message}")

class SmsNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"SMS: {message}")

def alert_user(notifier: Notifier, text: str) -> None:
    notifier.send(text)  # runtime type picks implementation

alert_user(EmailNotifier(), "Order shipped")
alert_user(SmsNotifier(), "Order shipped")`,
    codeJava: `interface Notifier {
    void send(String message);
}

class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("Email: " + message);
    }
}

class SmsNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("SMS: " + message);
    }
}

class Alerts {
    static void alertUser(Notifier notifier, String text) {
        notifier.send(text); // runtime type picks implementation
    }
}`,
    interviewTips: [
      'Same interface, different implementations — this is the phrase interviewers want to hear.',
      'Runtime polymorphism: method overriding + inheritance or interface implementation.',
      'Compile-time: method overloading (Java), generics (`List<T>`), templates (C++).',
      'Polymorphism eliminates type-checking if/else chains — show a before/after refactor.',
      'Pairs naturally with Strategy pattern for interchangeable algorithms.',
      'Requires substitutability — broken overrides violate Liskov and break polymorphism.',
      'Duck typing in Python is polymorphism without explicit inheritance — "if it quacks, use it."',
    ],
    commonMistakes: [
      'Calling any inheritance example "polymorphism" without explaining same-interface-different-behavior.',
      'Ignoring LSP — a subclass that throws on parent methods breaks polymorphic use.',
      'Using instanceof/switch on type when a polymorphic design would be cleaner.',
      'Confusing polymorphism with method overloading alone — overloading is only compile-time polymorphism.',
    ],
  },
  {
    title: 'Inheritance',
    description: 'Shares code across related classes (reusability).',
    definition:
      'Inheritance models an IS-A relationship: a subclass acquires fields and methods from a parent and can override or extend behavior. It promotes code reuse by letting you define common logic once in a base class and specialize in subclasses. However, inheritance creates tight coupling — changes to the parent can break all children (the fragile base class problem). Modern LLD guidance favors shallow hierarchies and composition when behavior varies independently of type taxonomy. Inheritance works well when subtypes are truly substitutable for the parent (Liskov Substitution Principle). In interviews, justify inheritance only when the relationship is permanent, structural, and substitutable — otherwise prefer interfaces plus composition.',
    analogy:
      'A corporate org chart: an "Engineer" inherits general employee benefits, PTO policies, and payroll rules from "Employee," then adds role-specific responsibilities like code reviews and sprint planning. HR does not rewrite benefits documentation for every role — shared rules live in the parent concept. But if a contractor needs completely different payroll rules, forcing them into the Employee hierarchy would break the model — that is when composition fits better.',
    detailedExample:
      'In a document editor, `Shape` is an abstract base with `draw()` and `move()`. `Circle`, `Rectangle`, and `Line` extend `Shape` and override `draw()` with geometry-specific rendering. The canvas calls `shape.draw()` polymorphically without knowing the concrete type. Shared behavior like `move()` lives in `Shape`; specialized rendering stays in subclasses. If you later need shapes that are also printable, prefer a `Printable` interface over cramming print logic into `Shape`.',
    whenAsked:
      'Q: "When would you use inheritance vs composition?" — Answer: inheritance for true IS-A with substitutability (SalariedEmployee IS-A Employee); composition for HAS-A or when behavior varies independently (Car HAS-A Engine). Default to composition unless the taxonomy is stable and substitutable.\n\nQ: "What is the fragile base class problem?" — Answer: modifying a parent class breaks subclasses that relied on specific execution order or protected method behavior. Subclasses become tightly coupled to parent internals.\n\nQ: "Extends vs implements — when to use which?" — Answer: `extends` for IS-A with shared implementation (one parent in Java); `implements` for CAN-DO capabilities (multiple interfaces). Prefer interfaces for contracts; classes for shared state/behavior.',
    codePython: `from abc import ABC, abstractmethod

class Employee(ABC):
    def __init__(self, name: str) -> None:
        self.name = name

    @abstractmethod
    def get_pay(self) -> float:
        return 0.0

class SalariedEmployee(Employee):
    def __init__(self, name: str, salary: float) -> None:
        super().__init__(name)
        self.salary = salary

    def get_pay(self) -> float:
        return self.salary / 12

class HourlyEmployee(Employee):
    def __init__(self, name: str, rate: float, hours: float) -> None:
        super().__init__(name)
        self.rate = rate
        self.hours = hours

    def get_pay(self) -> float:
        return self.rate * self.hours`,
    codeJava: `abstract class Employee {
    protected final String name;

    Employee(String name) {
        this.name = name;
    }

    abstract double getPay();
}

class SalariedEmployee extends Employee {
    private final double salary;

    SalariedEmployee(String name, double salary) {
        super(name);
        this.salary = salary;
    }

    @Override
    double getPay() {
        return salary / 12;
    }
}

class HourlyEmployee extends Employee {
    private final double rate;
    private final double hours;

    HourlyEmployee(String name, double rate, double hours) {
        super(name);
        this.rate = rate;
        this.hours = hours;
    }

    @Override
    double getPay() {
        return rate * hours;
    }
}`,
    interviewTips: [
      'IS-A relationship — subclass must be substitutable for parent everywhere (LSP).',
      'Prefer shallow hierarchies; deep trees (5+ levels) are hard to maintain and reason about.',
      'Inheritance shares implementation; interfaces share contracts only — combine both when needed.',
      'Say "composition over inheritance" when ownership or behavior varies independently of type.',
      'Protected members create coupling — subclasses depend on parent internals.',
      'Template Method pattern uses inheritance intentionally: parent defines skeleton, child fills steps.',
      'In Python, multiple inheritance works but brings MRO complexity — mention mixins for shared behavior.',
    ],
    commonMistakes: [
      'Using inheritance for code reuse alone without a true IS-A relationship.',
      'Deep inheritance trees where each level adds only one trivial method.',
      'Violating LSP (Square extends Rectangle) and defending it as "pragmatic."',
      'Inheriting from concrete classes when an interface would decouple better.',
    ],
  },
  {
    title: 'Encapsulation',
    description:
      "Restricts direct access to data to protect an object's state.",
    definition:
      'Encapsulation bundles data and the methods that operate on it into a single unit, exposing only what is necessary through a controlled public API. Private or protected fields prevent external code from putting objects into invalid states — you cannot set balance to -1000 if withdrawal goes through `withdraw()`. Validation, invariants, and side effects stay inside the class boundary, so the object enforces its own rules regardless of who calls it. Strong encapsulation makes refactoring safe because internal representation can change without affecting callers. In concurrent systems, encapsulation also helps thread safety by funneling all state mutations through synchronized methods. Interviewers often test whether you understand that getters and setters alone are not encapsulation if they expose raw mutable internals.',
    analogy:
      'An ATM: you cannot open the vault, edit the ledger, or dispense arbitrary cash amounts directly. You interact through buttons and slots — deposit, withdraw, check balance — and the bank enforces rules internally (daily limits, fraud checks, sufficient funds). Even if you could peek at the screen balance, you cannot corrupt the account by writing to memory — the interface is the only path to change state.',
    detailedExample:
      'In an e-commerce `Order` class, keep `items`, `status`, and `total` private. Expose `addItem(product, qty)` which validates stock and recalculates total, and `cancel()` which only works if status is PENDING. External code cannot set `status = SHIPPED` directly or add negative quantities. A `ShoppingCart` service calls these methods without knowing whether items are stored in a list or a database — the Order maintains its own invariants.',
    whenAsked:
      'Q: "What is encapsulation and why does it matter?" — Answer: hiding internal state and requiring interaction through methods so invariants are always preserved. Matters because it prevents invalid states, enables safe refactoring, and localizes validation logic.\n\nQ: "Are getters and setters encapsulation?" — Answer: only if they enforce rules. A `setBalance()` that accepts any value is not encapsulation — it is a public field with extra steps. True encapsulation uses behavior methods like `deposit()` and `withdraw()`.\n\nQ: "How does encapsulation help with testing?" — Answer: you test public behavior, not internal fields. Implementation can change (array to linked list) without breaking tests that exercise the public API.',
    codePython: `class BankAccount:
    def __init__(self) -> None:
        self.__balance = 0.0

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Invalid deposit")
        self.__balance += amount

    def withdraw(self, amount: float) -> None:
        if amount > self.__balance:
            raise ValueError("Insufficient funds")
        self.__balance -= amount

    def get_balance(self) -> float:
        return self.__balance

account = BankAccount()
account.deposit(100)
# account.__balance = 1_000_000  # not allowed — state protected`,
    codeJava: `class BankAccount {
    private double balance = 0;

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Invalid deposit");
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}

// BankAccount account = new BankAccount();
// account.deposit(100);
// account.balance = 1_000_000; // compile error — state protected`,
    interviewTips: [
      'Hide fields (private/protected), expose behavior through methods — not raw data.',
      'Encapsulation preserves invariants — the object stays valid after every operation.',
      'Getters alone are not encapsulation if callers can still break rules via setters.',
      'Immutability (final fields, no setters, defensive copies) is the strongest form of encapsulation.',
      'Tell-don\'t-ask: call `account.withdraw(50)` instead of get balance, subtract, set balance.',
      'Package-private (Java) or module-level visibility balances hiding with testability.',
      'Data classes/DTOs intentionally break encapsulation for transfer — that is fine at boundaries.',
    ],
    commonMistakes: [
      'Making every field public "for simplicity" — destroys invariant protection.',
      'Returning mutable internal collections directly (`return this.items`) — callers can modify state.',
      'Treating JavaBean getters/setters as automatically good design without validation.',
      'Confusing encapsulation with encryption or security — it is about API boundaries, not cryptography.',
    ],
  },
];
