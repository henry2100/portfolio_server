const ServiceSchema = require('../models/serviceModels');

const createService = async (req, res) => {
    try {
        const newService = await ServiceSchema.create(req.body);
        if (newService) {
            return res.status(200).send({ message: "Your new Service has been added successfully" });
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const getService = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceObj = await ServiceSchema.findById(id);
        if(serviceObj) res.status(200).send({
            data: serviceObj,
            message: "Service retrieved successfully"
        })
        return res.status(404).send({ message: `Invalid! No Service with the selected id:, ${id}`});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const getAllServices = async (req, res) => {
    try{
        const allServices = await ServiceSchema.find();
        if(allServices){
            return res.status(200).send({
                data: allServices,
                message: 'Retrieved successfully'
            })
        }else{
            res.status(404).send({message: "There are no services available"});
        }
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}

const updateService = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceToUpdate = await ServiceSchema.findByIdAndUpdate(id);
        if (serviceToUpdate) {
            return res.status(200).send({
                data: serviceToUpdate,
                message: 'Service updated successfully'
            })
        }
        return res.status(404).send({ message: `Invalid! No Service with the selected id:, ${id}`});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceToRemove = await ServiceSchema.findByIdAndDelete(id);
        if (serviceToRemove) {
            return res.status(200).send({
                data: serviceToRemove,
                message: 'Service removed successfully'
            })
        }
        return res.status(404).send({ message: `Invalid! No Service with the selected id:, ${id}`});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

module.exports = {
    createService,
    getService,
    getAllServices,
    updateService,
    deleteService,
}