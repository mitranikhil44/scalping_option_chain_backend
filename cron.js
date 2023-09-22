export default async function handler(req, res) {
    // Place your code here to run periodically
    await fetchMarketData();
    await updateLivePrice();
    
    res.status(200).end('Cron job executed successfully.');
  }
  