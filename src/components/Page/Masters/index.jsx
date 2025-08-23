import React from "react";

function Masters({ cartAccordions, handleAddToCart }) {
  console.log("Masters sahifaga kelgan cartAccordions =", cartAccordions);
  console.log("handleAddToCart typeof =", typeof handleAddToCart);

  const product = { id: 1, name: "Telefon", price: 1000 };

  return (
    <div>
      <h1>Masters page</h1>
      <button onClick={() => handleAddToCart(product)}>Savatga qo‘shish</button>
    </div>
  );
}

export default Masters;
