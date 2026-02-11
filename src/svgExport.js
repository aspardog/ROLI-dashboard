// Fetches Inter Tight from Google Fonts, converts every font URL to a
// base64 data URI, and caches the resulting @font-face CSS so that
// exported SVGs are fully self-contained.
let _fontCSSCache = null;

export async function getEmbeddedFontCSS() {
  if (_fontCSSCache) return _fontCSSCache;
  // Only load weights 500 and 600 (most commonly used), with Latin subset to reduce file size
  const res  = await fetch('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap&subset=latin');
  let css    = await res.text();
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]);
  for (const fontUrl of urls) {
    const fontRes  = await fetch(fontUrl);
    const blob     = await fontRes.blob();
    const dataUrl  = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    css = css.replace(fontUrl, dataUrl);
  }
  _fontCSSCache = css;
  return css;
}
