export interface FormChild {
	validate: () => Promise<string | null>;
	element?: HTMLInputElement;
}

export interface FormContext {
	register(child: FormChild): void;
	unregister(child: FormChild): void;
}

export type ValidationFunction<T> = (value: T) => MaybePromise<string | null>;

export type MaybePromise<T> = T | Promise<T>;

