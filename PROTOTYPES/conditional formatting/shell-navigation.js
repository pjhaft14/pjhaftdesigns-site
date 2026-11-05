(() => {
  function navigate(href) {
    if (location.pathname.endsWith(`/${href}`)) return;
    if (document.dispatchEvent(new CustomEvent('cf:before-navigate', { cancelable: true }))) location.href = href;
  }
  document.querySelector('[data-list-navigation]')?.addEventListener('click', () => {
    const link = document.querySelector('a[data-list-link][href="list-view.html"]');
    if (link) link.click();
    else navigate('list-view.html');
  });
  document.querySelector('[data-dashboard-navigation]')?.addEventListener('click', () => navigate('dashboard-view.html'));
  document.querySelector('[data-report-navigation]')?.addEventListener('click', () => navigate('report-view.html'));
  document.querySelector('[data-editor-navigation]')?.addEventListener('click', () => navigate('index.html'));
})();
