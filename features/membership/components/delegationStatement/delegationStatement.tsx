import { proseClasses } from "@/features/proposals";
import { CardCollapsible, DocumentParser, Heading } from "@aragon/ods";
import React from "react";

interface IDelegationStatementProps {}

export const DelegationStatement: React.FC<IDelegationStatementProps> = () => {
  const statement = ` Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
        consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
        diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
        takimata sanctus est Lorem ipsum dolor sit amet.`;

  return (
    <>
      <Heading size="h2">Delegation statement</Heading>
      <CardCollapsible
        buttonLabelClosed="Read more"
        buttonLabelOpened="Read less"
        collapsedSize="md"
        className="shadow-neutral"
      >
        <DocumentParser document={statement} className={proseClasses} />
      </CardCollapsible>
    </>
  );
};
