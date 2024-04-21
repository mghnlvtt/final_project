// // Initial API code source: https://github.com/awicks44/JavaScript-SpotifyAPI/blob/master/app.js
const APIController = (function(){
    const id = secrets.clientId; 
    const secret = secrets.clientSecret; 
    const getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers:{
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        return data.access_token;
    };



    const covers = async () => {
        const albums = document.querySelectorAll('.albumpage');
        for (let i = 0; i < albums.length; i++) {
            const album = albums[i];
            const album_details = album.querySelector('p').textContent;
            const artist = encodeURIComponent(album_details.split("  ")[1].trim());
            const title = encodeURIComponent(album_details.split("  ")[0].trim());
            const token = await getToken();
            const search = await fetch(`https://api.spotify.com/v1/search?q="${title} ${artist}"&type=album&limit=2`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const results = await search.json();
            if (results.albums && results.albums.items.length > 0) {
                let album_info;
                for (let l = 0; l < results.albums.items.length; l++) {
                    const album_id = results.albums.items[l].id;
                    const data_from_album = await fetch(`https://api.spotify.com/v1/albums/${album_id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    const data = await data_from_album.json();
                    if (data.artists.some(artist => artist.name.toLowerCase() === album_details.split("  ")[1].trim().toLowerCase())) {
                        album_info = data;
                        break; 
                    }
                }
                if (album_info) {
                    const cover_link = album_info.images && album_info.images.length > 0 ? album_info.images[0].url : null;
                    const cover_art = album.querySelector('img#cover_art');
                    if (cover_art && cover_link) {
                        cover_art.src = cover_link;
                    }
            }
        }
    };
}   
       return {
        covers: covers
    };
})();

APIController.covers(); 
