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
              'product_name', 'quantity_sold', and 'date'
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
              MAE (Mean Absolute Error) : On average, the prediction is off by X
              units
            </li>
            <li className="tutorial-item">
              RMSE (Root Mean Squared Error) : On average, the prediction is off
              by X units, but large mistakes are penalized more heavily than
              small ones
            </li>
            <li className="tutorial-item">
              MAPE (Mean Absolute Percentage Error) : On average, the prediction
              is off by X percent
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

export default Tutorial;
