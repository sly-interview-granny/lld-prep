import type { InterviewConcept } from './types';

export type Relationship = InterviewConcept & { tag: string };

export const relationships: Relationship[] = [
  {
    title: 'Inheritance',
    tag: 'IS-A',
    description:
      'A strict parent-child relationship where a subclass permanently copies the structure and behavior of a superclass.',
    definition:
      'Inheritance expresses a taxonomic IS-A relationship: Dog IS-A Animal, SavingsAccount IS-A BankAccount, PremiumUser IS-A User. The subclass inherits attributes and methods from the superclass and may override or extend them while retaining substitutability wherever the parent type is expected. In UML class diagrams, inheritance is drawn as a solid line with a hollow triangle arrowhead pointing to the parent. It is the strongest structural relationship between classes because the subtype is a specialized form of the supertype, not merely a collaborator. Because inheritance couples subclasses to parent implementation details, it should be reserved for genuine specialization — not convenience reuse. When substitutability fails (Square pretending to be Rectangle), the relationship is modeled incorrectly and polymorphism will break at runtime.',
    analogy:
      'Biological classification works as IS-A: every Golden Retriever is a Dog, and every Dog is a Mammal. You would never say "a Dog has a Mammal" — the Golden Retriever fully is those types, inheriting general mammal traits (warm-blooded, vertebrate) while adding breed-specific behavior. If you tried to treat a fish as a mammal because both are animals, the classification breaks — same as forcing a wrong IS-A in code.',
    detailedExample:
      'In a ride-sharing app, Vehicle defines move() and getCapacity(). Car, Bike, and Truck each extend Vehicle with specialized move() behavior and capacity rules. TripAssignmentService accepts Vehicle and calls move() without knowing the concrete type — valid because Car IS-A Vehicle. If Helicopter needed fly() but not all vehicles fly, do not cram fly() into Vehicle; use a CanFly interface instead to avoid polluting the base class.',
    whenAsked:
      'Q1: "Label IS-A vs HAS-A on this diagram." — Look for hollow triangle arrows (inheritance) vs lines/diamonds (association/aggregation/composition). IS-A means substitutability: child can stand in for parent. Q2: "Can Square inherit from Rectangle?" — No; Square violates Rectangle\'s independent width/height contract (LSP). Model them as separate types or use composition. Q3: "When does interface implementation replace class inheritance?" — When you need multiple capabilities (Serializable, Comparable), when implementations share no code, or when you want to avoid fragile base classes.',
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
      'IS-A = inheritance or interface implementation where the subtype is substitutable for the supertype.',
      'UML: hollow triangle on the parent side; arrow from subclass to superclass.',
      'Square/Rectangle is the go-to LSP trap — mention it before the interviewer does.',
      'Prefer interfaces for cross-cutting capabilities (Flyable, Payable) over bloated base classes.',
      'Multiple inheritance of classes is limited (Java: single class, multiple interfaces; Python: MRO complexity).',
      'Distinguish IS-A (type taxonomy) from HAS-A (ownership) — mixing them in one hierarchy causes design rot.',
      'Pitfall: using inheritance only to reuse a helper method — extract a utility or compose instead.',
    ],
    commonMistakes: [
      'Declaring IS-A when behavior diverges enough that callers need instanceof checks on the subtype.',
      'Putting shared fields in a base class that only some subclasses need, forcing empty overrides elsewhere.',
      'Confusing implements (contract IS-A capability) with extends (implementation IS-A type) in discussion.',
    ],
  },
  {
    title: 'Association',
    tag: 'USES-A',
    description:
      'A loose relationship where two completely independent objects interact with each other without any ownership.',
    definition:
      'Association is a structural relationship where two classes are connected because objects of one type interact with objects of another, but neither owns the other\'s lifecycle. The link can be unidirectional (Doctor consults Patient) or bidirectional (Student enrolls in Course, Course lists Students). Multiplicity annotates how many instances participate: one-to-one, one-to-many, or many-to-many. Association is weaker than aggregation and composition — objects exist independently before, during, and after the interaction. In code, association often appears as a method parameter, a short-lived reference, or a field without create/destroy responsibility. It is the default way to model collaborations in LLD when ownership is not part of the story.',
    analogy:
      'A customer hailing a cab illustrates association: both exist independently before the ride. The customer uses the cab for a trip; when the ride ends, both continue existing — destroying the customer object would not automatically destroy the cab, and vice versa. Neither party exclusively owns the other; they simply collaborate for a period of time.',
    detailedExample:
      'In a hospital system, Doctor.consult(patient) takes a Patient reference for the duration of the appointment. Doctors and patients are created and managed separately; ending a consultation does not delete either entity. For many-to-many (Students and Courses), introduce an Enrollment association class holding studentId, courseId, and semesterGrade — avoid embedding unbounded lists without a clear ownership model.',
    whenAsked:
      'Q1: "How does Doctor relate to Patient?" — Association (USES-A): Doctor interacts with Patient during consult; no ownership of lifecycle. Q2: "Association vs dependency?" — Dependency is often a transient use (local variable, parameter in one method); association implies a longer-lasting link (field reference). Interviews frequently treat them as similar — emphasize duration and structural vs transient. Q3: "How do you model many-to-many?" — Join entity (Enrollment, OrderItem) or association class with its own attributes.',
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
      'USES-A / knows-about — weakest structural link; no lifecycle control by either side.',
      'UML: simple line between classes; add role names (consultant, patient) and multiplicity (1..*, 0..1).',
      'Bidirectional associations increase coupling — prefer unidirectional navigation when possible.',
      'Many-to-many almost always needs an association/join class with its own identity and attributes.',
      'Do not confuse association with dependency dashed arrows — both mean "uses," but association is structural.',
      'Compare to aggregation: association has no whole-part semantics; aggregation implies grouping.',
      'Pitfall: modeling every method parameter as a permanent association field — keep references only where needed.',
    ],
    commonMistakes: [
      'Using association arrows when composition or aggregation better captures whole-part semantics.',
      'Storing bidirectional references without clear ownership, causing memory leaks or inconsistent state.',
      'Omitting multiplicity on diagrams when the cardinality constraint matters for database or API design.',
    ],
  },
  {
    title: 'Aggregation',
    tag: 'HAS-A',
    description:
      'A weak whole-part relationship where a container references external objects that survive even if the container is destroyed.',
    definition:
      'Aggregation is a specialized HAS-A relationship where a whole groups parts, but parts have independent lifecycles and can exist outside the whole. The container typically receives part references from outside (constructor or setter injection) rather than creating them exclusively. If the whole is destroyed, parts persist — disbanding a team does not delete the players. UML represents aggregation with a hollow diamond on the whole side connected to the part. Semantically it sits between association and composition: there is a whole-part meaning, but ownership is shared or weak. In practice, the aggregation vs composition distinction is debated — many teams focus on who creates and destroys objects in code rather than diamond shading alone.',
    analogy:
      'A university department and its professors: the department organizes professors into a group for administration and budgeting, but professors exist independently — they can transfer departments, retire, or consult elsewhere while the department continues. Dissolving the department does not erase the people; it only dissolves the grouping relationship.',
    detailedExample:
      'In a sports league app, Team holds a list of Player objects injected at construction. Players are created by a PlayerRegistry or signed from free agency — Team does not new Player() internally. When Team disbands, Player records remain for stats history and reassignment to new teams. The same Player instance might appear on an All-Star roster (another aggregate) simultaneously — shared references signal aggregation, not composition.',
    whenAsked:
      'Q1: "Team and Player — aggregation or composition?" — Aggregation if players exist independently and are injected; composition if Team creates Player internally and players cannot exist without a team. Q2: "Does the UML diamond matter in code?" — What matters is lifecycle: who creates, who destroys, can parts be shared. Hollow vs filled diamond reflects intent; implementation confirms it. Q3: "Aggregation vs association?" — Aggregation adds whole-part grouping semantics; plain association is mere collaboration without "part of" meaning.',
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
      'HAS-A with shared lifecycle — hollow diamond in UML on the whole/container side.',
      'Whole does not exclusively create or destroy parts; parts may pre-exist the whole.',
      'Parts can be shared across multiple wholes (same Player on two teams conceptually — rare but valid).',
      'Constructor injection of pre-built objects is a code smell hinting aggregation.',
      'If unsure between aggregation and association, ask: is there a meaningful "part of" grouping? If yes, lean aggregation.',
      'Contrast with composition: if destroying the whole must destroy parts, it is composition.',
      'Pitfall: debating diamond shading for minutes — steer toward concrete create/destroy responsibilities.',
    ],
    commonMistakes: [
      'Labeling every HAS-A relationship aggregation when the part is actually created and owned internally.',
      'Assuming aggregation implies deep copying — it only describes lifecycle independence, not copy semantics.',
      'Creating Team internally with new Player() while calling it aggregation — that behavior is composition.',
    ],
  },
  {
    title: 'Composition',
    tag: 'PART-OF',
    description:
      'A strong whole-part relationship where a container exclusively owns its components, meaning they die if the container is destroyed.',
    definition:
      'Composition is the strongest whole-part relationship: the parent creates components, controls their entire lifecycle, and parts cannot meaningfully exist without the parent context. When the container is destroyed, its composed parts are destroyed with it — there is no sensible notion of moving a room to another house as an intact entity. UML shows composition with a filled diamond on the whole side. In code, composition appears when the parent instantiates parts in its constructor (or factory method) and does not expose them for external reassignment. This pattern underpins "composition over inheritance" — behavior is delegated to owned components rather than inherited from deep hierarchies. The Composite design pattern (tree structures of part-whole hierarchies) builds directly on composition semantics.',
    analogy:
      'A house and its rooms demonstrate composition: Room 101 is created as part of a specific house, cannot be relocated intact to another building in this model, and is demolished when the house is torn down. You do not hire a room from a room pool and attach it temporarily — the room\'s identity is tied to the house that owns its lifecycle.',
    detailedExample:
      'In a Car class, Engine is instantiated inside Car\'s constructor as a private final field. External code never receives an Engine reference to reattach elsewhere. When Car is scrapped, the engine goes with it — you do not salvage the engine object in the domain model independently. Similarly, Order composes OrderLineItem objects: canceling/deleting the order removes line items; line items are not shared across orders.',
    whenAsked:
      'Q1: "Engine and Car — composition or aggregation?" — Composition: Car creates and owns Engine; engine does not exist as a standalone domain object outside the car. Q2: "Why composition over inheritance?" — Behavior varies by combining components (Engine, GPS, BluetoothModule) instead of subclass explosion (Car, CarWithGPS, CarWithGPSAndBluetooth...). Q3: "How does this relate to the Composite pattern?" — Composite builds tree structures where leaves and composites share an interface; both treat part-whole uniformly (FileSystem folders and files).',
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
      'PART-OF — filled diamond in UML; strongest whole-part bond with exclusive ownership.',
      'Child created inside parent constructor; not intended for sharing across multiple parents.',
      '"Composition over inheritance" — delegate behavior to owned components to avoid fragile hierarchies.',
      'If the part can outlive or be transferred independently of the whole, it is aggregation, not composition.',
      'Hide composed objects behind the parent interface — callers interact with Car.start(), not Engine directly.',
      'Composite pattern: uniform treat of individual objects and compositions (UI widgets, file trees).',
      'Pitfall: exposing internal components via getters enables external mutation that breaks encapsulation.',
    ],
    commonMistakes: [
      'Calling it composition while injecting parts from outside and allowing reassignment — that is aggregation.',
      'Sharing one composed instance across two parents without clear domain rules — usually a design error.',
      'Using inheritance for every feature variant instead of composing feature objects (Favor composition).',
    ],
  },
];
