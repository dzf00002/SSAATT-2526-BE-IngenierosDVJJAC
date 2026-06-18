let testuser = false;
const SERVER_URL = "";
const API_LOGIN = SERVER_URL + "/login";
const API_USERS = SERVER_URL + "/volunteers";
const API_TURNS = SERVER_URL + "/turns";

function showError(message) {
  let div = document.getElementById("Error_banner");
  let text = document.getElementById("message");
  if (div != null) {
    if (text != null) {
      text.innerText = message;
    }
    div.classList.remove("oculta");
    div.classList.add("visible");
    setTimeout(() => {
      div.classList.remove("visible");
      div.classList.add("oculta");
    }, 5000);
  }
}

function LoginForm(event) {
  event.preventDefault();
  console.log("Enviando Inicio de sesión al servidor...");

  let email = document.forms.login.email.value;
  let password = document.forms.login.password.value;
  let auth = { email: email, password: password };

  fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(auth)
  })
    .then(function (response) {
      if (response.status === 200) {
        console.log("Usuario autenticado con éxito.");
        testuser = true;
        let privateClasses = document.querySelectorAll(".menuprivado");
        if (privateClasses != null) {
          for (let classes of privateClasses) {
            classes.classList.remove("oculta");
          }
        }
        document.getElementById("nav-3").classList.add("oculta");
        document.getElementById("nav-4").classList.add("oculta");
        showSection("1");
      } else {
        showError("El correo o la contraseña no son correctos.");
      }
    })
    .catch(function (error) {
      showError("No hay conexión con el servidor.");
    });
}

async function doCreateUser(event) {
  event.preventDefault();
  console.log("Enviando registro al servidor...");

  let user = document.forms.registro.user.value;
  let email = document.forms.registro.email.value;
  let name = document.forms.registro.name.value;
  let surnames = document.forms.registro.surnames.value;
  let password = document.forms.registro.password.value;
  let testing = document.forms.registro.testing.value;

  if (password !== testing) {
    showError("La contraseña y su comprobación no coinciden.");
    return;
  }

  let newUser = {
    email: email,
    user: user,
    name: name,
    surnames: surnames,
    password: password
  };

  let userId = await createUser(newUser);

  if (userId != null) {
    alert("Usuario registrado correctamente.");
    showSection("3");
  } else {
    showError("No se ha podido registrar el usuario.");
  }
}

async function createUser(user) {
  let init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  };
  let response = await fetch(API_USERS, init);
  if (response.ok) {
    return await response.json();
  } else {
    return null;
  }
}

function showSection(sectionId) {
  let sections = document.getElementsByTagName("section");
  let hidesections = ["6", "7", "8"];
  if (hidesections.includes(sectionId) && testuser === false) {
    showError("Hay que iniciar sesión para acceder a esta sección.");
    return;
  }
  if (sections != null) {
    for (let s of sections) {
      s.classList.add("oculta");
    }
  }
  let section = document.getElementById("sec-" + sectionId);
  if (section) section.classList.remove("oculta");

  let links = document.querySelectorAll("[id^=nav-]");
  if (links != null) {
    for (let link of links) {
      link.classList.remove("active");
    }
  }
  let link = document.getElementById("nav-" + sectionId);
  if (link) link.classList.add("active");
}

window.onload = function () {
  let privateClasses = document.querySelectorAll(".menuprivado");
  if (privateClasses != null) {
    for (let classes of privateClasses) {
      classes.classList.add("oculta");
    }
  }
  showSection(1);
};

let turns = [];

window.addEventListener("load", async function () {
  console.log("Cargando plantilla de turnos...");
  chargeTestingTurns();

  try {
    let response = await fetch(API_TURNS, { method: "GET" });
    if (response.ok) {
      let reservedturns = await response.json();

      for (let i = 0; i < reservedturns.length; i++) {
        let myturn = searchTurn(reservedturns[i].id);
        if (myturn != null) {
          myturn.state = "reservado";
        }
      }
      updateTurnScreen();
    }
  } catch (error) {
    console.error("Fallo al conectar con el servidor de turnos.");
  }
});

