// Builds the "things" list on the front page from js/things.js and
// re-renders it whenever the language changes. No dependencies except things18n.

(function () {
  var list = document.getElementById("things");
  var count = document.getElementById("thing-count");
  var things = window.THINGS || [];
  var i18n = window.things18n;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function render() {
    if (count) count.textContent = i18n.t("things.count", { count: things.length });

    if (list) {
      list.textContent = "";
      things.forEach(function (t, i) {
        var li = el("li");
        var a = el("a", "thing");
        a.href = t.href;
        a.appendChild(el("span", "name", (i + 1) + ". " + t.name));
        a.appendChild(el("span", "kind", i18n.t("kind." + t.kind)));
        a.appendChild(el("span", "desc", i18n.pick(t.desc)));
        var note = i18n.pick(t.note);
        if (note) a.appendChild(el("span", "note", "↳ " + note));
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    // the date at the top of the notebook, in the reader's language
    var pretty = i18n.formatDate(new Date());
    document.querySelectorAll("[data-today]").forEach(function (n) { n.textContent = pretty; });
  }

  render();
  i18n.onChange(render);
})();
