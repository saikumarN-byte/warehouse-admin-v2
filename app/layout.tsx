import './globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'Sydney Warehouse Admin',
  description: 'Warehouse Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}