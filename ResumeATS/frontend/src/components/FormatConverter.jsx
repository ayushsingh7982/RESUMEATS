import { useState, useRef } from "react";
import axios from "axios";
import styles from "./FormatConverter.module.css";

export default function FormatConverter() {
  const [file, setFile] = useState(null);
  const [formatType, setFormatType] = useState("ats-optimized");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const formats = [
    { value: "ats-optimized", label: "🤖 ATS-Optimized", desc: "Maximum keyword density" },
    { value: "hr-friendly", label: "👔 HR-Friendly", desc: "Easy to skim, engaging" },
    { value: "software-engineer", label: "💻 Software Engineer", desc: "Technical focus" },
    { value: "data-analyst", label: "📊 Data Analyst", desc: "Data-driven insights" },
    { value: "product-manager", label: "🎯 Product Manager", desc: "Strategy & impact" },
    { value: "marketing", label: "📱 Marketing", desc: "Campaign & growth" },
  ];

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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return alert("Please upload a PDF");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format_type", formatType);

    try {
      const res = await axios.post("http://localhost:8000/convert-format", formData);
      setResult(res.data);
    } catch (error) {
      alert("Error converting resume. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.download_url) {
      window.open(`http://localhost:8000${result.download_url}`, "_blank");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadCard}>
        <h2 className={styles.title}>🔄 Convert Resume Format</h2>
        
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
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={styles.dropzoneIcon}>
              {file ? "✅" : dragActive ? "📥" : "📄"}
            </div>
            <div className={styles.dropzoneText}>
              {file ? file.name : dragActive ? "Drop here" : "Upload your resume"}
            </div>
          </div>
        </form>

        <div className={styles.formatSelector}>
          <label className={styles.label}>Select Format:</label>
          <div className={styles.formatGrid}>
            {formats.map((format) => (
              <div
                key={format.value}
                className={`${styles.formatCard} ${formatType === format.value ? styles.formatCardActive : ""}`}
                onClick={() => setFormatType(format.value)}
              >
                <div className={styles.formatLabel}>{format.label}</div>
                <div className={styles.formatDesc}>{format.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.convertBtn}
          onClick={handleConvert}
          disabled={loading || !file}
        >
          {loading && <div className={styles.spinner} />}
          {loading ? "Converting..." : "Convert Resume"}
        </button>
      </div>

      {result && (
        <div className={styles.results}>
          {/* Success Message */}
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h3 className={styles.successTitle}>Conversion Complete!</h3>
            <p className={styles.successText}>
              Your resume has been converted to <strong>{result.format_type}</strong> format
            </p>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              📥 Download PDF
            </button>
          </div>

          {/* Optimization Notes */}
          {result.converted_resume?.optimization_notes && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>📝 Optimization Notes</h3>
              <p className={styles.notes}>{result.converted_resume.optimization_notes}</p>
            </div>
          )}

          {/* Key Changes */}
          {result.converted_resume?.key_changes?.length > 0 && (
            <div className={`${styles.card} ${styles.blueCard}`}>
              <h3 className={styles.cardTitle}>🔑 Key Changes Made</h3>
              <ul className={styles.list}>
                {result.converted_resume.key_changes.map((change, idx) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {result.converted_resume?.formatted_resume && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>👀 Preview</h3>
              
              {/* Summary */}
              {result.converted_resume.formatted_resume.summary && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Professional Summary</h4>
                  <p className={styles.sectionContent}>
                    {result.converted_resume.formatted_resume.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {result.converted_resume.formatted_resume.experience?.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Experience</h4>
                  {result.converted_resume.formatted_resume.experience.map((exp, idx) => (
                    <div key={idx} className={styles.expItem}>
                      <div className={styles.expHeader}>
                        <strong>{exp.title}</strong> - {exp.company}
                      </div>
                      <div className={styles.expDuration}>{exp.duration}</div>
                      <ul className={styles.expBullets}>
                        {exp.bullets?.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {result.converted_resume.formatted_resume.skills?.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Skills</h4>
                  <div className={styles.skillsTags}>
                    {result.converted_resume.formatted_resume.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
