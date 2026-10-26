import { describe, expect, it } from "vitest";

import {
	getMatcherSuggestions,
	matcherTokenAt,
	replaceMatcherToken,
} from "./xrayRouting";

const values = (kind: Parameters<typeof getMatcherSuggestions>[0], token: string) =>
	getMatcherSuggestions(kind, token).map((item) => item.value);

describe("domain matcher suggestions", () => {
	it("offers every documented domain prefix when the field is empty", () => {
		expect(values("domain", "")).toEqual([
			"domain:",
			"full:",
			"keyword:",
			"regexp:",
			"geosite:",
			"ext:",
		]);
	});

	it("filters prefixes as the user types", () => {
		expect(values("domain", "re")).toEqual(["regexp:"]);
	});

	it("suggests geosite categories after the geosite prefix", () => {
		expect(values("domain", "geosite:google")).toEqual(["geosite:google", "geosite:google@cn"]);
		expect(values("domain", "geosite:g")).toEqual([
			"geosite:google",
			"geosite:google@cn",
			"geosite:geolocation-cn",
			"geosite:geolocation-!cn",
		]);
	});

	it("stops suggesting once a complete domain is typed", () => {
		expect(values("domain", "domain:example.com")).toEqual([]);
		expect(values("domain", "ext:list.dat:tag")).toEqual([]);
	});
});

describe("ip matcher suggestions", () => {
	it("offers geoip, inverse geoip, ext and the catch-all networks", () => {
		expect(values("ip", "")).toEqual(["geoip:", "!geoip:", "ext:", "0.0.0.0/0", "::/0"]);
	});

	it("keeps the inverse marker when suggesting geoip codes", () => {
		expect(values("ip", "!geoip:c")).toEqual(["!geoip:cn"]);
	});

	it("never offers geosite values in the ip field", () => {
		expect(values("ip", "geosite:g")).toEqual([]);
	});
});

describe("process matcher suggestions", () => {
	it("offers the self and xray selectors", () => {
		expect(values("process", "")).toEqual(["self/", "xray/"]);
		expect(values("process", "x")).toEqual(["xray/"]);
	});
});

describe("token handling", () => {
	it("finds the entry under the caret, using commas and new lines as separators", () => {
		const text = "domain:a.com,\nke";
		expect(matcherTokenAt(text, text.length)).toEqual({ start: 14, end: 16, text: "ke" });
	});

	it("replaces only the entry under the caret and moves the caret after it", () => {
		const text = "domain:a.com, ke";
		const token = matcherTokenAt(text, text.length);
		expect(replaceMatcherToken(text, token, "keyword:")).toEqual({
			text: "domain:a.com, keyword:",
			caret: 22,
		});
	});

	it("keeps the text after the caret when the entry is edited in the middle", () => {
		const text = "dom|ain.com";
		const caret = text.indexOf("|");
		const plain = text.replace("|", "");
		const token = matcherTokenAt(plain, caret);
		expect(token.text).toBe("dom");
		expect(replaceMatcherToken(plain, token, "domain:")).toEqual({
			text: "domain:",
			caret: 7,
		});
	});
});
