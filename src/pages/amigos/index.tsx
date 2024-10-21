import { MantineProvider } from "@mantine/core";
import { NavbarLayout } from "~/components/navbar";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

export default function Index() {
  const { data: session, status } = useSession();
  const { data: amigos, isLoading, error } = api.amigos.getUserAmigos.useQuery(
    { userId: Number(session?.user?.id) },
    { enabled: !!session?.user?.id }
  );

  if (status === "loading") return <div>Loading session...</div>;
  if (status === "unauthenticated") return <div>Please log in to view your amigos.</div>;

  if (isLoading) return <div>Loading amigos...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <MantineProvider>
        <NavbarLayout>
          <h1>My Amigos List</h1>
          {amigos && amigos.length > 0 ? (
            <ul>
              {amigos.map((amigo) => (
                <li key={amigo.id}>
                  Name: {amigo.name} - Email: {amigo.email} - Phone: {amigo.phone} - ID: {amigo.id}
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no amigos yet.</p>
          )}
        </NavbarLayout>
      </MantineProvider>
    </div>
  );
}