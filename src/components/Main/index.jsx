import React, { useEffect } from "react";
import Masters from "../Page/Masters";

export default ({ cartAccordions, handleAddToCart }) => {
  useEffect(() => {
    console.log("Main  kelgan cartAccordions =", cartAccordions);
  }, [cartAccordions]);
  return (
    <div>
      <Masters
        handleAddToCart={handleAddToCart}
        cartAccordions={handleAddToCart}
      />
    </div>
  );
};
