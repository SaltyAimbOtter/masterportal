define(function (require) {
    var expect = require("chai").expect,
        CustomTreeParser = require("../../../../modules/core/configLoader/parserCustomTree");

    describe("core/configLoader/parserCustomTree", function () {
        var testData;

        before(function () {
            testData = {
                "Fachdaten": {
                    "Ordner": [
                        {
                            "Titel": "Denkmalschutz",
                            "isFolderSelectable": true
                        },
                        {
                            "Titel": "Hochwasserschutz",
                            "isFolderSelectable": false
                        },
                        {
                            "Titel": "Eisenbahnwesen / Personenbeförderung",
                            "Ordner": [
                                {
                                    "Titel": "Hamburger Verkehrsverbund (HVV)"
                                }
                            ]
                        }
                    ]
                }
            };
        });

        // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
        function getCustomModel (options) {
            var model = new CustomTreeParser(options);
            model.setItemList([]);
            model.parseTree(testData.Fachdaten);
            return model;
        }

        describe("the \"select all\" checkbox", function () {

            it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is true", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: true}).getItemList(), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
            });
            it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is false", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: false}).getItemList(), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
            });
            it("should be hidden if item-isFolderSelectable is false and global-isFolderSelectable is true", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: true}).getItemList(), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
            });
            it("should be false if item-isFolderSelectable is false and global-isFolderSelectable is false", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: false}).getItemList(), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
            });
            it("should be visible if item-isFolderSelectable is undefined and global-isFolderSelectable is true", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: true}).getItemList(), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(true);
            });
            it("should be hidden if item-isFolderSelectable is undefined and global-isFolderSelectable is false", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: false}).getItemList(), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(false);
            });
        });

        describe("the number of items (folders) within the test data", function () {
            it("should be four", function () {
                expect(getCustomModel({isFolderSelectable: true}).getItemList().length).to.be.equal(4);
            });
        });

        describe("the flag \"isLeafFolder\"", function () {
            it("should be set to \"true\", if the folder has no child-folders", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: true}).getItemList(), {"name": "Denkmalschutz"}).isLeafFolder).to.be.equal(true);
            });
            it("should be set to \"false\", if the folder has no child-folders", function () {
                expect(_.findWhere(getCustomModel({isFolderSelectable: true}).getItemList(), {"name": "Eisenbahnwesen / Personenbeförderung"}).isLeafFolder).to.be.equal(false);
            });
        });
    });
});
