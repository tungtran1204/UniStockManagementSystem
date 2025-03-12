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
import Select from "react-select";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import { getPartnersByType } from "@/features/user/partner/partnerService";
import dayjs from "dayjs";
import usePurchaseRequest from "./usePurchaseRequest";
import axios from "axios";
import PageHeader from '@/components/PageHeader';

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
  const [partnerId, setPartnerId] = useState("");
  const [description, setDescription] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [materialErrors, setMaterialErrors] = useState({});
  const [billOfMaterialsError, setBillOfMaterialsError] = useState("");
  const [errors, setErrors] = useState({});

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

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/materials`, {
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

  const handleSupplierChange = (selectedOption) => {
    if (!selectedOption) {
      setPartnerId("");
      setSupplierName("");
      setAddress("");
      setPhoneNumber("");
      return;
    }
    setPartnerId(selectedOption.value);
    setSupplierName(selectedOption.name);
    setAddress(selectedOption.address);
    setPhoneNumber(selectedOption.phone);
  };

  const handleAddRow = () => {
    setItems((prev) => [...prev, { id: nextId, materialId: "", quantity: 1 }]);
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

  const handleSaveRequest = async () => {
    if (loading) return;

    const newErrors = {};
    const newQuantityErrors = {};
    const newMaterialErrors = {};

    if (!partnerId) {
      newErrors.partnerId = "Vui lòng chọn nhà cung cấp!";
    } else if (isNaN(Number(partnerId)) || Number(partnerId) <= 0) {
      newErrors.partnerId = "Nhà cung cấp không hợp lệ!";
    }

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
        partnerId: Number(partnerId),
        createdDate: formattedDate,
        notes: description || "",
        status: "PENDING",
        purchaseRequestDetails: items.map((item) => ({
          materialId: Number(item.materialId),
          quantity: Number(item.quantity),
        })),
      };

      console.log("Payload gửi lên backend:", payload);
      const result = await addRequest(payload);
      await fetchPurchaseRequests();
      alert("Đã lưu yêu cầu mua vật tư thành công!");
      navigate("/user/purchase-request", { state: { refresh: true } });
      setItems([]);
      setPartnerId("");
      setDescription("");
      setRequestDate(dayjs().format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Lỗi khi lưu yêu cầu:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu yêu cầu. Vui lòng thử lại!";
      setErrors({ message: errorMessage });
      if (error.response?.status === 500 && error.response?.data?.includes("purchase_request_id")) {
        setErrors({ message: "Lỗi backend: Cột purchase_request_id không được phép NULL. Vui lòng kiểm tra cấu hình backend!" });
      }
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

  const handleSelectMaterial = (index, material) => {
    const isValid = validateMaterial(material.materialCode, index);
    if (!isValid) return;

    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            materialId: material.materialId,
            materialCode: material.materialCode,
            materialName: material.materialName,
            unitName: material.unitName,
            quantity: item.quantity || 1,
          }
          : item
      )
    );
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
    return !loading && partnerId && items.length > 0 && !Object.keys(errors).length && !billOfMaterialsError;
  };

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Thêm yêu cầu mua vật tư"
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
                  Nhà cung cấp *
                </Typography>
                <Select
                  ref={selectRef}
                  options={suppliers}
                  value={suppliers.find((s) => s.value === partnerId) || null}
                  onChange={handleSupplierChange}
                  isSearchable
                  styles={customStyles}
                  placeholder="Chọn nhà cung cấp"
                  className="w-full"
                  noOptionsMessage={() => "Không tìm thấy nhà cung cấp"}
                  isClearable
                />
                {errors.partnerId && (
                  <Typography className="text-xs text-red-500 mt-1">{errors.partnerId}</Typography>
                )}
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Địa chỉ
                </Typography>
                <Input label="Địa chỉ" value={address} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Người liên hệ
                </Typography>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
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
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Tên nhà cung cấp
                </Typography>
                <Input label="Tên nhà cung cấp" value={supplierName} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Số điện thoại
                </Typography>
                <Input label="Số điện thoại" value={phoneNumber} disabled className="text-sm" />
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
              <Typography className="text-xs text-red-500 mb-2 px-4">
                {billOfMaterialsError}
              </Typography>
            )}

            <table className="w-full text-left min-w-max border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["STT", "Mã vật tư", "Tên vật tư", "Đơn vị", "Số lượng *", "Thao tác"].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0"
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
                      <td className="px-4 py-2 text-sm text-gray-700 border-r">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Select
                          placeholder="Chọn vật tư"
                          isSearchable
                          options={getAvailableMaterials().map((m) => ({
                            value: m.materialId,
                            label: `${m.materialCode} - ${m.materialName}`,
                            material: m,
                          }))}
                          styles={customStyles}
                          className="w-68"
                          value={
                            item.materialId
                              ? {
                                value: item.materialId,
                                label: `${item.materialCode} - ${item.materialName}`,
                              }
                              : null
                          }
                          onChange={(selected) =>
                            handleSelectMaterial(currentPage * pageSize + index, selected.material)
                          }
                        />
                        {materialErrors[currentPage * pageSize + index] && (
                          <Typography className="text-xs text-red-500 mt-1">
                            {materialErrors[currentPage * pageSize + index]}
                          </Typography>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          variant="standard"
                          value={item.materialName || ""}
                          disabled
                          className="w-full text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          variant="standard"
                          value={item.unitName}
                          disabled
                          className="w-16 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <div>
                          <Input
                            type="number"
                            variant="standard"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(currentPage * pageSize + index, e.target.value)
                            }
                            min={1}
                            className={`w-16 text-sm ${quantityErrors[currentPage * pageSize + index] ? "border-red-500" : ""
                              }`}
                          />
                          {quantityErrors[currentPage * pageSize + index] && (
                            <Typography className="text-xs text-red-500 mt-1">
                              {quantityErrors[currentPage * pageSize + index]}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
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
                    <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
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
                  activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  forcePage={currentPage}
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <Button variant="outlined" onClick={handleAddRow} className="flex items-center gap-2">
              <FaPlus /> Thêm dòng
            </Button>
            <Button
              variant="outlined"
              color="red"
              onClick={handleRemoveAllRows}
              className="flex items-center gap-2"
            >
              <FaTrash /> Xóa hết dòng
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="text" color="gray" onClick={handleCancel} className="flex items-center gap-2">
              <FaTimes /> Hủy
            </Button>
            <Button
              variant="gradient"
              color="green"
              onClick={handleSaveRequest}
              disabled={!isFormValid()}
              className="flex items-center gap-2"
            >
              <FaSave /> {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddPurchaseRequestPage;