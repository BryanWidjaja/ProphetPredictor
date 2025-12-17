import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ForecastChart from "../components/ForecastChart";

import "../assets/styles/result.css";

function Result() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [forecastData, setForecastData] = useState(null);

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

  const handleClick = async (item) => {
    setSelectedItem(item);
    setForecastData(null);

    try {
      const res = await fetch(
        `http://localhost:8000/forecast/${encodeURIComponent(item)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError("Failed to load forecast");
        return;
      }

      setForecastData(data);
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
          {items.map((name, idx) => (
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
          {!selectedItem && <p>Select an item</p>}

          {forecastData && (
            <>
              <h2>{forecastData.product}</h2>

              <ForecastChart data={forecastData.forecast} />

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
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default Result;
