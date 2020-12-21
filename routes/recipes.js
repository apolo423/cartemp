// Router for recipes/Recipes
const mongoose = require('mongoose');
const express = require('express');
const Recipes = require('../models/Recipes');
const HttpError = require('../errors/HttpError');
const authmiddleware = require('../middleware/auth');
const router = express.Router();

// @route GET /api/recipes
// @desc Gets/Fetches all recipes
router.get("/", (req, res, next) => {

    Recipes.find()
    .exec()
    .then( result => {
        res.status(200)
        .json({
            "length" : result.length,
            "Recipes" : result
        })
    })
    .catch( err => {
        res.status(500)
        .json({
            "message" : err
        })
    })
})

// @route GET /api/recipes/<id>
// @desc Gets/Fetches the Recipe for a specific id
router.get("/:id", async (req, res, next) => {

    await Recipes.findById(req.params.id)
    .then( result => {
        res.status(200)
        .json(
            result
        )
    })
    .catch( err => {
        const error = "No recipe found for this id.";
        next(new HttpError(error, 404));
    })

})

// @route POST /api/recipes
// @desc Creates a New Recipe
// @access Private (requires Auth)
router.post("/", authmiddleware, (req, res, next) => {

    const {name,description, content, tribe, tags} = req.body;

    const newRecipe = new Recipes({
        name : name,
        description : description,
        content : content,
        tribe : tribe,
        tags : tags.split(",").map( (obj) => (
            obj.trim()
        ))
    })

    newRecipe.save()
    .then( result => {
        res.status(201)
        .json({
            "message" : "New recipe created successfully.",
            "data" : result
        })
    })
    .catch( err => {
        res.status(500)
        .json({
            "error" : err,
            "message" : "An error occurred."
        })
    })


})

// @route UPDATE /api/recipes/<id>
// @desc Updates a Recipe based on the id
// @access Private (requires Auth)
router.patch("/:id", authmiddleware, async (req, res, next) => {

    let data;
    try{
        data = await Recipes.findById(req.params.id)
    }
    catch{
        next(new HttpError("Could not find any recipe for the specified id.", 404))
    }

    for (const property in req.body){
        data[property] = req.body[property];
    }

    data.save()
    .then( result => {
        res.status(200)
        .json({
            "message" : "Recipe updated successfully.",
            "data" : data
        })
    })
    .catch( err => {
        res.status(500)
        .json({
            "error" : err,
            "message" : "An error occurred."
        })
    })
})

// @route DELETE /api/recipes/<id>
// @desc Deletes a Recipe based on the id
// @access Private (requires Auth)
router.delete("/:id", authmiddleware, (req, res, next) => {

    Recipes.findById(req.params.id)
    .then( recipe => {
        recipe.remove()
        .then(
            res.status(200)
            .json({
                "message" : "Deleted successfully."
            })
        )
    }
    )
    .catch( err => {
        res.status(404)
        .json({
            "error" : err,
            "message" : "No recipe found for this id."
        })
    })
})


module.exports = router;
