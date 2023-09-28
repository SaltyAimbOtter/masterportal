import {expect} from "chai";
import FeatureHandler from "../../../utils/handleFeatures";
import Feature from "ol/Feature";

describe("/src/modules/tools/statisticDashboard/utils/handleFeatures.js", () => {
    describe("calcStepValues", () => {
        it("should return an array with one 0 element, when the given params are not the expected", () => {
            const expected = [0];

            expect(FeatureHandler.calcStepValues(undefined, 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues("string", 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues({}, 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues([], 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(true, 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(false, 1000, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(null, 1000, 5)).to.be.deep.equals(expected);

            expect(FeatureHandler.calcStepValues(100, undefined, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, "string", 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, {}, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, [], 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, true, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, false, 5)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, null, 5)).to.be.deep.equals(expected);

            expect(FeatureHandler.calcStepValues(100, 1000, "string")).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, {})).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, [])).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, true)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, false)).to.be.deep.equals(expected);

            expect(FeatureHandler.calcStepValues(100, 1000, 0)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, 1)).to.be.deep.equals(expected);
        });
        it("should return expected array", () => {
            const expected = [100, 325, 550, 775, 1000];

            expect(FeatureHandler.calcStepValues(100, 1000, undefined)).to.be.deep.equals(expected);
            expect(FeatureHandler.calcStepValues(100, 1000, 4).length).to.be.deep.equals(4);
            expect(FeatureHandler.calcStepValues(100, 1000, 5)).to.be.deep.equals(expected);
        });
    });
    describe("closestIndex", () => {
        it("should return -1, when the given params are not the expected", () => {
            expect(FeatureHandler.closestIndex("string", 100)).to.be.equal(-1);
            expect(FeatureHandler.closestIndex({}, 100)).to.be.equal(-1);
            expect(FeatureHandler.closestIndex(true, 100)).to.be.equal(-1);
            expect(FeatureHandler.closestIndex(false, 100)).to.be.equal(-1);

            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], "string")).to.be.equal(-1);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], {})).to.be.equal(-1);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], [])).to.be.equal(-1);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], true)).to.be.equal(-1);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], false)).to.be.equal(-1);
        });
        it("should return expected index", () => {
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], 70)).to.be.equal(0);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], 310)).to.be.equal(2);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], 430)).to.be.equal(3);
            expect(FeatureHandler.closestIndex([100, 200, 300, 400, 500], 770)).to.be.equal(4);
        });
    });
    describe("styleFeaturesByStatistic", () => {
        it("should set the styles correctly according to the values from the features", () => {
            const feature1 = new Feature(),
                feature2 = new Feature(),
                feature3 = new Feature(),
                colorScheme = [[198, 219, 239, 0.9], [158, 202, 225, 0.9], [107, 174, 214, 0.9], [49, 130, 189, 0.9], [8, 81, 156, 0.9]],
                fill1 = {
                    color_: [198, 219, 239, 0.9]
                },
                fill2 = {
                    color_: [107, 174, 214, 0.9]
                },
                fill3 = {
                    color_: [8, 81, 156, 0.9]
                },
                stroke = {
                    color_: [166, 166, 166, 1],
                    lineCap_: undefined,
                    lineDash_: null,
                    lineDashOffset_: undefined,
                    lineJoin_: undefined,
                    miterLimit_: undefined,
                    width_: 0.5
                };

            feature1.set("bruttoinlandsprodukt_mio_jahressumme", 3000);
            feature2.set("bruttoinlandsprodukt_mio_jahressumme", 4000);
            feature3.set("bruttoinlandsprodukt_mio_jahressumme", 5000);

            FeatureHandler.styleFeaturesByStatistic([feature1, feature2, feature3], "bruttoinlandsprodukt_mio_jahressumme", colorScheme);

            expect(feature1.getStyle()(feature1).getStroke()).to.be.deep.equals(stroke);
            expect(feature2.getStyle()(feature2).getStroke()).to.be.deep.equals(stroke);
            expect(feature3.getStyle()(feature3).getStroke()).to.be.deep.equals(stroke);

            expect(feature1.getStyle()(feature1).getFill()).to.be.deep.equals(fill1);
            expect(feature2.getStyle()(feature2).getFill()).to.be.deep.equals(fill2);
            expect(feature3.getStyle()(feature3).getFill()).to.be.deep.equals(fill3);
        });
    });
});