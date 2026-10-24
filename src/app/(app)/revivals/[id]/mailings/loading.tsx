import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-6 w-48"/>
            <Skeleton className="h-32 w-full"/>
            <Skeleton className="h-8 w-60"/>
            <Skeleton className="h-64 w-full"/>
        </div>
    );
}
