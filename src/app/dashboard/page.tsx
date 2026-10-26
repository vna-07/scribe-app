import { redirect } from "next/navigation";
import { getCurrentUser, getUserBusinesses } from "@/lib/auth";

export default async function DashboardRouter() {
  const user = await getCurrentUser();

  // Not logged in → go to login
  if (!user) {
    redirect("/login");
  }

  // Fetch the user's businesses
  const businesses = await getUserBusinesses(user.id);

  // If they have a business, go straight to it
  if (businesses && businesses.length > 0) {
    redirect(`/demo/${businesses[0].id}`);
  }

  // No business yet → onboarding
  redirect("/onboarding");
}