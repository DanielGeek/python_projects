## Weather CLI APP

The goal of this application is to build a console application that prompts the user to enter a city. At the end, we will generate an executable binary.

### Options:

- Enter a city name.
- Save the default city.
- Register several other cities to look up the weather in those cities.

## Stack

- Bun.js
- OpenMeteo

## HTTP request example:

1. Step 1: Geocoding API.
2. Step 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Initialize project

```bash
bun init
```

### Menu example
This is the appearance we want to create.

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Default city weather
  2. Weather for all cities (1)
  3. Search for and add a city
  4. Remove a city
  5. Set default city
  8. Settings (°C)
  9. Exit
════════════════════════════════════════
  Select an option: 5
```
