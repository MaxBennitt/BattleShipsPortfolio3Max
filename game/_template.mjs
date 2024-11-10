const NAME = {
    isDrawn: false,
    next: null,
    transitionTo: null,

    init: function (...args) {
    },

    update: function (dt) {
    },

    draw: function (dr) {
        if (this.isDrawn == false) {
            this.isDrawn = true;

        }
    }
}

export default NAME;