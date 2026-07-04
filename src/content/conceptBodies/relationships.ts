export const inheritanceRelBody = `**Inheritance (IS-A)** expresses a strict parent-child taxonomy where a subclass is a specialized kind of its superclass — inheriting structure and behavior and remaining substitutable wherever the parent is expected.

UML shows this with a hollow triangle arrow pointing to the parent. The sentence test: "A Car **is a** Vehicle" — if the sentence fails, you likely need HAS-A or USES-A instead.

---

### The Core Concept: "Specialized Kinds of a Type"

Imagine a **vehicle navigation system** that routes any vehicle to a destination.

* The system accepts any \`Vehicle\` and calls \`move()\`.
* \`Car\` is a specialized \`Vehicle\` that drives on roads.
* \`Boat\` is a specialized \`Vehicle\` that sails on water.
* New vehicle types should plug in without changing \`navigate()\`.

Modeling this without inheritance forces type-checking in the navigator:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — navigator branches on type instead of IS-A substitution
def navigate(obj, destination: str) -> None:
    if type(obj).__name__ == "Car":
        print(f"Driving to {destination}")
    elif type(obj).__name__ == "Boat":
        print(f"Sailing to {destination}")
@java
// Anti-pattern — navigator branches on type instead of IS-A substitution
class Navigation {
    static void navigate(Object obj, String destination) {
        if (obj instanceof Car) {
            System.out.println("Driving to " + destination);
        } else if (obj instanceof Boat) {
            System.out.println("Sailing to " + destination);
        }
    }
}
\`\`\`

**The Problem:** Every new vehicle type requires editing \`navigate()\`. The IS-A relationship exists in the domain but not in the code.

---

### Modeling IS-A Correctly

#### Step 1: Define the Superclass

The parent captures shared behavior and contract:

\`\`\`codetabs
@python
class Vehicle:
    def move(self) -> None:
        print("Moving")
@java
class Vehicle {
    void move() {
        System.out.println("Moving");
    }
}
\`\`\`

#### Step 2: Create Substitutable Subclasses

Each subtype IS-A \`Vehicle\` with specialized behavior:

\`\`\`codetabs
@python
class Car(Vehicle):
    def move(self) -> None:
        print("Driving on road")
@java
class Car extends Vehicle {
    @Override
    void move() {
        System.out.println("Driving on road");
    }
}
\`\`\`

#### Step 3: Client Code Uses the Parent Type

Functions accept \`Vehicle\` — any subclass works:

\`\`\`codetabs
@python
def navigate(vehicle: Vehicle) -> None:
    vehicle.move()  # Car IS-A Vehicle — valid substitution
@java
class Navigation {
    static void navigate(Vehicle vehicle) {
        vehicle.move(); // Car IS-A Vehicle — valid substitution
    }
}
\`\`\`

#### Step 4: Substitute Without Changing Callers

\`\`\`codetabs
@python
navigate(Car())
@java
Navigation.navigate(new Car());
\`\`\`

---

### When to Use It

* **Permanent IS-A taxonomy** — Dog IS-A Animal, SavingsAccount IS-A BankAccount.
* **Substitutability holds** — subclass can replace parent everywhere (LSP).
* **Shared implementation** in the parent reduces duplication.
* **Polymorphic dispatch** — callers depend on the supertype.

### Comparison: IS-A vs HAS-A

* **IS-A (inheritance):** the subtype *is a kind of* the parent — \`Car\` IS-A \`Vehicle\`. Substitutable in all parent contexts.
* **HAS-A (composition/aggregation):** one object *contains or uses* another — \`Car\` HAS-A \`Engine\`. The engine is not a kind of car.
`;

