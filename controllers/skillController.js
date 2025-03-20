const SkillSchema = require('../models/skillModels');

const getAllSkills_ = async (req, res) => {
    try{
        let pageNumber = parseInt(req.query.page);
        let size = parseInt(req.query.size);
        pageNumber = !isNaN(pageNumber) && pageNumber >= 0 ? pageNumber : 0;
        size = !isNaN(size) && size > 0 ? size : 10;
        const sortField = req.query.sort || 'createdAt';
        const sortDirection = req.query.direction === 'desc' ? -1 : 1;
        const totalElements = await SkillSchema.countDocuments();
        const skillObj = await SkillSchema.find()
            .sort({[sortField]: sortDirection})
            .skip(pageNumber * size)
            .limit(size);
        const totalPages = Math.max(Math.ceil(totalElements / size), 1);

        return res.status(200).send({
            data: skillObj,
            totalPages,
            totalElements,
            last: pageNumber >= totalPages - 1,
            size,
            pageNumber,
            sort: {
                empty: !skillObj.length,
                sorted: true,
                unsorted: false
            },
            message: 'Success'
        });
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}

const getAllSkills = async (req, res) => {
    try{
        const skillObj = await SkillSchema.find();
        return res.status(200).send({
            data: skillObj,
            message: 'Skill retrieved successfully'
        })
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}

const getSkill = async (req, res) => {
    const {id} = req.params;
    try{
        const skillObj = await SkillSchema.findById(id);
        return res.status(200).send({
            data: skillObj,
            message: 'Skill retrieved successfully'
        })
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}

const addSkill = async (req, res) => {
    try{
        const newSkill = await SkillSchema.create(req.body);
        if(newSkill){
            return res.status(200).send({message: 'New skill added successfully'});
        }
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}

const updateSkill = async (req, res) => {
    const {id} = req.params;
    try{
        const skillToUpdate = await SkillSchema.findByIdAndUpdate(id);
        if(skillToUpdate){
            return res.status(200).send({
                data: skillToUpdate,
                message: 'Skill updated successfully'
            })
        }
        return res.status(404).send({ message: `Invalid! No Skill with the selected id:, ${id}`});
    }catch(error){
        return res.status(500).send({message: error.message});
    }
}
const deleteSkill = async (req, res) => {
    const { id } = req.params
    try {
        const skillToRemove = await SkillSchema.findByIdAndDelete(id);

        if (skillToRemove) {
            return res.status(200).send({
                message: 'Skill deleted successfully'
            })
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message
        })
    }
}

module.exports = {
    addSkill,
    getAllSkills,
    getSkill,
    updateSkill,
    deleteSkill
}