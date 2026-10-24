import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-60"/>
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-96 w-full"/>
        </div>
    );
}
