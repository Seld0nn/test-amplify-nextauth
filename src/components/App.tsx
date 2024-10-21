import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import React from "react";
import useScreen from "~/hooks/useScreen";

type Props = {
  children: React.ReactNode;
};

export default function App({ children }: Props) {
  const session = useSession();
  const router = useRouter();
  const screen = useScreen();

  if (screen.isLoading) {
    return null;
  }

  if (["/login"].includes(router.pathname)) {
    return <>{children}</>;
  }

  if (router.pathname.startsWith("/amigo")) {
    return <>{children}</>;
  }

  return <div>App</div>;
}
