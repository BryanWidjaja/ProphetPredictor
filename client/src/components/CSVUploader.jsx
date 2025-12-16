import { useRef, useState } from "react";
import "../assets/styles/csvuploader.css";

function CSVUploader() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      setStatus("Upload successful");
    } catch {
      setStatus("Error uploading file");
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
      />

      <div className="file-input-box" onClick={handleFileSelect}>
        {file ? file.name : "Click to select CSV file"}
      </div>

      <button className="primary-btn" onClick={handleUpload}>
        Upload CSV
      </button>

      <p className="status">{status}</p>
    </div>
  );
}

export default CSVUploader;
