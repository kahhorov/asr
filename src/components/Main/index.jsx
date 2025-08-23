import React, { useEffect } from "react";
import Masters from "../Page/Masters";

export default ({ cartAccordions }) => {
  useEffect(() => {
    console.log("Main sahifaga kelgan cartAccordions =", cartAccordions);
  }, [cartAccordions]);
  return (
    <div>
      <Masters />
    </div>
  );
};
