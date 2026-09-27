/**
 * Mary App — HTML do mapa (roda dentro da WebView)
 *
 * Reaproveita a mesma lógica do mapa.html/mapa.js da versão
 * Web: Leaflet + tiles OpenStreetMap/CARTO (grátis, sem
 * chave), busca via Nominatim, rotas via OSRM — tudo já
 * testado ali. Localização e favoritos são feitos pela ponte
 * com o React Native (o RN já tem os serviços corretos:
 * expo-location e AsyncStorage escopado por usuário) em vez
 * de duplicar essa lógica aqui dentro da WebView.
 *
 * Protocolo da ponte:
 * WebView -> RN (window.ReactNativeWebView.postMessage):
 *   { tipo: "pronto" }
 *   { tipo: "pedir_localizacao" }
 *   { tipo: "favorito_adicionar", nome, endereco, latitude, longitude }
 *   { tipo: "favorito_remover", id }
 *
 * RN -> WebView (window.receberDoRN(mensagem)):
 *   { tipo: "localizacao", latitude, longitude }
 *   { tipo: "erro_localizacao", mensagem }
 *   { tipo: "favoritos", lista: [...] }
 */

export function gerarHtmlDoMapa(): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { margin: 0; padding: 0; height: 100%; background: #0f0f10; font-family: -apple-system, sans-serif; }
    #map { position: absolute; inset: 0; }

    .search-wrap {
      position: absolute; top: 12px; left: 12px; right: 12px; z-index: 1000;
    }
    .search-bar {
      display: flex; align-items: center; gap: 8px;
      background: #18181bee; border: 1px solid #303036; border-radius: 16px;
      padding: 0 14px; box-shadow: 0 6px 18px rgba(0,0,0,.3);
    }
    .search-bar input {
      flex: 1; border: none; background: transparent; color: #fff; font-size: 14px; padding: 12px 0; outline: none;
    }
    .search-results {
      margin-top: 6px; max-height: 240px; overflow-y: auto;
      background: #18181bee; border: 1px solid #303036; border-radius: 16px;
    }
    .search-results div {
      padding: 12px 14px; color: #eee; font-size: 13px; border-top: 1px solid #262629;
    }
    .search-results div:first-child { border-top: none; }

    .locate-fab {
      position: absolute; right: 12px; bottom: 190px; z-index: 1000;
      width: 46px; height: 46px; border-radius: 23px; background: #d81b60;
      color: #fff; font-size: 19px; border: none; box-shadow: 0 6px 18px rgba(216,27,96,.4);
    }

    .panel {
      position: absolute; left: 0; right: 0; bottom: 0; z-index: 1000;
      background: #18181b; border-top-left-radius: 22px; border-top-right-radius: 22px;
      border-top: 1px solid #303036; padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
      max-height: 46%; overflow-y: auto;
    }
    .row { display: flex; align-items: center; gap: 10px; min-height: 32px; }
    .dot { width: 9px; height: 9px; border-radius: 5px; flex-shrink: 0; }
    .dot.origin { background: #42a5f5; }
    .dot.dest { background: #d81b60; }
    .row-text { flex: 1; color: #fff; font-size: 13px; }
    .row-text.muted { color: #777; }
    .star { background: transparent; border: none; color: #f5c518; font-size: 18px; }

    .mode-toggle { display: flex; gap: 8px; margin-top: 10px; }
    .mode-btn {
      flex: 1; min-height: 38px; border-radius: 11px; border: 1px solid #292929;
      background: #1f1f1f; color: #999; font-size: 12px; font-weight: 700;
    }
    .mode-btn.active { border-color: rgba(216,27,96,.5); background: rgba(216,27,96,.14); color: #f06292; }

    .btn-primary {
      width: 100%; min-height: 48px; margin-top: 10px; border: none; border-radius: 12px;
      background: #d81b60; color: #fff; font-size: 13px; font-weight: 700;
    }
    .btn-primary:disabled { opacity: .5; }

    .route-option {
      display: flex; align-items: center; gap: 10px; padding: 12px; margin-top: 8px;
      border-radius: 13px; border: 1px solid #292929; background: #1f1f1f;
    }
    .route-option.selected { border-color: rgba(216,27,96,.5); background: rgba(216,27,96,.08); }
    .route-info strong { display: block; color: #fff; font-size: 12.5px; }
    .route-info span { display: block; margin-top: 2px; color: #999; font-size: 11px; }

    .favorites-section { margin-top: 12px; }
    .favorites-title { color: #999; font-size: 11px; font-weight: 700; margin-bottom: 8px; letter-spacing: .3px; }
    .favorite-item {
      display: flex; align-items: center; gap: 8px; padding: 10px; margin-bottom: 6px;
      border-radius: 11px; border: 1px solid #292929; background: #1f1f1f;
    }
    .favorite-item span.name { flex: 1; color: #eee; font-size: 12px; }
    .favorite-item button { background: transparent; border: none; color: #ff6b6b; font-size: 14px; }

    .status-text { color: #888; font-size: 11px; margin-top: 4px; }
  </style>
</head>
<body>

  <div id="map"></div>

  <div class="search-wrap">
    <div class="search-bar">
      <span>🔎</span>
      <input id="searchInput" placeholder="Pesquisar endereço, bairro, cidade..." autocomplete="off" />
    </div>
    <div class="search-results" id="searchResults" style="display:none"></div>
  </div>

  <button class="locate-fab" id="locateButton">📍</button>

  <div class="panel">
    <div class="row">
      <span class="dot origin"></span>
      <span class="row-text" id="originText">Minha localização</span>
    </div>
    <div class="row">
      <span class="dot dest"></span>
      <span class="row-text muted" id="destText">Pesquise um destino acima</span>
      <button class="star" id="favButton" style="display:none">☆</button>
    </div>

    <div class="mode-toggle">
      <button class="mode-btn active" id="modeFoot">🚶 A pé</button>
      <button class="mode-btn" id="modeCar">🚗 Carro</button>
    </div>

    <button class="btn-primary" id="traceButton" disabled>TRAÇAR ROTA</button>
    <div class="status-text" id="statusText"></div>

    <div id="routeResults"></div>

    <div class="favorites-section">
      <div class="favorites-title">FAVORITOS</div>
      <div id="favoritesList"></div>
      <div class="status-text" id="favoritesEmpty">Nenhum favorito salvo ainda.</div>
    </div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    function enviarParaRN(mensagem) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(mensagem));
      }
    }

    var mapa = L.map("map", { zoomControl: true }).setView([-14.235, -51.9253], 4);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 19
    }).addTo(mapa);

    var iconeUsuario = L.divIcon({
      className: "", iconSize: [20,20], iconAnchor: [10,10],
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#42a5f5;border:3px solid #fff;box-shadow:0 0 0 4px rgba(66,165,245,.25)"></div>'
    });
    var iconeDestino = L.divIcon({
      className: "", iconSize: [30,30], iconAnchor: [15,30],
      html: '<div style="font-size:30px;line-height:1;transform:translateY(-6px)">📍</div>'
    });

    var origem = null, destino = null, marcadorUsuario = null, marcadorDestino = null, camadaRota = null;
    var modoAtual = "foot";
    var favoritos = [];

    function escapar(texto) {
      return String(texto || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    // ===== LOCALIZAÇÃO (pedida ao RN, nunca usa geolocalização da própria WebView) =====

    document.getElementById("locateButton").addEventListener("click", function () {
      document.getElementById("statusText").textContent = "Obtendo localização...";
      enviarParaRN({ tipo: "pedir_localizacao" });
    });

    function definirOrigem(lat, lng) {
      origem = { latitude: lat, longitude: lng };
      document.getElementById("originText").textContent = "Minha localização";
      if (marcadorUsuario) { marcadorUsuario.setLatLng([lat, lng]); }
      else { marcadorUsuario = L.marker([lat, lng], { icon: iconeUsuario }).addTo(mapa).bindPopup("Você está aqui"); }
      mapa.setView([lat, lng], 14);
      atualizarBotaoTraçar();
      document.getElementById("statusText").textContent = "";
    }

    // ===== BUSCA (Nominatim) =====

    var debounceBusca = null;
    var searchInput = document.getElementById("searchInput");
    var searchResults = document.getElementById("searchResults");

    searchInput.addEventListener("input", function () {
      clearTimeout(debounceBusca);
      var valor = searchInput.value.trim();
      if (valor.length < 3) { searchResults.style.display = "none"; return; }
      debounceBusca = setTimeout(function () { pesquisar(valor); }, 500);
    });

    function pesquisar(consulta) {
      var url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=br&q=" + encodeURIComponent(consulta);
      fetch(url, { headers: { "Accept-Language": "pt-BR" } })
        .then(function (r) { return r.json(); })
        .then(function (resultados) {
          if (!resultados.length) { searchResults.style.display = "none"; return; }
          searchResults.innerHTML = resultados.map(function (item, i) {
            return '<div data-i="' + i + '">📍 ' + escapar(item.display_name) + '</div>';
          }).join("");
          searchResults.style.display = "block";
          Array.prototype.forEach.call(searchResults.children, function (el) {
            el.addEventListener("click", function () {
              var item = resultados[Number(el.dataset.i)];
              selecionarDestino({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                nome: item.display_name.split(",")[0],
                endereco: item.display_name
              });
            });
          });
        })
        .catch(function () { document.getElementById("statusText").textContent = "Não foi possível pesquisar agora."; });
    }

    function selecionarDestino(local) {
      destino = local;
      searchResults.style.display = "none";
      searchInput.value = local.nome;
      document.getElementById("destText").textContent = local.nome;
      document.getElementById("destText").classList.remove("muted");
      document.getElementById("favButton").style.display = "inline-block";
      atualizarEstrela();

      if (marcadorDestino) { marcadorDestino.setLatLng([local.latitude, local.longitude]); }
      else { marcadorDestino = L.marker([local.latitude, local.longitude], { icon: iconeDestino }).addTo(mapa); }
      marcadorDestino.bindPopup(escapar(local.nome)).openPopup();
      mapa.setView([local.latitude, local.longitude], 15);

      atualizarBotaoTraçar();
      document.getElementById("routeResults").innerHTML = "";
      if (camadaRota) { mapa.removeLayer(camadaRota); camadaRota = null; }
    }

    function atualizarBotaoTraçar() {
      document.getElementById("traceButton").disabled = !(origem && destino);
    }

    // ===== FAVORITOS (via RN) =====

    document.getElementById("favButton").addEventListener("click", function () {
      if (!destino) return;
      var jaSalvo = favoritos.some(function (f) {
        return Math.abs(f.latitude - destino.latitude) < 0.0001 && Math.abs(f.longitude - destino.longitude) < 0.0001;
      });
      if (jaSalvo) return;
      enviarParaRN({ tipo: "favorito_adicionar", nome: destino.nome, endereco: destino.endereco, latitude: destino.latitude, longitude: destino.longitude });
    });

    function atualizarEstrela() {
      if (!destino) return;
      var jaSalvo = favoritos.some(function (f) {
        return Math.abs(f.latitude - destino.latitude) < 0.0001 && Math.abs(f.longitude - destino.longitude) < 0.0001;
      });
      document.getElementById("favButton").textContent = jaSalvo ? "★" : "☆";
    }

    function renderizarFavoritos() {
      var lista = document.getElementById("favoritesList");
      var vazio = document.getElementById("favoritesEmpty");
      if (!favoritos.length) { lista.innerHTML = ""; vazio.style.display = "block"; return; }
      vazio.style.display = "none";
      lista.innerHTML = favoritos.map(function (f) {
        return '<div class="favorite-item" data-id="' + f.id + '">' +
          '<span class="name">⭐ ' + escapar(f.nome) + '</span>' +
          '<button data-remove="' + f.id + '">🗑️</button>' +
        '</div>';
      }).join("");

      Array.prototype.forEach.call(lista.querySelectorAll("[data-remove]"), function (btn) {
        btn.addEventListener("click", function (evento) {
          evento.stopPropagation();
          enviarParaRN({ tipo: "favorito_remover", id: Number(btn.dataset.remove) });
        });
      });

      Array.prototype.forEach.call(lista.querySelectorAll(".favorite-item"), function (item) {
        item.addEventListener("click", function () {
          var fav = favoritos.find(function (f) { return String(f.id) === item.dataset.id; });
          if (fav) selecionarDestino(fav);
        });
      });
    }

    // ===== MODO =====

    document.getElementById("modeFoot").addEventListener("click", function () { definirModo("foot"); });
    document.getElementById("modeCar").addEventListener("click", function () { definirModo("car"); });

    function definirModo(modo) {
      modoAtual = modo;
      document.getElementById("modeFoot").classList.toggle("active", modo === "foot");
      document.getElementById("modeCar").classList.toggle("active", modo === "car");
    }

    // ===== ROTAS (OSRM) =====

    function formatarDistancia(m) { return m < 1000 ? Math.round(m) + " m" : (m/1000).toFixed(1) + " km"; }
    function formatarDuracao(s) {
      var min = Math.round(s/60);
      if (min < 1) return "menos de 1 min";
      if (min < 60) return min + " min";
      return Math.floor(min/60) + "h" + (min % 60 ? " " + (min % 60) + "min" : "");
    }

    document.getElementById("traceButton").addEventListener("click", function () {
      if (!origem || !destino) return;
      document.getElementById("statusText").textContent = "Calculando rota...";
      document.getElementById("routeResults").innerHTML = "";

      var perfil = modoAtual === "car" ? "driving" : "foot";
      var url = "https://router.project-osrm.org/route/v1/" + perfil + "/" +
        origem.longitude + "," + origem.latitude + ";" + destino.longitude + "," + destino.latitude +
        "?overview=full&geometries=geojson&alternatives=true&steps=false";

      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (dados) {
          document.getElementById("statusText").textContent = "";
          if (dados.code !== "Ok" || !dados.routes || !dados.routes.length) {
            document.getElementById("statusText").textContent = "Não foi possível calcular a rota agora.";
            return;
          }
          renderizarRotas(dados.routes);
        })
        .catch(function () {
          document.getElementById("statusText").textContent =
            modoAtual === "foot"
              ? "Rota a pé indisponível agora — tente o modo carro."
              : "Não foi possível calcular a rota. Verifique sua internet.";
        });
    });

    function desenharRota(rota) {
      if (camadaRota) mapa.removeLayer(camadaRota);
      camadaRota = L.geoJSON(rota.geometry, { style: { color: "#d81b60", weight: 5, opacity: .9 } }).addTo(mapa);
      mapa.fitBounds(camadaRota.getBounds(), { padding: [30,30] });
    }

    function renderizarRotas(rotas) {
      var container = document.getElementById("routeResults");
      container.innerHTML = rotas.map(function (rota, i) {
        return '<div class="route-option ' + (i===0 ? "selected" : "") + '" data-i="' + i + '">' +
          '<div class="route-info" style="flex:1">' +
            '<strong>' + (i===0 ? "Rota mais rápida" : "Alternativa " + i) + '</strong>' +
            '<span>' + formatarDuracao(rota.duration) + " · " + formatarDistancia(rota.distance) + '</span>' +
          '</div>' +
        '</div>';
      }).join("");

      Array.prototype.forEach.call(container.children, function (el) {
        el.addEventListener("click", function () {
          Array.prototype.forEach.call(container.children, function (c) { c.classList.remove("selected"); });
          el.classList.add("selected");
          desenharRota(rotas[Number(el.dataset.i)]);
        });
      });

      desenharRota(rotas[0]);
    }

    // ===== RECEBER MENSAGENS DO RN =====

    window.receberDoRN = function (mensagem) {
      if (mensagem.tipo === "localizacao") {
        definirOrigem(mensagem.latitude, mensagem.longitude);
      } else if (mensagem.tipo === "erro_localizacao") {
        document.getElementById("statusText").textContent = mensagem.mensagem;
      } else if (mensagem.tipo === "favoritos") {
        favoritos = mensagem.lista || [];
        renderizarFavoritos();
        atualizarEstrela();
      }
    };

    document.addEventListener("click", function (evento) {
      if (!searchResults.contains(evento.target) && evento.target !== searchInput) {
        searchResults.style.display = "none";
      }
    });

    enviarParaRN({ tipo: "pronto" });
  </script>
</body>
</html>
`;
}
