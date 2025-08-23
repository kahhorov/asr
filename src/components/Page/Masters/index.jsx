import React, { useEffect } from "react";

function Masters({ cartAccordions, handleAddToCart }) {
  useEffect(() => {
    console.log("Masters sahifaga kelgan cartAccordions =", cartAccordions);
    console.log("handleAddToCart typeof =", typeof handleAddToCart);
  }, [cartAccordions, handleAddToCart]);

  const addTestItem = () => {
    handleAddToCart({
      name: "Test Master",
      status: "active",
    });
  };

  return (
    <div>
      <h1>Masters sahifa</h1>
      <button onClick={addTestItem}>+ Add Test Master</button>

      <ul>
        {cartAccordions &&
          cartAccordions.map((item, i) => (
            <li key={i}>
              {item.name} - {item.status}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Masters;
