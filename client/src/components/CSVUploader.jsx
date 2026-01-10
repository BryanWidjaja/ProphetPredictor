import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/csvuploader.css";

function CSVUploader() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = () => {
    if (!loading) fileInputRef.current.click();
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    setStatus("Creating session...");

    try {
      const sessionRes = await fetch("http://localhost:8000/session", {
        method: "POST",
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        setStatus("Failed to create session");
        setLoading(false);
        return;
      }

      const sessionId = sessionData.session_id;

      setStatus("Uploading CSV...");

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(
        `http://localhost:8000/upload/${sessionId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await uploadRes.json();

      if (!uploadRes.ok) {
        setStatus(data.detail || "Upload failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("session_id", sessionId);

      navigate("/result");
    } catch {
      setStatus("Cannot connect to server");
      setLoading(false);
    }
  };

  return (
    <div className="uploader-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        hidden
        disabled={loading}
      />

      <div
        className={`file-input-box ${loading ? "disabled" : ""}`}
        onClick={handleFileSelect}
      >
        {file ? file.name : "Click to select CSV file"}
      </div>

      <button className="primary-btn" onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload CSV"}
      </button>

      {loading && <div className="spinner" />}
      <p className="status">{status}</p>
    </div>
  );
}

export default CSVUploader;
