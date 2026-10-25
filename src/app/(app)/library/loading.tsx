import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <Skeleton className="h-8 w-64"/>
            <Skeleton className="h-10 w-full max-w-md"/>
            <Skeleton className="h-40"/>
            <Skeleton className="h-40"/>
        </div>
    );
}
