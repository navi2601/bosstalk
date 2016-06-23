import {expect} from "chai";
import {optional} from "../server/utilities/optional";

describe("optional", () => {
    describe("some", () => {
        it("should have value", () => {
            expect(optional(42).hasValue).to.equal(true);
        });
    });
    
    describe("none", () => {
        it("should not have value", () => {
            expect(optional.none<string>().hasValue).to.equal(false);
        });
    });
    
    describe("map & flatMap", () => {
        it("should compose", () => {
            const x = optional(42);
            const y = optional(24);
            const z = x.flatMap(xx => y.map(yy => xx + yy));
            
            expect(z.hasValue).to.equal(true);
            expect(z.valueOrDefault(0)).to.equal(42 + 24);
        });
    });
});
