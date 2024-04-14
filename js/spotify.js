// // Initial API code source: https://github.com/awicks44/JavaScript-SpotifyAPI/blob/master/app.js
const APIController = (function(){
    const clientId = process.env.clientId; 
    const clientSecret = process.env.clientSecret; 
   
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
})();

APIController.album_data(); 