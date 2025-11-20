import { useState, useRef } from "react";
import axios from "axios";
import styles from "./ResumeRewriter.module.css";

export default function ResumeRewriter() {
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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a PDF");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/rewrite-suggestions", formData);
      setResult(res.data.rewrite_suggestions);
    } catch (error) {
      alert("Error generating suggestions. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadCard}>
        <h2 className={styles.title}>✍️ Get Rewriting Suggestions</h2>
        
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

        <button
          className={styles.analyzeBtn}
          onClick={handleAnalyze}
          disabled={loading || !file}
        >
          {loading && <div className={styles.spinner} />}
          {loading ? "Analyzing..." : "Get Suggestions"}
        </button>
      </div>

      {result && (
        <div className={styles.results}>
          {/* Improved Summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>📝 Improved Professional Summary</h3>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(result.improved_summary)}
              >
                📋 Copy
              </button>
            </div>
            <div className={styles.summaryBox}>
              {result.improved_summary}
            </div>
          </div>

          {/* Rewritten Bullets */}
          {result.rewritten_bullets?.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>🎯 Rewritten Achievements (STAR Method)</h3>
              <div className={styles.bulletsList}>
                {result.rewritten_bullets.map((bullet, idx) => (
                  <div key={idx} className={styles.bulletItem}>
                    <div className={styles.bulletSection}>
                      <div className={styles.bulletLabel}>❌ Original:</div>
                      <div className={styles.bulletOriginal}>{bullet.original}</div>
                    </div>
                    <div className={styles.bulletArrow}>↓</div>
                    <div className={styles.bulletSection}>
                      <div className={styles.bulletLabelGreen}>
                        ✅ Improved:
                        <button
                          className={styles.copyBtnSmall}
                          onClick={() => copyToClipboard(bullet.improved)}
                        >
                          📋
                        </button>
                      </div>
                      <div className={styles.bulletImproved}>{bullet.improved}</div>
                    </div>
                    <div className={styles.bulletExplanation}>
                      💡 {bullet.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Insertions */}
          {result.keyword_insertions?.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>🔑 Keyword Insertion Suggestions</h3>
              <div className={styles.keywordsList}>
                {result.keyword_insertions.map((item, idx) => (
                  <div key={idx} className={styles.keywordItem}>
                    <div className={styles.keywordSection}>
                      <span className={styles.sectionBadge}>{item.section}</span>
                    </div>
                    <div className={styles.keywordSuggestion}>{item.suggestion}</div>
                    <div className={styles.keywordTags}>
                      {item.keywords.map((kw, i) => (
                        <span key={i} className={styles.keywordTag}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement Enhancements */}
          {result.achievement_enhancements?.length > 0 && (
            <div className={`${styles.card} ${styles.blueCard}`}>
              <h3 className={styles.cardTitle}>⭐ Achievement Enhancement Examples</h3>
              <ul className={styles.list}>
                {result.achievement_enhancements.map((enhancement, idx) => (
                  <li key={idx}>
                    {enhancement}
                    <button
                      className={styles.copyBtnInline}
                      onClick={() => copyToClipboard(enhancement)}
                    >
                      📋
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Verb Suggestions */}
          {result.action_verb_suggestions?.length > 0 && (
            <div className={`${styles.card} ${styles.purpleCard}`}>
              <h3 className={styles.cardTitle}>💪 Action Verb Upgrades</h3>
              <ul className={styles.list}>
                {result.action_verb_suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatting Tips */}
          {result.formatting_tips?.length > 0 && (
            <div className={`${styles.card} ${styles.greenCard}`}>
              <h3 className={styles.cardTitle}>✨ Formatting Tips</h3>
              <ul className={styles.list}>
                {result.formatting_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
