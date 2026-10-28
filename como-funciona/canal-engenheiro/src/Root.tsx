import React from "react";
import { Still } from "remotion";
import { Logo } from "./Logo";

export const Root: React.FC = () => (
  <>
    <Still id="Logo" component={Logo} width={1080} height={1080} />
  </>
);
