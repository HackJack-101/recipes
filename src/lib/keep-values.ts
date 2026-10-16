import { startTransition, type FormEvent } from "react";

/**
 * onSubmit handler for forms whose action redirects on success.
 * React resets uncontrolled forms after an action; dispatching manually keeps what the user typed when it fails.
 */
export const keepValues = (action: (fd: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  startTransition(() => action(new FormData(e.currentTarget)));
};
