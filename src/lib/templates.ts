export interface PromptTemplate {
  id: string
  name: string
  category: string
  description: string
  prompt: string
  suggestedOutputType?: string
  suggestedAesthetic?: string
  suggestedAspectRatio?: string
}

export const TEMPLATE_CATEGORIES = {
  product: 'Product',
  event: 'Event',
  social: 'Social',
  brand: 'Brand',
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate[]> = {
  product: [
    {
      id: 'product-launch',
      name: 'Product Launch',
      category: 'Product',
      description: 'Announce a new product with excitement',
      prompt: 'Create an eye-catching product launch announcement featuring [product name]. Show the product in a premium setting with dynamic lighting. Include subtle motion blur to convey excitement and innovation.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'modern',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'product-feature',
      name: 'Feature Highlight',
      category: 'Product',
      description: 'Showcase a specific product feature',
      prompt: 'Design a clean, focused visual highlighting [feature name] of [product]. Use close-up shots, clear typography, and visual indicators to emphasize the key benefit.',
      suggestedOutputType: 'instagram-story',
      suggestedAesthetic: 'minimal',
      suggestedAspectRatio: 'portrait',
    },
    {
      id: 'product-comparison',
      name: 'Before/After',
      category: 'Product',
      description: 'Show transformation or improvement',
      prompt: 'Create a split-screen before and after comparison showing the impact of [product/service]. Use clear visual contrast and subtle arrows or indicators to guide the viewer.',
      suggestedOutputType: 'social-post',
      suggestedAesthetic: 'bold',
      suggestedAspectRatio: 'square',
    },
  ],
  event: [
    {
      id: 'event-invitation',
      name: 'Event Invitation',
      category: 'Event',
      description: 'Invite people to an upcoming event',
      prompt: 'Design an elegant invitation for [event name] on [date]. Include event details in a sophisticated layout with decorative elements that match the event theme. Use warm, inviting colors.',
      suggestedOutputType: 'event-invitation',
      suggestedAesthetic: 'luxury',
      suggestedAspectRatio: 'portrait',
    },
    {
      id: 'event-countdown',
      name: 'Countdown Post',
      category: 'Event',
      description: 'Build anticipation with a countdown',
      prompt: 'Create an exciting countdown graphic for [event name]. Show "[X] days to go" in bold typography with dynamic visual elements. Include event branding and key details.',
      suggestedOutputType: 'instagram-story',
      suggestedAesthetic: 'bold',
      suggestedAspectRatio: 'portrait',
    },
    {
      id: 'event-recap',
      name: 'Event Recap',
      category: 'Event',
      description: 'Summarize event highlights',
      prompt: 'Design a vibrant event recap collage for [event name]. Include key moments, attendee reactions, and memorable highlights in a dynamic layout. Use energetic colors and typography.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'playful',
      suggestedAspectRatio: 'square',
    },
  ],
  social: [
    {
      id: 'quote-card',
      name: 'Quote Card',
      category: 'Social',
      description: 'Share an inspiring quote',
      prompt: 'Create an inspiring quote card featuring: "[quote text]" - [author]. Use elegant typography, subtle background textures, and complementary colors that evoke the quote\'s emotion.',
      suggestedOutputType: 'quote-card',
      suggestedAesthetic: 'minimal',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'tip-tuesday',
      name: 'Tip/Tutorial',
      category: 'Social',
      description: 'Share helpful tips or tutorials',
      prompt: 'Design a clear, informative tip card about [topic]. Use numbered steps or bullet points, icons for visual interest, and a friendly, approachable style.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'professional',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'milestone',
      name: 'Milestone Celebration',
      category: 'Social',
      description: 'Celebrate achievements and milestones',
      prompt: 'Create a celebratory graphic announcing [milestone] (e.g., "10K followers", "5 years in business"). Use confetti, celebratory elements, and bold typography to convey excitement.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'playful',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'poll-question',
      name: 'Poll/Question',
      category: 'Social',
      description: 'Engage audience with questions',
      prompt: 'Design an engaging poll or question graphic asking: "[question]". Include multiple choice options or open-ended prompt. Use interactive visual elements and clear typography.',
      suggestedOutputType: 'instagram-story',
      suggestedAesthetic: 'playful',
      suggestedAspectRatio: 'portrait',
    },
  ],
  brand: [
    {
      id: 'brand-values',
      name: 'Brand Values',
      category: 'Brand',
      description: 'Communicate core brand values',
      prompt: 'Create a visual representation of [brand value] (e.g., "Sustainability", "Innovation"). Use symbolic imagery, brand colors, and concise text to convey the value\'s meaning.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'modern',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'team-intro',
      name: 'Team Introduction',
      category: 'Brand',
      description: 'Introduce team members',
      prompt: 'Design a friendly team member introduction for [name], [role]. Include space for a photo, fun facts, and personality. Use warm colors and approachable typography.',
      suggestedOutputType: 'instagram-post',
      suggestedAesthetic: 'organic',
      suggestedAspectRatio: 'square',
    },
    {
      id: 'testimonial',
      name: 'Customer Testimonial',
      category: 'Brand',
      description: 'Share customer feedback',
      prompt: 'Create a testimonial card featuring: "[testimonial quote]" - [customer name]. Use quotation marks, customer attribution, and trust-building design elements.',
      suggestedOutputType: 'testimonial-card',
      suggestedAesthetic: 'professional',
      suggestedAspectRatio: 'square',
    },
  ],
}

export function getAllTemplates(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES).flat()
}

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES[category] || []
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return getAllTemplates().find(t => t.id === id)
}
