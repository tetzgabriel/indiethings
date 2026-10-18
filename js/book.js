// Builds the "things" list on the front page from js/things.js,
// and sprinkles a little personality. No dependencies.

(function () {
  var list = document.getElementById("things");
  var count = document.getElementById("thing-count");
  var things = window.THINGS || [];

  if (count) count.textContent = things.length;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  if (list) {
    things.forEach(function (t, i) {
      var li = el("li");
      var a = el("a", "thing");
      a.href = "things/" + t.slug + "/";
      var name = el("span", "name", (i + 1) + ". " + t.name);
      var kind = el("span", "kind", t.kind);
      var desc = el("span", "desc", t.desc);
      a.appendChild(name);
      a.appendChild(kind);
      a.appendChild(desc);
      if (t.note) a.appendChild(el("span", "note", "↳ " + t.note));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // little easter egg: the date at the top of the notebook
  var d = document.querySelectorAll("[data-today]");
  var now = new Date();
  var pretty = now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  d.forEach(function (n) { n.textContent = pretty; });
})();
