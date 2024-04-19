/* eslint-disable no-console */
const {PORTALCONFIG_OLD} = require("./constants"),
    {removeAttributesFromTools} = require("./utils");

module.exports = function createMainMenu (data, titleAndLogo, configJS, migratedTools, toRemoveFromTools) {
    console.info("mainMenu");
    const mainMenu = {
        expanded: true,
        sections: [[], []]
    };

    addTitle(data, mainMenu, titleAndLogo);
    addSearchbar(data, mainMenu);
    fillMainSections(data, configJS, mainMenu, migratedTools, toRemoveFromTools);

    return mainMenu;
};

/**
 * Fills the menu sections of main menu with print, openConfig, legend, shareView, contact and language.
 * @param {Object} data parsed config.json content
 * @param {Object} configJS content of the config.js file
 * @param {Object} mainMenu v3 main menu object
 * @param {Array} migratedTools already migrated v2 tools
 * @param {Object} toRemoveFromTools attributes to remove from tools by type
 * @returns {void}
 */
function fillMainSections (data, configJS, mainMenu, migratedTools, toRemoveFromTools) {
    console.info("   tools");
    const menu = data[PORTALCONFIG_OLD].menu,
        tools = menu.tools?.children,
        firstSection = mainMenu.sections[0],
        secondSection = mainMenu.sections[1];
    let contact = null,
        infoConf = null;

    if (tools?.print) {
        console.info("       print");
        const print = {...tools.print};

        print.type = "print";
        removeAttributesFromTools(toRemoveFromTools, print);
        firstSection.push(print);
        migratedTools.push("print");
    }

    Object.entries(menu).forEach(([menuName, menuConfig]) => {
        if (!["tree", "ansichten", "tools"].includes(menuName) && !migratedTools.includes(menuName)) {
            const config = {...menuConfig};

            config.type = menuName;
            removeAttributesFromTools(toRemoveFromTools, config);
            if (menuName === "contact") {
                config.fileUpload = true;
                contact = config;
            }
            if (menuName === "info") {
                infoConf = {};

                infoConf.icon = menuConfig.icon ? menuConfig.icon : "bi-question-circle";
                infoConf.type = "folder";
                infoConf.name = menuConfig.name;
                infoConf.elements = [];

                if (menuConfig.children?.staticlinks) {
                    menuConfig.children.staticlinks.forEach(staticLink => {
                        const linkConfig = {};

                        linkConfig.type = "customMenuElement";
                        linkConfig.icon = staticLink.icon ? staticLink.icon : "bi-link";
                        linkConfig.name = staticLink.name;
                        linkConfig.openURL = staticLink.url;
                        infoConf.elements.push(linkConfig);
                    });
                }

            }
            else if (menuName !== "filter" && menuName !== "contact") {
                console.info("       " + menuName);
                firstSection.push(config);
                migratedTools.push(menuName);
            }
        }
    });

    console.info("       shareView");
    firstSection.push({
        type: "shareView"
    });

    // second section
    if (contact !== null) {
        console.info("       contact");
        secondSection.push(contact);
        migratedTools.push("contact");
    }
    console.info("       news");
    secondSection.push({
        type: "news"
    });
    if (configJS.portalLanguage?.enabled) {
        console.info("       language");
        secondSection.push({
            type: "language"
        });
        migratedTools.push("language");
    }
    if (infoConf !== null) {
        console.info("       info");
        secondSection.push(infoConf);
        migratedTools.push("info");
    }
    console.info("       about");
    console.info("--- HINT: about 'metaUrl' and 'metaId' have to be filled by user.");
    secondSection.push({
        type: "about",
        cswUrl: "https://metaver.de/csw",
        metaUrl: "to be filled",
        metaId: "to be filled"
    });
    console.info("--- HINT: add nested folders to menu containing menu entries by using type 'folder'.");
    console.info("--- HINT: display HTML or excute action or open url by using type 'customMenuElement'.");
}

/**
 * Adds searchbar entries.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @returns {void}
 */
function addSearchbar (data, mainMenu) {
    if (data[PORTALCONFIG_OLD].searchBar) {
        const oldSearchbar = data[PORTALCONFIG_OLD].searchBar,
            newSearchbar = {
                searchInterfaces: []
            };

        Object.entries(oldSearchbar).forEach(([searchName, searchConfig]) => {
            if (typeof searchConfig === "object") {
                let searchType = searchName;

                if (searchConfig.minChars === 3) {
                    delete searchConfig.minchars;
                }
                if (searchName === "tree") {
                    searchType = "topicTree";
                }
                searchConfig.type = searchType;
                console.info("   searchbar entry " + searchType);
                newSearchbar.searchInterfaces.push(searchConfig);
            }
        });
        mainMenu.searchBar = newSearchbar;
    }
    else {
        console.warn("  no 'searchBar' found");
    }
}

/**
 * Adds title to main menu and fills it if content of titwl is available in v2 data.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @param {Object} titleAndLogo from index.html
 * @returns {void}
 */
function addTitle (data, mainMenu, titleAndLogo) {
    let newTitle = {};

    if (data[PORTALCONFIG_OLD].portalTitle) {
        const oldTitle = data[PORTALCONFIG_OLD].portalTitle,
            oldTitleText = oldTitle.title;

        newTitle = oldTitle;
        newTitle.text = oldTitleText || "title.text is missing";
        delete newTitle.title;
    }
    else {
        newTitle.text = titleAndLogo.title;
        newTitle.logo = titleAndLogo.logo;
        newTitle.link = "";
        newTitle.toolTip = "toolTip";
    }
    mainMenu.title = newTitle;
    console.info("   title");
}
