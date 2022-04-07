const Appuser = require("../models/user.models");

module.exports = {
    addAppuser: (appuser) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in appuser) {
                    delete appuser._id;
                }
                appuser.save((err, msg) => {
                    if (err) {
                        console.log(err);
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
                Appuser.find({ "tags.role": "user" }, null, {})
                    .sort({ _id: -1 })
                    .lean()
                    .exec((err, users) => {
                        // console.log(users)
                        if (err) {
                            console.log(err);
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
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
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
                Appuser.findOneAndUpdate({ username: model.username }, model, { new: true })
                    .lean()
                    .exec((err, data) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        // console.log(data);
                        if (!data || (data && data.length <= 0)) {
                            return resolve(null);
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
    },
    deleteAppuserByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("Delete", options);
                Appuser.deleteOne(options)
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