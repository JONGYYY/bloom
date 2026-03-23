export interface OutputType {
  id: string
  label: string
  category: string
  description?: string
  icon?: string
  aspectRatio?: string
}

export const OUTPUT_TYPE_CATEGORIES = {
  social: 'Social Media',
  advertising: 'Advertising',
  brand: 'Brand Assets',
  merchandise: 'Merchandise',
  content: 'Content',
  product: 'Product',
  events: 'Events',
}

export const OUTPUT_TYPES: Record<string, OutputType[]> = {
  social: [
    { id: 'instagram-post', label: 'Instagram Post', category: 'Social Media', description: 'Square post (1:1)', icon: '📱', aspectRatio: 'square' },
    { id: 'instagram-story', label: 'Instagram Story', category: 'Social Media', description: 'Vertical story (9:16)', icon: '📱', aspectRatio: 'portrait' },
    { id: 'instagram-reel', label: 'Instagram Reel Cover', category: 'Social Media', description: 'Reel thumbnail (9:16)', icon: '🎬', aspectRatio: 'portrait' },
    { id: 'twitter-post', label: 'Twitter/X Post', category: 'Social Media', description: 'Horizontal post (16:9)', icon: '🐦', aspectRatio: 'landscape' },
    { id: 'linkedin-post', label: 'LinkedIn Post', category: 'Social Media', description: 'Professional post (1.91:1)', icon: '💼', aspectRatio: 'landscape' },
    { id: 'facebook-cover', label: 'Facebook Cover', category: 'Social Media', description: 'Cover photo (16:9)', icon: '👥', aspectRatio: 'landscape' },
    { id: 'tiktok-cover', label: 'TikTok Cover', category: 'Social Media', description: 'Video cover (9:16)', icon: '🎵', aspectRatio: 'portrait' },
    { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', category: 'Social Media', description: 'Video thumbnail (16:9)', icon: '📺', aspectRatio: 'landscape' },
  ],
  advertising: [
    { id: 'display-ad', label: 'Display Ad', category: 'Advertising', description: 'Web display advertisement', icon: '🎯' },
    { id: 'billboard', label: 'Billboard', category: 'Advertising', description: 'Large outdoor ad', icon: '🏙️', aspectRatio: 'landscape' },
    { id: 'print-ad', label: 'Print Ad', category: 'Advertising', description: 'Magazine/newspaper ad', icon: '📰', aspectRatio: 'portrait' },
    { id: 'banner-ad', label: 'Banner Ad', category: 'Advertising', description: 'Wide web banner', icon: '📊', aspectRatio: 'landscape' },
    { id: 'sponsored-post', label: 'Sponsored Post', category: 'Advertising', description: 'Social media ad', icon: '💰' },
    { id: 'promo-graphic', label: 'Promotional Graphic', category: 'Advertising', description: 'General promotion', icon: '✨' },
  ],
  brand: [
    { id: 'logo-variation', label: 'Logo Variation', category: 'Brand Assets', description: 'Alternative logo design', icon: '🎨' },
    { id: 'brand-pattern', label: 'Brand Pattern', category: 'Brand Assets', description: 'Repeating pattern', icon: '🔲' },
    { id: 'icon-set', label: 'Icon Set', category: 'Brand Assets', description: 'Custom icons', icon: '🔷' },
    { id: 'brand-illustration', label: 'Brand Illustration', category: 'Brand Assets', description: 'Custom artwork', icon: '🖼️' },
    { id: 'letterhead', label: 'Letterhead', category: 'Brand Assets', description: 'Business letterhead', icon: '📄', aspectRatio: 'portrait' },
    { id: 'brand-wallpaper', label: 'Brand Wallpaper', category: 'Brand Assets', description: 'Desktop/mobile wallpaper', icon: '🖥️' },
  ],
  merchandise: [
    { id: 'tshirt-design', label: 'T-Shirt Design', category: 'Merchandise', description: 'Apparel graphic', icon: '👕' },
    { id: 'hoodie-design', label: 'Hoodie Design', category: 'Merchandise', description: 'Hoodie print', icon: '🧥' },
    { id: 'mug-design', label: 'Mug Design', category: 'Merchandise', description: 'Coffee mug wrap', icon: '☕' },
    { id: 'tote-bag', label: 'Tote Bag', category: 'Merchandise', description: 'Bag print design', icon: '👜' },
    { id: 'sticker', label: 'Sticker', category: 'Merchandise', description: 'Die-cut sticker', icon: '🏷️' },
    { id: 'poster', label: 'Poster', category: 'Merchandise', description: 'Wall poster', icon: '🖼️', aspectRatio: 'portrait' },
    { id: 'phone-case', label: 'Phone Case', category: 'Merchandise', description: 'Mobile case design', icon: '📱' },
  ],
  content: [
    { id: 'blog-header', label: 'Blog Header', category: 'Content', description: 'Article header image', icon: '📝', aspectRatio: 'landscape' },
    { id: 'quote-card', label: 'Quote Card', category: 'Content', description: 'Inspirational quote', icon: '💬' },
    { id: 'infographic', label: 'Infographic Element', category: 'Content', description: 'Data visualization', icon: '📊' },
    { id: 'presentation-slide', label: 'Presentation Slide', category: 'Content', description: 'Slide background', icon: '📽️', aspectRatio: 'landscape' },
    { id: 'newsletter-header', label: 'Newsletter Header', category: 'Content', description: 'Email header', icon: '📧', aspectRatio: 'landscape' },
    { id: 'testimonial-card', label: 'Testimonial Card', category: 'Content', description: 'Customer review', icon: '⭐' },
  ],
  product: [
    { id: 'product-shot', label: 'Product Shot', category: 'Product', description: 'Product photography style', icon: '📦' },
    { id: 'packaging-design', label: 'Packaging Design', category: 'Product', description: 'Box/package design', icon: '📦' },
    { id: 'label-design', label: 'Label Design', category: 'Product', description: 'Product label', icon: '🏷️' },
    { id: 'product-mockup', label: 'Product Mockup', category: 'Product', description: 'Realistic mockup', icon: '🎁' },
    { id: 'ecommerce-banner', label: 'E-commerce Banner', category: 'Product', description: 'Shop banner', icon: '🛒', aspectRatio: 'landscape' },
  ],
  events: [
    { id: 'event-invitation', label: 'Event Invitation', category: 'Events', description: 'Invite card', icon: '💌' },
    { id: 'flyer', label: 'Flyer', category: 'Events', description: 'Event flyer', icon: '📄', aspectRatio: 'portrait' },
    { id: 'ticket-design', label: 'Ticket Design', category: 'Events', description: 'Event ticket', icon: '🎫' },
    { id: 'event-program', label: 'Event Program', category: 'Events', description: 'Program booklet', icon: '📖', aspectRatio: 'portrait' },
  ],
}

export function getAllOutputTypes(): OutputType[] {
  return Object.values(OUTPUT_TYPES).flat()
}

export function getOutputTypeById(id: string): OutputType | undefined {
  return getAllOutputTypes().find(type => type.id === id)
}

export function getOutputTypesByCategory(category: string): OutputType[] {
  return OUTPUT_TYPES[category] || []
}
