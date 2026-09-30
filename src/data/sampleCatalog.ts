import { PageData, FlipbookPreset } from '../types/flipbook';

export const SAMPLE_PAGES: PageData[] = [
  {
    id: 1,
    pageNumber: 1,
    layout: 'cover',
    title: 'THE MATERIAL INDEX',
    subtitle: 'Annual Architecture, Tactility & Spatial Catalog 2025',
    kicker: 'FLIPCRAFT STUDIO PRESS • VOL. IV',
    category: 'COLLECTION 2025',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'The Pavilion at Oakhaven • Monolithic Cast Concrete & White Bronze',
    bookmarkTitle: 'Front Cover',
    accentColor: '#8083ff',
    hotspots: [
      {
        id: 'hs-cov-1',
        x: 65,
        y: 80,
        title: 'Bespoke Architectural Facets',
        description: 'Hand-finished raw limestone cladding with thermal break engineering.',
        tag: 'FEATURED',
        type: 'annotation',
      }
    ]
  },
  {
    id: 2,
    pageNumber: 2,
    layout: 'editorial',
    title: 'COLLECTION CONTENTS',
    kicker: 'FLIPCRAFT EDITORIAL',
    subtitle: 'Architecture, Furniture, Tactile Surfaces & Light',
    bodyText: 'This edition represents a three-year exploration into sensory architecture. We bridge the tactile essence of raw mineral materials with hyper-precise computational fabrication.',
    callout: '“Objects should not merely occupy physical volume; they must invite tactile contemplation.”',
    links: [
      { id: 'l1', title: 'Chapter 01: Monolithic Volumes', targetPage: 4 },
      { id: 'l2', title: 'Chapter 02: Ceramic Specularity', targetPage: 8 },
      { id: 'l3', title: 'Chapter 03: The Art of Tactile Design', targetPage: 12 },
      { id: 'l4', title: 'Chapter 04: Joinery & Sustain Oak', targetPage: 14 },
      { id: 'l5', title: 'Chapter 05: Ambient Luminescence', targetPage: 18 },
      { id: 'l6', title: 'Appendix: Specifications & Matrix', targetPage: 22 },
    ],
    bookmarkTitle: 'Table of Contents'
  },
  {
    id: 3,
    pageNumber: 3,
    layout: 'editorial',
    title: 'DIRECTOR’S NOTE',
    kicker: 'FOREWORD 2025',
    subtitle: 'Designing for the Subconscious Eye',
    bodyText: 'When we flip through the pages of a tangible book, our peripheral senses calculate mass, friction, and depth before our conscious mind even reads a solitary syllable.\n\nFlipCraft was founded to preserve this sacred ritual within contemporary web environments. Every crease, spine curve, and micro-shadow in this release honors physical craft.',
    quote: 'The true weight of a document is measured in how vividly it resonates in the reader’s memory.',
    quoteAuthor: 'Elena Rostova, Chief Design Officer',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
    imageCaption: 'Studio Portico • Milan Atelier',
  },
  {
    id: 4,
    pageNumber: 4,
    layout: 'chapter-feature',
    chapter: 'CHAPTER 01',
    title: 'MONOLITHIC VOLUMES',
    subtitle: 'Heavy Silhouettes & Balanced Mass',
    kicker: 'SPATIAL STRUCTURE',
    bodyText: 'Challenging the lightweight digital ephemeralism, the 2025 collection anchors residential spaces with poured terrazzo, brushed volcanic basalt, and anodized charcoal aluminum.',
    callout: 'Structural integrity achieved through geometric balance without visible fasteners.',
    bookmarkTitle: 'Chapter 01: Monolithic Volumes'
  },
  {
    id: 5,
    pageNumber: 5,
    layout: 'gallery',
    title: 'BASALT CANOPY',
    subtitle: 'Private Residence, Engadin Alps',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 1.4 • Cantilevered overhang with concealed linear uplighting',
    imageBadge: 'ARCHITECTURAL EXCELLENCE',
    hotspots: [
      {
        id: 'hs-5-1',
        x: 42,
        y: 35,
        title: 'Thermal Core Concrete',
        description: 'Retains geothermal radiant energy with embedded hydronic tubes.',
        type: 'spec',
      },
      {
        id: 'hs-5-2',
        x: 75,
        y: 65,
        title: 'Flush Sill Glazing',
        description: 'Triple-pane solar-gain German glass with automated acoustic dampers.',
        type: 'annotation',
      }
    ]
  },
  {
    id: 6,
    pageNumber: 6,
    layout: 'editorial',
    title: 'ACOUSTIC SANCTUARIES',
    kicker: 'OBJECT LAB',
    subtitle: 'Near-Field Spatial Audio Elements',
    bodyText: 'Sound shaping through natural geometry. The Apex Acoustic Series combines hand-milled walnut resonance chambers with precision planar magnetic transducers for uncolored fidelity.',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Apex-01 Reference Headphones & Sound Stand',
    hotspots: [
      {
        id: 'hs-6-1',
        x: 50,
        y: 45,
        title: 'Apex-01 Monitor',
        description: 'Bespoke beryllium driver with open-back lambskin cushions.',
        price: '$1,250',
        tag: 'PRE-ORDER',
        type: 'product',
      }
    ]
  },
  {
    id: 7,
    pageNumber: 7,
    layout: 'specs',
    title: 'ACOUSTIC BENCHMARKS',
    kicker: 'LAB REPORT 09',
    subtitle: 'Harmonic Distortion & Transient Response',
    bodyText: 'Every unit is tuned in our anechoic test chamber in Copenhagen. Resonance is damped using sustainable organic sheep wool batting.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Harmonic response plotted from 5Hz to 48kHz',
    callout: 'THD: < 0.02% @ 1kHz, 94dB SPL across all frequency ranges.'
  },
  {
    id: 8,
    pageNumber: 8,
    layout: 'chapter-feature',
    chapter: 'CHAPTER 02',
    title: 'CERAMIC SPECULARITY',
    subtitle: 'Kyoto Stoneware & High-Fire Minerals',
    kicker: 'MATERIAL LABORATORY',
    bodyText: 'We collaborated with master potters in Shigaraki to create tableware and vessel forms that celebrate geological imperfections. Clay formulated with iron-rich crushed feldspar.',
    bookmarkTitle: 'Chapter 02: Ceramic Specularity'
  },
  {
    id: 9,
    pageNumber: 9,
    layout: 'gallery',
    title: 'VESSEL SUITE NO. 4',
    subtitle: 'Matte Ash Glazes on Red Earthenware',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 2.8 • Hand-thrown unglazed exterior with silk satin interior lining',
    imageBadge: 'LIMITED RUN (150 PCS)',
    hotspots: [
      {
        id: 'hs-9-1',
        x: 48,
        y: 60,
        title: 'Shigaraki Raw Pitcher',
        description: 'Wood-fired for 72 hours in a traditional anagama kiln.',
        price: '$380',
        type: 'product',
      }
    ]
  },
  {
    id: 10,
    pageNumber: 10,
    layout: 'editorial',
    title: 'TACTILE COLOR LAB',
    kicker: 'SURFACE & PIGMENT',
    subtitle: 'The 2025 Mineral Pigment Spectrum',
    bodyText: 'Color is never treated as a surface coating; it is mixed directly into the binder matrix. Our six core pigments are extracted from ochre pits, ground lapis, and river slate.',
    callout: 'Color shifts dynamically with diurnal sunlight cycles from cool morning blues to warm twilight embers.'
  },
  {
    id: 11,
    pageNumber: 11,
    layout: 'specs',
    title: 'SWATCH ARCHIVE',
    kicker: 'SPECTRAL VALUES',
    subtitle: 'Certified Low-VOC Mineral Stains',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Fig 3.1 • Reflected wavelength measurements under CIE D65 illuminant',
    bodyText: 'Reflectance tested under high-output daylight simulators. Guaranteed zero fading over a 50-year UV degradation horizon.'
  },
  {
    // The exact page 12 in the screenshot!
    id: 12,
    pageNumber: 12,
    layout: 'editorial',
    kicker: 'FLIPCRAFT EDITORIAL VOL. 04',
    category: 'SPRING CATALOG',
    title: 'THE ART OF TACTILE DESIGN',
    subtitle: 'Sensory weight, friction, and the human response to physical materials.',
    bodyText: 'In an era dominated by frictionless glass touchscreens, our tactile sensibilities crave resistance, grain, and physical permanence. When an object demands two hands to open, its contents command our undivided focus.\n\nThrough subtle variations in paper calipers, embossed debossing, and adaptive ambient shadows, digital media can evoke the very same gravitational respect.',
    callout: '“When weight is restored to information, attention returns naturally.”',
    bookmarkTitle: 'Feature: The Art of Tactile Design'
  },
  {
    // The exact page 13 in the screenshot!
    id: 13,
    pageNumber: 13,
    layout: 'chapter-feature',
    chapter: 'CHAPTER 03 —',
    category: 'PRO VIEW',
    title: 'SPATIAL DEPTH',
    subtitle: 'Adaptive Lighting & Volumetric Paper',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 4.2 • Surface Specularity',
    imageBadge: 'ADAPTIVE LIGHTING',
    bodyText: 'Simulating three-dimensional light bounce across curved paper fibers. Real-time normal maps react to virtual point light sources as spreads turn.',
    hotspots: [
      {
        id: 'hs-13-1',
        x: 48,
        y: 42,
        title: 'Fig 4.2 • Surface Specularity',
        description: 'Micro-facet scattering algorithm simulating silk-coated 180gsm art paper.',
        type: 'annotation',
      },
      {
        id: 'hs-13-2',
        x: 82,
        y: 28,
        title: 'Adaptive Lighting Engine',
        description: 'Dynamic ambient occlusion calculation rendered at 60 FPS in WebGL.',
        type: 'spec',
      }
    ],
    bookmarkTitle: 'Chapter 03: Spatial Depth'
  },
  {
    id: 14,
    pageNumber: 14,
    layout: 'editorial',
    title: 'SUSTAINABLE HARDWOOD',
    kicker: 'FOREST TO BENCH',
    subtitle: 'FSC-Certified Old-Growth White Oak',
    bodyText: 'We source exclusively from managed European forests in Normandy and the Black Forest. Trees are harvested during winter dormancy to minimize sap moisture content.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Quarter-sawn oak billets curing under controlled humidity',
    callout: 'Zero chemical plasticizers. Hand-rubbed with organic Danish tung oil and beeswax.'
  },
  {
    id: 15,
    pageNumber: 15,
    layout: 'gallery',
    title: 'THE NORD CREDENZA',
    subtitle: 'Sliding Tambour Doors & Solid Cast Brass Handles',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 5.1 • Continuous grain wrapping across all four exterior miters',
    imageBadge: 'CRAFTSMAN PRIZE 2024',
    hotspots: [
      {
        id: 'hs-15-1',
        x: 35,
        y: 72,
        title: 'Nord Credenza 220',
        description: 'Solid white oak with integrated cable channels and felt-lined drawers.',
        price: '$4,800',
        tag: 'AVAILABLE',
        type: 'product',
      }
    ],
    bookmarkTitle: 'Nord Credenza Feature'
  },
  {
    id: 16,
    pageNumber: 16,
    layout: 'specs',
    title: 'PRECISION JOINERY',
    kicker: 'TECHNICAL SCHEMATICS',
    subtitle: 'Traditional Mortise & Tenon Tolerances',
    bodyText: 'Every corner intersection is machined to a +/- 0.05mm tolerance before hand-truing with Japanese block planes. Joints are engineered to allow seasonal wood expansion without buckling.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Exploded axonometric view of the floating leg apron connection',
  },
  {
    id: 17,
    pageNumber: 17,
    layout: 'editorial',
    title: 'BIOPHILIC SPACES',
    kicker: 'WORKSPACE ERGONOMICS',
    subtitle: 'Balancing Daylight, Air & Posture',
    bodyText: 'Modern desk systems are calibrated around circadian daylight transitions. By utilizing matte matte-diffusive surfaces, screen glare is reduced by 64% compared to standard lacquered surfaces.',
    callout: '“An inspiring workspace is not an extravagance; it is the silent catalyst of creative velocity.”'
  },
  {
    id: 18,
    pageNumber: 18,
    layout: 'chapter-feature',
    chapter: 'CHAPTER 05 —',
    category: 'LIGHTING',
    title: 'AMBIENT LUMINESCENCE',
    subtitle: 'Sculptural Fixtures & Warm Color Temperatures',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 6.3 • Hand-blown borosilicate glass sphere with spun brass base',
    imageBadge: '2200K CRI 98',
    bookmarkTitle: 'Chapter 05: Ambient Luminescence'
  },
  {
    id: 19,
    pageNumber: 19,
    layout: 'editorial',
    title: 'THE RADIANCE PENDANT',
    kicker: 'LUMEN LABORATORY',
    subtitle: 'Diffuse Indirect Architectural Illumination',
    bodyText: 'Engineered with an ultra-warm 2200K phosphor array that replicates the soothing spectral envelope of sunset candlelight. Flicker-free dimming from 100% down to 0.1% current.',
    imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'The Radiance Pendant suspended over blackened steel desk',
    hotspots: [
      {
        id: 'hs-19-1',
        x: 52,
        y: 38,
        title: 'Radiance Pendant No. 2',
        description: 'Solid spun brass with hand-applied satin wax patina.',
        price: '$920',
        type: 'product',
      }
    ]
  },
  {
    id: 20,
    pageNumber: 20,
    layout: 'editorial',
    title: 'CASE STUDY: ALPINE VILLA',
    kicker: 'GLOBAL INSTALLATION',
    subtitle: 'St. Moritz Retreat & Studio Gallery',
    bodyText: 'Commissioned for a contemporary collector in the Upper Engadine. The residence features bespoke built-in library millwork and full-height pivot doors made of local Swiss stone pine.',
    callout: 'A seamless dialogue between panoramic mountain vistas and deeply grounded interior warmth.'
  },
  {
    id: 21,
    pageNumber: 21,
    layout: 'gallery',
    title: 'THE ENGADINE LIBRARY',
    subtitle: 'Floor-to-Ceiling Shelving with Integrated Brass Ladders',
    imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Fig 7.4 • Over 4,000 architectural folios housed in temperature-stable stacks',
    imageBadge: 'BESPOKE COMMISSIONS',
    hotspots: [
      {
        id: 'hs-21-1',
        x: 60,
        y: 45,
        title: 'Rolling Brass Library Ladder',
        description: 'Tread-damped wheels with magnetic brake lock mechanism.',
        type: 'spec',
      }
    ]
  },
  {
    id: 22,
    pageNumber: 22,
    layout: 'specs',
    title: 'MATERIAL MATRIX & CERTIFICATIONS',
    kicker: 'RESPONSIBILITY INDEX',
    subtitle: 'Cradle-to-Cradle Gold & Carbon Verification',
    bodyText: 'We quantify embodied carbon across the lifecycle of every catalog item. 100% of electricity in our mills is derived from localized run-of-the-river hydroelectric power.',
    callout: 'Cradle to Cradle Certified® Gold across 94% of standard product catalog lines.'
  },
  {
    id: 23,
    pageNumber: 23,
    layout: 'editorial',
    title: 'GLOBAL GALLERIES',
    kicker: 'WHERE TO EXPERIENCE',
    subtitle: 'Stockists, Showrooms & Material Libraries',
    bodyText: 'Visit our permanent experiential spaces to feel raw swatches, inspect joint cuts, and consult with our spatial designers.\n\n• New York: 482 Broome St, SoHo\n• London: 14 Mount St, Mayfair\n• Tokyo: 5-7-22 Minami-Aoyama, Minato\n• Copenhagen: Bredgade 32\n• Zürich: Rämistrasse 18',
    callout: 'Private appointments include complimentary tactile sample boxes and engineering consultation.'
  },
  {
    id: 24,
    pageNumber: 24,
    layout: 'backcover',
    title: 'FLIPCRAFT STUDIO PRESS',
    subtitle: 'Digital Tactility for Contemporary Publications',
    kicker: 'PRINTED & DIGITIZED IN 2025',
    bodyText: 'All rights reserved. Designed with FlipCraft Studio 3D Engine. High-resolution vector parsing, procedural paper shaders, and interactive hotspot indexing.',
    imageCaption: 'ISBN 978-0-987654-32-1 • Editorial Series Vol. 4',
    bookmarkTitle: 'Back Cover'
  }
];

