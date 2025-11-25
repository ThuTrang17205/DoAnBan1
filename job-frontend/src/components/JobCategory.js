import React from "react";
import { categoryStyles } from "../utils/categoryStyles";

function JobCategory({ category }) {
  const style = categoryStyles[category] || categoryStyles["Khác"];
  return <span className={style}>{category}</span>;
}

export default JobCategory;
