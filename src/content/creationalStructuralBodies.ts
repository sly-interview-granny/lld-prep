/** Rich narrative markdown bodies for Creational and Structural patterns */
export const creationalStructuralBodies: Record<string, string> = {
  singleton: `The **Singleton Design Pattern** is a creational pattern that guarantees a class has exactly one instance in a process and exposes a single, well-known access point to that instance.

Instead of letting every module construct its own copy of expensive shared infrastructure (configuration loaders, metric registries, connection coordinators), the Singleton centralizes creation so all callers read from the same object. The goal is controlled uniqueness—not a license to scatter global mutable state across your codebase.

### The Core Concept: "One Source of Truth for Shared Infrastructure"

Imagine you are building the **backend for a food-delivery platform** serving Koramangala, Indiranagar, and Whitefield.

* On startup, the app must load environment config once—API keys, DB URLs, feature flags.
* Every service (orders, payments, notifications) needs that same config object.
* If each service parses \`.env\` independently, you waste memory, risk inconsistent values, and race during initialization in multi-threaded servers.

Without Singleton (or an equivalent DI-scoped bean), every caller does its own construction:

**The Problem:** Duplicate initialization, inconsistent state, and hidden coupling through \`new ConfigLoader()\` sprinkled everywhere. Testing becomes painful because you cannot swap the config source without editing dozens of files.

---

\`\`\`python
# Anti-pattern — every module creates its own "shared" config
class ConfigLoader:
    def __init__(self):
        print("Parsing .env from disk...")  # runs many times
        self.api_key = "sk_live_..."

class OrderService:
    def __init__(self):
        self.config = ConfigLoader()  # duplicate instance

class PaymentService:
    def __init__(self):
        self.config = ConfigLoader()  # another duplicate
\`\`\`

\`\`\`java
// Anti-pattern — multiple instances of supposedly shared infrastructure
public class ConfigLoader {
    public ConfigLoader() {
        System.out.println("Parsing .env from disk...");
    }
}

public class OrderService {
    private final ConfigLoader config = new ConfigLoader();
}

public class PaymentService {
    private final ConfigLoader config = new ConfigLoader();
}
\`\`\`

Every service thinks it has "the" config, but each constructor triggers a fresh parse. In production this means wasted I/O, divergent cached values, and flaky startup under load.

---

### Refactoring with Singleton Pattern

We ensure exactly one \`ConfigLoader\` exists and expose a controlled accessor.

#### Step 1: Define the Singleton Class with Private Constructor

The constructor is private so external code cannot call \`new\`. Creation is centralized inside the class.

\`\`\`python
class ConfigLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self) -> None:
        print("Parsing .env once at startup...")
        self.api_key = "sk_live_..."
\`\`\`

\`\`\`java
public class ConfigLoader {
    private static ConfigLoader instance;

    private ConfigLoader() {
        System.out.println("Parsing .env once at startup...");
    }

    public static ConfigLoader getInstance() {
        if (instance == null) {
            instance = new ConfigLoader();
        }
        return instance;
    }
}
\`\`\`

#### Step 2: Provide a Global Access Point

Callers obtain the instance through \`getInstance()\` (Java) or simply \`ConfigLoader()\` in Python's \`__new__\` idiom—never through a public constructor.

\`\`\`python
config_a = ConfigLoader()
config_b = ConfigLoader()
assert config_a is config_b  # same object
\`\`\`

\`\`\`java
ConfigLoader a = ConfigLoader.getInstance();
ConfigLoader b = ConfigLoader.getInstance();
System.out.println(a == b); // true
\`\`\`

#### Step 3: Wire Services to the Shared Instance

Services depend on the singleton access point instead of constructing their own copy.

\`\`\`python
class OrderService:
    def __init__(self):
        self.config = ConfigLoader()

class PaymentService:
    def __init__(self):
        self.config = ConfigLoader()
\`\`\`

\`\`\`java
public class OrderService {
    private final ConfigLoader config = ConfigLoader.getInstance();
}

public class PaymentService {
    private final ConfigLoader config = ConfigLoader.getInstance();
}
\`\`\`

#### Step 4: Client Execution

The application bootstraps once; all modules see identical configuration.

\`\`\`python
order_svc = OrderService()
payment_svc = PaymentService()
print(order_svc.config is payment_svc.config)  # True
\`\`\`

\`\`\`java
public class Main {
    public static void main(String[] args) {
        OrderService orders = new OrderService();
        PaymentService payments = new PaymentService();
        // both share ConfigLoader.getInstance()
    }
}
\`\`\`

---

### When to Use It

* **True process-wide uniqueness:** One config registry, one metrics collector, one hardware device handle per JVM/process.
* **Expensive initialization:** Parsing large files, opening connection pools—pay the cost once.
* **Consistent in-memory state:** All threads and requests must see the same authoritative object.
* **Third-party constraint:** A library or OS resource allows only one handle.

### Comparison: Singleton vs. Static Utility Class

Both offer a global access point, but **intent differs**:

* **Singleton:** A real object instance—it can implement interfaces, participate in polymorphism, and be passed where an interface is expected.
* **Static Utility Class:** A bag of \`static\` methods with no instance lifecycle; cannot be substituted in tests via interface mocking without bytecode tricks.

In interviews, mention that **dependency injection containers** (Spring \`@Singleton\` scope) often replace hand-rolled Singletons while preserving the "one instance" guarantee with better testability.`,

  builder: `The **Builder Design Pattern** is a creational pattern that separates the step-by-step construction of a complex object from its final representation, letting you assemble different variants using the same building process.

Instead of forcing callers through a telescoping constructor with twelve optional parameters (\`Order(id, user, address, coupon, giftWrap, priority, ...)\`), the Builder exposes readable, named steps and validates the product before it exists. The constructed object can be immutable—safe to pass across threads once \`build()\` returns.

### The Core Concept: "Assemble Before You Ship"

Imagine you run a **dosa counter in Indiranagar** that offers fully customizable meals.

* A customer wants a masala dosa—thin roast, extra ghee, no onion, with filter coffee.
* Another wants rava dosa on a plate, sambar on the side, extra chutney.
* The kitchen cannot serve a half-specified order; every ticket must be complete before it hits the tava.

If you model this with one giant constructor, readability collapses:

**The Problem:** Callers pass \`null\` for unused slots, parameter order is easy to confuse (\`true, false, 2\`—what do those mean?), and invalid combinations slip through because there is no validation gate before the object exists.

---

\`\`\`python
# Anti-pattern — telescoping constructor, unclear and unsafe
class LunchOrder:
    def __init__(self, item, plate, ghee, onion, coffee, priority, coupon):
        self.item = item
        # easy to pass wrong argument order; no validation
\`\`\`

\`\`\`java
// Anti-pattern — constructor explosion
public class LunchOrder {
    public LunchOrder(String item, boolean onPlate, boolean extraGhee,
                      boolean noOnion, boolean coffee, int priority, String coupon) {
        // which boolean is which? callers will get it wrong
    }
}
\`\`\`

---

### Refactoring with Builder Pattern

We introduce a builder that accumulates choices fluently and validates at \`build()\`.

#### Step 1: Define the Product (Immutable Target)

The product holds the final, validated state.

\`\`\`python
class LunchOrder:
    def __init__(self, item: str, on_plate: bool, extras: list[str]):
        self.item = item
        self.on_plate = on_plate
        self.extras = extras
\`\`\`

\`\`\`java
public class LunchOrder {
    private final String item;
    private final boolean onPlate;
    private final List<String> extras;

    public LunchOrder(String item, boolean onPlate, List<String> extras) {
        this.item = item;
        this.onPlate = onPlate;
        this.extras = extras;
    }
}
\`\`\`

#### Step 2: Implement the Builder with Fluent Steps

Each setter returns \`self\` (or \`this\`) for chaining.

\`\`\`python
class LunchOrderBuilder:
    def __init__(self):
        self._item = "masala_dosa"
        self._on_plate = False
        self._extras: list[str] = []

    def item(self, name: str):
        self._item = name
        return self

    def on_plate(self):
        self._on_plate = True
        return self

    def add_extra(self, extra: str):
        self._extras.append(extra)
        return self

    def build(self) -> LunchOrder:
        if not self._item:
            raise ValueError("Item required")
        return LunchOrder(self._item, self._on_plate, self._extras.copy())
\`\`\`

\`\`\`java
public class LunchOrderBuilder {
    private String item = "masala_dosa";
    private boolean onPlate = false;
    private final List<String> extras = new ArrayList<>();

    public LunchOrderBuilder item(String name) { this.item = name; return this; }
    public LunchOrderBuilder onPlate() { this.onPlate = true; return this; }
    public LunchOrderBuilder addExtra(String extra) { extras.add(extra); return this; }

    public LunchOrder build() {
        if (item == null || item.isBlank()) throw new IllegalStateException("Item required");
        return new LunchOrder(item, onPlate, new ArrayList<>(extras));
    }
}
\`\`\`

#### Step 3: Optional Director (Fixed Build Sequence)

When many clients build the same combo, a Director encodes the recipe.

\`\`\`python
def build_indiranagar_combo() -> LunchOrder:
    return (
        LunchOrderBuilder()
        .item("masala_dosa")
        .on_plate()
        .add_extra("filter_coffee")
        .build()
    )
\`\`\`

\`\`\`java
public class MenuDirector {
    public LunchOrder indiranagarCombo() {
        return new LunchOrderBuilder()
            .item("masala_dosa")
            .onPlate()
            .addExtra("filter_coffee")
            .build();
    }
}
\`\`\`

#### Step 4: Client Execution

The client reads like an order ticket, not a positional argument list.

\`\`\`python
order = (
    LunchOrderBuilder()
    .item("rava_dosa")
    .on_plate()
    .add_extra("extra_sambar")
    .build()
)
\`\`\`

\`\`\`java
LunchOrder order = new LunchOrderBuilder()
    .item("rava_dosa")
    .onPlate()
    .addExtra("extra_sambar")
    .build();
\`\`\`

---

### When to Use It

* **Many optional parameters:** Reports, HTTP requests, test fixtures—anything with 4+ optional fields.
* **Immutable products:** You want a fully specified object with no half-built state leaking out.
* **Validation before creation:** \`build()\` rejects invalid combos (e.g., gift wrap without shipping address).
* **Shared construction steps:** Different representations (PDF vs HTML export) reuse the same assembly pipeline.

### Comparison: Builder vs. Factory

* **Builder:** Assembles **one type** with many configurations—same product class, different field combinations.
* **Factory:** Chooses **which concrete class** to instantiate—\`StripeProcessor\` vs \`RazorpayProcessor\`; not about stepwise field assembly.

A common interview follow-up: use **Factory** to pick the builder, **Builder** to construct the product.`,

  factory: `The **Factory Design Pattern** (Factory Method / Simple Factory) is a creational pattern that defines an interface for creating objects while letting a dedicated creator decide which concrete class to instantiate.

Instead of scattering \`new StripeProcessor()\` and \`new RazorpayProcessor()\` across checkout, payment, and refund modules, clients depend on \`PaymentProcessor\` and ask a factory for the right implementation at runtime. Adding UPI or PhonePe means registering a new class—not editing every caller.

### The Core Concept: "Tell Me What You Want, Not How It's Built"

Imagine a **ride-hailing kiosk at Kempegowda Airport** where travelers pick a payment mode.

* Some pay by credit card, others by UPI, others by corporate wallet.
* The kiosk UI should not import Stripe SDK, Razorpay SDK, and Paytm SDK directly.
* When the airport adds a new payment partner, the kiosk screen should not need a code deploy.

Without a factory, payment creation leaks into business logic:

**The Problem:** Every new provider forces edits to checkout, refunds, and subscriptions. Unit tests cannot swap a mock processor without monkey-patching \`new\`. The Open/Closed Principle is violated the moment marketing signs a new payment deal.

---

\`\`\`python
# Anti-pattern — checkout knows every concrete payment class
class Checkout:
    def pay(self, provider: str, amount: float) -> None:
        if provider == "stripe":
            StripeProcessor().charge(amount)
        elif provider == "razorpay":
            RazorpayProcessor().charge(amount)
        elif provider == "upi":
            UpiProcessor().charge(amount)
        else:
            raise ValueError("Unknown provider")
\`\`\`

\`\`\`java
// Anti-pattern — growing switch in core business logic
public class Checkout {
    public void pay(String provider, double amount) {
        if ("stripe".equals(provider)) new StripeProcessor().charge(amount);
        else if ("razorpay".equals(provider)) new RazorpayProcessor().charge(amount);
        else if ("upi".equals(provider)) new UpiProcessor().charge(amount);
        else throw new IllegalArgumentException("Unknown provider");
    }
}
\`\`\`

---

### Refactoring with Factory Pattern

We centralize creation behind a factory that returns the abstract type.

#### Step 1: Define the Product Interface

All payment processors share a contract.

\`\`\`python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount: float) -> None: ...
\`\`\`

\`\`\`java
public interface PaymentProcessor {
    void charge(double amount);
}
\`\`\`

#### Step 2: Implement Concrete Products

Each provider is its own class.

\`\`\`python
class StripeProcessor(PaymentProcessor):
    def charge(self, amount: float) -> None:
        print(f"Charged ₹{amount} via Stripe")

class UpiProcessor(PaymentProcessor):
    def charge(self, amount: float) -> None:
        print(f"Charged ₹{amount} via UPI")
\`\`\`

\`\`\`java
public class StripeProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("Charged ₹" + amount + " via Stripe");
    }
}

public class UpiProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("Charged ₹" + amount + " via UPI");
    }
}
\`\`\`

#### Step 3: Create the Factory

The factory maps runtime input to concrete instances.

\`\`\`python
class PaymentFactory:
    _registry = {
        "stripe": StripeProcessor,
        "upi": UpiProcessor,
    }

    @classmethod
    def create(cls, provider: str) -> PaymentProcessor:
        impl = cls._registry.get(provider)
        if impl is None:
            raise ValueError(f"Unknown provider: {provider}")
        return impl()
\`\`\`

\`\`\`java
public class PaymentFactory {
    public static PaymentProcessor create(String provider) {
        if ("stripe".equals(provider)) return new StripeProcessor();
        if ("upi".equals(provider)) return new UpiProcessor();
        throw new IllegalArgumentException("Unknown provider: " + provider);
    }
}
\`\`\`

#### Step 4: Client Execution

Checkout depends only on the interface; the factory hides \`new\`.

\`\`\`python
def checkout(provider: str, amount: float) -> None:
    processor = PaymentFactory.create(provider)
    processor.charge(amount)

checkout("upi", 349.0)
\`\`\`

\`\`\`java
public class Checkout {
    public void pay(String provider, double amount) {
        PaymentProcessor processor = PaymentFactory.create(provider);
        processor.charge(amount);
    }
}
\`\`\`

---

### When to Use It

* **Runtime product selection:** Payment method, file parser by extension, cloud region, feature flag.
* **Decouple clients from concrete classes:** Checkout should not import vendor SDKs.
* **Non-trivial construction:** License validation, config wiring before returning the product.
* **Testability:** Swap the factory (or inject a registry) to return mocks in unit tests.

### Comparison: Factory vs. Abstract Factory

* **Factory (Method / Simple Factory):** Creates **one kind** of product—\`createPayment()\` returns a single \`PaymentProcessor\`.
* **Abstract Factory:** Creates **families** of related products—dark-theme button + checkbox + dialog that must match visually.

If only one product type varies, Factory is enough. If switching themes/platforms means swapping entire coordinated sets, reach for Abstract Factory.`,

  'abstract-factory': `The **Abstract Factory Design Pattern** is a creational pattern that provides an interface for creating **families** of related or dependent objects without specifying their concrete classes.

Instead of mixing a dark-theme button with a light-theme checkbox because two separate factories were called, Abstract Factory guarantees that every widget you create from \`DarkThemeFactory\` belongs to the same visual and behavioral family. The client works with \`UIFactory\` and never accidentally pairs incompatible components.

### The Core Concept: "Pick a Style, Get the Whole Set"

Imagine you are building a **multi-city transit app** for Bengaluru, Mumbai, and Delhi.

* Each city needs icons, color palette, and fare terminology that feel local—Namma Metro styling in Bengaluru, BEST bus styling in Mumbai.
* Users must never see Mumbai-red buttons paired with Bengaluru-green route cards.
* Switching "city theme" at runtime should swap **every** UI element together.

Without Abstract Factory, UI creation fragments across independent factories:

**The Problem:** Callers must remember to pair the right button factory with the right checkbox factory. One mistake and the app looks broken. Adding a new widget type (\`createMapPin()\`) forces edits in every theme branch scattered through the codebase.

---

\`\`\`python
# Anti-pattern — unrelated factories, easy to mix incompatible widgets
def build_screen(use_dark: bool) -> None:
    if use_dark:
        button = DarkButtonFactory().create()
        checkbox = LightCheckboxFactory().create()  # oops — mismatched family
    else:
        button = LightButtonFactory().create()
        checkbox = LightCheckboxFactory().create()
\`\`\`

\`\`\`java
// Anti-pattern — client orchestrates family consistency manually
public void buildScreen(boolean dark) {
    Button button = dark ? new DarkButton() : new LightButton();
    Checkbox checkbox = dark ? new LightCheckbox() : new LightCheckbox(); // bug: wrong theme
}
\`\`\`

---

### Refactoring with Abstract Factory Pattern

One factory interface creates the entire coordinated family.

#### Step 1: Define Abstract Products and Abstract Factory

Each product type has an interface; the factory declares one create method per product.

\`\`\`python
from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...

class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str: ...

class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...
    @abstractmethod
    def create_checkbox(self) -> Checkbox: ...
\`\`\`

\`\`\`java
public interface Button { String render(); }
public interface Checkbox { String render(); }

public interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}
\`\`\`

#### Step 2: Implement Concrete Products per Family

Dark family and Light family each have matching button and checkbox.

\`\`\`python
class DarkButton(Button):
    def render(self) -> str: return "[Dark Button — Namma Metro]"

class DarkCheckbox(Checkbox):
    def render(self) -> str: return "[Dark Checkbox — Namma Metro]"

class LightButton(Button):
    def render(self) -> str: return "[Light Button — Namma Metro]"

class LightCheckbox(Checkbox):
    def render(self) -> str: return "[Light Checkbox — Namma Metro]"
\`\`\`

\`\`\`java
class DarkButton implements Button {
    public String render() { return "[Dark Button — Namma Metro]"; }
}
class DarkCheckbox implements Checkbox {
    public String render() { return "[Dark Checkbox — Namma Metro]"; }
}
\`\`\`

#### Step 3: Implement Concrete Factories

Each concrete factory returns only products from its family.

\`\`\`python
class DarkThemeFactory(UIFactory):
    def create_button(self) -> Button: return DarkButton()
    def create_checkbox(self) -> Checkbox: return DarkCheckbox()

class LightThemeFactory(UIFactory):
    def create_button(self) -> Button: return LightButton()
    def create_checkbox(self) -> Checkbox: return LightCheckbox()
\`\`\`

\`\`\`java
public class DarkThemeFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}
\`\`\`

#### Step 4: Client Execution

The client receives a factory and builds UI without knowing concrete classes.

\`\`\`python
def render_ticket_screen(factory: UIFactory) -> None:
    print(factory.create_button().render())
    print(factory.create_checkbox().render())

render_ticket_screen(DarkThemeFactory())
\`\`\`

\`\`\`java
public class TicketScreen {
    public void render(UIFactory factory) {
        System.out.println(factory.createButton().render());
        System.out.println(factory.createCheckbox().render());
    }
}
\`\`\`

---

### When to Use It

* **Coordinated product families:** UI themes, regional tax bundles, platform SDK sets (iOS/Android/Web).
* **Runtime family switching:** User toggles dark mode—swap the entire factory, not individual widgets.
* **Enforced compatibility:** Products in a family must not be mixed (database driver + dialect + connection validator).
* **Cross-platform toolkits:** One abstract factory per platform supplies all controls.

### Comparison: Abstract Factory vs. Factory Method

* **Factory Method:** One product per creator hierarchy—\`DocumentCreator.createDocument()\` might return \`PDFDocument\` or \`HTMLDocument\`.
* **Abstract Factory:** **Multiple related products** per factory—\`createButton()\`, \`createCheckbox()\`, \`createDialog()\` that must match.

Abstract Factory is Factory Method scaled to **sets**. The trade-off: adding a new product type (\`createSlider()\`) requires updating **every** concrete factory in the family—state this proactively in interviews.`,

  'object-pool': `The **Object Pool Design Pattern** is a creational pattern that maintains a bounded cache of expensive-to-create objects, leasing them to clients and reclaiming them when done instead of allocating and destroying on every request.

Instead of opening a fresh JDBC connection for each API call to your inventory service (syscall + TLS + auth handshake every time), the pool pre-warms a fixed set of connections. A caller **acquires** from the pool, uses the object, and **releases** it back. This caps resource usage and smooths latency on hot paths serving Indiranagar peak lunch traffic.

### The Core Concept: "Rent, Don't Manufacture Every Trip"

Imagine **Zoomcar's fleet in Whitefield**—200 cars parked at the hub.

* A customer books for three hours, drives, returns the car to the hub.
* Zoomcar does not build a new car per booking; it reuses from a finite fleet.
* If all 200 cars are out, the next customer waits or gets "fleet exhausted."

Without a pool, every request pays full creation cost:

**The Problem:** Under spike load, the app opens thousands of DB connections, exhausts the database's \`max_connections\`, and latency explodes. Garbage collection of short-lived heavy objects causes GC pauses. Leaked connections (never returned) silently drain the pool until deadlock.

---

\`\`\`python
# Anti-pattern — new connection per request
class OrderAPI:
    def get_order(self, order_id: str) -> dict:
        conn = DatabaseConnection()  # expensive: TCP + auth every time
        try:
            return conn.query(f"SELECT * FROM orders WHERE id={order_id}")
        finally:
            conn.close()  # destroy immediately
\`\`\`

\`\`\`java
// Anti-pattern — allocate and destroy on every call
public class OrderAPI {
    public Order getOrder(String orderId) {
        DatabaseConnection conn = new DatabaseConnection();
        try {
            return conn.query("SELECT * FROM orders WHERE id=" + orderId);
        } finally {
            conn.close();
        }
    }
}
\`\`\`

---

### Refactoring with Object Pool Pattern

We introduce a pool that manages available and in-use objects.

#### Step 1: Define the Pooled Resource

The pooled object exposes the operations clients need.

\`\`\`python
class Connection:
    def __init__(self, id_: int):
        self.id = id_

    def query(self, sql: str) -> str:
        return f"Conn#{self.id} ran: {sql}"
\`\`\`

\`\`\`java
public class Connection {
    private final int id;
    public Connection(int id) { this.id = id; }
    public String query(String sql) { return "Conn#" + id + " ran: " + sql; }
}
\`\`\`

#### Step 2: Implement the Pool (Acquire / Release)

The pool tracks available and in-use instances with a fixed capacity.

\`\`\`python
class ConnectionPool:
    def __init__(self, size: int):
        self.available = [Connection(i) for i in range(size)]
        self.in_use: set[Connection] = set()

    def acquire(self) -> Connection:
        if not self.available:
            raise RuntimeError("Pool exhausted — try again later")
        conn = self.available.pop()
        self.in_use.add(conn)
        return conn

    def release(self, conn: Connection) -> None:
        self.in_use.remove(conn)
        self.available.append(conn)
\`\`\`

\`\`\`java
public class ConnectionPool {
    private final Deque<Connection> available = new ArrayDeque<>();
    private final Set<Connection> inUse = new HashSet<>();

    public ConnectionPool(int size) {
        for (int i = 0; i < size; i++) available.push(new Connection(i));
    }

    public Connection acquire() {
        if (available.isEmpty()) throw new IllegalStateException("Pool exhausted");
        Connection conn = available.pop();
        inUse.add(conn);
        return conn;
    }

    public void release(Connection conn) {
        inUse.remove(conn);
        available.push(conn);
    }
}
\`\`\`

#### Step 3: Context Class Uses Pool Instead of \`new\`

Business logic borrows from the pool and always releases in \`finally\`.

\`\`\`python
class OrderAPI:
    def __init__(self, pool: ConnectionPool):
        self.pool = pool

    def get_order(self, order_id: str) -> str:
        conn = self.pool.acquire()
        try:
            return conn.query(f"SELECT * FROM orders WHERE id={order_id}")
        finally:
            self.pool.release(conn)
\`\`\`

\`\`\`java
public class OrderAPI {
    private final ConnectionPool pool;
    public OrderAPI(ConnectionPool pool) { this.pool = pool; }

    public String getOrder(String orderId) {
        Connection conn = pool.acquire();
        try {
            return conn.query("SELECT * FROM orders WHERE id=" + orderId);
        } finally {
            pool.release(conn);
        }
    }
}
\`\`\`

#### Step 4: Client Execution

Bootstrap the pool once at application startup; share across requests.

\`\`\`python
pool = ConnectionPool(size=50)
api = OrderAPI(pool)
print(api.get_order("ORD-42"))
\`\`\`

\`\`\`java
ConnectionPool pool = new ConnectionPool(50);
OrderAPI api = new OrderAPI(pool);
api.getOrder("ORD-42");
\`\`\`

---

### When to Use It

* **Expensive creation/destruction:** DB connections, threads, gRPC channels, large byte buffers.
* **Bounded resources:** Protect downstream systems with a max cap (50 connections regardless of traffic).
* **Resettable state:** Objects can be cleared between uses—connections reset, buffers zeroed.
* **Latency-sensitive paths:** Pre-warmed objects ready at acquire time—no cold-start per request.

### Comparison: Object Pool vs. Flyweight

* **Object Pool:** Reuses **expensive, often mutable instances**—a JDBC connection is borrowed, used, returned, and reused by a different request after reset.
* **Flyweight:** Shares **immutable intrinsic state** across many lightweight handles—one \`TreeType\` glyph shared by thousands of map markers; extrinsic coordinates passed at draw time.

Pool = rent the whole object. Flyweight = share the heavy part, pass the light context separately.`,

  prototype: `The **Prototype Design Pattern** is a creational pattern that creates new objects by **cloning** an existing prototype instance rather than constructing from scratch through complex constructors.

When initialization requires parsing templates, loading defaults from disk, or wiring nested object graphs, copying a pre-configured prototype is faster and less error-prone than duplicating setup code in every caller. Clients request a clone by registry key without knowing the concrete class behind the template.

### The Core Concept: "Photocopy the Master, Then Customize"

Imagine **BYJU'S sales team** preparing enterprise proposals for schools across Karnataka.

* Legal maintains a master "Enterprise Proposal" template with standard sections—pricing table, SLA, support tiers.
* Each school gets a **copy** with only the school name, seat count, and district changed.
* Rebuilding the full document structure from scratch for every lead wastes time and invites copy-paste errors.

Without Prototype, every new document repeats heavy setup:

**The Problem:** Template logic is duplicated in three services. Shallow copies share mutable nested lists—edit Acme's line items and Beta Corp's draft changes too. Subclass explosion (\`InvoiceRetail\`, \`InvoiceEnterprise\`, \`InvoiceGovt\`) when variants differ only slightly.

---

\`\`\`python
# Anti-pattern — rebuild document structure every time
def new_proposal(client: str) -> dict:
    return {
        "title": "Enterprise Proposal",
        "sections": ["Intro", "Pricing", "SLA", "Support"],  # rebuilt each call
        "metadata": {"currency": "INR", "tax": "GST"},
        "client": client,
    }
\`\`\`

\`\`\`java
// Anti-pattern — duplicate initialization logic everywhere
public Map<String, Object> newProposal(String client) {
    Map<String, Object> doc = new HashMap<>();
    doc.put("sections", List.of("Intro", "Pricing", "SLA", "Support"));
    doc.put("metadata", Map.of("currency", "INR", "tax", "GST"));
    doc.put("client", client);
    return doc;
}
\`\`\`

---

### Refactoring with Prototype Pattern

We keep master prototypes in a registry and clone on demand.

#### Step 1: Define the Prototype Interface

Every cloneable type exposes \`clone()\`.

\`\`\`python
import copy
from abc import ABC, abstractmethod

class Document(ABC):
    @abstractmethod
    def clone(self) -> "Document": ...
\`\`\`

\`\`\`java
public interface Document {
    Document cloneDoc();
}
\`\`\`

#### Step 2: Implement Concrete Prototypes with Deep Copy

Nested mutable structures must be duplicated, not shared.

\`\`\`python
class ProposalDocument(Document):
    def __init__(self, title: str, sections: list[str], metadata: dict[str, str]):
        self.title = title
        self.sections = sections
        self.metadata = metadata

    def clone(self) -> "ProposalDocument":
        return copy.deepcopy(self)
\`\`\`

\`\`\`java
public class ProposalDocument implements Document {
    private final String title;
    private final List<String> sections;
    private final Map<String, String> metadata;

    public ProposalDocument cloneDoc() {
        return new ProposalDocument(title, new ArrayList<>(sections), new HashMap<>(metadata));
    }
}
\`\`\`

#### Step 3: Create the Prototype Registry

Pre-configured templates live in a map keyed by document type.

\`\`\`python
PROTOTYPES: dict[str, Document] = {
    "enterprise": ProposalDocument(
        "Enterprise Proposal",
        ["Intro", "Pricing", "SLA", "Support"],
        {"currency": "INR", "tax": "GST"},
    ),
}

def create_document(kind: str) -> Document:
    return PROTOTYPES[kind].clone()
\`\`\`

\`\`\`java
public class DocumentRegistry {
    private static final Map<String, Document> PROTOTYPES = Map.of(
        "enterprise", new ProposalDocument("Enterprise Proposal",
            List.of("Intro", "Pricing", "SLA", "Support"),
            Map.of("currency", "INR", "tax", "GST"))
    );

    public static Document create(String kind) {
        return PROTOTYPES.get(kind).cloneDoc();
    }
}
\`\`\`

#### Step 4: Client Execution

Clone, then customize extrinsic fields—never mutate the registry prototype.

\`\`\`python
doc = create_document("enterprise")
doc.metadata["client"] = "Delhi Public School, Whitefield"
print(doc.metadata.get("client"))
\`\`\`

\`\`\`java
ProposalDocument doc = (ProposalDocument) DocumentRegistry.create("enterprise");
doc.metadata().put("client", "Delhi Public School, Whitefield");
\`\`\`

---

### When to Use It

* **Heavy initialization:** Templates loaded from files, game prefabs, default form schemas.
* **Many similar instances:** Small variations on a base—invoice, contract, resume per client.
* **Hide concrete classes:** Client calls \`registry.clone("invoice")\` without importing \`InvoiceV2\`.
* **Avoid subclass explosion:** Variants differ slightly—clone + tweak beats \`InvoiceSubtypeN\`.

### Comparison: Prototype vs. Factory

* **Factory:** Builds a **new** instance from scratch using construction rules—\`create("stripe")\` runs initialization logic.
* **Prototype:** Copies an **existing template**—\`template.clone()\` preserves pre-built structure; customization happens after copy.

Use Factory when creation logic varies by type; use Prototype when setup is expensive and copies are cheap (with correct deep-copy semantics).`,

  decorator: `The **Decorator Design Pattern** is a structural pattern that attaches additional responsibilities to an object **dynamically** by wrapping it in decorator objects that share the same interface.

Instead of subclassing \`EncryptedCachedLoggedFileStorage\`, \`EncryptedFileStorage\`, and \`CachedFileStorage\` into a combinatorial explosion, you stack thin wrappers at runtime: base storage → encryption → compression → audit log. Each decorator delegates inward and adds one concern. Clients call the outermost wrapper transparently.

### The Core Concept: "Stack Toppings, Not Subclass Combos"

Imagine **Third Wave Coffee in Indiranagar**—every drink starts as espresso and customers add modifiers.

* Base: single-origin espresso.
* Add oat milk (+₹50).
* Add vanilla syrup (+₹40).
* Add whipped cream (+₹70).

The barista does not maintain a menu class for every combination (\`EspressoOatVanillaCream\`). They wrap the base drink repeatedly.

Without Decorator, feature combinations explode via inheritance:

**The Problem:** Adding one new topping requires N new subclasses. Features cannot be toggled per tenant at runtime. Order of wrappers matters (encrypt before compress vs vice versa) but inheritance freezes order at compile time.

---

\`\`\`python
# Anti-pattern — subclass explosion for optional features
class PlainCoffee:
    def cost(self) -> float: return 200.0

class CoffeeWithMilk(PlainCoffee):
    def cost(self) -> float: return 250.0

class CoffeeWithMilkAndCream(CoffeeWithMilk):  # combinatorial growth
    def cost(self) -> float: return 320.0
\`\`\`

\`\`\`java
// Anti-pattern — one subclass per feature combination
class PlainCoffee { double cost() { return 200.0; } }
class CoffeeWithMilk extends PlainCoffee { double cost() { return 250.0; } }
class CoffeeWithMilkAndCream extends CoffeeWithMilk { double cost() { return 320.0; } }
\`\`\`

---

### Refactoring with Decorator Pattern

Wrappers implement the same interface and hold an inner component.

#### Step 1: Define the Component Interface

\`\`\`python
from abc import ABC, abstractmethod

class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float: ...
    @abstractmethod
    def description(self) -> str: ...
\`\`\`

\`\`\`java
public interface Coffee {
    double cost();
    String description();
}
\`\`\`

#### Step 2: Concrete Component and Base Decorator

\`\`\`python
class Espresso(Coffee):
    def cost(self) -> float: return 200.0
    def description(self) -> str: return "Espresso"

class CoffeeDecorator(Coffee):
    def __init__(self, wrappee: Coffee):
        self.wrappee = wrappee
    def cost(self) -> float: return self.wrappee.cost()
    def description(self) -> str: return self.wrappee.description()
\`\`\`

\`\`\`java
class Espresso implements Coffee {
    public double cost() { return 200.0; }
    public String description() { return "Espresso"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee wrappee;
    protected CoffeeDecorator(Coffee wrappee) { this.wrappee = wrappee; }
    public double cost() { return wrappee.cost(); }
    public String description() { return wrappee.description(); }
}
\`\`\`

#### Step 3: Concrete Decorators (One Feature Each)

\`\`\`python
class MilkDecorator(CoffeeDecorator):
    def cost(self) -> float: return super().cost() + 50.0
    def description(self) -> str: return super().description() + ", oat milk"

class WhippedCreamDecorator(CoffeeDecorator):
    def cost(self) -> float: return super().cost() + 70.0
    def description(self) -> str: return super().description() + ", whipped cream"
\`\`\`

\`\`\`java
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee wrappee) { super(wrappee); }
    public double cost() { return super.cost() + 50.0; }
    public String description() { return super.description() + ", oat milk"; }
}
\`\`\`

#### Step 4: Client Execution

Stack decorators at runtime per customer preference.

\`\`\`python
order = WhippedCreamDecorator(MilkDecorator(Espresso()))
print(order.description(), order.cost())  # Espresso, oat milk, whipped cream 320.0
\`\`\`

\`\`\`java
Coffee order = new WhippedCreamDecorator(new MilkDecorator(new Espresso()));
System.out.println(order.description() + " " + order.cost());
\`\`\`

---

### When to Use It

* **Optional features composable at runtime:** Caching, encryption, retry, audit—per tenant or request.
* **Avoid subclass explosion:** N features should not mean 2^N classes.
* **Extend third-party classes:** Wrap sealed/vendor code without modifying source.
* **Single-responsibility wrappers:** One decorator = one concern; compose as needed.

### Comparison: Decorator vs. Proxy

Both wrap an object with the same interface, but **intent differs**:

* **Decorator:** Adds **responsibilities**—logging, compression, pricing modifiers; usually stacks multiple layers.
* **Proxy:** Controls **access**—lazy load, permission check, remote stub; typically one subject, focused on when/how to reach it.

Same UML shape; always lead with intent in interviews.`,

  proxy: `The **Proxy Design Pattern** is a structural pattern that provides a **surrogate or placeholder** controlling access to another object while exposing the same interface as the real subject.

The client calls \`image.display()\` on a proxy that may lazy-load the file from S3, verify the user has view permission, cache the result, or forward the call over RPC to a server in Mumbai—all without changing client code. Proxy adds indirection **deliberately** for access management, not feature stacking.

### The Core Concept: "Gatekeeper Before the Real Thing"

Imagine **TCS office reception at Manyata Tech Park, Whitefield**.

* Visitors ask reception for "Meeting with Priya on Floor 7"—same interface as talking to Priya directly.
* Reception checks ID badge, confirms appointment, calls upstairs—only then is the visitor escorted.
* Priya (the real subject) is not disturbed by every cold walk-in.

Without Proxy, clients load heavy resources eagerly and skip access checks:

**The Problem:** Listing 500 property photos on Housing.com loads every full-resolution image at page render—slow on 4G near Silk Board. Sensitive documents are fetched before RBAC runs. Remote service calls block UI with no timeout wrapper.

---

\`\`\`python
# Anti-pattern — eager load + no access control in client
class PropertyGallery:
    def __init__(self, image_paths: list[str]):
        self.images = [RealImage(p) for p in image_paths]  # all loaded upfront

    def show_first(self) -> None:
        self.images[0].display()
\`\`\`

\`\`\`java
// Anti-pattern — client bears loading and security burden
public class PropertyGallery {
    private final List<RealImage> images;
    public PropertyGallery(List<String> paths) {
        images = paths.stream().map(RealImage::new).toList(); // eager
    }
}
\`\`\`

---

### Refactoring with Proxy Pattern

A proxy implements the same interface and defers or guards access to the real subject.

#### Step 1: Define the Subject Interface

\`\`\`python
from abc import ABC, abstractmethod

class Image(ABC):
    @abstractmethod
    def display(self) -> None: ...
\`\`\`

\`\`\`java
public interface Image {
    void display();
}
\`\`\`

#### Step 2: Real Subject (Expensive or Remote)

\`\`\`python
class RealImage(Image):
    def __init__(self, filename: str):
        self.filename = filename
        print(f"Loading {filename} from S3...")

    def display(self) -> None:
        print(f"Displaying {self.filename}")
\`\`\`

\`\`\`java
public class RealImage implements Image {
    private final String filename;
    public RealImage(String filename) {
        this.filename = filename;
        System.out.println("Loading " + filename + " from S3...");
    }
    public void display() { System.out.println("Displaying " + filename); }
}
\`\`\`

#### Step 3: Proxy (Virtual + Protection)

Lazy-init on first access; optional permission check before delegate.

\`\`\`python
class ImageProxy(Image):
    def __init__(self, filename: str, user_role: str):
        self.filename = filename
        self.user_role = user_role
        self._real: RealImage | None = None

    def display(self) -> None:
        if self.user_role not in ("agent", "admin"):
            raise PermissionError("Upgrade to agent account to view HD photos")
        if self._real is None:
            self._real = RealImage(self.filename)
        self._real.display()
\`\`\`

\`\`\`java
public class ImageProxy implements Image {
    private final String filename;
    private final String userRole;
    private RealImage realImage;

    public void display() {
        if (!List.of("agent", "admin").contains(userRole))
            throw new SecurityException("Upgrade to agent account");
        if (realImage == null) realImage = new RealImage(filename);
        realImage.display();
    }
}
\`\`\`

#### Step 4: Client Execution

Client depends on \`Image\`; does not know proxy from real subject.

\`\`\`python
thumb: Image = ImageProxy("indiranagar_3bhk.jpg", user_role="viewer")
# thumb.display()  # raises — protection proxy

agent_view: Image = ImageProxy("indiranagar_3bhk.jpg", user_role="agent")
agent_view.display()  # loads on first display only
\`\`\`

\`\`\`java
Image photo = new ImageProxy("indiranagar_3bhk.jpg", "agent");
photo.display();
\`\`\`

---

### When to Use It

* **Virtual proxy (lazy load):** Heavy images, documents, ORM entities—load on first access.
* **Protection proxy:** RBAC before read/write on sensitive resources.
* **Remote proxy:** Local stub forwards to gRPC/RMI service in another region.
* **Smart reference:** Cache, reference counting, deduplication around expensive calls.

### Comparison: Proxy vs. Decorator

* **Proxy:** Manages **access** to one subject—when to load, who may call, where to forward.
* **Decorator:** Adds **behavior layers**—compression, logging, retry—often stacked several deep.

If the wrapper's job is "should this call reach the real object yet?" → Proxy. If it's "what extra work happens around the call?" → Decorator.`,

  composite: `The **Composite Design Pattern** is a structural pattern that composes objects into **tree structures** to represent part-whole hierarchies, letting clients treat individual objects and groups **uniformly**.

A folder and a file both implement \`getSize()\`—the folder sums its children recursively without the caller knowing whether the node is a leaf or container. This eliminates \`if isinstance(node, Folder)\` spaghetti for operations that should recurse across the tree.

### The Core Concept: "One Interface for Leaf and Branch"

Imagine **Swiggy's corporate org chart** for the Bengaluru tech hub.

* An individual engineer and an entire "Payments Squad" both answer "what is your headcount?"
* A leaf returns 1; a composite sums its children—Engineering VP does not special-case "person vs team."
* HR runs the same \`getHeadcount()\` on any org node for budgeting.

Without Composite, every operation branches on type:

**The Problem:** Adding "contractor" or "vendor pod" means editing size, export, and permission logic in five places. Depth-varying trees force null checks and type switches that break when the org reorganizes.

---

\`\`\`python
# Anti-pattern — type checks everywhere
def get_size(node) -> int:
    if isinstance(node, File):
        return node.size
    elif isinstance(node, Folder):
        total = 0
        for child in node.children:
            total += get_size(child) if isinstance(child, File) else get_size(child)
        return total
    raise TypeError(node)
\`\`\`

\`\`\`java
// Anti-pattern — client distinguishes leaf vs composite
public int getSize(Object node) {
    if (node instanceof FileNode f) return f.getSize();
    if (node instanceof Folder folder) {
        int total = 0;
        for (Object child : folder.getChildren()) total += getSize(child);
        return total;
    }
    throw new IllegalArgumentException();
}
\`\`\`

---

### Refactoring with Composite Pattern

Leaf and composite share a common component interface.

#### Step 1: Define the Component Interface

\`\`\`python
from abc import ABC, abstractmethod

class FileSystemNode(ABC):
    @abstractmethod
    def get_name(self) -> str: ...
    @abstractmethod
    def get_size(self) -> int: ...
\`\`\`

\`\`\`java
public interface FileSystemNode {
    String getName();
    int getSize();
}
\`\`\`

#### Step 2: Leaf Implementation

\`\`\`python
class File(FileSystemNode):
    def __init__(self, name: str, size: int):
        self.name, self.size = name, size
    def get_name(self) -> str: return self.name
    def get_size(self) -> int: return self.size
\`\`\`

\`\`\`java
public class FileNode implements FileSystemNode {
    private final String name;
    private final int size;
    public String getName() { return name; }
    public int getSize() { return size; }
}
\`\`\`

#### Step 3: Composite Implementation

Child management (\`add\`, \`remove\`) lives on composite, not the shared interface.

\`\`\`python
class Folder(FileSystemNode):
    def __init__(self, name: str):
        self.name = name
        self.children: list[FileSystemNode] = []

    def add(self, child: FileSystemNode) -> None:
        self.children.append(child)

    def get_name(self) -> str: return self.name
    def get_size(self) -> int: return sum(c.get_size() for c in self.children)
\`\`\`

\`\`\`java
public class Folder implements FileSystemNode {
    private final String name;
    private final List<FileSystemNode> children = new ArrayList<>();
    public void add(FileSystemNode child) { children.add(child); }
    public String getName() { return name; }
    public int getSize() {
        return children.stream().mapToInt(FileSystemNode::getSize).sum();
    }
}
\`\`\`

#### Step 4: Client Execution

One call works on any node—file or nested project folder.

\`\`\`python
root = Folder("lld-prep")
src = Folder("src")
src.add(File("patterns.ts", 12000))
src.add(File("oop.ts", 8000))
root.add(src)
print(root.get_size())  # 20000 — no type checks in client
\`\`\`

\`\`\`java
Folder root = new Folder("lld-prep");
Folder src = new Folder("src");
src.add(new FileNode("patterns.ts", 12000));
root.add(src);
System.out.println(root.getSize());
\`\`\`

---

### When to Use It

* **Tree-shaped domains:** Filesystem, org chart, UI component tree, menu categories.
* **Uniform operations:** Size, render, export, permission check on leaves and containers alike.
* **Recursive structure:** Depth varies; callers should not know nesting level.
* **Cascade operations:** Delete folder → all children removed via composite logic.

### Comparison: Composite vs. Decorator

* **Composite:** Models **tree** part-whole structure—one node has many children; operations recurse downward.
* **Decorator:** Models a **linear chain** of wrappers around a single object—one inner, one outer at each layer.

Composite = horizontal nesting. Decorator = vertical stacking on one object.`,

  adapter: `The **Adapter Design Pattern** is a structural pattern that **converts the interface** of an existing class into one clients expect, enabling collaboration between incompatible components without modifying their source code.

Your domain speaks \`PaymentProcessor.pay(amountInRupees)\`; Razorpay's SDK speaks \`RazorpayClient.charge(amountInPaise, currency, notes)\`. The adapter translates parameters, error types, and async models so checkout code stays clean. Adapters are the workhorses of integration layers—legacy ERP, vendor APIs, and internal contracts rarely align out of the box.

### The Core Concept: "Travel Plug for APIs"

Imagine you land at **BLR airport** with a US laptop charger and a Type D Indian socket.

* The electricity works—the **service** is the same.
* The **plug shape** differs; you buy a ₹500 adapter at the relay store.
* You do not rewire the hotel or redesign the laptop— the adapter translates at the boundary.

Without Adapter, integration logic pollutes domain code:

**The Problem:** Every caller converts paise to rupees, maps Razorpay exceptions to your \`PaymentError\`, and imports vendor types. When Razorpay changes API version, you grep the entire codebase. Hexagonal architecture breaks because the core knows Stripe, Razorpay, and Paytm by name.

---

\`\`\`python
# Anti-pattern — checkout couples to vendor SDK directly
class Checkout:
    def pay(self, amount: float) -> None:
        razorpay = RazorpaySDK()
        razorpay.charge(int(amount * 100), "INR", {"order": "ORD-1"})  # vendor leak
\`\`\`

\`\`\`java
// Anti-pattern — domain imports third-party types
public class Checkout {
    public void pay(double amount) {
        RazorpaySDK razorpay = new RazorpaySDK();
        razorpay.charge((int)(amount * 100), "INR");
    }
}
\`\`\`

---

### Refactoring with Adapter Pattern

The adapter implements your target interface and wraps the adaptee.

#### Step 1: Define the Target Interface (Your Domain)

\`\`\`python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None: ...
\`\`\`

\`\`\`java
public interface PaymentProcessor {
    void pay(double amount);
}
\`\`\`

#### Step 2: Existing Adaptee (Third-Party SDK)

\`\`\`python
class RazorpaySDK:
    def charge(self, paise: int, currency: str, notes: dict) -> None:
        print(f"Razorpay charged {paise} {currency} — {notes}")
\`\`\`

\`\`\`java
public class RazorpaySDK {
    public void charge(int paise, String currency) {
        System.out.println("Razorpay charged " + paise + " " + currency);
    }
}
\`\`\`

#### Step 3: Implement the Adapter

Translation happens here—and only here.

\`\`\`python
class RazorpayAdapter(PaymentProcessor):
    def __init__(self, sdk: RazorpaySDK):
        self.sdk = sdk

    def pay(self, amount: float) -> None:
        self.sdk.charge(round(amount * 100), "INR", {"source": "checkout"})
\`\`\`

\`\`\`java
public class RazorpayAdapter implements PaymentProcessor {
    private final RazorpaySDK sdk;
    public RazorpayAdapter(RazorpaySDK sdk) { this.sdk = sdk; }

    public void pay(double amount) {
        sdk.charge((int) Math.round(amount * 100), "INR");
    }
}
\`\`\`

#### Step 4: Client Execution

Checkout depends on \`PaymentProcessor\`; swap adapters per region or A/B test.

\`\`\`python
def checkout(processor: PaymentProcessor, total: float) -> None:
    processor.pay(total)

checkout(RazorpayAdapter(RazorpaySDK()), 499.0)
\`\`\`

\`\`\`java
public class Checkout {
    public void run(PaymentProcessor processor, double total) {
        processor.pay(total);
    }
}
\`\`\`

---

### When to Use It

* **Third-party or legacy APIs** with incompatible interfaces—you cannot change their source.
* **Normalize multiple vendors** into one internal \`ShippingProvider\` or \`PaymentProcessor\`.
* **Gradual migration:** Wrap old module with adapter implementing new interface until rewrite ships.
* **Unit conversion / error mapping** at the integration boundary.

### Comparison: Adapter vs. Facade

* **Adapter:** **Converts** one incompatible interface to another—two shapes, same capability; translation is the job.
* **Facade:** **Simplifies** many interfaces into one convenient entry—\`placeOrder()\` orchestrates inventory + payment + shipping; no interface mismatch required.

Adapter = plug shape converter. Facade = hotel concierge coordinating subsystems you already understand.`,

  bridge: `The **Bridge Design Pattern** is a structural pattern that **decouples an abstraction from its implementation** so both can vary independently through composition rather than inheritance.

Without Bridge, you subclass \`IndiranagarSmsAlert\`, \`IndiranagarEmailAlert\`, \`WhitefieldSmsAlert\`, \`WhitefieldEmailAlert\`—an N×M explosion. Bridge splits into two hierarchies (\`Notification\` and \`DeliveryChannel\`) and composes at runtime: \`new OrderAlert(new SmsChannel())\`. Each dimension evolves separately.

### The Core Concept: "Remote and Device Vary Independently"

Imagine **smart home remotes** sold in Bengaluru electronics stores.

* **Abstraction side:** Basic remote vs advanced remote (mute, favorites).
* **Implementation side:** TV vs soundbar vs AC.
* You should **not** need \`AdvancedRemoteForSamsungTV\`, \`BasicRemoteForSonyTV\`, etc.

A good remote holds a \`Device\` reference and delegates \`turnOn()\`—swap device without new remote subclasses.

Without Bridge, inheritance multiplies:

**The Problem:** Every new delivery channel (WhatsApp, push) crosses every notification type (order, promo, OTP). Teams cannot ship SMS support without touching alert class hierarchy. Testing requires combinatorial subclass fixtures.

---

\`\`\`python
# Anti-pattern — N×M subclass grid
class OrderSmsNotification:
    def send(self, msg: str) -> None: print(f"SMS order: {msg}")

class OrderEmailNotification:
    def send(self, msg: str) -> None: print(f"Email order: {msg}")

class PromoSmsNotification:  # another dimension × another class
    def send(self, msg: str) -> None: print(f"SMS promo: {msg}")
\`\`\`

\`\`\`java
// Anti-pattern — combinatorial subclasses
class OrderSmsNotification { void send(String msg) { System.out.println("SMS order: " + msg); } }
class OrderEmailNotification { void send(String msg) { System.out.println("Email order: " + msg); } }
class PromoSmsNotification { void send(String msg) { System.out.println("SMS promo: " + msg); } }
\`\`\`

---

### Refactoring with Bridge Pattern

Abstraction holds an implementor reference and delegates.

#### Step 1: Implementor Interface (Delivery Channel)

\`\`\`python
from abc import ABC, abstractmethod

class DeliveryChannel(ABC):
    @abstractmethod
    def deliver(self, message: str) -> None: ...
\`\`\`

\`\`\`java
public interface DeliveryChannel {
    void deliver(String message);
}
\`\`\`

#### Step 2: Concrete Implementors

\`\`\`python
class SmsChannel(DeliveryChannel):
    def deliver(self, message: str) -> None:
        print(f"[SMS] {message}")

class EmailChannel(DeliveryChannel):
    def deliver(self, message: str) -> None:
        print(f"[Email] {message}")
\`\`\`

\`\`\`java
public class SmsChannel implements DeliveryChannel {
    public void deliver(String message) { System.out.println("[SMS] " + message); }
}
public class EmailChannel implements DeliveryChannel {
    public void deliver(String message) { System.out.println("[Email] " + message); }
}
\`\`\`

#### Step 3: Abstraction Hierarchy

Notifications delegate to the channel—they do not embed SMS vs email logic.

\`\`\`python
class Notification(ABC):
    def __init__(self, channel: DeliveryChannel):
        self.channel = channel

    @abstractmethod
    def message(self) -> str: ...

    def send(self) -> None:
        self.channel.deliver(self.message())

class OrderNotification(Notification):
    def __init__(self, channel: DeliveryChannel, order_id: str):
        super().__init__(channel)
        self.order_id = order_id
    def message(self) -> str:
        return f"Your order {self.order_id} is out for delivery in Indiranagar"
\`\`\`

\`\`\`java
public abstract class Notification {
    protected final DeliveryChannel channel;
    protected Notification(DeliveryChannel channel) { this.channel = channel; }
    protected abstract String message();
    public void send() { channel.deliver(message()); }
}

public class OrderNotification extends Notification {
    private final String orderId;
    public OrderNotification(DeliveryChannel channel, String orderId) {
        super(channel); this.orderId = orderId;
    }
    protected String message() {
        return "Your order " + orderId + " is out for delivery in Indiranagar";
    }
}
\`\`\`

#### Step 4: Client Execution

Compose any notification with any channel at runtime.

\`\`\`python
OrderNotification(SmsChannel(), "ORD-8842").send()
OrderNotification(EmailChannel(), "ORD-8842").send()
\`\`\`

\`\`\`java
new OrderNotification(new SmsChannel(), "ORD-8842").send();
new OrderNotification(new EmailChannel(), "ORD-8842").send();
\`\`\`

---

### When to Use It

* **Two independent variation axes:** Notification type × channel; shape × renderer; document × exporter.
* **Runtime implementation switching:** Config selects SMS vs email without new notification subclasses.
* **Avoid N×M inheritance:** Teams extend abstractions and implementors on separate timelines.
* **Hide platform code:** JDBC-style separation—SQL abstraction vs database driver.

### Comparison: Bridge vs. Strategy

* **Bridge:** **Parallel hierarchies**—both abstraction and implementor have subclasses; structure is designed upfront for orthogonal dimensions.
* **Strategy:** **One context, one swappable algorithm**—\`PricingStrategy\` injected into checkout; typically no mirrored hierarchy on both sides.

Bridge = two axes of variation by design. Strategy = one algorithm slot in a context.`,

  facade: `The **Facade Design Pattern** is a structural pattern that provides a **unified, high-level interface** to a set of interfaces in a subsystem, reducing what clients must know to get work done.

Subsystems expose dozens of low-level classes—inventory, GST calculator, payment gateway, Shiprocket dispatch—and a facade orchestrates the common \`placeOrder()\` workflow behind one call. The facade does not add new capability; it defines the happy-path entry point. Subsystem classes remain usable directly for advanced scenarios.

### The Core Concept: "Concierge, Not Gatekeeper"

Imagine **checking into a Marriott on MG Road, Bengaluru**.

* You tell the front desk: "Conference room tomorrow, airport cab at 6 AM, vegetarian breakfast."
* You do not call housekeeping, transport, and kitchen separately—the concierge coordinates subsystems.
* The spa, gym, and room service still exist independently if you need them directly.

Without Facade, every client duplicates orchestration:

**The Problem:** Web controller, mobile app, and cron job each copy the same five-step checkout sequence. One team forgets GST validation; another skips inventory reservation. Partial failures leave inconsistent state with no central error handling.

---

\`\`\`python
# Anti-pattern — orchestration duplicated in every client
class WebCheckoutController:
    def checkout(self, sku: str, amount: float, address: str) -> None:
        Inventory().reserve(sku)
        GstCalculator().compute(amount)
        RazorpayGateway().charge(amount)
        Shiprocket().dispatch(address)
        Analytics().track("order")
\`\`\`

\`\`\`java
// Anti-pattern — controller knows every subsystem detail
public class WebCheckoutController {
    public void checkout(String sku, double amount, String address) {
        new Inventory().reserve(sku);
        new GstCalculator().compute(amount);
        new RazorpayGateway().charge(amount);
        new Shiprocket().dispatch(address);
    }
}
\`\`\`

---

### Refactoring with Facade Pattern

One facade owns the coordinated workflow.

#### Step 1: Subsystem Classes (Existing, Low-Level)

\`\`\`python
class Inventory:
    def reserve(self, sku: str) -> None: print(f"Reserved {sku}")

class GstCalculator:
    def compute(self, amount: float) -> float:
        print(f"GST on ₹{amount}"); return amount * 0.18

class Payment:
    def charge(self, amount: float) -> None: print(f"Charged ₹{amount}")

class Shipping:
    def dispatch(self, address: str) -> None: print(f"Shipped to {address}")
\`\`\`

\`\`\`java
class Inventory { public void reserve(String sku) { System.out.println("Reserved " + sku); } }
class Payment { public void charge(double amount) { System.out.println("Charged ₹" + amount); } }
class Shipping { public void dispatch(String address) { System.out.println("Shipped to " + address); } }
\`\`\`

#### Step 2: Implement the Facade

The facade sequences subsystem calls in the correct order.

\`\`\`python
class OrderFacade:
    def __init__(self):
        self.inventory = Inventory()
        self.gst = GstCalculator()
        self.payment = Payment()
        self.shipping = Shipping()

    def place_order(self, sku: str, amount: float, address: str) -> None:
        self.inventory.reserve(sku)
        tax = self.gst.compute(amount)
        self.payment.charge(amount + tax)
        self.shipping.dispatch(address)
        print("Order complete — thank you!")
\`\`\`

\`\`\`java
public class OrderFacade {
    private final Inventory inventory = new Inventory();
    private final Payment payment = new Payment();
    private final Shipping shipping = new Shipping();

    public void placeOrder(String sku, double amount, String address) {
        inventory.reserve(sku);
        payment.charge(amount);
        shipping.dispatch(address);
        System.out.println("Order complete — thank you!");
    }
}
\`\`\`

#### Step 3: Thin Client Depends on Facade Only

Controllers make one call; they do not import subsystem classes.

\`\`\`python
class WebCheckoutController:
    def __init__(self, facade: OrderFacade):
        self.facade = facade

    def checkout(self, sku: str, amount: float, address: str) -> None:
        self.facade.place_order(sku, amount, address)
\`\`\`

\`\`\`java
public class WebCheckoutController {
    private final OrderFacade facade;
    public WebCheckoutController(OrderFacade facade) { this.facade = facade; }

    public void checkout(String sku, double amount, String address) {
        facade.placeOrder(sku, amount, address);
    }
}
\`\`\`

#### Step 4: Client Execution

\`\`\`python
OrderFacade().place_order("SKU-DOSA-01", 299.0, "12th Main, Indiranagar, Bengaluru")
\`\`\`

\`\`\`java
new OrderFacade().placeOrder("SKU-DOSA-01", 299.0, "12th Main, Indiranagar, Bengaluru");
\`\`\`

---

### When to Use It

* **Broad subsystem APIs** easy to misuse without strict call ordering.
* **Common workflows** duplicated across clients—checkout, onboarding, report generation.
* **Layered architecture:** Presentation calls application facade, not domain internals.
* **Legacy wrapper:** Modern API surface over old modules without full rewrite.

### Comparison: Facade vs. Mediator

* **Facade:** **One-way simplification** for external clients—a single entry point into a subsystem; colleagues do not talk through each other.
* **Mediator:** **Peer coordination**—UI widgets notify mediator; mediator decides which other widgets update; star topology among equals.

Facade faces outward ("make this easy for callers"). Mediator faces inward ("stop widgets from referencing each other directly").`,

  flyweight: `The **Flyweight Design Pattern** is a structural pattern that uses **sharing** to support large numbers of fine-grained objects efficiently by separating **intrinsic (shared) state** from **extrinsic (context-specific) state**.

Intrinsic state—tree species texture, Devanagari glyph shape, map pin icon SVG—lives once in a factory cache. Extrinsic state—coordinates on Cubbon Park map, font size, user highlight color—is passed in at use time. Memory drops from O(n × full object) toward O(shared types + n × lightweight handles).

### The Core Concept: "Share the Heavy Part, Pass the Coordinates"

Imagine **rendering trees on a Namma Metro line map** from Indiranagar to Whitefield.

* There are 50,000 tree markers on screen.
* Each marker's **species** (banyan, gulmohar) has the same texture and label—intrinsic.
* Each marker's **(x, y) position** differs—extrinsic.
* Storing 50,000 full \`Tree\` objects with duplicate texture blobs wastes hundreds of MB.

Without Flyweight, every marker is a heavyweight object:

**The Problem:** Mobile app OOMs on mid-range Android phones common in Bengaluru. GC pauses stutter the map. Object identity for "same species at different coords" does not matter—but you pay for it anyway.

---

\`\`\`python
# Anti-pattern — duplicate intrinsic state per marker
class Tree:
    def __init__(self, species: str, texture: str, color: str, x: int, y: int):
        self.species = species
        self.texture = texture  # duplicated 50k times for "banyan"
        self.color = color
        self.x = x
        self.y = y
\`\`\`

\`\`\`java
// Anti-pattern — every map marker owns full texture data
public class Tree {
    private final String species;
    private final String texture; // repeated for every instance
    private final String color;
    private final int x, y;
}
\`\`\`

---

### Refactoring with Flyweight Pattern

Share \`TreeType\` flyweights; store only extrinsic coords per marker.

#### Step 1: Flyweight (Intrinsic State)

Immutable shared data.

\`\`\`python
class TreeType:
    def __init__(self, name: str, color: str, texture: str):
        self.name = name
        self.color = color
        self.texture = texture

    def draw(self, x: int, y: int) -> None:
        print(f"Draw {self.name} ({self.texture}) at ({x},{y})")
\`\`\`

\`\`\`java
public class TreeType {
    private final String name, color, texture;
    public TreeType(String name, String color, String texture) {
        this.name = name; this.color = color; this.texture = texture;
    }
    public void draw(int x, int y) {
        System.out.println("Draw " + name + " (" + texture + ") at (" + x + "," + y + ")");
    }
}
\`\`\`

#### Step 2: Flyweight Factory with Cache

\`\`\`python
class TreeFactory:
    def __init__(self):
        self.pool: dict[str, TreeType] = {}

    def get_tree_type(self, name: str, color: str, texture: str) -> TreeType:
        key = f"{name}-{color}-{texture}"
        if key not in self.pool:
            self.pool[key] = TreeType(name, color, texture)
        return self.pool[key]
\`\`\`

\`\`\`java
public class TreeFactory {
    private final Map<String, TreeType> pool = new HashMap<>();
    public TreeType getTreeType(String name, String color, String texture) {
        String key = name + "-" + color + "-" + texture;
        return pool.computeIfAbsent(key, k -> new TreeType(name, color, texture));
    }
}
\`\`\`

#### Step 3: Context Object Holds Extrinsic State

\`\`\`python
class Tree:
    def __init__(self, tree_type: TreeType, x: int, y: int):
        self.tree_type, self.x, self.y = tree_type, x, y

    def draw(self) -> None:
        self.tree_type.draw(self.x, self.y)
\`\`\`

\`\`\`java
public class Tree {
    private final TreeType type;
    private final int x, y;
    public Tree(TreeType type, int x, int y) { this.type = type; this.x = x; this.y = y; }
    public void draw() { type.draw(x, y); }
}
\`\`\`

#### Step 4: Client Execution

Factory ensures banyan texture exists once; 25,000 markers reference it.

\`\`\`python
factory = TreeFactory()
banyan = factory.get_tree_type("banyan", "green", "bark.png")
trees = [Tree(banyan, i * 10, 100) for i in range(25000)]
trees[0].draw()
print(len(factory.pool))  # 1 TreeType shared by 25000 Tree handles
\`\`\`

\`\`\`java
TreeFactory factory = new TreeFactory();
TreeType banyan = factory.getTreeType("banyan", "green", "bark.png");
new Tree(banyan, 120, 340).draw();
\`\`\`

---

### When to Use It

* **Huge counts of similar objects:** Map markers, text glyphs, game particles, spreadsheet cells.
* **Most state is shareable and immutable:** Species, character shape, icon SVG.
* **Extrinsic state is cheap to pass:** Coordinates, font size, selection highlight.
* **Object identity irrelevant:** Two banyan flyweights at different coords are interchangeable types.

### Comparison: Flyweight vs. Object Pool

* **Flyweight:** Shares **immutable intrinsic state**; many lightweight contexts point at few shared flyweights; extrinsic data passed per use.
* **Object Pool:** Reuses **expensive mutable instances** (DB connections); acquire → use → reset → release; whole object is borrowed.

Flyweight = share the read-only heavy part. Pool = rent and return the entire mutable resource.`,
};
