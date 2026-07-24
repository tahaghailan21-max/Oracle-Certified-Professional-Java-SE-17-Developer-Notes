import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { BookIcon } from '../components/icons'
import { ThemeToggle } from '../components/theme-toggle'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    default: 'Java Notes',
    template: '%s | Java Notes'
  },
  description:
    'Personal study notes for the Oracle Certified Professional: Java SE 17 Developer certification (Exam 1Z0-829).'
}

const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 700 }}>
        <BookIcon />
        OCP Java SE 17 Notes
      </span>
    }
    projectLink="https://github.com/tahaghailan21-max/Oracle-Certified-Professional-Java-SE-17-Developer-Notes"
  >
    <ThemeToggle />
  </Navbar>
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
          search={null}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
