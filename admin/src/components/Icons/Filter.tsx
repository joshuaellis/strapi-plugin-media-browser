import * as React from "react";

export const Filter = (props: React.SVGAttributes<SVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 256 256"
    {...props}
  >
    <rect width="256" height="256" fill="none"></rect>
    <line
      x1="64"
      y1="128"
      x2="192"
      y2="128"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
    ></line>
    <line
      x1="24"
      y1="80"
      x2="232"
      y2="80"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
    ></line>
    <line
      x1="104"
      y1="176"
      x2="152"
      y2="176"
      stroke="currentColor"
      strokeLinecap="round"
      stroke-Linejoin="round"
      strokeWidth="16"
    ></line>
  </svg>
);
