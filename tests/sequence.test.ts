import {expect} from "chai";
import seq from "../server/utilities/sequence";

describe("sequence", () => {
    describe("repeat", () => {
        it("should produce repetition", () => {
            const repeat = seq.repeat(42, 5).toArray();
            expect(repeat).to.deep.equal([42, 42, 42, 42, 42]);
        });
    });
});
