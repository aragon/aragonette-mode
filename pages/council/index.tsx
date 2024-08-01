export default function CouncilPage() {
  return (
    <header className="relative flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      {/* Radial gradients */}
      <section className="absolute -top-[18px] right-[80px] -z-10 size-[320px] rounded-full bg-ellipse-34 blur-[120px]" />
      <section className="absolute left-[68px] top-[170px] -z-10 size-[400px] rounded-full bg-ellipse-35 blur-[80px]" />
      <section className="absolute right-[400px] top-[153px] -z-10 size-[540px] rounded-full bg-ellipse-36 blur-[120px]" />

      <div className="flex w-full max-w-screen-xl flex-col gap-y-8 px-4 pb-8 pt-8 md:gap-y-12 md:px-6 md:pt-16">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-6 md:w-4/5">
            <h1 className="text-4xl leading-tight text-neutral-800 md:text-5xl">Coming Soon...</h1>
            <p className="text-2xl leading-normal text-neutral-600">
              The Mode Governance Hub is the home for the Mode community to participate in Mode&apos;s evolving
              Governance. Mode builds infrastructure, assets, and applications with a mission to bring decentralized
              finance to billions of users globally. Welcome to Mode, governed on Aragon.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
