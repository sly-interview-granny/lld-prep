export const patternSnippets: Record<string, { codePython: string; codeJava: string }> = {
  singleton: {
    codePython: `class Logger:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def log(self, message: str) -> None:
        print(f"[LOG] {message}")


a = Logger()
b = Logger()
print(a is b)  # True
a.log("boot complete")`,
    codeJava: `class Logger {
    private static Logger instance;

    private Logger() {}

    public static Logger getInstance() {
        if (instance == null) {
            instance = new Logger();
        }
        return instance;
    }

    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

Logger a = Logger.getInstance();
Logger b = Logger.getInstance();
System.out.println(a == b);`,
  },
  builder: {
    codePython: `class Pizza:
    def __init__(self, size: str, crust: str, toppings: list[str]):
        self.size = size
        self.crust = crust
        self.toppings = toppings


class PizzaBuilder:
    def __init__(self):
        self._size = "medium"
        self._crust = "regular"
        self._toppings: list[str] = []

    def set_size(self, size: str):
        self._size = size
        return self

    def set_crust(self, crust: str):
        self._crust = crust
        return self

    def add_topping(self, topping: str):
        self._toppings.append(topping)
        return self

    def build(self) -> Pizza:
        return Pizza(self._size, self._crust, self._toppings.copy())


pizza = PizzaBuilder().set_size("large").set_crust("thin").add_topping("pepperoni").build()`,
    codeJava: `import java.util.ArrayList;
import java.util.List;

class Pizza {
    private final String size;
    private final String crust;
    private final List<String> toppings;

    public Pizza(String size, String crust, List<String> toppings) {
        this.size = size;
        this.crust = crust;
        this.toppings = toppings;
    }
}

class PizzaBuilder {
    private String size = "medium";
    private String crust = "regular";
    private final List<String> toppings = new ArrayList<>();

    public PizzaBuilder setSize(String size) { this.size = size; return this; }
    public PizzaBuilder setCrust(String crust) { this.crust = crust; return this; }
    public PizzaBuilder addTopping(String topping) { toppings.add(topping); return this; }
    public Pizza build() { return new Pizza(size, crust, new ArrayList<>(toppings)); }
}`,
  },
  factory: {
    codePython: `from abc import ABC, abstractmethod


class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount: float) -> None:
        pass


class StripeProcessor(PaymentProcessor):
    def charge(self, amount: float) -> None:
        print(f"Charged {amount} via Stripe")


class PayPalProcessor(PaymentProcessor):
    def charge(self, amount: float) -> None:
        print(f"Charged {amount} via PayPal")


class PaymentFactory:
    @staticmethod
    def create(provider: str) -> PaymentProcessor:
        if provider == "stripe":
            return StripeProcessor()
        if provider == "paypal":
            return PayPalProcessor()
        raise ValueError(f"Unknown provider: {provider}")


PaymentFactory.create("stripe").charge(99)`,
    codeJava: `interface PaymentProcessor {
    void charge(double amount);
}

class StripeProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("Charged " + amount + " via Stripe");
    }
}

class PayPalProcessor implements PaymentProcessor {
    public void charge(double amount) {
        System.out.println("Charged " + amount + " via PayPal");
    }
}

class PaymentFactory {
    public static PaymentProcessor create(String provider) {
        if ("stripe".equals(provider)) return new StripeProcessor();
        if ("paypal".equals(provider)) return new PayPalProcessor();
        throw new IllegalArgumentException("Unknown provider: " + provider);
    }
}`,
  },
  'abstract-factory': {
    codePython: `from abc import ABC, abstractmethod


class Button(ABC):
    @abstractmethod
    def render(self) -> str:
        pass


class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str:
        pass


class DarkButton(Button):
    def render(self) -> str: return "[Dark Button]"


class DarkCheckbox(Checkbox):
    def render(self) -> str: return "[Dark Checkbox]"


class LightButton(Button):
    def render(self) -> str: return "[Light Button]"


class LightCheckbox(Checkbox):
    def render(self) -> str: return "[Light Checkbox]"


class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: pass
    @abstractmethod
    def create_checkbox(self) -> Checkbox: pass


class DarkThemeFactory(UIFactory):
    def create_button(self) -> Button: return DarkButton()
    def create_checkbox(self) -> Checkbox: return DarkCheckbox()


class LightThemeFactory(UIFactory):
    def create_button(self) -> Button: return LightButton()
    def create_checkbox(self) -> Checkbox: return LightCheckbox()


def render_form(factory: UIFactory) -> None:
    print(factory.create_button().render())
    print(factory.create_checkbox().render())


render_form(DarkThemeFactory())`,
    codeJava: `interface Button { String render(); }
interface Checkbox { String render(); }

class DarkButton implements Button { public String render() { return "[Dark Button]"; } }
class DarkCheckbox implements Checkbox { public String render() { return "[Dark Checkbox]"; } }
class LightButton implements Button { public String render() { return "[Light Button]"; } }
class LightCheckbox implements Checkbox { public String render() { return "[Light Checkbox]"; } }

interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class DarkThemeFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

class LightThemeFactory implements UIFactory {
    public Button createButton() { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}`,
  },
  'object-pool': {
    codePython: `class Connection:
    def __init__(self, id_: int):
        self.id = id_

    def query(self, sql: str) -> str:
        return f"Conn#{self.id} ran: {sql}"


class ConnectionPool:
    def __init__(self, size: int):
        self.available = [Connection(i) for i in range(size)]
        self.in_use: set[Connection] = set()

    def acquire(self) -> Connection:
        if not self.available:
            raise RuntimeError("Pool exhausted")
        conn = self.available.pop()
        self.in_use.add(conn)
        return conn

    def release(self, conn: Connection) -> None:
        self.in_use.remove(conn)
        self.available.append(conn)


pool = ConnectionPool(3)
conn = pool.acquire()
print(conn.query("SELECT 1"))
pool.release(conn)`,
    codeJava: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.Set;

class Connection {
    private final int id;
    public Connection(int id) { this.id = id; }
    public String query(String sql) { return "Conn#" + id + " ran: " + sql; }
}

class ConnectionPool {
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
}`,
  },
  prototype: {
    codePython: `import copy


class Document:
    def __init__(self, title: str, sections: list[str], metadata: dict[str, str]):
        self.title = title
        self.sections = sections
        self.metadata = metadata

    def clone(self) -> "Document":
        return copy.deepcopy(self)


invoice_template = Document(
    "Invoice",
    ["Header", "Line Items", "Footer"],
    {"currency": "USD", "tax_rate": "0.08"},
)

invoice_for_acme = invoice_template.clone()
invoice_for_acme.metadata["client"] = "Acme Corp"
print(invoice_template.metadata.get("client"))  # None`,
    codeJava: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Document {
    private final String title;
    private final List<String> sections;
    private final Map<String, String> metadata;

    public Document(String title, List<String> sections, Map<String, String> metadata) {
        this.title = title;
        this.sections = sections;
        this.metadata = metadata;
    }

    public Document cloneDoc() {
        return new Document(title, new ArrayList<>(sections), new HashMap<>(metadata));
    }

    public Map<String, String> metadata() { return metadata; }
}`,
  },
  decorator: {
    codePython: `from abc import ABC, abstractmethod


class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float: pass
    @abstractmethod
    def description(self) -> str: pass


class Espresso(Coffee):
    def cost(self) -> float: return 2.0
    def description(self) -> str: return "Espresso"


class CoffeeDecorator(Coffee):
    def __init__(self, wrappee: Coffee):
        self.wrappee = wrappee

    def cost(self) -> float: return self.wrappee.cost()
    def description(self) -> str: return self.wrappee.description()


class MilkDecorator(CoffeeDecorator):
    def cost(self) -> float: return super().cost() + 0.5
    def description(self) -> str: return super().description() + ", milk"


class WhippedCreamDecorator(CoffeeDecorator):
    def cost(self) -> float: return super().cost() + 0.7
    def description(self) -> str: return super().description() + ", whipped cream"


order = WhippedCreamDecorator(MilkDecorator(Espresso()))
print(order.description(), order.cost())`,
    codeJava: `interface Coffee {
    double cost();
    String description();
}

class Espresso implements Coffee {
    public double cost() { return 2.0; }
    public String description() { return "Espresso"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee wrappee;
    protected CoffeeDecorator(Coffee wrappee) { this.wrappee = wrappee; }
    public double cost() { return wrappee.cost(); }
    public String description() { return wrappee.description(); }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee wrappee) { super(wrappee); }
    public double cost() { return super.cost() + 0.5; }
    public String description() { return super.description() + ", milk"; }
}

class WhippedCreamDecorator extends CoffeeDecorator {
    public WhippedCreamDecorator(Coffee wrappee) { super(wrappee); }
    public double cost() { return super.cost() + 0.7; }
    public String description() { return super.description() + ", whipped cream"; }
}`,
  },
  proxy: {
    codePython: `from abc import ABC, abstractmethod


class Image(ABC):
    @abstractmethod
    def display(self) -> None: pass


class RealImage(Image):
    def __init__(self, filename: str):
        self.filename = filename
        print(f"Loading {filename} from disk...")

    def display(self) -> None:
        print(f"Displaying {self.filename}")


class ImageProxy(Image):
    def __init__(self, filename: str):
        self.filename = filename
        self.real_image: RealImage | None = None

    def display(self) -> None:
        if self.real_image is None:
            self.real_image = RealImage(self.filename)
        self.real_image.display()`,
    codeJava: `interface Image {
    void display();
}

class RealImage implements Image {
    private final String filename;
    public RealImage(String filename) {
        this.filename = filename;
        System.out.println("Loading " + filename + " from disk...");
    }
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

class ImageProxy implements Image {
    private final String filename;
    private RealImage realImage;

    public ImageProxy(String filename) { this.filename = filename; }

    public void display() {
        if (realImage == null) realImage = new RealImage(filename);
        realImage.display();
    }
}`,
  },
  composite: {
    codePython: `from abc import ABC, abstractmethod


class FileSystemNode(ABC):
    @abstractmethod
    def get_name(self) -> str: pass
    @abstractmethod
    def get_size(self) -> int: pass


class File(FileSystemNode):
    def __init__(self, name: str, size: int):
        self.name, self.size = name, size
    def get_name(self) -> str: return self.name
    def get_size(self) -> int: return self.size


class Folder(FileSystemNode):
    def __init__(self, name: str):
        self.name = name
        self.children: list[FileSystemNode] = []
    def add(self, child: FileSystemNode) -> None: self.children.append(child)
    def get_name(self) -> str: return self.name
    def get_size(self) -> int: return sum(c.get_size() for c in self.children)`,
    codeJava: `import java.util.ArrayList;
import java.util.List;

interface FileSystemNode {
    String getName();
    int getSize();
}

class FileNode implements FileSystemNode {
    private final String name;
    private final int size;
    public FileNode(String name, int size) { this.name = name; this.size = size; }
    public String getName() { return name; }
    public int getSize() { return size; }
}

class Folder implements FileSystemNode {
    private final String name;
    private final List<FileSystemNode> children = new ArrayList<>();
    public Folder(String name) { this.name = name; }
    public void add(FileSystemNode child) { children.add(child); }
    public String getName() { return name; }
    public int getSize() { return children.stream().mapToInt(FileSystemNode::getSize).sum(); }
}`,
  },
  adapter: {
    codePython: `from abc import ABC, abstractmethod


class PaymentProcessor(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None: pass


class StripeSDK:
    def charge(self, cents: int, currency: str) -> None:
        print(f"Stripe charged {cents} {currency}")


class StripePaymentAdapter(PaymentProcessor):
    def __init__(self, stripe: StripeSDK):
        self.stripe = stripe

    def pay(self, amount: float) -> None:
        self.stripe.charge(round(amount * 100), "usd")


def checkout(processor: PaymentProcessor, total: float) -> None:
    processor.pay(total)


checkout(StripePaymentAdapter(StripeSDK()), 49.99)`,
    codeJava: `interface PaymentProcessor {
    void pay(double amount);
}

class StripeSDK {
    public void charge(int cents, String currency) {
        System.out.println("Stripe charged " + cents + " " + currency);
    }
}

class StripePaymentAdapter implements PaymentProcessor {
    private final StripeSDK stripe;
    public StripePaymentAdapter(StripeSDK stripe) { this.stripe = stripe; }

    public void pay(double amount) {
        stripe.charge((int) Math.round(amount * 100), "usd");
    }
}

class Checkout {
    public static void run(PaymentProcessor processor, double total) {
        processor.pay(total);
    }
}`,
  },
  bridge: {
    codePython: `from abc import ABC, abstractmethod


class Device(ABC):
    @abstractmethod
    def turn_on(self) -> None: pass
    @abstractmethod
    def turn_off(self) -> None: pass


class TV(Device):
    def turn_on(self) -> None: print("TV on")
    def turn_off(self) -> None: print("TV off")


class Radio(Device):
    def turn_on(self) -> None: print("Radio on")
    def turn_off(self) -> None: print("Radio off")


class RemoteControl:
    def __init__(self, device: Device):
        self.device = device

    def toggle_power(self) -> None:
        self.device.turn_on()


class BasicRemote(RemoteControl):
    pass


class AdvancedRemote(RemoteControl):
    def mute(self) -> None:
        print("Muted")


AdvancedRemote(TV()).toggle_power()
BasicRemote(Radio()).toggle_power()`,
    codeJava: `interface Device {
    void turnOn();
    void turnOff();
}

class TV implements Device {
    public void turnOn() { System.out.println("TV on"); }
    public void turnOff() { System.out.println("TV off"); }
}

class Radio implements Device {
    public void turnOn() { System.out.println("Radio on"); }
    public void turnOff() { System.out.println("Radio off"); }
}

abstract class RemoteControl {
    protected final Device device;
    protected RemoteControl(Device device) { this.device = device; }
    public void togglePower() { device.turnOn(); }
}

class AdvancedRemote extends RemoteControl {
    public AdvancedRemote(Device device) { super(device); }
    public void mute() { System.out.println("Muted"); }
}`,
  },
  facade: {
    codePython: `class Inventory:
    def reserve(self, sku: str) -> None:
        print(f"Reserved {sku}")


class Payment:
    def charge(self, amount: float) -> None:
        print(f"Charged {amount}")


class Shipping:
    def dispatch(self, address: str) -> None:
        print(f"Shipped to {address}")


class OrderFacade:
    def __init__(self):
        self.inventory = Inventory()
        self.payment = Payment()
        self.shipping = Shipping()

    def place_order(self, sku: str, amount: float, address: str) -> None:
        self.inventory.reserve(sku)
        self.payment.charge(amount)
        self.shipping.dispatch(address)
        print("Order complete")`,
    codeJava: `class Inventory {
    public void reserve(String sku) { System.out.println("Reserved " + sku); }
}

class Payment {
    public void charge(double amount) { System.out.println("Charged " + amount); }
}

class Shipping {
    public void dispatch(String address) { System.out.println("Shipped to " + address); }
}

class OrderFacade {
    private final Inventory inventory = new Inventory();
    private final Payment payment = new Payment();
    private final Shipping shipping = new Shipping();

    public void placeOrder(String sku, double amount, String address) {
        inventory.reserve(sku);
        payment.charge(amount);
        shipping.dispatch(address);
        System.out.println("Order complete");
    }
}`,
  },
  flyweight: {
    codePython: `class TreeType:
    def __init__(self, name: str, color: str, texture: str):
        self.name = name
        self.color = color
        self.texture = texture

    def draw(self, x: int, y: int) -> None:
        print(f"Draw {self.name} at ({x},{y})")


class TreeFactory:
    def __init__(self):
        self.pool: dict[str, TreeType] = {}

    def get_tree_type(self, name: str, color: str, texture: str) -> TreeType:
        key = f"{name}-{color}-{texture}"
        if key not in self.pool:
            self.pool[key] = TreeType(name, color, texture)
        return self.pool[key]


class Tree:
    def __init__(self, tree_type: TreeType, x: int, y: int):
        self.tree_type, self.x, self.y = tree_type, x, y
    def draw(self) -> None: self.tree_type.draw(self.x, self.y)`,
    codeJava: `import java.util.HashMap;
import java.util.Map;

class TreeType {
    private final String name;
    private final String color;
    private final String texture;
    public TreeType(String name, String color, String texture) {
        this.name = name; this.color = color; this.texture = texture;
    }
    public void draw(int x, int y) {
        System.out.println("Draw " + name + " at (" + x + "," + y + ")");
    }
}

class TreeFactory {
    private final Map<String, TreeType> pool = new HashMap<>();
    public TreeType getTreeType(String name, String color, String texture) {
        String key = name + "-" + color + "-" + texture;
        return pool.computeIfAbsent(key, k -> new TreeType(name, color, texture));
    }
}`,
  },
  state: {
    codePython: `from abc import ABC, abstractmethod


class VendingState(ABC):
    @abstractmethod
    def insert_coin(self, ctx: "VendingMachine") -> None: pass
    @abstractmethod
    def select_product(self, ctx: "VendingMachine") -> None: pass


class IdleState(VendingState):
    def insert_coin(self, ctx: "VendingMachine") -> None:
        ctx.set_state(HasCoinState())
    def select_product(self, ctx: "VendingMachine") -> None:
        print("Insert a coin first")


class HasCoinState(VendingState):
    def insert_coin(self, ctx: "VendingMachine") -> None:
        print("Coin already inserted")
    def select_product(self, ctx: "VendingMachine") -> None:
        ctx.set_state(DispensingState())


class DispensingState(VendingState):
    def insert_coin(self, ctx: "VendingMachine") -> None: print("Wait")
    def select_product(self, ctx: "VendingMachine") -> None: print("Dispensing...")


class VendingMachine:
    def __init__(self):
        self.state: VendingState = IdleState()

    def set_state(self, state: VendingState) -> None:
        self.state = state

    def insert_coin(self) -> None:
        self.state.insert_coin(self)

    def select_product(self) -> None:
        self.state.select_product(self)


vm = VendingMachine()
vm.insert_coin()
vm.select_product()`,
    codeJava: `interface VendingState {
    void insertCoin(VendingMachine ctx);
    void selectProduct(VendingMachine ctx);
}

class IdleState implements VendingState {
    public void insertCoin(VendingMachine ctx) { ctx.setState(new HasCoinState()); }
    public void selectProduct(VendingMachine ctx) { System.out.println("Insert a coin first"); }
}

class HasCoinState implements VendingState {
    public void insertCoin(VendingMachine ctx) { System.out.println("Coin already inserted"); }
    public void selectProduct(VendingMachine ctx) { ctx.setState(new DispensingState()); }
}

class DispensingState implements VendingState {
    public void insertCoin(VendingMachine ctx) { System.out.println("Wait"); }
    public void selectProduct(VendingMachine ctx) { System.out.println("Dispensing..."); }
}

class VendingMachine {
    private VendingState state = new IdleState();
    public void setState(VendingState state) { this.state = state; }
}`,
  },
  strategy: {
    codePython: `from abc import ABC, abstractmethod


class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None: pass


class CreditCardPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Charged {amount} via credit card")


class UpiPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Charged {amount} via UPI")


class Checkout:
    def __init__(self, strategy: PaymentStrategy):
        self.strategy = strategy
    def set_strategy(self, strategy: PaymentStrategy) -> None:
        self.strategy = strategy
    def checkout(self, total: float) -> None:
        self.strategy.pay(total)`,
    codeJava: `interface PaymentStrategy {
    void pay(double amount);
}

class CreditCardPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Charged " + amount + " via credit card"); }
}

class UpiPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Charged " + amount + " via UPI"); }
}

class Checkout {
    private PaymentStrategy strategy;
    public Checkout(PaymentStrategy strategy) { this.strategy = strategy; }
    public void setStrategy(PaymentStrategy strategy) { this.strategy = strategy; }
    public void checkout(double total) { strategy.pay(total); }
}

Checkout checkout = new Checkout(new CreditCardPayment());
checkout.checkout(499);
checkout.setStrategy(new UpiPayment());
checkout.checkout(299);`,
  },
  observer: {
    codePython: `from abc import ABC, abstractmethod


class Observer(ABC):
    @abstractmethod
    def update(self, data: str) -> None: pass


class NewsAgency:
    def __init__(self):
        self.observers: list[Observer] = []

    def subscribe(self, o: Observer) -> None: self.observers.append(o)
    def unsubscribe(self, o: Observer) -> None: self.observers.remove(o)

    def publish(self, news: str) -> None:
        for observer in self.observers:
            observer.update(news)


class EmailAlert(Observer):
    def update(self, data: str) -> None: print(f"Email: {data}")


class PushAlert(Observer):
    def update(self, data: str) -> None: print(f"Push: {data}")`,
    codeJava: `import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(String data);
}

class NewsAgency {
    private final List<Observer> observers = new ArrayList<>();
    public void subscribe(Observer observer) { observers.add(observer); }
    public void unsubscribe(Observer observer) { observers.remove(observer); }
    public void publish(String news) {
        for (Observer observer : observers) observer.update(news);
    }
}

class EmailAlert implements Observer {
    public void update(String data) { System.out.println("Email: " + data); }
}

class PushAlert implements Observer {
    public void update(String data) { System.out.println("Push: " + data); }
}`,
  },
  'chain-of-responsibility': {
    codePython: `from abc import ABC, abstractmethod


class SupportHandler(ABC):
    def __init__(self):
        self.next_handler: "SupportHandler | None" = None

    def set_next(self, handler: "SupportHandler") -> "SupportHandler":
        self.next_handler = handler
        return handler

    def handle(self, ticket: str) -> str | None:
        result = self.try_handle(ticket)
        if result:
            return result
        if self.next_handler:
            return self.next_handler.handle(ticket)
        return None

    @abstractmethod
    def try_handle(self, ticket: str) -> str | None: pass


class BotHandler(SupportHandler):
    def try_handle(self, ticket: str) -> str | None:
        return "Bot: reset link sent" if "password reset" in ticket else None


class L1Handler(SupportHandler):
    def try_handle(self, ticket: str) -> str | None:
        return "L1: refund initiated" if "billing" in ticket else None


bot = BotHandler()
bot.set_next(L1Handler())
print(bot.handle("password reset"))
print(bot.handle("billing issue"))`,
    codeJava: `abstract class SupportHandler {
    private SupportHandler next;

    public SupportHandler setNext(SupportHandler handler) {
        this.next = handler;
        return handler;
    }

    public String handle(String ticket) {
        String result = tryHandle(ticket);
        if (result != null) return result;
        return next != null ? next.handle(ticket) : null;
    }

    protected abstract String tryHandle(String ticket);
}

class BotHandler extends SupportHandler {
    protected String tryHandle(String ticket) {
        return ticket.contains("password reset") ? "Bot: reset link sent" : null;
    }
}

class L1Handler extends SupportHandler {
    protected String tryHandle(String ticket) {
        return ticket.contains("billing") ? "L1: refund initiated" : null;
    }
}`,
  },
  template: {
    codePython: `from abc import ABC, abstractmethod


class BeverageMaker(ABC):
    def prepare(self) -> None:
        self.boil_water()
        self.brew()
        self.pour_in_cup()
        self.add_condiments()

    def boil_water(self) -> None: print("Boiling water")
    def pour_in_cup(self) -> None: print("Pouring into cup")

    @abstractmethod
    def brew(self) -> None: pass
    @abstractmethod
    def add_condiments(self) -> None: pass


class Coffee(BeverageMaker):
    def brew(self) -> None: print("Dripping coffee")
    def add_condiments(self) -> None: print("Adding sugar and milk")`,
    codeJava: `abstract class BeverageMaker {
    public final void prepare() {
        boilWater();
        brew();
        pourInCup();
        addCondiments();
    }

    private void boilWater() { System.out.println("Boiling water"); }
    private void pourInCup() { System.out.println("Pouring into cup"); }
    protected abstract void brew();
    protected abstract void addCondiments();
}

class Coffee extends BeverageMaker {
    protected void brew() { System.out.println("Dripping coffee"); }
    protected void addCondiments() { System.out.println("Adding sugar and milk"); }
}

class Tea extends BeverageMaker {
    protected void brew() { System.out.println("Steeping tea"); }
    protected void addCondiments() { System.out.println("Adding lemon"); }
}`,
  },
  iterator: {
    codePython: `class PlaylistIterator:
    def __init__(self, tracks: list[str]):
        self.tracks = tracks
        self.index = 0

    def has_next(self) -> bool:
        return self.index < len(self.tracks)

    def next(self) -> str:
        track = self.tracks[self.index]
        self.index += 1
        return track


class Playlist:
    def __init__(self, tracks: list[str]):
        self.tracks = tracks

    def create_iterator(self) -> PlaylistIterator:
        return PlaylistIterator(self.tracks)


it = Playlist(["Song A", "Song B", "Song C"]).create_iterator()
while it.has_next():
    print("Now playing:", it.next())`,
    codeJava: `interface Iterator<T> {
    boolean hasNext();
    T next();
}

class PlaylistIterator implements Iterator<String> {
    private final String[] tracks;
    private int index = 0;

    public PlaylistIterator(String[] tracks) { this.tracks = tracks; }
    public boolean hasNext() { return index < tracks.length; }
    public String next() { return tracks[index++]; }
}

class Playlist {
    private final String[] tracks;
    public Playlist(String[] tracks) { this.tracks = tracks; }
    public Iterator<String> createIterator() { return new PlaylistIterator(tracks); }
}`,
  },
  interpreter: {
    codePython: `from abc import ABC, abstractmethod


class Expression(ABC):
    @abstractmethod
    def interpret(self) -> int: pass


class NumberExpr(Expression):
    def __init__(self, value: int): self.value = value
    def interpret(self) -> int: return self.value


class AddExpr(Expression):
    def __init__(self, left: Expression, right: Expression):
        self.left, self.right = left, right
    def interpret(self) -> int: return self.left.interpret() + self.right.interpret()


class SubtractExpr(Expression):
    def __init__(self, left: Expression, right: Expression):
        self.left, self.right = left, right
    def interpret(self) -> int: return self.left.interpret() - self.right.interpret()`,
    codeJava: `interface Expression {
    int interpret();
}

class NumberExpr implements Expression {
    private final int value;
    public NumberExpr(int value) { this.value = value; }
    public int interpret() { return value; }
}

class AddExpr implements Expression {
    private final Expression left, right;
    public AddExpr(Expression left, Expression right) { this.left = left; this.right = right; }
    public int interpret() { return left.interpret() + right.interpret(); }
}

class SubtractExpr implements Expression {
    private final Expression left, right;
    public SubtractExpr(Expression left, Expression right) { this.left = left; this.right = right; }
    public int interpret() { return left.interpret() - right.interpret(); }
}`,
  },
  command: {
    codePython: `from abc import ABC, abstractmethod


class Command(ABC):
    @abstractmethod
    def execute(self) -> None: pass
    @abstractmethod
    def undo(self) -> None: pass


class TextEditor:
    def __init__(self):
        self.content = ""
    def insert(self, text: str) -> None: self.content += text
    def delete(self, count: int) -> None: self.content = self.content[:-count]


class InsertCommand(Command):
    def __init__(self, editor: TextEditor, text: str):
        self.editor, self.text = editor, text
    def execute(self) -> None: self.editor.insert(self.text)
    def undo(self) -> None: self.editor.delete(len(self.text))


class CommandHistory:
    def __init__(self):
        self.stack: list[Command] = []

    def run(self, cmd: Command) -> None:
        cmd.execute()
        self.stack.append(cmd)

    def undo(self) -> None:
        if self.stack:
            self.stack.pop().undo()


editor = TextEditor()
history = CommandHistory()
history.run(InsertCommand(editor, "Hello"))
history.run(InsertCommand(editor, " World"))
history.undo()
print(editor.content)`,
    codeJava: `interface Command {
    void execute();
    void undo();
}

class TextEditor {
    private String content = "";
    public void insert(String text) { content += text; }
    public void delete(int count) { content = content.substring(0, content.length() - count); }
    public String getContent() { return content; }
}

class InsertCommand implements Command {
    private final TextEditor editor;
    private final String text;
    public InsertCommand(TextEditor editor, String text) { this.editor = editor; this.text = text; }
    public void execute() { editor.insert(text); }
    public void undo() { editor.delete(text.length()); }
}

class CommandHistory {
    private final java.util.Stack<Command> stack = new java.util.Stack<>();
    public void run(Command command) { command.execute(); stack.push(command); }
    public void undo() { if (!stack.isEmpty()) stack.pop().undo(); }
}`,
  },
  visitor: {
    codePython: `from abc import ABC, abstractmethod


class CartVisitor(ABC):
    @abstractmethod
    def visit_book(self, item: "Book") -> float: pass
    @abstractmethod
    def visit_electronics(self, item: "Electronics") -> float: pass


class Book:
    def __init__(self, price: float): self.price = price
    def accept(self, visitor: CartVisitor) -> float: return visitor.visit_book(self)


class Electronics:
    def __init__(self, price: float): self.price = price
    def accept(self, visitor: CartVisitor) -> float: return visitor.visit_electronics(self)


class TaxVisitor(CartVisitor):
    def visit_book(self, item: Book) -> float: return item.price * 0.05
    def visit_electronics(self, item: Electronics) -> float: return item.price * 0.18`,
    codeJava: `interface CartVisitor {
    double visitBook(Book item);
    double visitElectronics(Electronics item);
}

class Book {
    public final double price;
    public Book(double price) { this.price = price; }
    public double accept(CartVisitor visitor) { return visitor.visitBook(this); }
}

class Electronics {
    public final double price;
    public Electronics(double price) { this.price = price; }
    public double accept(CartVisitor visitor) { return visitor.visitElectronics(this); }
}

class TaxVisitor implements CartVisitor {
    public double visitBook(Book item) { return item.price * 0.05; }
    public double visitElectronics(Electronics item) { return item.price * 0.18; }
}`,
  },
  mediator: {
    codePython: `from abc import ABC, abstractmethod


class Mediator(ABC):
    @abstractmethod
    def notify(self, sender: object, event: str) -> None: pass


class Tower(Mediator):
    def __init__(self):
        self.planes: list[Plane] = []

    def register(self, plane: "Plane") -> None:
        self.planes.append(plane)

    def notify(self, sender: object, event: str) -> None:
        if event == "land":
            print(f"Tower: clearing runway for {sender.call_sign}")
            for plane in self.planes:
                if plane is not sender:
                    plane.hold()


class Plane:
    def __init__(self, tower: Tower, call_sign: str):
        self.tower, self.call_sign = tower, call_sign
        self.tower.register(self)

    def request_land(self) -> None:
        self.tower.notify(self, "land")

    def hold(self) -> None:
        print(f"{self.call_sign} holding")


tower = Tower()
ai101 = Plane(tower, "AI101")
Plane(tower, "UA202")
ai101.request_land()`,
    codeJava: `interface Mediator {
    void notify(Object sender, String event);
}

class Tower implements Mediator {
    private final java.util.List<Plane> planes = new java.util.ArrayList<>();
    public void register(Plane plane) { planes.add(plane); }

    public void notify(Object sender, String event) {
        if ("land".equals(event)) {
            Plane landing = (Plane) sender;
            System.out.println("Tower: clearing runway for " + landing.callSign);
            for (Plane plane : planes) {
                if (plane != landing) plane.hold();
            }
        }
    }
}

class Plane {
    private final Tower tower;
    public final String callSign;
    public Plane(Tower tower, String callSign) { this.tower = tower; this.callSign = callSign; tower.register(this); }
    public void requestLand() { tower.notify(this, "land"); }
    public void hold() { System.out.println(callSign + " holding"); }
}`,
  },
  memento: {
    codePython: `class EditorMemento:
    def __init__(self, content: str):
        self.content = content


class Document:
    def __init__(self):
        self.content = ""

    def write(self, text: str) -> None:
        self.content += text

    def save(self) -> EditorMemento:
        return EditorMemento(self.content)

    def restore(self, memento: EditorMemento) -> None:
        self.content = memento.content


class History:
    def __init__(self):
        self.snapshots: list[EditorMemento] = []
    def push(self, m: EditorMemento) -> None: self.snapshots.append(m)
    def pop(self) -> EditorMemento | None: return self.snapshots.pop() if self.snapshots else None`,
    codeJava: `class EditorMemento {
    private final String content;
    public EditorMemento(String content) { this.content = content; }
    public String getContent() { return content; }
}

class Document {
    private String content = "";
    public void write(String text) { content += text; }
    public EditorMemento save() { return new EditorMemento(content); }
    public void restore(EditorMemento memento) { content = memento.getContent(); }
    public String getContent() { return content; }
}

class History {
    private final java.util.Stack<EditorMemento> snapshots = new java.util.Stack<>();
    public void push(EditorMemento m) { snapshots.push(m); }
    public EditorMemento pop() { return snapshots.isEmpty() ? null : snapshots.pop(); }
}`,
  },
  'null-object': {
    codePython: `from abc import ABC, abstractmethod


class Logger(ABC):
    @abstractmethod
    def log(self, message: str) -> None: pass


class ConsoleLogger(Logger):
    def log(self, message: str) -> None:
        print(message)


class NullLogger(Logger):
    def log(self, message: str) -> None:
        pass  # intentional no-op


class Service:
    def __init__(self, logger: Logger | None = None):
        self.logger = logger or NullLogger()

    def do_work(self) -> None:
        self.logger.log("Starting work")
        self.logger.log("Work complete")`,
    codeJava: `interface Logger {
    void log(String message);
}

class ConsoleLogger implements Logger {
    public void log(String message) { System.out.println(message); }
}

class NullLogger implements Logger {
    public void log(String message) { }
}

class Service {
    private final Logger logger;
    public Service(Logger logger) { this.logger = logger; }
    public Service() { this.logger = new NullLogger(); }

    public void doWork() {
        logger.log("Starting work");
        logger.log("Work complete");
    }
}`,
  },
};
