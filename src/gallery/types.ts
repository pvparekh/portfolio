/** One item in the lightbox (exhibit screens, gallery filmstrips). */
export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
  /** Short label shown before the caption. */
  label?: string;
  /** Larger renditions for the full-screen view (`src` stays the fallback). */
  srcSet?: string;
  width?: number;
  height?: number;
  /** A clip plays instead of the image; `poster` shows until it starts. */
  video?: string;
  poster?: string;
}
