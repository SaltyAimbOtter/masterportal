import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import openlayerFunctions from "../../../utils/openlayerFunctions.js";
import getIconListFromLegend from "../../../utils/getIconListFromLegend.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import SnippetDropdown from "../../../components/SnippetDropdown.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filter/components/SnippetDropdown.vue", () => {
    let defaultWrapper;

    beforeEach(() => {
        defaultWrapper = shallowMount(SnippetDropdown, {
            localVue
        });
    });
    afterEach(() => {
        defaultWrapper.destroy();
    });

    describe("constructor", () => {
        it("should have correct default values", () => {
            expect(defaultWrapper.vm.api).to.be.null;
            expect(defaultWrapper.vm.attrName).to.equal("");
            expect(defaultWrapper.vm.addSelectAll).to.be.false;
            expect(defaultWrapper.vm.adjustment).to.be.false;
            expect(defaultWrapper.vm.autoInit).to.be.true;
            expect(defaultWrapper.vm.localeCompareParams).to.be.undefined;
            expect(defaultWrapper.vm.delimiter).to.be.undefined;
            expect(defaultWrapper.vm.disabled).to.be.false;
            expect(defaultWrapper.vm.display).to.equal("default");
            expect(defaultWrapper.vm.filterId).to.equal(0);
            expect(defaultWrapper.vm.info).to.be.false;
            expect(defaultWrapper.vm.isChild).to.be.false;
            expect(defaultWrapper.vm.isParent).to.be.false;
            expect(defaultWrapper.vm.title).to.be.true;
            expect(defaultWrapper.vm.layerId).to.be.undefined;
            expect(defaultWrapper.vm.multiselect).to.be.false;
            expect(defaultWrapper.vm.operator).to.be.undefined;
            expect(defaultWrapper.vm.optionsLimit).to.be.equal(20000);
            expect(defaultWrapper.vm.placeholder).to.equal("");
            expect(defaultWrapper.vm.prechecked).to.be.undefined;
            expect(defaultWrapper.vm.renderIcons).to.be.undefined;
            expect(defaultWrapper.vm.fixedRules).to.be.an("array").that.is.empty;
            expect(defaultWrapper.vm.snippetId).to.equal(0);
            expect(defaultWrapper.vm.value).to.be.undefined;
            expect(defaultWrapper.vm.visible).to.be.true;
        });
        it("should render correctly with default values", () => {
            expect(defaultWrapper.find(".filter-select-box-container").exists()).to.be.true;
        });
        it("should render hidden if visible is false", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    visible: false
                },
                localVue
            });

            expect(wrapper.find(".snippetDropdownContainer").element.style._values.display).to.be.equal("none");
            wrapper.destroy();
        });
        it("should render but also be disabled", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    disabled: true
                },
                localVue
            });

            expect(wrapper.find(".filter-select-box-container").exists()).to.be.true;
            expect(wrapper.vm.disabled).to.be.true;
            wrapper.destroy();
        });
        it("should render with a title if the title is a string", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    title: "foobar"
                },
                localVue
            });

            expect(wrapper.find(".select-box-label").text()).to.be.equal("foobar");
            wrapper.destroy();
        });
        it("should render without a title if title is a boolean and false", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    title: false
                },
                localVue
            });

            expect(wrapper.find(".select-box-label").exists()).to.be.false;
            wrapper.destroy();
        });
        it("should have an empty list if autoInit is false and the api may be set", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    api: {},
                    autoInit: false
                },
                localVue
            });

            expect(wrapper.vm.dropdownValue).to.be.an("array").and.to.be.empty;
            wrapper.destroy();
        });
        it("should not use the given operator if an invalid operator is given", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    operator: "operator"
                },
                localVue
            });

            expect(wrapper.vm.securedOperator).to.not.be.equal("operator");
            wrapper.destroy();
        });
        it("should be possible to select everything via 'select all' if addSelectAll is true", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                    propsData: {
                        display: "list",
                        addSelectAll: true,
                        multiselect: true
                    },
                    localVue
                }),
                click = wrapper.find(".snippetListContainer").find(".grid-container").findAll(".grid-item").at(1).find("a");

            await wrapper.setData({
                dropdownValue: ["Altona", "Eimsbüttel", "Bergedorf"]
            });

            click.trigger("click");

            expect(click.text()).to.equal("modules.tools.filter.dropdown.selectAll");
            expect(wrapper.vm.dropdownSelected).to.deep.equal(["Altona", "Eimsbüttel", "Bergedorf"]);
            wrapper.destroy();
        });
        it("should only set the dropdown values based on the given values", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    value: ["Altona", "Eimsbüttel", "Bergedorf"]
                },
                localVue
            });

            expect(wrapper.vm.dropdownValue).to.deep.equal(["Altona", "Eimsbüttel", "Bergedorf"]);
            wrapper.destroy();
        });
    });

    describe("emitCurrentRule", () => {
        it("should emit changeRule function with the expected values", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "EQ",
                    delimiter: "|"
                },
                localVue
            });

            wrapper.vm.emitCurrentRule("value", "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operator: "EQ",
                delimiter: "|",
                value: "value"
            });
            wrapper.destroy();
        });
        it("should emit changeRule function with the expected values when values are objects", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    snippetId: 1234,
                    visible: false,
                    attrName: "attrName",
                    operator: "EQ",
                    delimiter: "|"
                },
                localVue
            });

            wrapper.vm.emitCurrentRule([
                {
                    title: "value",
                    img: "img",
                    desc: "desc"
                }
            ], "startup");
            expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                snippetId: 1234,
                startup: "startup",
                fixed: true,
                attrName: "attrName",
                operator: "EQ",
                delimiter: "|",
                value: ["value"]
            });
            wrapper.destroy();
        });
    });

    describe("deleteCurrentRule", () => {
        it("should emit deleteRule function with its snippetId", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    snippetId: 1234
                },
                localVue
            });

            wrapper.vm.deleteCurrentRule();
            expect(wrapper.emitted("deleteRule")).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
            expect(wrapper.emitted("deleteRule")[0][0]).to.equal(1234);
            wrapper.destroy();
        });
    });

    describe("resetSnippet", () => {
        it("should reset the snippet value and call the given onsuccess handler", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    value: ["value"],
                    prechecked: ["value"]
                },
                localVue
            });
            let called = false;

            expect(wrapper.vm.dropdownSelected).to.deep.equal(["value"]);
            await wrapper.vm.resetSnippet(() => {
                called = true;
            });
            expect(wrapper.vm.dropdownSelected).to.deep.equal([]);
            expect(called).to.be.true;
            wrapper.destroy();
        });
    });

    describe("setCurrentSource", () => {
        it("should not set the current source if anything but a string is given", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {},
                localVue
            });

            wrapper.vm.setCurrentSource({});
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource([]);
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource(undefined);
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource(true);
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource(false);
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource(1234);
            expect(wrapper.vm.source).to.be.equal("");
            wrapper.vm.setCurrentSource(null);
            expect(wrapper.vm.source).to.be.equal("");
        });
        it("should set the current source", () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {},
                localVue
            });

            wrapper.vm.setCurrentSource("test");
            expect(wrapper.vm.source).to.be.equal("test");
        });
    });

    describe("display list", () => {
        it("should render a list with radio", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    "type": "dropdown",
                    "attrName": "kapitelbezeichnung",
                    "display": "list",
                    "multiselect": false,
                    "value": ["yek", "do"]
                },
                localVue
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".snippetListContainer").exists()).to.be.true;
            expect(wrapper.find(".snippetListContainer .radio").exists()).to.be.true;

            wrapper.destroy();
        });
        it("should render a list with checkbox", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    "type": "dropdown",
                    "attrName": "kapitelbezeichnung",
                    "display": "list",
                    "multiselect": true,
                    "value": ["yek", "do"]
                },
                localVue
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".snippetListContainer").exists()).to.be.true;
            expect(wrapper.find(".snippetListContainer .checkbox").exists()).to.be.true;

            wrapper.destroy();
        });
        it("should set the current source to 'dropdown' if clicked on a entry", async () => {
            const wrapper = shallowMount(SnippetDropdown, {
                propsData: {
                    "type": "dropdown",
                    "attrName": "kapitelbezeichnung",
                    "display": "list",
                    "multiselect": true,
                    "value": ["yek", "do"]
                },
                localVue
            });

            await wrapper.vm.$nextTick();
            wrapper.vm.source = "adjust";
            wrapper.findAll(".checkbox").at(0).trigger("click");
            expect(wrapper.vm.source).to.be.equal("dropdown");
        });
    });

    describe("methods", () => {
        describe("initializeIcons", () => {
            let layer, typ, visible, setOpacitySpy, setVisibleSpy, onceSpy, returnLegendByStyleIdSpy;

            beforeEach(() => {
                mapCollection.clear();
                const map = {
                    id: "ol",
                    mode: "2D",
                    getLayers: () => {
                        return {
                            getArray: () => []
                        };
                    },
                    addLayer: sinon.spy()
                };

                mapCollection.addMap(map, "2D");
                typ = "WFS";
                visible = false;
                setOpacitySpy = sinon.spy();
                setVisibleSpy = sinon.spy();
                onceSpy = sinon.spy();
                layer = {
                    get: (key) => {
                        if (key === "layer") {
                            return {
                                getVisible: () => visible,
                                setOpacity: setOpacitySpy,
                                setVisible: setVisibleSpy,
                                getSource: () => {
                                    return {
                                        once: onceSpy
                                    };
                                }
                            };
                        }
                        if (key === "typ") {
                            return typ;
                        }
                        if (key === "styleId") {
                            return "styleId";
                        }
                        return null;
                    }
                };
                sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(layer);
                sinon.stub(getIconListFromLegend, "getStyleModel").returns({});
                returnLegendByStyleIdSpy = sinon.spy(createStyle, "returnLegendByStyleId");

            });
            afterEach(() => {
                defaultWrapper.destroy();
                sinon.restore();
            });
            it("initializeIcons with not visible WFS layer", () => {
                defaultWrapper = shallowMount(SnippetDropdown, {
                    localVue,
                    propsData: {
                        renderIcons: "fromLegend"
                    }
                });
                expect(setOpacitySpy.calledOnce).to.be.true;
                expect(setOpacitySpy.firstCall.args[0]).to.be.equals(0);
                expect(setVisibleSpy.calledOnce).to.be.true;
                expect(setVisibleSpy.firstCall.args[0]).to.be.true;
                expect(onceSpy.calledOnce).to.be.true;
                expect(returnLegendByStyleIdSpy.notCalled).to.be.true;
            });
            it("initializeIcons with not visible OAF layer", () => {
                typ = "OAF";
                defaultWrapper = shallowMount(SnippetDropdown, {
                    localVue,
                    propsData: {
                        renderIcons: "fromLegend"
                    }
                });
                expect(setOpacitySpy.calledOnce).to.be.true;
                expect(setOpacitySpy.firstCall.args[0]).to.be.equals(0);
                expect(setVisibleSpy.calledOnce).to.be.true;
                expect(setVisibleSpy.firstCall.args[0]).to.be.true;
                expect(onceSpy.calledOnce).to.be.true;
                expect(returnLegendByStyleIdSpy.notCalled).to.be.true;
            });
            it("initializeIcons with not visible GeoJSON layer", () => {
                typ = "GeoJSON";
                defaultWrapper = shallowMount(SnippetDropdown, {
                    localVue,
                    propsData: {
                        renderIcons: "fromLegend"
                    }
                });
                expect(setOpacitySpy.calledOnce).to.be.true;
                expect(setOpacitySpy.firstCall.args[0]).to.be.equals(0);
                expect(setVisibleSpy.calledOnce).to.be.true;
                expect(setVisibleSpy.firstCall.args[0]).to.be.true;
                expect(onceSpy.calledOnce).to.be.true;
                expect(returnLegendByStyleIdSpy.notCalled).to.be.true;
            });
            it("initializeIcons with visible WFS layer", () => {
                visible = true;
                defaultWrapper = shallowMount(SnippetDropdown, {
                    localVue,
                    propsData: {
                        renderIcons: "fromLegend",
                        layerId: "layerId"
                    }
                });
                expect(setOpacitySpy.notCalled).to.be.true;
                expect(setVisibleSpy.notCalled).to.be.true;
                expect(onceSpy.notCalled).to.be.true;
                expect(returnLegendByStyleIdSpy.calledOnce).to.be.true;
                expect(returnLegendByStyleIdSpy.firstCall.args[0]).to.be.equals("layerId");
            });
            it("initializeIcons with not visible WMS-layer", () => {
                visible = false;
                typ = "WMS";
                defaultWrapper = shallowMount(SnippetDropdown, {
                    localVue,
                    propsData: {
                        renderIcons: "fromLegend",
                        layerId: "layerId"
                    }
                });
                expect(setOpacitySpy.notCalled).to.be.true;
                expect(setVisibleSpy.notCalled).to.be.true;
                expect(onceSpy.notCalled).to.be.true;
                expect(returnLegendByStyleIdSpy.calledOnce).to.be.true;
                expect(returnLegendByStyleIdSpy.firstCall.args[0]).to.be.equals("layerId");
            });
        });
        describe("getPrecheckedExistingInValue", () => {
            it("should return false if anything but an array is given as first parameter", () => {
                expect(defaultWrapper.vm.getPrecheckedExistingInValue(undefined)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue(null)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue(1234)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue("string")).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue(true)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue(false)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue({})).to.be.false;
            });
            it("should return false if anything but an array is given as second parameter", () => {
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], undefined)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], null)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], 1234)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], "string")).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], true)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], false)).to.be.false;
                expect(defaultWrapper.vm.getPrecheckedExistingInValue([], {})).to.be.false;
            });
            it("should return entries of prechecked only if exists in dropdownValue", () => {
                const prechecked = ["yes", "no"],
                    dropdownValue = ["yes", "maybe"],
                    expected = ["yes"];

                expect(defaultWrapper.vm.getPrecheckedExistingInValue(prechecked, dropdownValue)).to.deep.equal(expected);
            });
        });
        describe("getInitialDropdownSelected", () => {
            it("should return an empty array if dropdownValue is not an array", () => {
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", undefined)).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", null)).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", 1234)).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", "string")).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", true)).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", false)).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("prechecked", {})).to.be.an("array").that.is.empty;
            });
            it("should return prechecked if prechecked is an array", () => {
                expect(defaultWrapper.vm.getInitialDropdownSelected(["prechecked"], ["prechecked"])).to.deep.equal(["prechecked"]);
            });
            it("should return dropdownValue if prechecked is 'all' and multiselect is set", () => {
                expect(defaultWrapper.vm.getInitialDropdownSelected("all", ["prechecked"], true)).to.deep.equal(["prechecked"]);
            });
            it("should return an empty array if prechecked is 'all' and multiselect is not set", () => {
                expect(defaultWrapper.vm.getInitialDropdownSelected("all", ["prechecked"], false)).to.be.an("array").that.is.empty;
            });
            it("should return an empty array if prechecked is neither 'all' nor an array", () => {
                expect(defaultWrapper.vm.getInitialDropdownSelected(undefined, [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected(null, [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected(1234, [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected("string", [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected(true, [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected(false, [])).to.be.an("array").that.is.empty;
                expect(defaultWrapper.vm.getInitialDropdownSelected({}, [])).to.be.an("array").that.is.empty;
            });
        });
    });
});
