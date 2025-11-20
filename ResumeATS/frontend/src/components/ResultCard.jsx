import { useEffect, useState } from "react";
import styles from "./ResultCard.module.css";

export default function ResultCard({ result }) {
  const [animated, setAnimated] = useState(false);
  const analysis = result.ai_analysis || {};
  const atsScore = analysis.ats_score || 0;

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const scoreColor = getScoreColor(atsScore);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  // Generate skill matches with random scores for demo
  const skillMatches = analysis.top_skills?.slice(0, 6).map((skill, idx) => ({
    name: skill,
    score: 95 - idx * 8,
  })) || [];

  // Categorize keywords by importance
  const categorizeKeywords = (keywords) => {
    if (!keywords || keywords.length === 0) return [];
    return keywords.map((keyword, idx) => ({
      text: keyword,
      level: idx < keywords.length / 3 ? "high" : idx < (keywords.length * 2) / 3 ? "medium" : "low",
    }));
  };

  const keywordData = categorizeKeywords(analysis.top_skills || []);

  return (
    <div className={styles.container}>
      {/* ATS Score with Circular Progress */}
      <div className={`${styles.card} ${styles.scoreCard}`}>
        <h3 className={styles.cardTitle}>
          <span>🎯</span>
          <span>ATS Score</span>
        </h3>

        <div className={styles.circularProgress}>
          <svg width="200" height="200" className={styles.progressRing}>
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd89b" />
                <stop offset="100%" stopColor={scoreColor} />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={styles.progressRingBg}
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={styles.progressRingFill}
              stroke="url(#progressGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={animated ? strokeDashoffset : circumference}
            />
          </svg>
          <div className={styles.scoreText}>
            <div className={styles.scoreNumber}>{atsScore}</div>
            <div className={styles.scoreLabel}>out of 100</div>
          </div>
        </div>

        {analysis.candidate_level && (
          <div className={styles.candidateLevel}>{analysis.candidate_level}</div>
        )}

        {analysis.summary && (
          <p className={styles.summary}>{analysis.summary}</p>
        )}
      </div>

      {/* Score Breakdown with Animated Bars */}
      {analysis.ats_score_breakdown && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span>📊</span>
            <span>Score Breakdown</span>
          </h3>
          <div className={styles.breakdown}>
            {Object.entries(analysis.ats_score_breakdown).map(([key, value]) => (
              <div key={key} className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <span className={styles.breakdownLabel}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className={styles.breakdownValue}
                    style={{ color: getScoreColor(value) }}
                  >
                    {value}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: animated ? `${value}%` : "0%",
                      background: `linear-gradient(90deg, ${getScoreColor(value)}, ${getScoreColor(value)}dd)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Match Bars */}
      {skillMatches.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span>⚡</span>
            <span>Top Skills Match</span>
          </h3>
          <div className={styles.skillsGrid}>
            {skillMatches.map((skill, idx) => (
              <div key={idx} className={styles.skillItem}>
                <span className={styles.skillName}>{skill.name}</span>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillFill}
                    style={{
                      width: animated ? `${skill.score}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Heatmap */}
      {keywordData.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span>🔥</span>
            <span>Keyword Heatmap</span>
          </h3>
          <div className={styles.heatmap}>
            {keywordData.map((keyword, idx) => (
              <span
                key={idx}
                className={`${styles.keyword} ${
                  keyword.level === "high"
                    ? styles.keywordHigh
                    : keyword.level === "medium"
                    ? styles.keywordMedium
                    : styles.keywordLow
                }`}
              >
                {keyword.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.pros && analysis.pros.length > 0 && (
        <div className={`${styles.card} ${styles.listCard} ${styles.greenCard}`}>
          <h3 className={styles.cardTitle}>
            <span>✅</span>
            <span>Strengths</span>
          </h3>
          <ul className={styles.list}>
            {analysis.pros.map((pro, idx) => (
              <li key={idx} className={styles.listItem}>
                <span className={styles.listIcon} style={{ color: "#10b981" }}>
                  ✓
                </span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis.cons && analysis.cons.length > 0 && (
        <div className={`${styles.card} ${styles.listCard} ${styles.redCard}`}>
          <h3 className={styles.cardTitle}>
            <span>⚠️</span>
            <span>Areas for Improvement</span>
          </h3>
          <ul className={styles.list}>
            {analysis.cons.map((con, idx) => (
              <li key={idx} className={styles.listItem}>
                <span className={styles.listIcon} style={{ color: "#ef4444" }}>
                  ✗
                </span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className={`${styles.card} ${styles.listCard} ${styles.blueCard}`}>
          <h3 className={styles.cardTitle}>
            <span>💡</span>
            <span>Actionable Suggestions</span>
          </h3>
          <ul className={styles.list}>
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} className={styles.listItem}>
                <span className={styles.listIcon} style={{ color: "#3b82f6" }}>
                  {idx + 1}.
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Details */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <span>📋</span>
          <span>Additional Details</span>
        </h3>

        {analysis.top_skills && analysis.top_skills.length > 0 && (
          <div className={styles.infoSection}>
            <p className={styles.infoLabel}>Top Skills Identified:</p>
            <div className={styles.tags}>
              {analysis.top_skills.map((skill, idx) => (
                <span key={idx} className={`${styles.tag} ${styles.tagSkill}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
          <div className={styles.infoSection}>
            <p className={styles.infoLabel}>Missing Keywords:</p>
            <div className={styles.tags}>
              {analysis.missing_keywords.map((keyword, idx) => (
                <span key={idx} className={`${styles.tag} ${styles.tagMissing}`}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.industry_match && (
          <div className={styles.infoSection}>
            <p className={styles.infoLabel}>Best Industry Match:</p>
            <p className={styles.infoText}>{analysis.industry_match}</p>
          </div>
        )}

        {result.basic_metrics && (
          <div className={styles.stats}>
            <span className={styles.statItem}>
              📄 Pages: {result.basic_metrics.page_count}
            </span>
            <span className={styles.statItem}>
              📝 Words: {result.basic_metrics.word_count}
            </span>
            <span className={styles.statItem}>
              🔤 Characters: {result.basic_metrics.character_count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