export const associationBody = `**Association (USES-A)** is the loosest structural relationship — two independent objects interact or know about each other without ownership or lifecycle control.

A doctor consults a patient; neither owns the other. They collaborate for a transaction, then continue existing independently.

---

### The Core Concept: "Collaborate Without Owning"

Imagine a **clinic system** where doctors examine patients.

* Doctors and patients exist independently before and after a visit.
* A doctor does not create or destroy patients.
* A patient can see multiple doctors over time.
* The consultation is a temporary collaboration.

Modeling this as composition would wrongly imply the doctor owns the patient:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — doctor creates and owns patient lifecycle
class Doctor:
    def __init__(self) -> None:
        self.patients = [Patient("Alice"), Patient("Bob")]

class Patient:
    def __init__(self, name: str) -> None:
        self.name = name
@java
// Anti-pattern — doctor creates and owns patient lifecycle
class Doctor {
    private List<Patient> patients = List.of(
        new Patient("Alice"), new Patient("Bob")
    );
}

class Patient {
    private final String name;
    Patient(String name) { this.name = name; }
}
\`\`\`

**The Problem:** Patients cannot exist outside the doctor. The relationship is USES-A, not PART-OF.

---

### Modeling Association

#### Step 1: Define Independent Classes

Each object has its own lifecycle:

\`\`\`codetabs
@python
class Patient:
    def __init__(self, name: str) -> None:
        self.name = name
@java
class Patient {
    private final String name;

    Patient(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}
\`\`\`

#### Step 2: Interaction via Method Parameter

The doctor uses a patient passed in — no ownership:

\`\`\`codetabs
@python
class Doctor:
    def consult(self, patient: Patient) -> None:
        print(f"Examining {patient.name}")
@java
class Doctor {
    void consult(Patient patient) {
        System.out.println("Examining " + patient.getName());
    }
}
\`\`\`

#### Step 3: Objects Exist Before Collaboration

\`\`\`codetabs
@python
dr = Doctor()
alice = Patient("Alice")
@java
Doctor dr = new Doctor();
Patient alice = new Patient("Alice");
\`\`\`

#### Step 4: Collaborate, Then Separate

\`\`\`codetabs
@python
dr.consult(alice)  # uses Patient — no ownership
@java
dr.consult(alice); // uses Patient — no ownership
\`\`\`

---

### When to Use It

* **Objects collaborate temporarily** — service calls repository, doctor examines patient.
* **No ownership** — neither party controls the other's lifecycle.
* **Many-to-many possible** — students enroll in many courses, courses have many students.
* **Default relationship** — most collaborations are association, not composition.

### Comparison: Association vs Dependency

* **Association:** longer-lived link — often a field reference (\`this.repository\`). The object *knows about* another across multiple operations.
* **Dependency:** shorter-lived — a method parameter or local variable used only within one operation. In practice, interviews accept overlap — emphasize no ownership in either case.
`;

export const aggregationBody = `**Aggregation (HAS-A, weak)** is a whole-part relationship where the container groups parts, but parts can exist independently and outlive the whole — often shared among multiple containers.

UML uses a hollow diamond on the whole side. Think "groups" not "owns exclusively."

---

### The Core Concept: "Teams Without Owning Players"

Imagine a **sports league** where teams roster players.

* Players are registered in the league independently.
* A player can be traded between teams.
* Disbanding a team does not delete the players.
* The same player could theoretically appear on multiple rosters (tournaments).

Treating players as composed parts of a team would destroy them when the team disbands:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — team creates and exclusively owns players
class Team:
    def __init__(self, name: str) -> None:
        self.name = name
        self.players = [Player("Alex"), Player("Jordan")]

class Player:
    def __init__(self, name: str) -> None:
        self.name = name
@java
// Anti-pattern — team creates and exclusively owns players
class Team {
    private List<Player> players = List.of(
        new Player("Alex"), new Player("Jordan")
    );
}

class Player {
    private final String name;
    Player(String name) { this.name = name; }
}
\`\`\`

**The Problem:** Players cannot exist outside the team. Trades and independent player records are impossible.

---

### Modeling Aggregation

#### Step 1: Create Parts Independently

Players exist before joining a team:

\`\`\`codetabs
@python
class Player:
    def __init__(self, name: str) -> None:
        self.name = name
@java
class Player {
    private final String name;

    Player(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}
\`\`\`

#### Step 2: Whole Receives Parts via Injection

The team groups players but does not create them:

\`\`\`codetabs
@python
class Team:
    def __init__(self, players: list[Player]) -> None:
        self.players = players  # injected, not created here
@java
class Team {
    private List<Player> players;

    Team(List<Player> players) {
        this.players = players; // injected, not created here
    }
}
\`\`\`

#### Step 3: Wire at Composition Root

\`\`\`codetabs
@python
p1 = Player("Alex")
p2 = Player("Jordan")
team = Team([p1, p2])
@java
Player p1 = new Player("Alex");
Player p2 = new Player("Jordan");
Team team = new Team(List.of(p1, p2));
\`\`\`

#### Step 4: Parts Survive Whole Destruction

\`\`\`codetabs
@python
team.players = []  # team disbanded — players still exist
print(p1.name)  # Alex
@java
team.setPlayers(List.of()); // team disbanded — players still exist
System.out.println(p1.getName()); // Alex
\`\`\`

---

### When to Use It

* **Parts outlive the whole** — professors survive department dissolution.
* **Parts may be shared** — one player referenced by multiple tournament teams.
* **Injection from outside** — parent never calls \`new\` on children.
* **Whole-part grouping** with weak ownership semantics.

### Comparison: Aggregation vs Composition

* **Aggregation (hollow diamond):** parts exist independently, may be shared, survive container destruction. Team–Player, Department–Professor.
* **Composition (filled diamond):** parts created inside parent, not shared, die with parent. Car–Engine, Order–OrderLine.
`;

