import { useState, useRef } from "react";
import axios from "axios";
import styles from "./JDComparison.module.css";

export default function JDComparison() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCompare = async () => {
    if (!file || !jobDescription.trim()) {
      return alert("Please upload a resume and paste a job description");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const endpoint = useRAG ? "http://localhost:8000/compare-jd-rag" : "http://localhost:8000/compare-jd";
      const res = await axios.post(endpoint, formData);
      setResult(res.data.jd_comparison);
    } catch (error) {
      alert("Error comparing resume. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <div className={styles.card}>
          <h2 className={styles.title}>📄 Upload Resume</h2>
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
                {file ? file.name : dragActive ? "Drop here" : "Click or drag resume"}
              </div>
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>📋 Job Description</h2>
          <textarea
            className={styles.textarea}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
          />
        </div>
      </div>

      <div className={styles.ragToggle}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={useRAG}
            onChange={(e) => setUseRAG(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleText}>
            {useRAG ? "🧠 RAG Mode (Vector-Based Matching)" : "⚡ Standard Mode"}
          </span>
        </label>
        <div className={styles.toggleHint}>
          {useRAG 
            ? "Uses semantic search for accurate skill and keyword matching" 
            : "Fast comparison without vector retrieval"}
        </div>
      </div>

      <button
        className={styles.compareBtn}
        onClick={handleCompare}
        disabled={loading || !file || !jobDescription.trim()}
      >
        {loading && <div className={styles.spinner} />}
        {loading ? "Comparing..." : "Compare with Job Description"}
      </button>

      {result && (
        <div className={styles.results}>
          {/* Overall Match Score */}
          <div className={styles.scoreCard}>
            <h3 className={styles.cardTitle}>🎯 Overall Match</h3>
            <div className={styles.bigScore} style={{ color: getScoreColor(result.overall_match_score) }}>
              {result.overall_match_score}%
            </div>
            <p className={styles.summary}>{result.role_fit_summary}</p>
          </div>

          {/* Skill Match */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>⚡ Skill Match: {result.skill_match_percentage}%</h3>
            
            {result.matched_skills?.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>✅ Matched Skills</h4>
                <div className={styles.tags}>
                  {result.matched_skills.map((skill, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagGreen}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missing_skills?.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>❌ Missing Skills</h4>
                <div className={styles.tags}>
                  {result.missing_skills.map((skill, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagRed}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>🔑 Keywords Analysis</h3>
            
            {result.matched_keywords?.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>✅ Matched Keywords</h4>
                <div className={styles.tags}>
                  {result.matched_keywords.map((kw, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagGreen}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missing_keywords?.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>❌ Missing Keywords</h4>
                <div className={styles.tags}>
                  {result.missing_keywords.map((kw, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagRed}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.good_to_have_keywords?.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>⭐ Good-to-Have Keywords</h4>
                <div className={styles.tags}>
                  {result.good_to_have_keywords.map((kw, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagBlue}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strengths & Gaps */}
          <div className={styles.twoColumn}>
            <div className={`${styles.card} ${styles.greenCard}`}>
              <h3 className={styles.cardTitle}>💪 Strengths for Role</h3>
              <ul className={styles.list}>
                {result.strengths_for_role?.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className={`${styles.card} ${styles.redCard}`}>
              <h3 className={styles.cardTitle}>⚠️ Gaps for Role</h3>
              <ul className={styles.list}>
                {result.gaps_for_role?.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className={`${styles.card} ${styles.blueCard}`}>
            <h3 className={styles.cardTitle}>💡 Recommendations</h3>
            <ul className={styles.list}>
              {result.recommendations?.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Match Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>📊 Match Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Experience Match:</span>
                <span className={styles.detailValue}>{result.experience_match}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Education Match:</span>
                <span className={styles.detailValue}>{result.education_match}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ATS Compatibility:</span>
                <span className={styles.detailValue}>{result.ats_compatibility}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
