$(function () {
	let $html_div = $('#html-div');
	let $copy_html = $('#copy-html-button');
	let $copy_md = $('#copy-md-button');
	let $copy_result = $('#copy-result-button');
	let yamldoc_editor = CodeMirror.fromTextArea($('#yaml-textarea')[0], {
		mode: "yaml",
		lineNumbers: true,
		viewportMargin: Infinity,
		readOnly: false
	});
	let html_editor = CodeMirror.fromTextArea($('#html-textarea')[0], {
		mode: "htmlmixed",
		lineNumbers: true,
		viewportMargin: Infinity,
		readOnly: true
	});
	let md_editor = CodeMirror.fromTextArea($('#md-textarea')[0], {
		mode: "gfm",
		lineNumbers: true,
		viewportMargin: Infinity,
		readOnly: true
	});
	$('#convert-button').click(function () {
		html_editor.setValue('');
		md_editor.setValue('');
		$html_div.html('<br>');
		let yaml = yamldoc_editor.getValue();
		let html = yamldoc2html(yaml);
		let md = yamldoc2md(yaml);
		if (html === undefined || md === undefined) return;
		html_editor.setValue(html);
		md_editor.setValue(md);
		$html_div.html(html);
		$copy_html.attr('disabled', false);
		$copy_md.attr('disabled', false);
		$copy_result.attr('disabled', false);
	});
	$copy_html.click(function () {
		copyTextToClipboard(html_editor.getValue());
	});
	$copy_md.click(function () {
		copyTextToClipboard(md_editor.getValue());
	});
	$copy_result.click(function () {
		copyHtmlToClipboard($html_div.html());
	});
});

function copyTextToClipboard(str) {
	function listener(e) {
		e.clipboardData.setData("text/plain", str);
		e.preventDefault();
	}

	document.addEventListener("copy", listener);
	document.execCommand("copy");
	document.removeEventListener("copy", listener);
}

function copyHtmlToClipboard(str) {
	function listener(e) {
		e.clipboardData.setData("text/html", str);
		e.clipboardData.setData("text/plain", str);
		e.preventDefault();
	}

	document.addEventListener("copy", listener);
	document.execCommand("copy");
	document.removeEventListener("copy", listener);
}