import pepperIcon from "@/assets/pepper-icon.png";

const cropIconOverrides: Record<string, string> = {
  blackPepper: pepperIcon,
};

interface CropIconProps {
  cropKey?: string;
  emoji: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

export default function CropIcon({ cropKey, emoji, className = "", size = "md" }: CropIconProps) {
  if (cropKey && cropIconOverrides[cropKey]) {
    return (
      <img
        src={cropIconOverrides[cropKey]}
        alt=""
        className={`inline-block object-contain ${sizeClasses[size]} ${className}`}
      />
    );
  }
  return <span className={className}>{emoji}</span>;
}
