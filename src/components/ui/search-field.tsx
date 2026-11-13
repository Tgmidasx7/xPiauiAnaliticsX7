import { Search } from "lucide-react";
import { useId } from "react";

export function SearchField({
  value,
  onChange,
  label,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="search-field">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Search size={16} />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
