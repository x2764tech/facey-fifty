---
---

 <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>

<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
   integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
   crossorigin=""></script>
   <script src="https://unpkg.com/@mapbox/polyline@1.1.0/src/polyline.js"
   integrity="sha384-IDEhh/gOCXy+ASeq3Kr88jdsZ5XSXKUvq9WTPOGjKIZlEiZiJAZwd+GAnY3XDqLW"
   crossorigin=""></script>

<div id="map" style="height: 50vh">
</div>

<script>
    (function(L) {
       const routes = [
           {%- for route in site.the_routes -%}
            {
                "title": {{ route.title | jsonify }},
                "url": {{ route.url | relative_url | jsonify }},
                "polyline": {{ route.polyline  | jsonify }}
            }
            {%- unless forloop.last -%},{%- endunless -%}
            {%- endfor -%}
       ]

       const myMap = L.map('map').setView([53.6077, -1.8079], 12);     
       L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/outdoors-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiZGF2aWRhcmtlbXAiLCJhIjoidUkwVnZIWSJ9.mCLcitoDx8zvccKNS6-tEA'
        }).addTo(myMap);
       
       let mapBounds = myMap.getBounds();
       for(var i = 0; i < routes.length; ++i) {
           const layer = L.polyline(polyline.decode(routes[i].polyline), { color: 'grey', weight: 3 });
           mapBounds.extend(layer.getBounds());
           layer.addTo(myMap);
           layer.bindPopup("<a href='"+routes[i].url+"'>" + routes[i].title + "</a>")
           layer.on('popupopen', () => {
               layer.setStyle({color: 'red', weight: 5, opacity: 1 });
               myMap.fitBounds(layer.getBounds());
           });
           layer.on('popupclose', () => {
               layer.setStyle({color: 'grey', weight: 3 });
               myMap.fitBounds(mapBounds);
               
           });
       }
       myMap.fitBounds(mapBounds, { padding: [5, 5], animate: false });
    })(L);
</script>