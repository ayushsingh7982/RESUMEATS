import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradient}></div>
      <div className={styles.floatingShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>✨</span>
            <span>AI-Powered Analysis</span>
          </div>

          <h1 className={styles.title}>
            Transform Your Resume Into
            <span className={styles.gradient}> Career Success</span>
          </h1>

          <p className={styles.subtitle}>
            Get instant, AI-driven insights to optimize your resume. Stand out from the crowd
            with professional analysis in seconds.
          </p>

          <div className={styles.ctaGroup}>
            <button 
              className={styles.primaryBtn}
              onClick={() => navigate("/analyze")}
            >
              <span>Analyze Resume</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.secondaryBtn} onClick={scrollToHowItWorks}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M10 15L6 11M10 15L14 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>See How It Works</span>
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Resumes Analyzed</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>95%</div>
              <div className={styles.statLabel}>Success Rate</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>2 Min</div>
              <div className={styles.statLabel}>Average Time</div>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.cardTitle}>Resume Analysis</div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.scoreCircle}>
                <svg className={styles.progressRing} width="120" height="120">
                  <circle cx="60" cy="60" r="54" className={styles.progressRingBg}/>
                  <circle cx="60" cy="60" r="54" className={styles.progressRingFill}/>
                </svg>
                <div className={styles.scoreText}>
                  <div className={styles.scoreNumber}>92</div>
                  <div className={styles.scoreLabel}>Score</div>
                </div>
              </div>
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricBar}>
                    <div className={styles.metricFill} style={{width: "85%"}}></div>
                  </div>
                  <span>Keywords</span>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricBar}>
                    <div className={styles.metricFill} style={{width: "92%"}}></div>
                  </div>
                  <span>Format</span>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricBar}>
                    <div className={styles.metricFill} style={{width: "78%"}}></div>
                  </div>
                  <span>Content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <h3>ATS Optimization</h3>
          <p>Ensure your resume passes Applicant Tracking Systems</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3>Instant Results</h3>
          <p>Get comprehensive feedback in under 2 minutes</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3>100% Secure</h3>
          <p>Your data is encrypted and never stored permanently</p>
        </div>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSubtitle}>Get your resume analyzed in three simple steps</p>
        
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Upload Your Resume</h3>
              <p>Simply drag and drop your resume in PDF or DOCX format. We support all standard resume formats.</p>
            </div>
          </div>
          
          <div className={styles.stepConnector}></div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>AI Analysis</h3>
              <p>Our advanced AI scans your resume for keywords, formatting, ATS compatibility, and content quality.</p>
            </div>
          </div>
          
          <div className={styles.stepConnector}></div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Get Insights</h3>
              <p>Receive detailed feedback with actionable suggestions to improve your resume and land more interviews.</p>
            </div>
          </div>
        </div>

        <button 
          className={styles.ctaButton}
          onClick={() => navigate("/analyze")}
        >
          Start Analyzing Now
        </button>
      </section>
    </div>
  );
}
