import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <Skeleton className="h-8 w-48"/>
            <Skeleton className="h-9 w-full"/>
            <div className="flex flex-col gap-6 lg:flex-row">
                <Skeleton className="h-9 w-full lg:h-80 lg:w-64"/>
                <Skeleton className="h-96 w-full"/>
            </div>
        </div>
    );
}
