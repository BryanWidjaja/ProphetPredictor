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
          <h1 className="tutorial-header">Forecast Results</h1>
          <p className="tutorial-desc">
            The table / chart will show the forecasted stock needed for the next
            12 months
          </p>
          <ol className="tutorial-items">
            <li className="tutorial-item">
              Forecast
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    This shows the predicted stock of the metric for that month.
                    For example, 94 under 2026-01-01 means the forecasted stock
                    for January 2026 is 94.
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              Lower
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    This shows the lower bound of the forecast. It represents
                    the minimum value the metric is expected to be, considering
                    uncertainty. For January 2026, the lower bound is 77.
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              Upper
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    This shows the upper bound of the forecast. It represents
                    the maximum value the metric is expected to be. For January
                    2026, the upper bound is 113.
                  </li>
                </ul>
              </div>
            </li>
          </ol>
        </div>

        <hr className="h-line"></hr>

        <div className="tutorial-container">
          <h1 className="tutorial-header">Evaluation Metrics</h1>
          <p className="tutorial-desc">
            Metrics used to evaluate the accuracy of the model
          </p>
          <ol className="tutorial-items">
            <li className="tutorial-item">
              MAE (Mean Absolute Error)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    On average, the prediction is off by X units. (Lower is
                    better)
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              RMSE (Root Mean Squared Error)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    On average, the prediction is off by X units, but large
                    mistakes are penalized more than small ones. (Lower is
                    better)
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              MASE (Mean Absolute Scaled Error)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    Measures forecast error relative to a naive baseline
                    (predicting the previous period). Values below 1 mean the
                    model is better than the naive forecast. (Lower is better)
                  </li>
                </ul>
              </div>
            </li>
          </ol>
        </div>

        <hr className="h-line"></hr>

        <div className="tutorial-container">
          <h1 className="tutorial-header">Actual VS Predicted Chart</h1>
          <p className="tutorial-desc">
            A Chart used to compare the values of the actual stock needed and
            the values predicted by the model
          </p>
          <ol className="tutorial-items">
            <li className="tutorial-item">
              Actual (Purple Line)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    This represents the real historical sales or stock data from
                    your uploaded CSV.
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              Predicted (Orange Dotted Line)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    This is the value the model guessed for that specific date.
                    A model is considered "accurate" if this orange line closely
                    follows the peaks and valleys of the purple line.
                  </li>
                </ul>
              </div>
            </li>
            <li className="tutorial-item">
              Upper & Lower Bounds (Light Orange Dotted Lines)
              <div className="inner-tutorial-container">
                <ul>
                  <li>
                    These create a "Confidence Corridor." They represent the
                    range where the model is reasonably sure the value should
                    fall. If the purple line stays mostly within these bounds,
                    your model is performing reliably.
                  </li>
                </ul>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

export default Tutorial;
