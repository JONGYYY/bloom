"use client"

import { X } from "lucide-react"

export interface ConceptTemplate {
  id: string
  name: string
  icon: string
  category: string
  prompt: string
  parameters?: {
    aspectRatio?: string
    quality?: string
  }
}

interface ConceptSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: ConceptTemplate) => void
}

const CONCEPT_TEMPLATES: ConceptTemplate[] = [
  // Social Media
  { id: 'linkedin-post', name: 'LinkedIn Post', icon: '📊', category: 'Social Media', prompt: 'Professional LinkedIn post image with clean design', parameters: { aspectRatio: '1:1' } },
  { id: 'instagram-story', name: 'Instagram Story', icon: '📱', category: 'Social Media', prompt: 'Eye-catching Instagram story with bold visuals', parameters: { aspectRatio: '9:16' } },
  { id: 'twitter-post', name: 'Twitter/X Post', icon: '🐦', category: 'Social Media', prompt: 'Engaging Twitter post image with clear message', parameters: { aspectRatio: '16:9' } },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', icon: '📺', category: 'Social Media', prompt: 'Attention-grabbing YouTube thumbnail with text overlay', parameters: { aspectRatio: '16:9' } },
  { id: 'facebook-post', name: 'Facebook Post', icon: '👥', category: 'Social Media', prompt: 'Facebook post image with community appeal', parameters: { aspectRatio: '1:1' } },
  { id: 'pinterest-pin', name: 'Pinterest Pin', icon: '📌', category: 'Social Media', prompt: 'Vertical Pinterest pin with inspiring visuals', parameters: { aspectRatio: '2:3' } },
  
  // Advertising
  { id: 'display-ad', name: 'Display Ad', icon: '🖼️', category: 'Advertising', prompt: 'Professional display ad with clear call-to-action', parameters: { aspectRatio: '16:9' } },
  { id: 'social-media-ad', name: 'Social Media Ad', icon: '📱', category: 'Advertising', prompt: 'Social media ad optimized for engagement', parameters: { aspectRatio: '1:1' } },
  { id: 'promo-banner', name: 'Promo Banner', icon: '🎯', category: 'Advertising', prompt: 'Promotional banner with special offer highlight', parameters: { aspectRatio: '16:9' } },
  { id: 'sale-event', name: 'Sale Event', icon: '🏷️', category: 'Advertising', prompt: 'Sale event promotional image with urgency', parameters: { aspectRatio: '4:5' } },
  { id: 'billboard-ad', name: 'Billboard Ad', icon: '🚗', category: 'Advertising', prompt: 'Large-scale billboard advertisement with bold message', parameters: { aspectRatio: '16:9' } },
  { id: 'coupon-voucher', name: 'Coupon / Voucher', icon: '🎟️', category: 'Advertising', prompt: 'Attractive coupon or voucher design', parameters: { aspectRatio: '4:5' } },
  
  // Announcement
  { id: 'product-launch', name: 'Product Launch', icon: '🚀', category: 'Announcement', prompt: 'Exciting product launch announcement with hero product', parameters: { aspectRatio: '16:9' } },
  { id: 'event-invite', name: 'Event Invite', icon: '📅', category: 'Announcement', prompt: 'Elegant event invitation with key details', parameters: { aspectRatio: '4:5' } },
  { id: 'milestone', name: 'Milestone', icon: '🎉', category: 'Announcement', prompt: 'Celebratory milestone announcement', parameters: { aspectRatio: '1:1' } },
  { id: 'hiring-poster', name: 'Hiring Poster', icon: '💼', category: 'Announcement', prompt: 'Professional hiring poster with company culture', parameters: { aspectRatio: '4:5' } },
  { id: 'coming-soon', name: 'Coming Soon', icon: '⏰', category: 'Announcement', prompt: 'Teaser image for upcoming launch', parameters: { aspectRatio: '16:9' } },
  { id: 'seasonal-holiday', name: 'Seasonal / Holiday', icon: '🎄', category: 'Announcement', prompt: 'Seasonal or holiday themed announcement', parameters: { aspectRatio: '1:1' } },
  
  // Blog & Content
  { id: 'blog-header', name: 'Blog Header', icon: '📝', category: 'Blog & Content', prompt: 'Professional blog post header image', parameters: { aspectRatio: '16:9' } },
  { id: 'quote-card', name: 'Quote Card', icon: '💬', category: 'Blog & Content', prompt: 'Inspirational quote card with typography focus', parameters: { aspectRatio: '1:1' } },
  { id: 'infographic', name: 'Infographic', icon: '📊', category: 'Blog & Content', prompt: 'Data visualization infographic with clear hierarchy', parameters: { aspectRatio: '2:3' } },
  { id: 'ebook-cover', name: 'eBook Cover', icon: '📚', category: 'Blog & Content', prompt: 'Professional eBook cover design', parameters: { aspectRatio: '2:3' } },
  { id: 'newsletter-header', name: 'Newsletter Header', icon: '📰', category: 'Blog & Content', prompt: 'Email newsletter header image', parameters: { aspectRatio: '16:9' } },
  
  // Product
  { id: 'product-shot', name: 'Product Shot', icon: '📦', category: 'Product', prompt: 'Clean product photography with studio lighting', parameters: { aspectRatio: '1:1' } },
  { id: 'lifestyle-product', name: 'Lifestyle Product', icon: '🏠', category: 'Product', prompt: 'Product in lifestyle context with natural setting', parameters: { aspectRatio: '4:5' } },
  { id: 'product-comparison', name: 'Product Comparison', icon: '⚖️', category: 'Product', prompt: 'Side-by-side product comparison visual', parameters: { aspectRatio: '16:9' } },
  { id: 'packaging-design', name: 'Packaging Design', icon: '📦', category: 'Product', prompt: 'Product packaging mockup', parameters: { aspectRatio: '1:1' } },
  
  // Merchandise
  { id: 't-shirt-design', name: 'T-Shirt Design', icon: '👕', category: 'Merchandise', prompt: 'Creative t-shirt graphic design', parameters: { aspectRatio: '1:1' } },
  { id: 'hoodie-design', name: 'Hoodie Design', icon: '🧥', category: 'Merchandise', prompt: 'Hoodie graphic design with bold artwork', parameters: { aspectRatio: '1:1' } },
  { id: 'tote-bag', name: 'Tote Bag', icon: '👜', category: 'Merchandise', prompt: 'Tote bag design with brand identity', parameters: { aspectRatio: '1:1' } },
  { id: 'mug-design', name: 'Mug Design', icon: '☕', category: 'Merchandise', prompt: 'Coffee mug wrap-around design', parameters: { aspectRatio: '16:9' } },
  { id: 'sticker-design', name: 'Sticker Design', icon: '✨', category: 'Merchandise', prompt: 'Die-cut sticker design with vibrant colors', parameters: { aspectRatio: '1:1' } },
  
  // Profile & Branding
  { id: 'profile-banner', name: 'Profile Banner', icon: '🎨', category: 'Profile & Branding', prompt: 'Social media profile banner with brand identity', parameters: { aspectRatio: '16:9' } },
  { id: 'logo-concept', name: 'Logo Concept', icon: '🔰', category: 'Profile & Branding', prompt: 'Logo design concept with modern aesthetic', parameters: { aspectRatio: '1:1' } },
  { id: 'brand-pattern', name: 'Brand Pattern', icon: '🔲', category: 'Profile & Branding', prompt: 'Seamless brand pattern design', parameters: { aspectRatio: '1:1' } },
]

