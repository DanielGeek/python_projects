# Weather CLI Review

- [x] **Colors:** None; cyan (menu), yellow (temp), and green/red (ok/error) are missing.
- [ ] **Cities:** Geocoding only returns one result; ambiguous names may cause errors.
- [ ] **Tests:** Are there enough tests for the CLI, persistence, and API integration?
- [ ] **Binary:** It compiles correctly; check that `./weather` saves data in `~/.config/weather-cli/`.
- [ ] **Scalability:** How easy will it be to expand with new features?
- [ ] **Loading:** Is there load status for asynchronous tasks?
- [x] **7 day forecast:** Add the option to get the weather forecast for the next 7 days.
