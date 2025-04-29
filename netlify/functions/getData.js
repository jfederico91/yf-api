// netlify/functions/getData.js
console.log("🚀 getData called with:", event.queryStringParameters);
const axios = require("axios");

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const { yf_ticker, start_date, yf_interval } = qs;

  if (!yf_ticker || !start_date || !yf_interval) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Faltan parámetros: yf_ticker, start_date o yf_interval"
      })
    };
  }

  try {
    const period1 = Math.floor(new Date(start_date).getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(yf_ticker)}`
              + `?period1=${period1}&period2=${period2}`
              + `&interval=${encodeURIComponent(yf_interval)}`
              + `&events=history&includeAdjustedClose=true`;

    const resp = await axios.get(url);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/csv" },
      body: resp.data
    };
  } catch (err) {
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        error: err.message,
        details: err.response?.data
      })
    };
  }
};
