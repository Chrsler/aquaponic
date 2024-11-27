document.addEventListener("DOMContentLoaded", async () => {
  const forecastContainer = document.getElementById("forecast");

  // Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDvwBcGp3ZWS8EwLUINIsHVu8NHKRWAnHA",
    authDomain: "ph-temp-data.firebaseapp.com",
    databaseURL:
      "https://ph-temp-data-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "ph-temp-data",
    storageBucket: "ph-temp-data.appspot.com",
    messagingSenderId: "933744110311",
  };

  // Initialize Firebase if not already initialized
  if (typeof firebase === "undefined" || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

  // Load the model from Firebase Storage
  const modelUrl =
    "https://firebasestorage.googleapis.com/v0/b/ph-temp-data.appspot.com/o/model.json?alt=media&token=a892c1e1-7aa1-4ebf-80ba-b9c1eddd45d6";
  const model = await tf.loadLayersModel(modelUrl);

  // Real-time listener for pH and temperature readings
  const phRef = database.ref("/pH_readings");
  const tempRef = database.ref("/temperature_readings");

  phRef.limitToLast(12).on("value", async (phReadings) => {
    const tempReadings = await tempRef.limitToLast(12).once("value");

    if (phReadings.numChildren() === 12 && tempReadings.numChildren() === 12) {
      const readings = [];
      phReadings.forEach((phSnap) => {
        const phValue = phSnap.val();
        const tempValue = tempReadings.child(phSnap.key).val();
        readings.push([phValue, tempValue]);
      });

      const predictions = await predictHourlyValues(model, readings);
      updateForecast(predictions);
    } else {
      console.error("Not enough readings to make predictions.");
    }
  });

  // Predict pH and temperature for the next 12 hours
  async function predictHourlyValues(model, readings) {
    const predictions = [];
    let input = tf.tensor(readings).reshape([1, 12, 2]);

    for (let i = 0; i < 12; i++) {
      const prediction = await model.predict(input);
      const predictedValues = await prediction.data();
      const predictedPH = predictedValues[0];
      const predictedTemp = predictedValues[1];

      predictions.push({
        time: getNextHour(i + 1),
        ph: predictedPH,
        temperature: predictedTemp,
      });

      prediction.dispose(); // Dispose prediction tensor

      const newInputValues = [
        ...readings.slice(1),
        [predictedPH, predictedTemp],
      ];
      input.dispose(); // Dispose old input tensor
      input = tf.tensor(newInputValues).reshape([1, 12, 2]);
      readings = newInputValues;
    }

    return predictions;
  }

  // Get the next hour time formatted based on current time
  function getNextHour(hourOffset) {
    const now = new Date();
    now.setHours(now.getHours() + hourOffset);
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Update the forecast UI with smooth transitions
  function updateForecast(predictions) {
    forecastContainer.innerHTML = "";

    predictions.forEach((forecast) => {
      const hourlyItem = document.createElement("div");
      hourlyItem.classList.add("hourly-item");
      hourlyItem.style.opacity = 0; // Set initial opacity for transition

      setTimeout(() => {
        hourlyItem.style.transition = "opacity 0.6s ease-in-out";
        hourlyItem.style.opacity = 1; // Smooth fade-in effect
      }, 100); // Delay for smooth loading
      const tempC = (forecast.temperature * 9) / 5 + 32;
      hourlyItem.innerHTML = `
      <div class="time-head">
      <h4><i class="bx bx-time"></i> ${forecast.time}</h4>
      </div>

      <div class="predictions">
        <div class="data">
        <i class="bx bx-droplet"></i>
        <p>pH: ${forecast.ph.toFixed(1)}</p>
        </div>

        <div class="data">
          <i class="bx bxs-thermometer"></i> 
         <p>Temperature: ${tempC.toFixed(1)}°C</p>
        </div>

      </div>
      
  

    `;

      forecastContainer.appendChild(hourlyItem);
    });
  }
});
