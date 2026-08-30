# 📊 TNEB Data Exploration & Visualization Platform (DEV Mini Project)

An interactive, multi-page web platform for **Data Exploration & Visualization (DEV)** analyzing Tamil Nadu Electricity Board (TNEB) power consumption datasets from Kaggle and 2026 Government Tariff Rules.

---

## 🌟 Key Features

1. **Exploratory Data Analysis (EDA) Hub**:
   - **Interactive Time-Series Load Explorer**: Filter power demand by sector (*Domestic*, *Commercial*, *Agricultural*, *All*) and timeframe (*Hourly*, *Monthly*, *Multi-Year*).
   - **Seasonal Demand Radar Chart**: Multivariate profile showing demand shifts across Summer, Monsoons, and Winter.
   - **District Breakdown Chart**: Stacked bar chart visualizing demand across major Tamil Nadu districts (*Chennai*, *Coimbatore*, *Madurai*, *Trichy*, *Salem*, *Thanjavur*).
   - **Dataset Inspector Table**: Real-time searchable inspector for Kaggle dataset samples.

2. **2026 Electricity Tariff Calculator**:
   - **Category A ($\le$ 500 Units)**: First 200 Units **100% Free (₹0.00)**.
   - **Category B ($>$ 500 Units)**: First 100 Units Free, progressive slab tiers up to ₹11.55/unit.
   - **Fixed Monthly Charge**: Automatic computation of Contracted Load ($\text{kW} \times \text{₹}51 \times 2\text{ months}$).

3. **Appliance Load Profiler & Simulator**:
   - Appliance runtime sliders (AC, Refrigerator, Geyser, Fans & LED lights).
   - Real-time Donut Chart breakdown of household energy drivers.

4. **Solar Rooftop Net-Metering & ROI Calculator**:
   - 10-Year cumulative financial ROI projection curve showing investment payback crossover.

5. **Comparative Policy Matrix**:
   - Multi-bar chart comparing 2026 revised tariffs against historical benchmark structures.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism Dark Theme), JavaScript (ES6+)
- **Visualization Library**: Chart.js 4.4.1
- **Icons & Typography**: FontAwesome 6, Google Fonts (Plus Jakarta Sans)
- **Data Sources**: Kaggle Open Datasets (*TNEB Household Power Consumption*, *Tamilnadu Board Hourly Readings*, *India POSOCO Demand*)

---

## 🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ShanmugaSundaram-oss/DEV-mini-project.git
   cd DEV-mini-project
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8085
   ```

3. Open `http://localhost:8085` in your browser.
