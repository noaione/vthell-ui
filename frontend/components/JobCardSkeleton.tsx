import React from "react";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import BaseContainer from "./BaseContainer";

export default function JobCardSkeleton() {
    return (
        <SkeletonTheme color="#171717" highlightColor="#262626">
            <div className="flex mx-2">
                <BaseContainer>
                    <div className="relative">
                        <div className="aspect-w-16 aspect-h-9">
                            <Skeleton className="h-full" />
                        </div>
                        <div className="top-4 right-4 absolute shadow-lg rounded-lg">
                            <SkeletonTheme color="#404040" highlightColor="#525252">
                                <Skeleton className="!w-14 h-6" />
                            </SkeletonTheme>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-700">
                        <SkeletonTheme color="#262626" highlightColor="#313131">
                            <Skeleton className="!w-[33%] mt-1" />
                            <Skeleton className="h-7 mt-2" />
                            <Skeleton className="!w-[45%] mt-2" />
                        </SkeletonTheme>
                    </div>
                    <SkeletonTheme color="#404040" highlightColor="#525252">
                        <div className="px-4 py-4 bg-gray-800 border-t border-gray-500">
                            <Skeleton className="!w-[33%] h-5" />
                        </div>
                        <div className="px-4 py-4 bg-gray-800 border-t border-gray-500">
                            <Skeleton className="!w-[33%] h-5" />
                        </div>
                        <div className="px-4 py-4 bg-gray-800 border-t border-gray-500">
                            <Skeleton className="!w-[33%] h-5" />
                        </div>
                    </SkeletonTheme>
                    <SkeletonTheme color="#262626" highlightColor="#313131">
                        <div className="py-4 justify-center flex flex-row bg-gray-700 gap-2">
                            <Skeleton className="h-9 !w-20" />
                            <Skeleton className="h-9 !w-[5.5rem]" />
                        </div>
                    </SkeletonTheme>
                </BaseContainer>
            </div>
        </SkeletonTheme>
    );
}
