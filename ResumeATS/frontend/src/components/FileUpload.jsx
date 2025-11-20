import { useState, useRef } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import styles from "./FileUpload.module.css";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const [useRAG, setUseRAG] = useState(true);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpoint = useRAG ? "http://localhost:8000/analyze-rag" : "http://localhost:8000/analyze";
      const res = await axios.post(endpoint, formData);
      setResult(res.data);
    } catch (error) {
      alert("Error analyzing resume. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadCard}>
        <h2 className={styles.title}>Upload Your Resume</h2>

        <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            style={{ display: "none" }}
          />

          <div
            className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
            onClick={handleClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={styles.dropzoneIcon}>
              {dragActive ? "📥" : "📄"}
            </div>
            <div className={styles.dropzoneText}>
              {dragActive ? "Drop your resume here" : "Drag & drop your resume"}
            </div>
            <div className={styles.dropzoneSubtext}>
              or click to browse (PDF only)
            </div>
          </div>

          {dragActive && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            />
          )}
        </form>

        {file && (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>📄</span>
            <span className={styles.fileName}>{file.name}</span>
            <button className={styles.removeBtn} onClick={handleRemove}>
              ✕
            </button>
          </div>
        )}

        <div className={styles.ragToggle}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={useRAG}
              onChange={(e) => setUseRAG(e.target.checked)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleText}>
              {useRAG ? "🧠 RAG Mode (Grounded Analysis)" : "⚡ Standard Mode"}
            </span>
          </label>
          <div className={styles.toggleHint}>
            {useRAG 
              ? "Uses vector retrieval for accurate, context-based analysis" 
              : "Fast analysis without vector retrieval"}
          </div>
        </div>

        <button
          className={styles.analyzeBtn}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading && <div className={styles.spinner} />}
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}
