import { useState } from "react";

export default function Home() {
  const [rc, setRc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const resp = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rc_number: rc }),
      });
      const j = await resp.json();
      if (!resp.ok) {
        setError(j);
      } else {
        setResult(j);
      }
    } catch (err) {
      setError({ error: "Network error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h1>Vehicle RC Lookup</h1>
      <p>Enter registration number (example: <b>KL03Z4692</b>)</p>

      <form onSubmit={submit} style={{ marginBottom: 20 }}>
        <input
          value={rc}
          onChange={(e) => setRc(e.target.value)}
          placeholder="KL03Z4692"
          style={{ padding: "10px", width: "60%", marginRight: 8 }}
        />
        <button type="submit" style={{ padding: "10px 14px" }} disabled={loading}>
          {loading ? "Checking…" : "Lookup"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", whiteSpace: "pre-wrap" }}>
          <strong>Error:</strong> {JSON.stringify(error, null, 2)}
        </div>
      )}

      {result && (
        <div>
          <h3>Raw Response</h3>
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6, overflowX: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <hr />
      <small>Backend hides your RapidAPI key.</small>
    </div>
  );
}
