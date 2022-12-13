let cities = ['paris','Marseille','Lyon','Toulouse','Nice','Nantes','Montpellier'];

let map = L.map('map').setView([43.61828102613987, 3.8640413289548907], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let airlayer = new L.layerGroup();
let Weatherlayer = new L.layerGroup();

const url = 'https://api.waqi.info/feed/';
const token = 'd4978ef45cb73a0ddab0041833dc78765d08f09b';

// Création d'une string vide et d'un tableau vide
let citytab = [];

async function FormCity(){
    // Recupération du input
    let cityN = document.querySelector('.city').value
    
    // Parcours du tableau
    for(let i=-1;i<citytab.length;i++){
        let value = false;

        // Pour chaque élément du tableau
        citytab.forEach(element => {
            if(cityN === element){ // Vérification de l'existance
                value = true;
            }
        });

        if(value === true){
            break;
        }else{
            // Intégration dans le tableau
            citytab.push(cityN);
            fetch(`${url}${cityN}/?token=${token}`)
                .then(response => response.json())
                .then(response => GetInfo(response))
                break;
        }
        
    }
}

    

cities.forEach(element => {
    city = element;

    fetch(`${url}${city}/?token=${token}`)
        .then(response => response.json())
        .then(response => GetInfo(response))

});

async function GetInfo(api){
    if(api.data.city.geo){

        baseUrlMeteo = 'https://api.meteo-concept.com/api/';
        tokenMeteo = '391c71402c261f43856592a86dfc1fee73d0872aba3e5609d92802e6dcd34d55';

        fetch(`${baseUrlMeteo}forecast/daily/3/period/2?token=${tokenMeteo}`)
            .then(response => response.json())
            .then(response => getMetInfo(response))
            // api.forecast.weather

        async function getMetInfo(apii){

            apii.forecast.weather ? meteo = apii.forecast.weather : "Inconnu";
            api.data.city.name ? nameMpt = api.data.city.name : "Inconnu";
            api.data.iaqi.h.v ? hInfo = api.data.iaqi.h.v : "Inconnu";
            api.data.iaqi.no2.v ? no2Info = api.data.iaqi.no2.v : "Inconnu";
            // api.data.iaqi.o3.v ? o3Info = api.data.iaqi.o3.v : "Inconnu";
            api.data.iaqi.p.v ? pInfo = api.data.iaqi.p.v : "Inconnu";

            console.log(api.data.city.name, apii.forecast.weather)
            
            let iconImg = '/weather-icons-master/svg/wi-alien.svg'
            
            if(apii.forecast.weather === 3){
                iconImg = 'wi-cloud.svg'
            }

            if(apii.forecast.weather === 41){
                iconImg = 'weather-icons-master/svg/wi-day-hail.svg'
            }

            if(apii.forecast.weather === 101){
                iconImg = 'wi-day-storm-showers.svg'
            }

            if(apii.forecast.weather === 222){
                iconImg = 'wi-snow.svg'
            }

            let iconMeteo = L.icon({
                iconUrl: iconImg,
                shadowUrl: iconImg,
                iconSize: [38, 95], // size of the icon
                shadowSize: [50, 64], // size of the shadow
                iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor: [-3, -76]
            })

            popMeteo = L.marker([api.data.city.geo[0], api.data.city.geo[1]], {icon: iconMeteo}).addTo(map);

            InfoPopup = L.popup().setContent(`<strong>${nameMpt}</strong><br>h : ${hInfo}<br> no2 ; ${no2Info}<br>p : ${pInfo}<br> `)
            qualiteAir()

            async function qualiteAir(){
                // Fonction plus courte et simple a capter que de créer un circle a chaque fois, on change seulement sa couleur par une condition
                if(api.data.aqi < 50 ){
                    colors = 'green'
                }else if(api.data.aqi < 100 ){
                    colors = 'yellow'
                }else if(api.data.aqi < 150 ){
                    colors = 'orange'
                }else if(api.data.aqi >= 150 ){
                    colors = 'red'
                }

                L.circle([api.data.city.geo[0], api.data.city.geo[1]], {color: colors, fillColor: null, fillOpacity: 0.5, radius: 10000})
                    .bindPopup(InfoPopup).addTo(map)
                    .openPopup() //couleur Vert

                InfoPopup.addTo(airlayer) // Qualités de l'air
                popMeteo.addTo(Weatherlayer) // Météo
            }
        }
    } 
}

// Weatherlayer
let airlayerControl = L.control.layers().addTo(map)
airlayerControl.addBaseLayer(airlayer, "Airlayer");
airlayerControl.addBaseLayer(Weatherlayer, "WeatherMétéo");