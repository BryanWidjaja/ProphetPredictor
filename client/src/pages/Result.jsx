import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ForecastChart from "../components/ForecastChart";
import ComparisonChart from "../components/ComparisonChart";

import "../assets/styles/result.css";

function Result() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [seasonality, setSeasonality] = useState(null);

  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:8000/data");
        const data = await res.json();

        if (!res.ok) {
          setError("Failed to load data");
          return;
        }

        setItems(data);
      } catch {
        setError("Cannot connect to server");
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItem && !filteredItems.includes(selectedItem)) {
      setSelectedItem(null);
      setForecastData(null);
      setHistoryData([]);
      setSeasonality(null);
    }
  }, [search, filteredItems, selectedItem]);

  const handleClick = async (item) => {
    setSelectedItem(item);
    setForecastData(null);
    setHistoryData([]);
    setSeasonality(null);

    try {
      const [forecastRes, historyRes, seasonalityRes] = await Promise.all([
        fetch(`http://localhost:8000/forecast/${encodeURIComponent(item)}`),
        fetch(`http://localhost:8000/history/${encodeURIComponent(item)}`),
        fetch(`http://localhost:8000/seasonality/${encodeURIComponent(item)}`),
      ]);

      if (!forecastRes.ok || !historyRes.ok || !seasonalityRes.ok) {
        setError("Failed to load data");
        return;
      }

      const forecastData = await forecastRes.json();
      const historyData = await historyRes.json();
      const seasonalityData = await seasonalityRes.json();

      setForecastData(forecastData);
      setHistoryData(historyData.history);
      setSeasonality(seasonalityData.seasonality);
    } catch {
      setError("Cannot connect to server");
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar></Navbar>
      <section className="main-section">
        <div className="items-sidebar">
          <p className="items-sidebar-header">Items</p>

          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="items-searchbar"
          />

          {filteredItems.map((name, idx) => (
            <div
              key={idx}
              className={`item ${name === selectedItem ? "active" : ""}`}
              onClick={() => handleClick(name)}
            >
              {name}
            </div>
          ))}
        </div>
        <div className="items-info-container">
          {!selectedItem && (
            <div className="no-items-selected">
              <p>Select an item</p>
            </div>
          )}

          {forecastData && (
            <>
              <h1 className="item-header">{forecastData.product}</h1>

              <ForecastChart data={forecastData.forecast} />

              <hr className="h-line"></hr>

              <div className="metrics-container">
                <h2>Evaluation Metrics</h2>
                <div className="metrics">
                  <p>
                    <strong>MAE:</strong> {forecastData.metrics.mae}
                  </p>
                  <p>
                    <strong>RMSE:</strong> {forecastData.metrics.rmse}
                  </p>
                  <p>
                    <strong>MAPE:</strong> {forecastData.metrics.mape}
                  </p>
                </div>
              </div>
            </>
          )}

          <hr className="h-line"></hr>

          {Array.isArray(historyData) && historyData.length > 0 && (
            <>
              <h2>Actual vs Predicted (Training Period)</h2>
              <ComparisonChart data={historyData} />
            </>
          )}

          <hr className="h-line"></hr>

          {seasonality && (
            <div className="seasonality-container">
              <h2>Detected Seasonality</h2>

              <div className="seasonalities">
                <p>
                  <strong>Data Frequency:</strong> {seasonality.frequency}
                </p>
                <p>
                  <strong>Yearly Pattern:</strong>{" "}
                  {seasonality.yearly ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Monthly Pattern:</strong>{" "}
                  {seasonality.monthly ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Weekly Pattern:</strong>{" "}
                  {seasonality.weekly ? "Yes" : "No"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Result;
