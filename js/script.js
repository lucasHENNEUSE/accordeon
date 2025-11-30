// ----------------------------
// CONFIG API
// ----------------------------
const API_URL = "http://127.0.0.1:8000";

// Sélecteurs DOM
const vinSelect = document.getElementById("vinSelect");
const platSelect = document.getElementById("platSelect");
const suggestionText = document.getElementById("suggestionText");
const descriptionText = document.getElementById("descriptionText");

let vins = [];
let plats = [];
let token = null;

// ----------------------------
// LOGIN AUTOMATIQUE
// ----------------------------
async function login() {
    const formData = new URLSearchParams();
    formData.append("username", "lucas");
    formData.append("password", "oceluc");

    const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    
    token = data.access_token;
    localStorage.setItem("token", token);

    console.log("Connexion OK, token reçu.");
}

// ----------------------------
// CHARGEMENT DES VINS ET PLATS
// ----------------------------
async function loadData() {
    try {
        if (!token) await login();

        const headers = { "Authorization": `Bearer ${token}` };

        // Vins
        const resVins = await fetch(`${API_URL}/vins`, { headers });
        vins = await resVins.json();
        populateSelect(vinSelect, vins, "nom_vin");

        // Plats
        const resPlats = await fetch(`${API_URL}/plats`, { headers });
        plats = await resPlats.json();
        populateSelect(platSelect, plats, "nom_plat");

    } catch (err) {
        console.error("Erreur chargement :", err);
    }
}

// Ajoute les options dans les menus
function populateSelect(select, items, key) {
    select.length = 1;
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item[key];
        option.textContent = item[key];
        select.appendChild(option);
    });
}

// ----------------------------
// AFFICHAGE DES ACCORDS
// ----------------------------
async function updateSuggestion() {
    const vin = vinSelect.value;
    const plat = platSelect.value;

    // Si on choisit un VIN → on affiche les PLATS associés
    if (vin) {
        const accords = await getAccordsForVin(vin);
        suggestionText.innerHTML = formatAccords("plats", accords);

        const vinObj = vins.find(v => v.nom_vin === vin);
        descriptionText.textContent = vinObj ? vinObj.description : "Pas de description.";
    }

    // Si on choisit un PLAT → on affiche les VINS associés
    if (plat) {
        const accords = await getAccordsForPlat(plat);
        suggestionText.innerHTML = formatAccords("vins", accords);

        descriptionText.textContent = "";
    }
}

// Récupérer accords pour un vin
async function getAccordsForVin(vin) {
    const res = await fetch(`${API_URL}/accords/par_vin/${vin}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

// Récupérer accords pour un plat
async function getAccordsForPlat(plat) {
    const res = await fetch(`${API_URL}/accords/par_plat/${plat}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

// Formatage d’affichage
function formatAccords(type, accords) {
    if (!accords.length) return "Aucun accord trouvé.";

    if (type === "plats") {
        return accords
            .map(a => `🥘 ${a.nom_plat} (${a.criteres})`)
            .join("<br>");
    }

    if (type === "vins") {
        return accords
            .map(a => `🍷 ${a.nom_vin} (${a.criteres})`)
            .join("<br>");
    }
}


vinSelect.addEventListener("change", updateSuggestion);
platSelect.addEventListener("change", updateSuggestion);


// LANCEMENT

loadData();
