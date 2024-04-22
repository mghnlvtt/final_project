document.addEventListener('DOMContentLoaded', function() {
    const API = (() => {
        const id = '/*INSERTID*/';
        const secret = '/*INSERTSECRET*/';

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

        const format_duration = (duration_ms) => {
            const seconds = Math.floor(duration_ms / 1000);
            const mins = Math.floor(seconds / 60);
            const xtra = seconds % 60;
            return `${mins}:${xtra.toString().padStart(2, '0')}`;
        };

        const format_date = (datestr) => {
            const [year, month, day] = datestr.split('-');
            return `${month}/${day}/${year}`;
        };

        const album_data = async () => {
            const albums = document.querySelectorAll('.albumpage');

            for (let i = 0; i < albums.length; i++) {
                const album = albums[i];
                const album_details = album.querySelector('p').textContent;
                const artist = encodeURIComponent(album_details.split("  ")[1].trim());
                const title = encodeURIComponent(album_details.split("  ")[0].trim());
                const view_button = album.querySelector('.open');
                const modal = album.querySelector('.modal');
                const modal_content = album.querySelector('.modal-content');
                
                const token = await getToken();
                const search = await fetch(`https://api.spotify.com/v1/search?q="${title} ${artist}"&type=album&limit=2`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const results = await search.json();

                let album_info;

                if (results.albums && results.albums.items.length > 0) {
                    for (let l = 0; l < results.albums.items.length; l++) {
                        const album_id = results.albums.items[l].id;
                        const data_from_album = await fetch(`https://api.spotify.com/v1/albums/${album_id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        const data = await data_from_album.json();

                        if (data.artists.some(artist => artist.name.toLowerCase() === album_details.split("  ")[1].trim().toLowerCase())) {
                            album_info = data;
                            break;
                        }
                    }
                }
                console.log(album_info)
                if (album_info) {
                    view_button.addEventListener('click', function() {
                        console.log('View button clicked');
                        modal.style.display = 'block';  

                        console.log('Modal display set to:', modal.style.display);
                        
                        modal_content.innerHTML = '';
                        modal_content.innerHTML = '<span class="close" tabindex="0">×</span>';
                        
                        const close = modal.querySelector('.close');
                        close.addEventListener('click', function() {
                            console.log('Close button clicked');
                            modal.style.display = 'none';
                        });

                        window.addEventListener('click', function(event) {
                            if (event.target == modal) {
                                console.log('Window clicked outside modal content');
                                modal.style.display = 'none';
                            }
                        });

                        const banner = document.createElement('div');
                        banner.classList.add('album_banner');
                        banner.innerHTML = `
                            <div class="col1">
                                <img src="${album_info.images[0].url}" alt="${album.querySelector('img').alt}">
                            </div>
                            <div class="col2">
                                <div class="row1">
                                    <p>${album_info.name}</p>
                                </div>
                                <div class="row2">
                                    <p>${album_info.artists[0].name}</p>
                                </div>
                                <div class="row3">
                                    <p>${format_date(album_info.release_date)}</p>
                                </div>
                            </div>
                        `;
                        modal_content.appendChild(banner);

                        const tracklist = document.createElement('div');
                        tracklist.classList.add('track-list');
                        
                        let disc_default = 1;
                        let discs = false;

                        album_info.tracks.items.forEach((track, index) => {
                            if (track.disc_number !== disc_default) {
                                discs = true;
                                disc_default = track.disc_number;
                                const disc_num = document.createElement('div');
                                disc_num.classList.add('disc-heading');
                                disc_num.innerHTML = `<img class = 'disk' alt= "small disc icon" src="images/disk.png"> <p>Disc ${disc_default}</p>`;
                                tracklist.appendChild(disc_num);
                            }

                            const track_data = document.createElement('div');
                            const explicit_e = track.explicit ? 'E' : '';
                            track_data.innerHTML = `
                                <div class="track">
                                    <p class="track_num">${track.track_number}</p>
                                    <p class="track_name">${track.name} <br><span class="artist">${track.artists.map(artist => artist.name).join(', ')}</span></p>
                                    <p class="explicit">${explicit_e}</p>
                                    <p class="duration">${format_duration(track.duration_ms)}</p>
                                    <div class="audio-player">
                                        ${track.preview_url ? `
                                            <button class="playbutton">
                                                <img src="images/play.png" alt="Play button" class="play_img">
                                            </button>
                                            <audio class="audio_player" src="${track.preview_url}" type="audio/mpeg">
                                                Your browser does not support the audio element.
                                            </audio>` : `
                                            <div class="no-preview"></div>`}
                                    </div>
                                </div>
                            `;
                            tracklist.appendChild(track_data);
                            
                            if (track.preview_url) {
                                console.log(track.preview_url)
                                const playbutton = track_data.querySelector('.playbutton');
                                playbutton.addEventListener('click', function() {
                                    const audio_player = track_data.querySelector('.audio_player');
                                    const play_img = playbutton.querySelector('img');
                                    const paused_true = audio_player.paused;
                                    const playbutton_img = paused_true ? 'images/pause.png' : 'images/play.png';

                                    if (paused_true) {
                                        audio_player.play();
                                    } else {
                                        audio_player.pause();
                                    }
                                    play_img.src = playbutton_img;
                                });
                            }
                        });

                        if (discs) {
                            const more_discs = document.createElement('div');
                            more_discs.classList.add('multiple-discs-info');
                            more_discs.innerHTML = ``;

                            const first_disc = document.createElement('div');
                            first_disc.classList.add('disc-heading');
                            first_disc.innerHTML = `<img class = 'disk' src="images/disk.png"> <p>Disc 1</p>`;
                            tracklist.insertBefore(first_disc, tracklist.firstChild);

                            if (modal_content.contains(tracklist)) {
                                modal_content.insertBefore(more_discs, tracklist);
                            } else {
                                modal_content.appendChild(more_discs);
                            }
                        }

                        modal_content.appendChild(tracklist);
                    });
                }
            }
        };

        return {
            album_data: album_data
        };
    })();

    API.album_data();
});
