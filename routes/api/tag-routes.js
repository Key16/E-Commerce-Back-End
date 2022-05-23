const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const TagData = await Tag.findAll( {

      include: { model: Product}
     });
    res.status(200).json(TagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  try {
    const getTagById = await Tag.findByPk(req.params.id, {
      // JOIN with locations, using the Trip through table
      include: { model: Product, required:true }
     });

     if (!getTagById) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    } 
    res.status(200).json(getTagById);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

//updating tag
router.put('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id);

     if (!tagData) {
      res.status(404).json({ message: 'No Tag found with this id!' });
      return;
    } 
    
   await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    res.status(200).json(
      await Tag.findByPk(req.params.id)
    );
  } catch (err) {
    res.status(400).json(err)
  }
});

//deleting tag
router.delete('/:id', async (req, res) => {
  try {
    const deleteTag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!deleteTag) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(deleteTag? "Deleted Sucessfully":"No success");
  } catch (err) {
    res.status(500).json(err)
    
  }
});

module.exports = router;
