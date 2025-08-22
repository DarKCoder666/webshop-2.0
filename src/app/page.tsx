import { HomeClient } from "@/components/home-client"
import { getConfigFromStore } from "@/lib/fake-builder-store"

export default async function Home() {
  const config = await getConfigFromStore();
  return <HomeClient initialConfig={config} />;
}
