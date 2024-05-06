import { type ReactNode } from "react";
import { Navbar } from "../nav/navbar";

export const Layout: React.FC<{ children: ReactNode }> = (props) => {
  return (
    <div className="flex flex-col items-center gap-20">
      <div className="w-full">
        <Navbar />
        {props.children}
      </div>

      {/* Footer */}
    </div>
  );
};
