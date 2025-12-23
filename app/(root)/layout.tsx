import {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";

const RootLayout = ({children} : {children: ReactNode}) => {
    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={38} height={36} />
                    <h2 className="txt-primary-100">RepliQ</h2>

                </Link>
            </nav>

            {children}
        </div>
    )
}
export default RootLayout
