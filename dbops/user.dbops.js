const Appuser = require("../models/appuser.models");

module.exports = {
    addAppuser: (appuser) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in appuser) {
                    delete appuser._id;
                }
                appuser.save((err, msg) => {
                    console.log(err);
                    if (err) {
                        return reject(err);
                    }
                    return resolve(msg);
                });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    getAllAppusers: () => {
        return new Promise((resolve, reject) => {
            try {
                Appuser.find({}, null, {})
                    .lean()
                    .exec((err, users) => {
                        // console.log(users)
                        if (err) {
                            return reject(err);
                        }
                        return resolve(users);
                    });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    getAppuserByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("find" + options);
                Appuser.find(options)
                    .lean()
                    .exec((err, data) => {
                        console.log("resolve before" + err);
                        // console.log(data)
                        if (!data || (data && data.length <= 0)) {
                            return resolve(null);
                        }
                        console.log("resolve data");
                        return resolve(data[0]);
                    });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    updateAppuser: (model) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in model) {
                    delete model._id;
                }
                console.log("to be updated model =>", model);
                if ("_id" in model) {
                    delete model._id;
                }
                Appuser.findOneAndUpdate({ domain: model.domain }, model, { new: true })
                    .lean()
                    .exec((err, data) => {
                        console.log("resolve before findOneAndUpdate" + err);
                        // console.log(data);
                        if (!data || (data && data.length <= 0)) {
                            return resolve(err);
                        }
                        console.log("resolve updated data", data);
                        return resolve(data);
                    });
            } catch (err) {
                console.log(err);
                return reject(err);
            }
        });
    },
    deleteAppusers: (companyid) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("Delete " + companyid);
                Appuser.deleteMany({ companyid: companyid })
                    .then(() => {
                        console.log("Data deleted");
                        return resolve("success");
                    })
                    .catch(function (error) {
                        console.log(error);
                        return reject(error);
                    });
            } catch (err) {
                console.log(err);
                return reject(err);
            }
        })
    }
};