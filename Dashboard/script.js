const metricValues = document.querySelectorAll(".metric-value");
const exportButton = document.querySelector(".action-btn");
const salesCanvas = document.getElementById("salesChart");
const usersCanvas = document.getElementById("usersChart");
const trafficCanvas = document.getElementById("trafficChart");

const numberFormatter = new Intl.NumberFormat("ar-EG");
let chartInstances = [];

const baseChartData = {
  months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
  sales: [120, 162, 150, 185, 210, 238],
  users: [320, 420, 510, 560, 610, 690],
  channels: [48, 27, 16, 9]
};

animateMetricCards();
renderCharts();
setupExportButton();

function animateMetricCards() {
  metricValues.forEach((el) => {
    const target = Number(el.dataset.target);
    const format = el.dataset.format || "number";
    const startTime = performance.now();
    const duration = 1000;

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = target * easeOutCubic(progress);
      el.textContent = formatMetricValue(value, format);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatMetricValue(target, format);
      }
    };

    requestAnimationFrame(step);
  });
}

function renderCharts() {
  if (typeof Chart === "undefined") {
    renderFallback("Chart.js غير متاح حاليًا. تأكد من الاتصال بالإنترنت.");
    return;
  }

  Chart.defaults.font.family = "Alexandria, sans-serif";
  Chart.defaults.color = "#5f7a8c";

  destroyCharts();

  const lineCtx = salesCanvas.getContext("2d");
  const fillGradient = lineCtx.createLinearGradient(0, 0, 0, 250);
  fillGradient.addColorStop(0, "rgba(10, 165, 154, 0.35)");
  fillGradient.addColorStop(1, "rgba(10, 165, 154, 0.02)");

  chartInstances.push(
    new Chart(lineCtx, {
      type: "line",
      data: {
        labels: baseChartData.months,
        datasets: [
          {
            label: "المبيعات (بالألف)",
            data: baseChartData.sales,
            borderColor: "#0aa59a",
            backgroundColor: fillGradient,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 3,
            pointBackgroundColor: "#0b7a74"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(16, 37, 54, 0.08)" }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    })
  );

  chartInstances.push(
    new Chart(usersCanvas, {
      type: "bar",
      data: {
        labels: baseChartData.months,
        datasets: [
          {
            label: "مستخدمون جدد",
            data: baseChartData.users,
            backgroundColor: [
              "#0aa59a",
              "#18b9ae",
              "#2cc7bc",
              "#49d2c8",
              "#63ddcf",
              "#7be5d8"
            ],
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(16, 37, 54, 0.08)" }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    })
  );

  chartInstances.push(
    new Chart(trafficCanvas, {
      type: "doughnut",
      data: {
        labels: ["إعلانات", "بحث عضوي", "سوشيال", "إحالات"],
        datasets: [
          {
            data: baseChartData.channels,
            backgroundColor: ["#0aa59a", "#ea8f28", "#1f6ea0", "#95a8b6"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, usePointStyle: true, pointStyle: "circle" }
          }
        },
        cutout: "68%"
      }
    })
  );
}

function destroyCharts() {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances = [];
}

function renderFallback(message) {
  [salesCanvas, usersCanvas, trafficCanvas].forEach((canvas) => {
    const holder = document.createElement("div");
    holder.className = "chart-fallback";
    holder.textContent = message;
    canvas.replaceWith(holder);
  });
}

function setupExportButton() {
  if (!exportButton) {
    return;
  }

  exportButton.addEventListener("click", () => {
    const rows = [
      ["metric", "value"],
      ["total_users", "12840"],
      ["total_sales_egp", "364200"],
      ["new_customers", "1240"],
      ["conversion_rate_percent", "4.8"]
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-report.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

function formatMetricValue(value, format) {
  if (format === "currency") {
    return `${numberFormatter.format(Math.round(value))} EGP`;
  }

  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }

  return numberFormatter.format(Math.round(value));
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}
