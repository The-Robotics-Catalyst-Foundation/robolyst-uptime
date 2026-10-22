(function () {
  var repo = "The-Robotics-Catalyst-Foundation/robolyst-uptime";
  var runs = "https://api.github.com/repos/" + repo + "/actions/workflows/uptime.yml/runs?status=success&per_page=1";
  var yml = "https://raw.githubusercontent.com/" + repo + "/master/history/robolyst.yml";
  var last = null;

  function ago(t) {
    var m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + " min ago";
    var h = Math.floor(m / 60);
    return h < 24 ? h + " h ago" : Math.floor(h / 24) + " d ago";
  }

  function paint() {
    var lead = document.querySelector("p.lead");
    if (lead && last) lead.setAttribute("data-checked", ago(last));
  }

  function fromRuns() {
    return fetch(runs)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        var run = j.workflow_runs && j.workflow_runs[0];
        return Date.parse(run && (run.updated_at || run.created_at)) || Promise.reject();
      });
  }

  function fromHistory() {
    return fetch(yml)
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (text) {
        var m = /^lastUpdated:\s*(\S+)/m.exec(text);
        return (m && Date.parse(m[1])) || Promise.reject();
      });
  }

  function load() {
    fromRuns()
      .catch(fromHistory)
      .then(function (t) {
        last = t;
        paint();
      })
      .catch(function () {});
  }

  load();
  setInterval(load, 300000);
  setInterval(paint, 15000);
  window.addEventListener("load", function () { setTimeout(paint, 500); });
})();
