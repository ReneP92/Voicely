// src/components/ui/card.jsx
import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-xl border bg-white text-black shadow", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-4 pt-0", className)} {...props} />
);