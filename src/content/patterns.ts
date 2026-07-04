import { patternSnippets } from './patternSnippets';

export type PatternCategory = 'Creational' | 'Structural' | 'Behavioural';

export interface Pattern {
  slug: string;
  name: string;
  category: PatternCategory;
  intent?: string;
  whenToUse?: string[];
  whenToAvoid?: string[];
  example?: string;
  keyInsight?: string;
  commonMistakes?: string[];
  codePython?: string;
  codeJava?: string;
  interviewTips?: string[];
}

const patternMeta: Omit<Pattern, 'codePython' | 'codeJava'>[] = [
  {
    slug: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    intent:
      'Ensure a class has exactly one instance and provide a global access point to it. The pattern centralizes shared infrastructure state—configuration, connection pools, or logging—so every part of the application reads from the same source of truth. It prevents duplicate initialization of expensive resources and avoids inconsistent copies of critical settings. Use it sparingly: the real goal is controlled shared access, not a license to scatter global mutable state everywhere.',
    whenToUse: [
      'You need one shared coordinator (config loader, logger, cache manager) that every module must use consistently.',
      'Object creation is expensive (parsing large config files, opening DB pools) and repeated instantiation would waste memory or cause race conditions.',
      'The system must enforce a single authoritative instance—e.g., one license validator or one metrics registry per process.',
      'Multiple threads or requests must see the same in-memory state without passing the object through every constructor.',
      'You are wrapping a third-party resource that only allows one handle (hardware device, OS-level lock).',
    ],
    whenToAvoid: [
      'You only need a single instance today but the design should stay testable—prefer dependency injection with a scoped container instead.',
      'Different environments or tenants need isolated instances; a global singleton couples them together.',
      'The class holds mutable business state that changes per request—singleton lifetime is process-wide, not request-scoped.',
    ],
    example:
      'Think of a city\'s water treatment plant: there is one central facility that every neighborhood taps into, rather than each house building its own plant. In software, Spring\'s ApplicationContext and Python\'s logging module behave similarly—a single configuration loader reads environment variables once, and all services (email, SMS, push notifications) pull from that same object. Android\'s ActivityManager and many game engines use singletons for the main loop coordinator. The analogy breaks if you treat every service as a singleton; reserve it for true cross-cutting infrastructure.',
    keyInsight:
      'Singleton is about controlled uniqueness and a stable access point—not about making everything global. In interviews, always pair it with thread-safety and testability trade-offs.',
    commonMistakes: [
      'Implementing lazy initialization without synchronization in multi-threaded Java, creating two instances under race.',
      'Using singleton to hide business logic dependencies instead of injecting interfaces—tests become impossible to isolate.',
      'Storing request-scoped or user-specific data in a singleton, causing data leaks across sessions.',
      'Forgetting that enum singleton or module-level objects in Python are often cleaner than hand-rolled getInstance().',
    ],
    interviewTips: [
      'Name thread-safety options in Java: synchronized getInstance, double-checked locking, enum singleton, holder idiom.',
      'Python: a module is a natural singleton—`import config` gives one shared object without ceremony.',
      'Contrast with static utility classes: singleton can implement interfaces and participate in polymorphism.',
      'Common follow-up: "How would you test code that uses a singleton?" — answer with DI, factory override, or interface extraction.',
      'Whiteboard tip: draw one box labeled "Singleton" with many arrows from clients; mention lazy vs eager init.',
      'Ask clarifying questions: single process vs distributed? Redis/etcd often replace in-process singletons in microservices.',
      'Mention anti-pattern smell: "Singleton abuse" when dozens of globals replace proper layering.',
    ],
  },
  {
    slug: 'builder',
    name: 'Builder',
    category: 'Creational',
    intent:
      'Separate the construction of a complex object from its representation so the same building process can create different variants. Instead of a constructor with twelve optional parameters, you assemble the object step by step with readable, named calls. The builder can enforce validation before the final object exists, preventing half-built invalid states from escaping into the system. It shines when object graphs have many optional fields, nested structures, or immutable products that must be fully specified at creation time.',
    whenToUse: [
      'Object creation involves many optional parameters—report filters, export formats, retention policies, notification channels.',
      'You want to avoid telescoping constructors (Constructor(a), Constructor(a,b), Constructor(a,b,c)...).',
      'The product should be immutable once built, but assembly requires multiple steps with intermediate validation.',
      'Different representations share the same construction algorithm—e.g., HTML vs PDF report from the same builder pipeline.',
      'Step order matters: parse → validate → enrich → persist, and you want each step explicit in code.',
    ],
    whenToAvoid: [
      'The object has two or three required fields—a plain constructor or dataclass is simpler.',
      'Every client builds objects identically—a factory method or static creator may suffice without a full builder hierarchy.',
      'You need runtime polymorphism on construction steps themselves—consider a pipeline or strategy instead.',
    ],
    example:
      'Ordering a custom laptop is like a builder: you pick CPU, RAM, storage, and warranty one choice at a time, and the factory only ships when the configuration is complete and valid. In code, `StringBuilder` in Java and `HttpRequest.Builder` in Java 11 let you fluently chain options before calling `build()`. Protobuf and OpenAPI code generators emit builders for messages with dozens of optional fields. Lombok\'s `@Builder` on a `Report` class is a classic interview example—title, date range, grouping, and export format set independently, then `build()` returns an immutable report config.',
    keyInsight:
      'Builder trades extra classes for readability and safety at construction time. The fluent interface (method chaining) is idiomatic but optional—the pattern is about stepwise assembly, not syntax sugar.',
    commonMistakes: [
      'Forgetting to return `this` from setter methods, breaking fluent chaining.',
      'Building mutable products—callers can still corrupt state after `build()` defeats the purpose.',
      'Duplicating validation in both builder and product constructor instead of validating once in `build()`.',
      'Adding a Director when no fixed build sequence exists—unnecessary abstraction.',
    ],
    interviewTips: [
      'Fluent interface (method chaining) is common but not required—separate `setX` + `build()` still counts.',
      'Director class is optional: use it when build steps are fixed (e.g., meal combo vs à la carte).',
      'Compare to Factory: factory chooses type; builder assembles one type with many configurations.',
      'Compare to telescoping constructors and Java records—when immutability + few fields, record wins.',
      'Follow-up: "How do you enforce required fields?" — constructor in private product, validate in build(), or staged builders.',
      'Whiteboard: Product, Builder, optional Director; show `new PizzaBuilder().size(L).topping("pepperoni").build()`.',
      'Mention `build()` returning immutable copy—especially for collections (`list.copy()` in Python).',
    ],
  },
  {
    slug: 'factory',
    name: 'Factory',
    category: 'Creational',
    intent:
      'Define an interface for creating an object while letting subclasses or a central creator decide which concrete type to instantiate. Client code depends on abstractions (`PaymentProcessor`) instead of concrete classes (`StripeProcessor`), so adding a new provider does not require editing checkout logic. The pattern encapsulates the `new` keyword and construction rules in one place—mapping strings, enums, or config to the right implementation. It is the foundation for plugin architectures, multi-tenant SaaS, and any system where product choice depends on runtime input.',
    whenToUse: [
      'Client code should depend on interfaces, not concrete implementations—checkout should not know about Stripe vs PayPal.',
      'Product choice depends on runtime input: payment method, file extension, cloud region, or feature flag.',
      'Construction logic is non-trivial—reading config, validating license, or wiring dependencies before returning the product.',
      'You want a registry or map of type name → constructor for extensibility without modifying existing switch statements.',
      'Unit tests need to swap real implementations for mocks at the factory boundary.',
    ],
    whenToAvoid: [
      'Only one implementation will ever exist—a direct `new Concrete()` is clearer than a factory abstraction.',
      'The "factory" becomes a 500-line god switch that knows every subsystem—split by domain or use Abstract Factory for families.',
      'Object creation is trivial and stable—YAGNI applies.',
    ],
    example:
      'A vending machine is a factory: you press "B3" and it dispenses the right snack without you knowing which warehouse shelf it came from. In software, `PaymentProcessorFactory.create("stripe")` returns `CardProcessor` or `UPIProcessor` based on checkout method while the order flow stays unchanged. JDBC\'s `DriverManager.getConnection()` is a factory over database drivers. Python\'s `json.loads` vs `yaml.safe_load` could sit behind a `SerializerFactory` keyed by file extension. Spring\'s `@Bean` methods are factory methods managed by the container.',
    keyInsight:
      'Know the trio: Simple Factory (one static method), Factory Method (subclass overrides creation), Abstract Factory (families). Interviewers often ask you to distinguish them—Factory Method creates one product; Abstract Factory creates compatible sets.',
    commonMistakes: [
      'Confusing Simple Factory with Factory Method pattern—naming a class `XFactory` does not automatically mean GoF Factory Method.',
      'Letting clients pass raw strings without validation—`create("unknown")` should fail fast with clear errors.',
      'Factory that imports every concrete class creates tight coupling—use registration or reflection sparingly and document extension points.',
      'Creating a new factory for every class instead of grouping related products.',
    ],
    interviewTips: [
      'Simple Factory vs Factory Method vs Abstract Factory—draw a table with one product vs product family.',
      'Factory centralizes creation; clients stay decoupled from concrete classes (OCP in action).',
      'Map/registry pattern scales: `processors = {"stripe": StripeProcessor, "paypal": PayPalProcessor}`.',
      'Follow-up: "Where does dependency injection fit?" — DI container is an advanced factory with lifecycle management.',
      'Compare with Builder: factory picks which class; builder configures one class.',
      'Whiteboard: Client → Factory → Interface ← ConcreteA, ConcreteB; hide `new` behind one method.',
      'Mention Open/Closed Principle: add new processor by registering, not editing checkout code.',
    ],
  },
  {
    slug: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    intent:
      'Provide an interface for creating families of related or dependent objects without specifying their concrete classes. When you switch from a dark theme to a light theme, every widget—buttons, checkboxes, scrollbars—must match; Abstract Factory guarantees that compatibility. It sits above Factory Method: instead of one `createButton()`, you have `createButton()`, `createCheckbox()`, and `createDialog()` that all belong to the same family. The client works with `UIFactory` and never mixes iOS buttons with Android checkboxes.',
    whenToUse: [
      'You need multiple related objects that must work as a consistent family—UI theme, regional tax rules, or platform-specific SDK bundles.',
      'You want to switch entire product families at runtime or deployment time without touching client code.',
      'Products in a family are designed to be used together—mixing incompatible implementations would break invariants.',
      'You are building a cross-platform toolkit (desktop/mobile/web) where each platform supplies a full widget set.',
      'Configuration drives which family is active—`theme=dark` loads `DarkThemeFactory` for all UI creation.',
    ],
    whenToAvoid: [
      'You only create one type of object—use Factory Method or Simple Factory instead.',
      'Product families change rarely but new product types are added often—every new type touches all concrete factories (pain point).',
      'Families share 90% of code—composition or strategy within one factory may be simpler.',
    ],
    example:
      'Furnishing a room in matching styles is an Abstract Factory: you pick "Modern" and get a sofa, lamp, and table that coordinate; switch to "Victorian" and the whole set changes together—you never mix a modern lamp with a Victorian sofa. In software, Qt and Swing use abstract factories for look-and-feel (Metal vs Nimbus). AWS SDK clients grouped by region partition could be seen as families. A cross-platform app uses `WidgetFactory` to create matching `Button`, `Checkbox`, and `Dropdown` for iOS, Android, or Web—`DarkThemeFactory` vs `LightThemeFactory` ensures visual consistency.',
    keyInsight:
      'Abstract Factory is about family consistency, not single-object creation. The cost is rigidity: adding a new product type (e.g., `createSlider()`) requires updating every concrete factory in the family.',
    commonMistakes: [
      'Using Abstract Factory when only one product type varies—over-engineering.',
      'Clients reaching through the factory to grab concrete types, breaking the abstraction.',
      'Forgetting that adding a new product interface forces N factory implementations to change.',
      'Confusing with Builder—builder assembles one object; abstract factory creates many related types.',
    ],
    interviewTips: [
      'Creates families of related products—not just one object per factory method call.',
      'Adding a new product type touches every concrete factory—state this trade-off proactively.',
      'Contrast with Factory Method: one product per hierarchy vs coordinated product sets.',
      'Contrast with Builder: builder = one complex object; abstract factory = many simple related objects.',
      'Follow-up: "How would you add a new theme?" — new `CosmicThemeFactory` implementing all create methods.',
      'Whiteboard: AbstractFactory interface with 3 create methods; two concrete factories side by side.',
      'Real systems: Java AWT `Toolkit`, .NET `DbProviderFactory` for database families.',
    ],
  },
  {
    slug: 'object-pool',
    name: 'Object Pool',
    category: 'Creational',
    intent:
      'Reuse a bounded set of expensive-to-create objects by leasing them to clients and reclaiming them when done, instead of allocating and garbage-collecting on every request. Database connections, threads, and socket handles are classic examples—creating them involves syscalls, authentication, and memory setup that dominates latency on hot paths. The pool caps resource usage so a traffic spike cannot exhaust file descriptors or DB connection limits. Effective pools also validate objects on checkout and discard stale ones.',
    whenToUse: [
      'Creating or destroying objects is costly—DB connections, prepared threads, gRPC channels, large byte buffers.',
      'Resource count must be bounded to protect the system—max 50 DB connections regardless of concurrent requests.',
      'Objects are stateless or can be reset cheaply between uses—connections cleared, buffers zeroed.',
      'Latency-sensitive paths benefit from warm, pre-initialized objects ready at acquire time.',
      'The underlying resource is finite—OS thread limit, connection pool quota from cloud provider.',
    ],
    whenToAvoid: [
      'Objects are cheap to create (plain POJOs)—pooling adds complexity without benefit.',
      'Each object carries request-specific state that is hard to reset—risk of data leaking between tenants.',
      'Pool sizing and leak detection are not operational priorities—unbounded `new` may be fine at current scale.',
    ],
    example:
      'A car rental fleet is an object pool: the company owns 200 cars (bounded pool), you rent one for a trip (acquire), and return it at the end (release)—you do not manufacture a new car per customer. HikariCP and Apache DBCP pool JDBC connections; Tomcat and Netty pool thread buffers. An API gateway might pool outbound HTTP clients to downstream microservices, borrowing a connection per request and returning it after the response. Game engines pool particle objects and bullet instances to avoid GC spikes during combat.',
    keyInsight:
      'Pooling trades memory and operational complexity for predictable latency. Always discuss pool size, timeout, health checks, and leak detection—interviewers want production awareness, not just the class diagram.',
    commonMistakes: [
      'Forgetting to release objects back to the pool—slow leak until pool exhaustion and deadlock.',
      'Returning broken connections without validation—next client gets SQLException.',
      'Pool size set too small (constant waiting) or too large (overwhelming downstream DB).',
      'Pooling mutable objects without a rigorous reset protocol between checkouts.',
    ],
    interviewTips: [
      'Pool size, acquire timeout, and idle eviction are production tuning knobs—mention them unprompted.',
      'Compare to thread pools (ExecutorService) and connection pools (HikariCP)—same pattern, different resource.',
      'Contrast with Flyweight: pool reuses expensive instances; flyweight shares immutable intrinsic state.',
      'Follow-up: "What if pool is exhausted?" — block with timeout, fail fast, or elastic pool with limits.',
      'Whiteboard: Pool box with available/in-use queues; acquire pops, release pushes.',
      'Discuss object reset vs immutable pooled wrappers—clear state in `release()`.',
      'Mention monitoring: metrics for pool wait time, active count, and leaked acquisitions.',
    ],
  },
  {
    slug: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    intent:
      'Create new objects by cloning an existing prototype instance rather than building from scratch through constructors. When initialization requires parsing templates, loading defaults from disk, or complex graph wiring, cloning a pre-configured prototype is faster and less error-prone than repeating setup code. The pattern also decouples clients from concrete classes—they request a clone by registry key without knowing whether the underlying template is an invoice, contract, or resume. Clone semantics (deep vs shallow) are the critical design decision.',
    whenToUse: [
      'Initial object creation has heavy setup—loading schema, default sections, or baseline configuration from files.',
      'You need many similar instances with small variations—documents, game enemies, UI form templates.',
      'Subclass proliferation would explode (InvoiceA, InvoiceB, InvoiceC...) when variants differ only slightly.',
      'Runtime decides which prototype to clone—registry maps `"invoice"` → prototype instance.',
      'You want to hide concrete classes from clients who only need a copy operation.',
    ],
    whenToAvoid: [
      'Objects are cheap to construct with simple constructors—cloning adds indirection.',
      'Object graphs contain shared mutable references and deep copy is expensive or ambiguous.',
      'Java\'s `Cloneable` marker interface feels awkward—copy constructors or factory methods may be cleaner.',
    ],
    example:
      'Photocopying a filled form template is prototype: the secretary keeps a master "Expense Report" with standard fields; each employee gets a copy and only fills in their name and amounts. A document editor stores prototypes for invoice, contract, and resume—`newDoc = template.clone()` then customize client-specific metadata. JavaScript\'s object spread and Python\'s `copy.deepcopy` are everyday prototype mechanics. Spring\'s `@Scope("prototype")` creates a new bean instance per injection point by cloning the definition. Game dev spawns enemies by cloning a prefab with tweaked HP and speed.',
    keyInsight:
      'Prototype is about copy-as-creation. Always clarify deep vs shallow copy in interviews—shallow copy shares nested mutable objects and causes subtle bugs when one clone mutates shared state.',
    commonMistakes: [
      'Shallow copy when nested collections must be independent—clone A mutates list visible in clone B.',
      'Using Java Cloneable without understanding protected Object.clone() contract—prefer copy constructor.',
      'Prototype registry that never unregisters stale templates—memory leak of unused prototypes.',
      'Cloning objects with open resources (file handles, sockets) without reopening in the clone.',
    ],
    interviewTips: [
      'Deep vs shallow copy—always clarify; draw nested object graph with shared vs duplicated references.',
      'Java Cloneable is awkward; copy constructor or static `copyOf()` factory is often cleaner.',
      'Registry of prototypes: `prototypes["invoice"].clone()` without knowing concrete class.',
      'Contrast with Factory: factory builds new; prototype copies existing template.',
      'Follow-up: "How do you clone cyclic graphs?" — mention serialization trick or custom traversal.',
      'Whiteboard: Prototype interface with `clone()`; Client → Registry → clone.',
      'Python: `copy.copy` vs `copy.deepcopy`; dataclasses need explicit handling for nested mutables.',
    ],
  },
  {
    slug: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    intent:
      'Attach additional responsibilities to an object dynamically by wrapping it with decorator objects that share the same interface. Instead of subclassing `BufferedInputStream`, `GZIPInputStream`, and `CipherInputStream` into an explosion of combinations, you stack wrappers at runtime. Each decorator delegates to the inner object and adds one concern—compression, encryption, caching, metrics—keeping classes single-purpose. Clients interact with the outermost wrapper transparently; they cannot tell whether they hold a bare object or a five-layer stack.',
    whenToUse: [
      'You want optional features composable at runtime—caching, compression, retry, audit logging per tenant or request.',
      'Subclass explosion would occur: N base types × M features = unmaintainable inheritance tree.',
      'Features can be layered independently—encryption does not require knowing about compression.',
      'You need to add behavior without modifying the original class source (third-party or sealed class).',
      'Different clients need different feature stacks on the same core service.',
    ],
    whenToAvoid: [
      'Feature combinations are fixed and small—a few subclasses may be simpler than wrapper stacks.',
      'Order of wrappers does not matter but debugging a deep stack becomes operational pain—consider middleware pipeline.',
      'You need to restrict access or lazy-load—the Proxy pattern\'s intent fits better.',
    ],
    example:
      'Adding toppings to coffee is the classic decorator analogy: start with espresso, wrap with milk (+$0.50), wrap with whipped cream (+$0.70)—each wrapper implements the same "beverage" interface and delegates inward. Java I/O streams are the textbook system example: `new BufferedInputStream(new GZIPInputStream(new FileInputStream("data.gz")))`. Spring\'s `@Cacheable` and HTTP middleware stacks (auth → rate limit → logging) follow the same shape. A file storage client wrapped with encryption, compression, and audit decorators lets each SaaS tenant enable features via configuration without forking core storage code.',
    keyInsight:
      'Decorator and Proxy share structure (wrapper + same interface) but differ in intent: decorator adds responsibilities; proxy controls access. Interviewers love this comparison—lead with intent, not UML shape.',
    commonMistakes: [
      'Decorator that changes the interface contract—breaks transparency and Liskov substitution.',
      'Wrong wrapper order—decrypt must run before decompress; order matters for correctness.',
      'Confusing with Composite—composite models tree structure; decorator is a linear chain of one object.',
      'Creating a god decorator that does caching + logging + retry—split into single-responsibility wrappers.',
    ],
    interviewTips: [
      'Same interface as wrapped object—transparent to client; draw concentric wrappers.',
      'Contrast with Composite (tree/part-whole) and Proxy (access control, lazy load).',
      'Java I/O streams: `BufferedReader(new InputStreamReader(new FileInputStream(...)))`—memorize this.',
      'Contrast with subclassing: decorator composes at runtime; inheritance is compile-time fixed.',
      'Follow-up: "Decorator vs Chain of Responsibility?" — decorator wraps one call; chain passes request along handlers.',
      'Whiteboard: Component interface, ConcreteComponent, Decorator base holding Component reference.',
      'Mention `@functools.wraps` in Python when decorating functions preserves metadata.',
    ],
  },
  {
    slug: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    intent:
      'Provide a placeholder or surrogate that controls access to another object while exposing the same interface as the real subject. The client calls `image.display()` on a proxy that may lazy-load the file, check permissions, cache results, or forward RPC to a remote server—all without changing client code. Proxy adds indirection deliberately: to defer expensive work, enforce security, or hide network latency. Unlike decorator (which stacks features), proxy usually wraps one subject and focuses on access management.',
    whenToUse: [
      'Lazy initialization—load heavy image, document, or graph only when first accessed (virtual proxy).',
      'Access control—check user permissions before delegating to real repository (protection proxy).',
      'Remote invocation—local stub forwards to object on another machine (remote proxy / RPC stub).',
      'Caching or deduplication—return cached result if fresh, else delegate (smart reference).',
      'Logging, metrics, or transaction boundaries around sensitive operations without polluting domain code.',
    ],
    whenToAvoid: [
      'You need to stack many independent behaviors—Decorator composes features more naturally.',
      'The indirection hides latency without caching—users see slow every call with no benefit.',
      'Simple DI and AOP frameworks already solve cross-cutting concerns—manual proxy may duplicate framework.',
    ],
    example:
      'A personal assistant who screens your calls is a protection proxy: callers talk to the assistant (same "contact" interface), but only VIP calls reach you—the assistant enforces access rules. A virtual proxy loads a high-res photo only when you scroll it into view—Instagram and Google Maps use similar lazy-loading proxies. Spring AOP creates runtime proxies for `@Transactional` beans. gRPC and Java RMI stubs are remote proxies: local object forwards method calls over the network. A `DocumentProxy` checks RBAC before read/write on the real document repository.',
    keyInsight:
      'Proxy vs Decorator: same structure, different purpose. Proxy controls who/when/how the subject is reached; decorator adds what happens during the call. Say this explicitly in every proxy interview.',
    commonMistakes: [
      'Proxy that exposes a different interface than the subject—clients cannot substitute transparently.',
      'Virtual proxy without thread-safe lazy init—double creation under concurrent first access.',
      'Remote proxy without timeout/retry—appears as hung client with no feedback.',
      'Using proxy for every cross-cutting concern when AOP or middleware is cleaner.',
    ],
    interviewTips: [
      'Know variants: virtual (lazy), protection (auth), remote (RPC), smart reference (cache/ref counting).',
      'Same interface as real subject—client should not distinguish proxy from real object.',
      'Spring AOP JDK dynamic proxy vs CGLIB—concrete class needs subclass proxy.',
      'Contrast with Decorator: proxy manages access; decorator adds behavior layers.',
      'Follow-up: "How does lazy loading work in Hibernate?" — persistence proxy until field access.',
      'Whiteboard: Client → Proxy → RealSubject; list checks proxy performs before delegate.',
      'Mention JDK `Proxy.newProxyInstance` for interface-based runtime proxies in Java.',
    ],
  },
  {
    slug: 'composite',
    name: 'Composite',
    category: 'Structural',
    intent:
      'Compose objects into tree structures to represent part-whole hierarchies, letting clients treat individual objects and groups uniformly. A folder and a file both implement `getSize()`—the folder sums its children recursively without the caller knowing whether the node is a leaf or container. The pattern eliminates type-checking spaghetti (`if folder else file`) for operations that should apply recursively across the tree. It models domains where nesting is natural: filesystems, org charts, UI component trees, and menu systems.',
    whenToUse: [
      'Domain forms a tree—folders/files, org departments/employees, menu categories/items, scene graphs.',
      'Clients run the same operation on leaves and containers—calculate size, render, export, permission check.',
      'You want to add new component types without changing tree traversal algorithms.',
      'Recursive structure depth varies—uniform interface hides nesting complexity from callers.',
      'Batch operations on subtrees—"delete folder" cascades to all children via composite.',
    ],
    whenToAvoid: [
      'You need to restrict which children a node can hold—uniform interface makes enforcing constraints awkward (files cannot contain folders in some systems).',
      'Operations differ radically between leaf and composite—type checks creep back in, defeating the pattern.',
      'Flat lists suffice—tree abstraction adds unnecessary Component/Leaf/Composite classes.',
    ],
    example:
      'A corporate org chart treats a single employee and an entire department uniformly for "headcount" queries: ask any node `getHeadcount()` and composites sum their children while leaves return 1. A cloud file browser models `File` and `Directory` as `Node`—size and permission checks recurse only when the node is a directory. React\'s component tree is composite-like: `<div>` contains `<span>` and `<ul>`; rendering walks the tree uniformly. Java\'s `Container` and `Component` in AWT/Swing follow classic Composite—add child widgets to panels.',
    keyInsight:
      'Child management methods (`add`, `remove`) belong on the Composite class, not the shared Component interface—leaves should not expose meaningless add-child operations (or they no-op / throw).',
    commonMistakes: [
      'Putting `add()`/`remove()` on the leaf interface—forces File to implement invalid operations.',
      'Composite that allows cycles—infinite recursion on traverse unless cycle detection exists.',
      'Leaking concrete types in traversal—`if isinstance(node, Folder)` breaks uniform treatment.',
      'O(n) operations on deep trees without caching aggregated values (e.g., folder size).',
    ],
    interviewTips: [
      '"Uniform interface for leaf and composite"—memorize this phrase; it is the pattern\'s essence.',
      'Child management on Composite only—not on Component interface shared with leaves.',
      'Related to composition relationship (PART-OF) in UML and OOP—contrast with aggregation.',
      'Contrast with Decorator: composite is tree; decorator is linear wrapper chain.',
      'Follow-up: "How do you iterate all files?" — external iterator or visitor over composite tree.',
      'Whiteboard: Component interface; Leaf and Composite both implement; Composite holds children list.',
      'Mention transparent vs safe composite: transparent exposes add on all nodes; safe restricts to Composite.',
    ],
  },
  {
    slug: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    intent:
      'Convert the interface of an existing class into one that clients expect, enabling collaboration between incompatible components without modifying their source code. The adapter sits between your domain (`PaymentProcessor.pay(amount)`) and a third-party SDK (`StripeSDK.charge(cents, currency)`), translating parameters, error types, and async models. It is essential in integration layers where legacy systems, vendor APIs, and internal contracts never align perfectly. Adapters are often thin but high-value— they isolate upstream API churn from core business logic.',
    whenToUse: [
      'Integrating legacy or third-party APIs whose interfaces do not match your domain abstractions.',
      'You cannot modify vendor or legacy source but must consume their functionality.',
      'Multiple external systems need normalization into one internal interface—shipping carriers, payment gateways, CRM exports.',
      'Gradual migration: wrap old module with adapter implementing new interface until rewrite completes.',
      'SDK uses different error handling, units (cents vs dollars), or sync/async model than your codebase.',
    ],
    whenToAvoid: [
      'You own both sides and can change the interface directly—fix the contract instead of adapting.',
      'The adapter becomes thicker than the subsystem it wraps—consider rewriting integration or using Facade for simplification.',
      'Multiple incompatible interfaces need a new unified design—not just one-off translation.',
    ],
    example:
      'A travel plug adapter lets your US charger work in a UK socket—the electricity (service) is the same, but the shape (interface) differs; the adapter translates without rewiring the hotel. An e-commerce `ShippingAdapter` wraps FedEx, DHL, and UPS rate APIs into one internal `ShippingProvider.getQuote(weight, zip)`. Android\'s `ListAdapter` bridges data models to ListView. JDBC-ODBC bridge historically adapted ODBC drivers to Java\'s JDBC interface. `StripePaymentAdapter` converts `pay(49.99)` to `stripe.charge(4999, "usd")`.',
    keyInsight:
      'Adapter fixes interface mismatch; Facade simplifies a complex subsystem. Adapter is two-way translation; Facade is one-way convenience wrapper—interviewers test this distinction constantly.',
    commonMistakes: [
      'Adapter that leaks vendor types through the adapted interface—callers still coupled to Stripe.',
      'Class adapter (multiple inheritance) in languages without MI—use object adapter (composition) instead.',
      'Adapter doing business logic beyond translation—validation belongs in domain, not adapter.',
      'One mega-adapter for all vendors instead of one adapter per vendor implementing common interface.',
    ],
    interviewTips: [
      'Object adapter (composition, holds adaptee) vs class adapter (inheritance)—prefer composition.',
      'Adapter vs Facade: adapter = interface conversion; facade = simplified entry to many classes.',
      'Adapter vs Bridge: adapter retrofits existing class; bridge designs separation upfront.',
      'Common in hexagonal architecture—ports and adapters (secondary/driven adapters).',
      'Follow-up: "Two-way adapter?" — rare; usually one direction from adaptee to target interface.',
      'Whiteboard: Client → Target interface ← Adapter → Adaptee (legacy SDK).',
      'Mention maintaining adapters when vendor API versions change—isolate breaking changes here.',
    ],
  },
  {
    slug: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    intent:
      'Decouple an abstraction from its implementation so both can vary independently through composition rather than inheritance. Without Bridge, you might subclass `RedCircle`, `BlueCircle`, `RedSquare`, `BlueSquare`—an N×M explosion. Bridge splits into two hierarchies (`Shape` and `ColorRenderer`) and composes them at runtime: `new Circle(new RedRenderer())`. Each dimension evolves separately—add new shapes without new color classes and vice versa. It is a deliberate upfront design for orthogonal variation axes.',
    whenToUse: [
      'Two dimensions vary independently—UI control type × rendering platform, notification type × delivery channel.',
      'You need to switch implementations at runtime without changing abstraction-facing client code.',
      'Inheritance would produce combinatorial subclass explosion (device × remote, document × exporter).',
      'Abstraction and implementation should be extensible by different teams or release cycles.',
      'You want to hide platform-specific code behind a stable API (cross-platform drivers).',
    ],
    whenToAvoid: [
      'Only one dimension varies—the extra implementor hierarchy adds needless indirection.',
      'Abstraction and implementation are tightly coupled by nature—forced separation obscures design.',
      'Simple strategy injection suffices without formal Bridge terminology.',
    ],
    example:
      'A TV remote (abstraction) and the device it controls (implementation) vary independently: `AdvancedRemote` and `BasicRemote` can operate either a `TV` or a `Radio` by holding a `Device` reference— you do not need `AdvancedRemoteForTV`, `BasicRemoteForRadio`, etc. JDBC separates SQL abstraction from database-specific drivers—you write standard SQL while the driver bridge handles MySQL vs Postgres. A notification system separates `Alert`/`Reminder` (abstraction) from `Email`/`SMS`/`Push` (implementation)—any alert type works with any channel.',
    keyInsight:
      'Bridge vs Strategy: both use composition; Bridge separates abstraction hierarchy from implementation hierarchy (often both have subclasses), while Strategy typically injects one algorithm into a context.',
    commonMistakes: [
      'Confusing Bridge with Adapter—Bridge is designed upfront; Adapter fixes existing mismatch.',
      'Creating bridge when only implementation varies—plain Strategy injection is enough.',
      'Abstraction that exposes implementor details—breaks encapsulation of the bridge.',
      'N×M subclasses anyway by putting variant logic in abstraction instead of delegating to implementor.',
    ],
    interviewTips: [
      'Split abstraction and implementation hierarchies—compose at runtime via reference field.',
      'Contrast with Adapter (retrofit) and Strategy (single algorithm swap).',
      'Avoid N×M subclass explosion—draw grid showing inheritance vs composition approach.',
      'Follow-up: "Bridge vs Strategy?" — Bridge often has parallel hierarchies; Strategy is one interface, many impls.',
      'Whiteboard: Abstraction has Implementor ref; RefinedAbstraction extends Abstraction.',
      'Real example: JDBC, SLF4J binding to Log4j/Logback.',
      'Mention driving side (abstraction) vs driven side (implementor) in hexagonal terms.',
    ],
  },
  {
    slug: 'facade',
    name: 'Facade',
    category: 'Structural',
    intent:
      'Provide a unified, high-level interface to a set of interfaces in a subsystem, reducing what clients must know to get work done. Subsystems often expose dozens of low-level classes—inventory, pricing, payment, shipping—and a facade orchestrates the common workflow (`placeOrder()`) behind one call. The facade does not add new capability; it simplifies access and defines the "happy path" entry point. Subsystem classes remain usable directly for advanced scenarios—the facade is optional convenience, not a wall.',
    whenToUse: [
      'Subsystem APIs are broad, low-level, or easy to misuse without strict ordering of calls.',
      'You want a clean entry point for common workflows—checkout, user onboarding, report generation.',
      'Multiple clients duplicate the same orchestration sequence—centralize in facade to DRY.',
      'You are layering architecture—presentation calls application facade, not domain internals directly.',
      'Legacy subsystem needs a modern API surface without rewriting internals.',
    ],
    whenToAvoid: [
      'Facade accumulates all business logic and becomes a god class—split by use case or domain service.',
      'Clients need fine-grained control over every subsystem step—facade hides necessary flexibility.',
      'You are converting interfaces (use Adapter) or adding features to one object (use Decorator).',
    ],
    example:
      'A hotel concierge is a facade: instead of you calling housekeeping, room service, and the spa separately, you ask the concierge to " arrange a relaxing evening"—they coordinate subsystems behind one request. A checkout `OrderFacade.placeOrder()` reserves inventory, applies pricing, charges payment, and dispatches shipping— the web controller makes one call. AWS SDK high-level clients (`s3.upload()`) facade over low-level HTTP signing and retry logic. Application services in DDD layered architecture are often facades over domain aggregates and infrastructure.',
    keyInsight:
      'Facade simplifies usage; it does not prevent access to subsystem classes. Unlike Adapter, it does not change interfaces—it wraps many existing calls into one coherent operation.',
    commonMistakes: [
      'Facade that grows into monolith containing all business rules—should orchestrate, not implement domain logic.',
      'Assuming facade replaces subsystem—advanced clients may still need direct subsystem APIs.',
      'Confusing with Adapter—facade does not translate incompatible interfaces.',
      'No error aggregation—facade calls five services and first failure leaves inconsistent partial state.',
    ],
    interviewTips: [
      'Simplifies usage—does not add new subsystem capability; names the subsystems it coordinates.',
      'Subsystem classes remain accessible; facade is optional convenience layer.',
      'Application services in layered architecture are often facades over domain + infrastructure.',
      'Contrast with Adapter (interface mismatch) and Mediator (peer coordination vs one-way entry).',
      'Follow-up: "Facade vs API Gateway?" — gateway is network-level facade for microservices.',
      'Whiteboard: Client → Facade → [SubsystemA, SubsystemB, SubsystemC].',
      'Discuss transaction/saga orchestration in facade for multi-step workflows.',
    ],
  },
  {
    slug: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    intent:
      'Use sharing to support large numbers of fine-grained objects efficiently by separating intrinsic (shared) state from extrinsic (context-specific) state. Intrinsic state—character glyphs, tree textures, icon SVGs—lives once in a factory cache; extrinsic state—position, color override, user ID—is passed in at use time. The pattern reduces memory from O(n × full object) toward O(shared types + n × pointer). It is essential when simulations, editors, or maps instantiate millions of similar objects.',
    whenToUse: [
      'Application creates huge numbers of similar objects—map markers, text characters, game particles, UI cells.',
      'Significant state is identical across instances and can be shared immutably after creation.',
      'Extrinsic state can be computed or passed externally without storing per-object copies.',
      'Memory profiling shows object overhead dominates—flyweight targets metadata duplication, not business data.',
      'Object identity does not matter—two "Oak tree" flyweights at different coordinates are interchangeable types.',
    ],
    whenToAvoid: [
      'Most state is extrinsic and unique per instance—sharing buys nothing.',
      'Thread safety of shared mutable flyweights would require locking on every access.',
      'Code clarity suffers more than memory saved—premature optimization at small scale.',
    ],
    example:
      'Sheet music shares one copy of each note symbol (intrinsic: shape, duration) while each performance passes extrinsic data (pitch, volume, timing)—millions of notes on a page do not store duplicate SVG for every "quarter note." A map renderer shares `TreeType` flyweights (name, texture, color) across thousands of map markers while each marker passes coordinates at draw time. Java\'s `Integer.valueOf()` caches small integers. Text editors store one glyph object per character code and position instances separately. Game engines pool mesh and material flyweights for repeated props.',
    keyInsight:
      'Flyweight factory + cache is the usual implementation. You must articulate intrinsic vs extrinsic state clearly—interviewers often ask you to classify fields of a `Character` object in a document editor.',
    commonMistakes: [
      'Sharing mutable intrinsic state—one caller mutates glyph cache affecting all documents.',
      'Storing extrinsic state inside flyweight—defeats memory savings and causes bugs.',
      'Flyweight without factory—clients create duplicates of supposedly shared objects.',
      'Applying flyweight when n is small—complexity without measurable benefit.',
    ],
    interviewTips: [
      'Intrinsic (shared, immutable) vs extrinsic (passed in)—classify fields on whiteboard.',
      'Factory + cache (`Map<String, TreeType>`) implements flyweight pool.',
      'Used in game engines, text editors (glyph cache), and virtualized UI lists.',
      'Contrast with Object Pool: pool reuses mutable expensive instances; flyweight shares immutable state.',
      'Follow-up: "Thread safety?" — flyweights must be immutable or per-thread copies.',
      'Whiteboard: FlyweightFactory, Client passes extrinsic state to flyweight.operation(extrinsic).',
      'Mention Java String intern pool as related sharing concept.',
    ],
  },
  {
    slug: 'state',
    name: 'State',
    category: 'Behavioural',
    intent:
      'Allow an object to alter its behavior when its internal state changes by delegating operations to state-specific classes instead of sprawling conditional logic. The context holds a reference to the current state object; when a transition occurs (coin inserted, order shipped), it swaps the state reference and subsequent method calls behave differently. Each state class encapsulates what is allowed in that phase—`CancelledState` rejects payment while `PendingState` accepts it. The pattern localizes transition rules and makes lifecycle explicit in the type system.',
    whenToUse: [
      'Behavior changes significantly based on lifecycle state—order (draft → paid → shipped), ticket (open → in progress → closed).',
      'Growing switch/if chains keyed by enum status values clutter the context class.',
      'Transitions have rules—only `PackedState` may transition to `ShippedState`.',
      'Each state exposes different allowed operations—cancel allowed in Created, forbidden in Delivered.',
      'You want state-specific logic testable in isolation without mocking entire context.',
    ],
    whenToAvoid: [
      'Only two states with trivial differences—a boolean flag may suffice.',
      'States differ only in data values, not behavior—state pattern adds class overhead without polymorphism benefit.',
      'Transition graph is enormous and changes weekly—configuration-driven state machine may fit better.',
    ],
    example:
      'A vending machine behaves differently when idle vs when it has a coin vs when dispensing—pressing "select product" means nothing when idle but dispenses when coin is inserted; each mode is a state object the machine delegates to. TCP connection states (LISTEN, ESTABLISHED, CLOSED) change how the stack handles packets. Document workflow in Jira: Draft allows edit, Approved allows publish only, Published allows archive. An delivery app order uses `Created`, `Packed`, `Shipped`, `Delivered` states controlling cancel, refund, and track actions.',
    keyInsight:
      'State vs Strategy: both delegate to interchangeable objects, but State transitions are often internal and lifecycle-driven; Strategy is chosen externally and swapped for algorithm variation.',
    commonMistakes: [
      'States that know too much about all other states—transition matrix becomes tangled web.',
      'Context exposing setters that bypass state transition rules—invalid states reachable.',
      'Using State for simple flag checks—over-engineering a two-value enum.',
      'Confusing with Strategy—mention lifecycle vs algorithm selection explicitly.',
    ],
    interviewTips: [
      'Replaces state switch statements with polymorphism—draw before/after if-else vs state classes.',
      'Context holds current state; states may initiate transitions via context.setState().',
      'Contrast with Strategy: state changes internally on events; strategy chosen by client/config.',
      'Follow-up: "Who owns transitions?" — state objects, context, or transition table—justify choice.',
      'Whiteboard: Context, State interface, ConcreteStates, transition arrows labeled with events.',
      'Mention finite state machines (FSM)—State pattern is OOP encoding of FSM.',
      'Compare to enum + switch in Java 17+ sealed types—when pattern match is enough.',
    ],
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    category: 'Behavioural',
    intent:
      'Define a family of algorithms, encapsulate each one behind a common interface, and make them interchangeable at runtime. The context class delegates work to a strategy object (`PricingStrategy`, `RoutingStrategy`) without containing algorithm details itself. Adding a new algorithm means a new strategy class—not editing the context (Open/Closed Principle). Clients or configuration select which strategy applies: surge pricing in NYC, flat airport rate in SF, promo code strategy during sales.',
    whenToUse: [
      'Multiple interchangeable algorithms for the same task—pricing, sorting, compression, route planning, fraud scoring.',
      'You want to add algorithms without modifying existing context code (OCP).',
      'Runtime selection based on config, user choice, or A/B test bucket.',
      'Algorithm variants are complex enough to deserve their own class—not one-liners.',
      'Unit tests need to inject mock or deterministic strategy implementations.',
    ],
    whenToAvoid: [
      'Only one algorithm exists and will never vary—inline logic is fine.',
      'Strategy selection requires deep context knowledge scattered across callers—centralize selection in factory first.',
      'Algorithms share 95% code—template method or parameterized function may reduce duplication.',
    ],
    example:
      'Navigation apps let you pick driving vs transit vs walking strategy—the map context asks the selected strategy for a route without embedding every routing algorithm internally. A ride-hailing service switches fare calculation: standard meter, airport flat rate, or promo discount based on city and surge rules via injected strategy. Java\'s `Comparator` is Strategy for sort order. Payment checkout selects `CreditCardPayment` vs `UpiPayment` strategy at runtime. AWS Auto Scaling policies are strategies for capacity adjustment.',
    keyInsight:
      'Strategy vs State: Strategy is externally selected and swapped for behavior variation; State represents lifecycle phase with transitions often triggered by domain events. Same structure, different intent—always explain both in comparison questions.',
    commonMistakes: [
      'Context that still branches on strategy type—defeats polymorphism (`if strategy instanceof ...`).',
      'Strategy objects holding mutable shared state—race conditions across requests.',
      'Creating strategy per request when stateless strategies could be singletons.',
      'Confusing with Factory—factory creates objects; strategy encapsulates behavior.',
    ],
    interviewTips: [
      'Strategy vs State — strategy chosen by client/config; state transitions on domain events internally.',
      'Core OCP example—inject interface, swap implementation without editing context.',
      'Map of strategy name → instance: `{"surge": SurgePricing, "flat": FlatPricing}`.',
      'Follow-up: "Strategy vs if-else?" — when >3 variants or algorithms grow, extract strategy.',
      'Whiteboard: Context has Strategy field; delegate method calls to strategy.',
      'Mention functional approach—pass callable/lambda as strategy in Python/Java.',
      'Compare with Template Method: strategy uses composition; template uses inheritance for skeleton.',
    ],
  },
  {
    slug: 'observer',
    name: 'Observer',
    category: 'Behavioural',
    intent:
      'Define a one-to-many dependency so when one object (subject/publisher) changes state, all registered dependents (observers/subscribers) are notified and updated automatically. The subject does not need to know concrete observer classes—only that they implement `update()`. This decouples event producers from consumers: order service publishes "OrderPlaced" without importing email, analytics, and inventory modules. The pattern underpins reactive UI, pub/sub messaging, and domain event architectures.',
    whenToUse: [
      'Multiple components must react to the same domain event—email, analytics, cache invalidation, search index update on order placed.',
      'You want runtime subscribe/unsubscribe—UI listeners, websocket fan-out, feature toggles.',
      'Publisher should not depend on concrete subscribers—loose coupling across bounded contexts.',
      'One state change triggers cascading updates across subsystems without orchestrator knowing all handlers.',
      'Building reactive UI where model changes propagate to views automatically.',
    ],
    whenToAvoid: [
      'Notification order matters and must be strict—observer order is often undefined unless explicitly sequenced.',
      'Observers perform heavy synchronous work—blocks publisher; use async event bus instead.',
      'Debugging "who reacted to this event?" becomes nightmare without observability—consider explicit workflow.',
    ],
    example:
      'News subscribers (observers) sign up with a newspaper (subject); when a breaking story publishes, every subscriber gets notified without the paper knowing each reader personally. When an order is placed, the order service publishes an event observed by inventory (reserve stock), notification (send email), and loyalty (award points)—each handles side effects independently. React\'s `useState`/setState triggers re-render of subscribing components. JavaScript DOM event listeners are classic Observer. Kafka topics extend the pattern to distributed observers across services.',
    keyInsight:
      'Push vs pull: push sends full payload in update(); pull sends minimal notify and observers fetch details. Know trade-offs—push can over-send; pull can cause N+1 fetches.',
    commonMistakes: [
      'Observers modifying subject during notification—re-entrant update loops and ConcurrentModificationException.',
      'Memory leaks from forgotten unsubscribe—observers kept alive by subject references.',
      'Synchronous notification of slow observers—blocks publisher thread.',
      'Using deprecated Java Observable without thread-safe copy of observer list during iteration.',
    ],
    interviewTips: [
      'Push vs pull model—who fetches data on notify; give example of each.',
      'Java Observable/Observer deprecated since Java 9—prefer explicit listener lists or PropertyChangeSupport.',
      'Foundation for reactive UI (React, Vue) and event-driven microservices (Kafka, SNS).',
      'Contrast with Mediator: observer broadcast; mediator orchestrates directed peer communication.',
      'Follow-up: "Ordering guarantees?" — usually none; mention ordered event log if needed.',
      'Whiteboard: Subject with attach/detach/notify; Observer interface with update().',
      'Discuss async observer delivery—event bus, queue, outbox pattern for reliability.',
    ],
  },
  {
    slug: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioural',
    intent:
      'Pass a request along a chain of handler objects until one handles it or the chain ends. Each handler decides whether to process the request or forward to `next`. Senders do not know which handler will succeed—decoupling the request source from receivers. The pattern models pipelines where steps are optional, reorderable, or extensible: authentication, rate limiting, validation, logging before the controller. Handlers can also all run (middleware) vs first-match-wins (support tiers)—clarify variant in design.',
    whenToUse: [
      'Request processing needs sequential checks—auth → rate limit → schema validation → audit log → handler.',
      'Handlers should be added, removed, or reordered without changing caller or other handlers.',
      'Multiple objects may handle request but handler is not known upfront—support bot → L1 → L2 escalation.',
      'Each handler has single responsibility; chain composes cross-cutting pipeline.',
      'Framework middleware (Express, Spring Filter chain, servlet filters) models this pattern.',
    ],
    whenToAvoid: [
      'Exact handler is always known—direct call is simpler than chain indirection.',
      'Every handler must run—chain with early exit wrong model; use pipeline that always proceeds.',
      'Debugging production failures requires tracing distributed chain with no central log—add correlation IDs.',
    ],
    example:
      'Customer support escalation is a chain: chatbot tries first, passes billing issues to L1, complex cases to L2 engineer—each link handles or forwards. An HTTP request travels middleware: authenticate JWT, enforce rate limit, validate JSON schema, log request ID, then reach the business controller. Servlet FilterChain in Java EE and Express `app.use()` middleware stacks are canonical. Log4j appenders can chain filters. Java exception handling (try multiple catches) is conceptually similar—first matching handler wins.',
    keyInsight:
      'Clarify semantics in interviews: "first handler wins" vs "all handlers run"—middleware usually runs entire chain; support escalation stops at first success.',
    commonMistakes: [
      'Broken chain—forgetting to call `next()` in middleware skips downstream handlers silently.',
      'Handler doing too much—violates single responsibility, hard to reorder.',
      'No default handler when chain exhausts—request drops with no error response.',
      'Confusing with Decorator—decorator wraps same call; chain may not invoke all links.',
    ],
    interviewTips: [
      'Linked list of handlers—each decides handle or pass to next; draw arrows explicitly.',
      'Servlet filters, Express middleware, Spring Security filter chain—name real examples.',
      'Contrast with Composite (tree) and Decorator (wrap single object call stack).',
      'Follow-up: "Sync vs async chain?" — async middleware passes control via callback/next().',
      'Whiteboard: Handler base with setNext, handle method returns bool or calls next.',
      'Mention chain can be configured at runtime—plugin architecture for filters.',
      'Discuss short-circuit vs full pipeline—auth failure may abort vs logging always runs.',
    ],
  },
  {
    slug: 'template',
    name: 'Template Method',
    category: 'Behavioural',
    intent:
      'Define the skeleton of an algorithm in a base class template method while letting subclasses override specific steps without changing the overall structure. The base class calls abstract or hook methods in fixed order—`prepare()` runs boil → brew → pour → addCondiments—and subclasses customize brew and condiments only. The Hollywood Principle applies: "Don\'t call us, we\'ll call you"—subclasses do not drive flow, the template method does. It enforces invariant sequencing while allowing controlled variation points.',
    whenToUse: [
      'Multiple workflows share fixed high-level steps with variable details—import pipelines, test runners, build scripts.',
      'You must enforce step order—invariants like validate before persist cannot be skipped by subclasses.',
      'Duplicated algorithm structure across classes differs only in a few steps.',
      'Framework defines lifecycle hooks—JUnit `setUp/test/tearDown`, Servlet `doGet/doPost`.',
      'Hook methods (optional overrides with default no-op) allow extension without forcing all subclasses to implement.',
    ],
    whenToAvoid: [
      'Variation is in entire algorithm, not steps—Strategy composition is more flexible.',
      'Deep inheritance hierarchies become rigid—favor composition over template for maintainability.',
      'Only one implementation exists—abstract base class adds unnecessary complexity.',
    ],
    example:
      'Making coffee vs tea follows the same template: boil water → brew → pour in cup → add condiments—but coffee drips while tea steeps, and condiments differ. A data import framework defines `runImport()` as parse → validate → persist → notify; CSV and JSON importers override only parse and validate hooks. JUnit test lifecycle (`@BeforeEach`, test method, `@AfterEach`) is template method. Android Activity lifecycle callbacks (`onCreate`, `onStart`, `onResume`) follow template structure controlled by the framework.',
    keyInsight:
      'Template Method uses inheritance for algorithm skeleton; Strategy uses composition to swap whole algorithms. Interviewers often ask when to pick which—inheritance when steps are fixed, composition when entire algorithm varies.',
    commonMistakes: [
      'Template method not marked final—subclass overrides skeleton and breaks invariants.',
      'Too many abstract methods—subclasses forced to implement steps that do not apply.',
      'Using template when only one step varies—Strategy for that step is cleaner.',
      'Leaking subclass type in template method—breaks Liskov if base assumes concrete behavior.',
    ],
    interviewTips: [
      'Hollywood Principle — "Don\'t call us, we\'ll call you" — base drives flow, subclasses fill hooks.',
      'Mark template method `final` in Java to prevent overriding the skeleton.',
      'Contrast with Strategy: template = inheritance + partial steps; strategy = composition + whole algorithm.',
      'Hook methods: optional overrides with default empty implementation in base.',
      'Follow-up: "Template vs Builder?" — unrelated; template is behavior reuse, builder is construction.',
      'Whiteboard: AbstractClass.templateMethod() calling primitiveOps and hook methods.',
      'Real examples: HttpServlet service method, JUnit framework, Spring JdbcTemplate.',
    ],
  },
  {
    slug: 'iterator',
    name: 'Iterator',
    category: 'Behavioural',
    intent:
      'Provide a way to access elements of an aggregate object sequentially without exposing its internal representation. Clients depend on `Iterator` interface (`hasNext`, `next`) rather than whether data lives in an array, linked list, B-tree, or database cursor. Multiple iterators can traverse the same collection concurrently with independent position. The pattern separates collection storage from traversal logic—including filtered, reverse, or lazy iterators over virtual datasets.',
    whenToUse: [
      'Clients need uniform traversal over different collection structures—array, linked list, tree, graph adjacency.',
      'You want multiple simultaneous traversals or multiple traversal modes (forward, reverse, filtered) on same aggregate.',
      'Internal representation should stay hidden—database-backed collection should not leak SQL cursor details.',
      'Complex aggregates benefit from dedicated traversal algorithms—breadth-first vs depth-first tree iterators.',
      'Lazy iteration over large or infinite sequences—stream pagination, file line-by-line.',
    ],
    whenToAvoid: [
      'Simple foreach over built-in list suffices—custom iterator adds no value.',
      'Concurrent modification during iteration causes undefined behavior and fail-fast exceptions are unacceptable—use snapshot or concurrent collection.',
      'Random access by index is primary use case—iterator is sequential only (unless ListIterator).',
    ],
    example:
      'A TV remote\'s "next channel" button iterates through channels without you knowing if the TV stores them as an array or linked list—you get uniform next/prev regardless. Java\'s `java.util.Iterator` and Python\'s `__iter__`/`__next__` protocol hide internal structure. A social feed exposes `ChronologicalIterator` and `RelevanceIterator` over the same posts for different pagination modes. JDBC `ResultSet` acts as iterator over query rows. Git traverses commit history via iterator-like log commands.',
    keyInsight:
      'Internal vs external iterator: external (Java) client calls `next()`; internal (some collections) accepts visitor/callback. Python for-loops use external protocol; `.forEach()` pushes internal control.',
    commonMistakes: [
      'Iterator invalid after collection modification—fail-fast ConcurrentModificationException in Java.',
      'Custom iterator that exposes internal mutable structure—breaks encapsulation.',
      'Iterator holding database connection open for entire traversal—resource leak.',
      'Not implementing RemoveIterator semantics when removal during iteration is required.',
    ],
    interviewTips: [
      'Python `__iter__`/`__next__` and Java `Iterable`/`Iterator`—know built-ins before custom design.',
      'Fail-fast vs fail-safe iterators—ConcurrentModificationException vs snapshot copy.',
      'Internal vs external iterator—who controls traversal loop.',
      'Follow-up: "Iterator vs index loop?" — iterator hides structure; enables lazy and composite traversal.',
      'Whiteboard: Aggregate, Iterator interface, ConcreteIterator holding cursor index.',
      'Mention enhanced for-loop desugars to iterator in Java.',
      'Contrast with Visitor—iterator traverses; visitor performs operation on each element.',
    ],
  },
  {
    slug: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioural',
    intent:
      'Given a language or grammar, define a class representation for each grammar rule and an interpreter that evaluates sentence structures built from those classes. Each rule becomes a small class (`NumberExpr`, `AddExpr`) whose `interpret()` method computes a result—often forming a composite tree (AST). The pattern suits small, stable domain-specific languages where embedding a full parser generator is heavyweight. Rule engines, query filters, and permission expressions are practical domains.',
    whenToUse: [
      'You need to evaluate simple domain-specific expressions repeatedly—discount rules, filter queries, RBAC conditions.',
      'Grammar is stable, limited in scope, and unlikely to grow into a full programming language.',
      'Expressions map naturally to a tree (AST) built from composable node classes.',
      'End users or admins author rules as strings that you parse once and interpret many times.',
      'Embedding a full yacc/ANTLR pipeline is overkill for boolean logic and arithmetic.',
    ],
    whenToAvoid: [
      'Grammar is complex or evolving rapidly—parser generators (ANTLR, yacc) scale better.',
      'Performance critical hot path—interpreted tree walk slower than compiled bytecode.',
      'Many grammar rules would explode class count—maintainability suffers.',
    ],
    example:
      'Musical chord notation is interpreted: "Cmaj7" is not stored as one blob—the parser builds symbol tree (root C, quality maj, extension 7) and interpreter resolves to piano keys. A discount engine evaluates `LOYALTY && CART_TOTAL > 1000` via expression tree nodes (`AndExpr`, `CompareExpr`). Regex engines interpret pattern AST. SQL WHERE clauses in ORMs sometimes use interpreter over criteria objects. Spreadsheet formula engines (Excel) parse `=SUM(A1:A10)` into interpretable AST.',
    keyInsight:
      'Interpreter often combines with Composite—the expression tree IS a composite structure. Contrast with Visitor: interpreter evaluates; visitor adds operations without changing node classes.',
    commonMistakes: [
      'Hand-rolling parser for complex grammar—use ANTLR instead when rules exceed ~20 productions.',
      'No error handling for malformed expressions—silent wrong results vs clear parse errors.',
      'Re-parsing same expression string on every evaluation—parse once, interpret cached AST many times.',
      'Confusing Interpreter pattern with interpreter program (Python REPL)—pattern is OOP structure for grammar.',
    ],
    interviewTips: [
      'AST as composite of expression nodes—draw tree for `3 + 4 * 5`.',
      'Rare unless DSL or rule engine context—acknowledge when overkill.',
      'Contrast with Visitor: interpreter embeds eval in nodes; visitor externalizes operations.',
      'Follow-up: "Performance?" — compile AST to bytecode or cache results for hot expressions.',
      'Whiteboard: Expression interface with interpret(); terminal and nonterminal expressions.',
      'Mention SQL parsers, regex, config DSLs as real-world cousins.',
      'Discuss terminal vs nonterminal expressions in grammar terms.',
    ],
  },
  {
    slug: 'command',
    name: 'Command',
    category: 'Behavioural',
    intent:
      'Encapsulate a request as an object, letting you parameterize clients with different requests, queue operations, log invocations, and support undo. The invoker holds a command reference and calls `execute()` without knowing the receiver\'s details. Commands decouple who triggers an action from who performs it and what exactly happens—enabling audit trails, transactional macros, and job queues. Undo/redo stacks store inverse commands or memento snapshots of state before execution.',
    whenToUse: [
      'Requests must be queued, retried, scheduled, or executed asynchronously—job queues, task schedulers.',
      'You need undo/redo, audit log, or replay of user actions—editors, collaborative docs, admin bulk ops.',
      'Macro commands batch multiple operations into one undoable unit.',
      'Same invoker should trigger different operations via injected command objects—toolbar buttons, remote controls.',
      'CQRS write side treats commands as first-class messages (`PlaceOrderCommand`).',
    ],
    whenToAvoid: [
      'Simple synchronous method call with no undo, queue, or log requirements—direct call is clearer.',
      'Explosion of command classes for trivial one-liners—group related ops or use lambdas where undo not needed.',
      'Undo semantics impossible or too expensive to snapshot—command pattern cannot magic undo without design.',
    ],
    example:
      'A restaurant order slip is a command: the waiter (invoker) writes "burger, no onions" (command object) and the kitchen (receiver) executes it—the waiter does not cook. A text editor wraps insert/delete as commands with undo stacks—Ctrl+Z pops inverse operation. GUI frameworks map menu items to `Action` commands (Swing Action, WPF ICommand). Customer support bulk `AssignTicket` and `CloseTicket` commands enable audit trails and rollback. Celery/RQ job payloads are serialized command objects.',
    keyInsight:
      'Command + Memento is the classic undo pair: command executes change; memento captures state before execute for restore. Name Invoker, Command, Receiver roles clearly on whiteboard.',
    commonMistakes: [
      'Command with no receiver reference—logic duplicated inside command instead of delegating.',
      'Undo that is not inverse of execute—stack corruption after multiple undo/redo.',
      'Invoker coupled to concrete command types—defeats parameterization benefit.',
      'Forgetting idempotency for retried queued commands—double charge on retry.',
    ],
    interviewTips: [
      'Three roles: Invoker, Command (interface), Receiver — draw and label on whiteboard.',
      'Undo = inverse command or memento snapshot before execute.',
      'Used in job queues, CQRS, GUI Action frameworks, transactional outbox.',
      'Contrast with Strategy: command encapsulates request/event; strategy encapsulates algorithm.',
      'Follow-up: "Macro command?" — composite command executing child commands as one unit.',
      'Whiteboard: execute() delegates to receiver; undo() reverses or restores memento.',
      'Mention command serialization for offline/async—Kafka command topic.',
    ],
  },
  {
    slug: 'visitor',
    name: 'Visitor',
    category: 'Behavioural',
    intent:
      'Represent an operation to perform on elements of an object structure, letting you define new operations without changing element classes. Each element implements `accept(visitor)` which calls back `visitor.visitConcrete(this)`—double dispatch resolves the correct overload for element and visitor types. When the AST or document structure is stable but you frequently add analyses (type check, lint, compile, pretty-print), Visitor keeps node classes slim and operations pluggable.',
    whenToUse: [
      'Object structure (AST, document tree) is stable but new operations are added frequently.',
      'Operations cross-cut element hierarchy—type checking, optimization, code gen should not live in every node class.',
      'Multiple unrelated operations must apply to same structure without polluting domain classes.',
      'Compiler, linter, or serializer pipelines over fixed node types.',
      'You accept trade-off: new element type requires updating all visitors.',
    ],
    whenToAvoid: [
      'Element hierarchy changes often—every new node type breaks all visitors (opposite OCP problem).',
      'Only one or two operations exist—just add methods to element classes.',
      'Structure not composite-like—Visitor needs accept/visit double dispatch infrastructure.',
    ],
    example:
      'A building inspector (visitor) visits each room type (elements)—bedroom, kitchen, bathroom—each room calls `accept(inspector)` and the inspector runs specialized checks without the house adding inspection methods to every room class. A compiler AST uses visitors for type checking, dead code elimination, and bytecode generation—node classes (`IfStmt`, `WhileStmt`) stay unchanged while new passes add new visitor classes. ESLint rules traverse ESTree AST via visitor pattern. Shopping cart tax calculation visits `Book` vs `Electronics` with different rates in `TaxVisitor`.',
    keyInsight:
      'Double dispatch: `element.accept(visitor)` → `visitor.visitBook(this)`. Easy to add operations, hard to add element types—state this trade-off upfront in interviews.',
    commonMistakes: [
      'Visitor accessing private element fields without friend/accessor—breaks encapsulation awkwardly.',
      'Adding new element type without updating all visitors—compile errors or silent wrong visit method.',
      'Visitor with mutable state shared across traversal—race or incorrect results.',
      'Using Visitor when simple polymorphic method on element would suffice for one operation.',
    ],
    interviewTips: [
      'Double dispatch — element.accept(visitor) calls visitor.visitConcrete(this).',
      'Easy to add operations; hard to add new element types — opposite of Open/Closed ideal.',
      'Compiler ASTs, linters (ESLint), document export pipelines—classic use cases.',
      'Contrast with Interpreter: visitor externalizes ops; interpreter evaluates embedded in nodes.',
      'Follow-up: "Acyclic visitor / reflection?" — workarounds when element types grow.',
      'Whiteboard: Element hierarchy, Visitor interface with visit per concrete type, accept on each element.',
      'Mention FunctionVisitor vs OOP Visitor in modern compilers (LLVM, Clang).',
    ],
  },
  {
    slug: 'mediator',
    name: 'Mediator',
    category: 'Behavioural',
    intent:
      'Define an object that encapsulates how a set of objects interact, promoting loose coupling by preventing peers from referring to each other directly. Colleagues send events to the mediator; the mediator decides who should react—centralizing orchestration rules that would otherwise be a tangled web of bidirectional references. UI dialog wizards, air traffic control towers, and chat room servers are intuitive analogies. The pattern trades peer mesh complexity for mediator complexity.',
    whenToUse: [
      'Many peer objects interact in complex, changing ways—UI widgets, form fields, chat participants.',
      'Reusable components should not know about each other—only about mediator interface.',
      'Orchestration rules change frequently—update mediator without touching colleagues.',
      'Prevent N×N dependency mesh between components (every widget listening to every other widget).',
      'Event routing needs central policy—who gets notified when seat selection changes fare summary.',
    ],
    whenToAvoid: [
      'Only two objects interact—direct reference is simpler than introducing mediator.',
      'Mediator becomes god object with all business logic—split by bounded context or use event bus.',
      'Simple observer broadcast suffices—mediator adds directed orchestration you may not need.',
    ],
    example:
      'Air traffic control is a mediator: planes (colleagues) do not coordinate landings peer-to-peer—they request clearance from the tower (mediator), which sequences runway access. A flight booking UI mediator coordinates date picker, seat map, fare summary, and promo widget—each component notifies mediator on change; mediator updates others without direct cross-calls. Java Message Service topic subscribers sometimes use mediator-like hub. Chat room server relays messages instead of peer-to-peer mesh. MVC controller acts as mediator between view and model.',
    keyInsight:
      'Mediator vs Observer: Observer broadcasts state change to passive subscribers; Mediator actively orchestrates multi-party protocols and may suppress or transform events.',
    commonMistakes: [
      'Mediator that grows into monolith containing all domain logic—should coordinate, not implement everything.',
      'Colleagues holding mediator reference and calling each other anyway—bypass defeats pattern.',
      'Confusing with Facade—facade simplifies subsystem for outside client; mediator manages peer colleagues.',
      'Single global mediator for entire app—scope mediators per feature dialog or bounded context instead.',
    ],
    interviewTips: [
      'Colleagues talk only to mediator — draw star topology vs full mesh.',
      'Contrast with Observer: subject notifies many passively; mediator directs complex interaction protocols.',
      'Contrast with Facade: facade faces outward to simplify; mediator faces inward among peers.',
      'UI dialog wizards and form coordination are go-to whiteboard examples.',
      'Follow-up: "Mediator vs Event Bus?" — bus is generic pub/sub; mediator has domain-specific routing rules.',
      'Whiteboard: Mediator interface with notify(sender, event); Colleague classes register with mediator.',
      'Mention reducing N×N to N edges — quantitative coupling argument impresses interviewers.',
    ],
  },
  {
    slug: 'memento',
    name: 'Memento',
    category: 'Behavioural',
    intent:
      'Capture and externalize an object\'s internal state at a point in time so it can be restored later without violating encapsulation. The originator creates mementos containing snapshot data; the caretaker stores them but ideally cannot inspect or tamper with internals. Combined with Command pattern, mementos power undo stacks, checkpoints, and transactional rollback in editors, games, and configuration tools. The pattern balances snapshot fidelity against memory cost.',
    whenToUse: [
      'You need checkpointing, undo/redo, or rollback of complex object state—editors, drawing apps, game saves.',
      'State restoration must not expose internal representation details to caretaker/history manager.',
      'Incremental command undo is harder than full state snapshot—memento simplifies restore.',
      'Audit or time-travel debugging requires periodic snapshots of aggregate state.',
      'Transactional workflows need savepoint before risky operation.',
    ],
    whenToAvoid: [
      'State is huge and snapshots frequent—memory explosion; use incremental undo or event sourcing instead.',
      'Originator state trivial—store copy of one field without full memento ceremony.',
      'Encapsulation language features weak—caretaker can read memento internals anyway (pragmatic breach).',
    ],
    example:
      'Save points in a video game are mementos: the game (originator) serializes player health, inventory, and level progress into a save file (memento); the player (caretaker) stores saves on disk but the game engine controls what goes in and how to restore. A diagram editor stores mementos before each major edit—undo restores prior snapshot without exposing shape internals to the history manager. Git commits are coarse mementos of repository state. IDE local history uses memento-like snapshots for file rollback.',
    keyInsight:
      'Originator creates and restores mementos; caretaker only stores them. Memento should be opaque to caretaker—Java achieves this via package-private memento class or narrow restore API.',
    commonMistakes: [
      'Caretaker mutating memento contents—breaks restore integrity.',
      'Deep object graph snapshot without handling references—shallow copy restores inconsistent state.',
      'Unbounded undo stack of full snapshots—OOM in long editing sessions; limit depth or delta-encode.',
      'Memento holding reference to live originator—prevents GC and causes stale state bugs.',
    ],
    interviewTips: [
      'Three roles: Originator (create/restore), Memento (snapshot), Caretaker (stores, no peek).',
      'Pairs with Command for undo stacks — command executes; memento captures pre-state.',
      'Memento opacity — caretaker should not depend on snapshot internals.',
      'Follow-up: "Memento vs serialization?" — memento is behavioral snapshot for restore; serialization is persistence format.',
      'Whiteboard: originator.save() → memento; caretaker stack; originator.restore(memento).',
      'Discuss incremental vs full snapshot trade-offs for memory.',
      'Mention limited undo depth and coalescing consecutive typing into one memento.',
    ],
  },
  {
    slug: 'null-object',
    name: 'Null Object',
    category: 'Behavioural',
    intent:
      'Provide a do-nothing (or safe-default) implementation of an interface instead of using `null`, so client code avoids repetitive null checks while preserving polymorphism. `NullLogger.log()` intentionally no-ops; `NullCoupon.apply()` returns price unchanged—callers always invoke the same interface without `if (coupon != null)`. The pattern makes absent behavior explicit and testable rather than implicit in null pointer exceptions. It is a behavioral stand-in, not the absence of an object.',
    whenToUse: [
      'Optional collaborator has well-defined default behavior—no-op logger, zero discount coupon, guest user permissions.',
      'Client code would otherwise repeat `if (x != null) x.method()` at every call site.',
      'Polymorphism should work uniformly—strategy/listener slot always filled with real object implementing interface.',
      'Missing configuration should degrade gracefully with documented default, not crash on NPE.',
      'Composition over null: inject `NullObject` via DI when feature disabled.',
    ],
    whenToAvoid: [
      'Null means error or exceptional condition—masking with Null Object hides bugs (failed auth should not be NullUser with admin rights).',
      'Silent no-op makes misconfiguration invisible—log at debug or metric when Null Object active.',
      'Optional truly absent vs present-but-empty distinction matters—use Optional/Maybe for semantics.',
    ],
    example:
      'A company\'s "do nothing" intern who safely accepts tasks but performs no work lets teams skip "if we have an intern" checks—everyone assigns to intern or specialist uniformly. A billing service injects `NullCoupon` when no discount applies—price calculation always calls `coupon.apply(price)` without null guards. Java\'s `Collections.emptyList()` behaves as null object for read-only empty list. `NullLogger` in logging frameworks discards messages when logging disabled. HTTP 404 handler returning empty body vs null response stream.',
    keyInsight:
      'Null Object is a real object implementing the interface with intentional default behavior—not `null` and not Optional wrapper. Document when Null Object is active so silent misconfiguration does not go unnoticed.',
    commonMistakes: [
      'Null Object with dangerous defaults—NullAuth granting all permissions.',
      'Using Null Object when absence should throw—hides programming errors.',
      'Different null checks still sprinkled—pattern only helps when applied consistently at boundaries.',
      'Confusing with Optional/Maybe—Optional signals absence; Null Object replaces absence with behavior.',
    ],
    interviewTips: [
      'Null Object implements interface with no-op or identity behavior — not Java null reference.',
      'Contrast with Optional/Maybe — Optional wraps absence; Null Object eliminates null at call site.',
      'Contrast with Singleton — null object often stateless; many instances OK or single shared instance.',
      'Follow-up: "When is null better?" — when missing reference indicates error requiring fail-fast.',
      'Whiteboard: Client → Logger interface ← ConsoleLogger, NullLogger; client never null-checks.',
      'Mention logging to detect Null Object usage in misconfigured prod environments.',
      'Part of broader "Special Case Pattern" family (Null Case, Special Case Sheet in Fowler).',
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
