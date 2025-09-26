Welcome!

This is the client for the Akashic life repository and planner app. This app is designed by a developer with terrible ADHD, inspired by that ADHD, to help others with ADHD handle the mayhem of managing day to day life in an organized manner. Currently the app is in early development with most of the core features implemented and working, with much of the work ahead having to do with expanding on those features and improving user experience of navigating the site. 

The goal for this app is to make it the easiest possible option when faced with moments in life where you must write something down, without that option being a piece of paper, or a post-it note, or a scribbling in a notebook or physical planner, or a digital note in a word document, or even a note typed into Notion or other favorite planner app of choice that is ultimately destined to vanish into the noise of all the other notes. 

Much of the roadmap has to do with reducing friction during usage of this app as much as possible towards this end, making it easy to jot things down and plan things out and easily retrieve that later, with a suite of features to help visualize trends over time, such as with the habit tracking feature. 


## 🚀 Upcoming Features & Roadmap

### Overall

-   [ ] **Batch Update Queue System**:
    -   [ ] Collect updates in a customizable time interval.
    -   [ ] Each update object should contain a data type, operation type (`"update"`, `"delete"`, etc.), the actual data, a database callback function, and a state-setter callback function.
-   [ ] **Site Context Menu**:
    -   [ ] Implement a site-wide navigation and document-management context menu, accessible with a right-click.
    -   [ ] Make context menu options page-dependent (e.g., `'make note into goal'`, `'make reminder about this document'`).
-   [ ] **Input Elements & Form Generator**:
    -   [ ] **Select builder**:
        -   [ ] Fix select input not showing the current value on load.
        -   [ ] Resolve excessive re-rendering on load.
    -   [ ] **Array elements**:
        -   [ ] When the user finishes inputting data into the last item in an array, automatically add a new blank input below it.
        -   [ ] Prune empty array indexes on submit.
-   [ ] **Build Process & MVP**:
    -   [ ] Create a new MongoDB cluster for the app.
    -   [ ] Clean up server code to remove portfolio-specific content.
    -   [ ] Create a server-side repository.
    -   [ ] Test building the app and hosting it on GitHub Pages for SMS opt-in verification.
    -   [ ] Simplify unimplemented features to reach MVP faster.
    -   [x] Publish code to GitHub.
-   [ ] **Management**:
    -   [ ] Test endpoints with multiple users to check for schema/controller problems.
    -   [ ] Reduce redundant components by moving atomic components to a central library.
    -   [ ] Modularize redundant logic or refactor into reducers.

---

### User

#### Auth & Login

-   [x] Create a loading spinner to show data loading progress on login.
-   [x] Make sure all data is fetched on login, not waiting for sync.
-   [x] Make sure everything is cleared away on logout.
-   [ ] **Fix login experience**:
    -   [ ] Fix bug where workspaces are not fully cleared on login to a new user.
    -   [ ] Update user schema to include profile information.
    -   [ ] Implement password complexity requirements and verification.
    -   [x] Make signup and logout work.

#### User Profile

-   [ ] Finish implementing user data into the profile and settings.
-   [x] Update user schema to include profile info.
-   [ ] Hook up user data to the profile and settings.

#### Settings

-   [x] Incorporate settings schema into the user schema in the database.
-   [x] Pull settings along with user data on login and apply dynamically.
-   [x] Screen out settings when pulling user data for users other than the requesting user.
-   [x] Make settings persistent and state-based.
-   [ ] Collect variable values that should be customizable and add them to the settings menu.

---

### Planner

-   [ ] **Dashboard**:
    -   [ ] Design and implement a planner dashboard showing at-a-glance information like today's events.
-   [x] **Calendar Integration**:
    -   [x] Implement OAuth integration for Google and Apple Calendars.
    -   [x] Integrate settings store and page.
    -   [ ] Integrate Google OAuth to allow editing and creating events within Google Calendar.
    -   [ ] Confirm all calendar-related endpoints work correctly.
