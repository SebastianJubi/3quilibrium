const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppuserSchema = new Schema({
    domain: { type: String, required: true, unique: true }, // unique user domain
    appuseruid: { type: String, required: true }, // email/mobile/both
    signupdetails: { type: Schema.Types.Mixed },
    nationality: { type: String }, // india/other
    accounttype: { type: String }, // enterprise/standard
    companyname: { type: String },
    companyid: { type: String },
    timestamp: { type: Number },
    tags: { type: Schema.Types.Mixed },
    validity: { type: Schema.Types.Mixed },
});

AppuserSchema.pre("save", (next) => {
    now = Date.now;
    if (!this.created_at) {
        this.created_at = now;
    }
    if (!this.modified_at) {
        this.modified_at = now;
    }
    next();
});

AppuserSchema.post("save", function (doc) {
    console.log("%s has been saved", doc._id);
});

const Appuser = mongoose.model("ivp_Appuser", AppuserSchema);

AppuserSchema.index({ appuseruid: 1 });
AppuserSchema.index({ "validity.order.id": 1 });
AppuserSchema.index({ companyid: 1, domain: 1, timestamp: 1 });

module.exports = Appuser;