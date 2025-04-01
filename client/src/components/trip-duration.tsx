import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TripDurationProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean; // Add disabled prop
}

export default function TripDuration({ value, onChange, disabled = false }: TripDurationProps) {
  return (
    <div className="space-y-3">
      <Label className="text-lg flex items-center gap-2">
        <Clock className="h-4 w-4" />
        How many days?
      </Label>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-semibold text-primary">{value}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={1}
          max={14}
          step={1}
          className="py-4"
          disabled={disabled} // Pass disabled prop
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 day</span>
          <span>2 weeks</span>
        </div>
      </div>
    </div>
  );
}