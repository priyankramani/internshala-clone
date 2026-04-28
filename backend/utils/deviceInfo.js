const useragent = require("useragent");

function getDeviceInfo(req) {
  const ua = req.headers["user-agent"] || "";
  const agent = useragent.parse(ua);

  let browser = "Unknown";

  // IMPORTANT: Order matters
  if (/edg/i.test(ua)) {
    browser = "Edge";
  } else if (/chrome/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari/i.test(ua)) {
    browser = "Safari";
  }

  const os = agent.os.family || "Unknown";

  let device = "desktop";

  if (/mobile/i.test(ua)) {
    device = "mobile";
  } else if (/tablet/i.test(ua)) {
    device = "tablet";
  }

  return { browser, os, device };
}

module.exports = { getDeviceInfo };
