document.documentElement.classList.add("js");

const WHATS_NUMBER = "5511972480984";
const cart = [];

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCart");
const checkoutForm = document.getElementById("checkoutForm");

const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function renderCart() {
  cartList.innerHTML = "";

  if (!cart.length) {
    cartList.innerHTML = `<div class="cartEmpty">Seu carrinho está vazio. Adicione perfumes para continuar.</div>`;
    cartTotal.textContent = formatBRL(0);
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
}

function addToCart(name, price, category) {
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      price,
      category,
      qty: 1
    });
  }

  renderCart();
}

document.querySelectorAll(".addToCart").forEach((button) => {
  button.addEventListener("click", (e) => {
    const card = e.target.closest(".productCard");
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    const category = card.dataset.category;

    addToCart(name, price, category);
  });
});

cartList.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (Number.isNaN(index)) return;

  if (action === "plus") {
    cart[index].qty += 1;
  }

  if (action === "minus") {
    cart[index].qty -= 1;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }

  if (action === "remove") {
    cart.splice(index, 1);
  }

  renderCart();
});

clearCartBtn.addEventListener("click", () => {
  cart.length = 0;
  renderCart();
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

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

  const url = `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
});

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

renderCart();