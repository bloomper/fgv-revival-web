import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex max-w-3xl flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-64"/>
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-72 w-full"/>
        </div>
    );
}
