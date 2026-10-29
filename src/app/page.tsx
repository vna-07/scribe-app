import { findDemoBusinessId } from "@/lib/demo-data";
import LandingClient from "./LandingClient";

export default async function Home() {
  const bizId = await findDemoBusinessId();
  return <LandingClient demoBizId={bizId} />;
}