document.addEventListener("DOMContentLoaded", () => {
  // Ensure Firebase app is initialized
  const app = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp(firebaseConfig);

  const database = firebase.database(app);

  // Firebase listener to get real-time temperature updates
  database.ref("/temperature_readings").on("value", (snapshot) => {
    const tempReadings = snapshot.val(); // Object containing multiple readings

    // Check if tempReadings is an object
    if (typeof tempReadings === "object") {
      const latestTemp = getLatestTemperature(tempReadings);
      setTemperature(latestTemp); // Update the temperature with the latest value
    } else {
      console.error("Expected an object, but got:", tempReadings); // Debugging output
    }
  });

  // Helper function to get the latest temperature from the object
  function getLatestTemperature(readings) {
    const timestamps = Object.keys(readings); // Get all timestamps
    const latestTimestamp = Math.max(...timestamps); // Find the latest timestamp
    return readings[latestTimestamp]; // Return the temperature for the latest timestamp
  }

  const units = {
    Celcius: "°C",
    Fahrenheit: "°F",
  };

  const config = {
    minTemp: -20, // Minimum possible temperature
    maxTemp: 50, // Maximum possible temperature
    unit: "Celcius",
  };

  // Function to set the temperature and update the animation
  function setTemperature(value) {
    const temperatureElement = document.getElementById("temperature");
    const temperatureHeight =
      ((value - config.minTemp) / (config.maxTemp - config.minTemp)) * 100;

    // Update thermometer height based on the current temperature value
    temperatureElement.style.height = temperatureHeight + "%";

    // Display the temperature value with unit
    temperatureElement.dataset.value =
      value.toFixed(2) + " " + units[config.unit]; // Show value like "33.19°C"
  }
});
