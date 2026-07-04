export const mediatorBody = `The **Mediator Design Pattern** is a behavioral design pattern that defines an object encapsulating how a set of objects interact, promoting loose coupling by keeping objects from referring to each other directly.

Instead of every UI widget listening to every other widget, colleagues report changes to a mediator that orchestrates the response.

---

### The Core Concept: "Talk to the Tower, Not the Other Planes"

Imagine you are building a **Flight Booking UI** for an Indian travel app.

* Changing the departure date should refresh available flights.
* Selecting a seat should update the fare summary.
* Applying a promo code should recalculate taxes and loyalty points.
* Clearing the passenger form should reset validation badges.

Without a mediator, components form an N×N dependency mesh:

\`\`\`java
// Anti-pattern: widgets reference each other directly
public class DatePicker {
    private SeatMap seatMap;
    private FareSummary fareSummary;

    public void onDateChanged(LocalDate date) {
        seatMap.reloadForDate(date);
        fareSummary.clearPromo();
        fareSummary.recalculate();
    }
}

public class SeatMap {
    private FareSummary fareSummary;

    public void onSeatSelected(String seat) {
        fareSummary.setSeatFee(seatFeeFor(seat));
        fareSummary.recalculate();
    }
}
\`\`\`
\`\`\`python
# Anti-pattern: widgets reference each other directly
class DatePicker:
    def on_date_changed(self, date: str) -> None:
        self.seat_map.reload_for_date(date)
        self.fare_summary.clear_promo()
        self.fare_summary.recalculate()


class SeatMap:
    def on_seat_selected(self, seat: str) -> None:
        self.fare_summary.set_seat_fee(self._seat_fee_for(seat))
        self.fare_summary.recalculate()
\`\`\`

**The Problem:** Components become unreusable outside this screen. Changing fare rules means editing multiple widgets. Testing \`DatePicker\` requires mocking half the UI.

---

### Refactoring with Mediator Pattern

All colleagues communicate through a booking mediator that owns orchestration rules.

#### Step 1: Define the Mediator Interface

\`\`\`java
public interface BookingMediator {
    void notify(Object sender, String event, Object data);
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod


class BookingMediator(ABC):
    @abstractmethod
    def notify(self, sender: object, event: str, data: object) -> None:
        pass
\`\`\`

#### Step 2: Implement Colleague Base

\`\`\`java
public abstract class BookingWidget {
    protected BookingMediator mediator;

    public void setMediator(BookingMediator mediator) {
        this.mediator = mediator;
    }
}

public class DatePicker extends BookingWidget {
    public void selectDate(LocalDate date) {
        mediator.notify(this, "DATE_CHANGED", date);
    }
}

public class SeatMap extends BookingWidget {
    public void selectSeat(String seat) {
        mediator.notify(this, "SEAT_SELECTED", seat);
    }
}
\`\`\`
\`\`\`python
class BookingWidget:
    def __init__(self) -> None:
        self.mediator: BookingMediator | None = None

    def set_mediator(self, mediator: BookingMediator) -> None:
        self.mediator = mediator


class DatePicker(BookingWidget):
    def select_date(self, date: str) -> None:
        if self.mediator:
            self.mediator.notify(self, "DATE_CHANGED", date)


class SeatMap(BookingWidget):
    def select_seat(self, seat: str) -> None:
        if self.mediator:
            self.mediator.notify(self, "SEAT_SELECTED", seat)
\`\`\`

#### Step 3: Concrete Mediator Orchestrates

\`\`\`java
public class FlightBookingMediator implements BookingMediator {
    private DatePicker datePicker;
    private SeatMap seatMap;
    private FareSummary fareSummary;

    public void register(DatePicker dp, SeatMap sm, FareSummary fs) {
        this.datePicker = dp; this.seatMap = sm; this.fareSummary = fs;
        dp.setMediator(this); sm.setMediator(this); fs.setMediator(this);
    }

    public void notify(Object sender, String event, Object data) {
        if ("DATE_CHANGED".equals(event)) {
            seatMap.reloadForDate((LocalDate) data);
            fareSummary.clearPromo();
            fareSummary.recalculate();
        } else if ("SEAT_SELECTED".equals(event)) {
            fareSummary.setSeatFee(seatMap.feeFor((String) data));
            fareSummary.recalculate();
        }
    }
}
\`\`\`
\`\`\`python
class FlightBookingMediator(BookingMediator):
    def __init__(self) -> None:
        self.seat_map: SeatMap | None = None
        self.fare_summary: "FareSummary | None" = None

    def register(self, date_picker: DatePicker, seat_map: SeatMap, fare_summary: "FareSummary") -> None:
        self.seat_map = seat_map
        self.fare_summary = fare_summary
        for widget in (date_picker, seat_map, fare_summary):
            widget.set_mediator(self)

    def notify(self, sender: object, event: str, data: object) -> None:
        if event == "DATE_CHANGED":
            self.seat_map.reload_for_date(str(data))
            self.fare_summary.clear_promo()
            self.fare_summary.recalculate()
        elif event == "SEAT_SELECTED":
            self.fare_summary.set_seat_fee(500)
            self.fare_summary.recalculate()
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Main {
    public static void main(String[] args) {
        FlightBookingMediator mediator = new FlightBookingMediator();
        DatePicker dates = new DatePicker();
        SeatMap seats = new SeatMap();
        FareSummary fare = new FareSummary();
        mediator.register(dates, seats, fare);

        dates.selectDate(LocalDate.of(2026, 8, 15));
        seats.selectSeat("12A");
    }
}
\`\`\`
\`\`\`python
mediator = FlightBookingMediator()
dates = DatePicker()
seats = SeatMap()
fare = FareSummary()
mediator.register(dates, seats, fare)

dates.select_date("2026-08-15")
seats.select_seat("12A")
\`\`\`

---

### When to Use It

* **Complex peer interactions:** When many objects coordinate in ways that change often — dialog wizards, form fields, chat rooms.
* **Reusable components:** When widgets should not know about each other but must stay in sync.
* **Reduce N×N coupling:** When direct references between peers would create a maintenance nightmare.
* **Centralized policies:** When orchestration rules should live in one place, not scatter across colleagues.

### Comparison: Mediator vs. Observer Pattern

Both decouple participants, but coordination style differs:

* **Observer Pattern:** Subject **broadcasts** to passive subscribers — typically one-way notification without complex routing.
* **Mediator Pattern:** Colleagues send events to a **central coordinator** that decides who reacts and how — often multi-step, directed protocols.`;
