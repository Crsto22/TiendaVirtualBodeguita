import React from "react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function PhoneMockup({ children, className, ...props }: PhoneMockupProps) {
    return (
        <div
            className={cn(
                "relative mx-auto border-gray-800 bg-gray-800 border-[6px] md:border-[12px] rounded-[1.8rem] md:rounded-[2.5rem] h-[500px] w-[280px] md:h-[600px] md:w-[320px] shadow-xl",
                className
            )}
            {...props}
        >
            {/* Side Buttons */}
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[9px] md:-left-[12px] top-[72px] rounded-l-lg border-l border-gray-600"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[9px] md:-left-[12px] top-[124px] rounded-l-lg border-l border-gray-600"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[9px] md:-left-[12px] top-[178px] rounded-l-lg border-l border-gray-600"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[9px] md:-right-[12px] top-[142px] rounded-r-lg border-r border-gray-600"></div>

            {/* Screen Container */}
            <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden w-full h-full bg-white relative border-[2px] border-gray-700">

                {/* Notch / Dynamic Island */}
                <div className="absolute top-0 right-1/2 translate-x-1/2 h-[18px] w-[80px] md:h-[25px] md:w-[100px] bg-black rounded-b-xl md:rounded-b-2xl z-20 flex items-center justify-center pointer-events-none">
                    {/* Camera dot */}
                    {/* <div className="ml-12 h-2 w-2 bg-[#1a1a1a] rounded-full"></div> */}
                </div>

                {/* Content (Screen) */}
                <div className="w-full h-full overflow-hidden relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
