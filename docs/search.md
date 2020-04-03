---
title: Search
---

<noscript>
This page requires Javascript to work. Sorry.
</noscript>

<script src="https://unpkg.com/lunr@2.3.8/lunr.js"></script>
  <script>
    lunr.tokenizer.separator = /[\s\-\/]+/
    fetch({{ '/assets/routes.json' | relative_url | jsonify }})
      .then(r => r.json())
      .then(routes => {
          var index = lunr(function () {
            this.field('title', { boost: 2 });
            this.field('content');
            this.ref('url');
            routes.forEach(this.add.bind(this));
          });
          const routesByUrl = routes.reduce((index, route) => { index[route.url] = route; return index; }, {});
          const searchResults = document.getElementById('searchResults');
          const term = new URLSearchParams (location.search).get('q');
          if(!term) return;
          document.getElementById('search').value = term;
        var results = index.search(term);
        results.forEach(r => {
            const route = routesByUrl[r.ref];
            const result = document.createElement('div');
            const header = document.createElement('h2');
            const link = document.createElement('a');
            link.href = route.url;
            link.appendChild(document.createTextNode(route.title));
            header.appendChild(link);
            const body = document.createElement("p");
            body.appendChild( document.createTextNode(route.extract));
            result.appendChild(header);
            result.appendChild(body);
            searchResults.appendChild(result);
        })
      })
  </script>
  <form method="get" action="{{ '/search.html' | relative_url }}">
  <input type="search" name="q" id="search" />
  <button type="submit">🔍</button>
  </form>
  <div id="searchResults"></div>