function chargeTestingTurns() {
  turns = [
    {
      id: "turno-lunes-desayuno",
      day: "Lunes",
      food: "Desayuno",
      state: "libre"
    },
    {
      id: "turno-martes-desayuno",
      day: "Martes",
      food: "Desayuno",
      state: "libre"
    },
    {
      id: "turno-miercoles-desayuno",
      day: "Miércoles",
      food: "Desayuno",
      state: "libre"
    },
    {
      id: "turno-jueves-desayuno",
      day: "Jueves",
      food: "Desayuno",
      state: "libre"
    },
    {
      id: "turno-viernes-desayuno",
      day: "Viernes",
      food: "Desayuno",
      state: "libre"
    },

    { id: "turno-lunes-comida", day: "Lunes", food: "Comida", state: "libre" },
    {
      id: "turno-martes-comida",
      day: "Martes",
      food: "Comida",
      state: "libre"
    },
    {
      id: "turno-miercoles-comida",
      day: "Miércoles",
      food: "Comida",
      state: "libre"
    },
    {
      id: "turno-jueves-comida",
      day: "Jueves",
      food: "Comida",
      state: "libre"
    },
    {
      id: "turno-viernes-comida",
      day: "Viernes",
      food: "Comida",
      state: "libre"
    },

    { id: "turno-lunes-cena", day: "Lunes", food: "Cena", state: "libre" },
    { id: "turno-martes-cena", day: "Martes", food: "Cena", state: "libre" },
    {
      id: "turno-miercoles-cena",
      day: "Miércoles",
      food: "Cena",
      state: "libre"
    },
    { id: "turno-jueves-cena", day: "Jueves", food: "Cena", state: "libre" },
    { id: "turno-viernes-cena", day: "Viernes", food: "Cena", state: "libre" }
  ];
  beginTurns();
}

function beginTurns() {
  for (let i = 0; i < turns.length; i++) {
    let cell = document.getElementById(turns[i].id);
    if (cell != null) {
      cell.addEventListener("click", function () {
        tickTurn(turns[i].id);
      });
    }
  }
  let confirmButton = document.getElementById("btn-confirmar-turnos");
  if (confirmButton != null) {
    confirmButton.addEventListener("click", confirmTurns);
  }
  let changeButton = document.getElementById("btn-cambiar-turno");
  if (changeButton != null) {
    changeButton.addEventListener("click", changeTurn);
  }
  updateTurnScreen();
}

function searchTurn(turnId) {
  for (let i = 0; i < turns.length; i++) {
    if (turns[i].id === turnId) return turns[i];
  }
  return null;
}

function tickTurn(turnId) {
  let turn = searchTurn(turnId);
  if (turn == null) return;
  if (turn.state === "reservado") {
    showError("Ese turno ya está reservado.");
    return;
  }
  turn.state = turn.state === "libre" ? "marcado" : "libre";
  updateTurnScreen();
}

async function confirmTurns() {
  let counter = 0;

  for (let i = 0; i < turns.length; i++) {
    if (turns[i].state === "marcado") {
      let reservationData = {
        id: turns[i].id,
        day: turns[i].day,
        food: turns[i].food
      };

      try {
        let response = await fetch(API_TURNS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData)
        });

        if (response.ok) {
          turns[i].state = "reservado";
          counter++;
        } else {
          showError("Error al guardar en el servidor.");
        }
      } catch (error) {
        showError("Fallo de conexión al guardar.");
      }
    }
  }

  if (counter === 0) {
    showError("No has seleccionado ningún turno.");
  } else {
    alert("¡Has reservado " + counter + " turnos con éxito!");
  }
  updateTurnScreen();
}

async function deleteTurn(turnId) {
  let url = API_TURNS + "/" + turnId;
  try {
    let response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      let turn = searchTurn(turnId);
      if (turn != null && turn.state === "reservado") {
        turn.state = "libre";
      }
      updateTurnScreen();
    } else {
      showError("No se pudo anular la reserva.");
    }
  } catch (error) {
    showError("Error de conexión al intentar borrar.");
  }
}

