declare module "*.mdx" {
  import type { MDXContent } from "mdx/types";

  export const meta: Record<string, unknown>;
  const MDXComponent: MDXContent;
  export default MDXComponent;
}
