module.exports = {

    /**
     * @return {number}
     */
    IpToDec: function (dot) {
        let d = dot.split('.');
        return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
    },

    /**
     * @return {string}
     */
    DecToIp: function (num) {
        let d = num % 256;
        let i = 3;
        for (i = 3; i > 0; i -= 1) {
            num = Math.floor(num / 256);
            d = num % 256 + '.' + d;
        }
        return d;
    }
}