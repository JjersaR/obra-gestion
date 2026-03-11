document.addEventListener("DOMContentLoaded", function () {
  cargarObra();
});

function obtenerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function cargarObra() {

  const id = obtenerId();

  const response = await fetch(`/api/v1/obras/detalles?id=${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la obra");
  }

  const obra = await response.json();

  console.log(obra);
}
