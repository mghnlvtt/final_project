const API = (() => {
    const id = clientId;
    const secret = clientSecret;

    const getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(id + ':' + secret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        return data.access_token;
    };

    const album_data = async () => {
        const albums = document.querySelectorAll('.album');

        for (let i = 0; i < albums.length; i++) {
            const album = albums[i];
            const albumDetails = album.querySelector('p').textContent;
            const artist = encodeURIComponent(albumDetails.split("  ")[1].trim());
            const title = encodeURIComponent(albumDetails.split("  ")[0].trim());
            const view_btn = album.getElementsByClassName('open');
            const modal = album.getElementsByClassName('modal');
            const modal_content = album.getElementsByClassName('modal-content');
            const close = album.getElementsByClassName('close');
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

                    if (data.artists.some(artist => artist.name.toLowerCase() === albumDetails.split("  ")[1].trim().toLowerCase())) {
                        album_info = data;
                        console.log(album_info);
                        break;
                    }
                }
                // release_date, images[0].url
                function formatDuration(duration_ms) {
                    const totalSeconds = Math.floor(duration_ms / 1000);
                
                    const totalMinutes = Math.floor(totalSeconds / 60);
                
                    const remainingSeconds = totalSeconds % 60;
                
                    return `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                }
                if (album_info) {
                    for (let b = 0; b < view_btn.length; b++) {
                        (function(m) {
                            view_btn[b].addEventListener('click', function() {
                                for (let content = 0; content < modal_content.length; content++) {
                                    modal[m].style.display = "block";
                                    const modalContent = modal_content[content];
                
                                    // Clear existing content
                                    modalContent.innerHTML = '';
                
                                    // Create and append album banner
                                    const albumBanner = document.createElement('div');
                                    albumBanner.classList.add('album_banner');
                                    albumBanner.innerHTML = `
                                        <img src="${album_info.images[0].url}" alt="Album Cover">
                                        <p>${album_info.release_date}</p>
                                        <p>${album_info.artists[0].name}</p>
                                        <p>${album_info.name}</p>
                                    `;
                                    modalContent.appendChild(albumBanner);
                
                                    const trackListDiv = document.createElement('div');
                                    trackListDiv.classList.add('track-list');
                                    album_info.tracks.items.forEach(track => {
                                        const trackInfo = document.createElement('div');
                                        trackInfo.innerHTML = `
                                            <p>${track.track_number}</p>
                                            <p>${track.name}</p>
                                            <p>${track.explicit}</p>
                                            <p>${formatDuration(track.duration_ms)}</p>
                                            <p>Preview</p>
                                            <audio controls>
                                                <source src="${track.preview_url}" type="audio/mpeg">
                                                Your browser does not support the audio element.
                                            </audio>
                                            <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                                        `;
                                        trackListDiv.appendChild(trackInfo);
                                    });
                                    modalContent.appendChild(trackListDiv);
                                }
                
                                const testing = album.querySelector('p#testing');
                
                                for (let c = 0; c < close.length; c++) {
                                    close[c].addEventListener('click', function() {
                                        modal[m].style.display = "none";
                                    });
                                }
                            }, { passive: true });
                        })(b); 
                    }
                }
                
                
            }
        }
    };

    return {
        album_data: album_data
    };
})();

API.album_data();











//need to add to the list each time a song is found, add the class list to the html so it'll follow the format
// Display release date at the top along with name, cover, artist 
// show song, track number, duration, preview, release date, if its explicit, listed artists on the song

