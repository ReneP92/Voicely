# Voicely brand kit

**Approved direction:** white backgrounds, charcoal, soft lavender and selective burnt-orange headline accents. Direction 03.1 refines the accepted minimal identity with a brighter canvas and a little more color in the typography. The original kit shipped to the repository in [PR #4](https://github.com/ReneP92/Voicely/pull/4); this refinement replaces its off-white main background and tiny-accent-only rule. Product interfaces remain planned; the examples here are design specimens.

Open [preview.html](preview.html) for the responsive identity and interface specimens, or download [voicely-brand-kit.zip](voicely-brand-kit.zip). The current editable source is `source/mark.svg`, the licensed font in `fonts/`, and `tokens.css`. `build.py` assembles outlined SVGs and raster exports. Concept images under `concepts/` are historical visual references, not exact colors or final geometry.

The [landing-page illustration and motion gallery](landing/index.html) adds three original scenes: product advice, grounded answers and reviewed email handoff. Each has a static SVG/PNG export and a short, replayable animation with reduced-motion support. See [integration and motion guidance](landing/README.md).

## Palette

| Role          | Color     | Use                                                                       |
| ------------- | --------- | ------------------------------------------------------------------------- |
| White         | `#FFFFFF` | Main canvas, panels and conversation surfaces                             |
| Soft inset    | `#F8F8F6` | Small inset surfaces and user message bubbles                             |
| Charcoal      | `#292524` | Text, logo, primary actions and launcher                                  |
| Stone         | `#E7E5E4` | Decorative separators and quiet surfaces                                  |
| Soft lavender | `#EEE5F6` | Selected surfaces and occasional highlights                               |
| Burnt orange  | `#B6532C` | Selected headline phrases, editorial section labels and signature details |

**White space leads; orange gives the typography a voice.** Keep most of the interface neutral. Use burnt orange for one phrase in a major headline, such as "Better shopping.", and small editorial section markers. Let other headings, body text, actions and the launcher stay charcoal. Lavender remains a quiet selected-state surface. This replaces the earlier 95/4/1 split with a more expressive typographic hierarchy, not a new pixel quota. Flat fills, no gradients or large orange backgrounds. Reducto's warm neutral/lavender palette was a reference; this is Voicely's own adapted system.

Use `#68625E` for secondary text and `#87817C` for essential input/control outlines. Stone is intentionally too subtle to identify an input on its own. Functional error, success and warning colors have separate tokens and always accompany text or an icon. Never use the orange signature as an unread dot, availability indicator or delivery status.

## Identity

- The geometric V includes a speech-tail. The primary lockup is entirely charcoal on light surfaces or white on charcoal.
- The wordmark is outlined Geist at weight 700 with tightened spacing. All exported SVG artwork is font-independent. Do not substitute live text for the logo.
- `voicely-logo-signature.svg` adds a small orange square for occasional marketing use. The ordinary logo, app icon, favicon and launcher have no orange dot or badge.
- Preserve the SVG viewBox and proportions. Leave external clear space of at least one quarter of the symbol height on all sides. Do not stretch, recolor individual letterforms, add gradients or add effects.
- Minimum displayed width: 120px for the lockup; 20px for a standalone interface mark. Use the dedicated favicon at 16px. At tiny sizes, use the mark rather than the wordmark.
- The app/touch icon has an opaque square charcoal canvas so the platform can apply its own mask. The favicon has a modest rounded charcoal tile for legibility on both browser themes.

## Typography and layout

Use the locally supplied Geist variable font, with a system sans-serif fallback. Keep its [SIL Open Font License](fonts/OFL.txt) with redistributed assets. No third-party font request is needed.

- Body: 16px / 1.5, weight 400. Compact admin text can be 14px. Widget message text should default to 16px in the actual product; the scaled board is illustrative.
- Labels and actions: weight 500; section titles: 500-600. Strong marketing headings: 600, tight tracking and line height around 1.05-1.1.
- Color only the emphasized phrase of a major headline. Small section markers can use orange with a short fine rule; everyday form labels and operational headings stay charcoal or muted. Use `--voicely-color-heading-accent` for this editorial emphasis.
- Use a 4px spacing rhythm, clear alignment and whitespace instead of decorative cards everywhere.
- Controls: 6px radius; cards: 8px; widget: 12px. Shadows only where elevation helps, such as the widget overlay.
- Keep touch targets at least 44px in product UI. Preserve visible hover, focus, selected, disabled and loading states. Avoid motion unless it explains a state change; respect reduced motion.

## Product application

**Website:** pure white canvas, a charcoal-and-orange split headline, fine editorial section markers and occasional lavender highlights. Keep off-white in small inset surfaces rather than full-page backgrounds. "Good answers. Better shopping." is a brand headline, not a measured quality claim.

**Admin:** white canvas and panels, fine separators and charcoal actions. A page-introduction headline can use a small orange emphasis; dense table headings and form labels stay neutral. Lavender can mark the selected navigation item, paired with a label, icon or weight change. Keep operational status colors separate.

**Widget:** white conversation surface, charcoal launcher and compact branding. Merchant products and answers lead. Do not place a decorative square near the launcher; it resembles an unread notification. The approved example's square is deliberately omitted from the working assets. Preview is non-dispatching; nothing in this brand kit sends a message or calls a model.

**Merchant customization:** merchant accent preferences are independent of the Voicely identity. Validate text, control and focus contrast for every supported accent and state. Use a safe foreground/action fallback if an accent fails; do not blindly put white text on arbitrary merchant colors. Logos remain monochrome unless separately approved. Import these tokens inside the admin or isolated widget iframe, never globally into a merchant's host page.

## Accessibility

`tokens.css` includes semantic colors, type, spacing, radius, focus and reduced-motion values. Use charcoal text on lavender, white text on charcoal, and underlined links. Burnt-orange headings on white have 4.93:1 contrast, sufficient even for normal text. Orange is optional, not the default link color. Distinguish the white canvas token from the off-white `surface-muted` token so inset contrast survives palette refinements.

The build-time palette review checks intended flat colors, not pixels from the generated concept image. Normal text needs 4.5:1; essential control boundaries and focus indicators need 3:1 against adjacent colors. Stone separators are decorative. A focus ring needs an offset from the control; on dark surfaces use a white ring. These tokens do not by themselves certify the future UI as accessible.

## Assets

| File                                                              | Purpose                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `source/mark.svg`                                                 | Editable single-path geometric mark; inherits `currentColor`                   |
| `voicely-logo-light.svg`, `voicely-logo-dark.svg`                 | Outlined lockups for light/dark backgrounds                                    |
| `voicely-logo-signature.svg`                                      | Optional marketing lockup with orange punctuation                              |
| `voicely-logo-light.png`, `voicely-logo-dark.png`                 | Transparent 1920 x 448 raster lockups                                          |
| `voicely-logo.png`                                                | Compatibility copy of the light-background lockup                              |
| `voicely-mark.svg`, `voicely-mark-dark.svg`                       | Standalone charcoal/white marks                                                |
| `voicely-mark.png`                                                | Transparent 512 x 512 mark                                                     |
| `voicely-app-icon.svg`, `voicely-app-icon.png`                    | Opaque 1024 x 1024 app icon                                                    |
| `apple-touch-icon.png`                                            | Opaque 180 x 180 touch icon                                                    |
| `favicon.svg`, `favicon-32.png`, `favicon-256.png`, `favicon.ico` | Browser icons; ICO includes 16, 32, 48, 64, 128 and 256px                      |
| `voicely-social.svg`, `voicely-social.png`, `voicely-social.webp` | 1200 x 630 typographic social artwork                                          |
| `voicely-og.png`                                                  | 1200 x 630 Open Graph image                                                    |
| `voicely-hero.svg`, `voicely-hero.png`, `voicely-hero.webp`       | 1600 x 900 editorial hero with illustrative synthetic conversation             |
| `tokens.css`, `fonts/`                                            | Interface foundation and self-hosted licensed Geist                            |
| `preview.html`                                                    | Responsive, non-dispatching visual reference                                   |
| `voicely-brand-kit.zip`                                           | Current assets, guide, source, font/license and build tools; excludes concepts |

Social and hero SVGs contain outlined display text. On a real website, use live HTML for the headline, links and controls; the illustration is not a functional interface. Provide appropriate alt text for informative images and empty alt text for decorative marks next to an existing name.

## Rebuilding and checking

From the repository root, with the normal Bun dependencies installed:

```sh
bunx --no-install playwright install chromium
uv run --script docs/brand/build.py
python3 -m http.server 4175 --bind 127.0.0.1 --directory docs/brand
```

Open `http://127.0.0.1:4175/preview.html`. The build pins its Python-only export dependencies through inline script metadata; it does not add application dependencies or a second JavaScript lockfile. Bun/Playwright renders SVGs; FontTools outlines the checked-in Geist; Pillow exports WebP and the multi-size ICO. A first build can download these development tools; the resulting kit works offline.

Change the source mark, palette, font inputs or generator and rebuild instead of hand-editing generated SVG/raster exports. `tokens.css` is the source of export colors. Run the build again after editing the guide or preview so the archive matches. The previous indigo/teal assets remain available in Git history.

Before shipping a consuming UI, verify keyboard/focus behavior, contrast, 200% zoom, mobile layouts, assistive-technology labels and every interaction state. Current checks cover the brand kit, not the unimplemented product.

## Planning references

The approved direction is recorded in [Linear P-PER-1](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb), [PER-16 widget](https://linear.app/personal-rp501/issue/PER-16), [PER-18 admin](https://linear.app/personal-rp501/issue/PER-18) and [PER-32 screens](https://linear.app/personal-rp501/issue/PER-32). [Notion Brand & Assets](https://app.notion.com/p/40c44aa5359281baa1b6fded216157db) is the knowledge-hub summary. This kit is a local implementation of that direction, not evidence of a shipped application.
