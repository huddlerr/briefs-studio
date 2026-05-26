console.log("==============================================================");
console.log("🌐 Starting Live Render Production Poller...");
console.log("==============================================================\n");

const url = 'https://briefs-studio.onrender.com';
let attempts = 0;

const checkUrl = async () => {
  attempts++;
  try {
    // Render free-tier spins up and responds to HTTP requests
    const res = await fetch(url, { headers: { 'User-Agent': 'Render-Poller-Agent' } });
    if (res.status === 200 || res.status === 404 || res.status === 302) {
      console.log(`\n🎉 SUCCESS! Your Briefs Studio cloud server is officially LIVE!`);
      console.log(`🌐 Public Production Link: ${url}`);
      console.log(`🧪 Response Code: ${res.status}`);
      console.log("==============================================================");
      process.exit(0);
    } else {
      console.log(`[attempt #${attempts}] Build in progress... HTTP status returned: ${res.status}`);
    }
  } catch (err) {
    console.log(`[attempt #${attempts}] Building container... Connection status: ${err.message}`);
  }
};

// Run first check immediately, then check every 15 seconds
checkUrl();
const interval = setInterval(checkUrl, 15000);

// Timeout poller after 8 minutes to prevent infinite loops
setTimeout(() => {
  clearInterval(interval);
  console.log("\n⚠️ Polling session timed out. The server might still be building on Render. Please check your dashboard logs.");
  process.exit(1);
}, 480000);
