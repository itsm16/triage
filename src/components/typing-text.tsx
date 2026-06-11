"use client";

import { useEffect, useState } from "react";

export function TypingText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(text.slice(0, index + 1));
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayed("");
        setIndex(0);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return <span className={className}>{displayed}</span>;
}
