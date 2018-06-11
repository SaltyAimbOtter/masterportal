define(function (require) {
    var expect = require("chai").expect,
        ListView = require("../../../../../../modules/menu/mobile/listView.js");

    describe("menu/mobile/folder/view", function () {
        var fakeModel,
            FakeListView;

        before(function () {
            FakeListView = ListView.extend({
                initialize: function () {
                    // dummy function
                },
                doRequestTreeType: function () {
                    // dummy function
                },
                doAppendNodeView: function (nodeView) {
                    // this function is a replacement for the function which inserts a rendered list item into DOM and is used
                    // to check if something (-> check content) shall be added to DOM (-> the function was called).
                    if (nodeView.render().$el.find(".checked-all-item").length === 1) {
                        this.setCheckboxWasFound();
                    }
                    this.setAppendWasCalled();
                },
                setCheckboxWasFound: function () {
                    this.checkboxWasFound = true;
                },
                wasCheckboxFound: function () {
                    return this.checkboxWasFound;
                },
                setAppendWasCalled: function () {
                    this.appendWasCalled = true;
                },
                wasAppendCalled: function () {
                    return this.appendWasCalled;
                },
                appendWasCalled: false,
                checkboxWasFound: false
            });

            fakeModel = {
                getIsVisibleInTree: function () {
                    return this.isVisibleInTree;
                },

                setIsVisibleInTree: function (value) {
                    this.isVisibleInTree = value;
                },

                getId: function () {
                    return "getID";
                },

                isFolderSelectable: true,
                isVisibleInTree: true,

                setIsFolderSelectable: function (value) {
                    this.isFolderSelectable = value;
                },

                toJSON: function () {
                    return {
                        "isFolderSelectable": this.isFolderSelectable,
                        "isLeafFolder": true,
                        "isSelected": false,
                        "name": "testFolder",
                        "isExpanded": true
                    };
                },

                getParentId: function () {
                    return "parentID";
                },

                getLevel: function () {
                    return 3;
                },

                getIsExpanded: function () {
                    return true;
                },

                get: function (value) {
                    if (value === "onlyDesktop") {
                        return false;
                    }

                    return "invalid";
                },

                getType: function () {
                    return "folder";
                }
            };
        });

        describe("the \"SelectAll\" checkbox", function () {
            it("should be hidden if the folder-property \"isFolderSelectable\" is false", function () {
                var fakeListView = new FakeListView();

                fakeModel.setIsFolderSelectable(false);
                fakeListView.addViews([fakeModel]);

                expect(fakeListView.wasAppendCalled()).to.be.equal(false);
            });
            it("should be visible if the folder-property \"isFolderSelectable\" is true", function () {
                var fakeListView = new FakeListView();

                fakeModel.setIsFolderSelectable(true);
                fakeListView.addViews([fakeModel]);

                expect(fakeListView.wasCheckboxFound()).to.be.equal(true);
                expect(fakeListView.wasAppendCalled()).to.be.equal(true);
            });
        });
    });
});
