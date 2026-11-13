//variables for searching and displaying artists
const input = document.querySelector("#inputArtist");
const searchButton = document.querySelector("#searchButton");
const artistInfo = document.querySelector("#artistBio")
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
            `/.netlify/functions/myapi?method=artist.search&artist=${encodeURIComponent(artistName)}&limit=1`
        );
        if(!response.ok){
//Error if something goes wrong
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
//save the results in variable
        const artists = data.results.artistmatches.artist;
//empty seach returns not found
        if(artists.length === 0){
            artistInfo.textContent = "Not found. Try again.";
            return;
        }

        await getAlbum(artists[0].mbid, artists[0].name);
//looping through the artist to make a card for them that will display the name and a picture
        for (let i = 0; i < artists.length; i++){
//creating the name
            const artistCard = document.createElement("div");
            const artistName = document.createElement("h2");
            artistName.textContent = artists[i].name;

            artistCard.appendChild(artistName);

            const bioUrl = `/.netlify/functions/myapi?method=artist.getinfo&artist=${encodeURIComponent(artists[i].name)}`;

            const infoResponse = await fetch(bioUrl);
            const infoData = await infoResponse.json();
            console.log(infoData);

            const artistBio = document.createElement("p");
            if (infoData.artist && infoData.artist.bio) {
                    artistBio.textContent = infoData.artist.bio.summary.split("<a")[0];
            } else {
                artistBio.textContent = "No biography available.";
            }
            artistInfo.innerHTML = "";
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
            artistInfo.innerHTML = "";
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

//gtting the most famous album
async function getAlbum(mbid, artist) {
    const url = `/.netlify/functions/myapi?method=artist.gettopalbums&mbid=${encodeURIComponent(mbid)}&limit=3`;
    const albumList = document.querySelector("#albumList");
    albumList.innerHTML = "";
//error if cant fetch
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("Can't fetch the album data");
        }

        const data = await response.json();
        const albums = data.topalbums.album;

        if(albums.length === 0){
            albumList.textContent = "Couldn't find anything.";
            return;
        }
//creating the elements for album
        const album = albums[0];
        const albumCard = document.createElement("div");
        const albumName = document.createElement("h3");

        albumName.textContent = album.name;
//create the image
        const albumImg = document.createElement("img");
        albumImg.alt = album.name;
//find the image
        const imgUrl = await getAlbumCover(album.name, artist);
        if(imgUrl !== ""){
            albumImg.src = imgUrl;
        }
        else{
            albumImg.src = "https://placehold.co/200x200?text=No+Cover";
        }
//if cant find the image, we use a placeholder image
        albumImg.onerror = function() {
            albumImg.src = "https://placehold.co/200x200?text=No+Cover";
        };
//making it all vidible
        albumCard.appendChild(albumImg);
        albumCard.appendChild(albumName);
        albumList.innerHTML = "";
        albumList.appendChild(albumCard);
//calling the function to find the songs on the album
        getSongs(artist, album.name);

    }
    catch (error){
         console.log("Album error:", error.message);
        albumList.textContent = "Couldn't load any albums";
    }
}
//function to get the album cover
async function getAlbumCover(albumName,artistName) {
    const search = 'releasegroup:"' + albumName + '" AND artist:"' + artistName + '"';
    const url = 'https://musicbrainz.org/ws/2/release-group/?query=' + encodeURIComponent(search) + '&fmt=json&limit=1';
//error if cant find
    try{
        const response = await fetch(url);

        if(!response.ok){
            throw new Error("Couldn't find albums");
        }

        const data = await response.json();
        const albums = data["release-groups"];
        if(albums.length === 0){
            return "";
        }
        const albumId = albums[0].id;

        const coverUrl = 'https://coverartarchive.org/release-group/' + albumId + '/front-250';
        return coverUrl;
    } 
    catch(error){
        return "";
    }
}
//find songs on the album
async function getSongs(artist, albumName) {
    const url = `/.netlify/functions/myapi?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(albumName)}`;
    const songList = document.querySelector("#songList");

    songList.textContent = "";
//error if cant find
    try{
        const response = await fetch(url);

        if(!response.ok){
            throw new Error("Couldn't find any songs");
        }

        const data = await response.json();
//creating the elements and looping to display every song
        songList.innerHTML = "";
        const tracks = data.album.tracks.track;
        const trackList = document.createElement("ol");
        for(let i = 0; i < tracks.length; i++){

            const track = document.createElement("li");
            track.textContent = tracks[i].name;

            trackList.appendChild(track);
        }
//displaying the whole list on the page
        songList.appendChild(trackList);
    }
    catch(error){
        songList.textContent = "Couldn't find any songs";
    }
}
