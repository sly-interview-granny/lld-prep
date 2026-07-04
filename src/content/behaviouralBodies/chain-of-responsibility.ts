export const chainOfResponsibilityBody = `The **Chain of Responsibility Design Pattern** is a behavioral design pattern that passes a request along a chain of handlers until one of them handles it — or the chain exhausts without a resolution.

Instead of a monolithic method that knows every validation and authorization rule, each handler owns one concern and optionally forwards to the next link.

---

### The Core Concept: "Try Here, Else Pass Along"

Imagine you are building an **API Gateway** for a fintech app in India.

* Every request must pass JWT authentication.
* High-traffic endpoints need rate limiting.
* POST bodies require JSON schema validation.
* Sensitive routes need an extra MFA check.
* Finally, the business controller handles the request.

Without the pattern, your gateway entry point becomes unmaintainable:

\`\`\`java
// Anti-pattern: one method encodes the entire pipeline
public class ApiGateway {
    public Response handle(Request request) {
        if (!authenticate(request)) {
            return Response.unauthorized();
        }
        if (!rateLimit(request)) {
            return Response.tooManyRequests();
        }
        if (!validateSchema(request)) {
            return Response.badRequest();
        }
        if (request.isSensitive() && !verifyMfa(request)) {
            return Response.forbidden();
        }
        return controller.dispatch(request);
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: one method encodes the entire pipeline
class ApiGateway:
    def handle(self, request: dict) -> dict:
        if not self._authenticate(request):
            return {"status": 401}
        if not self._rate_limit(request):
            return {"status": 429}
        if not self._validate_schema(request):
            return {"status": 400}
        if request.get("sensitive") and not self._verify_mfa(request):
            return {"status": 403}
        return self.controller.dispatch(request)
\`\`\`

**The Problem:** Reordering middleware, adding a new filter, or disabling one step for a route means editing the central method. Teams cannot own their concerns independently, and unit tests must simulate the entire pipeline for every case.

---

### Refactoring with Chain of Responsibility

Each concern becomes a handler that either produces a response or delegates to \`next\`.

#### Step 1: Define the Handler Interface

\`\`\`java
public abstract class RequestHandler {
    private RequestHandler next;

    public RequestHandler setNext(RequestHandler next) {
        this.next = next;
        return next;
    }

    public Response handle(Request request) {
        Response response = tryHandle(request);
        if (response != null) return response;
        if (next != null) return next.handle(request);
        return Response.notFound();
    }

    protected abstract Response tryHandle(Request request);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class RequestHandler(ABC):
    def __init__(self) -> None:
        self.next_handler: "RequestHandler | None" = None

    def set_next(self, handler: "RequestHandler") -> "RequestHandler":
        self.next_handler = handler
        return handler

    def handle(self, request: dict) -> dict | None:
        response = self.try_handle(request)
        if response is not None:
            return response
        if self.next_handler:
            return self.next_handler.handle(request)
        return {"status": 404}

    @abstractmethod
    def try_handle(self, request: dict) -> dict | None:
        pass
\`\`\`

#### Step 2: Implement Concrete Handlers

\`\`\`java
public class AuthHandler extends RequestHandler {
    protected Response tryHandle(Request request) {
        if (!request.hasValidToken()) {
            return Response.unauthorized();
        }
        return null; // pass to next
    }
}

public class RateLimitHandler extends RequestHandler {
    protected Response tryHandle(Request request) {
        if (request.exceedsQuota()) {
            return Response.tooManyRequests();
        }
        return null;
    }
}
\`\`\`
\`\`\`python
class AuthHandler(RequestHandler):
    def try_handle(self, request: dict) -> dict | None:
        if not request.get("token_valid"):
            return {"status": 401}
        return None


class RateLimitHandler(RequestHandler):
    def try_handle(self, request: dict) -> dict | None:
        if request.get("exceeds_quota"):
            return {"status": 429}
        return None
\`\`\`

#### Step 3: Wire the Chain

\`\`\`java
public class GatewayChainFactory {
    public static RequestHandler buildChain() {
        RequestHandler auth = new AuthHandler();
        RequestHandler rateLimit = new RateLimitHandler();
        RequestHandler controller = new ControllerHandler();
        auth.setNext(rateLimit).setNext(controller);
        return auth;
    }
}
\`\`\`
\`\`\`python
def build_chain() -> RequestHandler:
    auth = AuthHandler()
    rate_limit = RateLimitHandler()
    controller = ControllerHandler()
    auth.set_next(rate_limit).set_next(controller)
    return auth
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        RequestHandler chain = GatewayChainFactory.buildChain();
        Response response = chain.handle(new Request("valid-token", false));
        System.out.println(response.getStatus());
    }
}
\`\`\`
\`\`\`python
chain = build_chain()
response = chain.handle({"token_valid": True, "exceeds_quota": False})
print(response["status"])
\`\`\`

---

### When to Use It

* **Composable pipelines:** When request processing is a sequence of optional, reorderable steps — HTTP middleware, servlet filters, gRPC interceptors.
* **Unknown handler upfront:** When the sender should not decide which object resolves the request — support escalation tiers, exception handler chains.
* **Single-responsibility links:** When each step does one thing well and teams own their handler independently.
* **Short-circuit semantics:** When the first failure or first success should stop further processing.

### Comparison: Chain of Responsibility vs. Decorator Pattern

Both wrap behavior in layers, but their **intent** differs:

* **Chain of Responsibility:** Each link may **decline** to act and forward the request; not every link necessarily wraps the same core operation.
* **Decorator Pattern:** Every wrapper **always** delegates inward and adds behavior around a single object call — the full stack runs unless explicitly designed otherwise.`;
