import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { FaPlus } from "react-icons/fa";
import { BiExport, BiImport } from "react-icons/bi";

const PageHeader = ({
  title,
  onAdd,
  onImport,
  onExport,
  showImport = true,
  showExport = true,
  addButtonLabel = "Thêm",
}) => {
  return (
    <div className="flex justify-between items-center mb-7 pb-2 border-b border-gray-300">
      <Typography variant="h4" color="black">
        {title}
      </Typography>
      <div className="flex gap-2">
        {showImport && (
          <Button
            size="sm"
            variant="text"
            className="flex items-center gap-2 bg-white border text-[#089456] border-[#089456] hover:bg-[#089456]/10"
            onClick={onImport}
          >
            <BiImport className="h-5 w-5" /> Import Excel
          </Button>
        )}
        {showExport && (
          <Button
            size="sm"
            color="black"
            variant="text"
            className="flex items-center gap-2 bg-white border text-[#089456] border-[#089456] hover:bg-[#089456]/10"
            onClick={onExport}
          >
            <BiExport className="h-5 w-5" /> Export Excel
          </Button>
        )}
        <Button
          size="sm"
          color="white"
          variant="text"
          className="flex items-center gap-2 bg-[#0ab067] hover:bg-[#089456]/90 transition-colors duration-200"
          onClick={onAdd}
        >
          <FaPlus className="h-4 w-4" /> {addButtonLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
