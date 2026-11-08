import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/cn";

export interface QuantityStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  /** Nombre del producto, para los aria-label ("Quitar uno de Collar…"). */
  itemLabel: string;
  className?: string;
}

/** − cantidad +. Botones de 44px con nombre accesible; la cantidad se anuncia al cambiar. */
export function QuantityStepper({ value, onDecrement, onIncrement, min = 1, max = 99, itemLabel, className }: QuantityStepperProps) {
  return (
    <div role="group" aria-label={`Cantidad de ${itemLabel}`} className={cn("flex items-center gap-1", className)}>
      <IconButton label={`Quitar uno de ${itemLabel}`} variant="soft" onClick={onDecrement} disabled={value <= min}>
        <Minus className="size-4" aria-hidden />
      </IconButton>
      <output aria-live="polite" className="w-8 text-center font-display text-base font-semibold tabular-nums">
        {value}
      </output>
      <IconButton label={`Agregar uno de ${itemLabel}`} variant="soft" onClick={onIncrement} disabled={value >= max}>
        <Plus className="size-4" aria-hidden />
      </IconButton>
    </div>
  );
}
