import { ReactNode } from "react";
import Link from "next/link";

export function NavbarLayout( props: { children: ReactNode }) {
    return (
        <div>
            <div className="m-5 rounded-lg bg-sky-200 p-5">
                <Link href="/">Home</Link> | <Link href="/amigos">Amigos</Link> | <Link href="/login">Login</Link>
            </div>
            <div className="m-5 rounded-lg bg-neutral-200 p-5">
                {props.children}
            </div>
        </div>
    )
}
