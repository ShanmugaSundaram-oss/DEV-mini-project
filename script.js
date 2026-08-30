/* -------------------------------------------------------------
   TNEB Analytics - Data Exploration & Visualization (DEV) Logic
   Architecture: Tabbed SPA Router & Dynamic Visualization Engine
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initSpaRouter();
  initEdaHub();
  initCalculator();
  initApplianceSimulator();
  initSolarCalculator();
  initTariffComparisonChart();
});

/* =============================================================
   1. TABBED SPA ROUTER (NO SCROLLING PAGE SWITCHING)
   ============================================================= */

function initSpaRouter() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const pageViews = document.querySelectorAll('.page-view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPageId = btn.getAttribute('data-page');

      // Update Nav Buttons
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update Page Views
      pageViews.forEach(page => {
        if (page.id === targetPageId) {
          page.classList.add('active');
        } else {
          page.classList.remove('active');
        }
      });

      // Scroll smoothly to top of active container
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}


/* =============================================================
   2. EXPLORATORY DATA ANALYSIS (EDA) HUB & CHARTS
   ============================================================= */

let timeSeriesChartInstance = null;
let radarChartInstance = null;
let districtChartInstance = null;

// Datasets Mock Engine based on Kaggle TNEB & POSOCO Data
const kaggleDataStore = {
  hourly: {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    all: [14200, 13100, 12500, 14800, 18500, 19600, 19100, 18800, 19400, 20800, 21200, 17800],
    domestic: [4200, 3800, 3500, 4500, 6800, 6100, 5800, 5900, 6400, 8500, 9200, 7100],
    commercial: [2100, 1800, 1500, 2100, 4800, 6500, 6800, 6700, 6300, 5200, 4100, 3100],
    agricultural: [7900, 7500, 7500, 8200, 6900, 7000, 6500, 6200, 6700, 7100, 7900, 7600]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    all: [16500, 17200, 19800, 21200, 21900, 19400, 18200, 18500, 18900, 17800, 16900, 16200],
    domestic: [5100, 5400, 6900, 7800, 8200, 6800, 6200, 6300, 6500, 5900, 5300, 4900],
    commercial: [4200, 4500, 5300, 5800, 6100, 5200, 4800, 4900, 5100, 4700, 4400, 4100],
    agricultural: [7200, 7300, 7600, 7600, 7600, 7400, 7200, 7300, 7300, 7200, 7200, 7200]
  },
  yearly: {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
    all: [15200, 16100, 17500, 18600, 19800, 20400, 21200],
    domestic: [4500, 4800, 5400, 5900, 6500, 6800, 7200],
    commercial: [3800, 4100, 4600, 5100, 5600, 5900, 6300],
    agricultural: [6900, 7200, 7500, 7600, 7700, 7700, 7700]
  }
};

const rawDatasetSamples = [
  { time: '2026-08-30 20:00', region: 'Chennai South Feeder #4', cat: 'Domestic', load: '48.2 MW', status: 'Peak Load' },
  { time: '2026-08-30 20:00', region: 'Coimbatore LT Industrial', cat: 'Industrial', load: '62.8 MW', status: 'Normal' },
  { time: '2026-08-30 19:30', region: 'Thanjavur Rural Substation', cat: 'Agricultural', load: '34.1 MW', status: 'Optimal' },
  { time: '2026-08-30 19:00', region: 'Madurai Central Grid', cat: 'Commercial', load: '41.5 MW', status: 'Normal' },
  { time: '2026-08-30 18:30', region: 'Trichy City Feeder 2', cat: 'Domestic', load: '29.7 MW', status: 'Surge' },
  { time: '2026-08-30 18:00', region: 'Salem Steel Feeder', cat: 'Industrial', load: '88.4 MW', status: 'High Demand' },
  { time: '2026-08-30 17:30', region: 'Tirunelveli Solar Export', cat: 'Renewable', load: '112.0 MW', status: 'Export Active' },
  { time: '2026-08-30 17:00', region: 'Vellore Town Feeder', cat: 'Domestic', load: '22.3 MW', status: 'Normal' }
];

function initEdaHub() {
  const sectorFilter = document.getElementById('edaSectorFilter');
  const timeframeFilter = document.getElementById('edaTimeframeFilter');
  const tableSearch = document.getElementById('tableSearch');

  sectorFilter.addEventListener('change', updateEdaCharts);
  timeframeFilter.addEventListener('change', updateEdaCharts);

  tableSearch.addEventListener('input', (e) => {
    renderInspectorTable(e.target.value.toLowerCase());
  });

  renderInspectorTable('');
  renderEdaTimeSeriesChart();
  renderEdaSeasonalRadarChart();
  renderEdaDistrictChart();
}

