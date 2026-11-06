//api key
const apiKey = "";

//variables for searching and displaying artists
const input = document.querySelector("#inputArtist");
const searchButton = document.querySelector("#searchButton");
const artistList = document.querySelector("#artistList")

//function to search for artist
async function searchArtist() {
    artistList.textContent = "Loading artists...";

    const artistName = input.value;
//returns could not be found it you leave the search empty
    if(artistName === ""){
        artistList.textContent = "Could not be found";
        return;
    }
    try{
        //fetching the info
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json&limit=6`
        );
        if(!response.ok){
        //Error if something goes wrong
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        artistList.innerHTML = "";
//save the results in variable
        const artists = data.results.artistmatches.artist;
//empty seach returns not found
        if(artists.length === 0){
            artistList.textContent = "Not found. Try again.";
            return;
        }
//looping through the artist to make a card for them that will display the name (max 6 artist set as a limit in the link)
        for (let i = 0; i < artists.length; i++){
            const artistCard = document.createElement("div");

            const artistName = document.createElement("h3");
            artistName.textContent = artists[i].name;

            artistCard.appendChild(artistName);
            artistList.appendChild(artistCard);
        }
    }
    catch(error){
        const message = `Error fetching data: ${error.message}`;
        artistList.textContent = `Error: ${error.message}`;
    }
}

searchButton.addEventListener("click", searchArtist);