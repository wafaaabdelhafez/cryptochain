const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
    it('generates a SHA-256 hashes output', () => {
        expect(cryptoHash('BockChain'))
            .toEqual('c995f15773230e504146e45b6087ce8b961e3b433eaa1665a92447b309482945');
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three'))
            .toEqual(cryptoHash('three', 'one', 'two'));
    });

});