function updateEdaCharts() {
  renderEdaTimeSeriesChart();
}

function renderEdaTimeSeriesChart() {
  const sector = document.getElementById('edaSectorFilter').value;
  const timeframe = document.getElementById('edaTimeframeFilter').value;

  const datasetConfig = kaggleDataStore[timeframe];
  const seriesData = datasetConfig[sector] || datasetConfig.all;

  const ctx = document.getElementById('edaTimeSeriesChart').getContext('2d');
  if (timeSeriesChartInstance) timeSeriesChartInstance.destroy();

  let strokeColor = '#8b5cf6';
  let fillColor = 'rgba(139, 92, 246, 0.15)';
  if (sector === 'domestic') { strokeColor = '#3b82f6'; fillColor = 'rgba(59, 130, 246, 0.15)'; }
  if (sector === 'commercial') { strokeColor = '#f59e0b'; fillColor = 'rgba(245, 158, 11, 0.15)'; }
  if (sector === 'agricultural') { strokeColor = '#10b981'; fillColor = 'rgba(16, 185, 129, 0.15)'; }

  timeSeriesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasetConfig.labels,
      datasets: [{
        label: `Power Demand Load (${sector.toUpperCase()}) - MW`,
        data: seriesData,
        borderColor: strokeColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: strokeColor,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function renderEdaSeasonalRadarChart() {
  const ctx = document.getElementById('edaSeasonalRadarChart').getContext('2d');
  if (radarChartInstance) radarChartInstance.destroy();

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Summer Peak (Apr-May)', 'South-West Monsoon (Jun-Aug)', 'North-East Monsoon (Oct-Nov)', 'Winter Mild (Dec-Feb)'],
      datasets: [
        {
          label: 'Domestic Load Share',
          data: [95, 68, 62, 55],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)'
        },
        {
          label: 'Agri Load Share',
          data: [88, 52, 90, 70],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
      },
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.1)' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
          ticks: { backdropColor: 'transparent', color: '#64748b' }
        }
      }
    }
  });
}

