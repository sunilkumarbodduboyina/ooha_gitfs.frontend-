
const GROWw_BASE_URL = "https://api.groww.in/v1";

async function growwRequest(endpoint) {
  const token = process.env.GROWW_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Groww access token is not configured");
  }

  const response = await fetch(`${GROWw_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-API-VERSION": "1.0",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error("Groww API request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

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
