import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
            <Skeleton className="h-32 w-full"/>
            <Skeleton className="h-72 w-full"/>
            <Skeleton className="h-40 w-full"/>
        </div>
    );
}
