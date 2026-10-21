import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <Skeleton className="h-8 w-48"/>
            <Skeleton className="h-9 w-full"/>
            <Skeleton className="h-96 w-full"/>
        </div>
    );
}
