import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import Search2FillIcon from 'remixicon-react/Search2FillIcon'
import CONFIG from '../config'

export const EndspaceSearchButton = ({
  searchModal,
  isExpanded = false,
  variant = 'sidebar'
}) => {
  const router = useRouter()
  const showSearch = siteConfig('ENDSPACE_MENU_SEARCH', true, CONFIG)

  if (showSearch === false) {
    return null
  }

  const handleSearch = () => {
    if (siteConfig('ALGOLIA_APP_ID') && searchModal?.current?.openSearch) {
      searchModal.current.openSearch()
      return
    }

    router.push('/search')
  }

  if (variant === 'mobile') {
    return (
      <button
        type='button'
        onClick={handleSearch}
        title='Search'
        aria-label='Search'
        className='flex h-14 w-14 items-center justify-center text-[var(--endspace-text-primary)] transition-colors hover:text-[var(--endspace-accent-yellow)]'
      >
        <Search2FillIcon size={24} />
      </button>
    )
  }

  return (
    <button
      type='button'
      onClick={handleSearch}
      title='Search'
      aria-label='Search'
      className={`mx-auto flex h-10 items-center border border-[var(--endspace-border-base)] bg-[var(--endspace-bg-secondary)] text-[var(--endspace-text-muted)] transition-all duration-300 hover:bg-[var(--endspace-bg-tertiary)] hover:text-[var(--endspace-text-primary)] ${
        isExpanded
          ? 'w-[calc(100%-1.5rem)] justify-start gap-3 px-3'
          : 'w-10 justify-center rounded-full'
      }`}
    >
      <Search2FillIcon size={18} className='flex-shrink-0' />
      <span
        className={`overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
          isExpanded ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        Search
      </span>
    </button>
  )
}

export default EndspaceSearchButton
