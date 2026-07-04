export const templateBody = `The **Template Method Design Pattern** is a behavioral design pattern that defines the skeleton of an algorithm in a base class while letting subclasses override specific steps without changing the overall structure.

Instead of duplicating the same high-level workflow in every importer or beverage maker, the parent class owns the sequence and subclasses fill in the variable steps.

---

### The Core Concept: "Same Recipe, Different Ingredients"

Imagine you are building a **Data Import Pipeline** for a SaaS analytics product.

* Every import must: download file → parse → validate → persist → notify.
* CSV and JSON sources parse differently.
* Validation rules differ per format.
* But the **order** of steps must never change — you cannot persist before validating.

Without the pattern, each importer copy-pastes the workflow:

\`\`\`java
// Anti-pattern: duplicated skeleton in every importer
public class CsvImporter {
    public void runImport() {
        byte[] file = downloadFromS3();
        List<Row> rows = parseCsv(file);
        validateRows(rows);
        persist(rows);
        sendNotification("CSV import done");
    }
}

public class JsonImporter {
    public void runImport() {
        byte[] file = downloadFromS3();
        List<Row> rows = parseJson(file);
        validateRows(rows);
        persist(rows);
        sendNotification("JSON import done");
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: duplicated skeleton in every importer
class CsvImporter:
    def run_import(self) -> None:
        file_bytes = self._download_from_s3()
        rows = self._parse_csv(file_bytes)
        self._validate_rows(rows)
        self._persist(rows)
        self._send_notification("CSV import done")


class JsonImporter:
    def run_import(self) -> None:
        file_bytes = self._download_from_s3()
        rows = self._parse_json(file_bytes)
        self._validate_rows(rows)
        self._persist(rows)
        self._send_notification("JSON import done")
\`\`\`

**The Problem:** If you must add an audit log step after validation, you edit every importer. Subclasses can accidentally skip steps or reorder them, breaking invariants.

---

### Refactoring with Template Method Pattern

The abstract base class defines \`runImport()\` as a **final** template; subclasses override only the hooks they need.

#### Step 1: Define the Abstract Template Class

\`\`\`java
public abstract class DataImporter {
    public final void runImport() {
        byte[] file = downloadFromS3();
        List<Row> rows = parse(file);
        validate(rows);
        persist(rows);
        sendNotification(formatName() + " import done");
    }

    protected byte[] downloadFromS3() { /* shared */ return new byte[0]; }
    protected abstract List<Row> parse(byte[] file);
    protected abstract void validate(List<Row> rows);
    protected void persist(List<Row> rows) { /* shared */ }
    protected void sendNotification(String message) { System.out.println(message); }
    protected abstract String formatName();
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class DataImporter(ABC):
    def run_import(self) -> None:
        file_bytes = self._download_from_s3()
        rows = self.parse(file_bytes)
        self.validate(rows)
        self.persist(rows)
        self._send_notification(f"{self.format_name()} import done")

    def _download_from_s3(self) -> bytes:
        return b""

    @abstractmethod
    def parse(self, file_bytes: bytes) -> list[dict]:
        pass

    @abstractmethod
    def validate(self, rows: list[dict]) -> None:
        pass

    def persist(self, rows: list[dict]) -> None:
        pass

    def _send_notification(self, message: str) -> None:
        print(message)

    @abstractmethod
    def format_name(self) -> str:
        pass
\`\`\`

#### Step 2: Implement Concrete Subclasses

\`\`\`java
public class CsvImporter extends DataImporter {
    protected List<Row> parse(byte[] file) {
        System.out.println("Parsing CSV");
        return List.of();
    }
    protected void validate(List<Row> rows) {
        System.out.println("Validating CSV columns");
    }
    protected String formatName() { return "CSV"; }
}

public class JsonImporter extends DataImporter {
    protected List<Row> parse(byte[] file) {
        System.out.println("Parsing JSON");
        return List.of();
    }
    protected void validate(List<Row> rows) {
        System.out.println("Validating JSON schema");
    }
    protected String formatName() { return "JSON"; }
}
\`\`\`
\`\`\`python
class CsvImporter(DataImporter):
    def parse(self, file_bytes: bytes) -> list[dict]:
        print("Parsing CSV")
        return []

    def validate(self, rows: list[dict]) -> None:
        print("Validating CSV columns")

    def format_name(self) -> str:
        return "CSV"


class JsonImporter(DataImporter):
    def parse(self, file_bytes: bytes) -> list[dict]:
        print("Parsing JSON")
        return []

    def validate(self, rows: list[dict]) -> None:
        print("Validating JSON schema")

    def format_name(self) -> str:
        return "JSON"
\`\`\`

#### Step 3: Shared Infrastructure Stays in the Base

The template method owns sequencing; hooks stay small and focused.

\`\`\`java
// Subclasses cannot override runImport() — skeleton is invariant
public abstract class DataImporter {
    // template method marked final in production code
}
\`\`\`
\`\`\`python
# Subclasses cannot override run_import without breaking LSP — treat it as invariant
class DataImporter(ABC):
    pass
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        DataImporter csv = new CsvImporter();
        csv.runImport();

        DataImporter json = new JsonImporter();
        json.runImport();
    }
}
\`\`\`
\`\`\`python
CsvImporter().run_import()
JsonImporter().run_import()
\`\`\`

---

### When to Use It

* **Fixed workflow, variable steps:** When several classes share the same high-level algorithm but differ in a few operations — import pipelines, test runners, build scripts.
* **Invariant ordering:** When step sequence must be enforced — validate before persist, boil water before brew.
* **Framework hooks:** When a framework defines lifecycle (\`onCreate\`, \`onStart\`) and applications fill in details.
* **Hollywood Principle:** When "don't call us, we'll call you" — the base drives flow, subclasses respond.

### Comparison: Template Method vs. Strategy Pattern

Both vary behavior, but through different mechanisms:

* **Template Method:** Uses **inheritance** — the base class defines the skeleton and calls subclass hooks; the algorithm structure is fixed at compile time in the hierarchy.
* **Strategy Pattern:** Uses **composition** — the entire algorithm is swapped via a strategy object at runtime; no inheritance required.`;
