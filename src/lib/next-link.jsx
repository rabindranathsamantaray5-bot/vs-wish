import { useNavigate } from "@tanstack/react-router";
import React from "react";

export default function Link({ href, children, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!href || href.startsWith("http") || href.startsWith("//") || props.target === "_blank") {
      return;
    }
    e.preventDefault();
    navigate({ to: href });
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
