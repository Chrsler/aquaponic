// Existing notifications array, unread count, and email retrieval
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

// localStorage.clear();

let unreadCount = notifications.length;
let unreadNotifications = [];
const user_Email = localStorage.getItem("userEmail");

// pH level thresholds for notifications
const pH_HIGH_THRESHOLD = 8.0; // Example high pH threshold
const pH_LOW_THRESHOLD = 6.5; // Example low pH threshold

// Update notification count
function updateNotificationCount() {
  const countElement = document.getElementById("notification-count");
  if (unreadCount > 0) {
    countElement.textContent = unreadCount;
    countElement.style.display = "inline";
  } else {
    countElement.style.display = "none";
  }
}

// Toggle notifications dropdown visibility
function toggleNotifications() {
  const dropdown = document.getElementById("notification-dropdown");
  dropdown.classList.toggle("hidden");
  displayNotifications();
}

// Display notifications in the list
function displayNotifications() {
  const list = document.getElementById("notification-list");
  list.innerHTML = "";
  if (notifications.length === 0) {
    const noNotif = document.createElement("li");
    noNotif.textContent = "No notifications";
    noNotif.style.textAlign = "center";
    list.appendChild(noNotif);
  } else {
    notifications.forEach((notification) => {
      const li = document.createElement("li");
      li.textContent = notification.message;
      if (notification.unread) li.classList.add("unread");
      list.insertBefore(li, list.firstChild);
    });
  }
}

// Mark all notifications as read
function markAllAsRead() {
  unreadCount = 0;
  notifications.forEach((notification) => (notification.unread = false));
  updateNotificationCount();
  displayNotifications();
  localStorage.setItem("notifications", JSON.stringify(notifications)); // Update localStorage
}

// Function to send email notifications
function sendEmailNotification(user_Email, Emessage) {
  const emailData = {
    sender: { email: "youraquaponics@gmail.com" },
    //sender: { email: "chrysle.rob26@gmail.com" },
    to: [{ email: user_Email }],
    subject: "Aquaponics Notification",
    // htmlContent: `<p>${message}</p>`,
    htmlContent: Emessage,
  };

  if (!user_Email || !Emessage) {
    console.error("Email or message is missing!");
    return;
  }

  fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key":
        "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",
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.messageId) {
        console.log("Email sent successfully!", data);
      } else {
        console.error("Unexpected response or error sending email:", data);
      }
    });
}

// Monitor the pH level and trigger notifications
function monitorPHLevel() {
  const pHElement = document.getElementById("current-pH-level");
  const pHLevel = parseFloat(pHElement.textContent);

  if (isNaN(pHLevel)) {
    console.error("Invalid pH level detected.");
    return;
  }

  let Emessage;
  if (pHLevel > pH_HIGH_THRESHOLD) {
    Emessage = `
    <div>
      <h3 style="color: red;">Warning: pH level is high!</h3>
      <p><strong>Current pH Level:</strong> <span style="font-size: 1.2em; font-weight: bold;">${pHLevel} pH</span></p>
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li><strong>Add acidic solutions</strong> (such as vinegar or citric acid) gradually to lower the pH.</li>
        <li><strong>Check your water source</strong> and consider using a neutral or slightly acidic alternative if possible.</li>
        <li><strong>Monitor plant and fish reactions</strong> to high pH and avoid sudden pH changes that could cause stress.</li>
      </ul>
      <p><strong>Consequences of High pH:</strong></p>
      <ul>
        <li>High pH can lead to <strong>nutrient deficiencies in plants</strong> as certain nutrients become less available.</li>
        <li>Fish may experience <strong>stress</strong>, leading to weakened immune systems, decreased appetite, and slower growth.</li>
      </ul>
      <p><strong>Tip:</strong> Regular pH monitoring can help you detect trends early and prevent imbalances that might otherwise go unnoticed.</p>
    </div>
  `;
  } else if (pHLevel < pH_LOW_THRESHOLD) {
    Emessage = `
    <div>
      <h3 style="color: red;">Warning: pH level is low!</h3>
      <p><strong>Current pH Level:</strong> <span style="font-size: 1.2em; font-weight: bold;">${pHLevel} pH</span></p>
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li><strong>Add alkaline solutions</strong> (such as baking soda or calcium carbonate) carefully to raise the pH.</li>
        <li><strong>Evaluate the balance of fish and plants</strong> in your system, as excess plant life can lower pH over time.</li>
        <li><strong>Test pH in increments</strong> to avoid overshooting the desired range.</li>
      </ul>
      <p><strong>Consequences of Low pH:</strong></p>
      <ul>
        <li>Acidic water can <strong>damage plant roots</strong> and reduce their nutrient uptake.</li>
        <li>Fish are at risk for <strong>respiratory stress</strong> and potential acid burns to gills and scales.</li>
      </ul>
      <p><strong>Tip:</strong> Maintain pH between <strong>6.5 and 7.5</strong> for most aquaponic systems, as this range supports plant nutrient uptake and fish health.</p>
    </div>
  `;
  } else {
    Emessage = `
    <div>
      <h3 style="color: green;">pH level is neutral and within the safe range.</h3>
      <p>Your system is currently balanced and healthy.</p>
      <p><strong>Current pH Level:</strong> <span style="font-size: 1.2em; font-weight: bold;">${pHLevel} pH</span></p>
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li><strong>Regularly monitor the pH</strong> to maintain this balance.</li>
        <li><strong>Observe fish and plant health</strong> as indicators of any slow changes in pH.</li>
      </ul>
      <p><strong>Benefits of Balanced pH:</strong></p>
      <ul>
        <li>Plants have <strong>optimal nutrient absorption</strong>, leading to healthier growth.</li>
        <li>Fish remain <strong>comfortable</strong>, reducing stress and risk of disease.</li>
      </ul>
      <p><strong>Tip:</strong> Record pH levels to track long-term stability and make note of any factors that might influence pH over time (e.g., water changes, feeding habits).</p>
    </div>
  `;
  }

  // Send a notification and email if a message is generated
  if (Emessage) {
    // receiveNotification(message, user_Email);
    sendEmailNotification(user_Email, Emessage);
  }
}

// Simulate receiving a notification
function receiveNotification(Emessage, user_Email) {
  notifications.push({ message: Emessage, unread: true });
  unreadCount++;
  updateNotificationCount();
  displayNotifications();
  localStorage.setItem("notifications", JSON.stringify(notifications)); // Store notifications in localStorage
  sendEmailNotification(user_Email, Emessage);
}



// Set an interval to monitor pH level every few seconds (adjust interval as needed)
setInterval(monitorPHLevel, 3 * 60 * 60 * 1000);
// setInterval(monitorPHLevel, 5000);

// Initialize the notification count
updateNotificationCount();
