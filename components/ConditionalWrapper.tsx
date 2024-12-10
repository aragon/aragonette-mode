const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
}) => (condition ? wrapper(children) : <>{children}</>);

export default ConditionalWrapper;
