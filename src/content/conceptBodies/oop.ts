export const abstractionBody = `**Abstraction** focuses on what an object does rather than how it does it — exposing only the essential operations callers need while hiding implementation details behind a stable contract.

Without abstraction, every module that needs payments would import Stripe SDK calls, SMTP libraries, and database drivers directly. Changes to any provider force edits across the entire codebase.

---

### The Core Concept: "What, Not How"

Imagine you are building a **checkout flow** for an e-commerce site.

* Initially, you only accept credit cards via Stripe.
* Soon, you add PayPal and UPI.
* Later, you need Apple Pay and buy-now-pay-later providers.

If you don't use abstraction, your \`CheckoutService\` becomes a tangle of provider-specific API calls:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — checkout knows every provider's internals
class CheckoutService:
    def charge(self, provider: str, amount: float) -> str:
        if provider == "stripe":
            # Stripe HTTP calls, API keys, error codes...
            return f"Stripe charged {amount}"
        elif provider == "paypal":
            # PayPal SDK details...
            return f"PayPal charged {amount}"
@java
// Anti-pattern — checkout knows every provider's internals
class CheckoutService {
    String charge(String provider, double amount) {
        if ("stripe".equals(provider)) {
            // Stripe HTTP calls, API keys, error codes...
            return "Stripe charged " + amount;
        } else if ("paypal".equals(provider)) {
            // PayPal SDK details...
            return "PayPal charged " + amount;
        }
        return "";
    }
}
\`\`\`

**The Problem:** Every new payment method requires modifying \`CheckoutService\`. Callers depend on volatile provider details instead of a stable capability contract.

---

### Applying Abstraction

#### Step 1: Define the Abstraction (Interface)

Extract the essential operation — "charge money" — into a contract:

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount: float, currency: str) -> str:
        pass
@java
interface PaymentProcessor {
    String charge(double amount, String currency);
}
\`\`\`

#### Step 2: Implement Concrete Providers

Each provider hides its own protocol behind the interface:

\`\`\`codetabs
@python
class StripeProcessor(PaymentProcessor):
    def charge(self, amount: float, currency: str) -> str:
        # Stripe API details hidden from callers
        return f"Stripe charged {amount} {currency}"
@java
class StripeProcessor implements PaymentProcessor {
    @Override
    public String charge(double amount, String currency) {
        // Stripe API details hidden from callers
        return "Stripe charged " + amount + " " + currency;
    }
}
\`\`\`

#### Step 3: High-Level Module Depends on the Abstraction

\`Checkout\` only knows \`PaymentProcessor\` — not Stripe:

\`\`\`codetabs
@python
def checkout(processor: PaymentProcessor, total: float) -> str:
    return processor.charge(total, "USD")
@java
class Checkout {
    static String checkout(PaymentProcessor processor, double total) {
        return processor.charge(total, "USD");
    }
}
\`\`\`

#### Step 4: Wire the Implementation at the Edge

The composition root (main, DI container) picks the concrete provider:

\`\`\`codetabs
@python
result = checkout(StripeProcessor(), 99.99)
@java
String result = Checkout.checkout(new StripeProcessor(), 99.99);
\`\`\`

---

### When to Use It

* **Multiple implementations of the same capability** — payments, notifications, storage backends.
* **Layered architecture** — each tier abstracts the tier below (controller → service → repository).
* **You want to swap implementations** without rewriting business logic.
* **Complex internals** that callers should never need to understand.

### Comparison: Abstraction vs Encapsulation

* **Abstraction** simplifies the mental model — you see *what* is possible, not *how* it works. A \`PaymentProcessor\` interface abstracts away provider protocols.
* **Encapsulation** protects mutable state — you cannot set \`balance = -1000\` directly; you call \`withdraw()\`. They often work together but solve different problems.
`;

