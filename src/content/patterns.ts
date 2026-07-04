import { patternSnippets } from './patternSnippets';

export type PatternCategory = 'Creational' | 'Structural' | 'Behavioural';

export interface Pattern {
  slug: string;
  name: string;
  category: PatternCategory;
  intent?: string;
  whenToUse?: string;
  example?: string;
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
      'Ensure a class has exactly one instance and provide a global access point to it. Use it to coordinate shared infrastructure state without passing the object through every layer.',
    whenToUse: `- You need one shared coordinator (e.g., config, logger, cache manager) across the app.
- Object creation is expensive and repeated instantiation risks inconsistency.
- Trade-off: introduces hidden global state, which can hurt testability and increase coupling.`,
    example:
      'In a notification service, a single configuration loader instance reads environment and feature flags once, then all channels (email, SMS, push) use that same configuration object.',
    interviewTips: [
      'Mention thread safety in Java (synchronized, enum singleton, holder idiom).',
      'Python: module-level object is often the idiomatic singleton.',
      'Trade global state vs testability — prefer DI when possible.',
    ],
  },
  {
    slug: 'builder',
    name: 'Builder',
    category: 'Creational',
    intent:
      'Separate construction of a complex object from its representation so the same creation process can produce different variants. It makes object creation readable when many optional fields or validation steps exist.',
    whenToUse: `- Object creation involves many optional parameters or step-by-step assembly.
- You want to avoid telescoping constructors and invalid intermediate states.
- Trade-off: adds extra classes/boilerplate for objects that are otherwise simple.`,
    example:
      'For an interview-ready `Report` object, a `ReportBuilder` sets title, filters, grouping, export format, and retention policy before producing an immutable report configuration.',
    interviewTips: [
      'Fluent interface (method chaining) is common but not required.',
      'Director class optional when build steps are fixed.',
      'Compare to telescoping constructors and factory for clarity.',
    ],
  },
  {
    slug: 'factory',
    name: 'Factory',
    category: 'Creational',
    intent:
      'Define an interface for creating an object while letting subclasses or a central creator decide which concrete type to instantiate. This removes direct `new` calls from business logic and improves extensibility.',
    whenToUse: `- Client code should depend on interfaces, not concrete implementations.
- Product choice depends on runtime input (type, config, region, feature flag).
- Trade-off: may hide simple creation behind unnecessary abstraction if only one implementation exists.`,
    example:
      'A payment module uses `PaymentProcessorFactory` to return `CardProcessor`, `UPIProcessor`, or `WalletProcessor` based on checkout method, while checkout flow remains unchanged.',
    interviewTips: [
      'Simple Factory vs Factory Method vs Abstract Factory — know the difference.',
      'Factory centralizes creation; clients stay decoupled from concrete classes.',
      'Map/registry pattern scales when many product types exist.',
    ],
  },
  {
    slug: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    intent:
      'Provide an interface for creating families of related or dependent objects without specifying their concrete classes. It guarantees compatible products are created together.',
    whenToUse: `- You need multiple related objects that must work as a family (theme, region, platform).
- You want to switch entire product families at runtime or deployment time.
- Trade-off: adding a new product type requires changes across all concrete factories.`,
    example:
      'A cross-platform UI toolkit uses `WidgetFactory` to create matching `Button`, `Checkbox`, and `Dropdown` objects for iOS, Android, or Web themes.',
    interviewTips: [
      'Creates families of related products — not just one object.',
      'Adding a new product type touches every concrete factory.',
      'Contrast with Factory Method (one product, one factory method).',
    ],
  },
  {
    slug: 'object-pool',
    name: 'Object Pool',
    category: 'Creational',
    intent:
      'Reuse a bounded set of expensive-to-create objects by leasing and returning them instead of repeatedly allocating new ones. It improves latency and protects finite resources.',
    whenToUse: `- Creating/tearing down objects is costly (DB connections, threads, sockets).
- Resource count must be controlled to avoid overload.
- Trade-off: requires lifecycle management (timeouts, leaks, stale object checks).`,
    example:
      'An API gateway maintains a pool of outbound HTTP client connections to downstream services, borrowing one per request and returning it after response.',
    interviewTips: [
      'Pool size, timeout, and health checks are production concerns.',
      'Similar to thread pools and DB connection pools (HikariCP).',
      'Trade memory/connections for latency on hot paths.',
    ],
  },
  {
    slug: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    intent:
      'Create new objects by cloning existing prototype instances instead of constructing from scratch. This is useful when setup is expensive or when object variations are derived from a baseline template.',
    whenToUse: `- Initial object creation has heavy setup and many defaults.
- You need many similar instances with small mutations.
- Trade-off: clone semantics are tricky; deep vs shallow copy bugs are common.`,
    example:
      'A document editor stores prototype templates for invoice, contract, and resume; creating a new document clones the template and customizes only user-specific fields.',
    interviewTips: [
      'Deep vs shallow copy — always clarify in interviews.',
      'Java Cloneable is awkward; copy constructor or factory is often cleaner.',
      'Registry of prototypes supports creating by key without knowing concrete class.',
    ],
  },
  {
    slug: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    intent:
      'Attach additional responsibilities to an object dynamically by wrapping it with objects that share the same interface. It provides flexible behavior composition without subclass explosion.',
    whenToUse: `- You want to add optional features (caching, compression, retry, metrics) per object at runtime.
- Multiple independent combinations of behavior are needed.
- Trade-off: many wrapper layers can make debugging call flow harder.`,
    example:
      'A file storage client is wrapped with decorators for encryption, compression, and audit logging so features can be enabled per tenant without changing core storage code.',
    interviewTips: [
      'Same interface as wrapped object — transparent to client.',
      'Contrast with Composite (tree structure) and Proxy (access control).',
      'Java I/O streams are the textbook example.',
    ],
  },
  {
    slug: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    intent:
      'Provide a placeholder or surrogate for another object to control access to it. The proxy keeps the same interface while adding concerns like lazy loading, access checks, or remote communication.',
    whenToUse: `- You need access control, lazy initialization, caching, or remote invocation behind a stable API.
- Direct access to the real subject is expensive or sensitive.
- Trade-off: extra indirection can hide latency and complicate tracing.`,
    example:
      'A document service exposes `DocumentProxy` that checks user permissions before delegating reads/writes to the real document repository object.',
    interviewTips: [
      'Virtual proxy (lazy), protection proxy, remote proxy — know variants.',
      'Same interface as real subject — client cannot tell the difference.',
      'Spring AOP and RPC stubs are real-world proxies.',
    ],
  },
  {
    slug: 'composite',
    name: 'Composite',
    category: 'Structural',
    intent:
      'Compose objects into tree structures to represent part-whole hierarchies and let clients treat individual objects and groups uniformly. It simplifies recursive operations over nested structures.',
    whenToUse: `- Domain naturally forms trees (folders/files, org charts, menu hierarchies).
- Clients should run the same operation on leaf and container nodes.
- Trade-off: enforcing child-related constraints can be harder with a uniform interface.`,
    example:
      'A cloud file browser treats both `File` and `Directory` as `Node`; size calculation and permission checks run uniformly and recurse only when node is a directory.',
    interviewTips: [
      'Uniform interface for leaf and composite — key interview phrase.',
      'Child management methods belong on Composite, not Component interface.',
      'Related to composition relationship (PART-OF).',
    ],
  },
  {
    slug: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    intent:
      'Convert the interface of an existing class into one that clients expect. Adapter allows incompatible components to collaborate without changing their source code.',
    whenToUse: `- Integrating legacy or third-party APIs with mismatched contracts.
- You want to shield core domain code from vendor-specific interfaces.
- Trade-off: adds a translation layer that must be maintained as upstream APIs evolve.`,
    example:
      'An e-commerce service uses a `ShippingAdapter` to normalize rate and tracking APIs from multiple courier partners into a single internal `ShippingProvider` interface.',
    interviewTips: [
      'Object adapter (composition) vs class adapter (inheritance).',
      'Different from Facade — adapter fixes interface mismatch, facade simplifies.',
      'Common in integration layers and legacy system wrappers.',
    ],
  },
  {
    slug: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    intent:
      'Decouple an abstraction from its implementation so both can vary independently. It avoids combinatorial subclass growth by composing abstraction and implementor at runtime.',
    whenToUse: `- You have two orthogonal dimensions that vary independently (type x platform).
- You need to switch implementations without changing abstraction-facing client code.
- Trade-off: introduces extra abstraction layers and upfront design effort.`,
    example:
      'A notification system separates `Notification` abstraction (Alert, Reminder) from `Channel` implementation (Email, SMS, Push), allowing any alert type to work with any channel.',
    interviewTips: [
      'Split abstraction and implementation hierarchies — compose at runtime.',
      'Contrast with Adapter (fix mismatch) and Strategy (swap algorithm).',
      'Avoid N×M subclass explosion.',
    ],
  },
  {
    slug: 'facade',
    name: 'Facade',
    category: 'Structural',
    intent:
      'Provide a unified, high-level interface to a set of interfaces in a subsystem. Facade reduces client complexity and isolates clients from subsystem wiring details.',
    whenToUse: `- Subsystem APIs are broad, low-level, or hard to use correctly.
- You want a clean entry point for common workflows.
- Trade-off: facade can become a god class if it accumulates too many responsibilities.`,
    example:
      'A checkout facade coordinates inventory reservation, pricing, payment authorization, and order creation behind one `placeOrder()` call for the web controller.',
    interviewTips: [
      'Simplifies usage — does not add new capability to subsystem.',
      'Subsystem classes remain accessible; facade is optional convenience.',
      'Application services in layered architecture are often facades.',
    ],
  },
  {
    slug: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    intent:
      'Use sharing to support large numbers of fine-grained objects efficiently by storing common intrinsic state once and externalizing variable extrinsic state. The goal is memory optimization at scale.',
    whenToUse: `- You create huge numbers of similar objects and memory pressure is high.
- Significant state is identical and can be shared safely.
- Trade-off: moving extrinsic state to callers increases API complexity and coordination.`,
    example:
      'A map renderer shares icon/style flyweights for thousands of markers while each marker passes extrinsic coordinates and label at render time.',
    interviewTips: [
      'Intrinsic vs extrinsic state — must articulate both.',
      'Factory + cache often implements flyweight pool.',
      'Used in game engines, text editors, and UI virtualized lists.',
    ],
  },
  {
    slug: 'state',
    name: 'State',
    category: 'Behavioural',
    intent:
      'Allow an object to alter its behavior when its internal state changes by delegating behavior to state-specific classes. This removes large conditional branches tied to lifecycle transitions.',
    whenToUse: `- Behavior changes significantly based on lifecycle state (draft, approved, cancelled).
- You have growing switch/if chains keyed by status values.
- Trade-off: increases class count and requires explicit transition governance.`,
    example:
      'An order in a delivery app uses states like `Created`, `Packed`, `Shipped`, and `Delivered`, each controlling allowed actions such as cancel, refund, or track.',
    interviewTips: [
      'Replaces state switch statements with polymorphism.',
      'Contrast with Strategy (interchangeable algorithms, not lifecycle).',
      'Context holds reference to current state; states may know transitions.',
    ],
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    category: 'Behavioural',
    intent:
      'Define a family of algorithms, encapsulate each one, and make them interchangeable behind a common interface. It lets clients select behavior without modifying the context class.',
    whenToUse: `- Multiple interchangeable algorithms exist for the same task (pricing, routing, ranking).
- You want to add new algorithms with minimal impact on existing code.
- Trade-off: clients/configuration must choose the right strategy, which adds orchestration complexity.`,
    example:
      'A ride-hailing service picks fare calculation strategy by city and surge rules, switching between standard, airport-flat, and promo strategies via configuration.',
    interviewTips: [
      'Strategy vs State — strategy is chosen by client; state transitions internally.',
      'Core OCP example — inject interface, swap implementation.',
      'Map of strategy name → instance is common in factories.',
    ],
  },
  {
    slug: 'observer',
    name: 'Observer',
    category: 'Behavioural',
    intent:
      'Define a one-to-many dependency so when one object changes state, all dependents are notified automatically. It decouples publishers from concrete subscribers.',
    whenToUse: `- Multiple components must react to domain events (email, analytics, cache invalidation).
- You want runtime subscription and loose coupling between producer and consumers.
- Trade-off: notification order, retries, and failure isolation add operational complexity.`,
    example:
      'When an order is placed, the order service publishes an event observed by inventory, notification, and loyalty services, each handling its own side effects independently.',
    interviewTips: [
      'Push vs pull model — who fetches data on notify.',
      'Java Observable/Observer deprecated; prefer explicit listener lists or event buses.',
      'Foundation for reactive UI and event-driven microservices.',
    ],
  },
  {
    slug: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioural',
    intent:
      'Pass a request along a chain of handlers until one handles it or the chain ends. It decouples request sender from receiver and allows dynamic composition of processing steps.',
    whenToUse: `- Request processing needs sequential checks or transformations (auth, validation, throttling).
- Handlers should be added/reordered without changing caller code.
- Trade-off: debugging can be harder because control flow is distributed across handlers.`,
    example:
      'An API request travels through middleware handlers for authentication, rate limiting, schema validation, and audit logging before reaching the business controller.',
    interviewTips: [
      'Linked list of handlers — each decides handle or pass.',
      'Servlet filters, middleware stacks, logging pipelines.',
      'Contrast with Composite (tree) and Decorator (wrap single call).',
    ],
  },
  {
    slug: 'template',
    name: 'Template',
    category: 'Behavioural',
    intent:
      'Define the skeleton of an algorithm in a base method while allowing subclasses to redefine specific steps. It enforces process order while enabling controlled customization points.',
    whenToUse: `- Multiple workflows share fixed high-level steps with variable details.
- You need to enforce sequencing and invariants in all variants.
- Trade-off: inheritance-based extension is less flexible than composition and can become rigid.`,
    example:
      'A data import framework defines `runImport()` as parse -> validate -> persist -> notify, while CSV and JSON importers override only parsing and validation hooks.',
    interviewTips: [
      'Hollywood Principle — "don\'t call us, we\'ll call you."',
      'final template method prevents overriding the skeleton.',
      'Contrast with Strategy (composition swaps whole algorithm).',
    ],
  },
  {
    slug: 'iterator',
    name: 'Iterator',
    category: 'Behavioural',
    intent:
      'Provide a way to access elements of an aggregate object sequentially without exposing its internal representation. Iterator separates traversal logic from collection implementation.',
    whenToUse: `- Clients need uniform traversal over different collection structures.
- You want multiple traversal modes (forward, reverse, filtered) without exposing internals.
- Trade-off: custom iterators add complexity and can become invalid under concurrent mutation.`,
    example:
      'A social feed service exposes iterators for chronological and relevance-sorted timelines so pagination logic is reusable regardless of underlying storage layout.',
    interviewTips: [
      'Python/Java built-in iterators — know when custom ones matter.',
      'Fail-fast vs fail-safe iterators in concurrent collections.',
      'Internal vs external iterator (who controls traversal).',
    ],
  },
  {
    slug: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioural',
    intent:
      'Given a language grammar, define a representation for its sentences and an interpreter that evaluates those representations. It is suitable for small DSLs and rule expressions.',
    whenToUse: `- You need to evaluate simple domain-specific expressions repeatedly.
- Grammar is stable and limited in scope.
- Trade-off: scaling to complex grammars can lead to many classes and poor performance versus parser generators.`,
    example:
      'A discount engine interprets expressions like `LOYALTY && CART_TOTAL > 1000` using an expression tree to decide eligibility during checkout.',
    interviewTips: [
      'Abstract syntax tree — composite of expression nodes.',
      'Rare in interviews unless DSL or rule engine context.',
      'Contrast with Visitor (operations on AST without changing nodes).',
    ],
  },
  {
    slug: 'command',
    name: 'Command',
    category: 'Behavioural',
    intent:
      'Encapsulate a request as an object, thereby parameterizing clients with different requests, queuing operations, and supporting undo/logging. It separates invoker from receiver logic.',
    whenToUse: `- Requests must be queued, retried, audited, or executed asynchronously.
- You need undo/redo or macro operations.
- Trade-off: introduces many command classes and lifecycle handling overhead.`,
    example:
      'A customer support tool wraps actions like `AssignTicket`, `CloseTicket`, and `AddTag` as commands, enabling audit trails and rollback for mistaken bulk updates.',
    interviewTips: [
      'Invoker, command, receiver — three roles to name clearly.',
      'Undo = inverse operation or memento snapshot.',
      'Used in job queues, CQRS, and GUI action frameworks.',
    ],
  },
  {
    slug: 'visitor',
    name: 'Visitor',
    category: 'Behavioural',
    intent:
      'Represent an operation to be performed on elements of an object structure, letting you define new operations without changing element classes. It relies on double dispatch for type-specific behavior.',
    whenToUse: `- Object structure is stable, but new cross-cutting operations are added frequently.
- You want to keep operation logic outside domain element classes.
- Trade-off: adding a new element type requires touching all visitors.`,
    example:
      'A compiler AST uses visitors for type checking, optimization, and code generation, each implemented independently while node classes stay unchanged.',
    interviewTips: [
      'Double dispatch — element.accept(visitor) calls visitor.visitConcrete(this).',
      'Easy to add operations; hard to add new element types.',
      'Compiler ASTs and linters are classic use cases.',
    ],
  },
  {
    slug: 'mediator',
    name: 'Mediator',
    category: 'Behavioural',
    intent:
      'Define an object that encapsulates how a set of objects interact, promoting loose coupling by preventing peer objects from referring to each other directly. The mediator centralizes coordination logic.',
    whenToUse: `- Many peer objects interact in complex, changing ways.
- You want to localize orchestration rules in one place.
- Trade-off: mediator can become complex and god-like if boundaries are not kept clear.`,
    example:
      'In a booking UI, a mediator coordinates date picker, seat map, fare summary, and promo widget so each component updates through mediator events instead of direct cross-calls.',
    interviewTips: [
      'Colleagues talk only to mediator — reduces coupling mesh.',
      'Contrast with Observer (subject notifies many) — mediator orchestrates.',
      'UI dialog wizards and event buses are common variants.',
    ],
  },
  {
    slug: 'memento',
    name: 'Memento',
    category: 'Behavioural',
    intent:
      'Capture and externalize an object\'s internal state so it can be restored later without violating encapsulation. It is a standard way to implement snapshots for rollback.',
    whenToUse: `- You need checkpointing, undo/redo, or rollback of complex state.
- State restoration should not expose internal details to external managers.
- Trade-off: storing many snapshots can consume memory and require compaction policies.`,
    example:
      'A diagram editor stores mementos before each major edit, allowing users to undo a sequence of operations without exposing shape internals to the history manager.',
    interviewTips: [
      'Originator creates/restores; caretaker stores mementos.',
      'Memento should be opaque — caretaker cannot read internals ideally.',
      'Pairs with Command pattern for undo stacks.',
    ],
  },
  {
    slug: 'null-object',
    name: 'Null Object',
    category: 'Behavioural',
    intent:
      'Provide a do-nothing implementation of an interface in place of `null` so clients can avoid repeated null checks. It preserves polymorphism and makes behavior explicit for missing cases.',
    whenToUse: `- Optional collaborator behavior should safely default without branching everywhere.
- You want to simplify client code by removing repetitive null guards.
- Trade-off: silent no-op behavior can mask configuration errors if not logged/observable.`,
    example:
      'A billing service injects `NullCoupon` when no discount is applied, so price calculation always calls `apply()` without null checks while keeping default behavior predictable.',
    interviewTips: [
      'Null Object is a real object implementing the interface — not null.',
      'Contrast with Optional/Maybe — still a valid behavioral pattern.',
      'Keep Null Object behavior documented so missing config is visible in logs if needed.',
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