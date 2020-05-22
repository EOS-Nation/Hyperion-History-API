const {addApiServer, addIndexer} = require("./definitions/ecosystem_settings.js");

module.exports = {
    apps: [
        addIndexer('eos', '/etc/hyperion'),
        addApiServer('eos', '/etc/hyperion', 1)
    ]
};
