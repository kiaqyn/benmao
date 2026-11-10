import { createFileRoute } from "@tanstack/react-router";
import { Benmao } from "@/components/benmao";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Benmao />;
}
