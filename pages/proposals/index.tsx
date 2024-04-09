import Link from "next/link";

export default function Proposals() {
  const mockPips = [
    { id: 1, title: "PIP 1", description: "This is a description for PIP 1" },
    { id: 2, title: "PIP 2", description: "This is a description for PIP 2" },
  ];

  return (
    <div>
      <h1>Pips List Page</h1>
      <div>
        {mockPips.map((pip) => (
          <div key={pip.id}>
            <Link href={`/proposals/${pip.id}`}>{`${pip.title} - ${pip.description}`}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
