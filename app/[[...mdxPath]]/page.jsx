import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  // Landing page: show just "Java Notes" in the tab (absolute bypasses the
  // "%s | Java Notes" template), while the sidebar label stays "Home".
  const isIndex = !params.mdxPath || params.mdxPath.length === 0
  if (isIndex) {
    return { ...metadata, title: { absolute: 'Java Notes' } }
  }
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
