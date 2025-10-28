

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
    "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
    {}
);

const Progress = ({ className, value, ...props }: any) => (
    <ProgressPrimitive.Root
        className={cn(progressVariants(), className)}
        value={value}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full bg-blue-500 transition-all"
            style={{ transform: `translateX(-${100 - value}%)` }}
        />
    </ProgressPrimitive.Root>
);

export { Progress };
