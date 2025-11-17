export default function ResultCard({ result }) {
  const analysis = result.ai_analysis || {};
  const atsScore = analysis.ats_score || 0;
  
  // Calculate color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const scoreColor = getScoreColor(atsScore);

  return (
    <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ATS Score Card */}
      <div
        style={{
          padding: "40px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
          🎯 ATS Score
        </h3>
        <div
          style={{
            fontSize: "72px",
            fontWeight: "900",
            color: scoreColor,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            marginBottom: "8px",
          }}
        >
          {atsScore}
        </div>
        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "18px" }}>
          {analysis.candidate_level || "N/A"}
        </p>
        {analysis.summary && (
          <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", marginTop: "16px", lineHeight: "1.6" }}>
            {analysis.summary}
          </p>
        )}
      </div>

      {/* Score Breakdown */}
      {analysis.ats_score_breakdown && (
        <div
          style={{
            padding: "32px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h4 style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
            📊 Score Breakdown
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(analysis.ats_score_breakdown).map(([key, value]) => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "white", fontSize: "14px", textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: scoreColor, fontWeight: "600" }}>{value}</span>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${value}%`,
                      height: "100%",
                      background: getScoreColor(value),
                      borderRadius: "8px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pros */}
      {analysis.pros && analysis.pros.length > 0 && (
        <div
          style={{
            padding: "32px",
            background: "rgba(16, 185, 129, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h4 style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
            ✅ Strengths
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {analysis.pros.map((pro, idx) => (
              <li key={idx} style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "15px", lineHeight: "1.6", paddingLeft: "24px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "#10b981" }}>✓</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {analysis.cons && analysis.cons.length > 0 && (
        <div
          style={{
            padding: "32px",
            background: "rgba(239, 68, 68, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h4 style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
            ⚠️ Areas for Improvement
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {analysis.cons.map((con, idx) => (
              <li key={idx} style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "15px", lineHeight: "1.6", paddingLeft: "24px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "#ef4444" }}>✗</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div
          style={{
            padding: "32px",
            background: "rgba(59, 130, 246, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h4 style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
            💡 Actionable Suggestions
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "15px", lineHeight: "1.6", paddingLeft: "24px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "#3b82f6" }}>{idx + 1}.</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Info */}
      <div
        style={{
          padding: "32px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h4 style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
          📋 Additional Details
        </h4>
        
        {analysis.top_skills && analysis.top_skills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", marginBottom: "8px", fontWeight: "600" }}>
              Top Skills Identified:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {analysis.top_skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "13px",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", marginBottom: "8px", fontWeight: "600" }}>
              Missing Keywords:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {analysis.missing_keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "13px",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.industry_match && (
          <div>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", marginBottom: "8px", fontWeight: "600" }}>
              Best Industry Match:
            </p>
            <p style={{ color: "white", fontSize: "15px" }}>{analysis.industry_match}</p>
          </div>
        )}

        {result.basic_metrics && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", marginBottom: "8px", fontWeight: "600" }}>
              Document Stats:
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                📄 Pages: {result.basic_metrics.page_count}
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                📝 Words: {result.basic_metrics.word_count}
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                🔤 Characters: {result.basic_metrics.character_count}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
