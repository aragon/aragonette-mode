import { type ReactNode } from "react";
import { Navbar } from "../nav/navbar";
import { Footer } from "../footer/footer";

export const Layout: React.FC<{ children: ReactNode }> = (props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full">
        <Navbar />
        {props.children}
      </div>

      <Footer />
    </div>
  );
};
