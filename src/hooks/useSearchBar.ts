"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";

/** Valor controlado del buscador + botón para limpiarlo. El envío lo hace <Form action="/buscar">. */
export function useSearchBar(initialQuery = "") {
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value), []);

  const clear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
  }, []);

  return { value, onChange, clear, inputRef, hasValue: value.length > 0 };
}
