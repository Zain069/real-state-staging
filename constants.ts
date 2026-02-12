import { StagingStyle, RoomType } from './types';

export const STAGING_STYLES: StagingStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, neutral colors, and minimalism.',
    image: 'https://picsum.photos/400/300?random=1',
    promptModifier: 'sleek furniture, minimalist sofas, glass coffee tables, contemporary art, geometric rugs, low profile seating'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Cozy, light woods, and functional beauty.',
    image: 'https://picsum.photos/400/300?random=2',
    promptModifier: 'light oak furniture, soft fabric sofas, functional decor, cozy throws, minimal clutter, woven rugs'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw textures, metal accents, and exposed elements.',
    image: 'https://picsum.photos/400/300?random=3',
    promptModifier: 'chesterfield leather sofas, metal frame coffee tables, raw wood furniture, vintage standing lamps, iron accents'
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic patterns, plants, and organic vibes.',
    image: 'https://picsum.photos/400/300?random=4',
    promptModifier: 'rattan chairs, patterned persian rugs, many indoor plants, macrame decor, eclectic cushions, warm wood furniture'
  },
  {
    id: 'luxury',
    name: 'Luxury/Glam',
    description: 'High-end finishes, velvet, and gold accents.',
    image: 'https://picsum.photos/400/300?random=5',
    promptModifier: 'tufted velvet sofas, gold brass accents, marble top tables, high-end upholstery, crystal decor, expensive area rugs'
  },
  {
    id: 'farmhouse',
    name: 'Modern Farmhouse',
    description: 'Rustic charm mixed with modern comforts.',
    image: 'https://picsum.photos/400/300?random=6',
    promptModifier: 'rustic wood tables, comfortable linen sofas, farmhouse decor, wrought iron accents, cozy textiles, neutral fabric furniture'
  }
];

export const ROOM_TYPES: RoomType[] = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Empty Room'
];