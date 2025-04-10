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
import { getAllMaterials } from "@/features/user/materials/materialService";


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
    ':hover': { color: '#ef4444' }
  }),
};

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
};

const AddPurchaseRequestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addRequest, getNextCode } = usePurchaseRequest();
  const { fromSaleOrder, saleOrderId, initialItems } = location.state || {};
  const saleOrderCode = location.state?.saleOrderCode || "";

  const [requestCode, setRequestCode] = useState("");
  const [requestDate, setRequestDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [description, setDescription] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState(initialItems || []);
  const [nextId, setNextId] = useState((initialItems?.length || 0) + 1);
  const [loading, setLoading] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [materialErrors, setMaterialErrors] = useState({});
  const [billOfMaterialsError, setBillOfMaterialsError] = useState("");
  const [errors, setErrors] = useState({});
  const [materialSuppliers, setMaterialSuppliers] = useState({});
  const [quantityValidationError, setQuantityValidationError] = useState(""); // Trạng thái lỗi cho kiểm tra quantity

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
    fetchNextCode();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getPartnersByType(SUPPLIER_TYPE_ID);
        const mappedSuppliers = response.partners.map((supplier) => {
          const supplierPartnerType = supplier.partnerTypes.find(
            (pt) => pt.partnerType.typeId === SUPPLIER_TYPE_ID
          );
          return {
            value: supplier.partnerId,
            label: supplier.partnerName,
            name: supplier.partnerName,
            code: supplierPartnerType?.partnerCode || "",
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
        const response = await getAllMaterials(0, 1000);
        if (response && Array.isArray(response.materials)) {
          setMaterials(response.materials);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vật tư:", error);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (initialItems) {
      // Kiểm tra dữ liệu quantity trong initialItems
      const invalidItems = initialItems.filter((item) => {
        const quantity = Number(item.quantity);
        return (
          item.quantity === undefined ||
          item.quantity === null ||
          isNaN(quantity) ||
          quantity <= 0
        );
      });

      if (invalidItems.length > 0) {
        const errorMessage = `Dữ liệu số lượng không hợp lệ cho các vật tư: ${invalidItems
          .map((item) => item.materialName)
          .join(", ")}. Số lượng phải lớn hơn 0.`;
        setQuantityValidationError(errorMessage);
        return;
      }

      setQuantityValidationError(""); // Xóa lỗi nếu dữ liệu hợp lệ

      const suppliersMap = {};
      initialItems.forEach((item) => {
        if (item.suppliers) {
          const updatedSuppliers = item.suppliers.map((supplier) => ({
            ...supplier,
            label: supplier.name,
          }));
          suppliersMap[item.materialId] = updatedSuppliers;
        }
      });
      setMaterialSuppliers(suppliersMap);
      setItems(initialItems); // Cập nhật items sau khi kiểm tra
    }
  }, [initialItems]);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        materialId: "",
        materialCode: "",
        materialName: "",
        unitName: "",
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

  const handleMaterialChange = (index, selectedOption) => {
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
              supplierId: "",
              supplierName: "",
            }
            : item
        )
      );
      setMaterialSuppliers((prev) => {
        const newSuppliers = { ...prev };
        delete newSuppliers[items[index].materialId];
        return newSuppliers;
      });
      return;
    }

    const material = materials.find((m) => m.materialId === selectedOption.value);
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            materialId: material.materialId,
            materialCode: material.materialCode,
            materialName: material.materialName,
            unitName: material.unitName,
            supplierId: "",
            supplierName: "",
          }
          : item
      )
    );

    fetchSuppliersByMaterial(material.materialId, index);
  };

  const fetchSuppliersByMaterial = async (materialId, index) => {
    try {
      const response = await getPartnersByMaterial(materialId);
      const mappedSuppliers = response.map((supplier) => ({
        value: supplier.partnerId,
        label: supplier.partnerName,
        name: supplier.partnerName,
        code: supplier.partnerCode || "",
      }));
      setMaterialSuppliers((prev) => ({
        ...prev,
        [materialId]: mappedSuppliers,
      }));

      if (mappedSuppliers.length === 1) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === index
              ? {
                ...item,
                supplierId: mappedSuppliers[0].value,
                supplierName: mappedSuppliers[0].name,
              }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy nhà cung cấp theo vật tư:", error);
      setMaterialSuppliers((prev) => ({
        ...prev,
        [materialId]: [],
      }));
    }
  };

  const handleQuantityChange = (index, value) => {
    if (fromSaleOrder) return;

    const quantity = Number(value);
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity } : item))
    );
    if (quantity <= 0) {
      setQuantityErrors((prev) => ({ ...prev, [index]: "Số lượng phải lớn hơn 0" }));
    } else {
      setQuantityErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const handleSaveRequest = async () => {
    if (loading) return;

    // Không cho phép lưu nếu có lỗi kiểm tra quantity
    if (quantityValidationError) {
      alert(quantityValidationError);
      return;
    }

    const newErrors = {};
    const newQuantityErrors = {};
    const newMaterialErrors = {};

    if (!items.length) {
      setBillOfMaterialsError("Vui lòng thêm ít nhất một vật tư!");
      return;
    }

    items.forEach((item, index) => {
      const materialIdNum = Number(item.materialId);
      const quantityNum = Number(item.quantity);
      const supplierIdNum = Number(item.supplierId);

      if (!materialIdNum || materialIdNum <= 0) {
        newMaterialErrors[index] = "Vui lòng chọn vật tư hợp lệ!";
      }
      if (!quantityNum || quantityNum <= 0) {
        newQuantityErrors[index] = "Số lượng phải lớn hơn 0!";
      }
      if (!supplierIdNum || supplierIdNum <= 0) {
        newErrors[index] = "Vui lòng chọn nhà cung cấp!";
      }
    });

    setErrors(newErrors);
    setQuantityErrors(newQuantityErrors);
    setMaterialErrors(newMaterialErrors);
    if (
      Object.keys(newErrors).length > 0 ||
      Object.keys(newMaterialErrors).length > 0 ||
      Object.keys(newQuantityErrors).length > 0
    ) {
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
        saleOrderId: saleOrderId ? Number(saleOrderId) : null,
        purchaseRequestDetails: items.map((item) => ({
          materialId: Number(item.materialId),
          quantity: Number(item.quantity),
          partnerId: Number(item.supplierId),
        })),
      };

      await createPurchaseRequest(payload);
      alert("Đã lưu yêu cầu mua vật tư thành công!");
      navigate("/user/purchase-request", { state: { refresh: true } });
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

  const getPaginatedData = () => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const getAvailableMaterials = () => {
    const selectedMaterialIds = items.map((item) => item.materialId).filter(Boolean);
    return materials.filter((m) => !selectedMaterialIds.includes(m.materialId));
  };

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={"Yêu cầu mua vật tư " + requestCode + (fromSaleOrder && saleOrderCode ? `cho đơn hàng ${saleOrderCode}` : "")}
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
          {quantityValidationError && (
            <Typography className="text-xs text-red-500 mb-4">{quantityValidationError}</Typography>
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

          <div className="py-2 flex items-center justify-between gap-2">
            {/* Items per page */}
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

            {/* Search input */}
            <TableSearch
              // value={searchTerm}
              // onChange={setSearchTerm}
              onSearch={() => {
                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                (e) => setTableSearchQuery(e.target.value)
              }}
              placeholder="Tìm kiếm"
            />

            {billOfMaterialsError && (
              <Typography className="text-xs text-red-500 mb-2 px-2">
                {billOfMaterialsError}
              </Typography>
            )}

          </div>
          <div className="border border-gray-200 rounded mb-4">
            {/* <div className="flex items-center gap-4 mb-4">
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
            )} */}

            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["STT", "Mã vật tư", "Tên vật tư", "Nhà cung cấp *", "Đơn vị", "Số lượng *", "Thao tác"].map((head) => (
                    <th
                      key={head}
                      className={`px-2 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0 ${head === "STT" ? "w-10" :
                        head === "Mã vật tư" ? "w-56" :
                          head === "Tên vật tư" ? "w-48" :
                            head === "Nhà cung cấp *" ? "w-56" :
                              head === "Đơn vị" ? "w-10" :
                                head === "Số lượng *" ? "w-10" : ""
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
                      <td className="px-2 py-2 text-sm w-56 border-r">
                        {fromSaleOrder ? (
                          <Input
                            variant="standard"
                            value={item.materialCode}
                            disabled
                            className="w-56 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                          />
                        ) : (
                          <Select
                            placeholder="Chọn vật tư"
                            isSearchable
                            isClearable
                            options={getAvailableMaterials().map((m) => ({
                              value: m.materialId,
                              label: `${m.materialCode} - ${m.materialName}`,
                            }))}
                            styles={customStyles}
                            className="w-56"
                            value={
                              item.materialId
                                ? {
                                  value: item.materialId,
                                  label: `${item.materialCode} - ${item.materialName}`,
                                }
                                : null
                            }
                            onChange={(selected) => handleMaterialChange(currentPage * pageSize + index, selected)}
                          />
                        )}
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
                        {fromSaleOrder && materialSuppliers[item.materialId] ? (
                          materialSuppliers[item.materialId].length === 1 ? (
                            <Input
                              variant="standard"
                              value={item.supplierName}
                              disabled
                              className="w-56 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                            />
                          ) : (
                            <Select
                              placeholder="Chọn nhà cung cấp"
                              isSearchable
                              isClearable
                              options={materialSuppliers[item.materialId]}
                              value={
                                item.supplierId
                                  ? materialSuppliers[item.materialId].find(
                                    (s) => s.value === item.supplierId
                                  ) || null
                                  : null
                              }
                              onChange={(selected) =>
                                handleSupplierChange(currentPage * pageSize + index, selected)
                              }
                              styles={customStyles}
                              className="w-56"
                            />
                          )
                        ) : (
                          <Select
                            placeholder="Chọn nhà cung cấp"
                            isSearchable
                            isClearable
                            options={materialSuppliers[item.materialId] || suppliers}
                            value={
                              item.supplierId
                                ? (materialSuppliers[item.materialId] || suppliers).find(
                                  (s) => s.value === item.supplierId
                                ) || null
                                : null
                            }
                            onChange={(selected) =>
                              handleSupplierChange(currentPage * pageSize + index, selected)
                            }
                            styles={customStyles}
                            className="w-56"
                          />
                        )}
                        {errors[currentPage * pageSize + index] && (
                          <Typography className="text-xs text-red-500 mt-1">
                            {errors[currentPage * pageSize + index]}
                          </Typography>
                        )}
                      </td>
                      <td className="px-2 py-2 text-sm w-10 border-r">
                        <Input
                          variant="standard"
                          value={item.unitName || ""}
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
                            disabled={fromSaleOrder}
                            className={`w-10 text-sm ${quantityErrors[currentPage * pageSize + index] ? "border-red-500" : ""
                              } ${fromSaleOrder ? "disabled:opacity-100 disabled:font-normal disabled:text-black" : ""}`}
                          />
                          {quantityErrors[currentPage * pageSize + index] && (
                            <Typography className="text-xs text-red-500 mt-1">
                              {quantityErrors[currentPage * pageSize + index]}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-sm text-center w-10">
                        {!fromSaleOrder && (
                          <Button
                            color="red"
                            variant="text"
                            size="sm"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== currentPage * pageSize + index))}
                          >
                            Xóa
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-2 py-2 text-center text-gray-500">
                      Chưa có dòng nào được thêm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {items.length > 0 && (
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {Math.ceil(items.length / pageSize)} • {items.length} dòng
                </Typography>
              </div>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                breakLabel="..."
                pageCount={Math.ceil(items.length / pageSize)}
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

          <div className="flex gap-2 mb-4 h-8">
            {!fromSaleOrder && (
              <>
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
              </>
            )}
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
              disabled={loading || items.length === 0 || !!quantityValidationError}
              className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out flex items-center gap-2"
              onClick={handleSaveRequest}
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