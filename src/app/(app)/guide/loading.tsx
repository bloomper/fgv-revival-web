import { Skeleton } from "@bloomper/fgv-web-ui/ui/skeleton";
import { Page } from "@bloomper/fgv-web-ui/shell/page-header";

export default function Loading() {
  return (
    <Page>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-96 w-full" />
    </Page>
  );
}
