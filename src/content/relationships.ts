import type { InterviewConcept } from './types';
import { relationshipBodies } from './conceptBodies/relationships';

export type Relationship = InterviewConcept & { tag: string };

export const relationships: Relationship[] = [
  {
    title: 'Inheritance',
    body: relationshipBodies.Inheritance,
    tag: 'IS-A',
    description:
      'A strict parent-child relationship where a subclass permanently copies the structure and behavior of a superclass.',
    definition:
      'Inheritance expresses taxonomy: Dog IS-A Animal, SavingsAccount IS-A BankAccount. The subclass inherits attributes and methods from the superclass and may override or extend them. UML shows this with a hollow triangle arrow pointing to the parent. It is the strongest form of type relationship because the subtype is a specialized version of the supertype and should be substitutable wherever the parent is expected. Inheritance couples the child to the parent\'s structure — changes to the parent ripple to all descendants. Use it when the IS-A relationship is permanent, meaningful, and passes the Liskov Substitution test. In LLD interviews, inheritance often appears alongside interfaces: class inheritance for shared implementation, interface implementation for shared contracts.',
    analogy:
      'Biological classification: every Golden Retriever IS-A Dog, every Dog IS-A Mammal, every Mammal IS-A Animal. You do not say "a Dog has a Mammal" — the subtype fully is that type, with specialized behavior layered on top. A vet treating an Animal can examine a Golden Retriever without changing procedure, because the IS-A chain guarantees shared anatomy and physiology expectations.',
    detailedExample:
      'In a payment system, `CreditCardPayment extends Payment` and `UpiPayment extends Payment`. Both inherit `amount`, `timestamp`, and `validate()` from `Payment`, then specialize `process()` with card-network vs UPI logic. `PaymentProcessor` accepts `Payment` and calls `process()` polymorphically — any new payment type extends `Payment` without changing the processor. If `Refund` cannot substitute for `Payment` (different contract), do not force it into the hierarchy — use a separate type or interface.',
    whenAsked:
      'Q: "How do you decide between IS-A and HAS-A?" — Answer: IS-A when the subtype is a specialized kind of the parent and can replace it (Car IS-A Vehicle). HAS-A when one object contains or uses another (Car HAS-A Engine). Draw the sentence test: "A Car is an Engine" fails → HAS-A.\n\nQ: "Can a Square inherit from Rectangle?" — Answer: No — violates LSP because setting width independently breaks Square invariants. Model them as siblings implementing a `Shape` interface or use composition.\n\nQ: "Class inheritance vs interface implementation?" — Answer: inheritance (extends) for shared code and single parent; interface (implements) for capability contracts with multiple inheritance. Prefer interfaces for LLD flexibility.',
    codePython: `class Vehicle:
    def move(self) -> None:
        print("Moving")

class Car(Vehicle):
    def move(self) -> None:
        print("Driving on road")

def navigate(vehicle: Vehicle) -> None:
    vehicle.move()  # Car IS-A Vehicle — valid substitution

navigate(Car())`,
    codeJava: `class Vehicle {
    void move() {
        System.out.println("Moving");
    }
}

class Car extends Vehicle {
    @Override
    void move() {
        System.out.println("Driving on road");
    }
}

class Navigation {
    static void navigate(Vehicle vehicle) {
        vehicle.move(); // Car IS-A Vehicle — valid substitution
    }
}

Navigation.navigate(new Car());`,
    interviewTips: [
      'IS-A = inheritance or interface implementation with substitutability (LSP).',
      'UML arrow: solid line with hollow triangle on the parent (superclass) side.',
      'Violating LSP (Square extends Rectangle) means wrong IS-A modeling — say this proactively.',
      'Prefer interfaces for capabilities ("Flyable", "Payable") over deep class hierarchies.',
      'Single inheritance of classes (Java) vs multiple interface implementation — know the language rules.',
      'Abstract base classes sit between interface and concrete — shared code plus partial contract.',
      'Favor composition when behavior combinations multiply (e.g., FlyingCar needs Flyable + Drivable).',
    ],
    commonMistakes: [
      'Labeling every "uses" relationship as IS-A because one class references another.',
      'Creating inheritance for convenience when interface + delegation is cleaner.',
      'Ignoring LSP violations in the hierarchy and patching with instanceof checks.',
      'Confusing inheritance (IS-A) with the OOP pillar "Inheritance" — same word, context matters.',
    ],
  },
  {
    title: 'Association',
    body: relationshipBodies.Association,
    tag: 'USES-A',
    description:
      'A loose relationship where two completely independent objects interact with each other without any ownership.',
    definition:
      'Association means objects know about each other and collaborate, but neither owns the other\'s lifecycle. It is the weakest structural link — often a reference passed as a method parameter or stored as a field without creation or destruction responsibility. Multiplicity can be one-to-one, one-to-many, or many-to-many (e.g., a Student enrolls in many Courses, a Course has many Students). Association appears constantly in LLD: a Service uses a Repository, a Controller uses a Service. The objects exist independently before and after the interaction. In UML, association is a simple line between classes, optionally labeled with role names and multiplicity. It differs subtly from dependency (see below) in duration — association implies a longer-lived link.',
    analogy:
      'A customer hailing a cab: both exist independently before and after the ride. The customer does not own the cab company\'s vehicles, and the driver does not own the passenger. They collaborate for a transaction — the ride — then go their separate ways. Either can continue to exist if the other disappears.',
    detailedExample:
      'In a library system, `Librarian` associates with `Book` during `checkout(member, book)`. The librarian does not create or destroy books — they interact with existing instances. `Member` and `Book` also associate during checkout without ownership. A `CatalogService` holds references to many `Book` objects but does not own their lifecycle (books persist in the database regardless). Many-to-many enrollment between `Student` and `Course` is modeled with a join entity `Enrollment`.',
    whenAsked:
      'Q: "What is the difference between association and dependency?" — Answer: dependency is a temporary "uses" in a method signature (local variable, parameter); association is a longer-lived field reference. In practice, interviews often accept overlap — emphasize no ownership in either case.\n\nQ: "How do you model many-to-many?" — Answer: introduce an association class or join entity (`Enrollment` linking `Student` and `Course`) rather than embedding lists in both sides without structure.\n\nQ: "Doctor and Patient — what relationship?" — Answer: association (USES-A). Doctor examines patients; neither owns the other. If Patient records belong exclusively to a Hospital, that is a different relationship (aggregation/composition with Hospital).',
    codePython: `class Patient:
    def __init__(self, name: str) -> None:
        self.name = name

class Doctor:
    def consult(self, patient: Patient) -> None:
        print(f"Examining {patient.name}")

dr = Doctor()
alice = Patient("Alice")
dr.consult(alice)  # uses Patient — no ownership`,
    codeJava: `class Patient {
    private final String name;

    Patient(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}

class Doctor {
    void consult(Patient patient) {
        System.out.println("Examining " + patient.getName());
    }
}

Doctor dr = new Doctor();
Patient alice = new Patient("Alice");
dr.consult(alice); // uses Patient — no ownership`,
    interviewTips: [
      'USES-A / knows-about — weakest link; no lifecycle control by either party.',
      'UML: simple line between classes; add role labels ("enrolledIn") and multiplicity ("1..*").',
      'Differs from dependency only in duration — field reference vs method-local use.',
      'Many-to-many associations usually become a separate association class or join table.',
      'Bidirectional associations require careful design — prefer unidirectional when possible.',
      'Association is the default relationship — most collaborations are not ownership.',
      'In code, a field holding an injected reference often signals association or aggregation.',
    ],
    commonMistakes: [
      'Calling every field reference "composition" — ownership must be exclusive and lifecycle-bound.',
      'Modeling bidirectional associations without synchronization logic when objects update each other.',
      'Embedding many-to-many as unbounded lists in both classes without a join entity.',
      'Confusing association with inheritance — "Doctor IS-A Person" is different from "Doctor uses Patient."',
    ],
  },
  {
    title: 'Aggregation',
    body: relationshipBodies.Aggregation,
    tag: 'HAS-A',
    description:
      'A weak whole-part relationship where a container references external objects that survive even if the container is destroyed.',
    definition:
      'Aggregation is a HAS-A relationship with shared ownership: the whole groups parts, but parts can exist independently and outlive the whole. The container holds references, often injected from outside, rather than creating exclusive lifetime control. Parts may be shared among multiple wholes (one Player on two Team rosters in a tournament). UML uses a hollow diamond on the whole side. In code, aggregation typically appears as constructor injection of pre-built objects — the parent never calls `new` on the child. The distinction from composition is lifecycle: if destroying the parent should not destroy the child, it is aggregation. Interviewers acknowledge the UML distinction is subtle and code looks similar — intent and lifecycle rules differentiate them.',
    analogy:
      'A university department and professors: the department groups professors for organizational purposes, but a professor can transfer to another department, retire, or consult independently. Dissolving the Computer Science department does not delete the people — they persist and join other departments. The department HAS professors; it does not own their existence.',
    detailedExample:
      'In a sports league app, `Team` aggregates `Player` objects passed into its constructor. Players are created separately, may be traded between teams, and exist in the player registry after a team disbands. `League` aggregates multiple `Team` objects — shutting down a seasonal league does not delete team franchises or players. Contrast with `Car` composing `Engine` — you do not transplant engines between cars as first-class domain objects.',
    whenAsked:
      'Q: "Team and Player — aggregation or composition?" — Answer: aggregation. Players exist independently, can switch teams, and outlive a disbanded team. If Player were an inner class created only by Team and meaningless alone, that would be composition.\n\nQ: "Does aggregation vs composition matter in code?" — Answer: often the same field reference syntax — the difference is who creates/destroys the child and whether parts are shared. Explain lifecycle intent; interviewers value the reasoning.\n\nQ: "How is aggregation different from association?" — Answer: aggregation implies a whole-part grouping (Team-Player); association is generic collaboration without part-of semantics.',
    codePython: `class Player:
    def __init__(self, name: str) -> None:
        self.name = name

class Team:
    def __init__(self, players: list[Player]) -> None:
        self.players = players  # injected, not created here

p1 = Player("Alex")
p2 = Player("Jordan")
team = Team([p1, p2])

team.players = []  # team disbanded — players still exist
print(p1.name)  # Alex`,
    codeJava: `import java.util.ArrayList;
import java.util.List;

class Player {
    private final String name;

    Player(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}

class Team {
    private List<Player> players;

    Team(List<Player> players) {
        this.players = players; // injected, not created here
    }

    void setPlayers(List<Player> players) {
        this.players = players;
    }
}

Player p1 = new Player("Alex");
Player p2 = new Player("Jordan");
Team team = new Team(List.of(p1, p2));

team.setPlayers(List.of()); // team disbanded — players still exist
System.out.println(p1.getName()); // Alex`,
    interviewTips: [
      'HAS-A with shared lifecycle — hollow diamond in UML on the whole side.',
      'Whole does not exclusively create or destroy parts.',
      'Parts may belong to multiple aggregates simultaneously (shared reference).',
      'Constructor injection of pre-built objects signals aggregation.',
      'Weaker than composition — think "groups" not "owns exclusively."',
      'If unsure in an interview, explain lifecycle: "Players survive team deletion → aggregation."',
      'Contrast with composition: Car-Engine, Order-OrderLine — parts die with whole.',
    ],
    commonMistakes: [
      'Labeling every HAS-A as composition because the parent holds a reference.',
      'Creating children inside the parent constructor but calling it aggregation.',
      'Ignoring shared ownership — two teams claiming exclusive composition over same Player.',
      'Over-emphasizing UML diamond shading when code evidence is what interviewers want.',
    ],
  },
  {
    title: 'Composition',
    body: relationshipBodies.Composition,
    tag: 'PART-OF',
    description:
      'A strong whole-part relationship where a container exclusively owns its components, meaning they die if the container is destroyed.',
    definition:
      'Composition is strong HAS-A / PART-OF: the parent creates components, controls their lifetime, and they cannot meaningfully exist without the parent. When the container is destroyed, its parts are destroyed with it. Parts are not shared with other parents — an Engine belongs to one Car. UML uses a filled diamond on the whole side. Composition is the preferred way to reuse behavior without inheritance ("composition over inheritance"): delegate to owned components rather than extending a fragile base class. It appears in design patterns like Composite (tree structures), Decorator (wrapper owns wrappee), and typical domain modeling (Order owns OrderLines).',
    analogy:
      'A house and its rooms: you do not move Room 101 to another house as an intact, independent entity. Rooms are created with the house, cannot exist without a building in this model, and are demolished when the house is torn down. The house exclusively owns the room lifecycle — strong whole-part bond.',
    detailedExample:
      'In an e-commerce system, `Order` composes `OrderLine` items. Lines are created when the order is created (`new OrderLine(product, qty)` inside `Order.addItem()`), cannot belong to two orders, and are deleted when the order is cancelled. `Car` composes `Engine` — the engine is instantiated in the car constructor and is not shared. `TextEditor` composes `SpellChecker` as an internal component rather than inheriting from it.',
    whenAsked:
      'Q: "Engine and Car — composition or aggregation?" — Answer: composition. Engine is created with the car, not shared between cars, and has no independent domain life (in typical modeling). Destroying the car destroys the engine instance.\n\nQ: "What does composition over inheritance mean?" — Answer: prefer owning behavior via fields (`Car` has `Engine`) over extending classes (`SportsCar extends Car extends Vehicle`). Reduces coupling and avoids fragile base classes.\n\nQ: "How does composition relate to the Composite pattern?" — Answer: Composite uses tree composition — Folder contains Files and sub-Folders; child lifecycle tied to parent; uniform `render()` interface.',
    codePython: `class Engine:
    def start(self) -> None:
        print("Engine running")

class Car:
    def __init__(self) -> None:
        self._engine = Engine()  # created and owned internally

    def start(self) -> None:
        self._engine.start()
        print("Car moving")

car = Car()
car.start()
# when car is garbage-collected, engine goes with it`,
    codeJava: `class Engine {
    void start() {
        System.out.println("Engine running");
    }
}

class Car {
    private final Engine engine = new Engine(); // created and owned internally

    void start() {
        engine.start();
        System.out.println("Car moving");
    }
}

Car car = new Car();
car.start();
// when car is garbage-collected, engine goes with it`,
    interviewTips: [
      'PART-OF — filled diamond in UML; strongest whole-part bond.',
      'Child created inside parent; not shared with other parents.',
      '"Composition over inheritance" — delegate behavior to owned components.',
      'If the part can outlive the whole, it is aggregation, not composition.',
      'Composite pattern: uniform treatment of leaf and container via composition tree.',
      'Destructor/cleanup: in languages with manual memory, parent deletes children.',
      'Test for composition: "Does this object make sense without its parent?" — if no, composition.',
    ],
    commonMistakes: [
      'Using inheritance when a HAS-A component would be simpler (Car extends Engine).',
      'Sharing composed children between two parents — that is aggregation at best.',
      'Creating children outside the parent but calling it composition without exclusive ownership.',
      'Assuming garbage collection means composition does not matter — domain lifecycle still differs.',
    ],
  },
];
