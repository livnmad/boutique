import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export function sanitizeSvg(svg: string) {
  // Create a fresh JSDOM window for each sanitize to avoid leaks
  const { window } = new JSDOM('');
  const DOMPurify = createDOMPurify(window as unknown as Window);

  // Use SVG profile to allow SVG tags but strip scripts and event handlers
  const clean = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });

  // tear down window
  try { (window as any).close?.(); } catch (e) {}
  return String(clean);
}
