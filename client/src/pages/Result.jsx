import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ForecastChart from "../components/ForecastChart";
import ForecastTable from "../components/ForecastTable";
import ComparisonChart from "../components/ComparisonChart";

import "../assets/styles/result.css";

function Result() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const [selectedItem, setSelectedItem] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const [search, setSearch] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const sid = localStorage.getItem("session_id");

    if (!sid) {
      setError("No active session. Please upload a CSV first.");
      return;
    }

    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchItems = async () => {
      try {
        const res = await fetch(`http://localhost:8000/data/${sessionId}`);
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
  }, [sessionId]);

  useEffect(() => {
    if (selectedItem && !filteredItems.includes(selectedItem)) {
      setSelectedItem(null);
      setForecastData(null);
      setHistoryData([]);
    }
  }, [search, filteredItems, selectedItem]);

  const handleClick = async (item) => {
    setSelectedItem(item);
    setForecastData(null);
    setHistoryData([]);

    try {
      const [forecastRes, historyRes] = await Promise.all([
        fetch(
          `http://localhost:8000/forecast/${sessionId}/${encodeURIComponent(
            item
          )}`
        ),
        fetch(
          `http://localhost:8000/history/${sessionId}/${encodeURIComponent(
            item
          )}`
        ),
      ]);

      if (!forecastRes.ok || !historyRes.ok) {
        setError("Failed to load data");
        return;
      }

      const forecastData = await forecastRes.json();
      const historyData = await historyRes.json();

      setForecastData(forecastData);
      setHistoryData(historyData.history);
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

              <div className="view-switcher">
                <button
                  className={viewMode === "table" ? "active" : ""}
                  onClick={() => setViewMode("table")}
                >
                  Table
                </button>
                <button
                  className={viewMode === "chart" ? "active" : ""}
                  onClick={() => setViewMode("chart")}
                >
                  Chart
                </button>
              </div>

              <div className="forecast-view">
                <div
                  style={{ display: viewMode === "chart" ? "block" : "none" }}
                >
                  <ForecastChart data={forecastData.forecast} />
                </div>

                <div
                  style={{ display: viewMode === "table" ? "block" : "none" }}
                >
                  <ForecastTable data={forecastData.forecast} />
                </div>
              </div>

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
                    <strong>MASE:</strong> {forecastData.metrics.mase}
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
        </div>
      </section>
    </>
  );
}

export default Result;
