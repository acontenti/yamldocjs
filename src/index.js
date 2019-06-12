(function () {
	let yaml;
	if (typeof require == "function" && require) {
		yaml = require('js-yaml');
	} else yaml = jsyaml;
	if (typeof exports === "object" && typeof module !== "undefined")
		module.exports = {
			yamldoc2html: function (yamldoc) {
				return yamldoc2html(yamldoc);
			},
			yamldoc2md: function (yamldoc) {
				return yamldoc2md(yamldoc);
			}
		};
	let g = window;
	if (typeof window !== "undefined") {
		g = window
	} else if (typeof global !== "undefined") {
		g = global
	} else if (typeof self !== "undefined") {
		g = self
	} else {
		g = this
	}
	g.yamldocjs = {
		yamldoc2html: function (yamldoc) {
			return yamldoc2html(yamldoc);
		},
		yamldoc2md: function (yamldoc) {
			return yamldoc2md(yamldoc);
		}
	};

	function objectMap(object, mapFn) {
		return object != null ? Object.keys(object).map(function (key) {
			return mapFn(key, object[key]);
		}) : [''];
	}

	function styleHtml(node) {
		if (typeof node !== 'string') return node;
		return node
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\n/g, "<br>")
			.replace(/(^|[^\\])__([^]*?[^\\])__/g, "$1<strong>$2</strong>")
			.replace(/(^|[^\\])_([^]*?[^\\_])_/g, "$1<em>$2</em>")
			.replace(/(^|[^\\])~~([^~]*[^\\])~~/g, "$1<del>$2</del>")
			.replace(/(^|[^\\])~([^~]*[^\\])~/g, "$1<sub>$2</sub>")
			.replace(/(^|[^\\])\^([^^]*[^\\])\^/g, "$1<sup>$2</sup>")
			.replace(/(^|[^\\])\+\+([^+]*[^\\])\+\+/g, "$1<ins>$2</ins>")
			.replace(/(^|[^\\])==([^=]*[^\\])==/g, "$1<mark>$2</mark>")
			.replace(/(^|[^\\])```([^`]*[^\\])```/g, "$1<pre><code>$2</code></pre>");
	}

	function styleMd(node) {
		return node;
	}

	function parseNodeHtml(node, indent, headingLevel, slideContent) {
		const spaces = '\t'.repeat(indent);
		if (Array.isArray(node)) return spaces + "<ul>\n" + node.map(function (it) {
			return spaces + "\t<li>\n"
				+ parseNodeHtml(it, indent + 2, headingLevel, false)
				+ spaces + "\t</li>\n";
		}).join("") + spaces + "</ul>\n";
		else if (typeof node === 'object') {
			return (slideContent ? spaces + "<ul>\n" : "")
				+ objectMap(node, function (key, it) {
					const headingSize = headingLevel <= 6 ? headingLevel : 6;
					return (slideContent ? spaces + "\t" : spaces)
						+ "<h" + headingSize + ">" + styleHtml(key) + "</h" + headingSize + ">\n"
						+ parseNodeHtml(it, indent + (slideContent ? 1 : 0), headingLevel + 1, true);
				}).join("")
				+ (slideContent ? spaces + "</ul>\n" : "");
		} else {
			return (slideContent ? spaces + "<ul>\n" + spaces + "\t" : spaces)
				+ "<span>" + styleHtml(node) + "</span>"
				+ (slideContent ? "\n" + spaces + "</ul>\n" : "\n");
		}
	}

	function parseNodeMd(node, indent, headingLevel) {
		let spaces = ' '.repeat(indent * 2);
		if (Array.isArray(node)) return node.map(function (it) {
			return spaces + "  * " + parseNodeMd(it, indent + 1, headingLevel);
		}).join("");
		else if (typeof node === 'object') {
			return objectMap(node, function (key, it) {
				const headingSize = headingLevel <= 6 ? headingLevel : 6;
				return "#".repeat(headingSize) + " " + styleMd(key) + "\n"
					+ parseNodeMd(it, indent, headingLevel + 1);
			}).join("");
		} else return styleMd(node) + "\n";
	}

	function yamldoc2html(yamldoc) {
		let doc;
		try {
			doc = yaml.safeLoad(yamldoc);
			console.log(doc);
		} catch (e) {
			console.log(e);
			return undefined;
		}
		if (Array.isArray(doc)) {
			return parseNodeHtml(doc, 0, 1, false);
		} else if (typeof doc === 'string') {
			return styleHtml(doc);
		} else if (typeof doc === 'object') {
			return objectMap(doc, function (key, it) {
				return "<h1>" + key + "</h1>\n" + parseNodeHtml(it, 0, 2, true);
			}).join("");
		} else return doc;
	}

	function yamldoc2md(yamldoc) {
		let doc;
		try {
			doc = yaml.safeLoad(yamldoc);
			console.log(doc);
		} catch (e) {
			console.log(e);
			return undefined;
		}
		if (Array.isArray(doc)) {
			return parseNodeMd(doc, 0, 1);
		} else if (typeof doc === 'string') {
			return styleMd(doc);
		} else if (typeof doc === 'object') {
			return objectMap(doc, function (key, it) {
				return "# " + key + "\n" + parseNodeMd(it, 0, 2);
			}).join("\n\n")
		} else return doc;
	}
})();