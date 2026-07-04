export const iteratorBody = `The **Iterator Design Pattern** is a behavioral design pattern that provides a way to access elements of a collection sequentially without exposing its underlying representation.

Instead of clients reaching into internal arrays, linked lists, or database cursors, they traverse via a uniform \`hasNext\` / \`next\` interface.

---

### The Core Concept: "Next, Next, Done — Regardless of Storage"

Imagine you are building a **Music Streaming App** with multiple playlist backends.

* Some playlists live in an in-memory array.
* Others stream from a paginated API.
* Premium users get a shuffled "Discover Weekly" backed by a graph recommendation engine.

Clients should press "play next" without knowing how tracks are stored:

\`\`\`java
// Anti-pattern: clients depend on internal structure
public class PlaylistService {
    public void playAll(ArrayList<Track> tracks) {
        for (int i = 0; i < tracks.size(); i++) {
            play(tracks.get(i));
        }
    }

    public void playPaginated(PaginatedFeed feed) {
        while (feed.hasPage()) {
            for (Track track : feed.currentPage()) {
                play(track);
            }
            feed.loadNextPage();
        }
    }
    // New storage = new client method
}
\`\`\`
\`\`\`python
# Anti-pattern: clients depend on internal structure
class PlaylistService:
    def play_all_array(self, tracks: list[str]) -> None:
        for track in tracks:
            self._play(track)

    def play_paginated(self, feed) -> None:
        while feed.has_page():
            for track in feed.current_page():
                self._play(track)
            feed.load_next_page()
\`\`\`

**The Problem:** Every new collection type forces new traversal code across the app. You leak implementation details and cannot swap storage without breaking callers.

---

### Refactoring with Iterator Pattern

Wrap each aggregate behind a common iterator interface.

#### Step 1: Define the Iterator Interface

\`\`\`java
public interface Iterator<T> {
    boolean hasNext();
    T next();
}
\`\`\`
\`\`\`python
from abc import ABC, abstractmethod
from typing import TypeVar

T = TypeVar("T")


class Iterator(ABC):
    @abstractmethod
    def has_next(self) -> bool:
        pass

    @abstractmethod
    def next(self) -> T:
        pass
\`\`\`

#### Step 2: Implement Concrete Iterators

\`\`\`java
public class ArrayPlaylistIterator implements Iterator<Track> {
    private final Track[] tracks;
    private int index = 0;

    public ArrayPlaylistIterator(Track[] tracks) {
        this.tracks = tracks;
    }

    public boolean hasNext() { return index < tracks.length; }
    public Track next() { return tracks[index++]; }
}

public class PaginatedIterator implements Iterator<Track> {
    private final PaginatedFeed feed;
    private int pageIndex = 0;

    public PaginatedIterator(PaginatedFeed feed) { this.feed = feed; }

    public boolean hasNext() {
        return feed.hasTrackAt(pageIndex) || feed.loadNextPage();
    }
    public Track next() { return feed.trackAt(pageIndex++); }
}
\`\`\`
\`\`\`python
class ArrayPlaylistIterator(Iterator):
    def __init__(self, tracks: list[str]) -> None:
        self.tracks = tracks
        self.index = 0

    def has_next(self) -> bool:
        return self.index < len(self.tracks)

    def next(self) -> str:
        track = self.tracks[self.index]
        self.index += 1
        return track


class PaginatedIterator(Iterator):
    def __init__(self, pages: list[list[str]]) -> None:
        self.pages = pages
        self.page_index = 0
        self.track_index = 0

    def has_next(self) -> bool:
        return self.page_index < len(self.pages) and self.track_index < len(self.pages[self.page_index])

    def next(self) -> str:
        track = self.pages[self.page_index][self.track_index]
        self.track_index += 1
        if self.track_index >= len(self.pages[self.page_index]):
            self.page_index += 1
            self.track_index = 0
        return track
\`\`\`

#### Step 3: Aggregate Exposes Iterator Factory

\`\`\`java
public interface Playlist {
    Iterator<Track> createIterator();
}

public class StaticPlaylist implements Playlist {
    private final Track[] tracks;
    public Iterator<Track> createIterator() {
        return new ArrayPlaylistIterator(tracks);
    }
}
\`\`\`
\`\`\`python
class StaticPlaylist:
    def __init__(self, tracks: list[str]) -> None:
        self.tracks = tracks

    def create_iterator(self) -> Iterator:
        return ArrayPlaylistIterator(self.tracks)
\`\`\`

#### Step 4: Client Execution

\`\`\`java
public class Player {
    public void playAll(Playlist playlist) {
        Iterator<Track> it = playlist.createIterator();
        while (it.hasNext()) {
            play(it.next());
        }
    }
    private void play(Track track) {
        System.out.println("Now playing: " + track.getTitle());
    }
}
\`\`\`
\`\`\`python
class Player:
    def play_all(self, playlist: StaticPlaylist) -> None:
        iterator = playlist.create_iterator()
        while iterator.has_next():
            print(f"Now playing: {iterator.next()}")
\`\`\`

---

### When to Use It

* **Hide internal structure:** When clients should traverse without knowing array vs tree vs database cursor.
* **Multiple traversal modes:** When the same collection needs forward, reverse, filtered, or lazy iterators.
* **Concurrent traversals:** When several iterators must walk the same aggregate with independent cursors.
* **Large or infinite sequences:** When lazy pagination or streaming beats loading everything into memory.

### Comparison: Iterator vs. Visitor Pattern

Both walk structures, but their goals diverge:

* **Iterator Pattern:** Focuses on **how to traverse** — sequential access with a cursor, hiding storage details.
* **Visitor Pattern:** Focuses on **what operation to perform** on each element — adding new operations without changing element classes, using double dispatch.`;
