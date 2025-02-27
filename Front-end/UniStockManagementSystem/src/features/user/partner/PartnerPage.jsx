import React, { useEffect, useState } from "react";
import usePartner from "./usePartner";
import CreatePartnerPopup from "./CreatePartnerPopUp";
import {
    fetchPartnerTypes
} from "./partnerService";

import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Tooltip,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import { FaEdit, FaTrashAlt, FaFileExcel, FaPlus } from "react-icons/fa";

const PartnerPage = () => {
    const { partners, fetchPartners } = usePartner();
    const navigate = useNavigate();
    const [showImportPopup, setShowImportPopup] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [partnerTypes, setPartnerTypes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesData] = await Promise.all([
                    fetchPartnerTypes()
                ]);
                console.log("Partner Type Data:", typesData); // Log dữ liệu nhóm đối tác
                setPartnerTypes(typesData);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách nhóm đối tác:", error);
            }
        };

        fetchData();
    }, []);

    // const handleImport = async () => {
    //     if (!file) {
    //         alert("Vui lòng chọn file Excel!");
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         await importExcel(file);
    //         alert("Import thành công!");
    //         fetchProducts();
    //         setShowImportPopup(false);
    //         setFile(null);
    //     } catch (error) {
    //         console.error("Lỗi khi import file:", error);
    //         alert("Lỗi import file! Kiểm tra lại dữ liệu.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white">
                            Danh sách đối tác
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => setShowCreatePopup(true)}
                            >
                                <FaPlus className="h-4 w-4" /> Thêm đối tác
                            </Button>
                            {showCreatePopup && (
                                <CreatePartnerPopup
                                    onClose={() => setShowCreatePopup(false)}
                                    onSuccess={fetchPartners} // Có thể gọi API fetch lại danh sách nếu cần
                                />
                            )}
                            {/* <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => setShowImportPopup(true)}
                            >
                                <FaFileExcel className="h-4 w-4" /> Import Excel
                            </Button>
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={exportExcel}
                            >
                                <FaFileExcel className="h-4 w-4" /> Export Excel
                            </Button> */}
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {[
                                    "Mã đối tác",
                                    "Tên đối tác",
                                    "Nhóm đối tác",
                                    "Địa chỉ",
                                    "Email",
                                    "Số điện thoại",
                                    "Hành động",
                                ].map((el) => (
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
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {partners.length > 0 ? (
                                partners.map((partner, index) => {
                                    const className = `py-3 px-5 ${index === partners.length - 1
                                        ? ""
                                        : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={partner.partnerId}>
                                            <td className={className}>
                                                {partner.partnerTypes && partner.partnerTypes.length > 0 ? (
                                                    <div>
                                                        {partner.partnerTypes.map((type) => (
                                                            <Typography key={type.partnerCode} className="text-xs font-semibold text-blue-gray-600 block">
                                                                {type.partnerCode}
                                                            </Typography>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Typography className="text-xs text-gray-500">Không có mã</Typography>
                                                )}
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {partner.partnerName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                {partner.partnerTypes && partner.partnerTypes.length > 0 ? (
                                                    <div>
                                                        {partner.partnerTypes.map((type) => (
                                                            <Typography key={type.partnerType.typeId} className="text-xs font-semibold text-blue-gray-600 block">
                                                                {type.partnerType.typeName}
                                                            </Typography>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Typography className="text-xs text-gray-500">Không có nhóm</Typography>
                                                )}
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.address}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.email}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.phone}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2 pl-4">
                                                    <Tooltip content="Chỉnh sửa">
                                                        <button
                                                            // onClick={() =>
                                                            //     navigate(`/products/edit/${product.productId}`)
                                                            // }
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                            style={{ paddingLeft: "10px" }}
                                                        >
                                                            <FaEdit className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* Popup import Excel */}
            {/* {showImportPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Import Excel</Typography>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowImportPopup(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mb-4">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                color="gray"
                                onClick={() => setShowImportPopup(false)}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                color="blue"
                                onClick={handleImport}
                                disabled={loading}
                            >
                                {loading ? "Đang xử lý..." : "Import"}
                            </Button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default PartnerPage;