const CATEGORIES = [
  { id: 'social-media', name: 'Social Media', icon: '#' },
  { id: 'advertising', name: 'Advertising', icon: '📢' },
  { id: 'announcement', name: 'Announcement', icon: '🔔' },
  { id: 'blog-content', name: 'Blog & Content', icon: '📝' },
  { id: 'product', name: 'Product', icon: '📦' },
  { id: 'merchandise', name: 'Merchandise', icon: '👕' },
  { id: 'profile-branding', name: 'Profile & Branding', icon: '🎨' },
]

export default function ConceptSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: ConceptSelectorProps) {
  if (!isOpen) return null

  const getCategoryTemplates = (category: string) => {
    return CONCEPT_TEMPLATES.filter(t => t.category === category)
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-medium)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        className="shadow-soft-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}>
          <h2 className="text-heading">Concepts</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all duration-150"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px'
        }}>
          {CATEGORIES.map((category) => {
            const templates = getCategoryTemplates(category.name)
            if (templates.length === 0) return null

            return (
              <div key={category.id} style={{ marginBottom: '32px' }}>
                <h3 
                  className="text-label" 
                  style={{ 
                    color: 'var(--color-text-secondary)', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template)
                        onClose()
                      }}
                      className="flex items-center gap-2 px-4 h-10 bg-surface-2 border border-border-medium rounded-lg text-label text-text-primary hover:bg-surface-3 hover:border-border-strong transition-all duration-150"
                    >
                      <span style={{ fontSize: '16px' }}>{template.icon}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
