import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  redirect("/inicio");
}
