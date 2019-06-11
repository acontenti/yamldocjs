function styleHtml(node) {
	return node
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/(^|[^\\])__([^]*?[^\\])__/g, "$1<strong>$2</strong>")
		.replace(/(^|[^\\])_([^]*?[^\\_])_/g, "$1<em>$2</em>")
		.replace(/(^|[^\\])~~([^~]*[^\\])~~/g, "$1<del>$2</del>")
		.replace(/(^|[^\\])~([^~]*[^\\])~/g, "$1<u>$2</u>");
}

function styleMd(node) {
	return node.replace(/(^|[^\\~])~([^~]*[^\\~])~/g, "$1$2");
}

function parseNodeHtml(node, indent) {
	let spaces = '\t'.repeat(indent);
	if (Array.isArray(node)) return spaces + "<ul>\n" + node.map(function (it) {
		return spaces + "\t<li>\n" + parseNodeHtml(it, indent + 2) + spaces + "\t</li>\n";
	}).join("") + spaces + "</ul>\n";
	else if (typeof node === 'object') {
		return spaces + "<ul>\n" + objectMap(node, function (key, it) {
			return spaces + "\t<li>\n" + spaces + "\t\t" + styleHtml(key) + ":\n" + parseNodeHtml(it, indent + 2) + spaces + "\t</li>\n";
		}).join("") + spaces + "</ul>\n";
	} else return spaces + styleHtml(node) + "\n";
}

function parseNodeMd(node, indent) {
	let spaces = ' '.repeat((indent + 1) * 2);
	if (Array.isArray(node)) return node.map(function (it) {
		return "\n" + spaces + "* " + parseNodeMd(it, indent + 1);
	}).join("");
	else if (typeof node === 'object') {
		return objectMap(node, function (key, it) {
			return "\n" + spaces + "* " + styleMd(key) + ": " + parseNodeMd(it, indent + 1);
		}).join("");
	} else return styleMd(node) + "\n";
}

function yamldoc2html(yaml) {
	let doc;
	try {
		doc = jsyaml.safeLoad(yaml);
		console.log(doc);
	} catch (e) {
		console.log(e);
		return undefined;
	}
	if (typeof doc === 'string') return "<div>\n\t" + styleHtml(doc) + "\n</div>";
	else return "<div>\n" + objectMap(doc, function (key, it) {
		return "\t<h1>" + key + "</h1>\n" + parseNodeHtml(it, 1);
	}).join("") + '</div>';
}

function yamldoc2md(yaml) {
	let doc;
	try {
		doc = jsyaml.safeLoad(yaml);
		console.log(doc);
	} catch (e) {
		console.log(e);
		return undefined;
	}
	if (typeof doc === 'string') return styleMd(doc);
	else return objectMap(doc, function (key, it) {
		return "# " + key + "\n" + parseNodeMd(it, 0);
	}).join("\n\n")
}

function objectMap(object, mapFn) {
	return object != null ? Object.keys(object).map(function (key) {
		return mapFn(key, object[key]);
	}) : null;
}