import type { AssetKind, ProjectStatus } from "@prisma/client";

export type { AssetKind, ProjectStatus };

/** A media asset as consumed by the UI (bytes live in object storage). */
export interface Asset {
  id: string;
  kind: AssetKind;
  label: string;
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  order: number;
  /** Orientation correction in degrees (models only). */
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

export interface CaseStudySection {
  id: string;
  heading: string;
  body: string;
  order: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  order: number;
  projectCount?: number;
}

/**
 * The canonical project shape used across the public site and admin.
 * JSON-string columns are parsed into real arrays here.
 */
export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;

  category: { id: string; name: string; slug: string } | null;

  tags: string[];
  software: string[];
  materials: string[];
  components: string[];
  tools: string[];

  year: string;
  role: string;
  dimensions: string;
  projectType: string;

  status: ProjectStatus;
  featured: boolean;

  coverImage: Asset | null;
  models: Asset[]; // all MODEL_* assets, ordered
  gallery: Asset[]; // GALLERY_IMAGE
  drawings: Asset[]; // DRAWING
  documents: Asset[]; // DOCUMENT
  videos: Asset[]; // VIDEO

  caseStudy: CaseStudySection[];

  createdAt: string;
  updatedAt: string;
}

/** Ordered technical-info fields as label/value pairs (only non-empty shown). */
export interface TechnicalField {
  label: string;
  value: string; // pre-joined for arrays
}
