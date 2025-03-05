import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import { FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const IssueNotePage = () => {
  const [issueNotes, setIssueNotes] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchPaginatedIssueNotes(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchPaginatedIssueNotes = async (page, size) => {
    // Fetch issue notes from API
    // Update state with fetched data
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const filteredIssueNotes = issueNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách phiếu xuất
          </Typography>
          <Button
            size="sm"
            color="white"
            variant="text"
            className="flex items-center gap-2"
            onClick={() => setOpenAddModal(true)}
          >
            <FaPlus className="h-4 w-4" /> Thêm Phiếu Xuất
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="px-4 py-2 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal whitespace-nowrap"
              >
                Hiển thị
              </Typography>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal whitespace-nowrap"
              >
                phiếu xuất mỗi trang
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Input
                label="Tìm kiếm phiếu xuất"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["STT", "Tiêu đề", "Mô tả", "Ngày tạo", "Hành động"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredIssueNotes.length > 0 ? (
                filteredIssueNotes.map(
                  ({ id, title, description, createdAt }, index) => {
                    const isLast = index === filteredIssueNotes.length - 1;
                    const className = `py-3 px-5 ${
                      isLast ? "" : "border-b border-blue-gray-50"
                    }`;
                    const stt = currentPage * pageSize + (index + 1);

                    return (
                      <tr key={id}>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {stt}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {title}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {description}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {new Date(createdAt).toLocaleDateString()}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Tooltip content="Chỉnh sửa">
                              <span
                                onClick={() => {
                                  // Handle edit issue note
                                }}
                                className="cursor-pointer text-xs text-blue-500 hover:text-blue-600"
                              >
                                Sửa
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>

        <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Trang {currentPage + 1} / {totalPages} • {totalElements} phiếu xuất
            </Typography>
          </div>
          <ReactPaginate
            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
            breakLabel="..."
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName="flex items-center gap-1"
            pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            pageLinkClassName="flex items-center justify-center w-full h-full"
            previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            forcePage={currentPage}
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      </Card>

      {/* Modal Thêm Phiếu Xuất */}
      {openAddModal && (
        <ModalAddIssueNote
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          fetchIssueNotes={fetchPaginatedIssueNotes}
        />
      )}
    </div>
  );
};

export default IssueNotePage;
