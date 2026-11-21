## Desired Structure

```bash
src/
├── actions/ # Main actions the user can perform
│ ├── getWeather.ts # Get current weather for a city
│ ├── addCity.ts # Add a city to the list
│ ├── removeCity.ts # Remove a city
│ ├── setDefaultCity.ts # Set the default city
│ ├── listCities.ts # List all saved cities
│ └── ... # Other future actions
├── presentation/ # Everything related to console/CLI interaction
│ ├── menu.ts # Menu rendering and selection handling options
│ ├── output.ts # Functions to display messages to the user
│ ├── input.ts # Functions to capture and validate user input
│ └── ... # Other presentation components
├── storage/ # Layer to read, write, and manage local data
│ ├── citiesStorage.ts # Persistence of saved cities
│ ├── settingsStorage.ts # Persistence of settings and preferences
│ └── ... # Other storage mechanisms
├── types/ # TypeScript types and contracts used globally
│ ├── City.ts # Definition of the City type
│ ├── Weather.ts # Types for the weather response weather
│ ├── MenuOption.ts # Type for menu options
│ └── ... # Other global types
├── api/ # Integration with external APIs (OpenMeteo, geocoding)
│ ├── geocoding.ts # Logic to obtain city coordinates
│ ├── weather.ts # Logic to obtain current weather and forecast
│ └── ... # Other API endpoints or utilities
├── utils/ # Reusable utilities and helpers
│ ├── format.ts # Data formatters (dates, temperatures, etc.)
│ ├── constants.ts # General app constants
│ ├── colors.ts # Definition and utilities of colors for the console
│ └── ... # Other utilities
├── index.ts # Main entry point of the CLI application
```
