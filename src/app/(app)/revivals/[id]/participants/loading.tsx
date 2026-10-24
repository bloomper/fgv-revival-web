import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({length: 5}, (_, index) => <Skeleton key={index} className="h-16"/>)}
            </div>
            <Skeleton className="h-8 w-60"/>
            <Skeleton className="h-64 w-full"/>
        </div>
    );
}
