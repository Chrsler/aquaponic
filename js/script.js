// SIDEBAR TOGGLE

let sidebarOpen = false;
const sidebar = document.getElementById("sidebar");

function openSidebar() {
  if (!sidebarOpen) {
    sidebar.classList.add("sidebar-responsive");
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen) {
    sidebar.classList.remove("sidebar-responsive");
    sidebarOpen = false;
  }
}

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

// ---------- CHARTS ----------

// BAR CHART
const barChartOptions = {
  series: [
    {
      data: [8, 30],
    },
  ],
  chart: {
    type: "bar",
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ["#142F40", "#65929F"],
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      horizontal: false,
      columnWidth: "40%",
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: ["pH", "Temperature"],
  },
  yaxis: {
    title: {
      text: "Count",
    },
  },
};

const barChart = new ApexCharts(
  document.querySelector("#bar-chart"),
  barChartOptions
);
barChart.render();

// Get the current pH value and update the bar chart
phRef.limitToLast(1).on("child_added", function (snapshot) {
  const pHValue = snapshot.val();
  tempRef.limitToLast(1).on("child_added", function (snapshot) {
    const tempValue = snapshot.val();
    // Update the pH value in the bar chart data
    barChart.updateSeries([
      {
        data: [pHValue, tempValue], // Update only the pH value, Temperature remains the same (30)
      },
    ]);
  });
});

// AREA CHART
const areaChartOptions = {
  series: [
    {
      name: "pH",
      data: [31, 40, 28, 51, 42, 109, 100],
    },
    {
      name: "Temp",
      data: [11, 32, 45, 32, 34, 52, 41],
    },
  ],
  chart: {
    height: 350,
    type: "area",
    toolbar: {
      show: false,
    },
  },
  colors: ["#4f35a1", "#246dec"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
  },
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  markers: {
    size: 0,
  },
  yaxis: [
    {
      title: {
        text: "Before",
      },
    },
    {
      opposite: true,
      title: {
        text: "Present",
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
  },
};

const areaChart = new ApexCharts(
  document.querySelector("#area-chart"),
  areaChartOptions
);
areaChart.render();
