const elementCartItems = document.querySelector('.cart__items');
const elementItems = document.querySelector('.items');
const totalValueOfOrders = document.querySelector('.total-price');
const totalValueOfOrdersVisible = document.querySelector('.total-price-visible');
const buttonEmptyCart = document.querySelector('.empty-cart');
const inputSearch = document.getElementById('search-product');
const buttonOpenAndCloseCart = document.querySelector('.material-icons');
const elementCartTitleHeader = document.querySelector('.container-cartTitle');
const elementCart = document.querySelector('.cart');
const buttonSearch = document.querySelector('.button-search');
const buttonFinalizePurchase = document.querySelector('.finalize-purchase');
const containerHeader = document.querySelector('.container-header');
const cartQuantity = document.querySelector('.cart-quantity');

const callAllItemsInCart = () => document.querySelectorAll('.cart__item');

buttonOpenAndCloseCart.addEventListener('click', () => {
  if (Array.from(buttonOpenAndCloseCart.classList).includes('clicked')) {
    buttonOpenAndCloseCart.classList.remove('clicked');
    elementItems.style = '';
    elementCartTitleHeader.style = '';
    elementCart.style = '';
    containerHeader.style = '';
  } else {
    buttonOpenAndCloseCart.classList.add('clicked');
    // elementItems.style['flex-basis'] = '100%';
    // elementItems.style.width = '100%';
    elementItems.style.transform = 'translateX(30%)';
    elementCartTitleHeader.style.transform = 'translateX(100%)';
    elementCart.style.transform = 'translateX(100%)';
    containerHeader.style.transform = 'translateX(30%)';
  }
});

const updateCartValueAndQuantity = () => {
  const allItemsInCart = callAllItemsInCart();
  cartQuantity.innerText = Array.from(allItemsInCart).length;
  const sumValueCart = Array.from(allItemsInCart).reduce((acc, item) => {
    const getValuePositionInString = item.innerText.indexOf('$');
    const value = Number(item.innerText.substring(getValuePositionInString + 1));
    return acc + value;
  }, 0);
  totalValueOfOrders.innerText = sumValueCart;
  totalValueOfOrdersVisible.innerText = sumValueCart.toLocaleString('pt-br',
    { style: 'currency', currency: 'BRL' });
};

buttonEmptyCart.addEventListener('click', () => {
  elementCartItems.innerHTML = '';
  localStorage.setItem('cartItems', '');
  updateCartValueAndQuantity();
});

function createProductImageElement(imageSource, imageClass) {
  const img = document.createElement('img');
  img.className = imageClass;
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText = '') {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image, price }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image, 'item__image'));
  const button = createCustomElement('button', 'item__add', 'Adicionar ao Carrinho!');
  const iconCartAdd = `<span class="material-icons">
  add_shopping_cart
  </span>`;
  button.innerHTML += iconCartAdd;
  const productPrice = price.toLocaleString('pt-br',
    { style: 'currency', currency: 'BRL' });
  const parcela = price / 12;
  const text = `${productPrice} em 12x de ${parcela.toLocaleString('pt-br',
    { style: 'currency', currency: 'BRL' })}`;
  section.appendChild(createCustomElement('div', 'price-product', text));
  section.appendChild(button);
  return section;
}

function removeItemFromToCart(event) {
  elementCartItems.removeChild(event.target);
  saveCartItems(elementCartItems.innerHTML);
  updateCartValueAndQuantity();
}

function createCartItemElement({ sku, name, salePrice, image }) {
  const li = createCustomElement('li', 'cart__item',
    `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`);
  li.appendChild(createProductImageElement(image, 'image-cart-item'));
  li.addEventListener('click', removeItemFromToCart);
  return li;
}

const addToCart = async (id) => {
  const data = await fetchItem(id);
  const dados = {
    sku: data.id,
    name: data.title,
    salePrice: data.price,
    image: data.thumbnail,
  };
  const elemento = createCartItemElement(dados);
  elementCartItems.appendChild(elemento);
  saveCartItems(elementCartItems.innerHTML);
  updateCartValueAndQuantity();
};

const addEventInButtonsAddToCart = () => {
  document.querySelectorAll('.item__add').forEach((botao) => {
    botao.addEventListener('click', (event) => {
      const elementImg = event.target.previousElementSibling.previousElementSibling;
      elementImg.style.transform = 'scale(1.1)';
      cartQuantity.style.transform = 'scale(1.1)';
      if (event.target.className === 'material-icons') {
        addToCart(event.target.parentNode.parentNode.firstChild.innerText);
      } else {
        addToCart(event.target.parentNode.firstChild.innerText);
      }
      setTimeout(() => {
        elementImg.style = '';
        cartQuantity.style = '';
      }, 400);
    });
  });
};

const addEventInItemsPulledFromLocalstorage = () => {
  const allItemsInCart = callAllItemsInCart();
  allItemsInCart.forEach((item) => {
    item.addEventListener('click', removeItemFromToCart);
  });
};

const loadCart = () => {
  const pullItemsFromLocalStorage = getSavedCartItems();
  elementCartItems.innerHTML = pullItemsFromLocalStorage;
  updateCartValueAndQuantity();
  addEventInItemsPulledFromLocalstorage();
};

const noProductsFound = (texto) => {
  elementItems.innerHTML = '';
  const div = createCustomElement('div', 'container-product-notfound');
  div.appendChild(createCustomElement('p', 'product-notfound',
    `Nenhum Produto corresponde a "${texto}"`));
  elementItems.appendChild(div);
};

const importApiProducts = async (product) => {
  const data = await fetchProducts(product);
  if (data.results.length === 0) {
    noProductsFound(product);
  } else {
    elementItems.innerHTML = '';
    data.results.forEach((item) => {
      const objectProduct = {
        sku: item.id,
        name: item.title,
        image: item.thumbnail,
        price: item.price,
      };
      elementItems.appendChild(createProductItemElement(objectProduct));
    });
    addEventInButtonsAddToCart();
    ScrollReveal().reveal('.item', { interval: 100, reset: false });
  }
};

buttonSearch.addEventListener('click', () => {
  if (inputSearch.value.length > 0) {
    window.scrollTo(0, 0);
    importApiProducts(inputSearch.value);
  }
});

inputSearch.addEventListener('keyup', (event) => {
  if (event.key === 'Enter' && inputSearch.value.length > 0) {
    window.scrollTo(0, 0);
    importApiProducts(inputSearch.value);
  }
});

buttonFinalizePurchase.addEventListener('click', () => {
  const quantity = document.querySelector('.cart-quantity');
  buttonFinalizePurchase.innerText = 'Carrinho Vazio!';
  buttonFinalizePurchase.style.backgroundColor = 'rgb(255, 241, 89)';
  buttonFinalizePurchase.style.borderColor = 'rgb(255, 241, 89)';
  buttonFinalizePurchase.style.color = 'black';
  setTimeout(() => {
    buttonFinalizePurchase.innerHTML = `Finalizar Compra<span class="material-icons">
    shopping_cart_checkout
  </span>`;
    buttonFinalizePurchase.style = '';
  }, 200);
  if (Number(quantity.innerText) > 0) {
    const element = document.querySelector('.container-loading-purchase');
    window.scrollTo(0, 0);
    element.style.display = 'flex';
    document.body.style['overflow-y'] = 'hidden';
  }
});

window.onload = () => { importApiProducts('computador'); loadCart(); };
