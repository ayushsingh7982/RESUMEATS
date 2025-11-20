import ResumeRewriter from "../components/ResumeRewriter";

export default function Rewriter() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        paddingTop: "100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 135, 135, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <ResumeRewriter />
      </div>
    </div>
  );
}
