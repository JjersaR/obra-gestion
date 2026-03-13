document.addEventListener("DOMContentLoaded", function () {
  cargarObra();
});

let id = "";

function obtenerId() {
  const partes = window.location.pathname.split("/");
  return partes[partes.length - 1];
}

async function cargarObra() {

  id = obtenerId();
  console.log("El id de la url es: " + id);

  const response = await fetch(`/api/v1/obras/detalles/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la obra");
  }

  const obra = await response.json();

  console.log(obra);
}
