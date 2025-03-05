import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchLocationProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchLocation({ value, onChange }: SearchLocationProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location">Where would you like to go?</Label>
      <Input
        id="location"
        placeholder="Enter a destination..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
