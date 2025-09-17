const BASE_URL = CONFIG.POKEDEX_BASE_URL;
const listPokemon = document.getElementById('listPokemon');
const searchPokemon = document.getElementById('search');
const typeSelector = document.getElementById('typePokemon');
const pokedexContainer = document.getElementById('pokedexContainer');

// cargar pokemons
async function loadAllPokemons() {
    listPokemon.innerHTML = "";
    try {
        const response = await fetch(`${BASE_URL}?limit=150`);
        const data = await response.json();

        for (const poke of data.results) {
            const res = await fetch(poke.url);
            const pokemonData = await res.json();
            displayPokemon(pokemonData);
        }
    } catch (error) {
        showError("Error al cargar los Pokémon.");
    }
}

// Llamada inicial
loadAllPokemons();
            
//funcion volver id 000
function zeroPokemonId(id) {
    let zeroId = id.toString();
    if (zeroId.length === 1) zeroId = '000' + zeroId;
    else if (zeroId.length === 2) zeroId = '00' + zeroId;
    else if (zeroId.length === 3) zeroId = '0' + zeroId;
    return zeroId;
}
//volver tipo español
function convertTypeToSpanish(type) {
    const typeTranslations = {
        normal: 'Normal',
        fire: 'Fuego',
        water: 'Agua', 
        electric: 'Eléctrico',
        grass: 'Planta',
        ice: 'Hielo',   
        fighting: 'Lucha',
        poison: 'Veneno',
        ground: 'Tierra',
        flying: 'Volador',
        psychic: 'Psíquico',
        bug: 'Bicho',
        rock: 'Roca',
        ghost: 'Fantasma',
        dragon: 'Dragón',
        dark: 'Siniestro',
        steel: 'Acero',
        fairy: 'Hada'
    };
    return typeTranslations[type] || type;
}

// mostrar pokemon
function displayPokemon(pokemon) {
    const zeroId = zeroPokemonId(pokemon.id);
    
    // guardamos tipos en data-attribute
    const typesString = pokemon.types.map(type => type.type.name).join(',');
    
    let typePokemon = pokemon.types.map((type) => {
        const typeName = type.type.name;
        const spanishType = convertTypeToSpanish(typeName);
        return `<span class="type-badge type-${typeName}">${spanishType}</span>`
    }).join('');

    const pokemonElement = document.createElement('div');
    pokemonElement.classList.add('pokemon-card');
    pokemonElement.dataset.types = typesString; 
    pokemonElement.dataset.id = pokemon.id;

    pokemonElement.innerHTML = `
        <h2 class="pokemon-name">${pokemon.name}</h2>
        <img class="pokemon-image" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
        <div class="card-footer">
            <p class="pokemon-id">No.${zeroId}</p>
            <div class="pokemon-types">
                ${typePokemon}
            </div>
        </div>
    `;

    pokemonElement.addEventListener('click', () => {
        fetchPokemonDetails(pokemon.id);
    });

    listPokemon.appendChild(pokemonElement);
}


//buscar pokemon
searchPokemon.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const nameId = searchPokemon.value.toLowerCase().trim();
        if (!nameId) {
            alert("Por favor escribe un nombre o ID de un Pokémon");
            return;
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameId}`);
            if (!response.ok) {
                function displayError(message) {
                    listPokemon.innerHTML = `<p class="error-message">${message}</p>`;
                }
                displayError("Error 404: Pokémon no encontrado. Inténtalo de nuevo.");
                return;}
            const pokemonData = await response.json();

            listPokemon.innerHTML = '';
            displayPokemon(pokemonData);
            searchPokemon.value = "";
            typeSelector.value = "all";

        }catch (error) {
            showError("Pokémon no encontrado. Inténtalo de nuevo.");
        }   
    }
});

// selector funcion
typeSelector.addEventListener('change', async (event) => {
    const selectedType = event.target.value;

    if (selectedType === "all") {
        
        // carga todos los pokémon
        loadPokemon();
        return;
    }

    listPokemon.innerHTML = "";

    try {
        // pedimos a la API pokemon por tipo
        const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        if (!response.ok) throw new Error("Error al cargar por tipo");

        const data = await response.json();

        // la API trae un array 
        const pokemonsOfType = data.pokemon;

        // cargar 40 primeros
        const limit = 40;
        for (let i = 0; i < Math.min(limit, pokemonsOfType.length); i++) {
            const pokeEntry = pokemonsOfType[i].pokemon;
            const pokeResponse = await fetch(pokeEntry.url);
            const pokemonData = await pokeResponse.json();
            displayPokemon(pokemonData);
        }
    } catch (error) {
        showError("Error al filtrar Pokémon por tipo.");
    }
});


//cargar lista inicial de pokemon
async function loadPokemon() {
   try{
        const response = await fetch(`${BASE_URL}?limit=500`);
        const data = await response.json();
       
        for (const pokemon of data.results) {
            const pokemonDetails = await fetch(pokemon.url);
            const pokemonData = await pokemonDetails.json();
            displayPokemon(pokemonData);
        }
    } catch (error) {
        showError("Error al cargar los Pokémon. Inténtalo de nuevo más tarde.");
    }
}

//abrir tarjeta detalle
async function fetchPokemonDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}`);
        if (!response.ok) throw new Error("Error al cargar los detalles del Pokémon.");
        const pokemon = await response.json();
        showPokemonDetails(pokemon);
    } catch (error) {
        showError("Error al cargar los detalles del Pokémon.");
    }
}


//mostrar detalles
function showPokemonDetails(pokemon) {
    const zeroId = zeroPokemonId(pokemon.id);

    // tipos traducidos
    let typePokemon = pokemon.types.map((type) => {
        const typeName = type.type.name;
        const spanishType = convertTypeToSpanish(typeName);
        return `<span class="type-badge type-${typeName}">${spanishType}</span>`
    }).join('');

    
    const importantStats = ["hp", "attack", "defense", "speed"];
    const stats = pokemon.stats.filter(stat => importantStats.includes(stat.stat.name)).map(stat => `<li>${stat.stat.name.toUpperCase()}: ${stat.base_stat}</li>`).join('');
    const height = (pokemon.height / 10).toFixed(1);
    const weight = (pokemon.weight / 10).toFixed(1);
    
    const imageUrl = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    overlay.innerHTML = `
  
        <div class="detail-card" >
            <button id="closePokedex" class="close-button">&times;</button>
            
            <div class="detail-header">
                <h2 class="detail-name">${pokemon.name}</h2>
                <p class="detail-id">No. ${zeroId}</p>
            </div>

            <div class="detail-image">
                <img src="${imageUrl}" alt="${pokemon.name}">
            </div>
            <div class="detail-types">
                ${typePokemon}
            </div>

            <div class="detail-info">
                <p><strong>Altura: ${height} m     Peso: ${weight} kg</strong></p>
                <hr class="divider">
                <ul class="pokemon-stats"><strong>${stats}</strong></ul>
            </div>
        </div>
    </div>
    `;
         
    pokedexContainer.appendChild(overlay);

    // Botón cerrar
      overlay.querySelector(".close-button").addEventListener("click", () => {
        overlay.remove();
    });
}