-   [ ] **DayDialogForm**:
    -   [ ] Make the form fully self-contained with functions fetched directly inside the component.
    -   [ ] Replace the `"+ NEW"` button on the planner page header with the day dialog form.
    -   [ ] Add options for creating new notes and other items within the form.
-   [ ] **Scheduler**:
    -   [ ] Make clicking a calendar date open a modal showing all events for that day.
    -   [ ] Add a `"+ New"` button to swap the modal content with the `DayFormDialog`.
-   [ ] **Performance**:
    -   [ ] Address the slowdown when the logs form dialog opens and closes.

---

### Notes

-   [x] **Explorer**:
    -   [x] **Editor View**:
        -   [x] Implement editor view as a content-area swap within the explorer.
        -   [x] Keep the tree as-is and use a back button to return to the explorer view.
        -   [x] Integrate all endpoints for updating, creating, and deleting new notes.
        -   [x] Test endpoints.
        -   [x] Fix create, rename, and edit endpoints for the explorer tree.
    -   [ ] **Fixes**:
        -   [ ] Fix bug where opening a note then another without refreshing the UI doesn't update the text in the editor view.
-   [x] **Scratchpad**:
    -   [x] Implement a content-area toggle swap for the scratchpad to switch between:
        -   [x] The note-groups list view.
        -   [x] The list of notes view.
        -   [x] The note editor view.
-   [x] **Cleanup**:
    -   [x] Remove unused data store variables and helper functions.
    -   [x] Remove `filesData` and `foldersData` instances and replace with `notesData` and `recentNotesData`.
-   [ ] **Data**:
    -   [ ] **Import/Export Options**:
        -   [ ] Create a utility to translate `.md`, `.txt`, and `.pdf` files into the notes object schema.
-   [ ] **Stickynotes**:
    -   [ ] Create a store variable for stickynotes in the `notesStore`.
    -   [ ] Make stickynotes appear as their own special folder in the explorer.
    -   [ ] Add handy filters (e.g., by group, type, date).
    -   [ ] Stickynotes will be a local-only set of notes, no schema needed.
-   [ ] **General**:
    -   [ ] Move logs to the journal section.
    -   [ ] In the file explorer UI remake, have logs be a special document type.

---

### Reflect

-   [x] **Logs/Journal**:
    -   [x] Fully move logs out of the Planner section.
    -   [x] Move the `logs` page to its own section under Journal.
    -   [ ] Make a Zustand store for the logs/journals/reflect sections.
    -   [ ] Log calendar doesn't open the log notes drawer sidebar.

---

### Todo

-   [ ] **Views**:
    -   [ ] **Kanban**:
        -   [ ] Implement drag-and-drop reordering for columns and tasks.
        -   [ ] Use the new groups setup for reordering.
        -   [ ] Update API calls for `TodoListGroups` (kanban view) to use the correct field names.
    -   [ ] **Table**:
        -   [ ] Take the structure from the old code and gut/replace rendering parts.
        -   [ ] Fix drag and drop.
    -   [ ] **Basic List (Sidebar)**:
        -   [ ] Make a super basic variant for sidebars.
        -   [ ] Allow drag-and-drop to move tasks and subtasks.
        -   [ ] Add `+ new task`, `Clone task`, and `delete task` buttons.
        -   [ ] Allow filtering by group and date.
        -   [ ] Prevent UI from resetting on every change.
-   [ ] **Task Management**:
    -   [ ] Avoid duplicating tasks across groups and lists; make all task arrays reference each task by ID.
    -   [ ] Update reordering code for columns and tasks to use the `useTask` hook.
    -   [x] Ditch the `todoListIndex` field.
    -   [ ] Compile per-field rendering code into `TodoListItemField.jsx` with a display and edit mode variant.
    -   [ ] On task update success, tasks in the calendar view do not update live.
-   [ ] **Import/Export**:
    -   [ ] Create a feature to import a `.txt`, `.md`, or `.json` file to generate a list of tasks.
    -   [ ] Create an export feature for this, exporting as a generic tabbed list.
-   [ ] **General**:
    -   [ ] Standardize terminology across the app (e.g., use `groups` instead of `filteredColumns` or `columns`).

