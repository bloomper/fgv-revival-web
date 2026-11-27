import { Skeleton } from "@bloomper/fgv-web-ui/ui/skeleton";
import { Page } from "@bloomper/fgv-web-ui/shell/page-header";

export default function Loading() {
  return (
    <Page>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </Page>
  );
}
