const axios = require("axios");
const { stringify } = require("csv-stringify/sync");   // añade esta lib en package.json

exports.handler = async (event) => {
  try {
    const { yf_ticker, start_date, yf_interval } = event.queryStringParameters || {};

    if (!yf_ticker || !start_date || !yf_interval) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "yf_ticker, start_date y yf_interval son obligatorios" })
      };
    }

    const period1 = Math.floor(new Date(start_date).getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000);

    // --- Decide qué endpoint usar ------------------------------------------
    const csvIntervals = ["1d", "1wk", "1mo"];
    if (csvIntervals.includes(yf_interval)) {
      // Descarga CSV nativo
      const url =
        `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(yf_ticker)}` +
        `?period1=${period1}&period2=${period2}` +
        `&interval=${yf_interval}` +
        `&events=history&includeAdjustedClose=true`;

      const resp = await axios.get(url);
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/csv" },
        body: resp.data
      };
    }

    // --- Para 1h, 30m, 15m, 5m, 1m… usamos chart/v8 ------------------------
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yf_ticker)}` +
      `?period1=${period1}&period2=${period2}` +
      `&interval=${yf_interval}&events=div%2Csplit&includePrePost=true`;

    const { data } = await axios.get(url);
    const result = data.chart?.result?.[0];
    if (!result) throw new Error("Respuesta vacía de Yahoo");

    const { timestamps = [], indicators } = result;
    const quote = indicators?.quote?.[0] || {};

    // Construye un CSV equivalente al de yfinance
    const rows = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000).toISOString().slice(0, 10); // yyyy-mm-dd
      return [
        date,
        quote.open?.[i] ?? "",
        quote.high?.[i] ?? "",
        quote.low?.[i] ?? "",
        quote.close?.[i] ?? "",
        quote.volume?.[i] ?? ""
      ];
    });

    const csv = stringify(
      [["Date", "Open", "High", "Low", "Close", "Volume"], ...rows],
      { header: false }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/csv" },
      body: csv
    };
  } catch (err) {
    console.error("getData error:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
};
