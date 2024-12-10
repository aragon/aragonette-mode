import { type Address, isAddress } from "viem";
import { NotFound } from "@/components/not-found";
import ProposalCreate from "./pages/new";
import ProposalCreateGauge from "./pages/createGauge";
import ProposalDetail from "./pages/proposal";
import { useUrl } from "@/hooks/useUrl";
import EditGauge from "./pages/editGauge";
import MainView from "./pages/mainView";

export default function PluginPage() {
  // Select the inner pages to display depending on the URL hash
  const { hash } = useUrl();

  if (!hash || hash === "#/") return <MainView />;
  else if (hash === "#/new") return <ProposalCreate />;
  else if (hash === "#/new-gauge") return <ProposalCreateGauge />;
  else if (hash.startsWith("#/proposals/")) {
    const id = hash.replace("#/proposals/", "");

    return <ProposalDetail id={id} />;
  } else if (hash.startsWith("#/edit-gauge/")) {
    const id = hash.replace("#/edit-gauge/", "") as Address;
    if (!isAddress(id)) return <NotFound />;

    return <EditGauge id={id} />;
  }

  // Default not found page
  return <NotFound />;
}
