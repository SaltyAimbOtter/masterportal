import sinon from "sinon";
import {expect} from "chai";
import {createLayersArray, tick} from "./helpers/functions";
import actions from "../../../store/actionsBufferAnalysis";
import stateBufferAnalysis from "../../../store/stateBufferAnalysis";
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

describe("src/modules/tools/draw/store/actionsDraw.js", () => {
    let commit, dispatch, rootGetters, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.stub().resolves(true);
        rootGetters = sinon.stub();
        state = {...stateBufferAnalysis};
    });

    afterEach(sinon.restore);

    describe("initJSTSParser", () => {
        it("initializes the JSTS parser by injecting open layer geometries ", () => {
            const inject = sinon.spy();

            actions.initJSTSParser({getters: {jstsParser: {inject: inject}}});
            expect(inject.calledOnce).to.be.true;

            expect(inject.args[0]).to.eql([Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon]);
        });
    });
    describe("loadSelectOptions", () => {
        it("loads a number of layers as select options and commits them", () => {

            const source = {getFeatures: ()=>[]},
                layers = createLayersArray(3);

            layers.forEach((layer, index) => {
                layers[index].get = key => key === "layerSource" ? source : null;
            });

            sinon.stub(Radio, "request").returns(layers);
            actions.loadSelectOptions({commit});

            expect(commit.calledThrice).to.be.true;
            expect(commit.args[0][0]).to.equal("addSelectOption");
            expect(commit.args[0][1]).to.equal(layers[0]);
            expect(commit.args[1][0]).to.equal("addSelectOption");
            expect(commit.args[1][1]).to.equal(layers[1]);
            expect(commit.args[2][0]).to.equal("addSelectOption");
            expect(commit.args[2][1]).to.equal(layers[2]);
        });
    });
    describe("applySelectedSourceLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            const layer = createLayersArray(1)[0];

            actions.applySelectedSourceLayer({commit, dispatch, getters: state}, layer);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setSelectedSourceLayer");
            expect(commit.args[0][1]).to.equal(layer);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("areLayerFeaturesLoaded");
        });
    });
    describe("applySelectedSourceLayer", () => {
        it("throws an error if a layerId is not found", () => {
            expect(() => actions.applySelectedSourceLayer({commit, dispatch, getters: state}, "1234")).to.throw();
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            const layer = createLayersArray(1)[0];

            actions.applySelectedTargetLayer({commit, getters: state, dispatch}, layer);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setSelectedTargetLayer");
            expect(commit.args[0][1]).to.equal(layer);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("checkIntersection");
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("throws an error if a layerId is not found", () => {
            expect(() => actions.applySelectedTargetLayer({commit, dispatch, getters: state}, "1234")).to.throw();
        });
    });
    describe("applyBufferRadius", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            actions.applyBufferRadius({commit, dispatch}, 1000);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setBufferRadius");
            expect(commit.args[0][1]).to.equal(1000);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("removeGeneratedLayers");
            expect(dispatch.args[1][0]).to.equal("showBuffer");
        });
    });
    describe("checkIntersection", () => {
        it("calls dispatch five times with correct parameters and selectedTargetLayer.get() once", async () => {
            state.selectedTargetLayer = {...createLayersArray(1)[0], get: sinon.spy()};
            state.bufferLayer = {...createLayersArray(1)[0], getSource: ()=> ({getFeatures: ()=>({})})};
            actions.checkIntersection({getters: state, dispatch});

            await tick();
            expect(dispatch.callCount).to.equal(5);
            expect(state.selectedTargetLayer.get.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("areLayerFeaturesLoaded");
            expect(dispatch.args[1][0]).to.equal("checkIntersectionWithBuffers");
            expect(dispatch.args[2][0]).to.equal("checkIntersectionsWithIntersections");
            expect(dispatch.args[3][0]).to.equal("convertIntersectionsToPolygons");
            expect(dispatch.args[4][0]).to.equal("addNewFeaturesToMap");
        });
    });
    describe("showBuffer", () => {
        it("calls commit and addLayer once each", async () => {
            rootGetters["Map/map"] = {addLayer: sinon.spy()};
            state.selectedSourceLayer = {...createLayersArray(1)[0], get: ()=> ({getFeatures: ()=>[]})};
            actions.showBuffer({commit, getters: state, dispatch, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(rootGetters["Map/map"].addLayer.callCount).to.equal(1);
        });
    });
    describe("removeGeneratedLayers", () => {
        it("calls commit four times and removeLayer twice", async () => {
            rootGetters["Map/map"] = {removeLayer: sinon.spy()};
            state.resultLayer = createLayersArray(1)[0];
            state.bufferLayer = createLayersArray(1)[0];
            actions.removeGeneratedLayers({commit, getters: state, rootGetters});

            expect(commit.callCount).to.equal(4);
            expect(rootGetters["Map/map"].removeLayer.calledTwice).to.be.true;
        });
    });
    describe("resetModule", () => {
        it("calls dispatch three times and commit once", async () => {
            actions.resetModule({commit, getters: state, dispatch});

            expect(dispatch.callCount).to.equal(3);
            expect(commit.calledOnce).to.be.true;
        });
    });
});
