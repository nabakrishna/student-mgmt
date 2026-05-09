
import { redirect } from "next/navigation";

export default function Home() {
  // Always land on the login page
  redirect("/login");
}