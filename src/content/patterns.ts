import { patternSnippets } from './patternSnippets';

export type PatternCategory = 'Creational' | 'Structural' | 'Behavioural';

export interface Pattern {
  slug: string;
  name: string;
  category: PatternCategory;
  intent?: string;
  whenToUse?: string[];
  whenNotToUse?: string[];
  example?: string;
  codePython?: string;
  codeJava?: string;
  interviewTips?: string[];
  keyInsight?: string;
  commonMistakes?: string[];
}

const patternMeta: Omit<Pattern, 'codePython' | 'codeJava'>[] = [
  {
    slug: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    intent:
      'Ensure a class has exactly one instance throughout the application lifecycle and provide a global access point to that instance. The pattern centralizes shared infrastructure state—configuration, logging, connection registries—so every layer reads from the same source of truth without passing the object through every constructor. It is most valuable when duplicate instances would cause inconsistent behavior, wasted resources, or race conditions on shared mutable state. Interviewers expect you to articulate the trade-off: convenience versus hidden global coupling and testability pain.',
    whenToUse: [
      'You need one shared coordinator (config loader, metrics registry, feature-flag cache) accessed from many modules.',
      'Object creation is expensive and repeated instantiation would waste memory or risk inconsistent initialization.',
      'A process-wide resource must be bounded—one scheduler, one audit trail writer, one in-memory cache namespace.',
      'Legacy APIs expose getInstance() and you must integrate without refactoring the entire call graph.',
      'Desktop or mobile apps need a single app-level session or navigation controller.',
    ],
    whenNotToUse: [
      'You only need one instance per request or thread—use scoped DI instead of a process-wide singleton.',
      'Testability matters and you cannot inject a mock without global state hacks.',
      'Multiple instances are harmless or desirable (stateless services, DTOs, value objects).',
      'Distributed systems need cluster-wide coordination—Singleton does not solve that; use external stores or leader election.',
    ],
    example:
      'Think of a hotel front desk: guests do not each get their own master key to the building—there is one registry that knows which rooms are occupied. Similarly, a notification service uses a single ConfigurationLoader that reads environment variables and feature flags once at startup; email, SMS, and push channels all query that same object. In production, java.lang.Runtime is a classic singleton, and many logging frameworks (Log4j LoggerManager, Python\'s logging module hierarchy) expose a single registry per process. Spring\'s default bean scope is singleton for stateless services, though modern teams prefer explicit dependency injection over static getInstance() calls.',
    keyInsight:
      'Singleton is about instance cardinality (exactly one), not about being global or static—DI containers can manage a singleton lifecycle without static fields.',
    interviewTips: [
      'Distinguish Singleton (one instance) from static utility classes (no instance at all).',
      'Java thread safety: mention synchronized getInstance(), enum singleton, or holder idiom; call out double-checked locking pitfalls.',
      'Python idiom: module-level object or @lru_cache on a factory function—often cleaner than __new__ overrides.',
      'Compare with Factory: Singleton controls how many; Factory controls which type.',
      'Follow-up: "How would you test code that uses a singleton?" — inject interface, reset in tests, or avoid static access.',
      'Whiteboard tip: draw Client → Singleton.getInstance() → single box; mention lazy vs eager initialization.',
      'Ask whether the singleton holds mutable state—if yes, thread safety and lifecycle become the deep-dive topic.',
    ],
    commonMistakes: [
      'Implementing Singleton via global static everywhere instead of letting the DI container own the single instance.',
      'Forgetting thread safety in lazy initialization under concurrent access.',
      'Using Singleton for state that should be request-scoped, causing data leaks between users.',
      'Subclassing a singleton incorrectly, accidentally creating multiple instances of the derived type.',
    ],
  },
  {
    slug: 'builder',
    name: 'Builder',
    category: 'Creational',
    intent:
      'Separate the construction of a complex object from its representation so the same step-by-step process can produce different variants. Instead of telescoping constructors with dozens of optional parameters, the builder accumulates configuration fluently and validates invariants before calling build(). This keeps object creation readable at the call site and prevents invalid intermediate states from escaping into the domain. It shines when objects have many optional fields, nested structures, or cross-field validation rules that constructors cannot express cleanly.',
    whenToUse: [
      'Object creation involves four or more optional parameters or nested sub-objects (HTTP requests, SQL queries, reports).',
      'You must enforce validation before the object exists—e.g., end date after start date, at least one recipient.',
      'The same construction steps produce immutable variants (copy-on-build, defensive copies).',
      'API ergonomics matter: method chaining reads better than positional constructor arguments.',
      'Different representations share construction logic—a Director can orchestrate fixed recipes.',
    ],
    whenNotToUse: [
      'The object has two or three required fields with no optional knobs—a plain constructor is simpler.',
      'Every field is mandatory and order-independent; a data class or record suffices.',
      'You are building a graph with cycles—Builder does not replace a factory graph resolver.',
      'Immutability is not a goal and setters on a mutable object are acceptable for internal code.',
    ],
    example:
      'Ordering a custom laptop is the analogy: you pick CPU, RAM, storage, and warranty step by step; the factory assembles the final machine only when the spec is complete—you never receive a half-built laptop. In software, OkHttp\'s Request.Builder lets you set URL, headers, body, and timeouts fluently before build() produces an immutable Request. Java\'s StringBuilder accumulates characters before toString() materializes the final string. Lombok\'s @Builder and the Gang-of-Four Director + Builder split appear frequently in interview system-design answers for complex domain objects like Order, Invoice, or SearchQuery.',
    keyInsight:
      'The value is readable, validated construction—not chaining syntax. A Builder with a single build() method and no fluency is still a Builder.',
    interviewTips: [
      'Fluent interface (return this) is idiomatic but optional; focus on stepwise assembly and validation at build().',
      'Director class is optional—use it when build steps are fixed (e.g., "build standard meal deal").',
      'Contrast with Factory Method (polymorphic creation) and Abstract Factory (families)—Builder builds one product variant.',
      'Follow-up: "How do you enforce required fields?" — fail in build(), use staged builders, or separate types.',
      'Mention immutability: build() returns a frozen object; builder can be reused or discarded.',
      'Whiteboard: show PizzaBuilder with chained calls → build() → Pizza; label optional vs required fields.',
      'Compare telescoping constructors anti-pattern—each new optional field adds 2^n constructor overloads.',
    ],
    commonMistakes: [
      'Allowing build() without validating required fields, producing half-configured objects.',
      'Reusing the same builder instance across threads without synchronization.',
      'Putting business logic inside the builder that belongs in the domain object.',
      'Using Builder for trivial two-field objects, adding boilerplate without readability gains.',
    ],
  },
  {
    slug: 'factory',
    name: 'Factory',
    category: 'Creational',
    intent:
      'Define an interface for creating objects while deferring the choice of concrete class to subclasses or a central creator module. Clients depend on abstractions (PaymentProcessor, NotificationChannel) instead of calling new on concrete types, which keeps business logic open for extension without modification. The pattern encapsulates instantiation rules—mapping strings, enums, or config to the right implementation—in one place. Simple Factory, Factory Method, and Abstract Factory are related gradations; interviews often start with Simple Factory and drill into when polymorphic creation is warranted.',
    whenToUse: [
      'Client code should depend on interfaces, not concrete implementations (OCP, DIP).',
      'Product choice depends on runtime input: payment method, file format, cloud region, feature flag.',
      'Creation logic is non-trivial—parsing config, wiring dependencies, or applying defaults before return.',
      'You want a registry or map from type keys to constructors for plugin-style extensibility.',
      'Unit tests need to swap real implementations for fakes without changing consumer code.',
    ],
    whenNotToUse: [
      'Only one implementation will ever exist—direct instantiation or DI binding is enough.',
      'The "factory" would be a one-line if/else with no reuse—YAGNI applies.',
      'Object graphs are deeply nested—consider a DI container or Abstract Factory for families.',
      'Creation requires user interaction at each step—Builder is the better fit.',
    ],
    example:
      'A vending machine is a factory analogy: you press "B3" (input) and the machine dispenses the correct snack (product) without you knowing which shelf motor fired. In code, PaymentProcessorFactory.create("stripe") returns StripeProcessor while checkout flow calls processor.charge(amount) uniformly. JDBC DriverManager.getConnection(url) picks a driver by URL scheme. Spring\'s @Bean methods act as factories in configuration classes. Calender.getInstance() in Java returns locale-appropriate calendar implementations based on runtime locale and timezone.',
    keyInsight:
      'Factory centralizes the new keyword—clients stay decoupled from concrete class names and constructor signatures.',
    interviewTips: [
      'Know the trio: Simple Factory (static method), Factory Method (subclass overrides create), Abstract Factory (families).',
      'Simple Factory is not a GoF pattern but is the most common in production codebases.',
      'Contrast with Builder: Factory picks which class; Builder configures one class\'s fields.',
      'Follow-up: "How do you add a new product type?" — register in map vs subclass new factory method.',
      'Map/registry pattern scales: Map<String, Supplier<Processor>> with register() at startup.',
      'Whiteboard: Client → Factory.create(type) → interface ← ConcreteA / ConcreteB.',
      'Mention DI containers as meta-factories that resolve interfaces to implementations from config.',
    ],
    commonMistakes: [
      'Creating a factory class for every single concrete type instead of one registry-backed factory.',
      'Returning concrete types from the factory instead of the interface, leaking coupling to callers.',
      'Putting business rules inside the factory that belong in the product or strategy layer.',
      'Confusing Factory with Abstract Factory when only one product type varies.',
    ],
  },
  {
    slug: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    intent:
      'Provide an interface for creating families of related or dependent objects without specifying their concrete classes. The guarantee is compatibility: all products from DarkThemeFactory are visually consistent, and switching to LightThemeFactory swaps the entire family atomically. This avoids mixing incompatible implementations (iOS button with Android checkbox) when multiple product types must co-evolve. The pattern trades flexibility on adding new product types for safety when swapping whole platform or theme bundles at runtime or deploy time.',
    whenToUse: [
      'You need multiple related objects that must work as a consistent family (UI theme, DB dialect + connection + query builder).',
      'The system must switch entire product families at runtime—dark/light mode, AWS vs Azure, iOS vs Android toolkit.',
      'Cross-product compatibility is a hard requirement; mixing factories would produce invalid combinations.',
      'Deployment targets differ by platform but share the same high-level workflows.',
    ],
    whenNotToUse: [
      'You only create one product type—Factory Method or Simple Factory is sufficient.',
      'Product families change rarely and a single concrete set suffices.',
      'Adding new product types frequently—every new type touches all concrete factories (OCP pain).',
      'Products are independent with no "family" constraint.',
    ],
    example:
      'Furnishing rooms by style is the analogy: a Victorian furniture catalog gives you matching chair, sofa, and table—you would not mix Victorian chairs with modern tables from a different catalog. Cross-platform UI toolkits use WidgetFactory to create matching Button, Checkbox, and Dropdown for Material vs Cupertino themes. AWS SDK clients group region-specific endpoints, signers, and serializers as compatible families. game engines expose RenderFactory + AudioFactory pairs per platform (DirectX vs OpenGL backends). Java\'s Look and Feel (Pluggable L&F) swaps entire widget families when you call UIManager.setLookAndFeel().',
    keyInsight:
      'Abstract Factory is about co-created product families, not a single object—think "theme bundle" not "one creator method."',
    interviewTips: [
      'Creates families of related products—Button + Checkbox + TextField from the same factory instance.',
      'Adding a new product type (e.g., Slider) requires updating every concrete factory—state this trade-off upfront.',
      'Contrast with Factory Method: one product per factory method vs many related products per factory interface.',
      'Contrast with Builder: Abstract Factory returns different related types; Builder assembles one complex type.',
      'Follow-up: "How is this different from dependency injection?" — DI injects instances; Abstract Factory creates compatible sets.',
      'Whiteboard: two columns (DarkFactory, LightFactory) each producing Button + Checkbox implementing shared interfaces.',
      'Real systems: JDBC with different drivers is closer to Factory; cross-platform UI kits are textbook Abstract Factory.',
    ],
    commonMistakes: [
      'Using Abstract Factory when only one product type varies—over-engineering.',
      'Forgetting that new product types require changes in every concrete factory implementation.',
      'Mixing products from different factories, breaking family compatibility guarantees.',
      'Confusing with Factory Method because both have "factory" in the name.',
    ],
  },
  {
    slug: 'object-pool',
    name: 'Object Pool',
    category: 'Creational',
    intent:
      'Reuse a bounded set of expensive-to-create objects by leasing them to clients and reclaiming them after use, instead of allocating and garbage-collecting on every request. The pool caps resource consumption—connections, threads, buffers—while amortizing initialization cost across many operations. Lifecycle management (health checks, idle timeouts, leak detection) is essential because a forgotten release starves the pool. This pattern is common wherever object creation dominates latency or external systems impose connection limits.',
    whenToUse: [
      'Creating or destroying objects is costly: DB connections, HTTP clients, thread workers, GPU buffers.',
      'External systems cap concurrent connections—pool size must stay within vendor limits.',
      'Objects are stateful but resettable between uses (clear buffer, rollback transaction, reset counters).',
      'Predictable latency matters more than peak burst allocation on hot paths.',
    ],
    whenNotToUse: [
      'Objects are cheap to create and short-lived—pooling adds complexity without benefit.',
      'Each use requires unique, non-resettable state—pooling risks data leakage between tenants.',
      'Demand is highly spiky and unbounded—queues or auto-scaling beat fixed pools.',
      'Language runtime already pools effectively (e.g., small object allocation in modern JVMs).',
    ],
    example:
      'A car rental fleet is the analogy: the company owns N cars; customers borrow one, drive it, and return it—buying a new car per trip would be absurd. HikariCP and Apache DBCP maintain pools of JDBC connections; threads acquire, execute SQL, and release back to the pool. Java\'s ForkJoinPool and ExecutorService reuse worker threads instead of spawning per task. Apache HttpClient connection managers pool outbound sockets to downstream APIs. Game engines pool bullet entities and particle objects to avoid GC spikes during combat.',
    keyInsight:
      'Pooling trades memory and operational complexity for latency—always pair acquire() with release() and monitor pool exhaustion.',
    interviewTips: [
      'Name production concerns: max pool size, acquire timeout, idle eviction, health checks on stale connections.',
      'Compare with Singleton (one instance) and Flyweight (shared immutable state)—pool holds many reusable instances.',
      'Follow-up: "What happens when the pool is exhausted?" — block, fail fast, or grow with limits.',
      'Thread pools (java.util.concurrent) are the most cited Object Pool variant in interviews.',
      'Mention leak detection: track in-use set, log long-held borrows, use try/finally for release.',
      'Whiteboard: Pool box with available stack + in-use set; Client acquire → use → release arrows.',
      'Contrast with Prototype (clone new) vs Pool (reuse same instances).',
    ],
    commonMistakes: [
      'Forgetting to release objects on exception paths—use try/finally or context managers.',
      'Pooling objects that retain sensitive per-user state without reset logic.',
      'Setting pool size too large, overwhelming the downstream database or API.',
      'Treating pool as cache for arbitrary data instead of reusable resource handles.',
    ],
  },
  {
    slug: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    intent:
      'Create new objects by cloning existing prototype instances rather than invoking constructors or factories from scratch. This is valuable when initialization is expensive, defaults are complex, or variations differ only slightly from a baseline template. The pattern hides concrete classes from clients who request clones by interface or registry key. Clone semantics—deep versus shallow copy—are the critical design decision because shared mutable references cause subtle bugs across supposedly independent instances.',
    whenToUse: [
      'Initial object setup is expensive (loading templates, parsing configs, warming caches).',
      'You need many similar instances with small mutations—documents, game levels, test fixtures.',
      'Class hierarchies make direct instantiation awkward; cloning from a known-good instance is simpler.',
      'A prototype registry maps keys ("invoice", "contract") to templates without exposing concrete types.',
    ],
    whenNotToUse: [
      'Objects are trivial to construct with a constructor or builder.',
      'Deep copy is prohibitively expensive or impossible (file handles, sockets, live connections).',
      'Immutability makes copying unnecessary—share the instance instead.',
      'Circular references make clone logic fragile without a dedicated copy framework.',
    ],
    example:
      'Photocopying a filled form is the analogy: you duplicate an existing template and only change the name and date fields—you do not redesign the form layout each time. Document editors store prototype templates for invoice, contract, and resume; "New from template" clones and customizes. JavaScript\'s object spread and structuredClone() are prototype-style copying idioms. Spring\'s prototype bean scope creates a new instance per injection point by cloning configuration. Game level editors duplicate a base map and tweak spawn points. C++ copy constructors and Python\'s copy.deepcopy() implement the mechanics interviewers expect you to discuss.',
    keyInsight:
      'Prototype is about copying an existing instance—always clarify deep vs shallow copy and which fields are shared.',
    interviewTips: [
      'Deep vs shallow copy is the mandatory follow-up—lists, nested objects, and metadata maps behave differently.',
      'Java Cloneable is considered awkward; copy constructors or dedicated clone() methods are often cleaner.',
      'Registry of prototypes: Map<String, Prototype> lets clients create by key without knowing concrete class.',
      'Contrast with Factory (creates from scratch) and Builder (assembles stepwise)—Prototype duplicates.',
      'Follow-up: "When would shallow copy be enough?" — when all mutable fields are replaced after clone.',
      'Whiteboard: template object → clone() → modified copy; label shared vs copied fields.',
      'Mention __copy__ / copy.deepcopy in Python and copy constructors in Java/C++.',
    ],
    commonMistakes: [
      'Shallow copy when nested mutable structures must be independent copies.',
      'Implementing Cloneable in Java without overriding clone() correctly (super.clone() + field copies).',
      'Cloning objects that hold non-cloneable resources without re-acquiring them in the copy.',
      'Using Prototype when a simple constructor with defaults would suffice.',
    ],
  },
  {
    slug: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    intent:
      'Attach additional responsibilities to an object dynamically by wrapping it with decorator objects that implement the same interface as the component. Each wrapper delegates to the inner object and adds behavior before or after the call—compression, encryption, logging, caching—without subclass explosion. Composition replaces inheritance for optional features that can be mixed and matched at runtime. The client sees a single interface and cannot distinguish a bare component from a heavily decorated stack.',
    whenToUse: [
      'You want optional, composable features enabled per instance or tenant at runtime.',
      'Subclassing every combination of features (CachedEncryptedLoggedClient) causes combinatorial explosion.',
      'Behavior must be added transparently without changing existing component code (Open/Closed Principle).',
      'Multiple independent cross-cutting concerns stack on a core service—metrics, retry, rate limit.',
    ],
    whenNotToUse: [
      'Only one optional feature exists—a single subclass or strategy may be simpler.',
      'Order of wrappers does not matter and a pipeline (Chain of Responsibility) is clearer.',
      'You need to restrict access or lazy-load—the Proxy pattern fits better.',
      'Debugging deep wrapper stacks becomes unacceptable—consider aspect-oriented or middleware frameworks.',
    ],
    example:
      'Adding toppings to coffee is the classic analogy: you start with Espresso and wrap with Milk, then WhippedCream—each layer adds cost and description without changing what "coffee" means to the customer. Java I/O streams are the textbook example: new BufferedInputStream(new GZipInputStream(new FileInputStream(path))). Python\'s @functools.wraps and middleware stacks in Flask/Starlette decorate callables similarly. AWS SDK request handlers decorate HTTP calls with signing and retries. UI frameworks wrap components with HOCs (React) or styled wrappers for theming without modifying base components.',
    keyInsight:
      'Decorator and component share the same interface—the client cannot tell how many layers wrap the core object.',
    interviewTips: [
      'Same interface as wrapped object—transparent composition, not inheritance from the concrete component.',
      'Contrast with Proxy: Decorator adds features; Proxy controls access, lazy init, or remote delegation.',
      'Contrast with Composite: Composite models tree part-whole; Decorator is a linear wrapper chain.',
      'Java I/O (InputStream decorators) is the example interviewers expect—name it explicitly.',
      'Follow-up: "Does order matter?" — yes for compression then encryption vs the reverse.',
      'Whiteboard: Client → DecoratorC → DecoratorB → Component; show delegate calls with added behavior.',
      'Contrast with Strategy: Strategy swaps one algorithm; Decorator stacks many behaviors on the same call.',
    ],
    commonMistakes: [
      'Decorator changing the interface or return types, breaking transparency.',
      'Confusing with Proxy when the goal is access control rather than feature stacking.',
      'Creating a god-decorator that handles unrelated concerns instead of small single-purpose wrappers.',
      'Forgetting to forward all interface methods to the wrappee in partial decorator implementations.',
    ],
  },
  {
    slug: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    intent:
      'Provide a surrogate or placeholder for another object to control access, defer expensive initialization, or mediate remote calls while exposing the same interface as the real subject. The client interacts with the proxy as if it were the real object; the proxy decides when and how to delegate. Variants include virtual proxy (lazy load), protection proxy (permission checks), remote proxy (RPC stub), and caching proxy. The pattern adds indirection deliberately—latency and tracing complexity are accepted for control.',
    whenToUse: [
      'Lazy initialization: loading large images, documents, or graphs only when first accessed.',
      'Access control: check permissions before delegating reads/writes to a sensitive repository.',
      'Remote invocation: local stub hides network serialization (gRPC stub, Java RMI proxy).',
      'Caching or logging around expensive operations without polluting the real subject.',
    ],
    whenNotToUse: [
      'You need to add composable optional features—Decorator is the better fit.',
      'The indirection hides latency that users cannot tolerate without prefetching strategy.',
      'Interface mismatch with the legacy object—use Adapter instead.',
      'Simple DI with an interface suffices without lazy or access-control semantics.',
    ],
    example:
      'A personal assistant who screens your calls is a protection proxy: callers talk to the assistant, who checks your calendar before connecting important calls—you interact with "reaching you" uniformly. Spring AOP creates JDK dynamic proxies and CGLIB subclasses for @Transactional and @Cacheable around service beans. Hibernate lazy-loading proxies fetch OrderLine collections only when iterated. Android\'s Binder proxies marshal IPC calls to remote services. The ImageProxy example defers loading megapixel files until display() is invoked—used in gallery apps and document viewers.',
    keyInsight:
      'Proxy controls access to one real subject with the same interface—clients should not know whether they hold a proxy or the real object.',
    interviewTips: [
      'Know variants: virtual (lazy), protection (auth), remote (RPC), caching—name the one that fits the scenario.',
      'Same interface as real subject—structurally similar to Decorator but intent differs (control vs extend).',
      'Spring AOP, Hibernate lazy collections, and gRPC stubs are production examples worth citing.',
      'Follow-up: "Decorator vs Proxy?" — Decorator stacks features; Proxy manages access/lifecycle of one subject.',
      'Java: JDK Proxy (interfaces) vs CGLIB (subclassing)—relevant for framework discussions.',
      'Whiteboard: Client → Proxy.display() → [check/load/cache] → RealSubject.display().',
      'Remote proxy follow-up: handle network failures, timeouts, and idempotency at the stub layer.',
    ],
    commonMistakes: [
      'Using Proxy to add unrelated feature stacks—that is Decorator\'s job.',
      'Lazy proxy that throws on every access because initialization failed silently at first touch.',
      'Protection proxy that leaks authorization checks only on some interface methods.',
      'Confusing with Facade—Proxy wraps one object; Facade simplifies many subsystem objects.',
    ],
  },
  {
    slug: 'composite',
    name: 'Composite',
    category: 'Structural',
    intent:
      'Compose objects into tree structures to represent part-whole hierarchies and let clients treat individual objects and groups uniformly through a shared component interface. Operations like getSize(), render(), or search() recurse through composite nodes while leaf nodes provide base behavior. This eliminates type-checking loops (if folder else file) scattered through client code. The pattern maps naturally to filesystems, UI component trees, org charts, and menu systems where containers and items share operations.',
    whenToUse: [
      'The domain forms a tree: files/folders, UI widgets, org units, bill-of-materials, menu hierarchies.',
      'Clients should run the same operation on leaves and containers without instanceof checks.',
      'Recursive algorithms (size, count, print, validate) should live on the structure itself.',
      'You want to add new component types without changing traversal clients.',
    ],
    whenNotToUse: [
      'Structure is flat—lists and maps are simpler without forcing a Component interface.',
      'Leaves and composites have fundamentally incompatible operations—uniform interface becomes a lie.',
      'Enforcing constraints (files cannot have children) is awkward with a single Component type.',
      'Performance-critical flat arrays beat object-heavy trees for millions of homogeneous items.',
    ],
    example:
      'A filesystem is the canonical analogy: both a single photo (leaf) and a vacation folder (composite) have a name and size; calculating total backup size calls getSize() on either without caring which is which—the folder recurses into children. Java\'s java.awt.Container and Component treat panels and buttons uniformly for layout. React component trees compose <div> wrappers around leaf inputs. AWS Organizations models accounts inside organizational units recursively. DOM nodes (Element vs Text) implement composite-style traversal for rendering and event bubbling.',
    keyInsight:
      'Uniform treatment of leaf and composite is the contract—child-management methods belong on Composite, not the shared Component interface.',
    interviewTips: [
      '"Uniform interface for leaf and composite" is the phrase interviewers listen for.',
      'Child management (add/remove) on Composite only—not on Leaf or the shared Component interface.',
      'Relates to composition relationship (PART-OF) in UML and OOP—contrast with aggregation.',
      'Contrast with Decorator (single chain) and Chain of Responsibility (linear handlers).',
      'Follow-up: "Where do you enforce leaf cannot add children?" — Leaf throws or Composite-only API.',
      'Whiteboard: Component interface with File and Folder implementing getSize(); Folder holds children list.',
      'Visitor pattern often pairs with Composite to run operations across the tree without bloating node classes.',
    ],
    commonMistakes: [
      'Putting add()/remove() on the Component interface, forcing Leaf to throw UnsupportedOperationException everywhere.',
      'Using Composite for non-tree graphs with cycles—traversal infinite-loops without visited sets.',
      'Mixing business rules into traversal that belong in Visitor or separate services.',
      'Creating overly deep trees without considering stack overflow on recursive operations.',
    ],
  },
  {
    slug: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    intent:
      'Convert the interface of an existing class into one that clients expect, allowing incompatible components to collaborate without modifying their source code. The adapter wraps the adaptee and translates method calls, parameter types, and error models at the boundary. This is essential in integration layers where third-party SDKs, legacy systems, and internal domain interfaces never align perfectly. Object adapter (composition) is preferred over class adapter (multiple inheritance) in most languages.',
    whenToUse: [
      'Integrating legacy or third-party APIs whose contracts differ from your domain interfaces.',
      'You cannot modify vendor code but must consume it behind a stable internal abstraction.',
      'Migrating systems gradually—new code speaks the new interface; adapters wrap old implementations.',
      'Normalizing heterogeneous inputs (Stripe cents vs PayPal dollars) into one PaymentProcessor contract.',
    ],
    whenNotToUse: [
      'Interfaces already match—call directly or use DI without a translation layer.',
      'You need to simplify a complex subsystem for common tasks—Facade is the better pattern.',
      'The mismatch is in behavior not interface—Strategy or domain refactoring may be needed.',
      'Adapter becomes a dumping ground for business logic instead of thin translation.',
    ],
    example:
      'A travel plug adapter converts your US charger plug to a UK socket—the device (adaptee) and wall (client expectation) stay unchanged; only the adapter translates shape. StripePaymentAdapter wraps StripeSDK.charge(cents, currency) behind pay(dollars) for your checkout module. JDBC drivers adapt database-specific protocols to the standard JDBC interface. Slack\'s legacy API wrappers adapt old webhook formats to new event schemas. Android RecyclerView.Adapter maps arbitrary data models to ViewHolder interfaces expected by the framework.',
    keyInsight:
      'Adapter fixes interface mismatch— it does not simplify a subsystem (that is Facade) and does not add features (that is Decorator).',
    interviewTips: [
      'Object adapter (wrap adaptee) vs class adapter (inherit both)—prefer composition in Java/Python.',
      'Adapter vs Facade: Adapter translates one incompatible interface; Facade simplifies many compatible ones.',
      'Adapter vs Decorator: Adapter changes interface; Decorator preserves it and adds behavior.',
      'Follow-up: "Two-way adapter?" — rare; usually one direction from legacy to new contract.',
      'Integration layers in microservices (anti-corruption layer in DDD) are Adapter in practice.',
      'Whiteboard: Client → Target interface ← Adapter → Adaptee (legacy SDK).',
      'Mention testing: mock the Target interface; adapter tests verify translation correctness.',
    ],
    commonMistakes: [
      'Stuffing business validation into the adapter instead of keeping it a thin translation layer.',
      'Confusing Adapter with Facade when wrapping multiple subsystem classes for convenience.',
      'Creating a new adapter per call site instead of one shared adapter per external system.',
      'Ignoring error mapping—vendor exceptions should become domain errors at the boundary.',
    ],
  },
  {
    slug: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    intent:
      'Decouple an abstraction from its implementation so both can vary independently through composition rather than inheritance. Instead of N×M subclasses (BasicRemote×TV, BasicRemote×Radio, AdvancedRemote×TV…), you split into two hierarchies and compose them at runtime. The abstraction holds a reference to the implementor interface and delegates platform-specific work downward. This upfront design investment pays off when product types and platforms evolve on different schedules.',
    whenToUse: [
      'Two orthogonal dimensions vary independently: notification type × channel, shape × renderer, remote × device.',
      'Inheritance produces combinatorial subclass explosion (RedCircle, BlueCircle, RedSquare, BlueSquare…).',
      'Implementation must switch at runtime—change DB driver, rendering backend, or messaging transport without recompiling abstractions.',
      'You want abstraction-layer code stable while implementations evolve (cloud SDK versions, OS APIs).',
    ],
    whenNotToUse: [
      'Only one dimension varies—a single hierarchy with inheritance is fine.',
      'The abstraction and implementation are tightly coupled by nature and never change independently.',
      'Team lacks clarity on the split—premature Bridge adds indirection without variation benefit.',
      'Adapter scenario: fixing existing mismatch, not planning for future independent evolution.',
    ],
    example:
      'A TV remote (abstraction) and the device it controls (implementation) vary independently: AdvancedRemote and BasicRemote both work with TV or Radio by holding a Device reference—you do not need AdvancedRemoteForTV as a separate class. JDBC separates Connection abstraction from database-specific drivers (Bridge in practice). SLF4J logging facades bridge to Logback, Log4j, or JUL implementations at deploy time. Graphics APIs separate Shape from Renderer (vector vs raster drawing backends). AWS SDK v2 separates service clients (abstraction) from HTTP implementation (Netty vs Apache).',
    keyInsight:
      'Bridge prevents N×M subclass explosion by composing two hierarchies—split what varies along two axes.',
    interviewTips: [
      'Two hierarchies composed at runtime: Abstraction has Implementor reference—draw this relationship.',
      'Contrast with Adapter: Bridge designed upfront for independent evolution; Adapter fixes existing mismatch.',
      'Contrast with Strategy: Strategy swaps algorithm for one task; Bridge splits abstraction from platform implementation.',
      'Follow-up: "Bridge vs Abstract Factory?" — Bridge composes one impl at runtime; Abstract Factory creates product families.',
      'JDBC, SLF4J, and cross-platform remotes are strong named examples.',
      'Whiteboard: RemoteControl ──► Device interface ◄── TV / Radio; show avoids N×M subclasses.',
      'Mention increasing abstraction-side features without touching implementation classes.',
    ],
    commonMistakes: [
      'Creating Bridge when a simple Strategy or dependency injection would suffice.',
      'Confusing with Adapter because both use composition and delegation.',
      'Putting abstraction logic into implementor classes, collapsing the separation.',
      'Over-splitting stable code into two hierarchies with no realistic independent variation.',
    ],
  },
  {
    slug: 'facade',
    name: 'Facade',
    category: 'Structural',
    intent:
      'Provide a unified, high-level interface to a set of interfaces in a subsystem, reducing what clients must know about internal wiring and call order. The facade coordinates multiple subsystem classes behind one entry point—placeOrder(), sendNotification(), runMigration()—without hiding those classes from other advanced clients. It improves usability and enforces correct sequencing (reserve inventory before charging payment) but does not add new subsystem capabilities. Application services in layered architecture are often facades in practice.',
    whenToUse: [
      'Subsystem APIs are broad, low-level, or easy to misuse without orchestration.',
      'Common workflows repeat the same multi-step sequence across controllers or CLI commands.',
      'You want to isolate UI/API layers from internal refactoring of subsystem classes.',
      'Onboarding new developers—one facade documents the happy path for complex domains.',
    ],
    whenNotToUse: [
      'Subsystem is already a single simple class—facade adds pointless indirection.',
      'Every client needs different low-level control—expose subsystem directly with good docs.',
      'Facade accumulates business rules for the entire domain—risk of god-class anti-pattern.',
      'You need to translate incompatible interfaces—use Adapter, not Facade.',
    ],
    example:
      'A hotel concierge is a facade: you ask for "dinner and show tickets" once; the concierge coordinates restaurant booking, transport, and theater reservations—you do not call each vendor yourself. CheckoutFacade.placeOrder() orchestrates inventory.reserve(), payment.charge(), and shipping.dispatch() for the web controller. Amazon SDK high-level S3Client.upload() facades multipart upload, retries, and checksums. Kubernetes kubectl provides a facade over etcd, scheduler, and kubelet APIs. IDE "Run tests" facades compile, launch runner, and aggregate reports behind one action.',
    keyInsight:
      'Facade simplifies usage of an existing subsystem—it does not add new capability, only a convenient orchestration layer.',
    interviewTips: [
      'Facade simplifies; it does not restrict—subsystem classes remain accessible for power users.',
      'Contrast with Adapter: Facade wraps many related classes with a simpler API; Adapter fixes one interface mismatch.',
      'Application service layer in DDD/Clean Architecture is often a Facade over domain + infrastructure.',
      'Follow-up: "Can there be multiple facades?" — yes, one per use case (AdminFacade vs CustomerFacade).',
      'Facade vs Mediator: Facade is unidirectional convenience for clients; Mediator coordinates peer colleagues.',
      'Whiteboard: Client → Facade → [SubsystemA, SubsystemB, SubsystemC] with numbered call order.',
      'Mention that facades can enforce transaction boundaries and idempotency keys in distributed systems.',
    ],
    commonMistakes: [
      'Letting the facade become a god class owning all business logic instead of thin orchestration.',
      'Confusing Facade with Adapter when the goal is interface translation, not simplification.',
      'Hiding subsystem classes entirely, preventing legitimate low-level access.',
      'Duplicating facade methods that mirror subsystem 1:1 without adding workflow value.',
    ],
  },
  {
    slug: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    intent:
      'Use sharing to support large numbers of fine-grained objects efficiently by separating intrinsic (shared, immutable) state from extrinsic (context-specific) state passed by callers. Instead of 100,000 Tree objects each storing texture data, thousands of Tree instances share a few TreeType flyweights while coordinates and labels remain external. Memory footprint drops dramatically at the cost of more complex APIs that require callers to supply context on every operation. Factory-managed caches typically implement the flyweight pool.',
    whenToUse: [
      'Application creates huge numbers of similar objects and memory profiling shows duplication of heavy fields.',
      'Intrinsic state is immutable and safely shareable across contexts (glyphs, icons, tile types).',
      'Extrinsic state can be passed into methods at use time (x, y, color tint, user locale).',
      'Rendering or simulation loops instantiate millions of lightweight handles to shared data.',
    ],
    whenNotToUse: [
      'Object count is small—sharing adds complexity without measurable benefit.',
      'Most state is extrinsic and unique per instance—nothing meaningful to share.',
      'Thread safety on shared mutable flyweights would require locking that negates gains.',
      'Identity matters—clients must distinguish object instances with ==, not just equal content.',
    ],
    example:
      'Character formatting in a document editor is the classic analogy: the letter "A" in Times New Roman 12pt (intrinsic) is shared across the document; position on page and color highlight (extrinsic) vary per occurrence. Java\'s Integer.valueOf() caches -128 to 127 flyweight instances. Game engines share mesh and texture flyweights for thousands of identical trees or enemies on screen. Text editors store Glyph flyweights for ASCII codes and font combinations. React\'s virtual DOM reuses element type definitions while props carry extrinsic state per instance.',
    keyInsight:
      'Split intrinsic (shared inside factory) from extrinsic (passed by client)—if you cannot name both, it is probably not Flyweight.',
    interviewTips: [
      'Must articulate intrinsic vs extrinsic state with concrete fields from the example scenario.',
      'Factory + cache (Map<Key, Flyweight>) is the standard implementation sketch.',
      'Contrast with Object Pool: Flyweight shares immutable data; Pool reuses mutable expensive instances.',
      'Contrast with Singleton: Flyweight has many shared types, not one instance total.',
      'Follow-up: "Thread safety?" — flyweights must be immutable; extrinsic state stays local.',
      'Used in game engines, text editors, map tile renderers, and JVM boxed integer caches.',
      'Whiteboard: FlyweightFactory cache → TreeType shared; Tree object holds (type, x, y) extrinsic.',
    ],
    commonMistakes: [
      'Sharing mutable flyweights, causing cross-instance corruption when one client mutates "shared" data.',
      'Failing to externalize state that varies per use, breaking correctness for identity-sensitive logic.',
      'Confusing with caching arbitrary computed results—Flyweight is about object identity sharing.',
      'Over-optimizing small object counts where measurement shows no memory pressure.',
    ],
  },
  {
    slug: 'state',
    name: 'State',
    category: 'Behavioural',
    intent:
      'Allow an object to alter its behavior when its internal state changes by delegating operations to state-specific classes instead of sprawling conditional logic. The context holds a reference to the current state object; each state class implements the same interface methods differently and may trigger transitions to successor states. This models lifecycles—orders, tickets, TCP connections, vending machines—where allowed actions depend on where you are in the flow. State localizes transition rules and eliminates growing switch statements keyed by enum or integer codes.',
    whenToUse: [
      'Behavior changes significantly based on lifecycle phase (draft, submitted, approved, rejected).',
      'Switch/if chains on status enums grow with every new state and action combination.',
      'Transitions have explicit rules—cannot ship before paid, cannot cancel after delivered.',
      'Each state encapsulates both behavior and knowledge of valid next states.',
    ],
    whenNotToUse: [
      'Only two states with trivial differences—a boolean or simple enum check suffices.',
      'States change rarely and logic is stable—conditionals may be clearer to the team.',
      'Behavior varies by type, not lifecycle phase—Strategy is the better fit.',
      'Transition matrix is enormous and better driven by data (rules engine) than class-per-state.',
    ],
    example:
      'A vending machine is the textbook analogy: when idle, inserting a coin transitions to "has credit"; selecting a product moves to dispensing—you cannot dispense while idle because behavior is bound to state, not one mega-method with if checks. TCP connection states (LISTEN, SYN_SENT, ESTABLISHED, CLOSED) delegate packet handling to state objects in some stack implementations. Order workflows in e-commerce (Created → Paid → Shipped → Delivered) gate cancel/refund/track actions per state. Media player objects switch between Playing, Paused, and Stopped states with different button behaviors. Jira ticket workflows map cleanly to State pattern classes.',
    keyInsight:
      'State replaces status switches with polymorphism—transitions change the context\'s delegate object, not a giant conditional.',
    interviewTips: [
      'Replaces switch(status) with polymorphic state classes—say this explicitly.',
      'Contrast with Strategy: State transitions internally based on lifecycle; Strategy is chosen externally for algorithms.',
      'Context holds current state; states may know valid transitions or use a transition table.',
      'Follow-up: "Who triggers transition?" — state method after success, context setState(), or external event.',
      'Table-driven alternative: Map<(State, Event), State> for large finite state machines.',
      'Whiteboard: Context → currentState.handleAction(); arrow to new state on transition.',
      'Mention entry/exit hooks (onEnter, onExit) for side effects like sending notifications.',
    ],
    commonMistakes: [
      'Confusing State with Strategy because both use delegation to interchangeable objects.',
      'Putting all transition logic in Context, leaving state classes as empty shells.',
      'Creating state explosion—one class per (state × sub-mode) instead of factoring dimensions.',
      'Forgetting invalid action handling—states should reject or no-op illegal operations clearly.',
    ],
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    category: 'Behavioural',
    intent:
      'Define a family of algorithms, encapsulate each one behind a common interface, and make them interchangeable at runtime without modifying the context class. The context delegates work to the injected strategy, so new algorithms (pricing rules, routing heuristics, compression codecs) plug in via composition. This is a cornerstone of the Open/Closed Principle—extend behavior by adding strategy classes, not editing conditionals. Configuration, user preference, or A/B tests select which strategy instance the context uses.',
    whenToUse: [
      'Multiple interchangeable algorithms solve the same problem (sort orders, tax calculation, pathfinding).',
      'Algorithm choice depends on runtime config, user input, or feature flags.',
      'You want to unit-test algorithms in isolation without constructing the full context.',
      'Conditional chains for "how to compute X" grow with every new variant.',
    ],
    whenNotToUse: [
      'Only one algorithm will ever exist—inline code avoids unnecessary abstraction.',
      'Behavior change is lifecycle-driven with transitions—State pattern fits better.',
      'Clients must not know algorithms exist—hide behind a single method without swappable injection.',
      'Strategy selection requires complex orchestration of many peers—consider Mediator or rules engine.',
    ],
    example:
      'Navigation apps choosing route algorithm is the analogy: same "get directions" button, but the app swaps between fastest, toll-free, or scenic strategy based on user preference without rewriting the map UI. Payment checkout injects CreditCardPayment or UpiPayment strategies. Java Collections.sort() accepts Comparator strategies for custom ordering. Image processing pipelines swap JPEG vs PNG compression strategies. Ride-hailing fare calculation switches between standard, airport-flat, and surge strategies by city rules—Uber/Lyft pricing engines are strategy-heavy.',
    keyInsight:
      'Strategy swaps how something is computed; State swaps behavior based on lifecycle phase—selection vs transition is the interview discriminator.',
    interviewTips: [
      'Strategy vs State: Strategy chosen by client/config; State transitions internally on events.',
      'Core OCP example—inject interface, add new implementation without editing context.',
      'Map<String, Strategy> registry common for plugin-style selection by name.',
      'Follow-up: "Context holds strategy reference—can it change at runtime?" — yes, setStrategy().',
      'Contrast with Template Method: Strategy uses composition; Template uses inheritance for algorithm skeleton.',
      'Whiteboard: Context.checkout() → strategy.pay(); show Strategy interface with impl A/B/C.',
      'Functional languages: first-class functions as strategies without explicit Strategy classes.',
    ],
    commonMistakes: [
      'Using Strategy when a single function or lambda would suffice in modern languages.',
      'Context knowing too much about concrete strategy types instead of the interface.',
      'Confusing with State because both delegate to pluggable objects.',
      'Creating a new strategy class for every tiny parameter tweak instead of configurable strategies.',
    ],
  },
  {
    slug: 'observer',
    name: 'Observer',
    category: 'Behavioural',
    intent:
      'Define a one-to-many dependency between subjects and observers so that when the subject\'s state changes, all registered observers are notified automatically. Publishers remain unaware of concrete subscriber classes—only the observer interface matters— enabling loose coupling between event producers and reactive consumers. Variants include push (send full payload) and pull (notify only, observers fetch). The pattern underpins reactive UI, domain events, and pub/sub messaging, though production systems add delivery guarantees, ordering, and failure isolation.',
    whenToUse: [
      'Multiple components must react to the same domain event (order placed → inventory, email, analytics).',
      'You want runtime subscribe/unsubscribe without rewiring the publisher.',
      'UI models notify views when data changes (MVC, MVVM, reactive bindings).',
      'Microservices publish events to decouple side effects from the critical path.',
    ],
    whenNotToUse: [
      'Only one listener exists forever—a direct callback or method call is simpler.',
      'Notification order, exactly-once delivery, or transactions are required—use a message broker with guarantees.',
      'Observers create circular update loops (A notifies B notifies A)—need careful design or mediators.',
      'Synchronous notification of slow observers blocks the publisher unacceptably.',
    ],
    example:
      'News subscription is the analogy: the news agency (subject) publishes a story once; email, push, and RSS subscribers (observers) each react independently—you do not embed email logic inside the newsroom. JavaScript EventTarget addEventListener is Observer in the browser DOM. Spring ApplicationEventPublisher notifies @EventListener beans on OrderCreated. RxJava Observables and React useState/useEffect propagate state changes to dependent components. Kafka topics generalize Observer to distributed, durable pub/sub at scale.',
    keyInsight:
      'Observer decouples who publishes from who reacts—production systems layer retries, async delivery, and dead-letter queues on top.',
    interviewTips: [
      'Push vs pull: push sends data in notify(); pull sends event id and observers query subject.',
      'Java Observable/Observer deprecated since Java 9—prefer explicit listener lists, PropertyChangeSupport, or event buses.',
      'Contrast with Mediator: Observer is many listeners to one subject; Mediator orchestrates peer interactions.',
      'Follow-up: "What if an observer throws?" — isolate failures, async dispatch, or remove bad subscribers.',
      'Foundation for reactive UI, event-driven microservices, and domain events in DDD.',
      'Whiteboard: Subject with observer list; setState() loops notify(o); dashed arrows to Email/Push observers.',
      'Mention memory leaks: observers must unsubscribe (weak references, lifecycle hooks).',
    ],
    commonMistakes: [
      'Observers performing heavy synchronous work on the publisher thread.',
      'Forgetting to unsubscribe, leaking observers and stale UI updates.',
      'Subject knowing concrete observer types, defeating loose coupling.',
      'Using Observer when a message queue with persistence is required for reliability.',
    ],
  },
  {
    slug: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioural',
    intent:
      'Pass a request along a chain of handler objects until one handles it or the chain exhausts without a match. Each handler implements common processing logic: attempt to handle, otherwise delegate to next. Senders remain decoupled from which handler resolves the request—new handlers plug in by linking into the chain. This models middleware, filters, support escalation tiers, and validation pipelines where order matters and handlers are optional.',
    whenToUse: [
      'Request processing needs sequential checks: auth → rate limit → validate → audit → business logic.',
      'Handlers should be added, removed, or reordered without changing sender code.',
      'Multiple handlers might process the same request partially (logging all, short-circuit on auth fail).',
      'Escalation tiers: bot → L1 → L2 → specialist until resolved.',
    ],
    whenNotToUse: [
      'Exactly one handler must always process—direct dispatch or strategy is clearer.',
      'Order is irrelevant and handlers are independent—parallel pipeline or observer may fit.',
      'Debugging distributed control flow becomes unacceptable without correlation IDs.',
      'Chain becomes so long that a rules table or workflow engine is more maintainable.',
    ],
    example:
      'Customer support escalation is the analogy: your ticket hits the bot first; if it cannot solve "billing dispute," it passes to L1, then L2— you do not pick the agent manually. Servlet Filter chains and Express/Starlette middleware process HTTP requests in order before reaching the controller. AWS API Gateway request validators chain auth, throttling, and mapping templates. Logging frameworks chain appenders (console → file → remote). Netflix Zuul/Spring Cloud Gateway filter chains implement cross-cutting gateway concerns.',
    keyInsight:
      'Each handler decides handle-or-forward—senders link the chain once and submit requests without knowing the resolving handler.',
    interviewTips: [
      'Linked list of handlers: handle() returns result or calls next.handle().',
      'Servlet filters, HTTP middleware, and logging pipelines are named examples interviewers expect.',
      'Contrast with Decorator: Decorator always delegates through entire stack; Chain may short-circuit.',
      'Contrast with Composite: Chain is linear; Composite is tree structure.',
      'Follow-up: "Can multiple handlers run?" — yes for pass-through (logging); no for first-match escalation.',
      'Whiteboard: Client → H1 → H2 → H3; show tryHandle returning null to pass.',
      'Mention async middleware (Koa) where await next() controls downstream execution.',
    ],
    commonMistakes: [
      'Chain with no default handler, silently dropping unhandled requests.',
      'Handlers depending on global mutable state instead of request context objects.',
      'Confusing with Decorator when every layer must always run.',
      'Creating circular next links causing infinite loops.',
    ],
  },
  {
    slug: 'template',
    name: 'Template',
    category: 'Behavioural',
    intent:
      'Define the skeleton of an algorithm in a base class template method while letting subclasses override specific steps without changing the overall sequence. The base class enforces invariant ordering—boil water before brew—via final or non-overridable template methods, calling abstract hooks for customizable steps. This captures "same process, different details" workflows common in data import, test fixtures, and framework lifecycle methods. Inheritance-based extension is the trade-off versus Strategy\'s composition flexibility.',
    whenToUse: [
      'Multiple workflows share fixed high-level steps with variable details (import, export, ETL).',
      'Invariant ordering must be enforced—subclasses cannot skip validation before persist.',
      'Framework defines lifecycle: init(), run(), cleanup() with user-defined hooks.',
      'Code duplication exists across classes that differ only in one or two steps of a longer process.',
    ],
    whenNotToUse: [
      'Entire algorithm varies—Strategy with composed steps is more flexible.',
      'Inheritance hierarchies are discouraged in your codebase—prefer composition-based pipelines.',
      'Only one implementation exists—abstract base class adds unnecessary complexity.',
      'Subclasses need to reorder steps—Template Method is too rigid; use Chain or Strategy pipeline.',
    ],
    example:
      'Making hot drinks follows a template: boil water → brew → pour → add condiments—the sequence is fixed, but Coffee and Tea subclasses override brew() and addCondiments() differently. JUnit @BeforeEach / @Test / @AfterEach template methods define test lifecycle skeletons. Servlet service() method templates handle GET/POST dispatch. Hadoop MapReduce templates map and reduce phases with customizable mappers/reducers. Spring JdbcTemplate executes connection acquire → SQL → map rows, letting callers supply row mappers.',
    keyInsight:
      'Hollywood Principle—"don\'t call us, we\'ll call you"—the base template method drives the flow and invokes subclass hooks.',
    interviewTips: [
      'Hollywood Principle is the memorable phrase for Template Method interviews.',
      'final template method prevents subclasses from breaking algorithm skeleton.',
      'Contrast with Strategy: Template uses inheritance for partial steps; Strategy swaps whole algorithm via composition.',
      'Follow-up: "What if one step should be optional?" — hook with default empty implementation in base.',
      'Whiteboard: prepare() calling boilWater(), brew*, pour(), addCondiments*—star abstract hooks.',
      'Framework design interviews: identify fixed vs variable steps in parse-validate-persist pipelines.',
      'Mention parallel concept in functional pipelines where compose() fixes stage order.',
    ],
    commonMistakes: [
      'Making the template method overridable, allowing subclasses to break invariant ordering.',
      'Using Template Method when only one step differs and a Strategy hook would reduce inheritance.',
      'God base class accumulating unrelated template methods for different workflows.',
      'Confusing with Factory Method—a Factory Method is often a step inside a larger template.',
    ],
  },
  {
    slug: 'iterator',
    name: 'Iterator',
    category: 'Behavioural',
    intent:
      'Provide a way to traverse elements of an aggregate collection sequentially without exposing its internal representation (array, linked list, B-tree, remote page cursor). Iterator encapsulates traversal state—current index, stack for trees—so multiple traversals can run concurrently on the same collection. Separate iterator classes enable multiple traversal policies (forward, reverse, filtered) without bloating the collection API. Language-level for-each and generator protocols are Iterator pattern in everyday use.',
    whenToUse: [
      'Clients need uniform traversal over heterogeneous collection implementations.',
      'Internal structure must stay hidden—database cursor, graph adjacency, compressed storage.',
      'Multiple simultaneous traversals or different iteration orders on the same aggregate.',
      'Lazy/paginated iteration over large or remote datasets without loading everything into memory.',
    ],
    whenNotToUse: [
      'Collection is always a simple List exposed directly—enhanced for-loop on array is enough.',
      'Random access by index is the primary operation—Iterator adds friction.',
      'Concurrent modification during iteration requires sophisticated coordination—consider snapshots or immutable collections.',
      'Functional stream APIs (map/filter) replace custom iterator needs in modern code.',
    ],
    example:
      'A bookmark in a book lets you read page by page without knowing whether pages are stacked, bound, or digital—Iterator is that bookmark for data structures. Java\'s java.util.Iterator and Iterable power for-each loops across ArrayList, HashSet, and custom trees. Python\'s __iter__/__next__ protocol and generators yield items lazily. Database ResultSet iterators fetch rows without loading the full table. Git log traversal uses commit iterators over the DAG. Kotlin sequences provide iterator-style lazy evaluation over collections.',
    keyInsight:
      'Iterator separates traversal from storage—collection holds elements; iterator holds "where we are" in the walk.',
    interviewTips: [
      'Python/Java built-in iterators cover 80% of cases—custom iterators matter for trees, graphs, paginated APIs.',
      'Fail-fast vs fail-safe: ConcurrentModificationException vs snapshot iterator (CopyOnWriteArrayList).',
      'Internal vs external iterator: who controls advance (collection.forEach vs client calls next()).',
      'Follow-up: "Iterator vs Stream?" — Iterator is pull-based low-level; Stream adds functional ops.',
      'Whiteboard: Aggregate.createIterator() → hasNext()/next(); hide internal array vs linked list.',
      'Mention Iterator.remove() optional behavior and UnsupportedOperationException on immutable collections.',
      'Graph BFS/DFS iterators encapsulate queue/stack inside iterator implementation.',
    ],
    commonMistakes: [
      'Exposing internal collection reference through iterator, breaking encapsulation.',
      'Iterator invalid after concurrent structural modification without fail-fast signaling.',
      'Implementing Iterator when Stream/map/filter expresses the traversal more clearly.',
      'Off-by-one errors in hasNext/next contract—callers expect next() only when hasNext() is true.',
    ],
  },
  {
    slug: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioural',
    intent:
      'Given a language or grammar, represent each grammar rule as a class and evaluate sentences by interpreting the abstract syntax tree. Terminal expressions hold literals; non-terminal expressions compose sub-expressions (And, Or, Add). The pattern suits small, stable DSLs—search filters, permission rules, pricing formulas—where embedding a full parser generator is heavyweight. Evaluation walks the tree recursively; performance and grammar evolution limits push complex languages toward lexer/parser tools instead.',
    whenToUse: [
      'Domain has a simple, stable grammar evaluated repeatedly (boolean rules, math expressions, query filters).',
      'Rules change by configuration strings rather than code deploys.',
      'AST nodes map naturally to composable Expression classes.',
      'Grammar size is bounded—dozens of constructs, not a general programming language.',
    ],
    whenNotToUse: [
      'Grammar is large or evolving rapidly—ANTLR, yacc, or tree-sitter are better fits.',
      'Performance-critical hot paths cannot afford interpreted tree walks.',
      'Security sandboxing of user expressions requires bytecode generation or WASM, not naive interpret().',
      'Single static rule with no compositional structure—a boolean function suffices.',
    ],
    example:
      'Musical chord notation is a mini-language: "Cmaj7" has meaning built from symbols—you interpret the notation rather than hardcoding every chord as a separate class manually. Regex engines interpret pattern ASTs. Elasticsearch query DSL parsers build expression trees for bool/must/should clauses. Spreadsheet formula engines interpret cell expressions referencing other cells. SQL WHERE clauses in ORMs sometimes use Interpreter for simple filter objects. Cron expression parsers evaluate schedule tokens into next-run timestamps.',
    keyInsight:
      'Interpreter builds an expression tree (often Composite) and evaluates via recursive interpret()—pair with Visitor when operations outnumber expression types.',
    interviewTips: [
      'AST as Composite of expression nodes—Terminal and NonTerminal expressions.',
      'Rare unless interview mentions DSL, rule engine, or search filter language—then go deep.',
      'Contrast with Visitor: Interpreter evaluates; Visitor adds operations without changing node classes.',
      'Follow-up: "Performance?" — cache compiled AST, bytecode gen, or switch to parser generator at scale.',
      'Whiteboard: AndExpr(left, right).interpret(context) → left.interpret() && right.interpret().',
      'Mention security: never eval() user strings; sandbox AST evaluation with whitelisted nodes.',
      'Spring EL and SpEL, OGNL, and JSONLogic are production interpreter-style rule systems.',
    ],
    commonMistakes: [
      'Using raw eval() on user strings instead of parsing into a safe AST.',
      'Class explosion for every grammar variant without composite structure.',
      'Interpreter for grammars that need error recovery and rich syntax—use proper parser tools.',
      'Mixing parsing and interpretation in one class instead of parse → AST → interpret phases.',
    ],
  },
  {
    slug: 'command',
    name: 'Command',
    category: 'Behavioural',
    intent:
      'Encapsulate a request as an object, letting you parameterize clients with different requests, queue operations, log audits, and support undo/redo. The invoker holds a command reference and calls execute() without knowing the receiver\'s details; the command binds receiver, action, and arguments together. Macro commands batch multiple commands; history stacks enable undo by calling inverse operations or restoring mementos. CQRS, job queues, and GUI action frameworks are Command pattern at scale.',
    whenToUse: [
      'Operations must be queued, retried, scheduled, or executed asynchronously (task queues, outbox pattern).',
      'Undo/redo, transactional edits, or audit trails require storing what was done.',
      'Same UI button triggers different actions based on context—commands as first-class objects.',
      'Decouple trigger (menu, API, cron) from business logic receiver.',
    ],
    whenNotToUse: [
      'Simple synchronous method calls with no undo, queue, or logging requirements.',
      'Every command differs structurally—a generic function pointer may suffice in functional code.',
      'Undo semantics are impossible or undefined for the operation (send email, charge card without compensating transaction).',
      'Command class proliferation outweighs benefit for trivial CRUD.',
    ],
    example:
      'A restaurant order ticket is a command: the waiter (invoker) writes "burger, no onions" (command object); the kitchen (receiver) executes without the waiter knowing recipes—the ticket can be queued, cancelled, or reordered. Text editor undo stacks store InsertCommand and DeleteCommand objects. AWS SQS messages encapsulate commands processed by workers. GUI frameworks map Ctrl+Z to undoable commands (Swing UndoManager, Qt QUndoStack). CQRS separates Command (write) from Query (read) messages in event-sourced systems.',
    keyInsight:
      'Command turns "do something" into a storable, queueable object—undo/redo and audit trails become natural extensions.',
    interviewTips: [
      'Name three roles: Invoker, Command, Receiver—draw arrows on whiteboard.',
      'Undo via inverse command or Memento snapshot—interviewers ask which you pick and why.',
      'Macro command executes child commands in sequence; composite command pattern variant.',
      'Contrast with Strategy: Command encapsulates request + receiver; Strategy encapsulates algorithm.',
      'Follow-up: "Idempotent retry?" — commands need dedup keys or idempotent receivers.',
      'Used in job queues, CQRS, GUI frameworks, and transactional outbox patterns.',
      'Whiteboard: Invoker.run(cmd) → cmd.execute() → receiver.action(); stack for undo.',
    ],
    commonMistakes: [
      'Commands with no undo path when product requires redo/undo.',
      'Invoker knowing receiver concrete type, breaking decoupling.',
      'Mutable command objects reused across executions with stale parameters.',
      'Storing unbounded command history without compaction or snapshot strategy.',
    ],
  },
  {
    slug: 'visitor',
    name: 'Visitor',
    category: 'Behavioural',
    intent:
      'Represent an operation to perform on elements of an object structure without changing the element classes themselves. Each element implements accept(visitor) which dispatches to visitor.visitConcreteElement(this)—double dispatch resolves the correct visit overload at runtime. New operations (export, lint, optimize, serialize) add new visitor classes while node types stay stable. The trade-off inverts Composite\'s problem: easy new operations, hard new element types.',
    whenToUse: [
      'Object structure (AST, document model, cart line items) is stable but operations proliferate.',
      'Cross-cutting operations should not bloat element classes with export(), tax(), validate() methods.',
      'Compiler passes, linters, and serializers run multiple traversals over the same tree.',
      'Type-specific behavior depends on both node type and operation type (double dispatch needed).',
    ],
    whenNotToUse: [
      'Element types change frequently—every new node requires updating all visitors (OCP pain).',
      'Structure is flat with few types—switch or polymorphism on elements suffices.',
      'Operations are intrinsic to the domain object—belong on the class, not external visitor.',
      'Language lacks double dispatch ergonomics and workarounds add more complexity than benefit.',
    ],
    example:
      'A building inspector (visitor) visits rooms, elevators, and fire exits (elements)—each room calls the inspection routine appropriate for rooms without adding inspectForFireCode() to every element class separately; new inspectors (safety vs energy audit) are new visitor classes. Compiler ASTs use visitors for type checking (javac), optimization LLVM passes, and pretty-printing. ESLint rules traverse ESTree AST nodes via visitor pattern. Shopping cart tax calculation visits Book vs Electronics with different rates. Document export walks paragraph/image nodes with PDFVisitor vs HTMLVisitor.',
    keyInsight:
      'Double dispatch via accept()/visit() lets you add new operations without touching element classes—at the cost of updating all visitors when adding a new element type.',
    interviewTips: [
      'Double dispatch: element.accept(visitor) → visitor.visitBook(this)—explain why single dispatch fails.',
      'Easy to add operations; hard to add new element types—state trade-off explicitly.',
      'Compiler ASTs, linters, serializers are classic examples—cite one by name.',
      'Contrast with Interpreter: Visitor adds ops to structure; Interpreter evaluates expression trees.',
      'Follow-up: "Visitor vs switch on type?" — Visitor is OCP-friendly when ops grow; switch rots.',
      'Whiteboard: Book.accept(taxVisitor) → taxVisitor.visitBook(book); show visit overloads per type.',
      'Mention accumulating result in visitor fields or returning values from visit methods.',
    ],
    commonMistakes: [
      'Adding new element types without updating every visitor—compile breaks are intentional but often missed.',
      'Visitor with mutable global state during traversal, breaking concurrent or nested walks.',
      'Using Visitor when structure and operations both churn—neither axis is stable.',
      'Forgetting to traverse child nodes inside composite element accept() implementations.',
    ],
  },
  {
    slug: 'mediator',
    name: 'Mediator',
    category: 'Behavioural',
    intent:
      'Define an object that encapsulates how a set of objects interact, promoting loose coupling by preventing peers from referencing each other directly. Colleagues send events or requests to the mediator, which routes, filters, and orchestrates responses according to centralized rules. This tames many-to-many dependency meshes common in UI dialogs, chat rooms, and air-traffic control metaphors. The mediator can become complex, so boundaries and single-responsibility splits matter.',
    whenToUse: [
      'Many peer objects interact in complex, changing ways (form widgets, chat participants, aircraft).',
      'Direct colleague-to-colleague references would create N² coupling.',
      'Orchestration rules change often and should live in one place.',
      'UI components must stay reusable and not know about each other.',
    ],
    whenNotToUse: [
      'Two objects with simple one-to-one communication—direct reference is fine.',
      'Mediator grows into a god object owning all business logic—split domains or use events.',
      'Loose coupling via Observer/pub-sub already suffices without central orchestration.',
      'Performance requires peer-to-peer shortcuts bypassing mediator bottlenecks.',
    ],
    example:
      'Air traffic control is the classic analogy: planes do not negotiate runways with each other—they communicate with the tower (mediator), which clears landings and holds others. Chat room servers mediate messages between users without each client holding sockets to every peer. Booking UI mediators coordinate date picker, seat map, and fare summary widgets. MediatR library in .NET routes in-process requests through a mediator pipeline. Redux dispatch acts as a mediator between actions and reducers in frontend state management.',
    keyInsight:
      'Colleagues talk only to the mediator—this replaces spaghetti peer references with one coordination hub.',
    interviewTips: [
      'Colleagues communicate only via mediator—reduces coupling mesh to star topology.',
      'Contrast with Observer: Observer broadcasts state change; Mediator orchestrates multi-party protocols.',
      'Contrast with Facade: Facade simplifies subsystem for outside client; Mediator coordinates internal peers.',
      'Follow-up: "Mediator vs Event Bus?" — Mediator often synchronous orchestration; bus async decoupled pub/sub.',
      'UI dialog wizards and form field cross-validation are frequent interview scenarios.',
      'Whiteboard: star diagram—Mediator center, Colleague A/B/C edges only to center.',
      'Mention ChatRoom/Tower examples; .NET MediatR for in-process CQRS routing.',
    ],
    commonMistakes: [
      'Mediator accumulating domain logic that belongs in colleagues or domain services.',
      'Re-implementing Observer inside mediator without clear orchestration rules.',
      'Single mediator for unrelated subsystems—split by bounded context.',
      'Colleagues bypassing mediator with sneaky direct references, defeating the pattern.',
    ],
  },
  {
    slug: 'memento',
    name: 'Memento',
    category: 'Behavioural',
    intent:
      'Capture and externalize an object\'s internal state at a point in time so it can be restored later without exposing implementation details to the caretaker. The originator creates mementos from its private fields; the caretaker stores mementos in a stack or history list but ideally cannot inspect or mutate internals. Combined with Command pattern, mementos power undo/redo in editors, games, and configuration tools. Storage cost and snapshot granularity are the main engineering concerns.',
    whenToUse: [
      'Undo/redo or checkpoint/restore for complex editable state (editors, designers, form wizards).',
      'Rollback to prior snapshots after failed operations or experimental branches.',
      'Caretaker must store history without breaking originator encapsulation.',
      'Transactional preview: save state before apply, restore on cancel.',
    ],
    whenNotToUse: [
      'State is small and public—copy the DTO or use immutable versioning instead.',
      'Snapshots are huge and frequent—event sourcing or delta compression fits better.',
      'Originator cannot expose enough state to restore without full serialization anyway.',
      'Only one step undo needed—a single previous-value field may suffice.',
    ],
    example:
      'Save points in video games are mementos: the game (originator) captures player position, inventory, and quest flags into a save file; the player (caretaker) stores saves on disk without peeking into binary format internals. IDE local history and Git commits are memento-like snapshots at coarser granularity. Photoshop history panel restores document mementos. Database savepoints within transactions capture memento state for partial rollback. Diagram editors push EditorMemento onto stacks before destructive operations.',
    keyInsight:
      'Originator owns create/restore logic; caretaker stores opaque mementos—encapsulation is the reason to use Memento over public cloning.',
    interviewTips: [
      'Three roles: Originator (create/restore), Memento (snapshot), Caretaker (stores, ideally read-only).',
      'Memento should be opaque—caretaker cannot depend on internal fields (use nested private class in Java).',
      'Pairs with Command: command execute saves memento; undo restores previous memento.',
      'Follow-up: "Memory growth?" — limit stack depth, delta mementos, or periodic full snapshots.',
      'Contrast with Prototype: Prototype clones for new objects; Memento snapshots for rollback.',
      'Whiteboard: originator.save() → memento → caretaker stack; undo pop → originator.restore(m).',
      'Deep vs shallow snapshot—same concerns as Prototype when nested structures exist.',
    ],
    commonMistakes: [
      'Public memento fields let caretaker mutate snapshot state, breaking restore invariants.',
      'Storing unbounded history causing memory exhaustion in long editing sessions.',
      'Memento capturing non-restorable resources (open sockets, live DB connections).',
      'Using serialization to disk as "memento" without defining restore contract on originator.',
    ],
  },
  {
    slug: 'null-object',
    name: 'Null Object',
    category: 'Behavioural',
    intent:
      'Provide a do-nothing implementation of an interface in place of null references so client code avoids repetitive null checks while preserving polymorphism. NullCoupon.apply() returns the original price; NullLogger.log() silently discards messages—behavior is explicit and safe by default. This differs from returning null or using Optional, which push checking burden to callers. The risk is silent failures when misconfiguration should have been loud.',
    whenToUse: [
      'Optional collaborator behavior should default to safe no-op without if (x != null) everywhere.',
      'Interface requires methods but "absent" implementation is valid (no discount, no logging, no cache).',
      'Polymorphic call chains should not break when a feature is disabled.',
      'Strategy or dependency slot always expects a concrete object at construction.',
    ],
    whenNotToUse: [
      'Absence vs presence is meaningful business state—Optional or explicit Maybe types are clearer.',
      'Silent no-op hides misconfiguration (missing API key should fail loudly, not NullLogger).',
      'Null Object would need dozens of variants with different "empty" semantics.',
      'Callers must distinguish "not configured" from "configured but idle" for auditing.',
    ],
    example:
      'A disconnected phone line that accepts calls but goes nowhere is a null object: you still " dial" uniformly without checking if the line exists—the no-op behavior is intentional. NullCoupon in billing always calls apply() without null guards. java.util.Collections.emptyList() returns a null object list—add throws, read returns empty. Apache Commons NullWriter discards output. GUI NullLayout or no-op MouseListener avoids null checks in event wiring. Logging frameworks use NOPLogger as Null Object when logging is disabled.',
    keyInsight:
      'Null Object is a real polymorphic instance with deliberate do-nothing behavior—not Java null, not Optional.empty().',
    interviewTips: [
      'Null Object implements the interface with empty behavior—eliminates null checks, not null itself.',
      'Contrast with Optional/Maybe: Optional forces explicit handling; Null Object hides absence in call flow.',
      'Contrast with Singleton: Null Object is one special no-op impl; Singleton is one shared real instance.',
      'Follow-up: "When is silence dangerous?" — log at debug when NullLogger used, or validate config at startup.',
      'Document expected Null Object behavior so missing config is observable in metrics/logs.',
      'Whiteboard: Service always calls logger.log(); RealLogger vs NullLogger implement same interface.',
      'Testing: inject NullLogger/NullCoupon to isolate tests from side effects.',
    ],
    commonMistakes: [
      'Using Null Object to mask configuration errors that should fail fast at startup.',
      'Null implementation throwing UnsupportedOperationException—defeats the no-op purpose.',
      'Returning Java null from factory when Null Object instance was promised by contract.',
      'One Null Object shared mutable state across calls—must remain stateless or thread-safe.',
    ],
  },
];

export const patterns: Pattern[] = patternMeta.map((meta) => ({
  ...meta,
  ...patternSnippets[meta.slug],
}));

export function getPatternBySlug(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns.filter((p) => p.category === category);
}

export function getAdjacentPatterns(slug: string): {
  prev?: Pattern;
  next?: Pattern;
} {
  const index = patterns.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? patterns[index - 1] : undefined,
    next: index < patterns.length - 1 ? patterns[index + 1] : undefined,
  };
}

export const patternCategoryCounts: Record<PatternCategory, number> = {
  Creational: patterns.filter((p) => p.category === 'Creational').length,
  Structural: patterns.filter((p) => p.category === 'Structural').length,
  Behavioural: patterns.filter((p) => p.category === 'Behavioural').length,
};
