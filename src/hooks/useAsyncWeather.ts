import { useEffect, useState } from "react";
import { parseApiError } from "../services/weatherApi";
import { AsyncState } from "../types";

export function useAsyncWeather<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  enabled = true,
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          (error.name === "AbortError" || error.message === "Aborted")
        ) {
          return;
        }
        if (!controller.signal.aborted) {
          setState({ data: null, loading: false, error: parseApiError(error) });
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
