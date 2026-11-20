import type { Metadata } from 'next';
import './style.css';
export const metadata: Metadata = {title:'Farm World | Nông trại của bạn',description:'Farm World V0.1A prototype'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="vi"><body>{children}</body></html>}
