"use client";
import React from "react";
import {
    buildStyles,
    CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TrendingUp, TrendingDown } from "lucide-react";
//import { Card } from "@/components/ui/card"; // shadcn card wrapper
import { Card } from "@totesoft/ui-kit"; // shadcn card wrapper

interface CircularMetricCardProps {
    title: string;
    value: number; // main % value (e.g. 57)
    change: number; // percentage change
    color?: string; // tailwind/hex color
}

export function CircularMetricCard({
    title,
    value,
    change,
    //   color = "#3b82f6",
    color = "#C0723D",

}: CircularMetricCardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="flex flex-col items-center justify-center p-5 rounded-2xl shadow-lg dark:bg-gray-900 transition-all">
            {/* <div className="w-28 h-28 mb-3 relative"> */}
            <CircularProgressbarWithChildren
                value={value}
                strokeWidth={10}
                styles={buildStyles({
                    pathColor: color,
                    trailColor: "rgba(0,0,0,0.08)",
                    strokeLinecap: "round",
                })}
            >
                <div className="text-center">
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {value}%
                    </p>
                </div>
            </CircularProgressbarWithChildren>
            {/* </div> */}
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {title}
                </p>
                <div
                    className="flex items-center justify-center mt-1 text-sm font-medium"
                    //               style={{ color: isPositive ? "#3CB371" : "#DC2626" }} // red-600 hex
                    style={{ color: isPositive ? "#3CB371" : "#DC2626" }} // red-600 hex

                >
                    {isPositive ? "+5%" : "-3%"}

                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(change).toFixed(2)}%
                </div>
            </div>
        </Card >
    );
}

export default CircularMetricCard;