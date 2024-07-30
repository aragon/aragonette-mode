import { proseClasses } from "@/components/documentParser/utils";
import { CardCollapsible, DocumentParser, Heading } from "@aragon/ods";

interface ITransparencyReportProps {
  report: string;
}

export const TransparencyReport: React.FC<ITransparencyReportProps> = (props) => {
  const { report } = props;

  return (
    <CardCollapsible
      buttonLabelClosed="Read full report"
      buttonLabelOpened="Read less"
      collapsedSize="md"
      className="shadow-neutral"
    >
      <div className="flex flex-col gap-y-4">
        <Heading size="h2">Council Transparency Report</Heading>
        <hr className="rounded-full border-neutral-100" />
        <DocumentParser document={report} className={proseClasses} />
      </div>
    </CardCollapsible>
  );
};
