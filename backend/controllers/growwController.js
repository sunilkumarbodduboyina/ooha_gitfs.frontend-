
const GROWW_BASE_URL = "https://api.groww.in/v1";

async function growwRequest(endpoint) {
  if (typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    throw new Error("Groww API endpoint must be a valid path starting with '/'");
  }

  const token = process.env.GROWW_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Groww access token is not configured");
  }

  const response = await fetch(`${GROWW_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-API-VERSION": "1.0",
    },
  });

  let data;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
  } else {
    const text = await response.text();
    data = text ? text : null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Groww API request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

exports.growwRequest = growwRequest;

exports.getProfile = async (req, res, next) => {
  try {
    const data = await growwRequest("/user/detail");
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getQuote = async (req, res, next) => {
  try {
    const { symbol, exchange = "NSE", segment = "CASH" } = req.query;

    if (
      typeof symbol !== "string" ||
      !/^[A-Za-z0-9._-]{1,40}$/.test(symbol) ||
      !["NSE", "BSE"].includes(exchange) ||
      !["CASH", "FNO"].includes(segment)
    ) {
      return res.status(400).json({
        message: "Invalid symbol, exchange, or segment",
      });
    }

    const params = new URLSearchParams({
      exchange,
      segment,
      trading_symbol: symbol,
    });

    const data = await growwRequest(
      `/live-data/quote?${params.toString()}`
    );

    res.json(data);
  } catch (error) {
    next(error);
  }
};
