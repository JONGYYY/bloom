export interface OutputType {
  id: string
  label: string
  category: string
  description?: string
}

export const OUTPUT_TYPE_CATEGORIES = {
  social: 'Social & Promotion',
  brand: 'Brand & Content',
  marketing: 'Marketing & Ads',
  print: 'Print & Physical',
  web: 'Web & Digital',
}

export const OUTPUT_TYPES: Record<string, OutputType[]> = {
  social: [
    { id: 'social-post', label: 'Social Post', category: 'Social & Promotion', description: 'Square social media post' },
    { id: 'story', label: 'Story / Vertical Social', category: 'Social & Promotion', description: 'Instagram/Facebook story format' },
    { id: 'carousel', label: 'Carousel Slide', category: 'Social & Promotion', description: 'Multi-slide carousel post' },
    { id: 'cover-photo', label: 'Cover Photo', category: 'Social & Promotion', description: 'Profile/page cover image' },
  ],
  brand: [
    { id: 'quote-card', label: 'Quote Card', category: 'Brand & Content', description: 'Inspirational quote design' },
    { id: 'announcement', label: 'Announcement', category: 'Brand & Content', description: 'Company announcement graphic' },
    { id: 'infographic', label: 'Infographic Element', category: 'Brand & Content', description: 'Data visualization component' },
    { id: 'testimonial', label: 'Testimonial Card', category: 'Brand & Content', description: 'Customer testimonial design' },
  ],
  marketing: [
    { id: 'display-ad', label: 'Display Ad', category: 'Marketing & Ads', description: 'Web display advertisement' },
    { id: 'promo-banner', label: 'Promo Banner', category: 'Marketing & Ads', description: 'Promotional banner' },
    { id: 'email-header', label: 'Email Header', category: 'Marketing & Ads', description: 'Email campaign header' },
    { id: 'cta-graphic', label: 'CTA Graphic', category: 'Marketing & Ads', description: 'Call-to-action visual' },
  ],
  print: [
    { id: 'flyer', label: 'Flyer', category: 'Print & Physical', description: 'Printable flyer design' },
    { id: 'poster', label: 'Poster', category: 'Print & Physical', description: 'Event or promotional poster' },
    { id: 'business-card', label: 'Business Card', category: 'Print & Physical', description: 'Professional business card' },
  ],
  web: [
    { id: 'hero-image', label: 'Hero Image', category: 'Web & Digital', description: 'Website hero section' },
    { id: 'blog-header', label: 'Blog Header', category: 'Web & Digital', description: 'Blog post header image' },
    { id: 'thumbnail', label: 'Thumbnail', category: 'Web & Digital', description: 'Video or content thumbnail' },
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
