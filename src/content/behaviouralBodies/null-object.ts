export const nullObjectBody = `The **Null Object Design Pattern** is a behavioral design pattern that provides a do-nothing or safe-default implementation of an interface instead of using \`null\`, so client code avoids repetitive null checks while preserving polymorphism.

Instead of \`if (logger != null) logger.log(...)\` scattered everywhere, you inject a \`NullLogger\` that intentionally no-ops.

---

### The Core Concept: "Always Have Someone to Call"

Imagine you are building a **Billing Service** for a subscription SaaS in India.

* Some tenants enable coupon discounts.
* Others run without any promotion configured.
* Price calculation must always call \`coupon.apply(price)\` — the math pipeline should not branch on null.

Without the pattern, null checks infect every call site:

\`\`\`java
// Anti-pattern: null checks at every boundary
public class InvoiceService {
    public double calculateTotal(Cart cart, Coupon coupon) {
        double total = cart.subtotal();
        if (coupon != null) {
            total = coupon.apply(total);
        }
        return total + gst(total);
    }

    public void audit(Cart cart, Logger logger) {
        if (logger != null) {
            logger.info("Calculated invoice for " + cart.getId());
        }
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: null checks at every boundary
class InvoiceService:
    def calculate_total(self, cart: dict, coupon) -> float:
        total = cart["subtotal"]
        if coupon is not None:
            total = coupon.apply(total)
        return total + self._gst(total)

    def audit(self, cart: dict, logger) -> None:
        if logger is not None:
            logger.info(f"Calculated invoice for {cart['id']}")
\`\`\`

**The Problem:** Defensive null checks duplicate across services. A forgotten check causes \`NullPointerException\` in production. Optional collaborators make polymorphism awkward — you cannot treat all coupons uniformly.

---

### Refactoring with Null Object Pattern

Provide a real object that implements the interface with intentional default behavior.

#### Step 1: Define the Interface

\`\`\`java
public interface Coupon {
    double apply(double price);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class Coupon(ABC):
    @abstractmethod
    def apply(self, price: float) -> float:
        pass
\`\`\`

#### Step 2: Implement Real and Null Objects

\`\`\`java
public class PercentageCoupon implements Coupon {
    private final double percent;
    public PercentageCoupon(double percent) { this.percent = percent; }
    public double apply(double price) { return price * (1 - percent / 100); }
}

public class NullCoupon implements Coupon {
    public double apply(double price) { return price; } // identity — no discount
}
\`\`\`
\`\`\`python
class PercentageCoupon(Coupon):
    def __init__(self, percent: float) -> None:
        self.percent = percent

    def apply(self, price: float) -> float:
        return price * (1 - self.percent / 100)


class NullCoupon(Coupon):
    def apply(self, price: float) -> float:
        return price  # identity — no discount
\`\`\`

#### Step 3: Context Uses Interface Uniformly

\`\`\`java
public class InvoiceService {
    public double calculateTotal(Cart cart, Coupon coupon) {
        double total = coupon.apply(cart.subtotal());
        return total + gst(total);
    }

    private double gst(double amount) { return amount * 0.18; }
}
\`\`\`
\`\`\`python
class InvoiceService:
    def calculate_total(self, cart: dict, coupon: Coupon) -> float:
        total = coupon.apply(cart["subtotal"])
        return total + self._gst(total)

    def _gst(self, amount: float) -> float:
        return amount * 0.18
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        InvoiceService invoices = new InvoiceService();
        Cart cart = new Cart(1000);

        Coupon active = new PercentageCoupon(10);
        System.out.println(invoices.calculateTotal(cart, active));

        Coupon none = new NullCoupon(); // no null check needed
        System.out.println(invoices.calculateTotal(cart, none));
    }
}
\`\`\`
\`\`\`python
invoices = InvoiceService()
cart = {"subtotal": 1000}

active = PercentageCoupon(10)
print(invoices.calculate_total(cart, active))

none = NullCoupon()
print(invoices.calculate_total(cart, none))
\`\`\`

---

### When to Use It

* **Optional collaborators with safe defaults:** No-op loggers, zero-discount coupons, guest user permissions that deny writes.
* **Eliminate null checks:** When \`if (x != null)\` repeats at many call sites for the same optional dependency.
* **Uniform polymorphism:** When algorithms should always invoke the interface without special-casing absence.
* **Graceful degradation:** When disabled features should behave predictably, not crash.

### Comparison: Null Object vs. Optional / Maybe

Both address absence, but with different semantics:

* **Null Object Pattern:** Replaces absence with a **real object** that implements default behavior — call sites never branch on null.
* **Optional / Maybe:** Explicitly models **presence vs absence** — callers must \`map\`, \`orElse\`, or \`ifPresent\`; absence remains a first-class concept, not hidden behavior.`;
