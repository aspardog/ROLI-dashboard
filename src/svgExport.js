// Fetches Inter Tight from Google Fonts, converts every font URL to a
// base64 data URI, and caches the resulting @font-face CSS so that
// exported SVGs are fully self-contained.
let _fontCSSCache = null;

export async function getEmbeddedFontCSS() {
  if (_fontCSSCache) return _fontCSSCache;
  // Only load weights 500, 600, 700 with Latin subset
  // Modern browsers get woff2 automatically (best compression ~30% better than woff)
  const res  = await fetch('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap');
  let css = await res.text();

  // Only embed woff2 fonts (most compressed format)
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)]
    .map(m => m[1])
    .filter(url => url.includes('woff2')); // Only use woff2

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

  // Minify CSS: remove comments, extra whitespace, newlines
  css = css.replace(/\/\*.*?\*\//g, ''); // Remove comments
  css = css.replace(/\s+/g, ' '); // Collapse whitespace
  css = css.replace(/\s*([{}:;,])\s*/g, '$1'); // Remove spaces around delimiters
  css = css.trim();

  _fontCSSCache = css;
  return css;
}
