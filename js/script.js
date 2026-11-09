//api key
const apiKey = "apikey";

//variables for searching and displaying artists
const input = document.querySelector("#inputArtist");
const searchButton = document.querySelector("#searchButton");
const artistInfo = document.querySelector("#artistInfo")
const singerLink = document.querySelectorAll(".singerLink");

//function to search for artist
async function searchArtist() {
    const artistName = input.value;
//returns could not be found it you leave the search empty
    if(artistName === ""){
        artistInfo.textContent = "Could not be found";
        return;
    }
    try{
//fetching the info
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json&limit=1`
        );
        if(!response.ok){
//Error if something goes wrong
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        artistInfo.innerHTML = "";
//save the results in variable
        const artists = data.results.artistmatches.artist;
//empty seach returns not found
        if(artists.length === 0){
            artistInfo.textContent = "Not found. Try again.";
            return;
        }
//looping through the artist to make a card for them that will display the name and a picture
        for (let i = 0; i < artists.length; i++){
//creating the name
            const artistCard = document.createElement("div");
            const artistName = document.createElement("h3");
            artistName.textContent = artists[i].name;

            artistCard.appendChild(artistName);

            const bioUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artists[i].name}&api_key=${apiKey}&format=json`;

            const infoResponse = await fetch(bioUrl);
            const infoData = await infoResponse.json();
            console.log(infoData);

            const artistBio = document.createElement("p");
            if (infoData.artist && infoData.artist.bio) {
                    artistBio.textContent = infoData.artist.bio.summary.split("<a")[0];
            } else {
                artistBio.textContent = "No biography available.";
            }

            artistCard.appendChild(artistBio);

//last.fm provides picture ids for the artist, that you can use to search for pictures using musicbrainz.

//MADE USING HELP BY AI

//saving the id
            const mbid = artists[i].mbid;
            if(mbid !== ""){
                const url = 'https://musicbrainz.org/ws/2/artist/' + mbid + '?inc=url-rels&fmt=json';
                const musicResponse = await fetch(url);

                if (!musicResponse.ok) {
                    throw new Error("Could not fetch MusicBrainz data");
                }

                const artistData = await musicResponse.json();
//searching for the picture at musicbrainz
                const imageRelation = artistData.relations.find(function(relation) {
                    return relation.type === "image" && relation.url.resource.includes("commons.wikimedia.org");
                });

// saving the picture in the variable
                if (imageRelation) {
                    const imageUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(imageRelation.url.resource.split('/wiki/')[1]) + '&prop=pageimages&format=json&pithumbsize=200&origin=*';
                    const imageResponse = await fetch(imageUrl);

                    if(imageResponse.ok){
                        const imageData = await imageResponse.json();
                        const pages = imageData.query.pages;
                        const pageId = Object.keys(pages)[0];

                        if (pages[pageId].thumbnail) {
                            const artistImage = document.createElement("img");
                            artistImage.src = pages[pageId].thumbnail.source;
                            artistImage.alt = artists[i].name;

                            artistCard.appendChild(artistImage);

                        }
                    }
                }
            }
//Displaying the artist card
            artistInfo.appendChild(artistCard);
        }
    }
 //--END OF AI CODE

    catch(error){
        const message = `Error fetching data: ${error.message}`;
        artistInfo.textContent = `Error: ${error.message}`;
    }
}

//Displaying the artist pictures when artist is clicked from the list
searchButton.addEventListener("click", searchArtist);

for(let i = 0; i < singerLink.length; i++){
    singerLink[i].addEventListener("click", function(event){
        event.preventDefault();
        input.value = singerLink[i].textContent;
        searchArtist();
    });
}