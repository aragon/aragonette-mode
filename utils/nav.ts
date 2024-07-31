import { type IBreadcrumbsLink } from "@aragon/ods";
import { capitalizeFirstLetter } from "./case";

export function generateBreadcrumbs(pathname: string): IBreadcrumbsLink[] {
  const paths = pathname.split("/").filter(Boolean);
  let pathAccumulator = "";

  return paths
    .map((path) => {
      path = path.length > 32 ? path.substring(0, 6) + "..." + path.substring(path.length - 4) : path;
      return path;
    })
    .map((path) => {
      pathAccumulator += `/${path}`;
      return {
        label: capitalizeFirstLetter(path),
        href: pathAccumulator,
      };
    });
}
