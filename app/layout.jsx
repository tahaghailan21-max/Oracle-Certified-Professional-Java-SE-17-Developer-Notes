import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'OCP Java SE 17 — Study Notes',
    template: '%s — OCP Java SE 17 Notes'
  },
  description:
    'Personal study notes for the Oracle Certified Professional: Java SE 17 Developer certification (Exam 1Z0-829).'
}

const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <span style={{ fontSize: '1.3rem' }}>📖</span>
        <span style={{ fontWeight: 700 }}>OCP Java SE 17 — Notes</span>
      </span>
    }
    projectLink="https://github.com/tahaghailan21-max/Oracle-Certified-Professional-Java-SE-17-Developer-Notes"
  />
)

const footer = (
  <Footer>
    <span>
      Personal study notes · OCP Java SE 17 Developer (1Z0-829) · Free to use as you please.
    </span>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tahaghailan21-max/Oracle-Certified-Professional-Java-SE-17-Developer-Notes/tree/main"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
