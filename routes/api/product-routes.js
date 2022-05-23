const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const { sequelize } = require('../../models/Product');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products including their category and tag in json
 
  try {

    const productData = await Product.findAll( {
      include: [{ model:Category}, {model:Tag}]

      });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {

  try {
    const getProductById = await Product.findByPk(req.params.id, {

      include: [{ model:Category}, {model:Tag}]
     });

     if (!getProductById) {
      res.status(404).json({ message: 'No Product found with this id!' });
      return;
    } 
    res.status(200).json(getProductById);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
  
      const productTagIdArr = await req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      res.status(200).json(productTagIds);
      return;
    }

    // if no product tags, just respond
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});




// update product
router.put('/:id',  (req, res) => {
  
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({ message: 'No Product found with this id!' });
      return;
    }
//returns a message if deleted succesfully or not
    res.status(200).json(productData? "Deleted Sucessfully":"No success");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
