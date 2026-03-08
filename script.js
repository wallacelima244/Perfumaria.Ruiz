const WHATS_NUMBER = "5511972480984";
const STORAGE_KEY = "rgp_cart_perfeito_v1";

function getCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
  });
}

function showToast(message = "Produto adicionado ao carrinho") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

function addToCart(name, price, category) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, category, qty: 1 });
  }

  saveCart(cart);
  showToast();
}

function bindProductButtons() {
  document.querySelectorAll(".addToCart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".productCard");
      if (!card) return;

      addToCart(
        card.dataset.name,
        Number(card.dataset.price),
        card.dataset.category
      );
    });
  });
}

function renderCartPage() {
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const clearCartBtn = document.getElementById("clearCart");
  const checkoutForm = document.getElementById("checkoutForm");

  if (!cartList || !cartTotal) return;

  function render() {
    const cart = getCart();
    cartList.innerHTML = "";

    if (!cart.length) {
      cartList.innerHTML = `<div class="cartEmpty">Seu carrinho está vazio. Adicione perfumes para continuar.</div>`;
      cartTotal.textContent = formatBRL(0);
      updateCartCount();
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.qty;

      const div = document.createElement("div");
      div.className = "cartItem";
      div.innerHTML = `
        <div>
          <div class="cartItem__name">${item.name}</div>
          <div class="cartItem__meta">${item.category} • ${formatBRL(item.price)} cada</div>
        </div>
        <div class="cartItem__actions">
          <button class="qtyBtn" data-action="minus" data-index="${index}">-</button>
          <strong>${item.qty}</strong>
          <button class="qtyBtn" data-action="plus" data-index="${index}">+</button>
          <button class="removeBtn" data-action="remove" data-index="${index}">Remover</button>
        </div>
      `;
      cartList.appendChild(div);
    });

    cartTotal.textContent = formatBRL(total);
    updateCartCount();
  }

  cartList.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const cart = getCart();
    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (Number.isNaN(index)) return;

    if (action === "plus") cart[index].qty += 1;

    if (action === "minus") {
      cart[index].qty -= 1;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
    }

    if (action === "remove") {
      cart.splice(index, 1);
    }

    saveCart(cart);
    render();
  });

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      saveCart([]);
      render();
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const cart = getCart();
      if (!cart.length) {
        alert("Adicione pelo menos um perfume ao carrinho.");
        return;
      }

      const nome = document.getElementById("nome").value.trim();
      const telefone = document.getElementById("telefone").value.trim();
      const endereco = document.getElementById("endereco").value.trim();
      const pagamento = document.getElementById("pagamento").value.trim();
      const observacoes = document.getElementById("observacoes").value.trim();

      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

      const itens = cart
        .map((item) => `• ${item.name} (${item.qty}x) - ${formatBRL(item.price * item.qty)}`)
        .join("\n");

      const mensagem =
`Olá! Vim pelo site da Rodrigues Gomes Perfumes e quero finalizar meu pedido.

Pedido:
${itens}

Total: ${formatBRL(total)}

Nome: ${nome}
Telefone: ${telefone}
Endereço: ${endereco}
Forma de pagamento: ${pagamento}${observacoes ? `\nObservações: ${observacoes}` : ""}

Prazo informado no site: até 5 dias após a confirmação da compra.`;

      window.open(
        `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
      );
    });
  }

  render();
}

function bindMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
  });
}

function bindReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

updateCartCount();
bindProductButtons();
renderCartPage();
bindMenu();
bindReveal();