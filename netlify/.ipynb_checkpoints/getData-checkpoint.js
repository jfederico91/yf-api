const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { yf_ticker, start_date, yf_interval } = event.queryStringParameters || {};
    if (!yf_ticker || !start_date || !yf_interval) {
      return { statusCode: 400, body: "Faltan parámetros yf_ticker, start_date o yf_interval" };
    }

    // UNIX timestamps para Yahoo Finance
    const period1 = Math.floor(new Date(start_date).getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000);

    // Construimos la URL oficial de descarga histórica :contentReference[oaicite:1]{index=1}
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(yf_ticker)}`
              + `?period1=${period1}&period2=${period2}`
              + `&interval=${encodeURIComponent(yf_interval)}`
              + `&events=history&includeAdjustedClose=true`;

    const response = await axios.get(url);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/csv" },
      body: response.data
    };
  } catch (err) {
    return {
      statusCode: err.response?.status || 500,
      body: err.response?.data || err.message
    };
  }
};