async function changeTurn() {
  let currentSelect = document.getElementById("turno-actual");
  let newSelect = document.getElementById("turno-nuevo");
  if (currentSelect == null || newSelect == null) return;

  let currentId = currentSelect.value;
  let newId = newSelect.value;

  if (currentId === "" || newId === "") {
    showError("Selecciona el turno reservado y el nuevo turno disponible.");
    return;
  }

  let currentTurn = searchTurn(currentId);
  let newTurn = searchTurn(newId);

  if (currentTurn == null || newTurn == null) return;

  if (currentTurn.state !== "reservado") {
    showError("El turno que quieres cambiar ya no está reservado.");
    return;
  }
  if (newTurn.state !== "libre") {
    showError("El nuevo turno ya no está libre.");
    return;
  }

  let newData = {
    id: newTurn.id,
    day: newTurn.day,
    food: newTurn.food,
    state: "reservado"
  };

  let url = API_TURNS + "/" + currentId;

  try {
    console.log("Modificando turno en el servidor de", currentId, "a", newId);

    let response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData)
    });

    if (response.ok) {
      console.log("Turno modificado correctamente en la base de datos.");

      currentTurn.state = "libre";
      newTurn.state = "reservado";
      updateTurnScreen();

      alert("¡Turno cambiado con éxito en la base de datos!");
    } else {
      showError("No se pudo modificar el turno en el servidor.");
    }
  } catch (error) {
    console.error("Error al hacer el PUT:", error);
    showError("Error de conexión al intentar cambiar el turno.");
  }
}

function updateTurnScreen() {
  updateTurnsTable();
  showReservedTurns();
  updateChangeSelectors();
}

function updateTurnsTable() {
  for (let i = 0; i < turns.length; i++) {
    let cell = document.getElementById(turns[i].id);
    if (cell != null) {
      cell.classList.remove("libre", "marcado", "reservado");
      if (turns[i].state === "libre") {
        cell.textContent = "Disponible";
        cell.classList.add("libre");
      }
      if (turns[i].state === "marcado") {
        cell.textContent = "Seleccionado";
        cell.classList.add("marcado");
      }
      if (turns[i].state === "reservado") {
        cell.textContent = "Reservado";
        cell.classList.add("reservado");
      }
    }
  }
}

function showReservedTurns() {
  let list = document.getElementById("lista-turnos");
  if (list == null) return;
  list.innerHTML = "";
  for (let i = 0; i < turns.length; i++) {
    if (turns[i].state === "reservado") {
      let element = document.createElement("li");
      element.textContent = turns[i].day + " - " + turns[i].food;
      let deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.type = "button";
      deleteButton.classList.add("boton-lista");
      deleteButton.addEventListener("click", function () {
        deleteTurn(turns[i].id);
      });
      element.appendChild(deleteButton);
      list.appendChild(element);
    }
  }
}

function updateChangeSelectors() {
  let currentSelect = document.getElementById("turno-actual");
  let newSelect = document.getElementById("turno-nuevo");
  if (currentSelect == null || newSelect == null) return;
  currentSelect.innerHTML = "";
  newSelect.innerHTML = "";
  createInitialOption(currentSelect, "Selecciona un turno reservado");
  createInitialOption(newSelect, "Selecciona un turno libre");
  for (let i = 0; i < turns.length; i++) {
    if (turns[i].state === "reservado") {
      createOption(currentSelect, turns[i]);
    }
    if (turns[i].state === "libre") {
      createOption(newSelect, turns[i]);
    }
  }
}

function createInitialOption(select, text) {
  let option = document.createElement("option");
  option.value = "";
  option.textContent = text;
  select.appendChild(option);
}

function createOption(select, turn) {
  let option = document.createElement("option");
  option.value = turn.id;
  option.textContent = turn.day + " - " + turn.food;
  select.appendChild(option);
}
