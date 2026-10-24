import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({length: 4}).map((_, index) => <Skeleton key={index} className="h-28"/>)}
            </div>
            <Skeleton className="h-64 w-full"/>
        </div>
    );
}
