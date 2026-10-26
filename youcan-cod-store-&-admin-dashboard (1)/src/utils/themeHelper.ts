export function applyStoreTheme(themeColor?: string) {
  if (!themeColor) return;
  const color = getStoreThemeColor(themeColor);

  let styleEl = document.getElementById('dynamic-store-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-store-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `
    :root {
      --store-primary: ${color};
    }
    .store-primary-bg { background-color: ${color} !important; }
    .store-primary-text { color: ${color} !important; }
    .store-primary-border { border-color: ${color} !important; }
  `;
}

export function getStoreThemeColor(themeColor?: string): string {
  if (!themeColor) return '#e11d48';
  if (themeColor.startsWith('#')) return themeColor;
  switch (themeColor) {
    case 'rose':
    case 'red': return '#e11d48';
    case 'emerald':
    case 'green': return '#059669';
    case 'blue': return '#2563eb';
    case 'indigo': return '#4f46e5';
    case 'amber': return '#d97706';
    case 'teal': return '#0d9488';
    case 'black': return '#111827';
    default: return '#e11d48';
  }
}
