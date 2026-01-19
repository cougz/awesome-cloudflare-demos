// JavaScript asset for Browser vs Edge TTL demonstration
// This file demonstrates the difference between max-age (browser) and s-maxage (edge) directives

console.log("Browser vs Edge TTL test asset loaded");

// Cache-Control: public, max-age=300, s-maxage=3600
// Browser caches for 300 seconds (5 minutes)
// Cloudflare edge caches for 3600 seconds (1 hour)
