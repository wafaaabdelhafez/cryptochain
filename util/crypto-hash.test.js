const cryptoHash = require('../util/crypto-hash');

describe('cryptoHash()', () => {
    it('generates a SHA-256 hashes output', () => {
        expect(cryptoHash('foo'))
            .toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three'))
            .toEqual(cryptoHash('three', 'one', 'two'));
    });

    it('produces a new hash when the property have changed on an input', () => {
        const foo = {};
        const originalHsh = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHsh);
    });

});