export const polymorphismBody = `**Polymorphism** lets different classes respond to the same interface or message in their own way, enabling one piece of code to work with many types at runtime without branching on concrete classes.

Instead of checking \`if type == "email": ... elif type == "sms": ...\`, you call \`notifier.send(message)\` and the actual object type decides which implementation runs.

---

### The Core Concept: "Same Message, Different Behavior"

Imagine a **customer alert system** that can notify users by email, SMS, or push notification.

* Product starts with email only.
* Marketing wants SMS for urgent alerts.
* Mobile team adds push notifications.

Without polymorphism, \`alert_user()\` grows a brittle type-checking chain:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — branching on type instead of polymorphic dispatch
def alert_user(channel: str, text: str) -> None:
    if channel == "email":
        print(f"Email: {text}")
    elif channel == "sms":
        print(f"SMS: {text}")
    elif channel == "push":
        print(f"Push: {text}")
@java
// Anti-pattern — branching on type instead of polymorphic dispatch
class Alerts {
    static void alertUser(String channel, String text) {
        if ("email".equals(channel)) {
            System.out.println("Email: " + text);
        } else if ("sms".equals(channel)) {
            System.out.println("SMS: " + text);
        } else if ("push".equals(channel)) {
            System.out.println("Push: " + text);
        }
    }
}
\`\`\`

**The Problem:** Adding a channel means editing \`alert_user\` every time. The caller knows too much about implementation details.

---

### Applying Polymorphism

#### Step 1: Define a Common Interface

All notifiers share the same contract:

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        pass
@java
interface Notifier {
    void send(String message);
}
\`\`\`

#### Step 2: Implement Concrete Types

Each channel implements \`send()\` differently:

\`\`\`codetabs
@python
class EmailNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"Email: {message}")

class SmsNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"SMS: {message}")
@java
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
\`\`\`

#### Step 3: Write Code Against the Interface

One function works with any \`Notifier\`:

\`\`\`codetabs
@python
def alert_user(notifier: Notifier, text: str) -> None:
    notifier.send(text)  # runtime type picks implementation
@java
class Alerts {
    static void alertUser(Notifier notifier, String text) {
        notifier.send(text); // runtime type picks implementation
    }
}
\`\`\`

#### Step 4: Client Passes the Concrete Type

The caller chooses the implementation; \`alert_user\` stays unchanged:

\`\`\`codetabs
@python
alert_user(EmailNotifier(), "Order shipped")
alert_user(SmsNotifier(), "Order shipped")
@java
Alerts.alertUser(new EmailNotifier(), "Order shipped");
Alerts.alertUser(new SmsNotifier(), "Order shipped");
\`\`\`

---

### When to Use It

* **Multiple types share a behavior** but implement it differently — pricing, sorting, notifications.
* **You want to eliminate if/else chains** that check object type or enum values.
* **Runtime flexibility** — the correct implementation is chosen based on config, user choice, or injected dependency.
* **Open/Closed Principle** — add new types without modifying existing dispatch code.

### Comparison: Runtime vs Compile-Time Polymorphism

* **Runtime polymorphism** (method overriding): the JVM/Python dispatcher uses the actual object type at call time. This is what LLD interviews focus on.
* **Compile-time polymorphism** (method overloading, generics): resolved before execution. Useful but a different mechanism — mention both, emphasize runtime for design patterns.
`;

export const inheritanceBody = `**Inheritance** models an IS-A relationship where a subclass acquires fields and methods from a parent class and can override or extend behavior — promoting code reuse through a shared type hierarchy.

It works when subtypes are truly substitutable for the parent (Liskov Substitution Principle). When behavior varies independently of taxonomy, composition is usually the better tool.

---

### The Core Concept: "Specialized Kinds Share a Base"

Imagine a **payroll system** for a company with salaried and hourly employees.

* Both employee types have a name and need pay calculated.
* Salaried employees get a fixed monthly amount.
* Hourly employees get rate × hours worked.
* HR wants one \`Employee\` type for reporting, but different pay logic.

Without inheritance, you duplicate shared fields and scatter pay logic:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — duplicated structure, no shared contract
class SalariedEmployee:
    def __init__(self, name: str, salary: float) -> None:
        self.name = name
        self.salary = salary

    def get_pay(self) -> float:
        return self.salary / 12

class HourlyEmployee:
    def __init__(self, name: str, rate: float, hours: float) -> None:
        self.name = name
        self.rate = rate
        self.hours = hours

    def get_pay(self) -> float:
        return self.rate * self.hours

def process_payroll(workers: list) -> None:
    for w in workers:
        if hasattr(w, "salary"):
            pay = w.salary / 12
        else:
            pay = w.rate * w.hours
@java
// Anti-pattern — duplicated structure, no shared contract
class SalariedEmployee {
    String name;
    double salary;
    double getPay() { return salary / 12; }
}

class HourlyEmployee {
    String name;
    double rate, hours;
    double getPay() { return rate * hours; }
}
\`\`\`

**The Problem:** No shared \`Employee\` contract — payroll code branches on attributes instead of calling \`getPay()\` polymorphically.

---

### Applying Inheritance

#### Step 1: Extract the Base Class

Define shared state and the contract subclasses must fulfill:

\`\`\`codetabs
@python
from abc import ABC, abstractmethod

class Employee(ABC):
    def __init__(self, name: str) -> None:
        self.name = name

    @abstractmethod
    def get_pay(self) -> float:
        return 0.0
@java
abstract class Employee {
    protected final String name;

    Employee(String name) {
        this.name = name;
    }

    abstract double getPay();
}
\`\`\`

#### Step 2: Implement Specialized Subclasses

Each subtype overrides the abstract method:

\`\`\`codetabs
@python
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
        return self.rate * self.hours
@java
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
}
\`\`\`

#### Step 3: Write Polymorphic Client Code

Payroll processes any \`Employee\` without type checks:

\`\`\`codetabs
@python
def process_payroll(employees: list[Employee]) -> None:
    for emp in employees:
        print(f"{emp.name}: {emp.get_pay()}")
@java
class Payroll {
    static void processPayroll(List<Employee> employees) {
        for (Employee emp : employees) {
            System.out.println(emp.name + ": " + emp.getPay());
        }
    }
}
\`\`\`

#### Step 4: Use Substitutability

Any \`Employee\` subtype works wherever \`Employee\` is expected:

\`\`\`codetabs
@python
process_payroll([SalariedEmployee("Alex", 120_000), HourlyEmployee("Jordan", 50, 160)])
@java
Payroll.processPayroll(List.of(
    new SalariedEmployee("Alex", 120_000),
    new HourlyEmployee("Jordan", 50, 160)
));
\`\`\`

---

### When to Use It

* **True IS-A relationship** with substitutability — \`SalariedEmployee\` IS-A \`Employee\`.
* **Shared implementation** belongs in the parent — common fields, utility methods, template skeleton.
* **Polymorphic dispatch** — callers depend on the parent type, subclasses specialize behavior.
* **Stable taxonomy** — the type hierarchy won't change direction frequently.

### Comparison: Inheritance vs Composition

* **Inheritance** shares code and type through IS-A — tight coupling to parent structure. Use when the subtype is permanently a specialized kind of the parent.
* **Composition** reuses behavior through HAS-A — \`Car\` has an \`Engine\`. Prefer when behavior varies independently or you need multiple capabilities without deep trees.
`;

