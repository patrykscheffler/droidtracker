import { type VariantProps, cva } from "class-variance-authority";

import { env } from "~/env.mjs";
import { cn } from "~/lib/utils";

const logoVariants = cva("w-auto group", {
  variants: {
    size: {
      sm: "h-8 leading-8",
      lg: "h-20 leading-20",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

type LogoProps = VariantProps<typeof logoVariants> & { showName?: boolean; className?: string; };

export default function Logo({ size, showName = false, className = "" }: LogoProps) {
  return (
    <h3 className={cn("logo inline-flex justify-center", logoVariants({ size }), className)}>
      <svg
        width={168}
        height={168}
        viewBox="0 0 168 168"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(logoVariants({ size }), "group-hover:animate-pulse")}
      >
        <circle
          cx={84}
          cy={84}
          r={82.5}
          fill="#FBCA46"
          stroke="#262626"
          strokeWidth={3}
        />
        <line
          x1={13}
          y1={89}
          x2={39}
          y2={89}
          stroke="black"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={81}
          y1={40}
          x2={81}
          y2={14}
          stroke="black"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={81}
          y1={155}
          x2={81}
          y2={129}
          stroke="black"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={129}
          y1={89}
          x2={155}
          y2={89}
          stroke="black"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={34.8173}
          y1={131.867}
          x2={44.8289}
          y2={122.66}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={120.323}
          y1={46.4709}
          x2={130.335}
          y2={37.2639}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={103.857}
          y1={37.7138}
          x2={108.262}
          y2={24.8454}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={58.0539}
          y1={145.544}
          x2={62.459}
          y2={132.676}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={135.343}
          y1={63.2941}
          x2={147.9}
          y2={58.0665}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={21.6157}
          y1={112.304}
          x2={34.1724}
          y2={107.077}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={34.9523}
          y1={36.3154}
          x2={44.956}
          y2={45.531}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={23.2445}
          y1={60.6039}
          x2={36.4332}
          y2={63.9293}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={53.3562}
          y1={21.5406}
          x2={59.6046}
          y2={33.6219}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={128.67}
          y1={136.15}
          x2={120.951}
          y2={124.951}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={145.457}
          y1={115.05}
          x2={133.33}
          y2={108.892}
          stroke="black"
          strokeWidth={2}
        />
        <line
          x1={107.455}
          y1={146.491}
          x2={104.032}
          y2={133.327}
          stroke="black"
          strokeWidth={2}
        />
        <circle cx={63.5} cy={66.5} r={11.5} fill="black" />
        <circle cx={103.5} cy={65.5} r={11.5} fill="black" />
        <circle cx={61} cy={65} r={4} fill="white" />
        <circle cx={101} cy={64} r={4} fill="white" />
        <path
          d="M69 104C83.4 112.8 98 106.667 102 101"
          stroke="black"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          className="opacity-0 transition group-hover:opacity-100"
          x1="56.2204"
          y1="84.4138"
          x2="63.9993"
          y2="86.2813"
          stroke="#EC8C4C"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          className="opacity-0 transition group-hover:opacity-100"
          x1="105.053"
          y1="86.749"
          x2="112.546"
          y2="83.9474"
          stroke="#EC8C4C"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M30 141C-2.99999 113 -12 29 67 7"
          stroke="#FFF3D4"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M140.552 30.5931C171.567 60.7775 174.82 145.196 94.5039 161.759"
          stroke="#F8B709"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      {showName && <strong className="ml-2">{env.NEXT_PUBLIC_APP_NAME}</strong>}
    </h3>
  );
}
