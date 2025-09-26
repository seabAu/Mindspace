export const QUOTE_API_URLS = [
    // General quotes (large static JSON, CORS-friendly)
    "https://type.fit/api/quotes",

    // Quotable public API (CORS-friendly). Batch list for variety.
    // "https://api.quotable.io/quotes?limit=100",

    // ZenQuotes public endpoint (rate-limited). Returns an array of quotes.
    "https://zenquotes.io/api/quotes",

    // Programming/tech-leaning quotes (CORS-friendly)
    // "https://programming-quotesapi.vercel.app/api/quotes",

    // Original FreeCodeCamp gist fallback (JSON structure with { quotes: [...] })
    "https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json",
];
