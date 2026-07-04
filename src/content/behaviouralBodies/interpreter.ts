export const interpreterBody = `The **Interpreter Design Pattern** is a behavioral design pattern that defines a representation for a grammar and an interpreter that uses that representation to evaluate sentences in the language.

Instead of scattering promo logic across nested \`if\` statements and string parsing hacks, you model discount rules as a composable expression tree where each node knows how to evaluate itself against a cart context.

---

### The Core Concept: "Rules as a Mini Language"

Imagine you are building a **Promo Engine** for an Indian e-commerce platform during the Big Billion Days sale.

* Marketing writes rules like: \`"FLAT100 AND cartTotal > 999"\` or \`"FIRST_ORDER OR (PRIME_MEMBER AND category == electronics)"\`.
* Each rule must evaluate against a live cart — items, categories, user segment, pincode.
* New campaigns arrive weekly; hard-coded conditionals become unmaintainable.
* Non-engineers should be able to compose rules from a small vocabulary without redeploying core checkout code.

A naive approach encodes every campaign as bespoke Java:

\`\`\`java
// Anti-pattern: promo logic as nested conditionals
public class PromoEngine {
    public int applyDiscount(Cart cart, String promoCode) {
        if (promoCode.equals("FLAT100") && cart.getTotal() > 999) {
            return 100;
        }
        if (promoCode.equals("FIRST_ORDER") && cart.isFirstOrder()) {
            return (int) (cart.getTotal() * 0.10);
        }
        if (promoCode.equals("BANGALORE_RAIN") && cart.getPincode().startsWith("560")) {
            return 50;
        }
        // Every new campaign = another branch
        return 0;
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: promo logic as nested conditionals
class PromoEngine:
    def apply_discount(self, cart: dict, promo_code: str) -> int:
        if promo_code == "FLAT100" and cart["total"] > 999:
            return 100
        if promo_code == "FIRST_ORDER" and cart.get("first_order"):
            return int(cart["total"] * 0.10)
        if promo_code == "BANGALORE_RAIN" and cart["pincode"].startswith("560"):
            return 50
        return 0
\`\`\`

**The Problem:** Business rules and parsing logic fuse together. You cannot unit-test \`AND\` / \`OR\` composition independently, reuse sub-expressions across campaigns, or let ops teams build rules from a DSL without engineering involvement.

---

### Refactoring with Interpreter Pattern

We treat each promo condition as an expression node with an \`interpret(context)\` method and compose them into trees.

#### Step 1: Define the Expression Interface

\`\`\`java
public interface PromoExpression {
    int interpret(CartContext context);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class PromoExpression(ABC):
    @abstractmethod
    def interpret(self, context: dict) -> int:
        pass
\`\`\`

#### Step 2: Implement Terminal and Non-Terminal Expressions

\`\`\`java
public class MinCartTotalExpression implements PromoExpression {
    private final int threshold;
  private final int discount;

    public MinCartTotalExpression(int threshold, int discount) {
        this.threshold = threshold;
        this.discount = discount;
    }

    public int interpret(CartContext context) {
        return context.getTotal() > threshold ? discount : 0;
    }
}

public class AndExpression implements PromoExpression {
    private final PromoExpression left;
    private final PromoExpression right;

    public AndExpression(PromoExpression left, PromoExpression right) {
        this.left = left;
        this.right = right;
    }

    public int interpret(CartContext context) {
        int leftValue = left.interpret(context);
        return leftValue > 0 ? right.interpret(context) : 0;
    }
}
\`\`\`
\`\`\`python
class MinCartTotalExpression(PromoExpression):
    def __init__(self, threshold: int, discount: int) -> None:
        self.threshold = threshold
        self.discount = discount

    def interpret(self, context: dict) -> int:
        return self.discount if context["total"] > self.threshold else 0


class AndExpression(PromoExpression):
    def __init__(self, left: PromoExpression, right: PromoExpression) -> None:
        self.left = left
        self.right = right

    def interpret(self, context: dict) -> int:
        left_value = self.left.interpret(context)
        return self.right.interpret(context) if left_value > 0 else 0
\`\`\`

#### Step 3: Build a Parser That Constructs the Expression Tree

\`\`\`java
public class PromoParser {
    public PromoExpression parse(String rule) {
        // Simplified: "FLAT100 AND total>999" -> AndExpression(...)
        if (rule.contains("AND")) {
            String[] parts = rule.split(" AND ");
            return new AndExpression(parseLeaf(parts[0]), parseLeaf(parts[1]));
        }
        return parseLeaf(rule);
    }

    private PromoExpression parseLeaf(String token) {
        if (token.contains("total>")) {
            int threshold = Integer.parseInt(token.replace("total>", ""));
            return new MinCartTotalExpression(threshold, 100);
        }
        return new MinCartTotalExpression(0, 0);
    }
}
\`\`\`
\`\`\`python
class PromoParser:
    def parse(self, rule: str) -> PromoExpression:
        if " AND " in rule:
            left_token, right_token = rule.split(" AND ", 1)
            return AndExpression(self._parse_leaf(left_token), self._parse_leaf(right_token))
        return self._parse_leaf(rule)

    def _parse_leaf(self, token: str) -> PromoExpression:
        if token.startswith("total>"):
            threshold = int(token.replace("total>", ""))
            return MinCartTotalExpression(threshold, 100)
        return MinCartTotalExpression(0, 0)
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        PromoParser parser = new PromoParser();
        PromoExpression rule = parser.parse("FLAT100 AND total>999");

        CartContext cart = new CartContext(1250, "560001", false);
        int discount = rule.interpret(cart);
        System.out.println("Discount applied: Rs " + discount);
    }
}
\`\`\`
\`\`\`python
parser = PromoParser()
rule = parser.parse("FLAT100 AND total>999")

cart = {"total": 1250, "pincode": "560001", "first_order": False}
discount = rule.interpret(cart)
print(f"Discount applied: Rs {discount}")
\`\`\`

---

### When to Use It

* **Simple, recurring grammars:** When you have a small domain language — promo rules, query filters, permission expressions — that repeats the same syntactic constructs.
* **Composable rules:** When conditions combine with \`AND\`, \`OR\`, \`NOT\` and you want each operator as a reusable node.
* **Frequent rule changes:** When marketing or ops teams need to add campaigns without touching checkout core logic.
* **Interpretation over compilation:** When rules are evaluated at runtime against live context rather than compiled to bytecode.

### Comparison: Interpreter vs. Strategy Pattern

Both encapsulate varying logic, but their **intent** differs:

* **Interpreter Pattern:** Builds a **tree of expressions** that evaluate a sentence in a domain-specific language — the structure of the grammar is the design centerpiece.
* **Strategy Pattern:** Swaps a **single algorithm** wholesale — there is no composable grammar, just interchangeable implementations of one operation.`;
