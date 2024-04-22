document.addEventListener('DOMContentLoaded', function() {
    const APIController = (function() {
        const id = '/*INSERT_CLIENT_ID_HERE*/';
        const secret = '/*INSERT_CLIENT_SECRET_HERE*/';
        const testing = () => {
            const tok = btoa(id + ':' + secret);
            console.log('test:', tok);
        };

        return {
            testing
        };
    })();

    APIController.testing();
});
