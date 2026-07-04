import type { InterviewConcept } from './types';

export type Relationship = InterviewConcept & { tag: string };

export const relationships: Relationship[] = [
  {
    title: 'Inheritance',
    tag: 'IS-A',
    description:
      'A strict parent-child relationship where a subclass permanently copies the structure and behavior of a superclass.',
    definition:
      'Inheritance expresses taxonomy: Dog IS-A Animal, SavingsAccount IS-A BankAccount. The subclass inherits attributes and methods and may override them. UML shows this with a hollow triangle arrow pointing to the parent. It is the strongest form of type relationship and should be used only when substitutability holds.',
    analogy:
      'Biological classification: every Golden Retriever is a Dog, every Dog is a Mammal. You do not say "a Dog has a Mammal" — the subtype fully is that type, with specialized behavior on top.',
    whenAsked:
      'Interviewers draw a class diagram and ask you to label IS-A vs HAS-A. Follow-ups: "Can a Square inherit from Rectangle?" (LSP trap), multiple inheritance issues, and when interface implementation replaces class inheritance.',
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
      'IS-A = inheritance or interface implementation with substitutability.',
      'Arrow in UML: subclass → superclass (hollow triangle on parent side).',
      'Violating LSP (e.g., Square extends Rectangle) means wrong IS-A modeling.',
      'Prefer interfaces for capability ("CanFly") over deep class hierarchies.',
    ],
  },
  {
    title: 'Association',
    tag: 'USES-A',
    description:
      'A loose relationship where two completely independent objects interact with each other without any ownership.',
    definition:
      'Association means objects know about each other and collaborate, but neither owns the other\'s lifecycle. It is the weakest structural link — often a reference passed as a parameter or stored temporarily. Multiplicity can be one-to-one, one-to-many, or many-to-many.',
    analogy:
      'A customer uses a cab: both exist independently before and after the ride. The customer does not own the cab, and destroying one does not automatically destroy the other.',
    whenAsked:
      'Common in LLD rounds: "How does a Doctor relate to a Patient?" or modeling collaborations without ownership. Follow-ups: association vs dependency, bidirectional associations, and how to represent many-to-many (join entity).',
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
      'USES-A / knows-about — weakest link; no lifecycle control.',
      'Often shown as a simple line in UML; may include role names and multiplicity.',
      'Differs from dependency (temporary use in method signature) only in duration — interviews often treat them similarly.',
      'Many-to-many associations usually become a separate association class or join table.',
    ],
  },
  {
    title: 'Aggregation',
    tag: 'HAS-A',
    description:
      'A weak whole-part relationship where a container references external objects that survive even if the container is destroyed.',
    definition:
      'Aggregation is a HAS-A relationship with shared ownership: the whole contains parts, but parts can exist outside the whole and outlive it. The container holds references, often injected from outside, rather than creating exclusive lifetime control. UML uses a hollow diamond on the whole side.',
    analogy:
      'A university department and professors: the department groups professors, but a professor can transfer to another department or retire independently — deleting the department does not delete the people.',
    whenAsked:
      'Asked to distinguish aggregation from composition: "Team and Player — which is which?" Follow-ups: who creates the child objects, can parts be shared among wholes, and whether the distinction matters in code (often implementation reveals intent).',
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
      'HAS-A with shared lifecycle — hollow diamond in UML.',
      'Whole does not exclusively create/destroy parts.',
      'Parts may belong to multiple aggregates (shared reference).',
      'In code, constructor injection of pre-built objects signals aggregation.',
    ],
  },
  {
    title: 'Composition',
    tag: 'PART-OF',
    description:
      'A strong whole-part relationship where a container exclusively owns its components, meaning they die if the container is destroyed.',
    definition:
      'Composition is strong HAS-A / PART-OF: the parent creates components, controls their lifetime, and they cannot meaningfully exist without the parent. When the container is destroyed, its parts go with it. UML uses a filled diamond on the whole side. This is the default when modeling components that are meaningless alone.',
    analogy:
      'A house and its rooms: you do not move Room 101 to another house as an intact entity — rooms are created with the house and demolished with it. The house owns the room lifecycle.',
    whenAsked:
      'Classic question: "Engine and Car — composition or aggregation?" Follow-ups: why composition over inheritance, implementing composition in code (creating parts in constructor), and connecting to the Composite design pattern.',
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
      'PART-OF — filled diamond; strongest whole-part bond.',
      'Child created inside parent; not shared with other parents.',
      '"Composition over inheritance" — delegate behavior to owned components.',
      'If the part can outlive the whole, it is aggregation, not composition.',
    ],
  },
];
