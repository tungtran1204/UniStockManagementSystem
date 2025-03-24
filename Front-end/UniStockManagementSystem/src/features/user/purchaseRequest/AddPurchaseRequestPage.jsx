import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { TextField, Button as MuiButton, Divider } from '@mui/material';
import Select from "react-select";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import { getPartnersByType, getPartnersByMaterial } from "@/features/user/partner/partnerService";
import dayjs from "dayjs";
import usePurchaseRequest from "./usePurchaseRequest";
import axios from "axios";
import { createPurchaseRequest } from "./PurchaseRequestService";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

const SUPPLIER_TYPE_ID = 2;

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minWidth: 200,
    borderColor: state.isFocused ? "black" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": { borderColor: "black" },
  }),
  option: (provided) => ({
    ...provided,
    color: "black",
  }),
  clearIndicator: (base) => ({
    ...base,
    cursor: 'pointer',
    padding: '4px',
    ':hover': {
      color: '#ef4444' // red-500
    }
  }),
};

const authHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const AddPurchaseRequestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addRequest, getNextCode, fetchPurchaseRequests } = usePurchaseRequest();
  const nextCode = location.state?.nextCode || "";

  const [requestCode, setRequestCode] = useState(nextCode);
  const [requestDate, setRequestDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [description, setDescription] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [materialErrors, setMaterialErrors] = useState({});
  const [billOfMaterialsError, setBillOfMaterialsError] = useState("");
  const [errors, setErrors] = useState({});
  const [materialSuppliers, setMaterialSuppliers] = useState({}); // Add this state

  const selectRef = useRef(null);

  useEffect(() => {
    const fetchNextCode = async () => {
      setLoading(true);
      try {
        const code = await getNextCode();
        setRequestCode(code);
      } catch (error) {
        console.error("Lỗi khi lấy mã phiếu:", error);
        setErrors({ message: "Không thể lấy mã phiếu. Vui lòng thử lại!" });
      } finally {
        setLoading(false);
      }
    };
    if (!nextCode) fetchNextCode();
  }, [nextCode]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getPartnersByType(SUPPLIER_TYPE_ID);
        if (!response || !response.partners) {
          console.error("API không trả về dữ liệu hợp lệ!");
          setSuppliers([]);
          return;
        }
        const mappedSuppliers = response.partners.map((supplier) => {
          const supplierPartnerType = supplier.partnerTypes.find(
            (pt) => pt.partnerType.typeId === SUPPLIER_TYPE_ID
          );
          return {
            value: supplier.partnerId,
            label: `${supplierPartnerType?.partnerCode || ""} - ${supplier.partnerName}`,
            name: supplier.partnerName,
            code: supplierPartnerType?.partnerCode || "",
            address: supplier.address,
            phone: supplier.phone,
          };
        });
        setSuppliers(mappedSuppliers);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà cung cấp:", error);
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const headers = authHeader();
        if (!headers) throw new Error("No authentication token");

        const response = await axios.get("http://localhost:8080/api/unistock/user/materials", {
          headers,
          withCredentials: true,
        });
        if (response.data && Array.isArray(response.data.content)) {
          const mappedMaterials = response.data.content.map((material) => ({
            ...material,
            unitName: material.unitName,
          }));
          setMaterials(mappedMaterials);
          console.log("Mapped materials:", mappedMaterials); // Debug
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vật tư:", error);
      }
    };
    fetchMaterials();
  }, []);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        materialId: "",
        quantity: 1,
        supplierId: "",
        supplierName: "",
      },
    ]);
    setNextId((id) => id + 1);
  };

  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSupplierChange = (index, selectedOption) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            supplierId: selectedOption?.value || "",
            supplierName: selectedOption?.name || "",
          }
          : item
      )
    );
  };

  const handleSaveRequest = async () => {
    if (loading) return;

    const newErrors = {};
    const newQuantityErrors = {};
    const newMaterialErrors = {};

    if (!items.length) {
      setBillOfMaterialsError("Vui lòng thêm ít nhất một vật tư!");
    } else {
      items.forEach((item, index) => {
        const materialIdNum = Number(item.materialId);
        const quantityNum = Number(item.quantity);

        if (!materialIdNum || materialIdNum <= 0) {
          newMaterialErrors[index] = "Vui lòng chọn vật tư hợp lệ!";
        }
        if (!quantityNum || quantityNum <= 0) {
          newQuantityErrors[index] = "Số lượng phải lớn hơn 0!";
        }
      });
    }

    setErrors(newErrors);
    setQuantityErrors(newQuantityErrors);
    setMaterialErrors(newMaterialErrors);
    if (Object.keys(newErrors).length > 0 || Object.keys(newMaterialErrors).length > 0 || Object.keys(newQuantityErrors).length > 0 || billOfMaterialsError) {
      return;
    }

    setLoading(true);
    try {
      const formattedDate = `${requestDate}T00:00:00Z`;
      const payload = {
        purchaseRequestCode: requestCode,
        createdDate: formattedDate,
        notes: description || "",
        status: "PENDING",
        purchaseRequestDetails: items.map((item) => ({
          materialId: Number(item.materialId),
          quantity: Number(item.quantity),
          partnerId: Number(item.supplierId),
        })),
      };

      console.log("Payload gửi lên backend:", payload);
      await createPurchaseRequest(payload); // Changed this line
      alert("Đã lưu yêu cầu mua vật tư thành công!");
      navigate("/user/purchase-request", { state: { refresh: true } });
      setItems([]);
      setDescription("");
      setRequestDate(dayjs().format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Lỗi khi lưu yêu cầu:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu yêu cầu. Vui lòng thử lại!";
      setErrors({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/purchase-request");
  };

  const getFilteredMaterials = () => {
    if (!tableSearchQuery.trim()) return items;
    const searchLower = tableSearchQuery.toLowerCase().trim();
    return items.filter((item) =>
      item.materialCode?.toLowerCase().includes(searchLower) ||
      item.materialName?.toLowerCase().includes(searchLower)
    );
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredMaterials();
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const validateMaterial = (materialCode, index) => {
    // Kiểm tra trùng lặp trong danh sách đã chọn
    const isDuplicate = items.some(
      (item, idx) => idx !== index && item.materialCode?.toLowerCase() === materialCode?.toLowerCase()
    );

    if (isDuplicate) {
      setMaterialErrors((prev) => ({
        ...prev,
        [index]: "Nguyên vật liệu này đã được thêm vào danh sách!",
      }));
      return false;
    }

    setMaterialErrors((prev) => ({
      ...prev,
      [index]: "",
    }));
    return true;
  };

  // Add this function to fetch suppliers for a specific material
  const fetchSuppliersByMaterial = async (materialId) => {
    try {
      const response = await getPartnersByMaterial(materialId);
      const mappedSuppliers = response.map((supplier) => ({
        value: supplier.partnerId,
        label: `${supplier.partnerCode || ""} - ${supplier.partnerName}`,
        name: supplier.partnerName,
        code: supplier.partnerCode || "",
        address: supplier.address,
        phone: supplier.phone,
      }));
      setMaterialSuppliers((prev) => ({
        ...prev,
        [materialId]: mappedSuppliers,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy nhà cung cấp theo vật tư:", error);
      setMaterialSuppliers((prev) => ({
        ...prev,
        [materialId]: [],
      }));
    }
  };

  // Modify handleSelectMaterial to fetch suppliers
  const handleSelectMaterial = (index, selectedOption) => {
    if (!selectedOption) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
              ...item,
              materialId: "",
              materialCode: "",
              materialName: "",
              unitName: "",
              quantity: 1,
              supplierId: "",
              supplierName: "",
            }
            : item
        )
      );
      return;
    }

    const isValid = validateMaterial(selectedOption.material.materialCode, index);
    if (!isValid) return;

    const materialId = selectedOption.material.materialId;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            materialId: materialId,
            materialCode: selectedOption.material.materialCode,
            materialName: selectedOption.material.materialName,
            unitName: selectedOption.material.unitName,
            quantity: item.quantity || 1,
            supplierId: "",
            supplierName: "",
          }
          : item
      )
    );

    // Fetch suppliers for the selected material
    fetchSuppliersByMaterial(materialId);
  };

  const handleQuantityChange = (index, value) => {
    const quantity = Number(value);
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: quantity } : item))
    );
    if (quantity <= 0) {
      setQuantityErrors((prev) => ({
        ...prev,
        [index]: "Số lượng phải lớn hơn 0",
      }));
    } else {
      setQuantityErrors((prev) => ({
        ...prev,
        [index]: "",
      }));
    }
  };

  const getAvailableMaterials = () => {
    const selectedMaterialIds = items.map((item) => item.materialId);
    return materials.filter((m) => !selectedMaterialIds.includes(m.materialId));
  };

  const hasErrors = () => {
    const hasInvalidRows = items.some(
      (item) => !item.materialId || !item.materialCode || !item.materialName || item.quantity <= 0
    );
    return hasInvalidRows || loading;
  };

  const isFormValid = () => {
    return !loading && items.length > 0 && !Object.keys(errors).length && !billOfMaterialsError;
  };

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={"Yêu cầu mua vật tư " + requestCode}
            addButtonLabel=""
            onAdd={() => { }}
            onImport={() => {/* Xử lý import nếu có */ }}
            onExport={() => {/* Xử lý export file ở đây nếu có */ }}
            showAdd={false}
            showImport={false} // Ẩn nút import nếu không dùng
            showExport={false} // Ẩn xuất file nếu không dùng
          />
          {errors.message && (
            <Typography className="text-xs text-red-500 mb-4">{errors.message}</Typography>
          )}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Mã phiếu
                </Typography>
                <Input
                  label="Mã phiếu"
                  value={requestCode || (loading ? "Đang tải..." : "")}
                  disabled
                  className="text-sm"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Diễn giải
                </Typography>
                <Textarea
                  label="Diễn giải"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Typography variant="small" className="mb-2 font-bold text-gray-900">
                Ngày lập phiếu
              </Typography>
              <Input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  label="Tìm kiếm trong danh sách"
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="w-full"
                  icon={
                    tableSearchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setTableSearchQuery("")}
                      >
                        <FaTimes className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Typography variant="small" color="blue-gray" className="font-normal">
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
              <Typography variant="small" color="blue-gray" className="font-normal">
                dòng mỗi trang
              </Typography>
            </div>

            {billOfMaterialsError && (
              <Typography className="text-xs text-red-500 mb-2 px-2">
                {billOfMaterialsError}
              </Typography>
            )}

            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["STT", "Mã vật tư", "Tên vật tư", "Nhà cung cấp *", "Đơn vị", "Số lượng *", "Thao tác"].map((head) => (
                    <th
                      key={head}
                      className={`px-2 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0 ${head === "STT" ? "w-10" :
                        head === "Mã vật tư" ? "w-56" :  // Changed from w-64 to w-56
                          head === "Tên vật tư" ? "w-48" :
                            head === "Nhà cung cấp *" ? "w-56" :
                              head === "Đơn vị" ? "w-10" :
                                head === "Số lượng *" ? "w-10" :
                                  head === "Thao tác" ? "w-10" : ""
                        }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {getPaginatedData().length > 0 ? (
                  getPaginatedData().map((item, index) => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-2 py-2 text-sm text-gray-700 w-10 border-r">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-2 py-2 text-sm w-56 border-r"> {/* Changed from w-64 to w-56 */}
                        <Select
                          placeholder="Chọn vật tư"
                          isSearchable
                          isClearable
                          options={getAvailableMaterials().map((m) => ({
                            value: m.materialId,
                            label: `${m.materialCode} - ${m.materialName}`,
                            material: m,
                          }))}
                          styles={customStyles}
                          className="w-56" // Changed from w-64 to w-56
                          value={
                            item.materialId
                              ? {
                                value: item.materialId,
                                label: `${item.materialCode} - ${item.materialName}`,
                              }
                              : null
                          }
                          onChange={(selected) => handleSelectMaterial(currentPage * pageSize + index, selected)}
                        />
                        {materialErrors[currentPage * pageSize + index] && (
                          <Typography className="text-xs text-red-500 mt-1">
                            {materialErrors[currentPage * pageSize + index]}
                          </Typography>
                        )}
                      </td>
                      <td className="px-2 py-2 text-sm w-48 border-r">
                        <Input
                          variant="standard"
                          value={item.materialName || ""}
                          disabled
                          className="w-48 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm w-56 border-r">
                        <Select
                          placeholder={item.materialId ? "Chọn nhà cung cấp" : "Chọn vật tư trước"}
                          isSearchable
                          isClearable
                          options={item.materialId ? (materialSuppliers[item.materialId] || []) : []}
                          value={
                            item.supplierId
                              ? (materialSuppliers[item.materialId] || []).find(
                                (s) => s.value === item.supplierId
                              ) || null
                              : null
                          }
                          onChange={(selected) =>
                            handleSupplierChange(currentPage * pageSize + index, selected)
                          }
                          styles={customStyles}
                          className="w-56"
                          isDisabled={!item.materialId}
                          menuPortalTarget={document.body}
                        />
                      </td>
                      <td className="px-2 py-2 text-sm w-10 border-r">
                        <Input
                          variant="standard"
                          value={item.unitName}
                          disabled
                          className="w-10 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm w-10 border-r">
                        <div>
                          <Input
                            type="number"
                            variant="standard"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(currentPage * pageSize + index, e.target.value)
                            }
                            min={1}
                            className={`w-10 text-sm ${quantityErrors[currentPage * pageSize + index] ? "border-red-500" : ""
                              }`}
                          />
                          {quantityErrors[currentPage * pageSize + index] && (
                            <Typography className="text-xs text-red-500 mt-1">
                              {quantityErrors[currentPage * pageSize + index]}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-sm text-center w-10">
                        <Button
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() => {
                            setItems((prev) =>
                              prev.filter((_, i) => i !== currentPage * pageSize + index)
                            );
                            if (getPaginatedData().length === 1 && currentPage > 0) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-2 py-2 text-center text-gray-500">
                      {items.length === 0 ? "Chưa có dòng nào được thêm" : "Không tìm thấy kết quả phù hợp"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {getFilteredMaterials().length > 0 && (
              <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    Trang {currentPage + 1} / {Math.ceil(getFilteredMaterials().length / pageSize)} •{" "}
                    {getFilteredMaterials().length} dòng
                  </Typography>
                </div>
                <ReactPaginate
                  previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                  nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                  breakLabel="..."
                  pageCount={Math.ceil(getFilteredMaterials().length / pageSize)}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageChange}
                  containerClassName="flex items-center gap-1"
                  pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                  pageLinkClassName="flex items-center justify-center w-full h-full"
                  previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                  nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                  breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
                  activeClassName="bg-[#0ab067] text-white border-[#0ab067] hover:bg-[#0ab067]"
                  forcePage={currentPage}
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-4 h-8">
            <MuiButton
              size="small"
              variant="outlined"
              onClick={handleAddRow}
            >
              <div className='flex items-center gap-2'>
                <FaPlus className="h-4 w-4" />
                <span>Thêm dòng</span>
              </div>
            </MuiButton>
            <MuiButton
              size="small"
              variant="outlined"
              color="error"
              onClick={handleRemoveAllRows}
            >
              <div className='flex items-center gap-2'>
                <FaTrash className="h-4 w-4" />
                <span>Xóa hết dòng</span>
              </div>
            </MuiButton>
          </div>

          <div className="flex justify-end gap-2 pb-2">
            <MuiButton
              size="medium"
              color="error"
              variant="outlined"
              onClick={handleCancel}
            >
              Hủy
            </MuiButton>
            <Button
              size="lg"
              color="white"
              variant="text"
              className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
              ripple={true}
              onClick={handleSaveRequest}
              disabled={!isFormValid()}
            >
              Lưu
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddPurchaseRequestPage;