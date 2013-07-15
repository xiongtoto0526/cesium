/*global define*/
define([
        '../Core/defaultValue',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        './Credit'
    ], function (
        defaultValue,
        destroyObject,
        DeveloperError,
        Credit) {
    "use strict";

    function displayTextCredit(credit, container, delimiter) {
        if (typeof credit.element === 'undefined') {
            var text = credit.getText();
            var link = credit.getLink();
            var span = document.createElement('span');
            if (credit.hasLink()) {
                var a = document.createElement('a');
                a.textContent = text;
                a.href = link;
                a.target = "_blank";
                span.appendChild(a);
            } else {
                span.textContent = text;
            }
            span.className = "cesium-credit-text";
            credit.element = span;
        }
        if (container.hasChildNodes()) {
            var del = document.createElement('span');
            del.textContent = delimiter;
            del.className = "cesium-credit-delimiter";
            container.appendChild(del);
        }
        container.appendChild(credit.element);
    }

    function displayImageCredit(credit, container) {
        if (typeof credit.element === 'undefined') {
            var text = credit.getText();
            var link = credit.getLink();
            var span = document.createElement('span');
            var content = document.createElement('img');
            content.src = credit.getImageUrl();
            content.style["vertical-align"] = "bottom";
            if (typeof text !== 'undefined') {
                content.alt = text;
                content.title = text;
            }

            if (credit.hasLink()) {
                var a = document.createElement('a');
                a.appendChild(content);
                a.href = link;
                a.target = "_blank";
                span.appendChild(a);
            } else {
                span.appendChild(content);
            }
            span.className = "cesium-credit-image";
            credit.element = span;
        }
        container.appendChild(credit.element);
    }

    function contains(credits, credit) {
        var len = credits.length;
        for (var i = 0; i < len; i++) {
            var existingCredit = credits[i];
            if (Credit.equals(existingCredit, credit)) {
                return true;
            }
        }
        return false;
    }

    function hideCredit(credit, isText) {
        var element = credit.element;
        if (typeof element !== 'undefined') {
            var container = element.parentNode;
            if (isText) {
                var delimiter = element.previousSibling;
                if (delimiter === null) {
                    delimiter = element.nextSibling;
                }
                if (delimiter !== null) {
                    container.removeChild(delimiter);
                }
            }
            container.removeChild(element);
        }
    }

    function displayTextCredits(creditDisplay, textCredits){
        var i;
        var index;
        var credit;
        var displayedTextCredits = creditDisplay._displayedCredits.textCredits;
        for(i = 0; i < textCredits.length; i++) {
            credit = textCredits[i];
            index = displayedTextCredits.indexOf(credit);
            if (index === -1) {
                displayTextCredit(credit, creditDisplay._textContainer, creditDisplay._delimiter);
            } else {
                displayedTextCredits.splice(index, 1);
            }
        }
        for (i = 0; i < displayedTextCredits.length; i++) {
            credit = displayedTextCredits[i];
            hideCredit(credit, true);
        }

    }

    function displayImageCredits(creditDisplay, imageCredits){
        var i;
        var index;
        var credit;
        var displayedImageCredits = creditDisplay._displayedCredits.imageCredits;
        for(i = 0; i < imageCredits.length; i++) {
            credit = imageCredits[i];
            index = displayedImageCredits.indexOf(credit);
            if (index === -1) {
                displayImageCredit(credit, creditDisplay._imageContainer);
            } else {
                displayedImageCredits.splice(index, 1);
            }
        }
        for (i = 0; i < displayedImageCredits.length; i++) {
            credit = displayedImageCredits[i];
            hideCredit(credit, false);
        }
    }

    /**
     * The credit display is responsible for displaying credits on screen.
     *
     * @param {HTMLElement} container The HTML element where credits will be displayed
     * @param {String} [delimiter= ' • '] The string to separate text credits
     *
     * @alias CreditDisplay
     * @constructor
     *
     * @example
     * var CreditDisplay = new CreditDisplay(creditContainer);
     */

    var CreditDisplay = function(container, delimiter) {
        if (typeof container === 'undefined') {
            throw new DeveloperError('credit container is required');
        }
        var imageContainer = document.createElement('span');
        imageContainer.className = 'cesium-credit-imageContainer';
        var textContainer = document.createElement('span');
        textContainer.className = 'cesium-credit-textContainer';
        container.appendChild(imageContainer);
        container.appendChild(textContainer);

        this._delimiter = defaultValue(delimiter, ' • ');
        this._container = container;
        this._textContainer = textContainer;
        this._imageContainer = imageContainer;
        this._defaultImageCredits = [];
        this._defaultTextCredits = [];

        this._displayedCredits = {
                imageCredits: [],
                textCredits: []
        };
        this._currentFrameCredits = {
                imageCredits: [],
                textCredits: []
        };
    };

    /**
     * Adds a credit to the list of current credits to be displayed in the in the credit container
     *
     * @memberof CreditDisplay
     *
     * @param {Credit} credit The credit to display
     */
    CreditDisplay.prototype.addCredit = function(credit) {
        if (typeof credit === 'undefined') {
            throw new DeveloperError('credit must be defined');
        }

        if (credit.hasImage()) {
            var imageCredits = this._currentFrameCredits.imageCredits;
            if (!contains(imageCredits, credit) && !contains(this._defaultImageCredits, credit)) {
                imageCredits.push(credit);
            }
        } else {
            var textCredits = this._currentFrameCredits.textCredits;
            if (!contains(textCredits, credit) && !contains(this._defaultTextCredits, credit)) {
                textCredits.push(credit);
            }
        }
    };

    /**
     * Adds credits that will persist until they are removed
     *
     * @memberof CreditDisplay
     *
     * @param {Credit} credit The credit to added to defaults
     */
    CreditDisplay.prototype.addDefaultCredit = function(credit) {
        if (typeof credit === 'undefined') {
            throw new DeveloperError('credit must be defined');
        }

        if (credit.hasImage()) {
            var imageCredits = this._defaultImageCredits;
            if (!contains(imageCredits, credit)) {
                imageCredits.push(credit);
            }
        } else {
            var textCredits = this._defaultTextCredits;
            if (!contains(textCredits, credit)) {
                textCredits.push(credit);
            }
        }
    };

    /**
     * Removes a default credit
     *
     * @memberof CreditDisplay
     *
     * @param {Credit} credit The credit to be removed from defaults
     */
    CreditDisplay.prototype.removeDefaultCredit = function(credit) {
        if (typeof credit === 'undefined') {
            throw new DeveloperError('credit must be defined');
        }

        var index;
        if (credit.hasImage()) {
            index = this._defaultImageCredits.indexOf(credit);
            if (index !== -1) {
                this._defaultImageCredits.splice(index, 1);
            }
        } else {
            index = this._defaultTextCredits.indexOf(credit);
            if (index !== -1) {
                this._defaultTextCredits.splice(index, 1);
            }
        }
    };

    /**
     * Resets the credit display to a beginning of frame state, clearing out current credits.
     *
     * @memberof CreditDisplay
     *
     * @param {Credit} credit The credit to display
     */
    CreditDisplay.prototype.beginFrame = function() {
        this._currentFrameCredits.imageCredits.length = 0;
        this._currentFrameCredits.textCredits.length = 0;
    };

    /**
     * Sets the credit display to the end of frame state, displaying current credits in the credit container
     *
     * @memberof CreditDisplay
     *
     * @param {Credit} credit The credit to display
     */
    CreditDisplay.prototype.endFrame = function() {
        var textCredits = this._defaultTextCredits.concat(this._currentFrameCredits.textCredits);
        var imageCredits = this._defaultImageCredits.concat(this._currentFrameCredits.imageCredits);

        displayTextCredits(this, textCredits);
        displayImageCredits(this, imageCredits);

        this._displayedCredits.textCredits = textCredits;
        this._displayedCredits.imageCredits = imageCredits;
    };


    CreditDisplay.prototype.destroy = function() {
        this._container.innerHTML = '';
        return destroyObject(this);
    };


    CreditDisplay.prototype.isDestroyed = function() {
        return false;
    };

    return CreditDisplay;
});