export const config = {
  api: {
    bodyParser: true,
  },
};

const RAPIDAPI_HOST = "vehicle-rc-verification-advanced.p.rapidapi.com";
const POST_URL = `https://${RAPIDAPI_HOST}/v3/tasks/async/verify/ind_rc_plus`;
const GET_URL_BASE = `https://${RAPIDAPI_HOST}/v3/tasks`;

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    const { rc_number } = req.body;
    if (!rc_number) {
      res.status(400).json({ error: "rc_number is required" });
      return;
    }

    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) {
      res.status(500).json({ error: "Backend env RAPIDAPI_KEY not set" });
      return;
    }

    const taskId = "task-" + Math.random().toString(36).slice(2);
    const payload = {
      task_id: taskId,
      group_id: "vercel",
      data: { rc_number },
    };

    const postResp = await fetch(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      body: JSON.stringify(payload),
    });

    const postJson = await postResp.json();

    let finalJson = null;
    let attempts = 0;

    while (attempts < 8) {
      await sleep(2000);
      attempts++;

      const getResp = await fetch(`${GET_URL_BASE}/${taskId}`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      });

      const getJson = await getResp.json();
      const status = getJson?.status;

      if (status === "completed") {
        finalJson = getJson;
        break;
      }
    }

    res.status(200).json(finalJson || { error: "Timeout" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
