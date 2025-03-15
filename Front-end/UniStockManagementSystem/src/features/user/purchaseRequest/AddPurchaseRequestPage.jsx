import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Tooltip,
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
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";

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

  const columnsConfig = [
    { field: 'index', headerName: 'STT', flex: 0.5, minWidth: 50, editable: false },
    {
      field: 'materialCode',
      headerName: 'Mã vật tư',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
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
            params.row.materialId
              ? {
                value: params.row.materialId,
                label: `${params.row.materialCode} - ${params.row.materialName}`,
              }
              : null
          }
          onChange={(selected) => {
            handleSelectMaterial(params.row.index - 1, selected.material);
          }}
        />
      ),
    },
    { field: 'materialName', headerName: 'Tên vật tư', flex: 2, minWidth: 400, editable: false },
    { field: 'unitName', headerName: 'Đơn vị', flex: 1, minWidth: 50, editable: false },
    {
      field: 'quantity',
      headerName: 'Số lượng *',
      flex: 1,
      minWidth: 50,
      renderCell: (params) => (
        <Input
          type="number"
          variant="standard"
          value={params.value}
          onChange={(e) => handleQuantityChange(params.row.index - 1, e.target.value)}
          min={1}
          className={`w-16 text-sm ${quantityErrors[params.row.index - 1] ? "border-red-500" : ""}`}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Xoá">
            <button
              onClick={() => {
                handleRemoveRow(params.row.index - 1);
              }}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <FaTrash className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const data = items.map((item, index) => ({
    id: index + 1,
    index: index + 1,
    materialId: item.materialId,
    materialCode: item.materialCode,
    materialName: item.materialName,
    unitName: item.unitName,
    quantity: item.quantity,
  }));


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

          <div className="mt-8">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Danh sách vật tư
            </Typography>

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
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
                  {[5, 10, 20, 50].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <Typography variant="small" color="blue-gray" className="font-normal">
                  bản ghi mỗi trang
                </Typography>
              </div>

              <TableSearch
                value={tableSearchQuery}
                onChange={setTableSearchQuery}
                onSearch={() => { }}
                placeholder="Tìm kiếm trong danh sách"
              />
            </div>

            {billOfMaterialsError && (
              <Typography className="text-xs text-red-500 mb-2 px-4">
                {billOfMaterialsError}
              </Typography>
            )}

            <Table
              data={data}
              columnsConfig={columnsConfig}
              enableSelection={false}
            />

            {getFilteredMaterials().length > 0 && (
              <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
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