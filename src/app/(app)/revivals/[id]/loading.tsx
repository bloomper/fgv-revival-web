import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <Skeleton className="h-48"/>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-56"/>
                <Skeleton className="h-56"/>
            </div>
        </div>
    );
}
