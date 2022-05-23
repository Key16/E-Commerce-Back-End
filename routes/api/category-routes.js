const router = require('express').Router();
const req = require('express/lib/request');
const res = require('express/lib/response');
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categoryData = await Category.findAll( {
//includes product model as part of the json file
      include: { model: Product}
     });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
//try catch error to grab the id in the parameters and pass through the correct category
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      // JOIN with locations, using the Trip through table
      include: { model: Product, required:true }
     });

     if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    } 
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id);

     if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    } 
    
   await Category.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    res.status(200).json(
      await Category.findByPk(req.params.id)
    );
  } catch (err) {
    res.status(400).json(err)
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const deleteCategory = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!deleteCategory) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }
//message to return if deleteCategory was true or false
    res.status(200).json(deleteCategory? "Deleted Sucessfully":"No success");;
  } catch (err) {
    res.status(500).json(err)
    
  }
});

module.exports = router;
