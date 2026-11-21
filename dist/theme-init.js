// Ensure the page always starts strictly at the top on reload / restart
if ('scrollRestoration' in history) {
  try {
    history.scrollRestoration = 'manual';
  } catch {}
}
window.scrollTo(0, 0);

// Apply the saved palette before styles load to avoid a light flash.
try {
  if (localStorage.getItem('y7xified-theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    document.querySelector('meta[name="theme-color"]').content = '#10110f';
  }
} catch {
  // The default cream palette also works when storage is unavailable.
}
