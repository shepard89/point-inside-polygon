const Module = require('../index');
const polygon = 'POLYGON ((10 10, 10 20, 20 20, 20 10))';
const expect = require('chai').expect;

describe('polygonHasPointInside', function() {
    it('Instance should return Error with non-WKT string input',function() {
        let instance = Module('POINT (15d 15)', polygon);
        expect(instance).to.be.an('error');
    });

    it('Instance should return true with point inside polygon [1]', function() {
        let instance = Module('POINT (12 19)', polygon);
        expect(instance).to.be.true;
    });

    it('Instance should return true with point inside polygon [2]', function() {
        let instance = Module('POINT (15 15)', polygon);
        expect(instance).to.be.true;
    });

    it('Instance should return true with point inside polygon [2]', function() {
        let instance = Module('POINT (15 19)', polygon);
        expect(instance).to.be.true;
    });

    it('Instance should return false with point outside polygon [1]', function() {
        let instance = Module('POINT (0 19)', polygon);
        expect(instance).to.be.false;
    });

    it('Instance should return false with point outside polygon [2]', function() {
        let instance = Module('POINT (15 22)', polygon);
        expect(instance).to.be.false;
    });

    it('Instance should return false with point outside polygon [2]', function() {
        let instance = Module('POINT (300 500)', polygon);
        expect(instance).to.be.false;
    });
});
