import drawLayer from "../utils/drawLayer";

const actions = {
    /**
     * Toggles the LayerSwiper.
     * If the LayerSwiper is deactivated, the second layer is deactivated and removed from the ModelList.
     *
     * @param {String} id Id of the Layer that should be toggled.
     * @fires Core#RadioTriggerUtilRefreshTree
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     * @fires Core.ConfigLoader#RadioTriggerParserRemoveItem
     * @returns {void}
     */
    toggleSwiper ({commit, state, rootGetters}, id) {
        commit("setLayerSwiperActive", !state.layerSwiper.active);

        const secondId = !id.endsWith(state.layerAppendix) ? id + state.layerAppendix : id,
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id: state.layerSwiper.active ? id : secondId});

        if (state.layerSwiper.active) {
            const {name, parentId, level, layers, url, version, time} = layerModel.attributes;

            Radio.trigger("Parser", "addLayer",
                name + "_second", secondId, parentId,
                level, layers, url, version,
                {transparent: false, isSelected: true, time}
            );
            Radio.trigger("ModelList", "addModelsByAttributes", {id: secondId});
        }
        else {
            // If the button of the "original" window is clicked, it is assumed, that the time value selected in the added window is desired to be further displayed.
            if (!id.endsWith(state.layerAppendix)) {
                const {TIME} = layerModel.get("layerSource").params_,
                    {transparency} = layerModel.attributes;

                Radio.trigger("WmsTime", "updateTime", id, TIME);
                Radio.trigger("ModelList", "setModelAttributesById", id, {transparency});
                commit("setTimeSliderDefaultValue", TIME);
            }
            rootGetters["Map/map"].removeLayer(layerModel.get("layer"));
            Radio.trigger("ModelList", "removeModelsById", secondId);
            Radio.trigger("Parser", "removeItem", secondId);
        }
        Radio.trigger("Util", "refreshTree");
    },
    /**
     * Sets the postion of the layerSwiper to state according to the x-coordinate of the mousedown event.
     *
     * @param {MouseEvent.mousemove} event DOM Event.
     * @param {number} event.clientX Current position on the x-axis in px of the mouse.
     * @returns {void}
     */
    moveSwiper ({state, commit, dispatch}, {clientX}) {
        if (state.layerSwiper.isMoving) {
            commit("setLayerSwiperValueX", clientX);
            commit("setLayerSwiperStyleLeft", clientX);
            dispatch("updateMap");
        }
    },
    /**
     * Updates the map so that the layer is displayed clipped again.
     *
     * @returns {void}
     */
    updateMap ({state, rootGetters}) {
        if (!state.timeSlider.playing) {
            rootGetters["Map/map"].render();
        }
        state.layerSwiper.targetLayer.once("prerender", renderEvent => drawLayer(rootGetters["Map/map"].getSize(), renderEvent, state.layerSwiper.valueX));
        state.layerSwiper.targetLayer.once("postrender", ({context}) => {
            context.restore();
        });
    }
};

export default actions;