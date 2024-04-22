
document.addEventListener('DOMContentLoaded', function() {
    const APIController = (function() {
        const id = '4dd98c178ff74d3a82dc42f537ad5736';
        const secret = '/*INSERT_CLIENT_SECRET_HERE*/';
        const testing = () => {
            const token = btoa(id + ':' + secret);
            console.log('id:', id);
            console.log('secret:', secret);
            console.log('test:', token);
        };

        return {
            testing
        };
    })();

    APIController.testing();
});
