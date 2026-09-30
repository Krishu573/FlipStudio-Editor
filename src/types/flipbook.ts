export type CoverType = 'hardcover' | 'paperback' | 'spiral' | 'leather';

export type SurfaceSheen = 'glossy' | 'matte' | 'linen' | 'gold';

export type ViewMode = 'split' | 'preview';

export type WorkflowTab = 'convert' | 'appearance' | 'export';

export interface Hotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  description: string;
  price?: string;
  tag?: string;
  url?: string;
  type: 'product' | 'annotation' | 'link' | 'spec';
}

export interface PageLink {
  id: string;
  title: string;
  targetPage: number;
}

export interface PageData {
  id: number;
  pageNumber: number;
  title: string;
  kicker?: string;
  subtitle?: string;
  chapter?: string;
  category?: string;
  bodyText?: string;
  callout?: string;
  quote?: string;
  quoteAuthor?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageBadge?: string;
  pdfPageImage?: string;
  layout: 'cover' | 'editorial' | 'chapter-feature' | 'gallery' | 'split-text' | 'specs' | 'backcover';
  hotspots?: Hotspot[];
  links?: PageLink[];
  bookmarkTitle?: string;
  accentColor?: string;
}

export interface BookSettings {
  title: string;
  fileName: string;
  fileSizeMb: number;
  dpi: number;
  coverType: CoverType;
  boardThicknessMm: number; // 4.0 to 14.0
  sheen: SurfaceSheen;
  roundedCorners: boolean;
  preserveHyperlinks: boolean;
  doubleClickZoom: boolean;
  spreadMode: 'double' | 'single';
  perspectiveTilt: number; // 0 to 60 deg
  soundEnabled: boolean;
  autoPlayInterval: number; // seconds
}

export interface FlipbookPreset {
  id: string;
  name: string;
  coverType: CoverType;
  boardThicknessMm: number;
  sheen: SurfaceSheen;
  roundedCorners: boolean;
  perspectiveTilt: number;
  description: string;
}
