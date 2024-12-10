import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "@aragon/ods";
import ProposalList from "./proposal-list";
import { MainSection } from "@/components/layout/main-section";
import { GaugesList } from "./gauge-list";

type Props = {
  defaultTab?: "proposals" | "gauges";
};

export const MainView: React.FC<Props> = ({ defaultTab = "proposals" }) => {
  return (
    <MainSection narrow={true}>
      <div className="flex w-full flex-row content-center justify-between">
        <TabsRoot className="w-full" defaultValue={defaultTab} isUnderlined={true}>
          <TabsList className="w-fit">
            <TabsTrigger className="w-1/2 justify-center px-1 text-xl md:w-auto" label="PROPOSALS" value="proposals" />
            <TabsTrigger className="w-1/2 justify-center px-1 text-xl md:w-auto" label="GAUGES" value="gauges" />
          </TabsList>
          <TabsContent value="proposals" className="pt-4">
            <ProposalList />
          </TabsContent>
          <TabsContent value="gauges" className="pt-4">
            <GaugesList />
          </TabsContent>
        </TabsRoot>
      </div>
    </MainSection>
  );
};

export default MainView;
