import "../assets/styles/table.css";

function ForecastTable({ data }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th className="header-column">Metric</th>
            {data.map((d, i) => (
              <th key={i} className="date-column">
                {d.date}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="table-row">
            <td className="header-column">Forecast</td>
            {data.map((d, i) => (
              <td key={i} className="data-column highlighted">
                {d.predicted}
              </td>
            ))}
          </tr>

          <tr className="table-row">
            <td className="header-column">Lower</td>
            {data.map((d, i) => (
              <td key={i} className="data-column">
                {d.lower}
              </td>
            ))}
          </tr>

          <tr className="table-row">
            <td className="header-column">Upper</td>
            {data.map((d, i) => (
              <td key={i} className="data-column">
                {d.upper}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ForecastTable;
