// Toggle the pattern information panel from the view all page
var patternExtraToggle = document.querySelectorAll(".sg-pattern-extra-toggle"),
	patternExtraPanel = document.querySelectorAll(".sg-pattern-extra"),
	els = patternExtraToggle,
	item;

for (var i = 0; i < els.length; ++i) {
	els[i].onclick = (function(item) {
		return function(e) {	
			e.preventDefault();
			this.classList.toggle("active");
			var thisHref = this.getAttribute("href");
			document.querySelector(thisHref).classList.toggle("active");
		};
	})(item);
}
