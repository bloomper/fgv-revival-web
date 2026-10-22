import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <Skeleton className="h-8 w-60"/>
            <Skeleton className="h-24 w-full"/>
        </div>
    );
}
