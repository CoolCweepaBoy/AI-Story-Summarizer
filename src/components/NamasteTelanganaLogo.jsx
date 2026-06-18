import React from "react";

export default function NamasteTelanganaLogo({ size = "md", showSubtitle = true }) {
  // Height mappings to keep the logo proportionally scaled
  const imageSizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-20"
  };

  return (
    <div className="flex items-center select-none shrink-0">
      <img 
        src="/logo.svg" 
        alt="Namaste Telangana" 
        className={`${imageSizes[size]} w-auto object-contain`}
      />
    </div>
  );
}