function renderEdaDistrictChart() {
  const ctx = document.getElementById('edaDistrictChart').getContext('2d');
  if (districtChartInstance) districtChartInstance.destroy();

  districtChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Thanjavur'],
      datasets: [
        { label: 'Domestic (MW)', data: [4200, 2800, 1900, 1500, 1600, 1100], backgroundColor: '#3b82f6' },
        { label: 'Commercial (MW)', data: [3100, 2200, 1400, 1100, 1200, 600], backgroundColor: '#f59e0b' },
        { label: 'Industrial (MW)', data: [2500, 4800, 1800, 1600, 3900, 400], backgroundColor: '#8b5cf6' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { stacked: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function renderInspectorTable(query) {
  const tbody = document.getElementById('datasetInspectorBody');
  const filtered = rawDatasetSamples.filter(item => 
    item.region.toLowerCase().includes(query) || 
    item.cat.toLowerCase().includes(query) ||
    item.status.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>${item.time}</td>
      <td><strong>${item.region}</strong></td>
      <td><span class="badge-tag">${item.cat}</span></td>
      <td>${item.load}</td>
      <td><strong class="${item.status.includes('Peak') || item.status.includes('Surge') ? 'text-amber' : 'text-emerald'}">${item.status}</strong></td>
    </tr>
  `).join('');
}


/* =============================================================
   3. TARIFF CALCULATOR ENGINE
   ============================================================= */

const unitsSlider = document.getElementById('unitsSlider');
const unitsInput = document.getElementById('unitsInput');
const unitsValBadge = document.getElementById('unitsVal');
const loadSlider = document.getElementById('loadSlider');
const loadInput = document.getElementById('loadInput');
const loadValBadge = document.getElementById('loadVal');
const connectionTypeSelect = document.getElementById('connectionType');

const totalBillAmountEl = document.getElementById('totalBillAmount');
const energyChargesEl = document.getElementById('energyCharges');
const fixedChargesEl = document.getElementById('fixedCharges');
const subsidyValueEl = document.getElementById('subsidyValue');
const subsidyTag = document.getElementById('subsidyTag');
const subsidyText = document.getElementById('subsidyText');
const slabTableBody = document.getElementById('slabTableBody');

function initCalculator() {
  unitsSlider.addEventListener('input', (e) => {
    unitsInput.value = e.target.value;
    unitsValBadge.textContent = `${e.target.value} Units`;
    calculateBill();
  });

  unitsInput.addEventListener('input', (e) => {
    let val = Math.max(0, parseInt(e.target.value) || 0);
    unitsSlider.value = Math.min(val, 1500);
    unitsValBadge.textContent = `${val} Units`;
    calculateBill();
  });

  loadSlider.addEventListener('input', (e) => {
    loadInput.value = e.target.value;
    loadValBadge.textContent = `${e.target.value} kW`;
    calculateBill();
  });

  loadInput.addEventListener('input', (e) => {
    let val = Math.max(1, parseInt(e.target.value) || 1);
    loadSlider.value = Math.min(val, 15);
    loadValBadge.textContent = `${val} kW`;
    calculateBill();
  });

  connectionTypeSelect.addEventListener('change', calculateBill);

  calculateBill();
}

function setPreset(units, load) {
  unitsSlider.value = units;
  unitsInput.value = units;
  unitsValBadge.textContent = `${units} Units`;

  loadSlider.value = load;
  loadInput.value = load;
  loadValBadge.textContent = `${load} kW`;

  calculateBill();
}

function calculateBill() {
  const units = parseInt(unitsInput.value) || 0;
  const loadKw = parseInt(loadInput.value) || 1;
  const connectionType = connectionTypeSelect.value;

  let energyCost = 0;
  let fixedCost = 0;
  let subsidyAmount = 0;
  let slabs = [];

  if (connectionType === 'domestic') {
    fixedCost = loadKw * 51 * 2;

    if (units <= 500) {
      subsidyText.textContent = "200 Free Units Applied (Category A)";
      subsidyTag.style.display = "inline-flex";

      const slab1Units = Math.min(units, 200);
      slabs.push({ range: "0 – 200 Units", units: slab1Units, rate: "FREE (₹0.00)", cost: 0 });
      subsidyAmount = slab1Units * 4.70;

      if (units > 200) {
        const slab2Units = Math.min(units - 200, 200);
        const cost2 = slab2Units * 4.70;
        energyCost += cost2;
        slabs.push({ range: "201 – 400 Units", units: slab2Units, rate: "₹4.70", cost: cost2 });
      }

      if (units > 400) {
        const slab3Units = units - 400;
        const cost3 = slab3Units * 6.30;
        energyCost += cost3;
        slabs.push({ range: "401 – 500 Units", units: slab3Units, rate: "₹6.30", cost: cost3 });
      }

    } else {
      subsidyText.textContent = "100 Free Units Applied (Category B)";
      subsidyTag.style.display = "inline-flex";

      const slab1Units = Math.min(units, 100);
      slabs.push({ range: "0 – 100 Units", units: slab1Units, rate: "FREE (₹0.00)", cost: 0 });
      subsidyAmount = slab1Units * 4.70;

      if (units > 100) {
        const slab2Units = Math.min(units - 100, 300);
        const cost2 = slab2Units * 4.70;
        energyCost += cost2;
        slabs.push({ range: "101 – 400 Units", units: slab2Units, rate: "₹4.70", cost: cost2 });
      }

      if (units > 400) {
        const slab3Units = Math.min(units - 400, 100);
        const cost3 = slab3Units * 6.30;
        energyCost += cost3;
        slabs.push({ range: "401 – 500 Units", units: slab3Units, rate: "₹6.30", cost: cost3 });
      }

      if (units > 500) {
        const slab4Units = Math.min(units - 500, 100);
        const cost4 = slab4Units * 8.40;
        energyCost += cost4;
        slabs.push({ range: "501 – 600 Units", units: slab4Units, rate: "₹8.40", cost: cost4 });
      }

      if (units > 600) {
        const slab5Units = Math.min(units - 600, 200);
        const cost5 = slab5Units * 9.45;
        energyCost += cost5;
        slabs.push({ range: "601 – 800 Units", units: slab5Units, rate: "₹9.45", cost: cost5 });
      }

      if (units > 800) {
        const slab6Units = Math.min(units - 800, 200);
        const cost6 = slab6Units * 10.50;
        energyCost += cost6;
        slabs.push({ range: "801 – 1000 Units", units: slab6Units, rate: "₹10.50", cost: cost6 });
      }

      if (units > 1000) {
        const slab7Units = units - 1000;
        const cost7 = slab7Units * 11.55;
        energyCost += cost7;
        slabs.push({ range: "Above 1000 Units", units: slab7Units, rate: "₹11.55", cost: cost7 });
      }
    }
  } else if (connectionType === 'commercial') {
    fixedCost = loadKw * 150 * 2;
    energyCost = units * 9.50;
    subsidyAmount = 0;
    subsidyTag.style.display = "none";
    slabs.push({ range: "All Consumption", units: units, rate: "₹9.50", cost: energyCost });
  } else {
    fixedCost = loadKw * 200 * 2;
    energyCost = units * 7.80;
    subsidyAmount = 0;
    subsidyTag.style.display = "none";
    slabs.push({ range: "All Consumption", units: units, rate: "₹7.80", cost: energyCost });
  }

  const totalBill = Math.round(energyCost + fixedCost);

  totalBillAmountEl.textContent = `₹ ${totalBill.toLocaleString('en-IN')}`;
  energyChargesEl.textContent = `₹ ${energyCost.toFixed(2)}`;
  fixedChargesEl.textContent = `₹ ${fixedCost.toFixed(2)}`;
  subsidyValueEl.textContent = `- ₹ ${subsidyAmount.toFixed(2)}`;

  slabTableBody.innerHTML = slabs.map(s => `
    <tr>
      <td>${s.range}</td>
      <td>${s.units}</td>
      <td>${s.rate}</td>
      <td><strong>₹ ${s.cost.toFixed(2)}</strong></td>
    </tr>
  `).join('');
}


/* =============================================================
   4. APPLIANCE LOAD PROFILER
   ============================================================= */

let applianceChartInstance = null;

function initApplianceSimulator() {
  const acHours = document.getElementById('acHours');
  const fridgeHours = document.getElementById('fridgeHours');
  const geyserHours = document.getElementById('geyserHours');
  const lightsHours = document.getElementById('lightsHours');

  const acVal = document.getElementById('acHoursVal');
  const fridgeVal = document.getElementById('fridgeHoursVal');
  const geyserVal = document.getElementById('geyserHoursVal');
  const lightsVal = document.getElementById('lightsHoursVal');

  const updateSim = () => {
    acVal.textContent = `${acHours.value} hrs/day`;
    fridgeVal.textContent = `${fridgeHours.value} hrs/day`;
    geyserVal.textContent = `${geyserHours.value} hrs/day`;
    lightsVal.textContent = `${lightsHours.value} hrs/day`;
    calculateSimulatedUsage();
  };

  [acHours, fridgeHours, geyserHours, lightsHours].forEach(el => {
    el.addEventListener('input', updateSim);
  });

  calculateSimulatedUsage();
}

function calculateSimulatedUsage() {
  const acH = parseFloat(document.getElementById('acHours').value) || 0;
  const fridgeH = parseFloat(document.getElementById('fridgeHours').value) || 0;
  const geyserH = parseFloat(document.getElementById('geyserHours').value) || 0;
  const lightsH = parseFloat(document.getElementById('lightsHours').value) || 0;

  const acUnits = Math.round(1.5 * acH * 60);
  const fridgeUnits = Math.round(0.2 * fridgeH * 60);
  const geyserUnits = Math.round(2.0 * geyserH * 60);
  const lightsUnits = Math.round(0.35 * lightsH * 60);

  const totalUnits = acUnits + fridgeUnits + geyserUnits + lightsUnits;

  let energyCost = 0;
  if (totalUnits <= 500) {
    if (totalUnits > 200) energyCost += Math.min(totalUnits - 200, 200) * 4.70;
    if (totalUnits > 400) energyCost += (totalUnits - 400) * 6.30;
  } else {
    if (totalUnits > 100) energyCost += Math.min(totalUnits - 100, 300) * 4.70;
    if (totalUnits > 400) energyCost += Math.min(totalUnits - 400, 100) * 6.30;
    if (totalUnits > 500) energyCost += Math.min(totalUnits - 500, 100) * 8.40;
    if (totalUnits > 600) energyCost += Math.min(totalUnits - 600, 200) * 9.45;
    if (totalUnits > 800) energyCost += Math.min(totalUnits - 800, 200) * 10.50;
    if (totalUnits > 1000) energyCost += (totalUnits - 1000) * 11.55;
  }

  const fixedCost = 2 * 51 * 2;
  const totalBill = Math.round(energyCost + fixedCost);

  document.getElementById('simTotalUnits').textContent = `${totalUnits} Units`;
  document.getElementById('simTotalBill').textContent = `₹ ${totalBill.toLocaleString('en-IN')}`;

  const ctx = document.getElementById('applianceChart').getContext('2d');
  if (applianceChartInstance) applianceChartInstance.destroy();

  applianceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['1.5T Air Conditioner', '250L Refrigerator', 'Water Geyser', 'Fans & LED Lights'],
      datasets: [{
        data: [acUnits, fridgeUnits, geyserUnits, lightsUnits],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
      },
      cutout: '70%'
    }
  });
}


/* =============================================================
   5. SOLAR NET-METERING & CUMULATIVE ROI CHART
   ============================================================= */

let solarRoiChartInstance = null;

function initSolarCalculator() {
  const solarCapSlider = document.getElementById('solarCapSlider');
  const solarCapVal = document.getElementById('solarCapVal');
  const solarUsageSlider = document.getElementById('solarUsageSlider');
  const solarUsageVal = document.getElementById('solarUsageVal');

  const updateSolar = () => {
    solarCapVal.textContent = `${solarCapSlider.value} kW`;
    solarUsageVal.textContent = `${solarUsageSlider.value} Units`;

    const cap = parseFloat(solarCapSlider.value);
    const usage = parseFloat(solarUsageSlider.value);

    const biGen = Math.round(cap * 240);
    const netUsage = Math.max(0, usage - biGen);

    const billBefore = calculateRawBill(usage);
    const billAfter = calculateRawBill(netUsage);

    const biSavings = Math.max(0, billBefore - billAfter);
    const annualSavings = biSavings * 6;

    const solarSystemCost = cap * 45000;
    const paybackYears = (solarSystemCost / annualSavings).toFixed(1);

    document.getElementById('solarGenUnits').textContent = `${biGen} Units`;
    document.getElementById('solarBiSavings').textContent = `₹ ${biSavings.toLocaleString('en-IN')}`;
    document.getElementById('solarAnnualSavings').textContent = `₹ ${annualSavings.toLocaleString('en-IN')}`;
    document.getElementById('solarPayback').textContent = `${paybackYears} Years`;

    renderSolarRoiChart(solarSystemCost, annualSavings);
  };

  solarCapSlider.addEventListener('input', updateSolar);
  solarUsageSlider.addEventListener('input', updateSolar);

  updateSolar();
}

function calculateRawBill(units) {
  let energyCost = 0;
  if (units <= 500) {
    if (units > 200) energyCost += Math.min(units - 200, 200) * 4.70;
    if (units > 400) energyCost += (units - 400) * 6.30;
  } else {
    if (units > 100) energyCost += Math.min(units - 100, 300) * 4.70;
    if (units > 400) energyCost += Math.min(units - 400, 100) * 6.30;
    if (units > 500) energyCost += Math.min(units - 500, 100) * 8.40;
    if (units > 600) energyCost += Math.min(units - 600, 200) * 9.45;
    if (units > 800) energyCost += Math.min(units - 800, 200) * 10.50;
    if (units > 1000) energyCost += (units - 1000) * 11.55;
  }
  return Math.round(energyCost + 102);
}

function renderSolarRoiChart(initialCost, annualSavings) {
  const ctx = document.getElementById('solarRoiChart').getContext('2d');
  if (solarRoiChartInstance) solarRoiChartInstance.destroy();

  const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const investment = years.map(() => -initialCost);
  const cumulativeReturn = years.map(y => (annualSavings * y) - initialCost);

  solarRoiChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(y => `Year ${y}`),
      datasets: [
        {
          label: 'Cumulative Net Savings (₹)',
          data: cumulativeReturn,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Initial Capital Investment (₹)',
          data: investment,
          borderColor: '#f43f5e',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}


/* =============================================================
   6. TARIFF COMPARISON MATRIX CHART
   ============================================================= */

function initTariffComparisonChart() {
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  
  const unitSteps = [150, 300, 450, 600, 800, 1000];
  const oldBills = [220, 670, 1530, 2950, 4850, 7200];
  const newBills = [102, 572, 1392, 2342, 4472, 6572];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: unitSteps.map(u => `${u} Units`),
      datasets: [
        {
          label: '2026 Revised Tariff Rules',
          data: newBills,
          backgroundColor: '#10b981',
          borderRadius: 6
        },
        {
          label: 'Previous Benchmark Tariff',
          data: oldBills,
          backgroundColor: '#64748b',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}
