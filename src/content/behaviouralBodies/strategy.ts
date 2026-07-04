export const strategyBody = `The **Strategy Design Pattern** is a behavioral design pattern that allows you to define a family of algorithms, encapsulate each one inside a separate class, and make them fully interchangeable.

Instead of implementing a single algorithm directly inside a class (which often leads to a massive web of rigid \`if-else\` or \`switch\` statements), the class delegates the execution to one of the encapsulated strategy objects at runtime.

---

### The Core Concept: "Open for Extension, Closed for Modification"

Imagine you are building a **Navigation App** for a city map.

* Initially, your app only calculates driving routes for cars.
* Soon, you want to add walking routes.
* Later, you need to add public transit routes and cycling routes.

If you don't use the Strategy Pattern, your main \`Navigator\` class will look like a massive block of conditional statements:

\`\`\`java
// Anti-pattern approach (Highly coupled and rigid)
public class Navigator {
    public void buildRoute(String type, String start, String end) {
        if (type.equalsIgnoreCase("CAR")) {
            // Complex algorithm for roads, traffic, and tolls
        } else if (type.equalsIgnoreCase("WALK")) {
            // Complex algorithm for sidewalks and pedestrian paths
        } else if (type.equalsIgnoreCase("TRANSIT")) {
            // Complex algorithm for bus and metro schedules
        }
    }
}
\`\`\`
\`\`\`python
# Anti-pattern approach (Highly coupled and rigid)
class Navigator:
    def build_route(self, route_type: str, start: str, end: str) -> None:
        if route_type.upper() == "CAR":
            # Complex algorithm for roads, traffic, and tolls
            pass
        elif route_type.upper() == "WALK":
            # Complex algorithm for sidewalks and pedestrian paths
            pass
        elif route_type.upper() == "TRANSIT":
            # Complex algorithm for bus and metro schedules
            pass
\`\`\`

**The Problem:** Every time you want to add a new route type, you must modify the core \`Navigator\` class. This risks breaking existing code, violates the **Single Responsibility Principle**, and violates the **Open-Closed Principle**.

---

### Refactoring with Strategy Pattern

To fix this, we decouple the *context* (the Navigator) from the *concrete strategies* (the routing algorithms).

#### Step 1: Define the Strategy Interface

This defines a common contract that all concrete strategies must implement.

\`\`\`java
public interface RouteStrategy {
    void buildRoute(String start, String end);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod

class RouteStrategy(ABC):
    @abstractmethod
    def build_route(self, start: str, end: str) -> None:
        pass
\`\`\`

#### Step 2: Implement Concrete Strategies

Each class implements a specific version of the algorithm.

\`\`\`java
public class CarRouteStrategy implements RouteStrategy {
    @Override
    public void buildRoute(String start, String end) {
        System.out.println("Calculating fastest driving route from " + start + " to " + end + " based on traffic.");
    }
}

public class WalkingRouteStrategy implements RouteStrategy {
    @Override
    public void buildRoute(String start, String end) {
        System.out.println("Calculating scenic walking path from " + start + " to " + end + " using pedestrian walkways.");
    }
}
\`\`\`
\`\`\`python
class CarRouteStrategy(RouteStrategy):
    def build_route(self, start: str, end: str) -> None:
        print(f"Calculating fastest driving route from {start} to {end} based on traffic.")

class WalkingRouteStrategy(RouteStrategy):
    def build_route(self, start: str, end: str) -> None:
        print(f"Calculating scenic walking path from {start} to {end} using pedestrian walkways.")
\`\`\`

#### Step 3: Create the Context Class

The context maintains a reference to a strategy object. It does not know the internal details of *how* the route is built; it simply calls the strategy it was handed.

\`\`\`java
public class Navigator {
    private RouteStrategy routeStrategy;

    // The strategy can be injected via the constructor or a setter method
    public void setRouteStrategy(RouteStrategy routeStrategy) {
        this.routeStrategy = routeStrategy;
    }

    public void executeRoute(String start, String end) {
        if (routeStrategy == null) {
            throw new IllegalStateException("Route strategy not set!");
        }
        routeStrategy.buildRoute(start, end);
    }
}
\`\`\`
\`\`\`python
class Navigator:
    def __init__(self) -> None:
        self._route_strategy: RouteStrategy | None = None

    def set_route_strategy(self, strategy: RouteStrategy) -> None:
        self._route_strategy = strategy

    def execute_route(self, start: str, end: str) -> None:
        if self._route_strategy is None:
            raise RuntimeError("Route strategy not set!")
        self._route_strategy.build_route(start, end)
\`\`\`

#### Step 4: Client Execution

The client decides which strategy to use at runtime and dynamically updates the context.

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Navigator navigator = new Navigator();

        // User selects Driving Mode
        navigator.setRouteStrategy(new CarRouteStrategy());
        navigator.executeRoute("Indiranagar", "Whitefield");

        // User switches to Walking Mode dynamically
        navigator.setRouteStrategy(new WalkingRouteStrategy());
        navigator.executeRoute("Indiranagar", "Halasuru");
    }
}
\`\`\`
\`\`\`python
navigator = Navigator()
navigator.set_route_strategy(CarRouteStrategy())
navigator.execute_route("Indiranagar", "Whitefield")

navigator.set_route_strategy(WalkingRouteStrategy())
navigator.execute_route("Indiranagar", "Halasuru")
\`\`\`

---

### When to Use It

* **To eliminate massive conditional blocks:** When you see a long chain of \`if-else\` or \`switch\` statements checking for variations of the same basic operation.
* **To swap algorithms at runtime:** When a system needs to adapt its behavior dynamically based on user preferences, execution environments, or system state.
* **To isolate algorithmic details:** When you want to isolate complex code, business logic, or dependencies of a specific algorithm away from the broader application logic.

### Comparison: Strategy vs. State Pattern

Developers often confuse these two patterns because their class diagrams look identical. The difference lies entirely in **intent**:

* **Strategy Pattern:** The client explicitly configures the context with a specific strategy. The strategies generally do not know about each other.
* **State Pattern:** The states themselves typically trigger transitions to change the context's internal state automatically as the execution progresses.`;
