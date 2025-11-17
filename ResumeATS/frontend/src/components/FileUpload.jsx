import { useState } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData);
      setResult(res.data);
    } catch (error) {
      alert("Error analyzing resume. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Upload Your Resume
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px dashed rgba(255, 255, 255, 0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
          >
            <span style={{ fontSize: "48px", marginBottom: "12px" }}>📄</span>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              {file ? file.name : "Click to select PDF file"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              padding: "16px 32px",
              background: loading ? "#e0e0e0" : "white",
              color: "#667eea",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading && (
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  border: "3px solid #667eea",
                  borderTop: "3px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}
