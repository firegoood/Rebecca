import { type FC, type KeyboardEvent, useMemo, useRef, useState } from "react";
import { Textarea } from "components/ui/textarea";
import { cn } from "lib/cn";
import {
	getMatcherSuggestions,
	type MatcherKind,
	type MatcherSuggestion,
	matcherTokenAt,
	replaceMatcherToken,
} from "utils/xrayRouting";

type MatcherTextareaProps = {
	value: string;
	kind: MatcherKind;
	placeholder?: string;
	onChange: (value: string) => void;
};

export const MatcherTextarea: FC<MatcherTextareaProps> = ({
	value,
	kind,
	placeholder,
	onChange,
}) => {
	const ref = useRef<HTMLTextAreaElement>(null);
	const [caret, setCaret] = useState(0);
	const [focused, setFocused] = useState(false);
	const [active, setActive] = useState(0);
	const token = matcherTokenAt(value, caret);
	const suggestions = useMemo(
		() => getMatcherSuggestions(kind, token.text),
		[kind, token.text],
	);
	const open = focused && suggestions.length > 0;
	const activeIndex = Math.min(active, suggestions.length - 1);

	const pick = (suggestion: MatcherSuggestion) => {
		const next = replaceMatcherToken(value, token, suggestion.value);
		onChange(next.text);
		setCaret(next.caret);
		setActive(0);
		requestAnimationFrame(() => {
			ref.current?.setSelectionRange(next.caret, next.caret);
		});
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (!open) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((index) => (index + 1) % suggestions.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((index) => (index - 1 + suggestions.length) % suggestions.length);
		} else if (event.key === "Enter" || event.key === "Tab") {
			event.preventDefault();
			pick(suggestions[activeIndex]);
		} else if (event.key === "Escape") {
			event.preventDefault();
			setFocused(false);
		}
	};

	return (
		<div className="relative">
			<Textarea
				ref={ref}
				value={value}
				placeholder={placeholder}
				rows={2}
				autoComplete="off"
				spellCheck={false}
				className="font-mono text-xs resize-y"
				onChange={(event) => {
					onChange(event.target.value);
					setCaret(event.target.selectionStart);
					setActive(0);
				}}
				onKeyDown={onKeyDown}
				onKeyUp={(event) => setCaret(event.currentTarget.selectionStart)}
				onClick={(event) => setCaret(event.currentTarget.selectionStart)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				role="combobox"
				aria-expanded={open}
				aria-autocomplete="list"
			/>
			{open ? (
				<div
					role="listbox"
					className="absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
				>
					{suggestions.map((item, index) => (
						<button
							type="button"
							key={item.value}
							role="option"
							aria-selected={index === activeIndex}
							onMouseDown={(event) => {
								event.preventDefault();
								pick(item);
							}}
							onMouseEnter={() => setActive(index)}
							className={cn(
								"flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-1.5 text-start",
								index === activeIndex && "bg-accent text-accent-foreground",
							)}
						>
							<span className="font-mono text-xs">{item.value}</span>
							<span className="text-[0.7rem] text-muted-foreground">{item.hint}</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
};