export const PRESETS: FlipbookPreset[] = [
  {
    id: 'editorial-glossy',
    name: 'Editorial Glossy Mag',
    coverType: 'hardcover',
    boardThicknessMm: 8.0,
    sheen: 'matte',
    roundedCorners: true,
    perspectiveTilt: 42,
    description: 'Crisp magazine layout with satin pages, stiff board cover, and subtle spine curl.'
  },
  {
    id: 'minimalist-lookbook',
    name: 'Minimalist Lookbook',
    coverType: 'paperback',
    boardThicknessMm: 4.5,
    sheen: 'glossy',
    roundedCorners: false,
    perspectiveTilt: 30,
    description: 'High-gloss photo finish on flexible soft cover paper with deep vibrant colors.'
  },
  {
    id: 'corporate-annual',
    name: 'Corporate Annual Report',
    coverType: 'spiral',
    boardThicknessMm: 6.0,
    sheen: 'matte',
    roundedCorners: true,
    perspectiveTilt: 38,
    description: 'Wire coil spiral binding, lay-flat presentation, and clean structured layout.'
  },
  {
    id: 'luxury-folio',
    name: 'Luxury Leather Folio',
    coverType: 'leather',
    boardThicknessMm: 12.0,
    sheen: 'gold',
    roundedCorners: true,
    perspectiveTilt: 45,
    description: 'Stitched leather grain cover, heavy board, gold foil stamped typography.'
  },
  {
    id: 'art-linen',
    name: 'Art & Photography Album',
    coverType: 'hardcover',
    boardThicknessMm: 10.0,
    sheen: 'linen',
    roundedCorners: false,
    perspectiveTilt: 36,
    description: 'Tactile woven cloth linen sheen, archival heavy paper, and museum presentation.'
  }
];
