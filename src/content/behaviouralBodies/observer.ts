export const observerBody = `The **Observer Design Pattern** is a behavioral design pattern that defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

Instead of hard-wiring every side effect into the publisher — sending email, updating analytics, invalidating cache inside the same method — the subject broadcasts a change and registered observers react independently.

---

### The Core Concept: "Publish Once, React Many"

Imagine you run an **E-commerce Order Service** in India.

* When a customer places an order, inventory must be reserved.
* The notification service must send an SMS and email.
* The loyalty program must award points.
* The search index must update product popularity scores.

If you don't use the Observer Pattern, your \`OrderService\` becomes a tangled orchestrator:

\`\`\`java
// Anti-pattern: publisher knows every downstream consumer
public class OrderService {
    private InventoryService inventory;
    private EmailService email;
    private SmsService sms;
    private LoyaltyService loyalty;
    private SearchIndexer search;

    public void placeOrder(Order order) {
        saveToDatabase(order);
        inventory.reserve(order);
        email.sendConfirmation(order);
        sms.sendConfirmation(order);
        loyalty.awardPoints(order);
        search.updatePopularity(order);
        // Every new side effect = another line here
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: publisher knows every downstream consumer
class OrderService:
    def place_order(self, order: dict) -> None:
        self._save_to_database(order)
        self.inventory.reserve(order)
        self.email.send_confirmation(order)
        self.sms.send_confirmation(order)
        self.loyalty.award_points(order)
        self.search.update_popularity(order)
\`\`\`

**The Problem:** The order placement use case violates **Single Responsibility Principle**. Adding a new reaction — say, a fraud check — means editing and redeploying the core service. Testing "save order" requires mocking five unrelated collaborators.

---

### Refactoring with Observer Pattern

We invert the dependency: the order service publishes an event; observers subscribe and handle their own concerns.

#### Step 1: Define the Observer Interface

\`\`\`java
public interface OrderObserver {
    void onOrderPlaced(Order order);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class OrderObserver(ABC):
    @abstractmethod
    def on_order_placed(self, order: dict) -> None:
        pass
\`\`\`

#### Step 2: Implement Concrete Observers

\`\`\`java
public class InventoryObserver implements OrderObserver {
    public void onOrderPlaced(Order order) {
        System.out.println("Reserving stock for order " + order.getId());
    }
}

public class NotificationObserver implements OrderObserver {
    public void onOrderPlaced(Order order) {
        System.out.println("Sending SMS and email for order " + order.getId());
    }
}

public class LoyaltyObserver implements OrderObserver {
    public void onOrderPlaced(Order order) {
        System.out.println("Awarding points for order " + order.getId());
    }
}
\`\`\`
\`\`\`python
class InventoryObserver(OrderObserver):
    def on_order_placed(self, order: dict) -> None:
        print(f"Reserving stock for order {order['id']}")


class NotificationObserver(OrderObserver):
    def on_order_placed(self, order: dict) -> None:
        print(f"Sending SMS and email for order {order['id']}")


class LoyaltyObserver(OrderObserver):
    def on_order_placed(self, order: dict) -> None:
        print(f"Awarding points for order {order['id']}")
\`\`\`

#### Step 3: Create the Subject (Publisher)

\`\`\`java
public class OrderService {
    private final List<OrderObserver> observers = new ArrayList<>();

    public void subscribe(OrderObserver observer) {
        observers.add(observer);
    }

    public void unsubscribe(OrderObserver observer) {
        observers.remove(observer);
    }

    public void placeOrder(Order order) {
        saveToDatabase(order);
        for (OrderObserver observer : observers) {
            observer.onOrderPlaced(order);
        }
    }

    private void saveToDatabase(Order order) {
        System.out.println("Persisted order " + order.getId());
    }
}
\`\`\`
\`\`\`python
class OrderService:
    def __init__(self) -> None:
        self.observers: list[OrderObserver] = []

    def subscribe(self, observer: OrderObserver) -> None:
        self.observers.append(observer)

    def unsubscribe(self, observer: OrderObserver) -> None:
        self.observers.remove(observer)

    def place_order(self, order: dict) -> None:
        self._save_to_database(order)
        for observer in self.observers:
            observer.on_order_placed(order)

    def _save_to_database(self, order: dict) -> None:
        print(f"Persisted order {order['id']}")
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        OrderService orders = new OrderService();
        orders.subscribe(new InventoryObserver());
        orders.subscribe(new NotificationObserver());
        orders.subscribe(new LoyaltyObserver());

        orders.placeOrder(new Order("ORD-42"));
    }
}
\`\`\`
\`\`\`python
orders = OrderService()
orders.subscribe(InventoryObserver())
orders.subscribe(NotificationObserver())
orders.subscribe(LoyaltyObserver())

orders.place_order({"id": "ORD-42"})
\`\`\`

---

### When to Use It

* **Multiple independent reactions:** When one domain event should trigger several unrelated side effects without the publisher knowing them all.
* **Runtime subscription:** When components can attach and detach listeners dynamically — UI widgets, feature flags, websocket fan-out.
* **Loose coupling across modules:** When bounded contexts should react to events without importing each other's concrete classes.
* **Reactive UI:** When model changes must propagate to multiple views automatically.

### Comparison: Observer vs. Mediator Pattern

Both reduce coupling, but they coordinate differently:

* **Observer Pattern:** The subject **broadcasts** a state change; observers react passively and generally do not direct each other.
* **Mediator Pattern:** Colleagues report to a central mediator that **orchestrates** who should act next — often with complex routing rules, not simple broadcast.`;
