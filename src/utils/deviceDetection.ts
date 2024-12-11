export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const device = {
    isMobile: /Mobile|Android|iPhone/i.test(ua),
    browser: /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Other',
    os: /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : 'Other'
  };
  return device;
}