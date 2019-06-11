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
			.replace(/(^|[^\\])~([^~]*[^\\])~/g, "$1<u>$2</u>");
	}

	function styleMd(node) {
		if (typeof node !== 'string') return node;
		return node.replace(/(^|[^\\~])~([^~]*[^\\~])~/g, "$1$2");
	}

	function parseNodeHtml(node, indent, headingLevel) {
		const spaces = '\t'.repeat(indent);
		if (Array.isArray(node)) return spaces + "<ul>\n" + node.map(function (it) {
			return spaces + "\t<li>\n"
				+ parseNodeHtml(it, indent + 1, headingLevel)
				+ spaces + "\t</li>\n";
		}).join("") + spaces + "</ul>\n";
		else if (typeof node === 'object') {
			return spaces + "\t<ul>\n" + objectMap(node, function (key, it) {
				const headingSize = headingLevel <= 6 ? headingLevel : 6;
				return spaces + "\t\t<h" + headingSize + ">" + styleHtml(key) + "</h" + headingSize + ">\n"
					+ parseNodeHtml(it, indent + 1, headingLevel + 1);
			}).join("") + spaces + "\t</ul>\n";
		} else return spaces + "\t<ul>\n" + spaces + "\t\t" + styleHtml(node) + "\n" + spaces + "\t</ul>\n";
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
		if (typeof doc === 'string') return "<div>\n\t" + styleHtml(doc) + "\n</div>";
		else return "<div>\n" + objectMap(doc, function (key, it) {
			return "\t<h1>" + key + "</h1>\n" + parseNodeHtml(it, 1, 2);
		}).join("") + '</div>';
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
		if (typeof doc === 'string') return styleMd(doc);
		else return objectMap(doc, function (key, it) {
			return "# " + key + "\n" + parseNodeMd(it, 0, 2);
		}).join("\n\n")
	}
})();