---

## 💡 Future Ideas & Optional Enhancements

-   Broadly speaking, the following will guide future enhancements:
    -   Intelligent Quick Capture: Implement a universal, persistent "quick add" button or a keyboard shortcut that is accessible from any screen within the app. This feature should allow a user to instantly jot down a note, task, or idea without needing to navigate to a specific section. It could use natural language processing to automatically categorize the input (e.g., "call mom tomorrow at 3pm" would create a task and a reminder).

    -   Contextual Auto-Suggestions: As a user types, the app can offer contextual suggestions. For example, if a user is in the Notes section and types "meeting with", the app could suggest contacts or past meeting notes. In the Planner, typing "dentist" could suggest creating an event or a reminder.

    -   Voice-to-Text Integration: ADHD brains often struggle with the motor skills required for typing, especially during a rush of ideas. Integrating a robust, built-in voice-to-text function that works across all note-taking and task-creation fields would remove this barrier.

    -   Gamification and Dopamine Loops: To combat task initiation paralysis, you can incorporate small, celebratory visual or auditory rewards for completing tasks. This can be as simple as a satisfying animation or sound effect upon checking a box. The habit tracking and progress visualization features you already mentioned are excellent examples of this.

    -   Minimalist & Adaptable UI: The UI should be clean and uncluttered by default to minimize visual overstimulation. Allow users to customize their view, hiding or showing specific modules (e.g., a "dashboard at a glance" page that shows only the most relevant information like today's tasks and events).

    -   Cross-Platform Synchronization & Offline Access: The app must be fully functional offline and sync seamlessly across all devices, so a user can capture a thought on their phone and see it instantly on their desktop without any extra effort.

### Overall

-   [ ] **Performance Improvements**:
    -   [ ] Reduce unnecessary re-renders (use `memo` and `useMemo`).
    -   [ ] Remove excessive console logs.
-   [ ] **End-to-end Encryption**:
    -   [ ] Consider implementing end-to-end encryption of user data.
-   [ ] **User-friendly Features**:
    -   [ ] When an `objectId` is shown, link it to the object's detail page.
    -   [ ] Implement a **Help Widget** (a `?` icon) that shows a tooltip on hover and a popover on click.
-   [ ] **Nav**:
    -   [ ] Refactor the `nav.jsx` file to be more modular.
-   [ ] **Styling**:
    -   [ ] Begin homogenizing the style across the site to create a consistent look.

---

### Planner

-   [ ] **Calendar variants**:
    -   [ ] Reduce redundant calendar components that all render dots on days with data.

---

### Notes

-   [ ] **Explorer**:
    -   [ ] Make an alternate layout for wider screens with the task list in a sidebar.
-   [ ] **Stickynotes**:
    -   [ ] Create groupings for stickynotes that they can be filtered by.
-   [ ] **Data**:
    -   [ ] Add a `batch updating processor`.

---

### Other

-   [ ] **Notifications/Reminders**: (On hold due to SMS roadblocks)
    -   [ ] **Server-side**: Find a way to trigger notifications without checking every 30 seconds.
    -   [ ] Consider a "slow-mode timer" that pauses checking until a new reminder is created or the next notification time approaches.
    -   [ ] Need a clear distinction between **Recurrence Rules** and **Trigger Dates**.
    -   [ ] Make a backend function that takes a `reminderId` and creates a notification.
-   [ ] **Landing Pages**:
    -   [ ] Create a landing page, hero, pricing page, FAQ, and about page.
    -   [ ] Brainstorm the dashboard landing page.
-   [x] **PC Components**:
    -   [x] Get GPU + PSU.
    -   [x] Decide on CPU + Motherboard combo.
    -   [x] Get DDR5 RAM.
    -   [x] Get case, fans, AIO watercooling, etc.
-   [x] **Personal**:
    -   [x] Wipe work laptop.
    -   [x] Hang out on VRChat later.
-   [x] **Counter-TI**:
    -   [x] Mental health document - original
    -   [ ] Share wiki in all communities.
