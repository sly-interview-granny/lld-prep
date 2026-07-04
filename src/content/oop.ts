import type { InterviewConcept } from './types';

export type Concept = InterviewConcept;

export const oopConcepts: Concept[] = [
  {
    title: 'Abstraction',
    description: 'Hides unnecessary details to reduce complexity.',
    definition:
      'Abstraction focuses on what an object does rather than how it does it. You expose a simple public interface while hiding internal implementation details behind methods or abstract types. In LLD interviews, abstraction is how you keep classes understandable and prevent callers from depending on fragile internals.',
    analogy:
      'Driving a car: you use the steering wheel, pedals, and ignition without knowing fuel injection timing or transmission gear ratios. The car abstracts away mechanical complexity so you can focus on getting somewhere.',
    whenAsked:
      'Common prompts: "What is abstraction?" or "How is abstraction different from encapsulation?" Follow-ups often ask you to design a payment system interface, explain abstract classes vs interfaces, or identify what to hide when modeling a library catalog or notification service.',
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
      'Abstraction = exposing essential behavior, hiding implementation.',
      'Contrast with encapsulation: abstraction is about simplification; encapsulation is about protecting state.',
      'Use interfaces/abstract classes to define contracts callers depend on.',
      'In system design, abstraction layers (service → repository → DB) reduce coupling.',
    ],
  },
  {
    title: 'Polymorphism',
    description:
      'Allows one interface to be used for general activities (flexibility).',
    definition:
      'Polymorphism lets different classes respond to the same message or interface in their own way. At runtime (dynamic polymorphism), the actual object type decides which method runs; at compile time (static), overloads or generics provide flexibility. It is the mechanism that makes "program to an interface" practical in real code.',
    analogy:
      'A universal remote with a "Play" button: pressing Play starts a DVD player, a streaming app, or a game console — same action, different behavior depending on the device connected.',
    whenAsked:
      'Interviewers say "Give an example of polymorphism" or ask you to refactor if/else chains into polymorphic dispatch. Follow-ups: runtime vs compile-time polymorphism, when polymorphism beats switch statements, and how it supports the Open/Closed Principle.',
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
      'Same interface, different implementations — key phrase interviewers want.',
      'Runtime polymorphism: method overriding + inheritance or interface implementation.',
      'Compile-time: method overloading, generics (List<T>).',
      'Reduces conditional logic; pairs with Strategy and Factory patterns.',
    ],
  },
  {
    title: 'Inheritance',
    description: 'Shares code across related classes (reusability).',
    definition:
      'Inheritance models an IS-A relationship: a subclass acquires fields and methods from a parent and can override or extend behavior. It promotes reuse but creates tight coupling to the parent hierarchy. Modern LLD guidance favors composition over deep inheritance trees unless the relationship is truly substitutable.',
    analogy:
      'A corporate org chart: an "Engineer" inherits general employee benefits and policies from "Employee," then adds role-specific responsibilities like code reviews — without rewriting HR rules for every role.',
    whenAsked:
      'Asked when designing class hierarchies: "Would you use inheritance here?" Follow-ups cover extends vs implements, fragile base class problem, Liskov Substitution Principle violations, and when composition is the better choice.',
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
      'IS-A relationship — subclass must be substitutable for parent (LSP).',
      'Prefer shallow hierarchies; deep trees are hard to maintain.',
      'Inheritance shares implementation; interfaces share contracts only.',
      'Say "composition over inheritance" when ownership or behavior varies independently.',
    ],
  },
  {
    title: 'Encapsulation',
    description:
      "Restricts direct access to data to protect an object's state.",
    definition:
      'Encapsulation bundles data and the methods that operate on it, exposing only what is necessary through a controlled public API. Private fields prevent external code from putting objects into invalid states. Validation, invariants, and side effects stay inside the class boundary.',
    analogy:
      'An ATM: you cannot open the vault or edit the ledger directly. You interact through buttons and slots; the bank enforces rules internally so your balance stays consistent.',
    whenAsked:
      'Often paired with abstraction: "How do you protect object state?" Follow-ups include getters/setters vs true encapsulation, immutable objects, why public fields are discouraged, and how encapsulation helps thread safety.',
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
      'Hide fields (private/protected), expose behavior through methods.',
      'Encapsulation preserves invariants — object stays valid after every operation.',
      'Getters alone are not encapsulation if callers can still break rules.',
      'Immutability (final fields, no setters) is a strong form of encapsulation.',
    ],
  },
];
