import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { IconArrowRight } from '@tabler/icons-react'
import CONFIG from '../config'
import { EndspaceImage } from './EndspaceImage'

/**
 * BlogPostCard Component - Minimalist Light Industrial
 * Post card with clean design
 */
export const BlogPostCard = ({ post, showSummary = true }) => {
  const showPreview = siteConfig('ENDSPACE_POST_LIST_PREVIEW', true, CONFIG)
  const showCover = siteConfig('ENDSPACE_POST_LIST_COVER', true, CONFIG)
  const hasCover = showCover && post.pageCoverThumbnail

  return (
    <SmartLink href={`/${post.slug}`}>
      <article className='endspace-frame group relative mb-6 flex flex-col overflow-hidden transition-all duration-300'>
        {hasCover && (
          <EndspaceImage
            wrapperClassName='w-full aspect-video flex-shrink-0 z-10 bg-black/5'
            src={post.pageCoverThumbnail}
            alt={post.title}
            className='h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105'
          >
            <div className='absolute right-3 top-3 z-20 h-2 w-2 bg-[var(--endspace-accent-yellow)] opacity-0 transition-opacity group-hover:opacity-100' />
          </EndspaceImage>
        )}

        <div className='relative z-10 flex flex-1 flex-col justify-center overflow-hidden p-5 md:p-6'>
          <div className='absolute inset-0 z-0 origin-left scale-x-0 bg-[#FBFB45] transition-transform duration-300 ease-out group-hover:scale-x-100' />
          <div className='absolute left-0 right-0 top-0 z-20 h-1.5 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

          <div className='relative z-10'>
            <div className='mb-3 flex items-center gap-3 font-mono text-xs text-[var(--endspace-text-muted)] transition-colors group-hover:text-black/60'>
              <span className='font-bold text-[var(--endspace-text-primary)] transition-colors group-hover:text-black'>
                {post.publishDay}
              </span>
              <span className='h-3 w-px bg-[var(--endspace-border-base)] transition-colors group-hover:bg-black/30' />
              {post.category && (
                <span className='tracking-wider'>
                  {post.category.toUpperCase()}
                </span>
              )}
            </div>

            <h2 className='mb-4 text-2xl font-black leading-tight text-[var(--endspace-text-primary)] transition-colors group-hover:text-black md:text-3xl'>
              {post.title}
            </h2>

            {showSummary && showPreview && post.summary && (
              <p className='mb-6 line-clamp-2 text-sm font-medium leading-relaxed text-[var(--endspace-text-secondary)] transition-colors group-hover:text-black/70 md:line-clamp-3'>
                {post.summary}
              </p>
            )}

            <div className='mt-auto flex items-center justify-between'>
              <div className='flex gap-2'>
                {post.tags?.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className='rounded bg-[var(--endspace-bg-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--endspace-text-muted)] transition-colors group-hover:bg-black group-hover:text-white'
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--endspace-text-primary)] transition-all group-hover:gap-3 group-hover:text-black'>
                <span>Access</span>
                <IconArrowRight
                  size={12}
                  stroke={2}
                  className='transition-transform group-hover:translate-x-1 group-hover:text-black'
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </SmartLink>
  )
}
