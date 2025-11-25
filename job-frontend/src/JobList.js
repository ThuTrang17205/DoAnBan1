import React from "react";
import { categoryStyles } from "../utils/categoryStyles";

const JobList = ({ jobs }) => {
  if (jobs.length === 0) {
    return <p>Chưa có việc làm</p>;
  }

  return (
    <ul className="space-y-4">
      {jobs.map((job) => {
        const categoryStyle = categoryStyles[job.category] || categoryStyles["Khác"];
        return (
          <li key={job.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold">{job.title} - {job.company}</h3>
            <p className="text-gray-600">{job.location} | {job.salary}</p>
            <p className="text-sm text-gray-500">{job.description}</p>
            {job.category && (
              <p className={`mt-1 ${categoryStyle}`}>
                {job.category}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default JobList;