export const compositionBody = `**Composition (PART-OF, strong)** is the strongest whole-part relationship — the parent creates components, controls their lifetime exclusively, and parts cannot meaningfully exist without the parent.

UML uses a filled diamond on the whole side. This is the basis of "composition over inheritance."

---

### The Core Concept: "Parts Die With the Whole"

Imagine a **car** and its engine.

* The engine is built when the car is built.
* You don't share one engine between two cars in normal modeling.
* Scrapping the car scraps that engine instance.
* The engine has no independent domain life.

Modeling the engine as aggregated (injected from outside) misrepresents exclusive ownership:

\`\`\`anti-pattern-codetabs
@python
# Anti-pattern — engine exists independently, shared lifecycle unclear
class Car:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine

engine = Engine()
car1 = Car(engine)
car2 = Car(engine)  # same engine in two cars?
@java
// Anti-pattern — engine exists independently, shared lifecycle unclear
class Car {
    private Engine engine;
    Car(Engine engine) { this.engine = engine; }
}

Engine engine = new Engine();
Car car1 = new Car(engine);
Car car2 = new Car(engine); // same engine in two cars?
\`\`\`

**The Problem:** Lifecycle and exclusivity are ambiguous. Domain says the car *owns* the engine.

---

### Modeling Composition

#### Step 1: Parent Creates the Part Internally

\`\`\`codetabs
@python
class Engine:
    def start(self) -> None:
        print("Engine running")

class Car:
    def __init__(self) -> None:
        self._engine = Engine()  # created and owned internally
@java
class Engine {
    void start() {
        System.out.println("Engine running");
    }
}

class Car {
    private final Engine engine = new Engine(); // created and owned internally
}
\`\`\`

#### Step 2: Parent Delegates to Owned Part

\`\`\`codetabs
@python
    def start(self) -> None:
        self._engine.start()
        print("Car moving")
@java
    void start() {
        engine.start();
        System.out.println("Car moving");
    }
}
\`\`\`

#### Step 3: Use the Composed Object

\`\`\`codetabs
@python
car = Car()
car.start()
@java
Car car = new Car();
car.start();
\`\`\`

#### Step 4: Lifecycle Bound Together

\`\`\`codetabs
@python
# when car is garbage-collected, engine goes with it
@java
// when car is garbage-collected, engine goes with it
\`\`\`

---

### When to Use It

* **Exclusive ownership** — part belongs to exactly one whole.
* **Part created with parent** — \`Order\` creates \`OrderLine\` inside \`addItem()\`.
* **Part meaningless alone** — order line without an order has no domain meaning.
* **Composition over inheritance** — delegate behavior to owned components instead of deep class trees.

### Comparison: Composition vs Inheritance

* **Composition (HAS-A):** reuse behavior by owning a component — \`Car\` has \`Engine\`. Flexible, loose coupling, no fragile base class.
* **Inheritance (IS-A):** reuse by extending a parent — \`SportsCar\` extends \`Car\`. Tighter coupling; use only when substitutability holds.
`;

export const relationshipBodies: Record<string, string> = {
  Inheritance: inheritanceRelBody,
  Association: associationBody,
  Aggregation: aggregationBody,
  Composition: compositionBody,
};
