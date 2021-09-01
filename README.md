# Demo walk app

Takes in walk data, parses it, lists it. You can navigate to a Maps page that will display that walk on a map.

### Global state

Ignoring global state management in favor of a very quick local device storage hack.

Next steps: Actual store would depend on data source(s), frequency of updates, size of data to manage, and security concerns.

### Code hygiene

ESlint and Prettier are included, as well as VSCode settings to autoformat on save.

Next steps: Husky pre-commit hook, more checks (prohibit shipping console logs, for example)

### Design

Yes, it's ugly, sorry.

Next steps: Work with someone with an actual eye for UI

### Data

Pretty sure that the data isn't super clean, etc. Lots of variance. The 40000 ms gap between walks is my best guess at properly parsing the data. How / when / where to clean "session" data gained from the devices? How to optimize for fall detection? Open questions.
