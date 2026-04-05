import SmartLink from '@/components/SmartLink'

/**
 * 首页导航大按钮组件
 * @param {*} props
 * @returns
 */
const NavButtonGroup = (props) => {
  const { categoryOptions } = props
  if (!categoryOptions || categoryOptions.length === 0) {
    return <></>
  }

  return (
    <nav id='home-nav-button' className={'w-full z-10 md:h-72 md:mt-6 xl:mt-32 px-5 py-2 mt-8 flex flex-wrap md:max-w-6xl space-y-2 md:space-y-0 md:flex justify-center max-h-80 overflow-auto'}>
      {categoryOptions?.map(category => {
        return (
          <SmartLink
            key={`${category.name}`}
            title={`${category.name}`}
            href={`/category/${category.name}`}
            passHref
            data-repel-kind='button'
            data-repel-strength='1.05'
            data-repel-radius='220'
            data-repel-scale='0.05'
            className='hexo-hero-button hexo-hero-repel text-center shadow-text w-full sm:w-4/5 md:mx-6 md:w-40 md:h-14 lg:h-20 h-14 justify-center items-center flex border-2 cursor-pointer rounded-lg glassmorphism hover:bg-white hover:text-black duration-200 hover:scale-105 transform'>
              <span className='hexo-hero-button-text'>
                <span
                  aria-hidden='true'
                  className='hexo-hero-button-split hexo-hero-button-split-left'>
                  {category.name}
                </span>
                <span
                  aria-hidden='true'
                  className='hexo-hero-button-split hexo-hero-button-split-right'>
                  {category.name}
                </span>
                <span className='hexo-hero-button-fallback'>{category.name}</span>
              </span>
            </SmartLink>
        )
      })}
    </nav>
  )
}
export default NavButtonGroup
