import Navbar from "../components/Navbar";

import "../assets/styles/tutorial.css";

function Tutorial() {
  return (
    <>
      <Navbar></Navbar>
      <section className="main-section tutorial">
        <div className="tutorial-container">
          <h1 className="tutorial-header">How To Use</h1>
          <ol className="tutorial-items">
            <li className="tutorial-item">
              Ensure your CSV contains the following case-sensitive columns :
              <div className="inner-tutorial-container">
                <ol className="tutorial-items">
                  <li className="tutorial-item">'product_name'</li>
                  <li className="tutorial-item">'quantity_sold'</li>
                  <li className="tutorial-item">'date'</li>
                </ol>
              </div>
            </li>
            <li className="tutorial-item">
              Click the uploader, and select a CSV file
            </li>
            <li className="tutorial-item">
              Click the "Upload CSV" button to begin the analysis
            </li>
            <li className="tutorial-item">
              Please wait a moment while the system processes your data.
            </li>
          </ol>
        </div>

        <hr className="h-line"></hr>

        <div className="tutorial-container">
          <h1 className="tutorial-header">Evaluation Metrics</h1>
          <ol className="tutorial-items">
            <li className="tutorial-item">
              MAE (Mean Absolute Error): On average, the prediction is off by X
              units. (Lower is better)
            </li>
            <li className="tutorial-item">
              RMSE (Root Mean Squared Error): On average, the prediction is off
              by X units, but large mistakes are penalized more than small ones.
              (Lower is better)
            </li>
            <li className="tutorial-item">
              MASE (Mean Absolute Scaled Error): Measures forecast error
              relative to a naive baseline (predicting the previous period).
              Values below 1 mean the model is better than the naive forecast.
              (Lower is better)
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

export default Tutorial;
