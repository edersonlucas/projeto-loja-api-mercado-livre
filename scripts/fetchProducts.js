const fetchProducts = async (product) => {
  try {
    if (product === '') {
      throw new Error('You must provide an url');
    }
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${product}`;
    const requisition = await fetch(url);
    const data = await requisition.json();
    return data;
  } catch (error) {
    return error;
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    fetchProducts,
  };
}
