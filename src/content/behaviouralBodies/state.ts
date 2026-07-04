export const stateBody = `The **State Design Pattern** is a behavioral design pattern that lets an object change its behavior when its internal state changes, as if the object had changed its class.

Instead of burying lifecycle logic inside a single class with sprawling \`switch\` statements on status enums, the object delegates each operation to a dedicated state object that knows what is allowed in that phase.

---

### The Core Concept: "Behavior Follows Lifecycle"

Imagine you are building a **Food Delivery Order** system for Bangalore.

* A new order starts in \`CREATED\` — the customer can cancel freely.
* After the restaurant accepts, it moves to \`PREPARING\` — cancellation may incur a fee.
* Once the rider picks it up, it becomes \`OUT_FOR_DELIVERY\` — only tracking and support calls make sense.
* After delivery, it is \`DELIVERED\` — refunds follow a different policy entirely.

If you don't use the State Pattern, your \`Order\` class becomes a maintenance nightmare:

\`\`\`java
// Anti-pattern: one class owns every lifecycle rule
public class Order {
    private String status = "CREATED";

    public void cancel() {
        if (status.equals("CREATED")) {
            refundFull();
        } else if (status.equals("PREPARING")) {
            refundPartial();
        } else if (status.equals("OUT_FOR_DELIVERY")) {
            throw new IllegalStateException("Too late to cancel");
        } else if (status.equals("DELIVERED")) {
            throw new IllegalStateException("Already delivered");
        }
    }

    public void assignRider() {
        if (status.equals("CREATED")) {
            throw new IllegalStateException("Restaurant has not accepted yet");
        } else if (status.equals("PREPARING")) {
            status = "OUT_FOR_DELIVERY";
        }
        // ... more branches for every action × every status
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: one class owns every lifecycle rule
class Order:
    def __init__(self) -> None:
        self.status = "CREATED"

    def cancel(self) -> None:
        if self.status == "CREATED":
            self._refund_full()
        elif self.status == "PREPARING":
            self._refund_partial()
        elif self.status == "OUT_FOR_DELIVERY":
            raise RuntimeError("Too late to cancel")
        elif self.status == "DELIVERED":
            raise RuntimeError("Already delivered")

    def assign_rider(self) -> None:
        if self.status == "CREATED":
            raise RuntimeError("Restaurant has not accepted yet")
        elif self.status == "PREPARING":
            self.status = "OUT_FOR_DELIVERY"
\`\`\`

**The Problem:** Every new status or action forces you to edit the core \`Order\` class. Transition rules scatter across methods, tests explode combinatorially, and invalid states slip through when someone forgets a branch.

---

### Refactoring with State Pattern

We move each lifecycle phase into its own class and let the \`Order\` context delegate behavior to whichever state it currently holds.

#### Step 1: Define the State Interface

\`\`\`java
public interface OrderState {
    void cancel(Order order);
    void assignRider(Order order);
    void markDelivered(Order order);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class OrderState(ABC):
    @abstractmethod
    def cancel(self, order: "Order") -> None:
        pass

    @abstractmethod
    def assign_rider(self, order: "Order") -> None:
        pass

    @abstractmethod
    def mark_delivered(self, order: "Order") -> None:
        pass
\`\`\`

#### Step 2: Implement Concrete States

\`\`\`java
public class CreatedState implements OrderState {
    public void cancel(Order order) {
        order.refundFull();
        order.setState(new CancelledState());
    }
    public void assignRider(Order order) {
        throw new IllegalStateException("Wait for restaurant acceptance");
    }
    public void markDelivered(Order order) {
        throw new IllegalStateException("Order not dispatched yet");
    }
}

public class PreparingState implements OrderState {
    public void cancel(Order order) {
        order.refundPartial();
        order.setState(new CancelledState());
    }
    public void assignRider(Order order) {
        order.setState(new OutForDeliveryState());
    }
    public void markDelivered(Order order) {
        throw new IllegalStateException("Rider has not picked up yet");
    }
}
\`\`\`
\`\`\`python
class CreatedState(OrderState):
    def cancel(self, order: "Order") -> None:
        order.refund_full()
        order.set_state(CancelledState())

    def assign_rider(self, order: "Order") -> None:
        raise RuntimeError("Wait for restaurant acceptance")

    def mark_delivered(self, order: "Order") -> None:
        raise RuntimeError("Order not dispatched yet")


class PreparingState(OrderState):
    def cancel(self, order: "Order") -> None:
        order.refund_partial()
        order.set_state(CancelledState())

    def assign_rider(self, order: "Order") -> None:
        order.set_state(OutForDeliveryState())

    def mark_delivered(self, order: "Order") -> None:
        raise RuntimeError("Rider has not picked up yet")
\`\`\`

#### Step 3: Create the Context Class

\`\`\`java
public class Order {
    private OrderState state = new CreatedState();

    public void setState(OrderState state) {
        this.state = state;
    }

    public void cancel() { state.cancel(this); }
    public void assignRider() { state.assignRider(this); }
    public void markDelivered() { state.markDelivered(this); }

    public void refundFull() { System.out.println("Full refund issued"); }
    public void refundPartial() { System.out.println("Partial refund issued"); }
}
\`\`\`
\`\`\`python
class Order:
    def __init__(self) -> None:
        self.state: OrderState = CreatedState()

    def set_state(self, state: OrderState) -> None:
        self.state = state

    def cancel(self) -> None:
        self.state.cancel(self)

    def assign_rider(self) -> None:
        self.state.assign_rider(self)

    def mark_delivered(self) -> None:
        self.state.mark_delivered(self)

    def refund_full(self) -> None:
        print("Full refund issued")

    def refund_partial(self) -> None:
        print("Partial refund issued")
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Order order = new Order();
        order.cancel(); // Full refund while CREATED

        Order active = new Order();
        active.setState(new PreparingState());
        active.assignRider(); // Transitions to OUT_FOR_DELIVERY internally
    }
}
\`\`\`
\`\`\`python
order = Order()
order.cancel()  # Full refund while CREATED

active = Order()
active.set_state(PreparingState())
active.assign_rider()  # Transitions to OUT_FOR_DELIVERY internally
\`\`\`

---

### When to Use It

* **Lifecycle-driven behavior:** When an object's allowed operations change dramatically across phases — orders, tickets, TCP connections, vending machines.
* **Growing status switches:** When \`if (status == ...)\` blocks multiply across many methods in the same class.
* **Explicit transition rules:** When only certain state pairs may connect — \`PREPARING\` may become \`OUT_FOR_DELIVERY\` but not \`DELIVERED\` directly.
* **Testable phases:** When you want to unit-test \`PreparingState\` cancellation policy without constructing the entire order history.

### Comparison: State vs. Strategy Pattern

Both patterns delegate to interchangeable objects, but their **intent** diverges:

* **State Pattern:** The context *changes its own delegate* as domain events unfold — states often initiate transitions after handling an action.
* **Strategy Pattern:** The client *chooses* which algorithm to plug in — strategies do not represent lifecycle phases and typically do not auto-switch the context.`;