export const encapsulationBody = `**Encapsulation** bundles data and the methods that operate on it into a single unit, exposing only a controlled public API so objects enforce their own invariants and external code cannot corrupt internal state.

Getters and setters alone are not encapsulation if they expose raw mutable internals without validation — true encapsulation uses behavior methods like \`deposit()\` and \`withdraw()\`.

---

### The Core Concept: "Protect Your Invariants"

Imagine a **bank account** system where balance must never go negative and deposits must be positive.

* Customers interact through deposit, withdraw, and check balance.
* Fraud rules and daily limits live inside the account.
* No one should directly edit the ledger.

Without encapsulation, balance is a public field anyone can corrupt:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — public mutable state, no invariant protection
class BankAccount:
    def __init__(self) -> None:
        self.balance = 0.0

account = BankAccount()
account.balance = 1_000_000  # invalid state — no validation
account.balance = -500         # negative balance allowed
@java
// Anti-pattern — public mutable state, no invariant protection
class BankAccount {
    public double balance = 0;
}

BankAccount account = new BankAccount();
account.balance = 1_000_000; // invalid state — no validation
account.balance = -500;        // negative balance allowed
\`\`\`

**The Problem:** Any caller can put the account into an invalid state. Validation logic is scattered or absent.

---

### Applying Encapsulation

#### Step 1: Hide Internal State

Make balance private — inaccessible from outside:

\`\`\`codetabs
@python
class BankAccount:
    def __init__(self) -> None:
        self.__balance = 0.0
@java
class BankAccount {
    private double balance = 0;
}
\`\`\`

#### Step 2: Expose Behavior, Not Raw Data

Operations enforce rules before mutating state:

\`\`\`codetabs
@python
    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Invalid deposit")
        self.__balance += amount

    def withdraw(self, amount: float) -> None:
        if amount > self.__balance:
            raise ValueError("Insufficient funds")
        self.__balance -= amount
@java
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
\`\`\`

#### Step 3: Provide Controlled Read Access

A getter returns balance without allowing direct mutation:

\`\`\`codetabs
@python
    def get_balance(self) -> float:
        return self.__balance
@java
    public double getBalance() {
        return balance;
    }
}
\`\`\`

#### Step 4: Callers Use the Public API

External code cannot bypass validation:

\`\`\`codetabs
@python
account = BankAccount()
account.deposit(100)
account.withdraw(30)
# account.__balance = 1_000_000  # not allowed
@java
BankAccount account = new BankAccount();
account.deposit(100);
account.withdraw(30);
// account.balance = 1_000_000; // compile error
\`\`\`

---

### When to Use It

* **Invariants must hold** after every operation — balances, order status, inventory counts.
* **Internal representation may change** — switch from list to database without breaking callers.
* **Tell, don't ask** — call \`account.withdraw(50)\` instead of get balance, subtract, set balance.
* **Concurrent access** — funnel all mutations through synchronized methods.

### Comparison: Encapsulation vs Abstraction

* **Encapsulation** protects state — private fields, validated mutations, controlled access. A \`BankAccount\` encapsulates its balance.
* **Abstraction** simplifies the view — you interact with \`charge()\` without knowing Stripe internals. They complement each other: abstraction defines *what*; encapsulation guards *how* and *what's inside*.
`;

export const oopBodies: Record<string, string> = {
  Abstraction: abstractionBody,
  Polymorphism: polymorphismBody,
  Inheritance: inheritanceBody,
  Encapsulation: encapsulationBody,
};
