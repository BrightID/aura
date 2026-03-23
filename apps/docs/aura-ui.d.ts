import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-theme-provider": React.HTMLAttributes<HTMLElement>;
    }
  }
}
