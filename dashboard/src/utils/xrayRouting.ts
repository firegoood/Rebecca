export type MatcherKind = "domain" | "ip" | "process";

export type MatcherSuggestion = {
	value: string;
	hint: string;
};

export type MatcherToken = {
	start: number;
	end: number;
	text: string;
};

export const GEOSITE_CATEGORIES: MatcherSuggestion[] = [
	{ value: "category-ads", hint: "common advertising domains" },
	{ value: "category-ads-all", hint: "advertising domains and their trackers" },
	{ value: "category-ai-!cn", hint: "AI services outside mainland China" },
	{ value: "category-ai-cn", hint: "AI services in mainland China" },
	{ value: "cn", hint: "geolocation-cn and tld-cn" },
	{ value: "apple", hint: "Apple domains" },
	{ value: "google", hint: "Google domains" },
	{ value: "google@cn", hint: "Google domains with the cn attribute" },
	{ value: "microsoft", hint: "Microsoft domains" },
	{ value: "facebook", hint: "Facebook domains" },
	{ value: "twitter", hint: "Twitter domains" },
	{ value: "telegram", hint: "Telegram domains" },
	{ value: "geolocation-cn", hint: "common mainland China sites" },
	{ value: "geolocation-!cn", hint: "common sites outside mainland China" },
	{ value: "tld-cn", hint: "top-level domains used in mainland China" },
	{ value: "tld-!cn", hint: "top-level domains not used in mainland China" },
];

export const GEOIP_CODES: MatcherSuggestion[] = [
	{ value: "cn", hint: "IPs of mainland China" },
	{ value: "private", hint: "private and loopback addresses" },
];

const DOMAIN_PREFIXES: MatcherSuggestion[] = [
	{ value: "domain:", hint: "the domain and its subdomains" },
	{ value: "full:", hint: "exactly this domain" },
	{ value: "keyword:", hint: "any domain containing this text" },
	{ value: "regexp:", hint: "regular expression" },
	{ value: "geosite:", hint: "predefined domain list" },
	{ value: "ext:", hint: "load from file, ext:file:tag" },
];

const IP_PREFIXES: MatcherSuggestion[] = [
	{ value: "geoip:", hint: "predefined IP list" },
	{ value: "!geoip:", hint: "everything outside a predefined IP list" },
	{ value: "ext:", hint: "load from file, ext:file:tag" },
	{ value: "0.0.0.0/0", hint: "all IPv4 addresses" },
	{ value: "::/0", hint: "all IPv6 addresses" },
];

const PROCESS_PREFIXES: MatcherSuggestion[] = [
	{ value: "self/", hint: "the Xray process itself, avoids routing loops" },
	{ value: "xray/", hint: "every process started from this Xray binary" },
];

const GEO_PREFIX = /^(!?)(geosite|geoip):(.*)$/i;

const matchesText = (value: string, text: string) =>
	value.toLowerCase().startsWith(text.toLowerCase());

const geoValuesFor = (kind: MatcherKind) =>
	kind === "domain" ? GEOSITE_CATEGORIES : GEOIP_CODES;

export const getMatcherSuggestions = (
	kind: MatcherKind,
	token: string,
): MatcherSuggestion[] => {
	const text = token.trim();
	if (kind === "process") {
		return PROCESS_PREFIXES.filter((item) => matchesText(item.value, text));
	}

	const geo = GEO_PREFIX.exec(text);
	const scheme = kind === "domain" ? "geosite" : "geoip";
	if (geo && geo[2].toLowerCase() === scheme && (kind === "ip" || !geo[1])) {
		const [, inverse, , name] = geo;
		const namePrefix = name.toLowerCase();
		return geoValuesFor(kind)
			.filter((item) => item.value.toLowerCase().startsWith(namePrefix))
			.map((item) => ({
				value: `${inverse}${scheme}:${item.value}`,
				hint: item.hint,
			}));
	}

	if (text.toLowerCase().startsWith("ext:")) {
		return [];
	}

	const prefixes = kind === "domain" ? DOMAIN_PREFIXES : IP_PREFIXES;
	return prefixes.filter((item) => matchesText(item.value, text));
};

export const matcherTokenAt = (text: string, caret: number): MatcherToken => {
	let start = caret;
	while (start > 0 && !/[\s,]/.test(text[start - 1])) start -= 1;
	let end = caret;
	while (end < text.length && !/[\s,]/.test(text[end])) end += 1;
	return { start, end, text: text.slice(start, caret) };
};

export const replaceMatcherToken = (
	text: string,
	token: MatcherToken,
	value: string,
) => ({
	text: text.slice(0, token.start) + value + text.slice(token.end),
	caret: token.start + value.length,
});
